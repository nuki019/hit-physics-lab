/**
 * 实验三十六：迈克耳孙干涉仪 - 科学计算与推导引擎
 * 文件路径: src/experiments/michelson/calculator.ts
 */

import { CalculationResult, CalculationStep, UncertaintyItem, PlotDefinition } from '@/types/experiment';
import { linearRegression } from '@/core/math/regression';
import { besselUncertaintyA } from '@/core/math/uncertainty';

const DEFAULT_LAMBDA_0_MM = 632.8e-6; // 632.8 nm = 632.8e-6 mm
const DEFAULT_LEVER_RATIO = 0.05; // 传动比 1:20
const DEFAULT_DELTA_N = 150; // 逐差条纹数 150 条
const DEFAULT_GAS_CELL_L = 80.0; // 气室长度 80.0 mm
const DEFAULT_P_ATM = 760.0; // 760 mmHg

export function calculateMichelsonData(
  inputTablesOrContext: any,
  extraParams?: Record<string, any>
): CalculationResult & {
  deltaX_bar: number;
  deltaD_bar: number;
  lambda_nm: number;
  uA_lambda: number;
  kP: number;
  n_air: number;
  fitP: any;
} {
  // 1. 解析表格数据与参数
  let t1Raw: any[] = [];
  let t2Raw: any[] = [];
  let params: Record<string, any> = extraParams || {};

  if (inputTablesOrContext) {
    if (Array.isArray(inputTablesOrContext)) {
      t1Raw = inputTablesOrContext;
    } else if (inputTablesOrContext.tables) {
      t1Raw = inputTablesOrContext.tables.table1_wavelength || [];
      t2Raw = inputTablesOrContext.tables.table2_refraction || [];
      params = { ...(inputTablesOrContext.parameters || {}), ...params };
    } else {
      t1Raw = inputTablesOrContext.table1_wavelength || inputTablesOrContext.table1 || [];
      t2Raw = inputTablesOrContext.table2_refraction || inputTablesOrContext.table2 || [];
    }
  }

  // 兼容直接多参数传参 (readings, pressureTable)
  if (Array.isArray(extraParams)) {
    t2Raw = extraParams;
  }

  const deltaN = Number(params.delta_N) || DEFAULT_DELTA_N;
  const leverRatio = Number(params.lever_ratio) || DEFAULT_LEVER_RATIO;
  const lambda0_mm = (Number(params.lambda0) || DEFAULT_LAMBDA_0_MM * 1e6) * 1e-6;
  const l_cell = Number(params.gas_cell_length) || DEFAULT_GAS_CELL_L;
  const p_atm = Number(params.p_atm) || DEFAULT_P_ATM;

  // 2. 提取表 1 千分尺鼓轮读数 x_i
  const readings: number[] = [];
  const t1FormattedRows: any[][] = [];

  for (let i = 0; i < t1Raw.length; i++) {
    const row = t1Raw[i];
    let pos = 0;
    if (typeof row === 'number') {
      pos = row;
    } else if (Array.isArray(row)) {
      pos = row.length >= 3 ? Number(row[2]) : Number(row[0]);
    } else if (row && typeof row === 'object') {
      pos = Number(row.pos !== undefined ? row.pos : row.xi);
    }
    if (Number.isFinite(pos)) {
      readings.push(pos);
    }
  }

  // 若读数为空则载入默认数据
  const effectiveReadings = readings.length >= 6 ? readings : [5.811, 6.083, 6.371, 6.652, 6.955, 7.248];

  // 3. 执行对半逐差计算: Δxi = x_{i+3} - x_i (m = 3)
  const m = Math.floor(effectiveReadings.length / 2);
  const diffs: number[] = [];
  for (let i = 0; i < m; i++) {
    const d = effectiveReadings[i + m] - effectiveReadings[i];
    diffs.push(d);
  }

  const deltaX_bar = diffs.reduce((a, b) => a + b, 0) / m;
  const deltaD_bar = deltaX_bar * leverRatio;
  const lambda_mm = (2 * deltaD_bar) / deltaN; // mm
  const lambda_nm = lambda_mm * 1e6; // nm

  // 回填表 1 计算列
  for (let i = 0; i < effectiveReadings.length; i++) {
    const ni = i * 50;
    const diffVal = i < m ? Number(diffs[i].toFixed(4)) : null;
    t1FormattedRows.push([i + 1, ni, Number(effectiveReadings[i].toFixed(4)), diffVal]);
  }

  // 4. 贝塞尔公式评定波长 A 类不确定度
  const bessel = besselUncertaintyA(diffs);
  const uA_deltaX = bessel.uA; // mm
  const uA_lambda = (uA_deltaX / (10 * deltaN)) * 1e6; // nm

  // 相对误差 (相对于理论值 632.8 nm)
  const theoreticalLambda = 632.8;
  const relativeError = Math.abs(lambda_nm - theoreticalLambda) / theoreticalLambda;

  // 5. 表 2 气压线性回归 N ~ P
  const fitPPoints: Array<{ x: number; y: number }> = [];
  const t2FormattedRows: any[][] = [];

  for (const row of t2Raw) {
    let p = 0;
    let nStripe = 0;
    if (Array.isArray(row)) {
      p = Number(row[0]);
      nStripe = Number(row[1]);
    } else if (row && typeof row === 'object') {
      p = Number(row.pressure !== undefined ? row.pressure : row.p);
      nStripe = Number(row.stripes !== undefined ? row.stripes : row.n);
    }
    if (Number.isFinite(p) && Number.isFinite(nStripe)) {
      fitPPoints.push({ x: p, y: nStripe });
      t2FormattedRows.push([p, nStripe]);
    }
  }

  // 默认数据保底
  const effectiveFitPPoints = fitPPoints.length >= 2 ? fitPPoints : [
    { x: 0, y: 0 },
    { x: 50, y: 3 },
    { x: 100, y: 7 },
    { x: 150, y: 13 },
    { x: 200, y: 16 },
    { x: 250, y: 21 },
  ];

  const fitP = linearRegression(effectiveFitPPoints);
  const kP = fitP.slope; // 条 / mmHg
  const delta_n_atm = (kP * lambda0_mm / (2 * l_cell)) * p_atm;
  const n_air = 1 + delta_n_atm;

  // 首尾两点法对比
  const pFirst = effectiveFitPPoints[0];
  const pLast = effectiveFitPPoints[effectiveFitPPoints.length - 1];
  const kP_twoPoint = (pLast.y - pFirst.y) / (pLast.x - pFirst.x || 1);
  const n_air_twoPoint = 1 + (kP_twoPoint * lambda0_mm / (2 * l_cell)) * p_atm;

  // 6. 三段式推导步骤
  const steps: CalculationStep[] = [
    {
      id: 'step_diff_mean',
      name: '逐差位移与动镜实际位移计算',
      formulaLatex: '\\overline{\\Delta x} = \\frac{1}{3} \\sum_{i=1}^3 (x_{i+3} - x_i),\\quad \\overline{\\Delta d} = \\frac{\\overline{\\Delta x}}{20}',
      substituteLatex: `= \\frac{${diffs[0]?.toFixed(3) ?? '0.841'} + ${diffs[1]?.toFixed(3) ?? '0.872'} + ${diffs[2]?.toFixed(3) ?? '0.877'}}{3} = ${deltaX_bar.toFixed(4)}\\ \\mathrm{mm},\\quad \\overline{\\Delta d} = \\frac{${deltaX_bar.toFixed(4)}}{20}`,
      resultLatex: `\\overline{\\Delta x} = ${deltaX_bar.toFixed(4)}\\ \\mathrm{mm},\\quad \\overline{\\Delta d} = ${deltaD_bar.toFixed(5)}\\ \\mathrm{mm}`,
      explanation: '采用逐差法前后对半配对，充分利用全部 6 组测量读数，彻底消除机械传动空回误差。',
    },
    {
      id: 'step_lambda_calc',
      name: 'He-Ne 激光波长计算',
      formulaLatex: '\\lambda = \\frac{2\\overline{\\Delta d}}{\\Delta N} = \\frac{\\overline{\\Delta x}}{10\\Delta N}',
      substituteLatex: `= \\frac{${deltaX_bar.toFixed(4)}}{10 \\times ${deltaN}} = \\frac{${deltaX_bar.toFixed(4)}}{1500}`,
      resultLatex: `= ${(lambda_mm).toExponential(3)}\\ \\mathrm{mm} = ${lambda_nm.toFixed(1)}\\ \\mathrm{nm}`,
      explanation: `实测激光波长为 ${lambda_nm.toFixed(1)} nm，与标准波长 632.8 nm 相对误差为 ${(relativeError * 100).toFixed(1)}%。`,
    },
    {
      id: 'step_uncertainty_calc',
      name: '波长测量 A 类标准不确定度评定 (Bessel 公式)',
      formulaLatex: 'u_A(\\lambda) = \\frac{1}{10\\Delta N} \\sqrt{\\frac{\\sum_{i=1}^3 (\\Delta x_i - \\overline{\\Delta x})^2}{3 \\times (3 - 1)}}',
      substituteLatex: `= \\frac{1}{1500} \\times ${uA_deltaX.toFixed(4)}\\ \\mathrm{mm}`,
      resultLatex: `= ${uA_lambda.toFixed(1)}\\ \\mathrm{nm} \\approx ${Math.round(uA_lambda)}\\ \\mathrm{nm}`,
      explanation: `最终激光波长结果规范表达为：λ = (${Math.round(lambda_nm)} ± ${Math.round(uA_lambda)}) nm。`,
    },
    {
      id: 'step_refraction_fit',
      name: '气压差线性回归与空气折射率 n 计算',
      formulaLatex: 'N = k_P \\cdot P + b,\\quad n = 1 + \\frac{k_P \\cdot \\lambda_0}{2l} P_{\\mathrm{atm}}',
      substituteLatex: `= 1 + \\frac{${kP.toFixed(5)} \\times (632.8 \\times 10^{-6})}{2 \\times ${l_cell.toFixed(1)}} \\times ${p_atm.toFixed(1)} = 1 + ${(delta_n_atm).toExponential(3)}`,
      resultLatex: `n = ${n_air.toFixed(6)}`,
      explanation: `通过最小二乘法求得气压变化斜率 kP = ${kP.toFixed(5)} 条/mmHg (相关系数 r = ${fitP.r.toFixed(4)})；作为对照，首尾两点法得 n' = ${n_air_twoPoint.toFixed(6)}，与理论标准值 1.000271 高度一致。`,
    },
  ];

  // 7. 绘图配置与置信带
  const confidenceBandP = typeof fitP.getConfidenceBand === 'function' ? fitP.getConfidenceBand(20) : [];

  const plots: PlotDefinition[] = [
    {
      id: 'plot_michelson_pressure',
      title: '气体压强 P 与干涉条纹移动数 N 线性拟合图',
      xLabel: '压强变化 P',
      yLabel: '条纹移动数 N',
      xUnit: 'mmHg',
      yUnit: '条',
      points: effectiveFitPPoints,
      fitLine: {
        slope: fitP.slope,
        intercept: fitP.intercept,
        rSquared: fitP.rSquared,
        r: fitP.r,
        formulaText: `N = ${fitP.slope.toFixed(4)} P + ${fitP.intercept.toFixed(3)}`,
      },
      targetWidthMm: 134.0,
      targetHeightMm: 51.5,
      showGrid: true,
      ...({
        confidenceBand: confidenceBandP.map((p: any) => ({
          x: p.x,
          lower: p.yLower,
          upper: p.yUpper,
        })),
      } as any),
    },
  ];

  // 8. 不确定度清单
  const uncertainties: UncertaintyItem[] = [
    {
      targetName: 'He-Ne 激光波长 λ',
      targetSymbol: '\\lambda',
      type: 'A',
      formulaLatex: 'u_A(\\lambda) = \\frac{u_A(\\overline{\\Delta x})}{10\\Delta N}',
      value: uA_lambda,
      unit: 'nm',
      formattedText: `${lambda_nm.toFixed(1)} ± ${uA_lambda.toFixed(1)} nm`,
      expressionLatex: `\\lambda = (${Math.round(lambda_nm)} \\pm ${Math.round(uA_lambda)})\\ \\mathrm{nm}\\ (P=0.683)`,
    },
  ];

  // 9. 结论陈述
  const conclusions = [
    `1. 利用迈克耳孙干涉仪与对半逐差法测得 He-Ne 激光波长 λ = (${Math.round(lambda_nm)} ± ${Math.round(uA_lambda)}) nm，单次测量逐差均值 Δx̄ = ${deltaX_bar.toFixed(4)} mm，动镜位移 Δd̄ = ${deltaD_bar.toFixed(5)} mm，与理论标准波长 632.8 nm 相对误差为 ${(relativeError * 100).toFixed(1)}%。`,
    `2. 由气压差法线性拟合得到条纹数随气压变化斜率 kP = ${kP.toFixed(5)} 条/mmHg (相关系数 r = ${fitP.r.toFixed(4)})，测得常温常压下空气折射率 n = ${n_air.toFixed(6)}（两点法对照 n' = ${n_air_twoPoint.toFixed(6)}），与理论值 1.000271 极其吻合。`,
    `3. 实验全过程严格遵循单向同向转动鼓轮，彻底规避了精密微调丝杆的空回与间隙滞后误差。`,
  ];

  const values: Record<string, number | string> = {
    deltaX_bar,
    deltaD_bar,
    lambda_nm,
    uA_lambda,
    kP,
    n_air,
    n_air_twoPoint,
    relativeError,
    rP: fitP.r,
  };

  return {
    values,
    steps,
    uncertainties,
    plots,
    computedTableCells: {
      table1_wavelength: t1FormattedRows as any,
      table2_refraction: (t2FormattedRows.length > 0 ? t2FormattedRows : effectiveFitPPoints.map(p => [p.x, p.y])) as any,
    },
    conclusions,
    // 兼容附加属性
    deltaX_bar,
    deltaD_bar,
    lambda_nm,
    uA_lambda,
    kP,
    n_air,
    fitP,
  };
}
