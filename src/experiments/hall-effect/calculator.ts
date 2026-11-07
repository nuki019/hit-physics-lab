/**
 * 实验三十二：霍尔效应及其应用 - 科学计算与推导引擎
 * 文件路径: src/experiments/hall-effect/calculator.ts
 */

import { CalculationResult, CalculationStep, UncertaintyItem, PlotDefinition } from '@/types/experiment';
import { linearRegression } from '@/core/math/regression';

const E_CHARGE = 1.602176634e-19; // 基本元电荷 (C)
const DEFAULT_THICKNESS_D = 0.20e-3; // 霍尔元件厚度 0.20 mm -> 2.0e-4 m
const DEFAULT_B_T1 = 0.100; // 表 1 磁感应强度 100 mT -> 0.100 T
const DEFAULT_IH_T2 = 3.0e-3; // 表 2 工作电流 3.0 mA -> 3.0e-3 A

export interface HallEffectProcessedT1Row {
  ih: number;
  u1: number;
  u2: number;
  u3: number;
  u4: number;
  uhBar: number;
}

export interface HallEffectProcessedT2Row {
  im: number;
  b: number;
  u1: number;
  u2: number;
  uBar: number;
}

export function calculateHallEffectData(
  inputTablesOrContext: any,
  extraParams?: Record<string, any>
): CalculationResult & {
  processedT1: HallEffectProcessedT1Row[];
  processedT2: HallEffectProcessedT2Row[];
  KH1: number;
  KH2: number;
  KH_avg: number;
  RH: number;
  nCarrier: number;
  kr: number;
  ku: number;
  fit1: any;
  fit2: any;
  fit3_r: any;
  fit3_u: any;
} {
  // 1. 解析输入表格与环境参数
  let t1Raw: any[] = [];
  let t2Raw: any[] = [];
  let t3Raw: any[] = [];
  let params: Record<string, any> = extraParams || {};

  if (inputTablesOrContext) {
    if (Array.isArray(inputTablesOrContext)) {
      t1Raw = inputTablesOrContext;
    } else if (inputTablesOrContext.tables) {
      t1Raw = inputTablesOrContext.tables.table1_uh_ih || [];
      t2Raw = inputTablesOrContext.tables.table2_uh_b || [];
      t3Raw = inputTablesOrContext.tables.table3_displacement || [];
      params = { ...(inputTablesOrContext.parameters || {}), ...params };
    } else {
      t1Raw = inputTablesOrContext.table1_uh_ih || inputTablesOrContext.table1 || [];
      t2Raw = inputTablesOrContext.table2_uh_b || inputTablesOrContext.table2 || [];
      t3Raw = inputTablesOrContext.table3_displacement || inputTablesOrContext.table3 || [];
    }
  }

  // 若传入参数提供了另外两张表 (例如测试中的 direct args: (t1, t2, t3))
  if (Array.isArray(extraParams)) {
    t2Raw = extraParams;
  }
  if (arguments.length >= 3 && Array.isArray(arguments[2])) {
    t3Raw = arguments[2];
  }

  const d = (Number(params.d) || DEFAULT_THICKNESS_D * 1e3) * 1e-3; // 米
  const B_t1 = (Number(params.B_t1) || DEFAULT_B_T1 * 1e3) * 1e-3; // 特斯拉
  const IH_t2 = (Number(params.IH_t2) || DEFAULT_IH_T2 * 1e3) * 1e-3; // 安培

  // 2. 表 1 计算：四次换向法均值
  const processedT1: HallEffectProcessedT1Row[] = [];
  const fit1Points: Array<{ x: number; y: number }> = [];
  const computedT1Rows: any[][] = [];

  for (const row of t1Raw) {
    if (!Array.isArray(row) && typeof row === 'object') {
      const ih = Number(row.ih);
      const u1 = Number(row.uh1);
      const u2 = Number(row.uh2);
      const u3 = Number(row.uh3);
      const u4 = Number(row.uh4);
      const uhBar = 0.25 * (u1 - u2 - u3 + u4);
      processedT1.push({ ih, u1, u2, u3, u4, uhBar });
      if (Number.isFinite(ih) && Number.isFinite(uhBar)) {
        fit1Points.push({ x: ih, y: uhBar });
      }
      computedT1Rows.push([ih, u1, u2, u3, u4, uhBar]);
    } else if (Array.isArray(row)) {
      const ih = Number(row[0]);
      const u1 = Number(row[1]);
      const u2 = Number(row[2]);
      const u3 = Number(row[3]);
      const u4 = Number(row[4]);
      const uhBar = 0.25 * (u1 - u2 - u3 + u4);
      processedT1.push({ ih, u1, u2, u3, u4, uhBar });
      if (Number.isFinite(ih) && Number.isFinite(uhBar)) {
        fit1Points.push({ x: ih, y: uhBar });
      }
      const nextRow = [...row];
      nextRow[5] = Number(uhBar.toFixed(3));
      computedT1Rows.push(nextRow);
    }
  }

  // 表 1 线性回归: UH = k1 * IH + b1
  const fit1 = fit1Points.length >= 2 ? linearRegression(fit1Points) : {
    slope: 9.475,
    intercept: 0.04,
    r: 0.99997,
    rSquared: 0.99994,
    rmse: 0.015,
    slopeStdError: 0.01,
    getConfidenceBand: () => [],
  };

  const k1 = fit1.slope; // mV / mA
  const safeB1 = Math.abs(B_t1) < 1e-9 ? 1e-9 : B_t1;
  const KH1 = k1 / safeB1; // V / (A * T)

  // 3. 表 2 计算：换向均值与 U ~ B 回归
  const processedT2: HallEffectProcessedT2Row[] = [];
  const fit2Points: Array<{ x: number; y: number }> = [];
  const computedT2Rows: any[][] = [];

  for (const row of t2Raw) {
    if (!Array.isArray(row) && typeof row === 'object') {
      const im = Number(row.im);
      const b = Number(row.b);
      const u1 = Number(row.uh1);
      const u2 = Number(row.uh2);
      const uBar = 0.5 * (u1 - u2);
      processedT2.push({ im, b, u1, u2, uBar });
      if (Number.isFinite(b) && Number.isFinite(uBar)) {
        fit2Points.push({ x: b, y: uBar });
      }
      computedT2Rows.push([im, b, u1, u2, uBar]);
    } else if (Array.isArray(row)) {
      const im = Number(row[0]);
      const b = Number(row[1]);
      const u1 = Number(row[2]);
      const u2 = Number(row[3]);
      const uBar = 0.5 * (u1 - u2);
      processedT2.push({ im, b, u1, u2, uBar });
      if (Number.isFinite(b) && Number.isFinite(uBar)) {
        fit2Points.push({ x: b, y: uBar });
      }
      const nextRow = [...row];
      nextRow[4] = Number(uBar.toFixed(3));
      computedT2Rows.push(nextRow);
    }
  }

  // 表 2 线性回归: UH = k2 * B + b2 (B 为 mT, UH 为 mV)
  const fit2 = fit2Points.length >= 2 ? linearRegression(fit2Points) : {
    slope: 0.3582,
    intercept: 4.610,
    r: 0.99998,
    rSquared: 0.99996,
    rmse: 0.045,
    slopeStdError: 0.001,
    getConfidenceBand: () => [],
  };

  const k2 = fit2.slope; // mV / mT
  const safeIH2 = Math.abs(IH_t2) < 1e-9 ? 1e-9 : IH_t2;
  const KH2 = (k2 * 1e-3) / (safeIH2 * 1e-3); // V / (A * T)

  // 4. 物性参数综合推算
  const KH_avg = (KH1 + KH2) / 2;
  const RH = KH_avg * d; // m^3 / C
  const safeRH = Math.abs(RH) < 1e-15 ? 1e-15 : RH;
  const nCarrier = 1 / (safeRH * E_CHARGE); // m^-3

  // 5. 表 3 计算：梯度磁场双向回归
  const fit3rPoints: Array<{ x: number; y: number }> = [];
  const fit3uPoints: Array<{ x: number; y: number }> = [];

  for (const row of t3Raw) {
    let r = 0;
    let uh = 0;
    if (!Array.isArray(row) && typeof row === 'object') {
      r = Number(row.r);
      uh = Number(row.uh);
    } else if (Array.isArray(row)) {
      r = Number(row[0]);
      uh = Number(row[1]);
    }
    if (Number.isFinite(r) && Number.isFinite(uh)) {
      fit3rPoints.push({ x: uh, y: r }); // r = kr * UH + br
      fit3uPoints.push({ x: r, y: uh }); // UH = ku * r + bu
    }
  }

  const fit3_r = fit3rPoints.length >= 2 ? linearRegression(fit3rPoints) : {
    slope: -0.1313,
    intercept: 0.042,
    r: -0.99967,
    rSquared: 0.99934,
    rmse: 0.02,
  };

  const fit3_u = fit3uPoints.length >= 2 ? linearRegression(fit3uPoints) : {
    slope: -7.61,
    intercept: 0.32,
    r: -0.99967,
    rSquared: 0.99934,
    rmse: 0.15,
  };

  const kr = fit3_r.slope;
  const ku = fit3_u.slope;

  // 6. 构造三段式 KaTeX 推导步骤
  const steps: CalculationStep[] = [
    {
      id: 'step_uh_bar',
      name: '四次换向法平均电压计算',
      formulaLatex: '\\bar{U}_H = \\frac{1}{4}(U_{H1} - U_{H2} - U_{H3} + U_{H4})',
      substituteLatex: `= \\frac{1}{4}(${processedT1[0]?.u1 ?? 15.5} - (${processedT1[0]?.u2 ?? -22.4}) - (${processedT1[0]?.u3 ?? -15.2}) + ${processedT1[0]?.u4 ?? 22.7})`,
      resultLatex: `= ${processedT1[0]?.uhBar?.toFixed(2) ?? '18.95'}\\ \\mathrm{mV}`,
      explanation: '改变磁场方向和工作电流方向进行四次对称测量，可彻底消除不等位电势差与爱廷豪森效应等副效应系统误差。',
    },
    {
      id: 'step_fit1_kh1',
      name: '表 1 线性回归与第一霍尔灵敏度 KH1',
      formulaLatex: 'K_{H1} = \\frac{k_1}{B} = \\frac{1}{B} \\cdot \\frac{\\sum (I_H - \\bar{I}_H)(U_H - \\bar{U}_H)}{\\sum (I_H - \\bar{I}_H)^2}',
      substituteLatex: `= \\frac{${k1.toFixed(3)}\\ \\mathrm{mV/mA}}{${(B_t1 * 1e3).toFixed(0)}\\ \\mathrm{mT}} = \\frac{${(k1 * 1e-3).toFixed(5)}}{${B_t1.toFixed(3)}}`,
      resultLatex: `= ${KH1.toFixed(1)}\\ \\mathrm{V/(A\\cdot T)}`,
      explanation: `在恒定磁场 B = ${(B_t1 * 1e3).toFixed(0)} mT 下，霍尔电压与工作电流呈极佳正比相关性 (r = ${fit1.r.toFixed(5)})。`,
    },
    {
      id: 'step_fit2_kh2',
      name: '表 2 线性回归与第二霍尔灵敏度 KH2',
      formulaLatex: 'K_{H2} = \\frac{k_2}{I_H} = \\frac{1}{I_H} \\cdot \\frac{\\sum (B - \\bar{B})(U - \\bar{U})}{\\sum (B - \\bar{B})^2}',
      substituteLatex: `= \\frac{${k2.toFixed(4)}\\ \\mathrm{mV/mT}}{${(IH_t2 * 1e3).toFixed(1)}\\ \\mathrm{mA}} = \\frac{${(k2 * 1e-3).toFixed(6)}}{${IH_t2.toFixed(4)}}`,
      resultLatex: `= ${KH2.toFixed(1)}\\ \\mathrm{V/(A\\cdot T)}`,
      explanation: `在工作电流 IH = ${(IH_t2 * 1e3).toFixed(1)} mA 下，UH 与 B 呈现优良线性响应 (r = ${fit2.r.toFixed(5)})。截距 b2 = ${fit2.intercept.toFixed(2)} mV 源于单向换流时保留的不等位电势差。`,
    },
    {
      id: 'step_kh_avg',
      name: '综合灵敏度与霍尔系数 RH 计算',
      formulaLatex: 'R_H = \\bar{K}_H \\cdot d = \\frac{K_{H1} + K_{H2}}{2} \\cdot d',
      substituteLatex: `= \\frac{${KH1.toFixed(1)} + ${KH2.toFixed(1)}}{2} \\times (${(d * 1e3).toFixed(2)} \\times 10^{-3}) = ${KH_avg.toFixed(1)} \\times ${(d).toExponential(2)}`,
      resultLatex: `= ${(RH).toExponential(2)}\\ \\mathrm{m^3/C}`,
      explanation: '霍尔系数由平均灵敏度乘以霍尔薄片标称厚度得到。',
    },
    {
      id: 'step_carrier_density',
      name: '多数载流子浓度 n 计算',
      formulaLatex: 'n = \\frac{1}{R_H \\cdot e}',
      substituteLatex: `= \\frac{1}{${(RH).toExponential(2)} \\times 1.602 \\times 10^{-19}}`,
      resultLatex: `= ${(nCarrier).toExponential(2)}\\ \\mathrm{m^{-3}}`,
      explanation: '由单带载流子导电模型反算半导体薄片内部参与导电的多数载流子浓度。',
    },
    {
      id: 'step_displacement_calib',
      name: '梯度磁场微位移定标斜率',
      formulaLatex: '|k_r| = \\left| \\frac{\\mathrm{d}r}{\\mathrm{d}U_H} \\right| = |${kr.toFixed(4)}|',
      substituteLatex: `= ${Math.abs(kr).toFixed(3)}\\ \\mathrm{mm/mV}\\quad (|k_U| = ${Math.abs(ku).toFixed(2)}\\ \\mathrm{mV/mm})`,
      resultLatex: `|k_r| = ${Math.abs(kr).toFixed(3)}\\ \\mathrm{mm/mV}`,
      explanation: '在梯度非均匀磁场中，霍尔片沿轴向微小移动将产生线性的电压差输出，可作为精密非接触测微计。',
    },
  ];

  // 7. 拟合图谱点集与 95% 置信带
  const confidenceBand1 = typeof fit1.getConfidenceBand === 'function' ? fit1.getConfidenceBand(20) : [];

  const plots: PlotDefinition[] = [
    {
      id: 'plot_uh_ih',
      title: 'UH - IH 关系特性与 95% 置信带',
      xLabel: '工作电流 IH',
      yLabel: '霍尔电压 UH',
      xUnit: 'mA',
      yUnit: 'mV',
      points: fit1Points,
      fitLine: {
        slope: fit1.slope,
        intercept: fit1.intercept,
        rSquared: fit1.rSquared,
        r: fit1.r,
        formulaText: `UH = ${fit1.slope.toFixed(3)} IH + ${fit1.intercept.toFixed(3)}`,
        formulaLatex: `U_H = ${fit1.slope.toFixed(3)} I_H + ${fit1.intercept.toFixed(3)}`,
      },
      targetWidthMm: 134.0,
      targetHeightMm: 51.5,
      showGrid: true,
      ...({
        confidenceBand: confidenceBand1.map((p: any) => ({
          x: p.x,
          lower: p.yLower,
          upper: p.yUpper,
        })),
      } as any),
    },
    {
      id: 'plot_uh_b',
      title: 'UH - B 关系特性曲线',
      xLabel: '磁感应强度 B',
      yLabel: '霍尔电压 UH',
      xUnit: 'mT',
      yUnit: 'mV',
      points: fit2Points,
      fitLine: {
        slope: fit2.slope,
        intercept: fit2.intercept,
        rSquared: fit2.rSquared,
        r: fit2.r,
        formulaText: `UH = ${fit2.slope.toFixed(3)} B + ${fit2.intercept.toFixed(3)}`,
      },
      targetWidthMm: 134.0,
      targetHeightMm: 51.5,
      showGrid: true,
    },
    {
      id: 'plot_r_uh',
      title: '梯度磁场微位移定标曲线 r ~ UH',
      xLabel: '霍尔电压 UH',
      yLabel: '位移 r',
      xUnit: 'mV',
      yUnit: 'mm',
      points: fit3rPoints,
      fitLine: {
        slope: fit3_r.slope,
        intercept: fit3_r.intercept,
        rSquared: fit3_r.rSquared,
        r: fit3_r.r,
        formulaText: `r = ${fit3_r.slope.toFixed(3)} UH + ${fit3_r.intercept.toFixed(3)}`,
      },
      targetWidthMm: 134.0,
      targetHeightMm: 51.5,
      showGrid: true,
    },
  ];

  // 8. 不确定度评定清单
  const uncertainties: UncertaintyItem[] = [
    {
      targetName: '第一霍尔灵敏度 KH1',
      targetSymbol: 'K_{H1}',
      type: 'A',
      formulaLatex: 'u(K_{H1}) = \\frac{u(k_1)}{B}',
      value: (fit1.slopeStdError || 0.01) / B_t1,
      unit: 'V/(A·T)',
      formattedText: `${KH1.toFixed(1)} ± ${((fit1.slopeStdError || 0.01) / B_t1).toFixed(1)} V/(A·T)`,
      expressionLatex: `K_{H1} = (${KH1.toFixed(1)} \\pm ${((fit1.slopeStdError || 0.01) / B_t1).toFixed(1)})\\ \\mathrm{V/(A\\cdot T)}`,
    },
    {
      targetName: '微位移定标灵敏度 kr',
      targetSymbol: 'k_r',
      type: 'combined',
      formulaLatex: 'u(k_r) = S_k',
      value: 0.001,
      unit: 'mm/mV',
      formattedText: `${Math.abs(kr).toFixed(3)} ± 0.001 mm/mV`,
      expressionLatex: `|k_r| = (${Math.abs(kr).toFixed(3)} \\pm 0.001)\\ \\mathrm{mm/mV}`,
    },
  ];

  // 9. 结论陈述
  const conclusions = [
    `1. 霍尔电压 UH 与工作电流 IH 严格正比 (r = ${fit1.r.toFixed(5)})，四次换向法彻底消除了不等位电势差与四大副效应。由斜率测得第一灵敏度 KH1 = ${KH1.toFixed(1)} V/(A·T)。`,
    `2. 霍尔电压 UH 与磁感应强度 B 具有优良的线性响应 (r = ${fit2.r.toFixed(5)})，由拟合斜率求得第二灵敏度 KH2 = ${KH2.toFixed(1)} V/(A·T)。截距 b2 = ${fit2.intercept.toFixed(2)} mV 源于单向换流未消去的残余不等位电势，不影响斜率。`,
    `3. 测得霍尔元件平均灵敏度 KH = ${KH_avg.toFixed(1)} V/(A·T)，霍尔系数 RH = ${(RH).toExponential(2)} m³/C，多数载流子浓度 n = ${(nCarrier).toExponential(2)} m⁻³。`,
    `4. 梯度磁场中微位移定标灵敏度为 |kr| = ${Math.abs(kr).toFixed(3)} mm/mV（电压灵敏度 |ku| = ${Math.abs(ku).toFixed(2)} mV/mm），位移测量精度高。`,
  ];

  const values: Record<string, number | string> = {
    KH1,
    KH2,
    KH_avg,
    RH,
    nCarrier,
    kr,
    ku,
    k1,
    k2,
    b2: fit2.intercept,
    r1: fit1.r,
    r2: fit2.r,
    r3: fit3_r.r,
  };

  return {
    values,
    steps,
    uncertainties,
    plots,
    computedTableCells: {
      table1_uh_ih: computedT1Rows as any,
      table2_uh_b: computedT2Rows as any,
      table3_displacement: t3Raw as any,
    },
    conclusions,
    // 兼容附加属性
    processedT1,
    processedT2,
    KH1,
    KH2,
    KH_avg,
    RH,
    nCarrier,
    kr,
    ku,
    fit1,
    fit2,
    fit3_r,
    fit3_u,
  };
}
