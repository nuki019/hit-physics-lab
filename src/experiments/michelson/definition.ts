/**
 * 实验三十六：迈克耳孙干涉仪 - 元数据与表格 Schema 定义
 * 文件路径: src/experiments/michelson/definition.ts
 */

import { TableDefinition, ParameterDefinition } from '@/types/experiment';

// 仪器与物理常数
export const MICHELSON_PARAMETERS: ParameterDefinition[] = [
  {
    key: 'lambda0',
    name: 'He-Ne激光标准波长',
    symbol: '\\lambda_0',
    defaultValue: 632.8,
    unit: 'nm',
    step: 0.1,
    min: 400.0,
    max: 800.0,
    description: '氦氖激光器理论波长基准值 (632.8 nm)',
  },
  {
    key: 'lever_ratio',
    name: '测微丝杆杠杆传动比',
    symbol: 'K',
    defaultValue: 0.05,
    unit: '',
    step: 0.01,
    min: 0.01,
    max: 1.0,
    description: '动镜微调机构机械传动比 (1:20 = 0.05)',
  },
  {
    key: 'delta_N',
    name: '逐差条纹跨度',
    symbol: '\\Delta N',
    defaultValue: 150,
    unit: '条',
    step: 10,
    min: 50,
    max: 500,
    description: '前后对半逐差跨越的干涉圆环条数 (ΔN = 150 条)',
  },
  {
    key: 'gas_cell_length',
    name: '气体样品池物理长度',
    symbol: 'l',
    defaultValue: 80.0,
    unit: 'mm',
    step: 1.0,
    min: 10.0,
    max: 200.0,
    description: '折射率测量气室几何长度 (l = 80.0 mm)',
  },
  {
    key: 'p_atm',
    name: '当地标准大气压',
    symbol: 'P_{\\mathrm{atm}}',
    defaultValue: 760.0,
    unit: 'mmHg',
    step: 1.0,
    min: 600.0,
    max: 800.0,
    description: '实验室当地大气压强 (760.0 mmHg)',
  },
];

// 表 1: 测量 He-Ne 激光波长（逐差法，传动比 1:20，ΔN = 150）
export const TABLE1_MICHELSON_WAVELENGTH: TableDefinition = {
  id: 'table1_wavelength',
  title: '表 1 逐差法测定 He-Ne 激光波长（传动比 1:20，ΔN = 150 条）',
  subtitle: '激光理论波长 λ0 = 632.8 nm',
  description: '每吞吐 50 条条纹记录一次鼓轮读数，前后对半逐差消除空回误差',
  defaultRowCount: 6,
  canAddRow: false,
  columns: [
    {
      key: 'idx',
      title: '测量序号',
      symbol: 'i',
      unit: '',
      precision: 0,
      readOnly: true,
      tooltip: '测量点序号 1 ~ 6',
    },
    {
      key: 'ni',
      title: '条纹读数',
      symbol: 'n_i',
      unit: '条',
      precision: 0,
      tooltip: '干涉条纹吞吐累计数 [0, 50, 100, 150, 200, 250]',
    },
    {
      key: 'pos',
      title: '鼓轮读数',
      symbol: 'x_i',
      unit: 'mm',
      precision: 4,
      step: 0.001,
      min: 0,
      max: 25.0,
      tooltip: '测微千分尺鼓轮读数 xi (mm)',
    },
    {
      key: 'diff',
      title: '逐差位移',
      symbol: '\\Delta x_i',
      unit: 'mm',
      precision: 4,
      readOnly: true,
      tooltip: '逐差项：Δxi = x_{i+3} - x_i (跨越 150 条条纹)',
    },
  ],
};

// 表 2: 测定空气折射率 n 数据表
export const TABLE2_MICHELSON_REFRACTION: TableDefinition = {
  id: 'table2_refraction',
  title: '表 2 气压差法测定空气折射率 n 数据表',
  subtitle: '气室长 l = 80.0 mm, Patm = 760 mmHg',
  description: '气室压强差 P 与条纹移动数 N 线性拟合测定折射率增量',
  defaultRowCount: 6,
  canAddRow: true,
  columns: [
    {
      key: 'pressure',
      title: '压强变化',
      symbol: 'P',
      unit: 'mmHg',
      precision: 1,
      min: 0,
      max: 760,
      step: 10,
      tooltip: 'U型管水银压强差或压力表读数 P (mmHg)',
    },
    {
      key: 'stripes',
      title: '条纹移动数',
      symbol: 'N',
      unit: '条',
      precision: 1,
      min: 0,
      max: 100,
      step: 1,
      tooltip: '对应压强下视场中心干涉条纹移动吞吐总数 N (条)',
    },
  ],
};

export const MICHELSON_TABLES = [TABLE1_MICHELSON_WAVELENGTH, TABLE2_MICHELSON_REFRACTION];
