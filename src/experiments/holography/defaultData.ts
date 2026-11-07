/**
 * 实验四十九：全息照相 - 预置标准基准数据
 * 来源：哈工大大物教材第三版 p.280 与薪火笔记社官方参考数据
 * 文件路径: src/experiments/holography/defaultData.ts
 */

import { BenchmarkData } from '@/types/experiment';

export const HOLOGRAPHY_DEFAULT_TABLE1 = [
  ['参考光总光程 LR', 42.50, 'cm', '|ΔL| ≤ 2.0 cm (相干长度约束)', '合格'],
  ['物光中心总光程 LO', 43.20, 'cm', '|ΔL| ≤ 2.0 cm (相干长度约束)', '合格'],
  ['光程差 |ΔL| = |LR - LO|', 0.70, 'cm', '严格 ≤ 2.0 cm (实测 0.70 cm)', '优良合格'],
  ['参考光光强 IR', 36.00, 'μW/cm²', '底片线性区 (建议 20~50 μW/cm²)', '合格'],
  ['物光平均光强 IO', 6.00, 'μW/cm²', '物光适中 (确保干涉调制)', '合格'],
  ['光强比 K = IR / IO', 6.00, '', '标称 4:1 ~ 10:1 (实测 6.0:1)', '最佳线性区间'],
  ['物光参考光夹角 θ', 35.0, '°', '典型推荐 30° ~ 45°', '合格'],
  ['推荐曝光时间 t', 15.0, 's', '依感光通量 300~600 μJ/cm² 设定', '合适'],
];

export const HOLOGRAPHY_DEFAULT_TABLE2 = [
  [25.0, 0.2164, 1.462, 684.0, 4.39],
  [30.0, 0.2588, 1.222, 818.1, 3.67],
  [35.0, 0.3007, 1.052, 950.4, 3.16],
  [40.0, 0.3420, 0.925, 1081.0, 2.78],
  [45.0, 0.3827, 0.827, 1209.6, 2.48],
];

export const holographyDefaultData: BenchmarkData = {
  datasetName: '哈工大大物实验全息照相官方标准基准数据',
  parameters: {
    laser_wavelength: 632.8,
    plate_res_limit: 3000,
    plate_width: 60.0,
    object_distance: 150.0,
  },
  tables: {
    table1_optical_path: HOLOGRAPHY_DEFAULT_TABLE1,
    table2_spatial_frequency: HOLOGRAPHY_DEFAULT_TABLE2,
  },
};
