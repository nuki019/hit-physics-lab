/**
 * 实验十七：探究乐音 - 插件导出入口
 * 文件路径: src/experiments/musical-sound/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { registry } from '@/core/registry';
import { MUSICAL_PARAMETERS, MUSICAL_TABLES } from './definition';
import { calculateMusicalSoundData } from './calculator';
import { musicalQuestions } from './questions';
import { musicalDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const musicalSoundPlugin: ExperimentPlugin = {
  id: 'musical-sound',
  name: '实验十七：探究乐音',
  category: '力热',
  experimentNumber: 17,
  bookChapter: '第二章 基础性实验',
  bookPage: 128,
  pdfPage: 143,
  hours: 3,
  description:
    '探究弦振动共振频率与弦长 L、弦线张力 T 的定量关系；验证 Mersenne 驻波定律；由最小二乘法精确测定弦线的线密度 ρL 并评定不确定度；利用示波器或频谱仪分析典型乐音的傅里叶泛音谱结构与音色特征。',
  tags: ['声学', '乐音', '弦振动', '基频', '泛音', '频谱分析', '线密度', '驻波', '音色'],
  parameters: MUSICAL_PARAMETERS,
  tables: MUSICAL_TABLES,
  calculate: calculateMusicalSoundData,
  questions: musicalQuestions,
  defaultData: musicalDefaultData,
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

// 自动向核心插件注册表注册
if (!registry.has(musicalSoundPlugin.id)) {
  registry.register(musicalSoundPlugin);
}

export default musicalSoundPlugin;
