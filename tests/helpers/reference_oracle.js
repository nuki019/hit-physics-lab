/**
 * 哈工大大物实验权威物理计算与数据处理参考预言机 (Reference Oracle)
 * 来源：《大学物理实验(第三版)》教材、哈工大基准 LaTeX 模板及 Python 矢量绘图验证脚本
 */

const CONSTANTS = {
  e_charge: 1.602176634e-19,      // 基本元电荷 (C)
  p_atm_standard: 760,             // 当地标准大气压 (mmHg)
  g_gravity: 9.80,                 // 重力加速度 (m/s^2)
  he_ne_lambda_0: 632.8e-6,        // He-Ne 激光标准波长 (mm) -> 632.8 nm
  sodium_lambda_0: 589.3e-6,       // 钠黄光波长 (mm) -> 589.3 nm
  michelson_lever_ratio: 0.05,     // 迈克耳逊传动比 1:20
  michelson_gas_cell_l: 80.0,      // 气室长度 (mm)
  hall_thickness_d: 0.20e-3,       // 霍尔元件厚度 (m) -> 0.20 mm
  hall_solenoid_ratio: 0.50,       // 励磁定标 B/I_M (mT/mA)
  viscosity_rho_oil: 0.96e3,       // 蓖麻油密度 (kg/m^3)
  viscosity_rho_steel: 7.80e3      // 钢珠密度 (kg/m^3)
};

/**
 * 最小二乘法线性回归
 * y = k * x + b
 */
function linearRegression(points) {
  if (!Array.isArray(points) || points.length < 2) {
    throw new Error('线性拟合至少需要 2 个有效数据点');
  }
  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const pt of points) {
    const x = Number(pt.x !== undefined ? pt.x : pt[0]);
    const y = Number(pt.y !== undefined ? pt.y : pt[1]);
    if (isNaN(x) || isNaN(y)) {
      throw new Error('拟合数据包含非数字值 (NaN)');
    }
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-12) {
    // 垂直线或所有 X 相同
    return {
      slope: Infinity,
      intercept: NaN,
      r: 0,
      rSquared: 0,
      rmse: NaN,
      isVertical: true
    };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // 相关系数 r
  const numR = n * sumXY - sumX * sumY;
  const denR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = denR === 0 ? 1 : numR / denR;
  const rSquared = r * r;

  // 均方根误差 RMSE
  let sse = 0;
  for (const pt of points) {
    const x = Number(pt.x !== undefined ? pt.x : pt[0]);
    const y = Number(pt.y !== undefined ? pt.y : pt[1]);
    const fitY = slope * x + intercept;
    sse += (y - fitY) * (y - fitY);
  }
  const rmse = Math.sqrt(sse / n);

  return {
    slope,
    intercept,
    r,
    rSquared,
    rmse,
    isVertical: false
  };
}

/**
 * 逐差法处理
 * 将序列等分为前后两部分做差
 */
function differenceMethod(series) {
  if (!Array.isArray(series) || series.length < 2) {
    throw new Error('逐差法至少需要偶数长度的数据序列');
  }
  const len = series.length;
  const m = Math.floor(len / 2);
  const diffs = [];
  for (let i = 0; i < m; i++) {
    const d = series[i + m] - series[i];
    diffs.push(d);
  }
  const mean = diffs.reduce((a, b) => a + b, 0) / m;
  return {
    m,
    diffs,
    mean
  };
}

/**
 * 贝塞尔公式计算 A 类不确定度
 * u_A(mean) = sqrt( sum( (x_i - mean)^2 ) / (n * (n - 1)) )
 */
function besselUncertaintyA(values) {
  if (!Array.isArray(values) || values.length < 2) {
    return 0;
  }
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  let sumSq = 0;
  for (const v of values) {
    sumSq += (v - mean) * (v - mean);
  }
  const s = Math.sqrt(sumSq / (n - 1)); // 样本单次测量标准差
  const uA = s / Math.sqrt(n);          // 算术平均值的标准差
  return { mean, s, uA };
}

/**
 * B 类不确定度 (均匀分布)
 */
function bUncertainty(deltaInst, k = Math.sqrt(3)) {
  return deltaInst / k;
}

/**
 * 合成不确定度
 */
function combinedUncertainty(uA, uB) {
  return Math.sqrt(uA * uA + uB * uB);
}

/**
 * 霍尔效应全套参考计算
 */
function calculateHallEffect(table1, table2, table3) {
  // 表 1: U_H ~ I_H
  // table1 每一项: [I_H, UH1, UH2, UH3, UH4]
  const processedT1 = table1.map(row => {
    const [ih, u1, u2, u3, u4] = row;
    const uhBar = 0.25 * (u1 - u2 - u3 + u4);
    return { ih, u1, u2, u3, u4, uhBar };
  });

  const fit1 = linearRegression(processedT1.map(r => ({ x: r.ih, y: r.uhBar })));
  const k1 = fit1.slope; // mV / mA
  const B_t1 = 0.100;    // T (100 mT)
  const KH1 = k1 / B_t1; // V / (A * T)

  // 表 2: U_H ~ B
  // table2 每一项: [IM, B, UH1, UH2]
  const processedT2 = table2.map(row => {
    const [im, b, u1, u2] = row;
    const uBar = 0.5 * (u1 - u2);
    return { im, b, u1, u2, uBar };
  });

  const fit2 = linearRegression(processedT2.map(r => ({ x: r.b, y: r.uBar })));
  const k2 = fit2.slope; // mV / mT
  const IH_t2 = 3.0e-3;  // A (3.0 mA)
  const KH2 = (k2 * 1e-3) / (IH_t2 * 1e-3); // = k2 / 3.0e-3 = V / (A * T)

  const KH_avg = (KH1 + KH2) / 2;
  const d = CONSTANTS.hall_thickness_d;
  const RH = KH_avg * d; // m^3 / C
  const nCarrier = 1 / (RH * CONSTANTS.e_charge); // m^-3

  // 表 3: r ~ UH
  // table3: [ [r, UH], ... ]
  const fit3_r = linearRegression(table3.map(row => ({ x: row[1], y: row[0] }))); // r = k * UH + b
  const fit3_u = linearRegression(table3.map(row => ({ x: row[0], y: row[1] }))); // UH = k * r + b

  return {
    processedT1,
    KH1,
    fit1,
    processedT2,
    KH2,
    fit2,
    KH_avg,
    RH,
    nCarrier,
    kr: fit3_r.slope,
    ku: fit3_u.slope
  };
}

/**
 * 迈克耳逊干涉仪全套参考计算
 */
function calculateMichelson(table1_readings, table2_pressure) {
  // table1_readings: [x1, x2, x3, x4, x5, x6]
  const deltaN = 150;
  const diffResult = differenceMethod(table1_readings); // deltaX_i = x_{i+3} - x_i
  const deltaX_bar = diffResult.mean; // mm
  const deltaD_bar = deltaX_bar * CONSTANTS.michelson_lever_ratio; // mm
  const lambda = (2 * deltaD_bar) / deltaN; // mm
  const lambda_nm = lambda * 1e6;           // nm

  const bessel = besselUncertaintyA(diffResult.diffs);
  const uA_deltaX = bessel.uA; // mm
  const uA_lambda = (uA_deltaX / (10 * deltaN)) * 1e6; // nm

  // 表 2: P ~ N 拟合 -> N = k * P + b
  // table2_pressure: [ [P, N], ... ]
  const fitP = linearRegression(table2_pressure.map(r => ({ x: r[0], y: r[1] })));
  const kP = fitP.slope; // 条 / mmHg
  const l_cell = CONSTANTS.michelson_gas_cell_l; // 80 mm
  const lambda0_mm = CONSTANTS.he_ne_lambda_0;   // 632.8e-6 mm
  const delta_n_atm = (kP * lambda0_mm / (2 * l_cell)) * CONSTANTS.p_atm_standard;
  const n_air = 1 + delta_n_atm;

  return {
    deltaX_bar,
    deltaD_bar,
    lambda_nm,
    uA_lambda,
    kP,
    n_air,
    fitP
  };
}

/**
 * 等厚干涉 (牛顿环与劈尖) 全套参考计算
 */
function calculateNewtonRingsAndWedge(newton_data, wedge_data) {
  // newton_data: [ { m, Dm, Dm_5 }, ... ]
  const diffSq = newton_data.map(item => item.Dm * item.Dm - item.Dm_5 * item.Dm_5);
  const meanDiffSq = diffSq.reduce((a, b) => a + b, 0) / diffSq.length;
  const lambda_mm = CONSTANTS.sodium_lambda_0; // 589.3e-6 mm
  const R_mm = meanDiffSq / (20 * lambda_mm);
  const R_m = R_mm / 1000;

  const bessel = besselUncertaintyA(diffSq);
  const relUncertainty = bessel.uA / meanDiffSq;
  const u_R_m = R_m * relUncertainty;

  // 劈尖测微丝直径: wedge_data = { L: 43.095, l: 1.4656 } (mm)
  // d = (5 * L * lambda) / l
  const d_wire_mm = (5 * wedge_data.L * lambda_mm) / wedge_data.l;
  const d_wire_um = d_wire_mm * 1000;

  return {
    diffSq,
    meanDiffSq,
    R_m,
    u_R_m,
    relUncertainty,
    d_wire_mm,
    d_wire_um
  };
}

/**
 * 实验五 液体黏度的测定参考计算
 */
function calculateLiquidViscosity(ballsData, castorOilData) {
  // ballsData: [ [d1, d2, d3, d4, d5], ... ] 5颗球
  const ballAverages = ballsData.map(readings => readings.reduce((a, b) => a + b, 0) / readings.length);
  const grandAvg_d_mm = ballAverages.reduce((a, b) => a + b, 0) / ballAverages.length;
  const d_m = grandAvg_d_mm * 1e-3; // m

  // castorOilData: [ { temp, L_cm, D_cm, t_s }, ... ]
  const rho = CONSTANTS.viscosity_rho_steel;
  const rho0 = CONSTANTS.viscosity_rho_oil;
  const g = CONSTANTS.g_gravity;

  const results = castorOilData.map(item => {
    const L_m = item.L_cm * 1e-2;
    const D_m = item.D_cm * 1e-2;
    const t = item.t_s;
    const correctionFactor = 1 + 2.4 * (d_m / D_m);
    // eta = (1/18) * (rho - rho0) * g * t * d^2 / (L * correctionFactor)
    const numerator = (rho - rho0) * g * t * d_m * d_m;
    const denominator = 18 * L_m * correctionFactor;
    const eta = numerator / denominator; // Pa * s

    // 雷诺数 Re = (d * (L / t) * rho0) / eta
    const v = L_m / t;
    const Re = (d_m * v * rho0) / eta;

    return {
      temp: item.temp,
      eta,
      Re,
      correctionFactor
    };
  });

  return {
    grandAvg_d_mm,
    results
  };
}

module.exports = {
  CONSTANTS,
  linearRegression,
  differenceMethod,
  besselUncertaintyA,
  bUncertainty,
  combinedUncertainty,
  calculateHallEffect,
  calculateMichelson,
  calculateNewtonRingsAndWedge,
  calculateLiquidViscosity
};
