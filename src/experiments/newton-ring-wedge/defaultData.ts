/**
 * 实验二十二：光的等厚干涉现象与应用（牛顿环与劈尖）- 预置标准基准数据
 * 来源：哈工大大物教材第三版 p.151 与薪火笔记社实测数据
 * 文件路径: src/experiments/newton-ring-wedge/defaultData.ts
 */

import { BenchmarkData } from '@/types/experiment';

// 表 1: 牛顿环暗环测量数据 (m, Dm, m-5, D_{m-5})
export const NEWTON_DEFAULT_TABLE1 = [
  [1, 20, 10.994, 15, 9.563, 29.417],
  [2, 19, 10.446, 14, 9.229, 23.944], // m=19 跳变读数点
  [3, 18, 10.492, 13, 8.886, 31.121],
  [4, 17, 10.171, 12, 8.749, 26.904],
  [5, 16, 9.863, 11, 8.170, 30.530],
];

// 表 2: 劈尖干涉测量数据 (L, l)
export const NEWTON_DEFAULT_TABLE2 = [
  [43.095, 1.4656, 0.14656, 86.6],
];

export const newtonRingWedgeDefaultData: BenchmarkData = {
  datasetName: '哈工大大物实验等厚干涉官方标准基准数据',
  parameters: {
    lambda: 589.3,
    delta_m: 5,
    exclude_m19: 0,
  },
  tables: {
    table1_newton_rings: NEWTON_DEFAULT_TABLE1,
    table2_wedge: NEWTON_DEFAULT_TABLE2,
  },
};
