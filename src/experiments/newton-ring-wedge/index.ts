/**
 * 实验二十二：光的等厚干涉现象与应用（牛顿环与劈尖）- 插件导出入口
 * 文件路径: src/experiments/newton-ring-wedge/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { NEWTON_PARAMETERS, NEWTON_TABLES } from './definition';
import { calculateNewtonRingWedgeData } from './calculator';
import { newtonQuestions } from './questions';
import { newtonRingWedgeDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const newtonRingWedgePlugin: ExperimentPlugin = {
  id: 'newton-ring-wedge',
  name: '实验二十二：光的等厚干涉现象与应用（牛顿环与劈尖）',
  category: '光学',
  experimentNumber: 22,
  bookChapter: '第二章 基础性实验',
  bookPage: 151,
  pdfPage: 166,
  hours: 3,
  description:
    '掌握分振幅等厚干涉原理；利用读数显微镜与逐差法消除接触膜厚，精密测量平凸透镜曲率半径 R 及不确定度；利用空气劈尖测定微细金属丝直径。',
  tags: ['波动光学', '等厚干涉', '牛顿环', '劈尖干涉', '读数显微镜'],
  parameters: NEWTON_PARAMETERS,
  tables: NEWTON_TABLES,
  calculate: calculateNewtonRingWedgeData,
  questions: newtonQuestions,
  defaultData: newtonRingWedgeDefaultData,
  b5Layout: {
    page1: {
      targetHeightMm: 138,
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

export default newtonRingWedgePlugin;
