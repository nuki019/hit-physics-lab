/**
 * 实验四十六：用光电效应法测定普朗克常量 - 插件导出入口
 * 文件路径: src/experiments/photoelectric-planck/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { registry } from '@/core/registry';
import { PHOTOELECTRIC_PARAMETERS, PHOTOELECTRIC_TABLES } from './definition';
import { calculatePhotoelectricData } from './calculator';
import { photoelectricQuestions } from './questions';
import { photoelectricDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const photoelectricPlanckPlugin: ExperimentPlugin = {
  id: 'photoelectric-planck',
  name: '实验四十六：用光电效应法测定普朗克常量',
  category: '近代',
  experimentNumber: 46,
  bookChapter: '第三章 综合性实验',
  bookPage: 261,
  pdfPage: 276,
  hours: 3,
  description:
    '验证爱因斯坦光电效应方程，掌握利用反向截止电压测定普朗克常量 h 的物理原理与实验技术；通过测量汞灯 5 条特征谱线（365nm, 405nm, 436nm, 546nm, 577nm）的截止电压，采用最小二乘法精确拟合求出普朗克常数、金属逸出功与红限频率；绘制光电管伏安特性曲线，深入研究饱和光电流与光强的微观正比关系。',
  tags: ['近代物理', '量子物理', '光电效应', '普朗克常量', '爱因斯坦方程', '截止电压', '逸出功', '伏安特性'],
  parameters: PHOTOELECTRIC_PARAMETERS,
  tables: PHOTOELECTRIC_TABLES,
  calculate: calculatePhotoelectricData,
  questions: photoelectricQuestions,
  defaultData: photoelectricDefaultData,
  b5Layout: {
    page1: {
      targetHeightMm: 148,
      showTables: true,
      showCalculations: true,
      showPlotOnPage1: true,
    },
    page2: {
      mode: 'split',
      conclusionHeightMm: 80,
      discussionHeightMm: 88,
      showRuler: true,
    },
  },
};

// 自动向核心插件中心注册
if (!registry.has(photoelectricPlanckPlugin.id)) {
  registry.register(photoelectricPlanckPlugin);
}

export default photoelectricPlanckPlugin;
