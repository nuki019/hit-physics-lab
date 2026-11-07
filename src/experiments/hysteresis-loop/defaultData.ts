/**
 * 实验三十三：用示波器观测动态磁滞回线 - 预置标准基准数据
 * 来源：哈工大大物教材第三版 p.199 与薪火笔记社实测数据
 * 文件路径: src/experiments/hysteresis-loop/defaultData.ts
 */

import { BenchmarkData } from '@/types/experiment';

// 表 1: 基本磁化曲线原始实测数据 [no, u_in, ux_m, uy_m]
export const HYSTERESIS_DEFAULT_TABLE1 = [
  [1, 0.50, 0.030, 0.015],
  [2, 0.80, 0.052, 0.032],
  [3, 1.20, 0.080, 0.054],
  [4, 1.60, 0.120, 0.068],
  [5, 2.00, 0.170, 0.076],
  [6, 2.50, 0.240, 0.082],
  [7, 3.00, 0.330, 0.086],
  [8, 3.50, 0.440, 0.089],
];

// 表 2: 饱和磁滞回线特征交点与回线网格面积 [param_key, param_name, u_meas, calc_val, unit, note]
export const HYSTERESIS_DEFAULT_TABLE2: any[][] = [
  ['Hs', '饱和磁场强度 Hs', 0.440, 366.7, 'A/m', 'Hs = KH * Uxsm (最大励磁状态下 X 轴顶点电压)'],
  ['Bs', '饱和磁感应强度 Bs', 0.089, 1.394, 'T', 'Bs = KB * Uysm (最大励磁状态下 Y 轴顶点电压)'],
  ['Br', '剩磁 Br', 0.058, 0.909, 'T', 'Br = KB * Uyr (H=0 时回线与 Y 轴交点电压)'],
  ['Hc', '矫顽力 Hc', 0.046, 38.3, 'A/m', 'Hc = KH * Uxc (B=0 时回线与 X 轴交点电压)'],
  ['Sxy', '示波器回线积分面积 Sxy', 0.00762, 99.49, 'J/m³', 'wh = KH * KB * Sxy (每个交变周期单位体积的磁滞损耗功)'],
];

export const hysteresisDefaultData: BenchmarkData = {
  datasetName: '哈工大大物实验动态磁滞回线官方标准基准数据',
  parameters: {
    N1: 100,
    N2: 150,
    L: 60.0,
    S: 2.00,
    R1: 2.0,
    R2: 100.0,
    C: 4.70,
    freq: 50.0,
  },
  tables: {
    table1_magnetization_curve: HYSTERESIS_DEFAULT_TABLE1,
    table2_hysteresis_params: HYSTERESIS_DEFAULT_TABLE2,
  },
};
