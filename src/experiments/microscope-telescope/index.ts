/**
 * 实验二十一：自组显微镜和望远镜 - 插件导出入口
 * 文件路径: src/experiments/microscope-telescope/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { registry } from '@/core/registry';
import { MICROSCOPE_TELESCOPE_PARAMETERS, MICROSCOPE_TELESCOPE_TABLES } from './definition';
import { calculateMicroscopeTelescopeData } from './calculator';
import { microscopeTelescopeQuestions } from './questions';
import { microscopeTelescopeDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const microscopeTelescopePlugin: ExperimentPlugin = {
  id: 'microscope-telescope',
  name: '实验二十一：自组显微镜和望远镜',
  category: '光学',
  experimentNumber: 21,
  bookChapter: '第二章 基础性实验',
  bookPage: 146,
  pdfPage: 161,
  hours: 3,
  description:
    '掌握透镜成像规律与共轴光具组调节方法；利用焦距已知的透镜在光具座上自组开普勒望远镜、伽利略望远镜与复式显微镜；通过双眼视差法测量望远镜视角放大率与显微镜总放大率，并与理论高斯成像公式进行比对与误差机理分析。',
  tags: ['几何光学', '开普勒望远镜', '伽利略望远镜', '显微镜', '共轴调节', '视角放大率', '光学间隔', '高斯公式'],
  parameters: MICROSCOPE_TELESCOPE_PARAMETERS,
  tables: MICROSCOPE_TELESCOPE_TABLES,
  calculate: calculateMicroscopeTelescopeData,
  questions: microscopeTelescopeQuestions,
  defaultData: microscopeTelescopeDefaultData,
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
if (!registry.has(microscopeTelescopePlugin.id)) {
  registry.register(microscopeTelescopePlugin);
}

export default microscopeTelescopePlugin;
