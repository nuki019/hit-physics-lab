/**
 * 实验三十六：迈克耳孙干涉仪 - 插件导出入口
 * 文件路径: src/experiments/michelson/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { MICHELSON_PARAMETERS, MICHELSON_TABLES } from './definition';
import { calculateMichelsonData } from './calculator';
import { michelsonQuestions } from './questions';
import { michelsonDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const michelsonPlugin: ExperimentPlugin = {
  id: 'michelson',
  name: '实验三十六：迈克耳孙干涉仪',
  category: '光学',
  experimentNumber: 36,
  bookChapter: '第三章 综合性实验',
  bookPage: 211,
  pdfPage: 226,
  hours: 3,
  description:
    '掌握迈克耳逊干涉仪的光路结构、光轴等倾/等厚调节与非定域干涉特征；通过逐差法精密测定 He-Ne 激光波长及 A 类不确定度；利用充放气测定空气折射率。',
  tags: ['波动光学', '精密干涉', '等倾干涉', '空气折射率', '逐差法'],
  parameters: MICHELSON_PARAMETERS,
  tables: MICHELSON_TABLES,
  calculate: calculateMichelsonData,
  questions: michelsonQuestions,
  defaultData: michelsonDefaultData,
  b5Layout: {
    page1: {
      targetHeightMm: 132,
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

export default michelsonPlugin;
