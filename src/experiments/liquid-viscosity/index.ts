/**
 * 实验五：液体黏度的测定（落球法） - 插件导出入口
 * 文件路径: src/experiments/liquid-viscosity/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { registry } from '@/core/registry';
import { VISCOSITY_PARAMETERS, VISCOSITY_TABLES } from './definition';
import { calculateLiquidViscosity } from './calculator';
import { viscosityQuestions } from './questions';
import { viscosityDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const liquidViscosityPlugin: ExperimentPlugin = {
  id: 'liquid-viscosity',
  name: '实验五：液体黏度的测定',
  category: '力热',
  experimentNumber: 5,
  bookChapter: '第二章 基础性实验',
  bookPage: 70,
  pdfPage: 85,
  hours: 3,
  description:
    '学习用落球法测定液体的动力黏度；掌握读数显微镜测量小球直径的方法与不确定度评定；对有限量筒引入无限广延边界修正；校验雷诺数层流条件；研究蓖麻油黏度随温度变化的指数衰减规律。',
  tags: ['力热', '流体力学', '黏度测定', '落球法', '斯托克斯公式', '边界修正', '雷诺数'],
  parameters: VISCOSITY_PARAMETERS,
  tables: VISCOSITY_TABLES,
  calculate: calculateLiquidViscosity,
  questions: viscosityQuestions,
  defaultData: viscosityDefaultData,
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
if (!registry.has(liquidViscosityPlugin.id)) {
  registry.register(liquidViscosityPlugin);
}

export default liquidViscosityPlugin;
