/**
 * 实验三十二：霍尔效应及其应用 - 预置标准基准数据
 * 来源：哈工大大物教材第三版 p.196 与薪火笔记社实测数据
 * 文件路径: src/experiments/hall-effect/defaultData.ts
 */

import { BenchmarkData } from '@/types/experiment';

// 表 1: UH ~ IH 原始测量数据 (IM = 200 mA, B = 100 mT)
export const HALL_DEFAULT_TABLE1 = [
  [2.0, 15.5, -22.4, -15.2, 22.7, 18.95],
  [2.5, 19.5, -27.9, -19.0, 28.5, 23.725],
  [3.0, 23.5, -33.4, -22.7, 34.5, 28.525],
  [3.5, 27.5, -38.9, -26.5, 40.1, 33.25],
  [4.0, 31.8, -43.8, -29.9, 46.0, 37.875],
];

// 表 2: UH ~ B 原始测量数据 (IH = 3.0 mA)
export const HALL_DEFAULT_TABLE2 = [
  [100, 50, 22.7, -22.7, 22.7],
  [200, 100, 40.3, -40.3, 40.3],
  [300, 150, 58.2, -58.3, 58.25],
  [400, 200, 76.1, -76.1, 76.1],
  [500, 250, 94.3, -94.4, 94.35],
];

// 表 3: 梯度磁场位置定标数据 (IH = 3.00 mA)
export const HALL_DEFAULT_TABLE3 = [
  [-2, 15.9],
  [-1, 7.7],
  [0, 0.0],
  [1, -7.4],
  [2, -14.6],
];

export const hallDefaultData: BenchmarkData = {
  datasetName: '哈工大大物实验霍尔效应官方标准基准数据',
  parameters: {
    d: 0.20,
    B_t1: 100.0,
    IH_t2: 3.0,
  },
  tables: {
    table1_uh_ih: HALL_DEFAULT_TABLE1,
    table2_uh_b: HALL_DEFAULT_TABLE2,
    table3_displacement: HALL_DEFAULT_TABLE3,
  },
};
