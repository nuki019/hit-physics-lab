/**
 * 实验四十六：用光电效应法测定普朗克常量 - 元数据与表格 Schema 定义
 * 文件路径: src/experiments/photoelectric-planck/definition.ts
 */

import { TableDefinition, ParameterDefinition } from '@/types/experiment';

// 仪器与物理常数参数
export const PHOTOELECTRIC_PARAMETERS: ParameterDefinition[] = [
  {
    key: 'distance',
    name: '光源光电管距离',
    symbol: 'L',
    defaultValue: 40.0,
    unit: 'cm',
    step: 1.0,
    min: 20.0,
    max: 100.0,
    description: '汞灯出射狭缝到光电管暗盒入光孔的水平光路距离 (标称 40.0 cm)',
  },
  {
    key: 'aperture',
    name: '光阑孔径',
    symbol: '\\Phi',
    defaultValue: 4.0,
    unit: 'mm',
    step: 1.0,
    min: 2.0,
    max: 8.0,
    description: '装配在光电管入光窗口前的视场光阑孔径 (通常取 2 mm 或 4 mm)',
  },
  {
    key: 'h_standard',
    name: '普朗克常量理论标称值',
    symbol: 'h_0',
    defaultValue: 6.626,
    unit: '10^{-34} J·s',
    step: 0.001,
    min: 6.0,
    max: 7.0,
    description: '国际公认普朗克常数标准值: 6.62607015 × 10^{-34} J·s',
  },
];

// 表 1: 不同谱线截止电压 Ua 测量表
export const TABLE1_STOPPING_POTENTIAL: TableDefinition = {
  id: 'table1_stopping_potential',
  title: '表 1 不同谱线（365nm, 405nm, 436nm, 546nm, 577nm）反向截止电压 Ua 测量表',
  subtitle: 'L = 40.0 cm, 光阑孔径 Φ = 4 mm',
  description: '测量汞灯 5 条特征谱线的截止电压，由爱因斯坦光电方程 eUa = hν - W0 线性拟合计算普朗克常数 h',
  defaultRowCount: 5,
  canAddRow: true,
  columns: [
    {
      key: 'color',
      title: '谱线颜色',
      symbol: '\\text{Color}',
      unit: '',
      type: 'string',
      readOnly: true,
      tooltip: '水银放电灯发射的特征单色光谱',
    },
    {
      key: 'wavelength',
      title: '波长 λ',
      symbol: '\\lambda',
      unit: 'nm',
      precision: 1,
      min: 300,
      max: 800,
      step: 0.1,
      tooltip: '单色滤色片透射主波长 (nm)',
    },
    {
      key: 'frequency',
      title: '光频 ν',
      symbol: '\\nu',
      unit: '10^{14} Hz',
      precision: 3,
      readOnly: true,
      tooltip: '光子振动频率 ν = c / λ (10^14 Hz)',
    },
    {
      key: 'ua1',
      title: 'Ua1 (测量1)',
      symbol: 'U_{a1}',
      unit: 'V',
      precision: 3,
      step: 0.005,
      tooltip: '第一次反向截止电压读数 (V)',
    },
    {
      key: 'ua2',
      title: 'Ua2 (测量2)',
      symbol: 'U_{a2}',
      unit: 'V',
      precision: 3,
      step: 0.005,
      tooltip: '第二次反向截止电压读数 (V)',
    },
    {
      key: 'ua3',
      title: 'Ua3 (测量3)',
      symbol: 'U_{a3}',
      unit: 'V',
      precision: 3,
      step: 0.005,
      tooltip: '第三次反向截止电压读数 (V)',
    },
    {
      key: 'ua_avg',
      title: '截止电压均值',
      symbol: '\\bar{U}_a',
      unit: 'V',
      precision: 3,
      readOnly: true,
      tooltip: '三次测量算术均值: (Ua1 + Ua2 + Ua3) / 3',
    },
    {
      key: 'ua_fit',
      title: '线性拟合值',
      symbol: 'U_{a,\\text{fit}}',
      unit: 'V',
      precision: 3,
      readOnly: true,
      tooltip: '最小二乘直线回归计算值: Ua = k·ν + b',
    },
  ],
};

// 表 2: 光电管伏安特性曲线记录表
export const TABLE2_VOLT_AMPERE: TableDefinition = {
  id: 'table2_volt_ampere',
  title: '表 2 光电管伏安特性曲线 I ~ U 记录表',
  subtitle: 'λ = 405 nm (紫光), L = 40.0 cm, 分别在 Φ = 4 mm 与 Φ = 2 mm 下测定',
  description: '由反向减速电场逐步过渡到正向加速饱和电场，记录微弱光电管阳极电流变化',
  defaultRowCount: 12,
  canAddRow: true,
  columns: [
    {
      key: 'voltage',
      title: '外加电压 U',
      symbol: 'U',
      unit: 'V',
      precision: 2,
      min: -10,
      max: 50,
      step: 0.5,
      tooltip: '光电管阴阳极间外加电压 (负值为反向减速电场，正值为正向加速电场)',
    },
    {
      key: 'current_4mm',
      title: '光电流 (Φ=4mm)',
      symbol: 'I_1',
      unit: '10^{-11} A',
      precision: 2,
      tooltip: '大光阑 (Φ = 4 mm) 测量下的光电流 (10^{-11} A)',
    },
    {
      key: 'current_2mm',
      title: '光电流 (Φ=2mm)',
      symbol: 'I_2',
      unit: '10^{-11} A',
      precision: 2,
      tooltip: '小光阑 (Φ = 2 mm) 测量下的光电流 (10^{-11} A)',
    },
  ],
};

export const PHOTOELECTRIC_TABLES = [TABLE1_STOPPING_POTENTIAL, TABLE2_VOLT_AMPERE];
