/**
 * 实验三十三：用示波器观测动态磁滞回线 - 插件导出入口
 * 文件路径: src/experiments/hysteresis-loop/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { registry } from '@/core/registry';
import { HYSTERESIS_PARAMETERS, HYSTERESIS_TABLES } from './definition';
import { calculateHysteresisData } from './calculator';
import { hysteresisQuestions } from './questions';
import { hysteresisDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const hysteresisLoopPlugin: ExperimentPlugin = {
  id: 'hysteresis-loop',
  name: '实验三十三：用示波器观测动态磁滞回线',
  category: '电磁',
  experimentNumber: 33,
  bookChapter: '第三章 综合性实验',
  bookPage: 199,
  pdfPage: 214,
  hours: 3,
  description:
    '学习用示波器观测铁磁材料的动态磁滞回线及基本磁化曲线；掌握用采样电阻测定磁化场强 H、RC 积分电路测定磁感应强度 B 的原理；测定铁磁材料的饱和磁感应强度 Bs、剩磁 Br、矫顽力 Hc 和磁滞损耗。',
  tags: ['电磁学', '铁磁材料', '磁滞回线', '示波器', '矫顽力', '剩磁', '磁滞损耗', 'RC积分'],
  parameters: HYSTERESIS_PARAMETERS,
  tables: HYSTERESIS_TABLES,
  calculate: calculateHysteresisData,
  questions: hysteresisQuestions,
  defaultData: hysteresisDefaultData,
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
if (!registry.has(hysteresisLoopPlugin.id)) {
  registry.register(hysteresisLoopPlugin);
}

export default hysteresisLoopPlugin;
