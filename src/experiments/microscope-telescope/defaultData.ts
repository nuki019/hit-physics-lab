/**
 * 实验二十一：自组显微镜和望远镜 - 预置标准基准数据
 * 来源：哈工大大物教材第三版 p.146 与薪火笔记社实测数据
 * 文件路径: src/experiments/microscope-telescope/defaultData.ts
 */

import { BenchmarkData } from '@/types/experiment';

// 表 1: 自组开普勒与伽利略望远镜数据 [type_key, type_name, f_obj, f_eye, d_meas, y_image, y_object, image_nature]
export const TELESCOPE_DEFAULT_TABLE1: any[][] = [
  ['keplerian', '开普勒望远镜', 150.0, 45.0, 196.2, 3.0, 10.0, '倒立放大虚像 (视场大, 适于装十字叉丝测微)'],
  ['galilean', '伽利略望远镜', 150.0, -45.0, 104.5, 3.0, 9.8, '正立放大虚像 (镜筒短, 出瞳在镜内, 视场较小)'],
];

// 表 2: 自组复式显微镜光学间隔与放大率测量数据 [no, delta, u_obj, y0_obj, y_prime, y_reticle]
export const MICROSCOPE_DEFAULT_TABLE2: any[][] = [
  [1, 60.0, 78.8, 1.00, 1.34, 7.4],
  [2, 80.0, 70.3, 1.00, 1.78, 9.8],
  [3, 100.0, 65.3, 1.00, 2.23, 12.3],
  [4, 120.0, 61.9, 1.00, 2.68, 14.8],
];

export const microscopeTelescopeDefaultData: BenchmarkData = {
  datasetName: '哈工大大物实验自组显微镜与望远镜官方标准基准数据',
  parameters: {
    D0: 250.0,
    f_obj_k: 150.0,
    f_eye_k: 45.0,
    f_obj_g: 150.0,
    f_eye_g: -45.0,
    f1_micro: 45.0,
    f2_micro: 45.0,
  },
  tables: {
    table1_telescopes: TELESCOPE_DEFAULT_TABLE1,
    table2_microscope: MICROSCOPE_DEFAULT_TABLE2,
  },
};
