/**
 * 实验十七：探究乐音 - 预置标准基准数据
 * 来源：哈工大大物教材第三版 p.128 与薪火笔记社实测数据
 * 文件路径: src/experiments/musical-sound/defaultData.ts
 */

import { BenchmarkData } from '@/types/experiment';

// 表 1: 弦振动基频与张力关系 [no, m_weight, f_res] (L = 0.600 m)
export const MUSICAL_DEFAULT_TABLE1: any[][] = [
  [1, 0.200, 52.9],
  [2, 0.300, 64.8],
  [3, 0.400, 74.8],
  [4, 0.500, 83.6],
  [5, 0.600, 91.6],
  [6, 0.700, 99.0],
];

// 表 2: 弦振动基频与有效弦长关系 [no, length, f_res] (M = 0.500 kg, T = 4.90 N)
export const MUSICAL_DEFAULT_TABLE2: any[][] = [
  [1, 0.700, 71.7],
  [2, 0.600, 83.6],
  [3, 0.500, 100.3],
  [4, 0.400, 125.4],
  [5, 0.350, 143.3],
  [6, 0.300, 167.2],
];

// 表 3: 典型乐音（吉他 A2 弦音）傅里叶泛音分量 [n, harmonic_name, f_meas, amplitude]
export const MUSICAL_DEFAULT_TABLE3: any[][] = [
  [1, '基波 (基音)', 110.0, 100.0],
  [2, '二次谐波 (第一泛音)', 220.4, 72.5],
  [3, '三次谐波 (第二泛音)', 331.1, 45.0],
  [4, '四次谐波 (第三泛音)', 442.2, 28.0],
  [5, '五次谐波 (第四泛音)', 553.6, 18.5],
  [6, '六次谐波 (第五泛音)', 665.3, 9.2],
];

export const musicalDefaultData: BenchmarkData = {
  datasetName: '哈工大大物实验探究乐音官方标准基准数据',
  parameters: {
    L_t1: 0.600,
    M_t2: 0.500,
    g: 9.80,
    f1_sound: 110.0,
  },
  tables: {
    table1_tension_freq: MUSICAL_DEFAULT_TABLE1,
    table2_length_freq: MUSICAL_DEFAULT_TABLE2,
    table3_overtone_spectrum: MUSICAL_DEFAULT_TABLE3,
  },
};
