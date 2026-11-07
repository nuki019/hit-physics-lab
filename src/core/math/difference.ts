/**
 * 逐差法处理计算模块
 * 文件路径: src/core/math/difference.ts
 */

export interface DifferencePair {
  index: number;              // 逐差序号 (1..m)
  highIndex: number;          // 后半段样本原始下标 (1-based)
  lowIndex: number;           // 前半段样本原始下标 (1-based)
  highValue: number;          // x_{i+step}
  lowValue: number;           // x_i
  diff: number;               // Delta x_i = highValue - lowValue
  residual: number;           // v_i = diff - meanDiff
}

export interface DifferenceOptions {
  stepMultiplier?: number;    // 单个逐差跨度所代表的物理自变量总步数 (如迈克耳逊 Delta N = 150)
  unitScale?: number;         // 物理杠杆比或量程倍率 (如迈克耳逊 1:20 传动比为 0.05)
  discardCenterIfOdd?: boolean;// 遇到奇数点是否自动丢弃中心点 (默认为 true)
}

export interface DifferenceResult {
  n: number;                  // 输入总数据点数
  m: number;                  // 实际配对有效逐差项数
  discardedIndex?: number;    // 若为奇数点，记录被剔除的中心点下标 (0-based)
  pairs: DifferencePair[];    // 逐差明细序列
  sumDiff: number;            // 逐差和 sum(Delta x_i)
  meanDiff: number;           // 逐差均值 overline{Delta x}
  besselStdDev: number;       // 逐差样本标准差 S_{Delta x}
  meanStdError: number;       // 逐差均值标准误差 u_A(overline{Delta x})
  relativeUncertainty: number;// 相对不确定度 (%)
  unitStepValue: number;      // 归一化单物理步长增量 (如单条条纹位移)
  unitStepStdError: number;   // 单物理步长增量标准误差
}

/**
 * 逐差法核心计算函数 (对半逐差法，奇偶项自适应)
 */
export function calculateDifference(
  values: number[],
  options?: DifferenceOptions
): DifferenceResult {
  if (!Array.isArray(values) || values.length < 2) {
    throw new Error('逐差法计算至少需要 2 个有效数据点');
  }

  const n = values.length;
  const discardCenterIfOdd = options?.discardCenterIfOdd ?? true;
  const stepMultiplier = options?.stepMultiplier ?? 1;
  const unitScale = options?.unitScale ?? 1;

  let m: number;
  let discardedIndex: number | undefined;
  const rawDiffs: Array<{
    index: number;
    highIndex: number;
    lowIndex: number;
    highValue: number;
    lowValue: number;
    diff: number;
  }> = [];

  if (n % 2 === 1 && discardCenterIfOdd) {
    // 奇数项：对称舍中法，剔除正中央点
    m = Math.floor(n / 2);
    discardedIndex = m; // 0-based 下标

    for (let i = 0; i < m; i++) {
      const lowIndex = i;
      const highIndex = i + m + 1;
      const lowValue = values[lowIndex];
      const highValue = values[highIndex];
      const diff = highValue - lowValue;

      rawDiffs.push({
        index: i + 1,
        highIndex: highIndex + 1, // 1-based 用于展示
        lowIndex: lowIndex + 1,
        highValue,
        lowValue,
        diff,
      });
    }
  } else {
    // 偶数项：标准对半逐差
    m = Math.floor(n / 2);

    for (let i = 0; i < m; i++) {
      const lowIndex = i;
      const highIndex = i + m;
      const lowValue = values[lowIndex];
      const highValue = values[highIndex];
      const diff = highValue - lowValue;

      rawDiffs.push({
        index: i + 1,
        highIndex: highIndex + 1,
        lowIndex: lowIndex + 1,
        highValue,
        lowValue,
        diff,
      });
    }
  }

  if (m === 0) {
    throw new Error('有效逐差对数不足，无法计算');
  }

  // 计算均值
  let sumDiff = 0;
  for (let i = 0; i < m; i++) {
    sumDiff += rawDiffs[i].diff;
  }
  const meanDiff = sumDiff / m;

  // 计算残差与贝塞尔标准差
  let sumSq = 0;
  const pairs: DifferencePair[] = [];
  for (let i = 0; i < m; i++) {
    const r = rawDiffs[i];
    const residual = r.diff - meanDiff;
    sumSq += residual * residual;
    pairs.push({
      ...r,
      residual,
    });
  }

  const besselStdDev = m > 1 ? Math.sqrt(sumSq / (m - 1)) : 0;
  // 逐差均值 A 类标准不确定度: u_A(meanDiff) = S_{Delta x} / sqrt(m)
  const meanStdError = m > 0 ? besselStdDev / Math.sqrt(m) : 0;
  const relativeUncertainty =
    Math.abs(meanDiff) > 1e-12 ? (meanStdError / Math.abs(meanDiff)) * 100 : 0;

  // 归一化单物理步长增量
  const unitStepValue = (meanDiff * unitScale) / stepMultiplier;
  const unitStepStdError = (meanStdError * unitScale) / stepMultiplier;

  return {
    n,
    m,
    discardedIndex,
    pairs,
    sumDiff,
    meanDiff,
    besselStdDev,
    meanStdError,
    relativeUncertainty,
    unitStepValue,
    unitStepStdError,
  };
}

/**
 * 经典逐差法轻量接口 (与测试规范及预言机完全对齐)
 */
export function differenceMethod(series: number[]): {
  m: number;
  diffs: number[];
  mean: number;
} {
  const res = calculateDifference(series);
  return {
    m: res.m,
    diffs: res.pairs.map((p) => p.diff),
    mean: res.meanDiff,
  };
}
