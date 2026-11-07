/**
 * 实验五十八：光纤传输技术 - 插件导出入口
 * 文件路径: src/experiments/optical-fiber/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { registry } from '@/core/registry';
import { OPTICAL_FIBER_PARAMETERS, OPTICAL_FIBER_TABLES } from './definition';
import { calculateOpticalFiberData } from './calculator';
import { opticalFiberQuestions } from './questions';
import { opticalFiberDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const opticalFiberPlugin: ExperimentPlugin = {
  id: 'optical-fiber',
  name: '实验五十八：光纤传输技术',
  category: '近代',
  experimentNumber: 58,
  bookChapter: '第四章 近现代实验',
  bookPage: 319,
  pdfPage: 334,
  hours: 3,
  description:
    '深入掌握光纤全反射导光与介质波导传播机制；利用远场光斑法通过微米测微与几何拟合精确测定光纤数值孔径 (NA) 与纤芯包层相对折射率差 Δ；运用标准剪断法消除端面菲涅尔反射与透镜耦合损耗，精确计算光纤传输衰减系数 α (dB/km)；构建半导体发光管与光敏管电-光-电转换通道，实测模拟与数字信号调制特性及幅频增益曲线。',
  tags: ['近代物理', '光纤通信', '数值孔径', '远场光斑', '剪断法', '传输损耗', '衰减系数', '电光调制'],
  parameters: OPTICAL_FIBER_PARAMETERS,
  tables: OPTICAL_FIBER_TABLES,
  calculate: calculateOpticalFiberData,
  questions: opticalFiberQuestions,
  defaultData: opticalFiberDefaultData,
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

// 自动向核心插件中心注册
if (!registry.has(opticalFiberPlugin.id)) {
  registry.register(opticalFiberPlugin);
}

export default opticalFiberPlugin;
