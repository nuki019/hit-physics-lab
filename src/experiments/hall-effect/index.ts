/**
 * 实验三十二：霍尔效应及其应用 - 插件导出入口
 * 文件路径: src/experiments/hall-effect/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { HALL_PARAMETERS, HALL_TABLES } from './definition';
import { calculateHallEffectData } from './calculator';
import { hallQuestions } from './questions';
import { hallDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const hallEffectPlugin: ExperimentPlugin = {
  id: 'hall-effect',
  name: '实验三十二：霍尔效应及其应用',
  category: '电磁',
  experimentNumber: 32,
  bookChapter: '第三章 综合性实验',
  bookPage: 196,
  pdfPage: 211,
  hours: 3,
  description:
    '通过测量半导体霍尔元件在磁场中的霍尔电压 UH，研究其与工作电流 IH、磁感应强度 B 的线性关系；消除四大副效应；测定元件霍尔灵敏度 KH、霍尔系数 RH、载流子浓度 n；并利用梯度磁场实现微位移定标。',
  tags: ['电磁学', '半导体', '霍尔效应', '四次换向法', '微位移定标'],
  parameters: HALL_PARAMETERS,
  tables: HALL_TABLES,
  calculate: calculateHallEffectData,
  questions: hallQuestions,
  defaultData: hallDefaultData,
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

export default hallEffectPlugin;
