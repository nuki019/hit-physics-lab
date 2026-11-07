/**
 * 实验三十六：迈克耳孙干涉仪 - 预置标准基准数据
 * 来源：哈工大大物教材第三版 p.211 与薪火笔记社实测数据
 * 文件路径: src/experiments/michelson/defaultData.ts
 */

import { BenchmarkData } from '@/types/experiment';

// 表 1: 测量 He-Ne 激光波长逐差数据 (鼓轮读数 x_i in mm)
export const MICHELSON_DEFAULT_TABLE1 = [
  [1, 0, 5.811, 0.841],
  [2, 50, 6.083, 0.872],
  [3, 100, 6.371, 0.877],
  [4, 150, 6.652, null],
  [5, 200, 6.955, null],
  [6, 250, 7.248, null],
];

// 表 2: 气压变化 P (mmHg) 与干涉条纹移动数 N (条)
export const MICHELSON_DEFAULT_TABLE2 = [
  [0, 0],
  [50, 3],
  [100, 7],
  [150, 13],
  [200, 16],
  [250, 21],
];

export const michelsonDefaultData: BenchmarkData = {
  datasetName: '哈工大大物实验迈克耳逊干涉仪官方标准基准数据',
  parameters: {
    lambda0: 632.8,
    lever_ratio: 0.05,
    delta_N: 150,
    gas_cell_length: 80.0,
    p_atm: 760.0,
  },
  tables: {
    table1_wavelength: MICHELSON_DEFAULT_TABLE1,
    table2_refraction: MICHELSON_DEFAULT_TABLE2,
  },
};
