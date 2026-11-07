/**
 * 哈工大未来技术学院 B5 剪贴版排版与打印几何校验器 (Geometry Checker)
 * 来源：哈工大实际实验报告册实测扫描件 (GB/T 148 B5 176x250mm) 与 LaTeX 打印模板
 */

const B5_GEOMETRY_CONTRACT = {
  // A4 基础物理尺寸
  a4_width_mm: 210.0,
  a4_height_mm: 297.0,

  // 实体 B5 实验报告册尺寸
  b5_paper_width_mm: 176.0,
  b5_paper_height_mm: 250.0,
  b5_safe_paste_width_mm: 142.0,
  b5_safe_paste_height_mm: 188.0,

  // 剪贴外框规范 (严格契约)
  cutout_outer_width_mm: 138.0,
  cutout_inner_width_mm: 134.0,
  cutout_padding_left_right_mm: 2.0,
  a4_center_margin_left_right_mm: 36.0, // (210 - 138) / 2

  // 各页高度阈值与安全红线
  page1_cutout_min_height_mm: 132.0,
  page1_cutout_recommended_height_mm: 148.0,
  page1_cutout_max_safe_height_mm: 185.0, // 超过会覆盖第4页底部的 *4*

  page2_conclusion_block_height_mm: 80.0,
  page2_conclusion_max_safe_height_mm: 85.0,

  page2_discussion_block_height_mm: 88.0,
  page2_discussion_max_safe_height_mm: 92.0,

  // 物理防缩放校验直尺
  ruler_standard_length_mm: 100.0
};

/**
 * 校验剪贴框几何尺寸
 */
function validateCutoutGeometry(dimensions) {
  const errors = [];
  const warnings = [];

  // 校验宽度
  if (dimensions.outerWidthMm !== undefined) {
    if (Math.abs(dimensions.outerWidthMm - B5_GEOMETRY_CONTRACT.cutout_outer_width_mm) > 0.01) {
      errors.push(`剪切外框宽度必须严格为 138.0mm，当前为 ${dimensions.outerWidthMm}mm`);
    }
  }

  if (dimensions.innerWidthMm !== undefined) {
    if (Math.abs(dimensions.innerWidthMm - B5_GEOMETRY_CONTRACT.cutout_inner_width_mm) > 0.01) {
      errors.push(`排版内宽必须严格为 134.0mm，当前为 ${dimensions.innerWidthMm}mm`);
    }
  }

  // 校验 A4 居中
  if (dimensions.a4MarginMm !== undefined) {
    const expectedMargin = (B5_GEOMETRY_CONTRACT.a4_width_mm - B5_GEOMETRY_CONTRACT.cutout_outer_width_mm) / 2;
    if (Math.abs(dimensions.a4MarginMm - expectedMargin) > 0.01) {
      errors.push(`A4 画布居中外边距必须严格为 ${expectedMargin}mm，当前为 ${dimensions.a4MarginMm}mm`);
    }
  }

  // 校验第 1 页高度
  if (dimensions.page1HeightMm !== undefined) {
    if (dimensions.page1HeightMm > B5_GEOMETRY_CONTRACT.page1_cutout_max_safe_height_mm) {
      errors.push(`第1页数据处理块高度 ${dimensions.page1HeightMm}mm 超出最大安全高度 185.0mm，会遮盖报告册页码 *4*`);
    } else if (dimensions.page1HeightMm > B5_GEOMETRY_CONTRACT.page1_cutout_recommended_height_mm) {
      warnings.push(`第1页数据处理块高度 ${dimensions.page1HeightMm}mm 超过推荐值 148.0mm，建议微调`);
    }
  }

  // 校验第 2 页分块高度
  if (dimensions.conclusionBlockHeightMm !== undefined) {
    if (dimensions.conclusionBlockHeightMm > B5_GEOMETRY_CONTRACT.page2_conclusion_max_safe_height_mm) {
      errors.push(`结论分块高度 ${dimensions.conclusionBlockHeightMm}mm 超出安全上限 85.0mm，会入侵思考题区域`);
    }
  }

  if (dimensions.discussionBlockHeightMm !== undefined) {
    if (dimensions.discussionBlockHeightMm > B5_GEOMETRY_CONTRACT.page2_discussion_max_safe_height_mm) {
      errors.push(`思考题分块高度 ${dimensions.discussionBlockHeightMm}mm 超出安全上限 92.0mm，会遮盖报告册页码 *5*`);
    }
  }

  // 校验标尺长度
  if (dimensions.rulerLengthMm !== undefined) {
    if (Math.abs(dimensions.rulerLengthMm - B5_GEOMETRY_CONTRACT.ruler_standard_length_mm) > 0.01) {
      errors.push(`物理防缩放标尺长度必须精确等于 100.0mm (10.0cm)，当前为 ${dimensions.rulerLengthMm}mm`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 校验 CSS 打印规则文本
 */
function validatePrintCssRules(cssText) {
  const errors = [];
  if (!cssText.includes('size: A4 portrait') && !cssText.includes('size:A4 portrait')) {
    errors.push('缺少 @page 尺寸声明 size: A4 portrait');
  }
  if (!cssText.includes('138mm') && !cssText.includes('138.0mm')) {
    errors.push('缺少 138mm 剪贴框宽度规则');
  }
  if (!cssText.includes('100mm') && !cssText.includes('100.0mm')) {
    errors.push('缺少 100mm 标尺长度规则');
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  B5_GEOMETRY_CONTRACT,
  validateCutoutGeometry,
  validatePrintCssRules
};
