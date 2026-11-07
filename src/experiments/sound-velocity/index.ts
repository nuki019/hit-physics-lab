/**
 * 实验二十九：测定空气中的声速 - 插件导出入口
 * 文件路径: src/experiments/sound-velocity/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { SOUND_VELOCITY_PARAMETERS, SOUND_VELOCITY_TABLES } from './definition';
import { calculateSoundVelocityData } from './calculator';
import { soundVelocityQuestions } from './questions';
import { soundVelocityDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const soundVelocityPlugin: ExperimentPlugin = {
  id: 'sound-velocity',
  name: '实验二十九：测定空气中的声速',
  category: '力热',
  experimentNumber: 29,
  bookChapter: '第三章 综合性实验',
  bookPage: 183,
  pdfPage: 198,
  hours: 3,
  description:
    '利用压电陶瓷超声换能器与示波器，分别采用极值法（驻波共振法）、相位比较法（李萨如图形法）及波形移动法精密测定空气中的超声波波长与声速；结合最小二乘线性回归评定测量误差，并探究声波随距离衰减规律、竖直驻波声悬浮效应及声波反射/吸收/衍射现象。',
  tags: ['超声波声速', '驻波共振法', '李萨如图形', '波形移动法', '最小二乘拟合', '超声波驻波悬浮'],
  parameters: SOUND_VELOCITY_PARAMETERS,
  tables: SOUND_VELOCITY_TABLES,
  calculate: calculateSoundVelocityData,
  questions: soundVelocityQuestions,
  defaultData: soundVelocityDefaultData,
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

export default soundVelocityPlugin;
