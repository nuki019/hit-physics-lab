/**
 * 哈工大未来技术学院 B5 剪贴版排版与打印配置类型
 * 文件路径: src/types/report.ts
 */

export interface B5GeometrySpec {
  pageWidthMm: number;        // A4 纸张宽度 210.0 mm
  pageHeightMm: number;       // A4 纸张高度 297.0 mm
  cutoutOuterWidthMm: number; // 剪贴框外宽 138.0 mm
  cutoutInnerWidthMm: number; // 排版有效内宽 134.0 mm
  a4MarginLeftRightMm: number;// 左右外边距 36.0 mm (居中)
  page1MaxSafeHeightMm: number;// 第 1 页最大安全高度 185.0 mm
  page1RecommendedHeightMm: number; // 推荐 148.0 mm
  conclusionBlockHeightMm: number; // 结论分块 80.0 mm
  discussionBlockHeightMm: number; // 思考题分块 88.0 mm
  rulerLengthMm: number;      // 校验标尺严格长度 100.0 mm (10.0 cm)
}

export const B5_CUTOUT_SPEC = {
  PAGE_WIDTH_MM: 210.0,
  PAGE_HEIGHT_MM: 297.0,
  CUTOUT_WIDTH_MM: 138.0,
  INNER_WIDTH_MM: 134.0,
  PAGE_ONE_HEIGHT_MM: 148.0,
  PAGE_TWO_P1_HEIGHT_MM: 80.0,
  PAGE_TWO_P2_HEIGHT_MM: 88.0,
  RULER_LENGTH_MM: 100.0,
} as const;

export type PrintPageMode = 'all' | 'p1' | 'p2';

export interface ReportPrintConfig {
  showRuler: boolean;
  scale: number;
  highContrast: boolean;
  pageMode: PrintPageMode;
}
