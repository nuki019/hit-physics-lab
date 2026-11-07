/**
 * 实验五十八：光纤传输技术 - 预置标准基准数据
 * 来源：哈工大大物教材第三版 p.319 与薪火笔记社官方参考数据
 * 文件路径: src/experiments/optical-fiber/defaultData.ts
 */

import { BenchmarkData } from '@/types/experiment';

export const OPTICAL_FIBER_DEFAULT_TABLE1 = [
  [1, 10.0, 4.22, 0.2110, 0.2064],
  [2, 20.0, 8.35, 0.2088, 0.2043],
  [3, 30.0, 12.50, 0.2083, 0.2039],
  [4, 40.0, 16.70, 0.2088, 0.2043],
  [5, 50.0, 20.85, 0.2085, 0.2040],
];

export const OPTICAL_FIBER_DEFAULT_TABLE2 = [
  ['长光纤 L1', 1000.0, 500.00, 282.50, 2.48, 2.48],
  ['短光纤 L2', 2.0, 500.00, 498.50, 0.01, 6.51],
  ['剪断法差值 ΔL', 998.0, 498.50, 282.50, 2.47, 2.47],
];

export const OPTICAL_FIBER_DEFAULT_TABLE3 = [
  [1.0, 1.00, 20.0, 0.89, -1.01, '正弦波形完整无失真'],
  [5.0, 1.00, 20.0, 0.88, -1.11, '正弦波形完整无失真'],
  [10.0, 1.00, 20.0, 0.87, -1.21, '正弦波形完整无失真'],
  [20.0, 1.00, 20.0, 0.84, -1.51, '正弦波形完整无失真'],
  [50.0, 1.00, 20.0, 0.72, -2.85, '高频幅度微有衰减(-2.85dB)'],
];

export const opticalFiberDefaultData: BenchmarkData = {
  datasetName: '哈工大大物实验光纤传输技术官方标准基准数据',
  parameters: {
    fiber_core_index: 1.480,
    laser_wavelength: 650.0,
    core_diameter: 50.0,
  },
  tables: {
    table1_na_measurement: OPTICAL_FIBER_DEFAULT_TABLE1,
    table2_attenuation: OPTICAL_FIBER_DEFAULT_TABLE2,
    table3_modulation: OPTICAL_FIBER_DEFAULT_TABLE3,
  },
};
