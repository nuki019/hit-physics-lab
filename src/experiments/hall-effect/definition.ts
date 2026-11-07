/**
 * 实验三十二：霍尔效应及其应用 - 元数据与表格 Schema 定义
 * 文件路径: src/experiments/hall-effect/definition.ts
 */

import { TableDefinition, ParameterDefinition } from '@/types/experiment';

// 仪器与环境物理参数
export const HALL_PARAMETERS: ParameterDefinition[] = [
  {
    key: 'd',
    name: '霍尔元件厚度',
    symbol: 'd',
    defaultValue: 0.20,
    unit: 'mm',
    step: 0.01,
    min: 0.01,
    max: 2.0,
    description: '半导体霍尔薄片标称厚度 (通常取 0.20 mm = 2.0e-4 m)',
  },
  {
    key: 'B_t1',
    name: '表1恒定磁感应强度',
    symbol: 'B',
    defaultValue: 100.0,
    unit: 'mT',
    step: 1.0,
    min: 10.0,
    max: 500.0,
    description: '表 1 测量时保持恒定的电磁铁气隙磁感应强度 (IM = 200 mA, B = 100 mT = 0.100 T)',
  },
  {
    key: 'IH_t2',
    name: '表2恒定工作电流',
    symbol: 'I_H',
    defaultValue: 3.0,
    unit: 'mA',
    step: 0.1,
    min: 0.1,
    max: 10.0,
    description: '表 2 测量时保持恒定的霍尔工作电流 (IH = 3.0 mA)',
  },
];

// 表 1: 保持磁场 B 不变，测量 UH 与 IH 的关系
export const TABLE1_UH_IH: TableDefinition = {
  id: 'table1_uh_ih',
  title: '表 1 保持磁场 B 不变，测量霍尔电压 UH 与工作电流 IH 的关系',
  subtitle: 'IM = 200 mA, B = 100 mT',
  description: '采用四次对称换向法消除不等位电势差与副效应误差',
  defaultRowCount: 5,
  canAddRow: true,
  columns: [
    {
      key: 'ih',
      title: '工作电流',
      symbol: 'I_H',
      unit: 'mA',
      precision: 2,
      min: 0,
      max: 10,
      step: 0.1,
      tooltip: '霍尔元件工作电流 IH (mA)',
    },
    {
      key: 'uh1',
      title: 'UH1 (+IH, +B)',
      symbol: 'U_{H1}',
      unit: 'mV',
      precision: 2,
      tooltip: '正向工作电流 +IH 与正向磁场 +B 时的测量电势差 (mV)',
    },
    {
      key: 'uh2',
      title: 'UH2 (-IH, +B)',
      symbol: 'U_{H2}',
      unit: 'mV',
      precision: 2,
      tooltip: '反向工作电流 -IH 与正向磁场 +B 时的测量电势差 (mV)',
    },
    {
      key: 'uh3',
      title: 'UH3 (+IH, -B)',
      symbol: 'U_{H3}',
      unit: 'mV',
      precision: 2,
      tooltip: '正向工作电流 +IH 与反向磁场 -B 时的测量电势差 (mV)',
    },
    {
      key: 'uh4',
      title: 'UH4 (-IH, -B)',
      symbol: 'U_{H4}',
      unit: 'mV',
      precision: 2,
      tooltip: '反向工作电流 -IH 与反向磁场 -B 时的测量电势差 (mV)',
    },
    {
      key: 'uh_avg',
      title: '换向平均电压',
      symbol: '\\bar{U}_H',
      unit: 'mV',
      precision: 3,
      readOnly: true,
      tooltip: '四次对称换向均值：0.25 * (UH1 - UH2 - UH3 + UH4)',
    },
  ],
};

// 表 2: 保持工作电流 IH 不变，测量 UH 与 B 的关系
export const TABLE2_UH_B: TableDefinition = {
  id: 'table2_uh_b',
  title: '表 2 保持工作电流 IH 不变，测量霍尔电压 UH 与磁感应强度 B 的关系',
  subtitle: 'IH = 3.0 mA, 励磁定标 B = 0.50 IM (mT)',
  description: '单向递增励磁电流避免铁芯磁滞；换向 IH 消除不等位电势差',
  defaultRowCount: 5,
  canAddRow: true,
  columns: [
    {
      key: 'im',
      title: '励磁电流',
      symbol: 'I_M',
      unit: 'mA',
      precision: 1,
      min: 0,
      max: 1000,
      step: 10,
      tooltip: '电磁铁励磁电流 IM (mA)',
    },
    {
      key: 'b',
      title: '磁感应强度',
      symbol: 'B',
      unit: 'mT',
      precision: 1,
      min: 0,
      max: 500,
      step: 5,
      tooltip: '由定标比 0.50 mT/mA 计算或高斯计实测的磁场 (mT)',
    },
    {
      key: 'uh1',
      title: 'UH1 (+IH, +B)',
      symbol: 'U_{H1}',
      unit: 'mV',
      precision: 2,
      tooltip: '正向工作电流时的电势差 (mV)',
    },
    {
      key: 'uh2',
      title: 'UH2 (-IH, +B)',
      symbol: 'U_{H2}',
      unit: 'mV',
      precision: 2,
      tooltip: '反向工作电流时的电势差 (mV)',
    },
    {
      key: 'uh_avg',
      title: '换向平均电压',
      symbol: '\\bar{U}',
      unit: 'mV',
      precision: 3,
      readOnly: true,
      tooltip: '换向均值：0.5 * (UH1 - UH2)',
    },
  ],
};

// 表 3: 梯度磁场下霍尔片位置定标曲线 r ~ UH 数据表
export const TABLE3_DISPLACEMENT: TableDefinition = {
  id: 'table3_displacement',
  title: '表 3 梯度磁场下霍尔片位置定标曲线 r ~ UH 数据表',
  subtitle: 'IH = 3.00 mA, 测微台沿垂直轴平移',
  description: '测定不同位移位置下的霍尔电压，构建微位移定标斜率',
  defaultRowCount: 5,
  canAddRow: true,
  columns: [
    {
      key: 'r',
      title: '霍尔片位移',
      symbol: 'r',
      unit: 'mm',
      precision: 2,
      min: -10,
      max: 10,
      step: 0.5,
      tooltip: '测微架读数位移 r (mm)',
    },
    {
      key: 'uh',
      title: '霍尔电压',
      symbol: 'U_H',
      unit: 'mV',
      precision: 2,
      tooltip: '对应位置实测霍尔电势差 (mV)',
    },
  ],
};

export const HALL_TABLES = [TABLE1_UH_IH, TABLE2_UH_B, TABLE3_DISPLACEMENT];
