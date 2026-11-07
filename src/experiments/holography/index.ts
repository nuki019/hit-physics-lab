/**
 * 实验四十九：全息照相 - 插件导出入口
 * 文件路径: src/experiments/holography/index.ts
 */

import { ExperimentPlugin } from '@/types/experiment';
import { registry } from '@/core/registry';
import { HOLOGRAPHY_PARAMETERS, HOLOGRAPHY_TABLES } from './definition';
import { calculateHolographyData } from './calculator';
import { holographyQuestions } from './questions';
import { holographyDefaultData } from './defaultData';

export * from './definition';
export * from './calculator';
export * from './questions';
export * from './defaultData';

export const holographyPlugin: ExperimentPlugin = {
  id: 'holography',
  name: '实验四十九：全息照相',
  category: '光学',
  experimentNumber: 49,
  bookChapter: '第四章 近现代实验',
  bookPage: 280,
  pdfPage: 295,
  hours: 3,
  description:
    '掌握全息照相波前干涉记录与衍射再现的物理原理；在气垫防震平台上搭建透射全息光路，精确测量并匹配物光路与参考光路光程差 (|ΔL| ≤ 2.0 cm) 以满足氦氖激光相干长度约束；调节光强比至最佳线性动态区间 (K = 4:1 ~ 10:1)；计算不同记录夹角下全息干涉条纹微观空间频率并与底片极限分辨率进行安全裕量校验；观察具有真实视差的三维立体虚像与共轭实像。',
  tags: ['光学', '信息光学', '全息照相', '相干长度', '光程差', '光强比', '条纹调制度', '空间频率', '三维像'],
  parameters: HOLOGRAPHY_PARAMETERS,
  tables: HOLOGRAPHY_TABLES,
  calculate: calculateHolographyData,
  questions: holographyQuestions,
  defaultData: holographyDefaultData,
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
if (!registry.has(holographyPlugin.id)) {
  registry.register(holographyPlugin);
}

export default holographyPlugin;
