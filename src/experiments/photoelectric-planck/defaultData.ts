/**
 * 实验四十六：用光电效应法测定普朗克常量 - 预置标准基准数据
 * 来源：哈工大大物教材第三版 p.261 与薪火笔记社官方参考数据
 * 文件路径: src/experiments/photoelectric-planck/defaultData.ts
 */

import { BenchmarkData } from '@/types/experiment';

// 表 1: 不同波长谱线截止电压测量数据 (365nm, 405nm, 436nm, 546nm, 577nm)
export const PHOTOELECTRIC_DEFAULT_TABLE1 = [
  ['紫外光 365nm', 365.0, 8.214, 1.832, 1.830, 1.834, 1.832, 1.831],
  ['紫光 405nm', 404.7, 7.408, 1.498, 1.502, 1.500, 1.500, 1.499],
  ['蓝紫光 436nm', 435.8, 6.879, 1.280, 1.282, 1.278, 1.280, 1.281],
  ['绿光 546nm', 546.1, 5.490, 0.709, 0.712, 0.709, 0.710, 0.709],
  ['黄光 577nm', 577.0, 5.196, 0.590, 0.588, 0.592, 0.590, 0.588],
];

// 表 2: 伏安特性曲线记录数据 (λ = 405 nm)
export const PHOTOELECTRIC_DEFAULT_TABLE2 = [
  [-2.0, -0.05, -0.03],
  [-1.5, 0.00, 0.00],
  [-1.0, 0.12, 0.05],
  [-0.5, 0.85, 0.38],
  [0.0, 2.40, 1.10],
  [1.0, 6.50, 2.90],
  [2.0, 11.20, 5.10],
  [5.0, 22.80, 10.40],
  [10.0, 34.50, 15.80],
  [15.0, 41.20, 18.90],
  [20.0, 44.80, 20.50],
  [30.0, 46.50, 21.30],
];

export const photoelectricDefaultData: BenchmarkData = {
  datasetName: '哈工大大物实验光电效应法测普朗克常数官方标准基准数据',
  parameters: {
    distance: 40.0,
    aperture: 4.0,
    h_standard: 6.626,
  },
  tables: {
    table1_stopping_potential: PHOTOELECTRIC_DEFAULT_TABLE1,
    table2_volt_ampere: PHOTOELECTRIC_DEFAULT_TABLE2,
  },
};
