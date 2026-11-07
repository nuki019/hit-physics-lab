/**
 * 实验四十五：用密立根油滴法测定电子电荷 - 预置标准基准数据
 * 来源：哈工大大物教材第三版 p.255 与薪火笔记社实测数据
 * 文件路径: src/experiments/millikan-oil-drop/defaultData.ts
 */

import { BenchmarkData } from '@/types/experiment';

// 表 1: 5 组典型测量油滴数据 [drop_no, u_balance, t_fall] (l = 1.50 mm, d = 5.00 mm)
// 分别对应电子量子数 n = 2, 3, 4, 5, 6 的经典测量点
export const MILLIKAN_DEFAULT_TABLE1: any[][] = [
  [1, 232.8, 22.50],
  [2, 216.5, 18.20],
  [3, 210.9, 15.40],
  [4, 193.6, 14.10],
  [5, 187.5, 12.80],
];

export const millikanDefaultData: BenchmarkData = {
  datasetName: '哈工大大物实验密立根油滴法测定电子电荷官方标准基准数据',
  parameters: {
    d: 5.00,
    l: 1.50,
    rho_oil: 981.0,
    rho_air: 1.20,
    g: 9.80,
    eta: 1.83e-5,
    b_const: 8.23e-3,
    p_atm: 1.013e5,
    e_std: 1.602e-19,
  },
  tables: {
    table1_oil_drop: MILLIKAN_DEFAULT_TABLE1,
  },
};
