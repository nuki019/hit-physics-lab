/**
 * 科学修约与 KaTeX 分步推导格式化模块
 * 文件路径: src/core/math/formatter.ts
 */

export interface FormatUncertaintyOptions {
  sigFigsMode?: 'auto' | 'strict1' | 'strict2';
  forceScientific?: boolean;
  unit?: string;
  variableName?: string;
}

export interface FormattedResult {
  valueStr: string;              // 格式化后的均值字符串 (如 "2.41")
  uncertaintyStr: string;        // 格式化后的不确定度字符串 (如 "0.11")
  exponent?: number;             // 提取的 10 次幂 (若有)
  latexInline: string;           // \left( 2.41 \pm 0.11 \right) \mathrm{m}
  latexBlock: string;            // 带变量名与单位的标准展示式
  decimalPlaces: number;         // 最终保留的小数位数
}

export interface KaTeXStep {
  stepId: string;
  name: string;
  formulaLatex: string;
  substituteLatex: string;
  resultLatex: string;
  fullLatex: string;
  explanation?: string;
}

/**
 * 稳健的四舍六入五成双修约核心实现 (Round to Even)
 * 具备 IEEE 754 浮点微误差容忍度 (Epsilon = 1e-10)
 */
export function roundToEven(val: number, decimalPlaces: number): number {
  if (!Number.isFinite(val)) return val;
  const sign = val < 0 ? -1 : 1;
  const absVal = Math.abs(val);
  const factor = Math.pow(10, decimalPlaces);
  const scaled = absVal * factor;
  const floorVal = Math.floor(scaled);
  const remainder = scaled - floorVal;
  const EPSILON = 1e-10;

  let roundedAbs: number;
  if (Math.abs(remainder - 0.5) < EPSILON) {
    // 恰好为 5 (或 5000000...)
    roundedAbs = (floorVal % 2 === 0 ? floorVal : floorVal + 1) / factor;
  } else if (remainder > 0.5 + EPSILON) {
    roundedAbs = Math.ceil(scaled) / factor;
  } else {
    roundedAbs = floorVal / factor;
  }
  return sign * roundedAbs;
}

/**
 * 将数值格式化为严格补齐末尾零的定点字符串
 */
export function formatFixedWithTrailingZeros(val: number, decimalPlaces: number): string {
  if (!Number.isFinite(val)) return String(val);
  if (decimalPlaces <= 0) {
    return String(Math.round(roundToEven(val, 0)));
  }
  const rounded = roundToEven(val, decimalPlaces);
  const fixed = rounded.toFixed(decimalPlaces);
  return fixed;
}

/**
 * 获取正数首个非零有效数字所在的小数位阶数
 * 例如 0.052 -> -2, 7.5 -> 0, 120 -> 2
 */
function getFirstSignificantOrder(num: number): number {
  if (num === 0) return 0;
  return Math.floor(Math.log10(Math.abs(num)));
}

/**
 * 格式化实验数值与不确定度，确保四舍六入五成双与末位对齐
 */
export function formatMeasurementWithUncertainty(
  mean: number,
  uncertainty: number,
  options?: FormatUncertaintyOptions
): FormattedResult {
  const sigFigsMode = options?.sigFigsMode || 'auto';
  const unit = options?.unit || '';
  const variableName = options?.variableName || '';

  // 处理不确定度为 0 或非法的情形
  if (!Number.isFinite(uncertainty) || uncertainty <= 0) {
    const defaultDecimals = 2;
    const roundedMean = formatFixedWithTrailingZeros(mean, defaultDecimals);
    const unitStr = unit ? (unit.startsWith('\\') ? `\\ ${unit}` : `\\ \\mathrm{${unit}}`) : '';
    const latexInline = `${roundedMean}${unitStr}`;
    return {
      valueStr: roundedMean,
      uncertaintyStr: '0',
      latexInline,
      latexBlock: variableName ? `${variableName} = ${latexInline}` : latexInline,
      decimalPlaces: defaultDecimals,
    };
  }

  // 判断是否需要科学记数法
  const absMean = Math.abs(mean);
  const refScale = absMean > 0 ? absMean : (uncertainty > 0 ? uncertainty : 0);
  const shouldScientific =
    options?.forceScientific ||
    (refScale > 0 && (refScale >= 1000 || refScale < 0.01));

  let valScaled = mean;
  let uncScaled = uncertainty;
  let exponent: number | undefined;

  if (shouldScientific && refScale > 0) {
    exponent = Math.floor(Math.log10(refScale));
    const factor = Math.pow(10, exponent);
    valScaled = mean / factor;
    uncScaled = uncertainty / factor;
  }

  // 评定不确定度应保留的有效位数
  const firstOrder = getFirstSignificantOrder(uncScaled);
  const firstDigit = Math.floor(uncScaled / Math.pow(10, firstOrder));

  let sigFigs = 1;
  if (sigFigsMode === 'strict2') {
    sigFigs = 2;
  } else if (sigFigsMode === 'strict1') {
    sigFigs = 1;
  } else {
    // auto: 首位为 1 或 2 时保留 2 位有效数字，其余保留 1 位
    sigFigs = firstDigit === 1 || firstDigit === 2 ? 2 : 1;
  }

  // 计算不确定度修约后所在的小数位数
  const decPlaces = Math.max(0, sigFigs - 1 - firstOrder);

  // 修约不确定度与均值
  const uncStr = formatFixedWithTrailingZeros(uncScaled, decPlaces);
  const valStr = formatFixedWithTrailingZeros(valScaled, decPlaces);

  // 拼装 LaTeX 表达式
  let unitLatex = '';
  if (unit) {
    unitLatex = unit.startsWith('\\') ? `\\ ${unit}` : `\\ \\mathrm{${unit}}`;
  }

  let latexInline: string;
  if (exponent !== undefined && exponent !== 0) {
    latexInline = `\\left( ${valStr} \\pm ${uncStr} \\right) \\times 10^{${exponent}}${unitLatex}`;
  } else {
    latexInline = `\\left( ${valStr} \\pm ${uncStr} \\right)${unitLatex}`;
  }

  const latexBlock = variableName ? `${variableName} = ${latexInline}` : latexInline;

  return {
    valueStr: valStr,
    uncertaintyStr: uncStr,
    exponent,
    latexInline,
    latexBlock,
    decimalPlaces: decPlaces,
  };
}

/**
 * 生成 KaTeX 分步推导数据结构
 */
export function createKaTeXStep(
  name: string,
  formulaLatex: string,
  substituteLatex: string,
  resultLatex: string,
  explanation?: string
): KaTeXStep {
  const stepId = `step_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  // 组装完整三段式
  const fullLatex = `${formulaLatex} = ${substituteLatex} = ${resultLatex}`;

  return {
    stepId,
    name,
    formulaLatex,
    substituteLatex,
    resultLatex,
    fullLatex,
    explanation,
  };
}
