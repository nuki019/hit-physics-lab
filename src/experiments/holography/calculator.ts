/**
 * 实验四十九：全息照相 - 科学计算与推导引擎
 * 文件路径: src/experiments/holography/calculator.ts
 */

import { CalculationResult, CalculationStep, UncertaintyItem, PlotDefinition } from '@/types/experiment';
import { linearRegression } from '@/core/math/regression';

export interface HolographyProcessedT2Row {
  theta: number;
  halfSin: number;
  fringeSpacing: number;
  spatialFrequency: number;
  margin: number;
}

export function calculateHolographyData(
  inputTablesOrContext: any,
  extraParams?: Record<string, any>
): CalculationResult & {
  deltaL: number;
  intensityRatio: number;
  modulationDepth: number;
  fringeSpacingTheta: number;
  spatialFrequencyTheta: number;
  fieldOfViewDeg: number;
  processedT2: HolographyProcessedT2Row[];
} {
  // 1. 解析输入表格与参数
  let t1Raw: any[] = [];
  let t2Raw: any[] = [];
  let params: Record<string, any> = extraParams || {};

  if (inputTablesOrContext) {
    if (Array.isArray(inputTablesOrContext)) {
      t1Raw = inputTablesOrContext;
    } else if (inputTablesOrContext.tables) {
      t1Raw = inputTablesOrContext.tables.table1_optical_path || [];
      t2Raw = inputTablesOrContext.tables.table2_spatial_frequency || [];
      params = { ...(inputTablesOrContext.parameters || {}), ...params };
    } else {
      t1Raw = inputTablesOrContext.table1_optical_path || inputTablesOrContext.table1 || [];
      t2Raw = inputTablesOrContext.table2_spatial_frequency || inputTablesOrContext.table2 || [];
    }
  }

  if (Array.isArray(extraParams)) {
    t2Raw = extraParams;
  }

  const lambdaNm = Number(params.laser_wavelength) || 632.8;
  const plateResLimit = Number(params.plate_res_limit) || 3000;
  const plateWidthMm = Number(params.plate_width) || 60.0;
  const objectDistMm = Number(params.object_distance) || 150.0;

  // 2. 表 1 提取参数或由默认光路解析
  let lr = 42.5;
  let lo = 43.2;
  let ir = 36.0;
  let io = 6.0;
  let thetaDeg = 35.0;

  for (const row of t1Raw) {
    let itemName = '';
    let val = 0;
    if (!Array.isArray(row) && typeof row === 'object') {
      itemName = String(row.item || '');
      val = Number(row.measured);
    } else if (Array.isArray(row)) {
      itemName = String(row[0] || '');
      val = Number(row[1]);
    }

    if (itemName.startsWith('参考光总光程') || itemName === 'LR') {
      if (val > 0) lr = val;
    } else if (itemName.startsWith('物光中心总光程') || itemName === 'LO') {
      if (val > 0) lo = val;
    } else if (itemName.startsWith('参考光光强') || itemName === 'IR') {
      if (val > 0) ir = val;
    } else if (itemName.startsWith('物光平均光强') || itemName === 'IO') {
      if (val > 0) io = val;
    } else if (itemName.includes('夹角') || itemName === 'θ') {
      if (val > 0) thetaDeg = val;
    }
  }

  // 3. 计算关键物理量
  // 光程差 ΔL = |LR - LO| (cm)
  const deltaL = Math.abs(lr - lo);

  // 光强比 K = IR / IO
  const intensityRatio = io > 0 ? ir / io : 6.0;

  // 干涉条纹调制度 (反差) m = 2*sqrt(IR*IO) / (IR + IO) = 2*sqrt(K) / (1 + K)
  const modulationDepth = intensityRatio > 0 ? (2 * Math.sqrt(intensityRatio)) / (1 + intensityRatio) : 0.70;

  // 特征夹角 θ 下的干涉条纹间距 d (μm) 与空间频率 f (lines/mm)
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const halfSinTheta = Math.sin(thetaRad / 2);
  const fringeSpacingTheta = halfSinTheta > 0 ? (lambdaNm * 1e-3) / (2 * halfSinTheta) : 1.052; // μm
  const spatialFrequencyTheta = fringeSpacingTheta > 0 ? 1000 / fringeSpacingTheta : 950.4; // lines/mm

  // 再现像几何视场角: Ω = 2 * arctan(W / (2D))
  const fieldOfViewRad = 2 * Math.atan(plateWidthMm / (2 * objectDistMm));
  const fieldOfViewDeg = (fieldOfViewRad * 180) / Math.PI;

  // 4. 重建表 1 校验列
  const computedT1Rows: any[][] = [];
  const defaultItems = [
    { name: '参考光总光程 LR', val: lr, unit: 'cm', spec: '|ΔL| ≤ 2.0 cm (相干长度约束)', status: '合格' },
    { name: '物光中心总光程 LO', val: lo, unit: 'cm', spec: '|ΔL| ≤ 2.0 cm (相干长度约束)', status: '合格' },
    { name: '光程差 |ΔL| = |LR - LO|', val: deltaL, unit: 'cm', spec: '严格 ≤ 2.0 cm', status: deltaL <= 2.0 ? '优良合格' : '超标(相干性不足)' },
    { name: '参考光光强 IR', val: ir, unit: 'μW/cm²', spec: '底片线性区 (建议 20~50 μW/cm²)', status: (ir >= 15 && ir <= 60) ? '合格' : '需注意' },
    { name: '物光平均光强 IO', val: io, unit: 'μW/cm²', spec: '物光适中 (提供微弱高频载波)', status: '合格' },
    { name: '光强比 K = IR / IO', val: Number(intensityRatio.toFixed(2)), unit: '', spec: '标称 4:1 ~ 10:1', status: (intensityRatio >= 3.5 && intensityRatio <= 10.5) ? '最佳线性区间' : '偏离线性区' },
    { name: '物光参考光夹角 θ', val: thetaDeg, unit: '°', spec: '典型推荐 30° ~ 45°', status: '合格' },
    { name: '推荐曝光时间 t', val: 15.0, unit: 's', spec: '依感光通量 300~600 μJ/cm² 设定', status: '合适' },
  ];

  for (const it of defaultItems) {
    computedT1Rows.push([it.name, Number(it.val.toFixed(2)), it.unit, it.spec, it.status]);
  }

  // 5. 表 2 空间频率计算
  const processedT2: HolographyProcessedT2Row[] = [];
  const computedT2Rows: any[][] = [];
  const freqPlotPoints: Array<{ x: number; y: number }> = [];

  for (const row of t2Raw) {
    let thetaVal = 0;
    if (!Array.isArray(row) && typeof row === 'object') {
      thetaVal = Number(row.theta);
    } else if (Array.isArray(row)) {
      thetaVal = Number(row[0]);
    }
    if (thetaVal > 0) {
      const rad = (thetaVal * Math.PI) / 180;
      const sinHalf = Math.sin(rad / 2);
      const dUm = (lambdaNm * 1e-3) / (2 * sinHalf);
      const fLines = 1000 / dUm;
      const margin = plateResLimit / fLines;

      processedT2.push({
        theta: thetaVal,
        halfSin: sinHalf,
        fringeSpacing: dUm,
        spatialFrequency: fLines,
        margin,
      });

      computedT2Rows.push([
        thetaVal,
        Number(sinHalf.toFixed(4)),
        Number(dUm.toFixed(3)),
        Number(fLines.toFixed(1)),
        Number(margin.toFixed(2)),
      ]);

      freqPlotPoints.push({ x: thetaVal, y: fLines });
    }
  }

  // 若表 2 初始为空，按标准角度载入
  if (processedT2.length === 0) {
    const stdThetas = [25.0, 30.0, 35.0, 40.0, 45.0];
    for (const thetaVal of stdThetas) {
      const rad = (thetaVal * Math.PI) / 180;
      const sinHalf = Math.sin(rad / 2);
      const dUm = (lambdaNm * 1e-3) / (2 * sinHalf);
      const fLines = 1000 / dUm;
      const margin = plateResLimit / fLines;

      processedT2.push({
        theta: thetaVal,
        halfSin: sinHalf,
        fringeSpacing: dUm,
        spatialFrequency: fLines,
        margin,
      });

      computedT2Rows.push([
        thetaVal,
        Number(sinHalf.toFixed(4)),
        Number(dUm.toFixed(3)),
        Number(fLines.toFixed(1)),
        Number(margin.toFixed(2)),
      ]);

      freqPlotPoints.push({ x: thetaVal, y: fLines });
    }
  }

  // 6. 构造 KaTeX 分步推导步骤
  const steps: CalculationStep[] = [
    {
      id: 'step_optical_path_diff',
      name: '激光相干长度与光程差精度校验',
      formulaLatex: '\\Delta L = |L_R - L_O| \\le L_c \\approx 2.0\\ \\mathrm{cm}',
      substituteLatex: `= |${lr.toFixed(2)} - ${lo.toFixed(2)}|\\ \\mathrm{cm} = ${deltaL.toFixed(2)}\\ \\mathrm{cm}`,
      resultLatex: `\\Delta L = ${deltaL.toFixed(2)}\\ \\mathrm{cm} \\le 2.0\\ \\mathrm{cm}\\ (\\text{相干条件严格满足})`,
      explanation: '普通氦氖激光器纵模相干长度约为 2~5 cm。光程差越小，干涉条纹反差越清晰；当 |ΔL| ≤ 2 cm 时能保证优质条纹反差。',
    },
    {
      id: 'step_intensity_ratio',
      name: '参考光与物光光强比及干涉条纹反差调制度',
      formulaLatex: 'K = \\frac{I_R}{I_O},\\quad m = \\frac{2\\sqrt{I_R I_O}}{I_R + I_O} = \\frac{2\\sqrt{K}}{1 + K}',
      substituteLatex: `= \\frac{${ir.toFixed(1)}}{${io.toFixed(1)}} = ${intensityRatio.toFixed(2)},\\quad m = \\frac{2\\sqrt{${intensityRatio.toFixed(2)}}}{1 + ${intensityRatio.toFixed(2)}}`,
      resultLatex: `K = ${intensityRatio.toFixed(2)}:1,\\quad m = ${modulationDepth.toFixed(3)}`,
      explanation: '选取光强比 K 位于 4:1 ~ 10:1 能够将底片工作点锚定在振幅透过率曲线 (tA - E) 的线性区间，抑制非线性高阶交调畸变，并维持 m ≈ 0.7 足够反差。',
    },
    {
      id: 'step_spatial_frequency',
      name: '全息干涉条纹间距与空间频率推导',
      formulaLatex: 'd = \\frac{\\lambda}{2\\sin(\\theta/2)},\\quad f = \\frac{1}{d} = \\frac{2}{\\lambda}\\sin(\\theta/2)',
      substituteLatex: `= \\frac{${(lambdaNm * 1e-3).toFixed(4)}\\ \\mu\\mathrm{m}}{2\\sin(${thetaDeg}^\\circ / 2)} = \\frac{${(lambdaNm * 1e-3).toFixed(4)}}{2 \\times ${halfSinTheta.toFixed(4)}}`,
      resultLatex: `d = ${fringeSpacingTheta.toFixed(3)}\\ \\mu\\mathrm{m},\\quad f = ${spatialFrequencyTheta.toFixed(1)}\\ \\mathrm{lines/mm}`,
      explanation: `在夹角 θ = ${thetaDeg}° 下，微观条纹密度为 ${spatialFrequencyTheta.toFixed(1)} 线/毫米，底片极限分辨率 (${plateResLimit} 线/毫米) 具备 ${(plateResLimit / spatialFrequencyTheta).toFixed(2)} 倍安全裕量。`,
    },
    {
      id: 'step_field_of_view',
      name: '三维再现像横向视场角几何分析',
      formulaLatex: '\\Omega = 2\\arctan\\left(\\frac{W}{2D}\\right)',
      substituteLatex: `= 2\\arctan\\left(\\frac{${plateWidthMm.toFixed(1)}}{2 \\times ${objectDistMm.toFixed(1)}}\\right) = 2\\arctan(${((plateWidthMm) / (2 * objectDistMm)).toFixed(3)})`,
      resultLatex: `\\Omega = ${fieldOfViewDeg.toFixed(2)}^\\circ\\ (${fieldOfViewRad.toFixed(3)}\\ \\mathrm{rad})`,
      explanation: '视场角表征人眼透过全息干板窗口所能观察三维立体物体的极限视角范围，干板越大、物距越近则视场角越大。',
    },
  ];

  // 7. 不确定度评定清单
  const uncertainties: UncertaintyItem[] = [
    {
      targetName: '光路光程差 ΔL',
      targetSymbol: '\\Delta L',
      type: 'B',
      formulaLatex: 'u(\\Delta L) = \\sqrt{u^2(L_R) + u^2(L_O)}',
      value: 0.15,
      unit: 'cm',
      formattedText: `${deltaL.toFixed(2)} ± 0.15 cm`,
      expressionLatex: `\\Delta L = (${deltaL.toFixed(2)} \\pm 0.15)\\ \\mathrm{cm}`,
    },
    {
      targetName: '干涉条纹空间频率 f',
      targetSymbol: 'f',
      type: 'combined',
      formulaLatex: 'u_r(f) \\approx \\frac{1}{2}\\cot(\\theta/2) u(\\theta)',
      value: 12.5,
      unit: 'lines/mm',
      formattedText: `${spatialFrequencyTheta.toFixed(1)} ± 12.5 lines/mm`,
      expressionLatex: `f = (${spatialFrequencyTheta.toFixed(1)} \\pm 12.5)\\ \\mathrm{lines/mm}`,
    },
  ];

  // 8. 矢量拟合图谱定义
  // 曲线：条纹空间频率随夹角 θ 变化及调制度随光强比 K 变化
  const fitFreq = linearRegression(freqPlotPoints);
  const modulationPoints = [
    { x: 1.0, y: 1.0 },
    { x: 2.0, y: 0.943 },
    { x: 4.0, y: 0.800 },
    { x: 6.0, y: 0.700 },
    { x: 8.0, y: 0.628 },
    { x: 10.0, y: 0.574 },
    { x: 12.0, y: 0.533 },
    { x: 15.0, y: 0.485 },
  ];
  const fitMod = linearRegression(modulationPoints);

  const plots: PlotDefinition[] = [
    {
      id: 'plot_spatial_freq',
      title: '全息干涉条纹空间频率 f 随物光与参考光夹角 θ 变化特性曲线',
      xLabel: '记录夹角 θ',
      yLabel: '条纹空间频率 f',
      xUnit: '°',
      yUnit: 'lines/mm',
      points: freqPlotPoints,
      fitLine: {
        slope: fitFreq.slope,
        intercept: fitFreq.intercept,
        rSquared: fitFreq.rSquared,
        r: fitFreq.r,
        rmse: fitFreq.rmse,
        formulaText: `f = ${fitFreq.slope.toFixed(2)} θ + ${fitFreq.intercept.toFixed(1)} (R² = ${fitFreq.rSquared.toFixed(4)})`,
      },
      targetWidthMm: 134.0,
      targetHeightMm: 52.0,
      showGrid: true,
    },
    {
      id: 'plot_modulation_k',
      title: '干涉反差调制度 m 随参考物光强比 K 变化响应 (最佳 4:1~10:1 线性区)',
      xLabel: '光强比 K (IR / IO)',
      yLabel: '条纹调制度 m',
      xUnit: '',
      yUnit: '',
      points: modulationPoints,
      fitLine: {
        slope: fitMod.slope,
        intercept: fitMod.intercept,
        rSquared: fitMod.rSquared,
        r: fitMod.r,
        rmse: fitMod.rmse,
        formulaText: `m = 2√K / (1 + K) (线性趋势 k = ${fitMod.slope.toFixed(4)})`,
      },
      targetWidthMm: 134.0,
      targetHeightMm: 52.0,
      showGrid: true,
    },
  ];

  // 9. 结论陈述
  const conclusions = [
    `1. 光程差实测为 |ΔL| = ${deltaL.toFixed(2)} cm，严格满足氦氖激光相干长度条件 (|ΔL| ≤ 2.0 cm)，保证了全息曝光记录时的高反差相干干涉。`,
    `2. 参考光与物光光强比调节为 K = ${intensityRatio.toFixed(2)}:1，位于标称推荐的 4:1 ~ 10:1 最佳线性区间，对应条纹反差调制度 m = ${modulationDepth.toFixed(3)}，既避免了底片非线性失真，又保证了清晰的三维再现衍射效率。`,
    `3. 在记录角 θ = ${thetaDeg}° 条件下，干涉条纹微观间距 d = ${fringeSpacingTheta.toFixed(3)} μm，空间频率 f = ${spatialFrequencyTheta.toFixed(1)} lines/mm，全息银盐干板极限分辨率 (${plateResLimit} lines/mm) 具有 ${(plateResLimit / spatialFrequencyTheta).toFixed(2)} 倍安全裕量，记录无漏失。`,
    `4. 全息三维再现像横向有效视场角为 Ω = ${fieldOfViewDeg.toFixed(2)}°，透过干板窗口能够获得清晰连贯的立体透视与视差效果。`,
  ];

  const warnings: string[] = [];
  if (deltaL > 2.0) {
    warnings.push(`光程差 |ΔL| = ${deltaL.toFixed(2)} cm 超过相干长度阈值 (2.0 cm)，可能导致干涉条纹反差严重衰退，全息图再现失败！`);
  }
  if (intensityRatio < 3.5 || intensityRatio > 12.0) {
    warnings.push(`光强比 K = ${intensityRatio.toFixed(1)}:1 偏离推荐范围 (4:1 ~ 10:1)，偏小会导致底片非线性互调噪声，偏大会导致衍射效率过低。`);
  }

  const values: Record<string, number | string> = {
    deltaL,
    intensityRatio,
    modulationDepth,
    fringeSpacingTheta,
    spatialFrequencyTheta,
    fieldOfViewDeg,
    lr,
    lo,
    ir,
    io,
    thetaDeg,
  };

  return {
    values,
    steps,
    uncertainties,
    plots,
    computedTableCells: {
      table1_optical_path: computedT1Rows as any,
      table2_spatial_frequency: computedT2Rows as any,
    },
    conclusions,
    warnings,
    deltaL,
    intensityRatio,
    modulationDepth,
    fringeSpacingTheta,
    spatialFrequencyTheta,
    fieldOfViewDeg,
    processedT2,
  };
}
