/**
 * 实验二十八：用准稳态法测定不良导体的比热容和导热系数 - 插件导出入口
 * 文件路径: src/experiments/quasi-steady-thermal/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { registry } from '@/core/registry';
import { QUASI_STEADY_PARAMETERS, QUASI_STEADY_TABLES } from './definition';
import { calculateQuasiSteadyData } from './calculator';
import { quasiSteadyQuestions } from './questions';
import { quasiSteadyDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const quasiSteadyThermalPlugin: ExperimentPlugin = {
  id: 'quasi-steady-thermal',
  name: '实验二十八：用准稳态法测定不良导体的比热容和导热系数',
  category: '力热',
  experimentNumber: 28,
  bookChapter: '第三章 综合性实验',
  bookPage: 179,
  pdfPage: 194,
  hours: 3,
  description:
    '基于一维无限大平板恒热流准稳态导热理论，采用对称夹心加热结构与铜-康铜温差热电偶交替测量有机玻璃和橡胶样品的两面温差 ΔT 与中心绝热面温升速率 dT/dt，在一次实验过程中同时测定不良导体的导热系数 λ 和比热容 c。',
  tags: ['热学', '准稳态法', '不良导体', '导热系数', '比热容', '热电偶', '傅里叶导热方程', '有机玻璃', '橡胶'],
  parameters: QUASI_STEADY_PARAMETERS,
  tables: QUASI_STEADY_TABLES,
  calculate: calculateQuasiSteadyData,
  questions: quasiSteadyQuestions,
  defaultData: quasiSteadyDefaultData,
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
if (!registry.has(quasiSteadyThermalPlugin.id)) {
  registry.register(quasiSteadyThermalPlugin);
}

export default quasiSteadyThermalPlugin;
