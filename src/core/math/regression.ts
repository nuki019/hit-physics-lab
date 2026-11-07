/**
 * 最小二乘法线性回归计算模块
 * 文件路径: src/core/math/regression.ts
 */

export interface Point2D {
  x: number;
  y: number;
  label?: string;
  isExcluded?: boolean;
}

export interface RegressionOptions {
  forceOrigin?: boolean;         // 是否强制过原点 (y = kx)
  confidenceLevel?: number;      // 置信水平，默认 0.95
  excludedIndices?: number[];    // 排除的点索引列表
  xRange?: [number, number];     // 自变量拟合范围约束
  throwOnSingular?: boolean;     // 垂直线或奇异时是否抛出异常
}

export interface ConfidenceBandPoint {
  x: number;
  yHat: number;
  yLower: number;
  yUpper: number;
  standardError: number;
}

export interface LinearRegressionResult {
  slope: number;                 // 斜率 k
  intercept: number;             // 截距 b (过原点时恒为 0)
  r: number;                     // 线性相关系数 r
  rSquared: number;              // 决定系数 R^2
  rmse: number;                  // 剩余标准差 / 均方根误差 S_{y/x}
  slopeStdError: number;         // 斜率标准差 S_k
  interceptStdError: number;     // 截距标准差 S_b (过原点时为 0)
  degreesOfFreedom: number;      // 自由度 df (普通回归为 n-2, 过原点为 n-1)
  tCritical: number;             // t 分布临界值 t_{alpha/2, df}
  slopeConfidenceInterval: [number, number];     // 斜率 95% 置信区间 [k_low, k_high]
  interceptConfidenceInterval: [number, number]; // 截距 95% 置信区间 [b_low, b_high]
  residuals: number[];           // 各参与点残差 e_i = y_i - yHat_i
  outlierIndices: number[];      // 检测出的可疑异常点索引 (|e_i*| > 2.5)
  effectivePoints: Point2D[];    // 实际参与拟合的数据点
  isVertical: boolean;           // 是否为垂直线

  getConfidenceBand: (samplesCount?: number, extendRatio?: number) => ConfidenceBandPoint[];
  predict: (x: number) => { y: number; lower: number; upper: number };
}

// Student-t 双侧 alpha=0.05 (95% 置信度) 临界值查找表 (自由度 1 ~ 30)
const STUDENT_T_95_TABLE: Record<number, number> = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
  6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
  11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
  16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
  21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
  26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
};

/**
 * 获取 95% 置信度下的 Student-t 临界值 (高精度查表 + Cornish-Fisher 展开)
 */
export function getStudentTCritical(df: number): number {
  if (df <= 0) return 0;
  if (df <= 30 && STUDENT_T_95_TABLE[df]) {
    return STUDENT_T_95_TABLE[df];
  }
  // 高阶 Cornish-Fisher 展开式 (df > 30 时绝对误差 < 1e-5)
  const z = 1.959963984540054; // 标准正态 0.975 分位数
  const z3 = z * z * z;
  const z5 = z3 * z * z;
  const z7 = z5 * z * z;
  const df2 = df * df;
  const df3 = df2 * df;

  return (
    z +
    (z3 + z) / (4 * df) +
    (5 * z5 + 16 * z3 + 3 * z) / (96 * df2) +
    (3 * z7 + 19 * z5 + 17 * z3 - 15 * z) / (384 * df3)
  );
}

/**
 * 最小二乘线性回归主计算函数
 */
export function linearRegression(
  points: Array<Point2D | [number, number] | { x: number; y: number }>,
  options?: RegressionOptions
): LinearRegressionResult {
  if (!Array.isArray(points) || points.length < 2) {
    throw new Error('线性拟合至少需要 2 个有效数据点');
  }

  const forceOrigin = options?.forceOrigin ?? false;
  const excludedSet = new Set(options?.excludedIndices || []);
  const xRange = options?.xRange;

  // 1. 过滤与转换点集
  const rawPoints: Point2D[] = [];
  points.forEach((pt, idx) => {
    if (excludedSet.has(idx)) return;

    let x: number, y: number, label: string | undefined;
    if (Array.isArray(pt)) {
      x = Number(pt[0]);
      y = Number(pt[1]);
    } else {
      x = Number(pt.x);
      y = Number(pt.y);
      const pointObj = pt as Point2D;
      label = pointObj.label;
      if (pointObj.isExcluded) return;
    }

    if (Number.isNaN(x) || Number.isNaN(y)) {
      throw new Error('拟合数据包含非数字值 (NaN)');
    }

    if (xRange) {
      if (x < xRange[0] || x > xRange[1]) return;
    }

    rawPoints.push({ x, y, label });
  });

  const n = rawPoints.length;
  if (n < 2) {
    throw new Error('经过条件筛选后，有效拟合点数少于 2 个');
  }

  // 2. 第一遍：计算均值与基础和
  let sumX = 0;
  let sumY = 0;
  let sumX2 = 0;
  let sumY2 = 0;
  let sumXY = 0;

  for (let i = 0; i < n; i++) {
    const p = rawPoints[i];
    sumX += p.x;
    sumY += p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
    sumXY += p.x * p.y;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  // 3. 第二遍：双遍中心化离差计算 (防止灾难性抵消)
  let Sxx = 0;
  let Syy = 0;
  let Sxy = 0;

  for (let i = 0; i < n; i++) {
    const dx = rawPoints[i].x - meanX;
    const dy = rawPoints[i].y - meanY;
    Sxx += dx * dx;
    Syy += dy * dy;
    Sxy += dx * dy;
  }

  // 4. 垂直线与奇异边界处理
  const xSpan = rawPoints.reduce((max, p) => Math.max(max, p.x), -Infinity) -
                rawPoints.reduce((min, p) => Math.min(min, p.x), Infinity);
  const isSingular = Sxx === 0 || xSpan === 0 || (sumX2 > 0 && Sxx / sumX2 < 1e-24);
  if (isSingular) {
    if (options?.throwOnSingular) {
      throw new Error('自变量取值不可全部相同 (SingularMatrixError)');
    }
    return {
      slope: Infinity,
      intercept: NaN,
      r: 0,
      rSquared: 0,
      rmse: NaN,
      slopeStdError: NaN,
      interceptStdError: NaN,
      degreesOfFreedom: 0,
      tCritical: NaN,
      slopeConfidenceInterval: [NaN, NaN],
      interceptConfidenceInterval: [NaN, NaN],
      residuals: rawPoints.map(() => 0),
      outlierIndices: [],
      effectivePoints: rawPoints,
      isVertical: true,
      getConfidenceBand: () => [],
      predict: (x) => ({ y: x, lower: x, upper: x }),
    };
  }

  let slope = 0;
  let intercept = 0;
  let df = 0;
  let rmse = 0;
  let slopeStdError = 0;
  let interceptStdError = 0;
  let r = 0;
  let rSquared = 0;

  if (forceOrigin) {
    // 固定过原点回归: y = kx
    slope = sumXY / sumX2;
    intercept = 0;
    df = Math.max(1, n - 1);

    let sse = 0;
    for (let i = 0; i < n; i++) {
      const e = rawPoints[i].y - slope * rawPoints[i].x;
      sse += e * e;
    }
    rmse = Math.sqrt(sse / df);
    slopeStdError = rmse / Math.sqrt(sumX2);
    interceptStdError = 0;

    rSquared = sumY2 > 0 ? 1 - sse / sumY2 : 1;
    r = sumX2 > 0 && sumY2 > 0 ? sumXY / Math.sqrt(sumX2 * sumY2) : 1;
  } else {
    // 普通最小二乘: y = kx + b
    slope = Sxy / Sxx;
    intercept = meanY - slope * meanX;
    df = Math.max(0, n - 2);

    let sse = 0;
    for (let i = 0; i < n; i++) {
      const fitY = slope * rawPoints[i].x + intercept;
      const e = rawPoints[i].y - fitY;
      sse += e * e;
    }

    if (df > 0) {
      rmse = Math.sqrt(sse / df);
      slopeStdError = rmse / Math.sqrt(Sxx);
      interceptStdError = rmse * Math.sqrt(1 / n + (meanX * meanX) / Sxx);
    } else {
      rmse = 0;
      slopeStdError = 0;
      interceptStdError = 0;
    }

    if (Sxx > 0 && Syy > 0) {
      r = Sxy / Math.sqrt(Sxx * Syy);
      rSquared = r * r;
    } else {
      // 当 Syy = 0 (水平线) 或 Sxx = 0 时，自变量与因变量无协方差，相关系数定义为 0
      r = 0;
      rSquared = 0;
    }
  }

  // 5. 95% 置信区间
  const tCritical = df > 0 ? getStudentTCritical(df) : 0;
  const slopeCI: [number, number] = [
    slope - tCritical * slopeStdError,
    slope + tCritical * slopeStdError,
  ];
  const interceptCI: [number, number] = [
    intercept - tCritical * interceptStdError,
    intercept + tCritical * interceptStdError,
  ];

  // 6. 残差与异常点诊断 (|标准化残差| > 2.5)
  const residuals: number[] = [];
  const outlierIndices: number[] = [];

  for (let i = 0; i < n; i++) {
    const p = rawPoints[i];
    const yHat = slope * p.x + intercept;
    const e = p.y - yHat;
    residuals.push(e);

    if (rmse > 1e-12) {
      const hii = 1 / n + ((p.x - meanX) * (p.x - meanX)) / Sxx;
      const denominator = rmse * Math.sqrt(Math.max(1e-10, 1 - hii));
      const standardizedResidual = e / denominator;
      if (Math.abs(standardizedResidual) > 2.5) {
        outlierIndices.push(i);
      }
    }
  }

  // 7. 预测与置信带生成辅助函数
  const predict = (xVal: number) => {
    const yHat = slope * xVal + intercept;
    let se = 0;
    if (forceOrigin) {
      se = sumX2 > 0 ? (rmse * Math.abs(xVal)) / Math.sqrt(sumX2) : 0;
    } else {
      se = Sxx > 0 ? rmse * Math.sqrt(1 / n + ((xVal - meanX) * (xVal - meanX)) / Sxx) : 0;
    }
    const delta = tCritical * se;
    return {
      y: yHat,
      lower: yHat - delta,
      upper: yHat + delta,
    };
  };

  const getConfidenceBand = (samplesCount = 50, extendRatio = 0.05): ConfidenceBandPoint[] => {
    let minX = rawPoints[0].x;
    let maxX = rawPoints[0].x;
    for (let i = 1; i < n; i++) {
      if (rawPoints[i].x < minX) minX = rawPoints[i].x;
      if (rawPoints[i].x > maxX) maxX = rawPoints[i].x;
    }

    const span = maxX - minX || 1;
    const startX = minX - span * extendRatio;
    const endX = maxX + span * extendRatio;
    const step = (endX - startX) / (samplesCount - 1);

    const band: ConfidenceBandPoint[] = [];
    for (let i = 0; i < samplesCount; i++) {
      const currX = startX + i * step;
      const pred = predict(currX);
      let se = 0;
      if (forceOrigin) {
        se = sumX2 > 0 ? (rmse * Math.abs(currX)) / Math.sqrt(sumX2) : 0;
      } else {
        se = Sxx > 0 ? rmse * Math.sqrt(1 / n + ((currX - meanX) * (currX - meanX)) / Sxx) : 0;
      }
      band.push({
        x: currX,
        yHat: pred.y,
        yLower: pred.lower,
        yUpper: pred.upper,
        standardError: se,
      });
    }
    return band;
  };

  return {
    slope,
    intercept,
    r,
    rSquared,
    rmse,
    slopeStdError,
    interceptStdError,
    degreesOfFreedom: df,
    tCritical,
    slopeConfidenceInterval: slopeCI,
    interceptConfidenceInterval: interceptCI,
    residuals,
    outlierIndices,
    effectivePoints: rawPoints,
    isVertical: false,
    getConfidenceBand,
    predict,
  };
}
