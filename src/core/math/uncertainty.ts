/**
 * 误差与不确定度评定计算模块
 * 文件路径: src/core/math/uncertainty.ts
 */

export type DistributionType = 'uniform' | 'normal_3sigma' | 'normal_2sigma' | 'triangular';

export interface UncertaintyOptions {
  instrumentError?: number;        // Delta_{text{仪}} 仪器最大允许误差或最小分度值
  distribution?: DistributionType; // 误差分布类型 (默认均匀分布 uniform)
  confidenceFactor?: number;       // 自定义置信因子 C (若提供则覆盖 distribution)
  unit?: string;                   // 物理量单位
  name?: string;                   // 物理量符号 (如 "R", "lambda")
}

export interface DirectUncertaintyResult {
  mean: number;                    // 算术平均值 overline{x}
  n: number;                       // 测量次数
  besselStdDev: number;            // 单次测量实验标准差 S_x
  uA: number;                      // A 类标准不确定度
  uB: number;                      // B 类标准不确定度
  uC: number;                      // 合成标准不确定度 u_c = sqrt(u_A^2 + u_B^2)
  relativeUncertainty: number;     // 相对不确定度 E_r (%)
  unit: string;
}

export interface IndirectVariableComponent {
  symbol: string;                  // 变量符号 (如 "L", "lambda")
  value: number;                   // 测量值
  uncertainty: number;             // 绝对不确定度 u_c(x_j)
  power: number;                   // 指数 a_j (乘方为正, 分母商为负)
  partialDerivative?: number;      // 若非纯幂函数，提供偏导数值 partial f / partial x_j
}

export interface IndirectUncertaintyResult {
  calculatedValue: number;         // 间接计算结果 y
  uC: number;                      // 合成标准不确定度 u_c(y)
  relativeUncertainty: number;     // 相对不确定度 E_r(y) (%)
  components: Array<{
    symbol: string;
    contributionRatio: number;     // 各变量误差贡献占比 (%)
  }>;
}

/**
 * 贝塞尔公式计算 A 类不确定度
 * 返回 { mean, s, uA }
 */
export function besselUncertaintyA(values: number[]): {
  mean: number;
  s: number;
  uA: number;
} {
  if (!Array.isArray(values) || values.length === 0) {
    return { mean: 0, s: 0, uA: 0 };
  }
  const n = values.length;
  if (n === 1) {
    return { mean: values[0], s: 0, uA: 0 };
  }

  const mean = values.reduce((acc, cur) => acc + cur, 0) / n;
  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    const diff = values[i] - mean;
    sumSq += diff * diff;
  }

  const s = Math.sqrt(sumSq / (n - 1)); // 样本单次测量标准差
  const uA = s / Math.sqrt(n);          // 算术平均值的标准差
  return { mean, s, uA };
}

/**
 * B 类仪器不确定度 (默认均匀分布除以根号 3)
 */
export function bUncertainty(deltaInst: number, k: number = Math.sqrt(3)): number {
  if (deltaInst <= 0) return 0;
  return deltaInst / k;
}

/**
 * 合成不确定度 (方和根合成)
 */
export function combinedUncertainty(uA: number, uB: number): number {
  return Math.sqrt(uA * uA + uB * uB);
}

/**
 * 依据分布类型获取置信因子 C
 */
export function getConfidenceFactor(dist: DistributionType): number {
  switch (dist) {
    case 'uniform':
      return Math.sqrt(3);      // 约 1.732
    case 'normal_3sigma':
      return 3.0;
    case 'normal_2sigma':
      return 2.0;
    case 'triangular':
      return Math.sqrt(6);      // 约 2.449
    default:
      return Math.sqrt(3);
  }
}

/**
 * 直接测量综合不确定度评定主函数
 */
export function evaluateDirectUncertainty(
  samples: number[],
  options?: UncertaintyOptions
): DirectUncertaintyResult {
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new Error('不确定度评定需要至少一个测量样本');
  }

  const n = samples.length;
  const unit = options?.unit || '';
  const instrumentError = options?.instrumentError ?? 0;
  const dist = options?.distribution || 'uniform';
  const cFactor = options?.confidenceFactor ?? getConfidenceFactor(dist);

  let mean = 0;
  let s = 0;
  let uA = 0;

  if (n >= 2) {
    const resA = besselUncertaintyA(samples);
    mean = resA.mean;
    s = resA.s;
    uA = resA.uA;
  } else {
    mean = samples[0];
    s = 0;
    uA = 0;
  }

  const uB = instrumentError > 0 ? instrumentError / cFactor : 0;
  const uC = combinedUncertainty(uA, uB);
  const relativeUncertainty = Math.abs(mean) > 1e-12 ? (uC / Math.abs(mean)) * 100 : 0;

  return {
    mean,
    n,
    besselStdDev: s,
    uA,
    uB,
    uC,
    relativeUncertainty,
    unit,
  };
}

/**
 * 间接测量积商幂次函数不确定度合成 (对数偏导相对误差方和根传递)
 * y = C * prod(x_j^{a_j})
 */
export function evaluateIndirectUncertaintyPowerLaw(
  components: IndirectVariableComponent[],
  coefficient: number = 1.0
): IndirectUncertaintyResult {
  if (!Array.isArray(components) || components.length === 0) {
    throw new Error('间接测量评定至少需要一个输入分量');
  }

  // 1. 计算函数值 y
  let yVal = coefficient;
  for (const comp of components) {
    yVal *= Math.pow(comp.value, comp.power);
  }

  // 2. 计算各变量相对不确定度平方和与贡献度
  let sumRelUncSq = 0;
  const contribList: Array<{ symbol: string; relSq: number }> = [];

  for (const comp of components) {
    if (Math.abs(comp.value) < 1e-15) {
      throw new Error(`变量 [${comp.symbol}] 值为 0，无法计算相对不确定度`);
    }
    const relUnc = comp.uncertainty / Math.abs(comp.value);
    const weightedRelUncSq = (comp.power * relUnc) * (comp.power * relUnc);
    sumRelUncSq += weightedRelUncSq;
    contribList.push({
      symbol: comp.symbol,
      relSq: weightedRelUncSq,
    });
  }

  const relUncTotal = Math.sqrt(sumRelUncSq);
  const absUncTotal = Math.abs(yVal) * relUncTotal;

  // 各分量贡献率
  const contributions = contribList.map((c) => ({
    symbol: c.symbol,
    contributionRatio: sumRelUncSq > 0 ? (c.relSq / sumRelUncSq) * 100 : 0,
  }));

  return {
    calculatedValue: yVal,
    uC: absUncTotal,
    relativeUncertainty: relUncTotal * 100, // 转为百分比
    components: contributions,
  };
}
