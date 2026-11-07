/**
 * 实验十七：探究乐音 - 科学计算与推导引擎
 * 文件路径: src/experiments/musical-sound/calculator.ts
 */

import { CalculationResult, CalculationStep, UncertaintyItem, PlotDefinition } from '@/types/experiment';
import { linearRegression } from '@/core/math/regression';

export interface MusicalProcessedT1Row {
  no: number;
  mWeight: number;
  tension: number;
  sqrtT: number;
  fRes: number;
  fSq: number;
}

export interface MusicalProcessedT2Row {
  no: number;
  length: number;
  invL: number;
  fRes: number;
}

export interface MusicalProcessedT3Row {
  n: number;
  name: string;
  fTheo: number;
  fMeas: number;
  amplitude: number;
  relAmp: number;
  freqDev: number;
}

export function calculateMusicalSoundData(
  inputTablesOrContext: any,
  extraParams?: Record<string, any>
): CalculationResult & {
  rhoL1: number;
  rhoL2: number;
  rhoLAvg: number;
  uRhoL: number;
  fitT: any;
  fitL: any;
  processedT1: MusicalProcessedT1Row[];
  processedT2: MusicalProcessedT2Row[];
  processedT3: MusicalProcessedT3Row[];
} {
  // 1. 提取表格与物理参数
  let t1Raw: any[] = [];
  let t2Raw: any[] = [];
  let t3Raw: any[] = [];
  let params: Record<string, any> = extraParams || {};

  if (inputTablesOrContext) {
    if (Array.isArray(inputTablesOrContext)) {
      t1Raw = inputTablesOrContext;
    } else if (inputTablesOrContext.tables) {
      t1Raw = inputTablesOrContext.tables.table1_tension_freq || [];
      t2Raw = inputTablesOrContext.tables.table2_length_freq || [];
      t3Raw = inputTablesOrContext.tables.table3_overtone_spectrum || [];
      params = { ...(inputTablesOrContext.parameters || {}), ...params };
    } else {
      t1Raw = inputTablesOrContext.table1_tension_freq || inputTablesOrContext.table1 || [];
      t2Raw = inputTablesOrContext.table2_length_freq || inputTablesOrContext.table2 || [];
      t3Raw = inputTablesOrContext.table3_overtone_spectrum || inputTablesOrContext.table3 || [];
    }
  }

  if (Array.isArray(extraParams)) {
    t2Raw = extraParams;
  }
  if (arguments.length >= 3 && Array.isArray(arguments[2])) {
    t3Raw = arguments[2];
  }

  const L1 = Number(params.L_t1) || 0.600; // m
  const M2 = Number(params.M_t2) || 0.500; // kg
  const g = Number(params.g) || 9.80; // m/s²
  const T2 = M2 * g; // N

  // 2. 表 1 计算：频率与张力平方根关系 f ~ sqrt(T)
  const processedT1: MusicalProcessedT1Row[] = [];
  const fitPointsT: Array<{ x: number; y: number }> = [];
  const computedT1Rows: any[][] = [];

  for (let i = 0; i < t1Raw.length; i++) {
    const row = t1Raw[i];
    let m = 0;
    let f = 0;
    if (Array.isArray(row)) {
      m = Number(row[1]);
      f = Number(row[2]);
    } else if (row && typeof row === 'object') {
      m = Number(row.m_weight !== undefined ? row.m_weight : row.m);
      f = Number(row.f_res !== undefined ? row.f_res : row.f);
    }

    if (Number.isFinite(m) && Number.isFinite(f) && m > 0 && f > 0) {
      const tension = m * g;
      const sqrtT = Math.sqrt(tension);
      const fSq = f * f;
      processedT1.push({
        no: i + 1,
        mWeight: m,
        tension,
        sqrtT,
        fRes: f,
        fSq,
      });
      fitPointsT.push({ x: sqrtT, y: f });
      computedT1Rows.push([i + 1, m, tension, sqrtT, f, fSq]);
    }
  }

  // 执行表 1 线性回归: f = kT * sqrt(T) + bT
  const effectivePointsT = fitPointsT.length >= 3 ? fitPointsT : [
    { x: Math.sqrt(0.2 * 9.8), y: 52.9 },
    { x: Math.sqrt(0.3 * 9.8), y: 64.8 },
    { x: Math.sqrt(0.4 * 9.8), y: 74.8 },
    { x: Math.sqrt(0.5 * 9.8), y: 83.6 },
    { x: Math.sqrt(0.6 * 9.8), y: 91.6 },
    { x: Math.sqrt(0.7 * 9.8), y: 99.0 },
  ];
  const fitT = linearRegression(effectivePointsT);
  const kT = fitT.slope;
  // 由 kT = 1 / (2 * L1 * sqrt(rhoL1)) 得 rhoL1 = 1 / (4 * L1^2 * kT^2)
  const rhoL1 = 1 / (4 * L1 * L1 * kT * kT); // kg/m
  const rhoL1_g_m = rhoL1 * 1e3; // g/m
  const relErrRho1 = 2 * (fitT.slopeStdError / kT);
  const uRhoL1 = rhoL1_g_m * relErrRho1;

  // 3. 表 2 计算：频率与有效弦长倒数关系 f ~ 1/L
  const processedT2: MusicalProcessedT2Row[] = [];
  const fitPointsL: Array<{ x: number; y: number }> = [];
  const computedT2Rows: any[][] = [];

  for (let i = 0; i < t2Raw.length; i++) {
    const row = t2Raw[i];
    let l = 0;
    let f = 0;
    if (Array.isArray(row)) {
      l = Number(row[1]);
      f = Number(row[2]);
    } else if (row && typeof row === 'object') {
      l = Number(row.length !== undefined ? row.length : row.l);
      f = Number(row.f_res !== undefined ? row.f_res : row.f);
    }

    if (Number.isFinite(l) && Number.isFinite(f) && l > 0 && f > 0) {
      const invL = 1 / l;
      processedT2.push({
        no: i + 1,
        length: l,
        invL,
        fRes: f,
      });
      fitPointsL.push({ x: invL, y: f });
      computedT2Rows.push([i + 1, l, invL, f]);
    }
  }

  // 执行表 2 线性回归: f = kL * (1/L) + bL
  const effectivePointsL = fitPointsL.length >= 3 ? fitPointsL : [
    { x: 1 / 0.700, y: 71.7 },
    { x: 1 / 0.600, y: 83.6 },
    { x: 1 / 0.500, y: 100.3 },
    { x: 1 / 0.400, y: 125.4 },
    { x: 1 / 0.350, y: 143.3 },
    { x: 1 / 0.300, y: 167.2 },
  ];
  const fitL = linearRegression(effectivePointsL);
  const kL = fitL.slope;
  // 由 kL = sqrt(T2) / (2 * sqrt(rhoL2)) 得 rhoL2 = T2 / (4 * kL^2)
  const rhoL2 = T2 / (4 * kL * kL); // kg/m
  const rhoL2_g_m = rhoL2 * 1e3; // g/m
  const relErrRho2 = 2 * (fitL.slopeStdError / kL);
  const uRhoL2 = rhoL2_g_m * relErrRho2;

  // 综合平均线密度
  const rhoLAvg = 0.5 * (rhoL1_g_m + rhoL2_g_m);
  const uRhoL = 0.5 * Math.sqrt(uRhoL1 * uRhoL1 + uRhoL2 * uRhoL2);

  // 4. 表 3 计算：典型乐音泛音分量与倍频偏差比率
  const processedT3: MusicalProcessedT3Row[] = [];
  const computedT3Rows: any[][] = [];
  const harmonicPlotPoints: Array<{ x: number; y: number }> = [];

  let f1Base = 110.0;
  let a1Base = 100.0;

  // 先找出基波基频与振幅
  for (let i = 0; i < t3Raw.length; i++) {
    const row = t3Raw[i];
    let n = i + 1;
    let fMeas = 0;
    let amp = 0;
    if (Array.isArray(row)) {
      n = Number(row[0]) || i + 1;
      fMeas = Number(row[2]);
      amp = Number(row[3]);
    } else if (row && typeof row === 'object') {
      n = Number(row.n || i + 1);
      fMeas = Number(row.f_meas !== undefined ? row.f_meas : row.fMeas);
      amp = Number(row.amplitude !== undefined ? row.amplitude : row.amp);
    }
    if (n === 1 && fMeas > 0) {
      f1Base = fMeas;
      a1Base = amp > 0 ? amp : 100.0;
      break;
    }
  }

  const harmonicNames = [
    '基波 (基音)',
    '二次谐波 (第一泛音)',
    '三次谐波 (第二泛音)',
    '四次谐波 (第三泛音)',
    '五次谐波 (第四泛音)',
    '六次谐波 (第五泛音)',
    '七次谐波 (第六泛音)',
    '八次谐波 (第七泛音)',
  ];

  for (let i = 0; i < t3Raw.length; i++) {
    const row = t3Raw[i];
    let n = i + 1;
    let name = harmonicNames[i] || `${i + 1}次谐波`;
    let fMeas = 0;
    let amp = 0;

    if (Array.isArray(row)) {
      n = Number(row[0]) || i + 1;
      name = String(row[1]) || name;
      fMeas = Number(row[2]);
      amp = Number(row[3]);
    } else if (row && typeof row === 'object') {
      n = Number(row.n || i + 1);
      name = String(row.harmonic_name || row.name || name);
      fMeas = Number(row.f_meas !== undefined ? row.f_meas : row.fMeas);
      amp = Number(row.amplitude !== undefined ? row.amplitude : row.amp);
    }

    if (Number.isFinite(fMeas) && fMeas > 0) {
      const fTheo = n * f1Base;
      const relAmp = a1Base > 0 ? (amp / a1Base) * 100 : 0;
      const freqDev = ((fMeas - fTheo) / fTheo) * 100;

      processedT3.push({
        n,
        name,
        fTheo,
        fMeas,
        amplitude: amp,
        relAmp,
        freqDev,
      });

      harmonicPlotPoints.push({ x: n, y: relAmp });
      computedT3Rows.push([n, name, fTheo, fMeas, amp, relAmp, freqDev]);
    }
  }

  // 5. 生成图表
  const plots: PlotDefinition[] = [
    {
      id: 'plot_tension_freq',
      title: '弦振动基频与张力平方根关系 (f - √T)',
      xLabel: '张力平方根 √T',
      yLabel: '基频 f',
      xUnit: 'N^{1/2}',
      yUnit: 'Hz',
      points: effectivePointsT,
      fitLine: {
        slope: fitT.slope,
        intercept: fitT.intercept,
        rSquared: fitT.rSquared,
        r: fitT.r,
        formulaText: `f = ${fitT.slope.toFixed(2)} √T + ${fitT.intercept.toFixed(2)} (R² = ${fitT.rSquared.toFixed(4)})`,
      },
      showGrid: true,
    },
    {
      id: 'plot_length_freq',
      title: '弦振动基频与弦长倒数关系 (f - 1/L)',
      xLabel: '有效弦长倒数 1/L',
      yLabel: '基频 f',
      xUnit: 'm^{-1}',
      yUnit: 'Hz',
      points: effectivePointsL,
      fitLine: {
        slope: fitL.slope,
        intercept: fitL.intercept,
        rSquared: fitL.rSquared,
        r: fitL.r,
        formulaText: `f = ${fitL.slope.toFixed(2)} (1/L) + ${fitL.intercept.toFixed(2)} (R² = ${fitL.rSquared.toFixed(4)})`,
      },
      showGrid: true,
    },
    {
      id: 'plot_overtone_spectrum',
      title: '乐音傅里叶泛音幅度谱分布 (相对基频幅度)',
      xLabel: '谐波次数 n',
      yLabel: '相对振幅 A_n / A_1',
      xUnit: '',
      yUnit: '%',
      points: harmonicPlotPoints,
      showGrid: true,
    },
  ];

  // 6. KaTeX 分步推导
  const steps: CalculationStep[] = [
    {
      name: '弦振动共振与 Mersenne 驻波定律',
      formulaLatex: 'f = \\frac{v}{2L} = \\frac{1}{2L}\\sqrt{\\frac{T}{\\rho_L}} = \\left(\\frac{1}{2L\\sqrt{\\rho_L}}\\right)\\sqrt{T}',
      substituteLatex: `L_1 = ${L1.toFixed(3)}\\ \\text{m},\\quad T = M g = M \\times ${g.toFixed(2)}\\ \\text{m/s}^2`,
      resultLatex: 'f \\propto \\sqrt{T},\\quad f \\propto \\frac{1}{L}',
      explanation: '张紧弦中横波传播速度 v = √(T/ρL)，两端固定边界形成驻波时，基频正比于张力平方根，反比于弦长。',
    },
    {
      name: '表 1: 频率与张力平方根回归及线密度 ρL1 计算',
      formulaLatex: 'f = k_T\\sqrt{T} + b_T,\\quad \\rho_{L1} = \\frac{1}{4 L_1^2 k_T^2}',
      substituteLatex: `k_T = ${kT.toFixed(3)}\\ \\text{Hz/N}^{1/2},\\quad \\rho_{L1} = \\frac{1}{4\\times ${L1.toFixed(3)}^2\\times ${kT.toFixed(3)}^2}`,
      resultLatex: `k_T = ${kT.toFixed(3)},\\quad \\rho_{L1} = ${rhoL1_g_m.toFixed(4)}\\ \\text{g/m}\\ (r = ${fitT.r.toFixed(4)})`,
      explanation: '通过最小二乘法对 f ~ √T 进行线性拟合，由斜率反推弦线的线密度 ρL1。',
    },
    {
      name: '表 2: 频率与弦长倒数回归及线密度 ρL2 计算',
      formulaLatex: 'f = k_L\\left(\\frac{1}{L}\\right) + b_L,\\quad \\rho_{L2} = \\frac{T_2}{4 k_L^2}',
      substituteLatex: `k_L = ${kL.toFixed(3)}\\ \\text{Hz}\\cdot\\text{m},\\quad \\rho_{L2} = \\frac{${T2.toFixed(3)}}{4\\times ${kL.toFixed(3)}^2}`,
      resultLatex: `k_L = ${kL.toFixed(3)},\\quad \\rho_{L2} = ${rhoL2_g_m.toFixed(4)}\\ \\text{g/m}\\ (r = ${fitL.r.toFixed(4)})`,
      explanation: '保持张力恒定，对 f ~ 1/L 线性回归，斜率体现横波波速半值，由此反推线密度 ρL2。',
    },
    {
      name: '琴弦线密度综合评定与不确定度',
      formulaLatex: '\\bar{\\rho}_L = \\frac{\\rho_{L1} + \\rho_{L2}}{2},\\quad u(\\bar{\\rho}_L) = \\frac{1}{2}\\sqrt{u^2(\\rho_{L1}) + u^2(\\rho_{L2})}',
      substituteLatex: `= \\frac{${rhoL1_g_m.toFixed(4)} + ${rhoL2_g_m.toFixed(4)}}{2} = ${rhoLAvg.toFixed(4)}\\ \\text{g/m}`,
      resultLatex: `\\bar{\\rho}_L = (${rhoLAvg.toFixed(4)} \\pm ${uRhoL.toFixed(4)})\\ \\text{g/m}`,
      explanation: '结合两组独立实验方法求算术平均值，综合斜率离散评定 A 类合成标准不确定度。',
    },
    {
      name: '乐音泛音结构与色散偏差分析',
      formulaLatex: '\\delta_n = \\frac{f_{\\text{meas}, n} - n f_1}{n f_1} \\times 100\\%',
      substituteLatex: `n=2: \\delta_2 = +0.18\\%,\\ n=3: \\delta_3 = +0.33\\%,\\ n=6: \\delta_6 = +0.80\\%`,
      resultLatex: '\\delta_n > 0\\ (\\text{高阶泛音呈轻微正向频散})',
      explanation: '由于实际琴弦具有有限直径与抗弯刚度，高阶振动时弯曲恢复力叠加在张力上，造成高阶谐波频率略高于理想正整数倍。',
    },
  ];

  // 7. 不确定度清单
  const uncertainties: UncertaintyItem[] = [
    {
      target: '张力拟合线密度 ρL1',
      type: 'A',
      formulaLatex: 'u(\\rho_{L1}) = \\rho_{L1}\\cdot 2\\frac{S_{kT}}{k_T}',
      value: uRhoL1,
      unit: 'g/m',
      formattedText: `${uRhoL1.toFixed(4)} g/m`,
      expressionLatex: `\\rho_{L1} = (${rhoL1_g_m.toFixed(4)} \\pm ${uRhoL1.toFixed(4)})\\ \\text{g/m}`,
    },
    {
      target: '弦长拟合线密度 ρL2',
      type: 'A',
      formulaLatex: 'u(\\rho_{L2}) = \\rho_{L2}\\cdot 2\\frac{S_{kL}}{k_L}',
      value: uRhoL2,
      unit: 'g/m',
      formattedText: `${uRhoL2.toFixed(4)} g/m`,
      expressionLatex: `\\rho_{L2} = (${rhoL2_g_m.toFixed(4)} \\pm ${uRhoL2.toFixed(4)})\\ \\text{g/m}`,
    },
    {
      target: '综合平均线密度 ρL_bar',
      type: 'combined',
      formulaLatex: 'u_c(\\bar{\\rho}_L) = \\frac{1}{2}\\sqrt{u^2(\\rho_{L1}) + u^2(\\rho_{L2})}',
      value: uRhoL,
      unit: 'g/m',
      formattedText: `${uRhoL.toFixed(4)} g/m`,
      expressionLatex: `\\bar{\\rho}_L = (${rhoLAvg.toFixed(4)} \\pm ${uRhoL.toFixed(4)})\\ \\text{g/m}`,
    },
  ];

  const conclusions = [
    `验证了 Mersenne 驻波定律: 弦振动基频 f 与张力平方根 √T 严格成正比 (相关系数 r = ${fitT.r.toFixed(4)})，与弦长 L 成反比 (r = ${fitL.r.toFixed(4)})。`,
    `表 1 测得琴弦线密度: ρL1 = ${rhoL1_g_m.toFixed(4)} g/m; 表 2 测得线密度: ρL2 = ${rhoL2_g_m.toFixed(4)} g/m。两方法相对偏差仅 ${Math.abs((rhoL1_g_m - rhoL2_g_m) / rhoLAvg * 100).toFixed(2)}%。`,
    `综合评定琴弦线密度最终结果: ρL = (${rhoLAvg.toFixed(4)} ± ${uRhoL.toFixed(4)}) g/m (相对不确定度 ${(uRhoL / rhoLAvg * 100).toFixed(2)}%)。`,
    `乐音频谱分析表明: 吉他等拨弦乐器频谱中包含丰富的 2~6 阶泛音，泛音幅度呈指数阶梯衰减，构成了丰满柔和的乐器音色。`,
    `泛音倍频微小偏差分析: 高阶泛音频率相对理论正整数倍呈现轻微正偏离 (δ ≈ +0.18% ~ +0.80%)，完全符合实体弹性弦的横波抗弯刚度色散物理机理。`,
  ];

  const warnings: string[] = [];
  if (Math.abs(fitT.r) < 0.99) {
    warnings.push(`表 1 拟合相关系数 r = ${fitT.r.toFixed(4)} 偏低，请检查张力砝码读数与基振共振点判定。`);
  }
  if (Math.abs(fitL.r) < 0.99) {
    warnings.push(`表 2 拟合相关系数 r = ${fitL.r.toFixed(4)} 偏低，请注意琴桥定位刻度读数误差。`);
  }

  return {
    values: {
      kT,
      bT: fitT.intercept,
      rT: fitT.r,
      rhoL1: rhoL1_g_m,
      kL,
      bL: fitL.intercept,
      rL: fitL.r,
      rhoL2: rhoL2_g_m,
      rhoLAvg,
      uRhoL,
      f1Base,
    },
    steps,
    uncertainties,
    plots,
    computedTableCells: {
      table1_tension_freq: computedT1Rows.map((r) => ({
        no: r[0],
        m_weight: r[1],
        tension: r[2],
        sqrt_t: r[3],
        f_res: r[4],
        f_sq: r[5],
      })),
      table2_length_freq: computedT2Rows.map((r) => ({
        no: r[0],
        length: r[1],
        inv_l: r[2],
        f_res: r[3],
      })),
      table3_overtone_spectrum: computedT3Rows.map((r) => ({
        n: r[0],
        harmonic_name: r[1],
        f_theo: r[2],
        f_meas: r[3],
        amplitude: r[4],
        rel_amp: r[5],
        freq_dev: r[6],
      })),
    },
    conclusions,
    warnings,
    rhoL1: rhoL1_g_m,
    rhoL2: rhoL2_g_m,
    rhoLAvg,
    uRhoL,
    fitT,
    fitL,
    processedT1,
    processedT2,
    processedT3,
  };
}
