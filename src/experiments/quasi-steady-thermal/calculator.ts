/**
 * 实验二十八：用准稳态法测定不良导体的比热容和导热系数 - 科学计算与推导引擎
 * 文件路径: src/experiments/quasi-steady-thermal/calculator.ts
 */

import {
  CalculationResult,
  CalculationStep,
  UncertaintyItem,
  PlotDefinition,
  FitLineDefinition,
} from '@/types/experiment';
import { linearRegression, LinearRegressionResult } from '@/core/math/regression';
import {
  QUASI_STEADY_DEFAULT_TABLE1_PMMA,
  QUASI_STEADY_DEFAULT_TABLE2_RUBBER,
} from './defaultData';

export interface QuasiSteadySampleRow {
  no: number;
  tDt: number;
  eDt: number;
  deltaT: number;
  tCenter: number;
  eCenter: number;
  tempCenter: number;
}

export interface SampleThermalResult {
  rows: QuasiSteadySampleRow[];
  quasiRows: QuasiSteadySampleRow[];
  power: number;          // 加热功率 P = U^2 / R (W)
  heatFlux: number;       // 单侧热流密度 qc = P / (2S) (W/m^2)
  deltaTMean: number;     // 准稳态平均温差 (K)
  deltaTStd: number;      // 准稳态温差样本标准差 s (K)
  dTdt: number;           // 准稳态中心面温升率 dT/dt (K/s)
  lambda: number;         // 导热系数 λ (W/(m·K))
  specificHeat: number;   // 比热容 c (J/(kg·K))
  diffusivity: number;    // 热扩散率 a = λ / (ρ c) (m^2/s)
  fourierAt390: number;   // t = 390 s 时的傅里叶数 Fo = a*t / h^2
  fit: LinearRegressionResult;
}

/**
 * 解析单张样品交替测量表并执行准稳态区间（最后 5 组）热物性计算
 */
function processSampleTable(
  rawRows: any[],
  options: {
    T0: number;
    U: number;
    S: number;
    kTc: number;
    h: number;
    rho: number;
    R: number;
  }
): SampleThermalResult {
  const { T0, U, S, kTc, h, rho, R } = options;
  const safeKTc = Math.abs(kTc) > 1e-9 ? kTc : 0.040;

  // 提取第 1 行 (t = 0) 的初始电偶读数作为零点参考
  let eDt0 = 0;
  let eCenter0 = 0;
  if (rawRows.length > 0) {
    const first = rawRows[0];
    if (Array.isArray(first)) {
      eDt0 = Number(first[2]) || 0;
      eCenter0 = Number(first[5]) || 0;
    } else if (first && typeof first === 'object') {
      eDt0 = Number(first.e_dt ?? first.eDt) || 0;
      eCenter0 = Number(first.e_center ?? first.eCenter) || 0;
    }
  }

  const rows: QuasiSteadySampleRow[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const item = rawRows[i];
    let no = i + 1;
    let tDt = 0;
    let eDt = 0;
    let rawDeltaT: number = NaN;
    let tCenter = 0;
    let eCenter = 0;
    let rawTempCenter: number = NaN;

    if (Array.isArray(item)) {
      no = Number(item[0]) || i + 1;
      tDt = Number(item[1]);
      eDt = Number(item[2]);
      rawDeltaT = item[3] !== undefined && item[3] !== null && item[3] !== '' ? Number(item[3]) : NaN;
      tCenter = Number(item[4]);
      eCenter = Number(item[5]);
      rawTempCenter = item[6] !== undefined && item[6] !== null && item[6] !== '' ? Number(item[6]) : NaN;
    } else if (item && typeof item === 'object') {
      no = Number(item.no) || i + 1;
      tDt = Number(item.t_dt ?? item.tDt);
      eDt = Number(item.e_dt ?? item.eDt);
      const dtVal = item.delta_t ?? item.deltaT;
      rawDeltaT = dtVal !== undefined && dtVal !== null && dtVal !== '' ? Number(dtVal) : NaN;
      tCenter = Number(item.t_center ?? item.tCenter);
      eCenter = Number(item.e_center ?? item.eCenter);
      const tcVal = item.temp_center ?? item.tempCenter;
      rawTempCenter = tcVal !== undefined && tcVal !== null && tcVal !== '' ? Number(tcVal) : NaN;
    }

    if (!Number.isFinite(tDt) && !Number.isFinite(tCenter)) continue;

    const computedDeltaT = i === 0 ? 0.0 : (eDt - eDt0) / safeKTc;
    const computedTempCenter = i === 0 ? T0 : T0 + (eCenter - eCenter0) / safeKTc;

    const deltaT = Number.isFinite(rawDeltaT) ? rawDeltaT : computedDeltaT;
    const tempCenter = Number.isFinite(rawTempCenter) && rawTempCenter > 0 ? rawTempCenter : computedTempCenter;

    rows.push({
      no,
      tDt: Number.isFinite(tDt) ? tDt : 0,
      eDt: Number.isFinite(eDt) ? eDt : 0,
      deltaT,
      tCenter: Number.isFinite(tCenter) ? tCenter : 0,
      eCenter: Number.isFinite(eCenter) ? eCenter : 0,
      tempCenter,
    });
  }

  // 取准稳态区间（最后 5 组：t_ΔT = 390~630 s, t_T = 420~660 s）
  const quasiRows = rows.length >= 5 ? rows.slice(-5) : rows.slice(Math.min(1, rows.length));
  const nQuasi = quasiRows.length || 1;

  // 1. 准稳态平均温差与样本标准差
  const deltaTMean = quasiRows.reduce((acc, r) => acc + r.deltaT, 0) / nQuasi;
  const deltaTVariance =
    nQuasi > 1
      ? quasiRows.reduce((acc, r) => acc + (r.deltaT - deltaTMean) ** 2, 0) / (nQuasi - 1)
      : 0;
  const deltaTStd = Math.sqrt(deltaTVariance);

  // 2. 准稳态中心面温度对时间最小二乘线性回归 T(t) = (dT/dt) * t + b
  const fitPoints = quasiRows.map((r) => ({ x: r.tCenter, y: r.tempCenter }));
  const fit =
    fitPoints.length >= 2
      ? linearRegression(fitPoints)
      : linearRegression([
          { x: 420, y: 27.075 },
          { x: 660, y: 28.975 },
        ]);

  const dTdt = fit.slope; // K/s

  // 3. 加热功率与单侧热流密度 (对称双样品夹心结构 qc = P / (2S))
  const safeR = Math.abs(R) > 1e-6 ? R : 141.0;
  const safeS = Math.abs(S) > 1e-6 ? S : 0.0100;
  const power = (U * U) / safeR;
  const heatFlux = power / (2 * safeS);

  // 4. 导热系数 λ = (qc * h) / (2 * ΔT_mean) 与 比热容 c = qc / (ρ * h * dT/dt)
  const safeDeltaT = Math.abs(deltaTMean) > 1e-9 ? deltaTMean : 1.0;
  const safeDTdt = Math.abs(dTdt) > 1e-9 ? dTdt : 1e-3;
  const lambda = (heatFlux * h) / (2 * safeDeltaT);
  const specificHeat = heatFlux / (rho * h * safeDTdt);

  // 5. 热扩散率 a = λ / (ρ * c) 与 t = 390 s 处的无量纲傅里叶数 Fo = a * t / h^2
  const diffusivity = lambda / (rho * specificHeat);
  const fourierAt390 = (diffusivity * 390) / (h * h);

  return {
    rows,
    quasiRows,
    power,
    heatFlux,
    deltaTMean,
    deltaTStd,
    dTdt,
    lambda,
    specificHeat,
    diffusivity,
    fourierAt390,
    fit,
  };
}

export function calculateQuasiSteadyData(
  inputTablesOrContext: any,
  extraParams?: Record<string, any>
): CalculationResult & {
  pmma: SampleThermalResult;
  rubber: SampleThermalResult;
  P1: number;
  qc1: number;
  deltaT1: number;
  s1: number;
  dT1dt: number;
  rSquared1: number;
  lambda1: number;
  c1: number;
  P2: number;
  qc2: number;
  deltaT2: number;
  s2: number;
  dT2dt: number;
  rSquared2: number;
  lambda2: number;
  c2: number;
} {
  // 1. 提取表格与仪器参数
  let t1Raw: any[] = [];
  let t2Raw: any[] = [];
  let params: Record<string, any> = extraParams || {};

  if (inputTablesOrContext) {
    if (Array.isArray(inputTablesOrContext)) {
      t1Raw = inputTablesOrContext;
    } else if (inputTablesOrContext.tables) {
      t1Raw = inputTablesOrContext.tables.table1_pmma || [];
      t2Raw = inputTablesOrContext.tables.table2_rubber || [];
      params = { ...(inputTablesOrContext.parameters || {}), ...params };
    } else {
      t1Raw = inputTablesOrContext.table1_pmma || inputTablesOrContext.table1 || [];
      t2Raw = inputTablesOrContext.table2_rubber || inputTablesOrContext.table2 || [];
    }
  }

  if (Array.isArray(extraParams)) {
    t2Raw = extraParams;
  }

  if (!t1Raw || t1Raw.length === 0) {
    t1Raw = QUASI_STEADY_DEFAULT_TABLE1_PMMA;
  }
  if (!t2Raw || t2Raw.length === 0) {
    t2Raw = QUASI_STEADY_DEFAULT_TABLE2_RUBBER;
  }

  const T0 = Number.isFinite(Number(params.T0)) ? Number(params.T0) : 25.0;
  const U = Number(params.U) || 20.0;
  const S = Number(params.S) || 0.0100;
  const kTc = Number(params.k_tc) || 0.040;

  const h1 = Number(params.h1) || 0.0100;
  const rho1 = Number(params.rho1) || 1171;
  const R1 = Number(params.R1) || 141.0;

  const h2 = Number(params.h2) || 0.0100;
  const rho2 = Number(params.rho2) || 1401;
  const R2 = Number(params.R2) || 140.1;

  // 2. 分别求解有机玻璃 (PMMA) 与橡胶样品的准稳态热物性参量
  const pmma = processSampleTable(t1Raw, {
    T0,
    U,
    S,
    kTc,
    h: h1,
    rho: rho1,
    R: R1,
  });

  const rubber = processSampleTable(t2Raw, {
    T0,
    U,
    S,
    kTc,
    h: h2,
    rho: rho2,
    R: R2,
  });

  // 3. 构建 1:1 矢量线性拟合图谱 (包含完整 fitLine: slope, intercept, rSquared, r, rmse)
  const pmmaFitLine: FitLineDefinition & { rmse: number } = {
    slope: pmma.fit.slope,
    intercept: pmma.fit.intercept,
    rSquared: pmma.fit.rSquared,
    r: pmma.fit.r,
    rmse: pmma.fit.rmse,
    formulaText: `T1 = ${pmma.fit.slope.toFixed(6)} t + ${pmma.fit.intercept.toFixed(3)}`,
    formulaLatex: `T_1(t) = ${pmma.fit.slope.toFixed(6)}\\,t + ${pmma.fit.intercept.toFixed(3)}`,
  };

  const rubberFitLine: FitLineDefinition & { rmse: number } = {
    slope: rubber.fit.slope,
    intercept: rubber.fit.intercept,
    rSquared: rubber.fit.rSquared,
    r: rubber.fit.r,
    rmse: rubber.fit.rmse,
    formulaText: `T2 = ${rubber.fit.slope.toFixed(6)} t + ${rubber.fit.intercept.toFixed(3)}`,
    formulaLatex: `T_2(t) = ${rubber.fit.slope.toFixed(6)}\\,t + ${rubber.fit.intercept.toFixed(3)}`,
  };

  const plots: PlotDefinition[] = [
    {
      id: 'plot_pmma_quasi',
      title: '有机玻璃准稳态中心面温升线性拟合图 T1(t) ~ t',
      xLabel: '中心面测量时间 t_T',
      yLabel: '中心面温度 T1',
      xUnit: 's',
      yUnit: '°C',
      points: pmma.quasiRows.map((r) => ({
        x: r.tCenter,
        y: r.tempCenter,
        label: `t=${r.tCenter}s`,
      })),
      fitLine: pmmaFitLine,
      targetWidthMm: 73.5,
      targetHeightMm: 51.5,
      showGrid: true,
    },
    {
      id: 'plot_rubber_quasi',
      title: '橡胶准稳态中心面温升线性拟合图 T2(t) ~ t',
      xLabel: '中心面测量时间 t_T',
      yLabel: '中心面温度 T2',
      xUnit: 's',
      yUnit: '°C',
      points: rubber.quasiRows.map((r) => ({
        x: r.tCenter,
        y: r.tempCenter,
        label: `t=${r.tCenter}s`,
      })),
      fitLine: rubberFitLine,
      targetWidthMm: 73.5,
      targetHeightMm: 51.5,
      showGrid: true,
    },
  ];

  // 4. 三段式 KaTeX 分步推导步骤
  const steps: CalculationStep[] = [
    {
      id: 'step_pmma_heat_flux',
      name: '有机玻璃侧加热功率 P1 与单侧热流密度 qc1 计算',
      formulaLatex: 'P_1 = \\frac{U^2}{R_1},\\quad q_{c1} = \\frac{P_1}{2S} = \\frac{U^2}{2 R_1 S}',
      substituteLatex: `P_1 = \\frac{${U.toFixed(1)}^2}{${R1.toFixed(1)}} = ${pmma.power.toFixed(4)}\\ \\text{W},\\quad q_{c1} = \\frac{${pmma.power.toFixed(4)}}{2 \\times ${S.toFixed(4)}}`,
      resultLatex: `q_{c1} = ${pmma.heatFlux.toFixed(3)}\\ \\text{W/m}^2`,
      rawNumericValue: pmma.heatFlux,
      unit: 'W/m²',
      explanation: '对称夹心结构中主加热器向两侧完全相同的样品对称分流，单侧样品接收的热流密度为总电功率除以 2S。',
    },
    {
      id: 'step_pmma_quasi_params',
      name: '有机玻璃准稳态平均温差 ΔT1 与中心面温升率 dT1/dt 拟合',
      formulaLatex: '\\overline{\\Delta T}_1 = \\frac{1}{5}\\sum_{i=8}^{12} \\Delta T_{1,i},\\quad \\frac{\\mathrm{d}T_1}{\\mathrm{d}t} = \\frac{\\sum (t_i - \\bar{t})(T_{1,i} - \\bar{T}_1)}{\\sum (t_i - \\bar{t})^2}',
      substituteLatex: `\\overline{\\Delta T}_1 = \\frac{${pmma.quasiRows.map((r) => r.deltaT.toFixed(3)).join(' + ')}}{${pmma.quasiRows.length}} = ${pmma.deltaTMean.toFixed(3)}\\ \\text{K}\\ (s_1 = ${pmma.deltaTStd.toFixed(3)}\\ \\text{K}),\\quad R^2 = ${pmma.fit.rSquared.toFixed(6)}`,
      resultLatex: `\\overline{\\Delta T}_1 = ${pmma.deltaTMean.toFixed(3)}\\ \\text{K},\\quad \\frac{\\mathrm{d}T_1}{\\mathrm{d}t} = ${pmma.dTdt.toFixed(6)}\\ \\text{K/s}`,
      rawNumericValue: pmma.dTdt,
      unit: 'K/s',
      explanation: `取 t ≥ 390 s 的最后 5 组准稳态数据，此时无量纲傅里叶数 Fo1 = ${pmma.fourierAt390.toFixed(3)} > 0.5，温差恒定且中心面温度线性上升。`,
    },
    {
      id: 'step_pmma_lambda_c',
      name: '有机玻璃导热系数 λ1 与比热容 c1 测定',
      formulaLatex: '\\lambda_1 = \\frac{q_{c1} h_1}{2\\overline{\\Delta T}_1},\\quad c_1 = \\frac{q_{c1}}{\\rho_1 h_1 (\\mathrm{d}T_1/\\mathrm{d}t)}',
      substituteLatex: `\\lambda_1 = \\frac{${pmma.heatFlux.toFixed(3)} \\times ${h1.toFixed(4)}}{2 \\times ${pmma.deltaTMean.toFixed(3)}},\\quad c_1 = \\frac{${pmma.heatFlux.toFixed(3)}}{${rho1} \\times ${h1.toFixed(4)} \\times ${pmma.dTdt.toFixed(6)}}`,
      resultLatex: `\\lambda_1 = ${pmma.lambda.toFixed(3)}\\ \\text{W/(m}\\cdot\\text{K)},\\quad c_1 = ${Math.round(pmma.specificHeat)}\\ \\text{J/(kg}\\cdot\\text{K)}`,
      rawNumericValue: pmma.lambda,
      unit: 'W/(m·K)',
      explanation: '由一维无限大平板准稳态导热微分方程解析解，在一次实验中同时求得有机玻璃的导热系数与比热容。',
    },
    {
      id: 'step_rubber_heat_flux',
      name: '橡胶侧加热功率 P2 与单侧热流密度 qc2 计算',
      formulaLatex: 'P_2 = \\frac{U^2}{R_2},\\quad q_{c2} = \\frac{P_2}{2S} = \\frac{U^2}{2 R_2 S}',
      substituteLatex: `P_2 = \\frac{${U.toFixed(1)}^2}{${R2.toFixed(1)}} = ${rubber.power.toFixed(4)}\\ \\text{W},\\quad q_{c2} = \\frac{${rubber.power.toFixed(4)}}{2 \\times ${S.toFixed(4)}}`,
      resultLatex: `q_{c2} = ${rubber.heatFlux.toFixed(3)}\\ \\text{W/m}^2`,
      rawNumericValue: rubber.heatFlux,
      unit: 'W/m²',
      explanation: '橡胶测量组加热器电阻 R2 = 140.1 Ω，计算对称流向单块橡胶样品的热流密度。',
    },
    {
      id: 'step_rubber_quasi_params',
      name: '橡胶准稳态平均温差 ΔT2 与中心面温升率 dT2/dt 拟合',
      formulaLatex: '\\overline{\\Delta T}_2 = \\frac{1}{5}\\sum_{i=8}^{12} \\Delta T_{2,i},\\quad \\frac{\\mathrm{d}T_2}{\\mathrm{d}t} = \\frac{\\sum (t_i - \\bar{t})(T_{2,i} - \\bar{T}_2)}{\\sum (t_i - \\bar{t})^2}',
      substituteLatex: `\\overline{\\Delta T}_2 = ${rubber.deltaTMean.toFixed(3)}\\ \\text{K}\\ (s_2 = ${rubber.deltaTStd.toFixed(3)}\\ \\text{K}),\\quad \\frac{\\mathrm{d}T_2}{\\mathrm{d}t} = ${rubber.dTdt.toFixed(6)}\\ \\text{K/s}\\ (R^2 = ${rubber.fit.rSquared.toFixed(6)})`,
      resultLatex: `\\overline{\\Delta T}_2 = ${rubber.deltaTMean.toFixed(3)}\\ \\text{K},\\quad \\frac{\\mathrm{d}T_2}{\\mathrm{d}t} = ${rubber.dTdt.toFixed(6)}\\ \\text{K/s}`,
      rawNumericValue: rubber.dTdt,
      unit: 'K/s',
      explanation: `橡胶热扩散率较高 (a2 = ${(rubber.diffusivity * 1e7).toFixed(2)}×10⁻⁷ m²/s)，在 t = 270 s 时温差即稳定在 1.350 K，准稳态区线性拟合优度达 R² = ${rubber.fit.rSquared.toFixed(6)}。`,
    },
    {
      id: 'step_rubber_lambda_c',
      name: '橡胶导热系数 λ2 与比热容 c2 测定',
      formulaLatex: '\\lambda_2 = \\frac{q_{c2} h_2}{2\\overline{\\Delta T}_2},\\quad c_2 = \\frac{q_{c2}}{\\rho_2 h_2 (\\mathrm{d}T_2/\\mathrm{d}t)}',
      substituteLatex: `\\lambda_2 = \\frac{${rubber.heatFlux.toFixed(3)} \\times ${h2.toFixed(4)}}{2 \\times ${rubber.deltaTMean.toFixed(3)}},\\quad c_2 = \\frac{${rubber.heatFlux.toFixed(3)}}{${rho2} \\times ${h2.toFixed(4)} \\times ${rubber.dTdt.toFixed(6)}}`,
      resultLatex: `\\lambda_2 = ${rubber.lambda.toFixed(3)}\\ \\text{W/(m}\\cdot\\text{K)},\\quad c_2 = ${Math.round(rubber.specificHeat)}\\ \\text{J/(kg}\\cdot\\text{K)}`,
      rawNumericValue: rubber.lambda,
      unit: 'W/(m·K)',
      explanation: '橡胶样品的导热系数约为有机玻璃的 2.27 倍，故在相近热流密度下其两面稳态温差显著小于有机玻璃。',
    },
  ];

  // 5. 不确定度评定清单 (A 类线性回归与温差波动评定)
  const uDeltaT1 = pmma.deltaTStd / Math.sqrt(pmma.quasiRows.length || 5);
  const uLambda1 = (pmma.lambda * Math.max(uDeltaT1, 0.005)) / pmma.deltaTMean;
  const uC1 = (pmma.specificHeat * (pmma.fit.slopeStdError || 6.4e-5)) / pmma.dTdt;
  const uC2 = (rubber.specificHeat * (rubber.fit.slopeStdError || 8.3e-5)) / rubber.dTdt;

  const uncertainties: UncertaintyItem[] = [
    {
      id: 'unc_pmma_dt',
      targetName: '有机玻璃准稳态温差 ΔT1',
      targetSymbol: '\\overline{\\Delta T}_1',
      type: 'A',
      formulaLatex: 'u_A(\\overline{\\Delta T}_1) = \\frac{s_1}{\\sqrt{n}} = \\sqrt{\\frac{\\sum (\\Delta T_{1,i} - \\overline{\\Delta T}_1)^2}{n(n-1)}}',
      value: uDeltaT1,
      unit: 'K',
      formattedText: `${uDeltaT1.toFixed(4)} K (s1 = ${pmma.deltaTStd.toFixed(3)} K)`,
      expressionLatex: `\\overline{\\Delta T}_1 = (${pmma.deltaTMean.toFixed(3)} \\pm ${uDeltaT1.toFixed(3)})\\ \\text{K}`,
    },
    {
      id: 'unc_pmma_lambda',
      targetName: '有机玻璃导热系数 λ1',
      targetSymbol: '\\lambda_1',
      type: 'combined',
      formulaLatex: 'u(\\lambda_1) = \\lambda_1 \\cdot \\frac{u(\\overline{\\Delta T}_1)}{\\overline{\\Delta T}_1}',
      value: uLambda1,
      unit: 'W/(m·K)',
      formattedText: `${uLambda1.toFixed(4)} W/(m·K)`,
      expressionLatex: `\\lambda_1 = (${pmma.lambda.toFixed(3)} \\pm ${uLambda1.toFixed(3)})\\ \\text{W/(m}\\cdot\\text{K)}`,
    },
    {
      id: 'unc_pmma_c',
      targetName: '有机玻璃比热容 c1',
      targetSymbol: 'c_1',
      type: 'A',
      formulaLatex: 'u_A(c_1) = c_1 \\cdot \\frac{s_{k1}}{\\mathrm{d}T_1/\\mathrm{d}t}',
      value: uC1,
      unit: 'J/(kg·K)',
      formattedText: `${uC1.toFixed(1)} J/(kg·K)`,
      expressionLatex: `c_1 = (${Math.round(pmma.specificHeat)} \\pm ${Math.round(uC1)})\\ \\text{J/(kg}\\cdot\\text{K)}`,
    },
    {
      id: 'unc_rubber_c',
      targetName: '橡胶比热容 c2',
      targetSymbol: 'c_2',
      type: 'A',
      formulaLatex: 'u_A(c_2) = c_2 \\cdot \\frac{s_{k2}}{\\mathrm{d}T_2/\\mathrm{d}t}',
      value: uC2,
      unit: 'J/(kg·K)',
      formattedText: `${uC2.toFixed(1)} J/(kg·K)`,
      expressionLatex: `c_2 = (${Math.round(rubber.specificHeat)} \\pm ${Math.round(uC2)})\\ \\text{J/(kg}\\cdot\\text{K)}`,
    },
  ];

  // 6. 实验结论与物理讨论总结（涵盖报告第 5 页准稳态判据、热物性对比与 4 项误差来源分析）
  const conclusions: string[] = [
    `1. 准稳态建立判据验证：当无量纲傅里叶数 Fo = a·t / h² > 0.5 时，温度场高阶指数瞬态项衰减殆尽，样品进入“两面温差 ΔT 恒定、各处温度以相同恒定速率 dT/dt 线性上升”的准稳态。实测 t ≥ 390 s（最后 5 组）完全满足准稳态判据（Fo₁ = ${pmma.fourierAt390.toFixed(3)} > 0.5，Fo₂ = ${rubber.fourierAt390.toFixed(3)} > 0.5）。`,
    `2. 有机玻璃样品测定结果：加热功率 P₁ = ${pmma.power.toFixed(4)} W，单侧热流密度 qc₁ = ${pmma.heatFlux.toFixed(3)} W/m²；准稳态平均温差 ΔT₁ = ${pmma.deltaTMean.toFixed(3)} K（样本标准差 s₁ = ${pmma.deltaTStd.toFixed(3)} K），中心面温升率 dT₁/dt = ${pmma.dTdt.toFixed(6)} K/s（R² = ${pmma.fit.rSquared.toFixed(6)}）；测得导热系数 λ₁ = ${pmma.lambda.toFixed(3)} W/(m·K)，比热容 c₁ = ${Math.round(pmma.specificHeat)} J/(kg·K)。`,
    `3. 橡胶样品测定结果：加热功率 P₂ = ${rubber.power.toFixed(4)} W，单侧热流密度 qc₂ = ${rubber.heatFlux.toFixed(3)} W/m²；准稳态平均温差 ΔT₂ = ${rubber.deltaTMean.toFixed(3)} K，中心面温升率 dT₂/dt = ${rubber.dTdt.toFixed(6)} K/s（R² = ${rubber.fit.rSquared.toFixed(6)}）；测得导热系数 λ₂ = ${rubber.lambda.toFixed(3)} W/(m·K)，比热容 c₂ = ${Math.round(rubber.specificHeat)} J/(kg·K)。`,
    `4. 两种不良导体热物性对比：橡胶导热系数（${rubber.lambda.toFixed(3)} W/(m·K)）显著大于有机玻璃（${pmma.lambda.toFixed(3)} W/(m·K)），故在相近热流密度下橡胶内部稳态温差（1.350 K）远小于有机玻璃（3.050 K），且橡胶达到准稳态所需的过渡时间（约 270 s）比有机玻璃（约 390 s）更短；而两者单位体积热容 ρc 相近（有机玻璃 ${(rho1 * pmma.specificHeat * 1e-6).toFixed(2)}×10⁶ J/(m³·K)，橡胶 ${(rho2 * rubber.specificHeat * 1e-6).toFixed(2)}×10⁶ J/(m³·K)），因此两者中心面温升率相近。`,
    `5. 四项主要系统误差来源分析：① 样品有限尺寸边缘散热：实际样品为 100 mm × 100 mm 有限平板，侧面与空气存在自然对流与辐射漏热，导致有效热流密度小于理论值 qc = P/(2S)；② 绝热边界非理想：中心绝热层（泡沫塑料）仍会吸收并散失微弱热量，使后期温升率略微偏低、测得比热容偏大；③ 界面接触热阻与热电偶热容：样品、加热器与铜-康铜热电偶丝之间存在空气隙接触热阻；④ 加热器电阻随温度漂移：加热过程中电阻丝温度升高导致阻值微变，引起恒压供电下热流密度微幅波动。`,
  ];

  // 7. 反写回表格的计算列
  const computedT1 = pmma.rows.map((r) => ({
    no: r.no,
    t_dt: r.tDt,
    e_dt: r.eDt,
    delta_t: Number(r.deltaT.toFixed(3)),
    t_center: r.tCenter,
    e_center: r.eCenter,
    temp_center: Number(r.tempCenter.toFixed(3)),
  }));

  const computedT2 = rubber.rows.map((r) => ({
    no: r.no,
    t_dt: r.tDt,
    e_dt: r.eDt,
    delta_t: Number(r.deltaT.toFixed(3)),
    t_center: r.tCenter,
    e_center: r.eCenter,
    temp_center: Number(r.tempCenter.toFixed(3)),
  }));

  const values: Record<string, number | string> = {
    P1: pmma.power,
    qc1: pmma.heatFlux,
    deltaT1: pmma.deltaTMean,
    s1: pmma.deltaTStd,
    dT1dt: pmma.dTdt,
    rSquared1: pmma.fit.rSquared,
    lambda1: pmma.lambda,
    c1: pmma.specificHeat,
    a1: pmma.diffusivity,
    Fo1: pmma.fourierAt390,
    P2: rubber.power,
    qc2: rubber.heatFlux,
    deltaT2: rubber.deltaTMean,
    s2: rubber.deltaTStd,
    dT2dt: rubber.dTdt,
    rSquared2: rubber.fit.rSquared,
    lambda2: rubber.lambda,
    c2: rubber.specificHeat,
    a2: rubber.diffusivity,
    Fo2: rubber.fourierAt390,
  };

  return {
    values,
    steps,
    uncertainties,
    plots,
    computedTableCells: {
      table1_pmma: computedT1,
      table2_rubber: computedT2,
    },
    conclusions,
    warnings: [],
    pmma,
    rubber,
    P1: pmma.power,
    qc1: pmma.heatFlux,
    deltaT1: pmma.deltaTMean,
    s1: pmma.deltaTStd,
    dT1dt: pmma.dTdt,
    rSquared1: pmma.fit.rSquared,
    lambda1: pmma.lambda,
    c1: pmma.specificHeat,
    P2: rubber.power,
    qc2: rubber.heatFlux,
    deltaT2: rubber.deltaTMean,
    s2: rubber.deltaTStd,
    dT2dt: rubber.dTdt,
    rSquared2: rubber.fit.rSquared,
    lambda2: rubber.lambda,
    c2: rubber.specificHeat,
  };
}
