/**
 * 实验二十四：单缝和圆孔的夫琅禾费衍射 - 插件导出入口
 * 文件路径: src/experiments/fraunhofer-diffraction/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { registry } from '@/core/registry';
import { FRAUNHOFER_PARAMETERS, FRAUNHOFER_TABLES } from './definition';
import { calculateFraunhoferDiffractionData } from './calculator';
import { fraunhoferQuestions } from './questions';
import { fraunhoferDiffractionDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const fraunhoferDiffractionPlugin: ExperimentPlugin = {
  id: 'fraunhofer-diffraction',
  name: '实验二十四：单缝和圆孔的夫琅禾费衍射',
  category: '光学',
  experimentNumber: 24,
  bookChapter: '第二章 基础性实验',
  bookPage: 160,
  pdfPage: 175,
  hours: 3,
  description:
    '观察并分析单缝和圆孔的夫琅禾费远场衍射光强分布规律；利用光电传感器横向扫描测定单缝衍射 ±k 级暗纹对称坐标，通过最小二乘线性回归精确计算单缝宽度 a 及不确定度；测量圆孔衍射艾里斑（Airy 斑）与暗环直径，反推圆孔直径 D 并深入理解光学仪器瑞利判据分辨本领。',
  tags: ['波动光学', '夫琅禾费衍射', '单缝衍射', '圆孔衍射', '艾里斑', '瑞利判据'],
  parameters: FRAUNHOFER_PARAMETERS,
  tables: FRAUNHOFER_TABLES,
  calculate: calculateFraunhoferDiffractionData,
  questions: fraunhoferQuestions,
  defaultData: fraunhoferDiffractionDefaultData,
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
if (!registry.has(fraunhoferDiffractionPlugin.id)) {
  registry.register(fraunhoferDiffractionPlugin);
}

export default fraunhoferDiffractionPlugin;
