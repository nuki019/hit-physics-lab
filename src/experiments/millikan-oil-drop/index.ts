/**
 * 实验四十五：用密立根油滴法测定电子电荷 - 插件导出入口
 * 文件路径: src/experiments/millikan-oil-drop/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { registry } from '@/core/registry';
import { MILLIKAN_PARAMETERS, MILLIKAN_TABLES } from './definition';
import { calculateMillikanOilDropData } from './calculator';
import { millikanQuestions } from './questions';
import { millikanDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const millikanOilDropPlugin: ExperimentPlugin = {
  id: 'millikan-oil-drop',
  name: '实验四十五：用密立根油滴法测定电子电荷',
  category: '近代',
  experimentNumber: 45,
  bookChapter: '第三章 综合性实验',
  bookPage: 255,
  pdfPage: 270,
  hours: 3,
  description:
    '学习密立根油滴实验的设计思想与微小电荷测量方法；在平衡静电场与重力场中观测带电微粒的运动规律；利用斯托克斯定律并引入空气分子自由程黏滞修正，精确测定油滴所带电荷量 q；运用最大公约数倒推法验证电荷量子化并测定基本元电荷 e。',
  tags: ['近代物理', '密立根油滴', '元电荷', '量子化', '斯托克斯公式', '平衡法', 'Cunningham修正', '电子电荷'],
  parameters: MILLIKAN_PARAMETERS,
  tables: MILLIKAN_TABLES,
  calculate: calculateMillikanOilDropData,
  questions: millikanQuestions,
  defaultData: millikanDefaultData,
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
if (!registry.has(millikanOilDropPlugin.id)) {
  registry.register(millikanOilDropPlugin);
}

export default millikanOilDropPlugin;
