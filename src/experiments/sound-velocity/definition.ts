/**
 * 实验二十九：测定空气中的声速 - 元数据与表格 Schema 定义
 * 文件路径: src/experiments/sound-velocity/definition.ts
 */

import { TableDefinition, ParameterDefinition } from '@/types/experiment';

// 实验仪器与物理环境参数定义
export const SOUND_VELOCITY_PARAMETERS: ParameterDefinition[] = [
  {
    key: 'temp_c',
    name: '实验室室温',
    symbol: 't',
    defaultValue: 26.0,
    unit: '°C',
    step: 0.1,
    min: -10.0,
    max: 50.0,
    description: '实验室内摄氏温度 t (用于修正当前温度下理论空气声速 v0)',
  },
  {
    key: 'freq_khz',
    name: '超声波信号源频率',
    symbol: 'f',
    defaultValue: 37.0,
    unit: 'kHz',
    step: 0.01,
    min: 20.0,
    max: 60.0,
    description: '压电陶瓷换能器谐振工作频率 f (默认 37.00 kHz = 37000 Hz)',
  },
  {
    key: 'v_0C',
    name: '0 °C 标准空气声速',
    symbol: 'v_{00}',
    defaultValue: 331.45,
    unit: 'm/s',
    step: 0.01,
    min: 320.0,
    max: 340.0,
    description: '标准大气压、0 °C 干燥空气中的理论声速基准值 (331.45 m/s)',
  },
];

// 表 1：极值法（驻波共振法）测定半波长数据表（14 行，i = 1 ~ 14）
export const TABLE1_SOUND_EXTREMA: TableDefinition = {
  id: 'table1_extrema',
  title: '表 1 极值法（驻波共振法）测定半波长数据表',
  subtitle: '信号源频率 f = 37.00 kHz，室温 t = 26.0 °C',
  description: '记录正、反向移动接收换能器时各波腹（电压极大值）位置读数，取均值消除丝杆空回误差并作最小二乘线性回归',
  defaultRowCount: 14,
  canAddRow: false,
  columns: [
    {
      key: 'i',
      title: '波腹序号',
      symbol: 'i',
      unit: '',
      precision: 0,
      readOnly: true,
      tooltip: '驻波极大值位置序号 i (1 ~ 14)',
    },
    {
      key: 'x1',
      title: '正向读数',
      symbol: 'x_{i,1}',
      unit: 'mm',
      precision: 3,
      step: 0.001,
      min: 0,
      max: 200.0,
      tooltip: '正向单向移动换能器时的游标/鼓轮位置读数 x_{i,1} (mm)',
    },
    {
      key: 'x2',
      title: '反向读数',
      symbol: 'x_{i,2}',
      unit: 'mm',
      precision: 3,
      step: 0.001,
      min: 0,
      max: 200.0,
      tooltip: '反向单向移动换能器时的游标/鼓轮位置读数 x_{i,2} (mm)',
    },
    {
      key: 'x_avg',
      title: '平均位置',
      symbol: '\\bar{x}_i',
      unit: 'mm',
      type: 'calculated',
      precision: 3,
      readOnly: true,
      tooltip: '正反向平均位置 x̄_i = (x_{i,1} + x_{i,2}) / 2 (mm)',
    },
  ],
};

// 表 2：相位比较法（李萨如图形法）测定半波长数据表（14 行，i = 1 ~ 14）
export const TABLE2_SOUND_PHASE: TableDefinition = {
  id: 'table2_phase',
  title: '表 2 相位比较法（李萨如图形法）测定半波长数据表',
  subtitle: '信号源频率 f = 37.00 kHz，室温 t = 26.0 °C',
  description: '观察示波器 X-Y 模式李萨如图形退化为斜直线（相位差 Δφ = nπ）时的正反向位置读数，通过最小二乘法拟合半波长',
  defaultRowCount: 14,
  canAddRow: false,
  columns: [
    {
      key: 'i',
      title: '序号',
      symbol: 'i',
      unit: '',
      precision: 0,
      readOnly: true,
      tooltip: '李萨如图形共线点序号 i (1 ~ 14)',
    },
    {
      key: 'x1',
      title: '正向读数',
      symbol: 'x_{i,1}',
      unit: 'mm',
      precision: 3,
      step: 0.001,
      min: 0,
      max: 200.0,
      tooltip: '正向移动换能器至李萨如图形退化为直线时的位置读数 x_{i,1} (mm)',
    },
    {
      key: 'x2',
      title: '反向读数',
      symbol: 'x_{i,2}',
      unit: 'mm',
      precision: 3,
      step: 0.001,
      min: 0,
      max: 200.0,
      tooltip: '反向移动换能器至李萨如图形退化为直线时的位置读数 x_{i,2} (mm)',
    },
    {
      key: 'x_avg',
      title: '平均位置',
      symbol: '\\bar{x}_i',
      unit: 'mm',
      type: 'calculated',
      precision: 3,
      readOnly: true,
      tooltip: '正反向平均位置 x̄_i = (x_{i,1} + x_{i,2}) / 2 (mm)',
    },
  ],
};

// 表 3：波形移动法（每隔 10 个完整周期读数）与超声波驻波悬浮小球位置表（5 行）
export const TABLE3_SOUND_WAVEFORM: TableDefinition = {
  id: 'table3_waveform',
  title: '表 3 波形移动法（隔 10 周期读数）与超声波驻波悬浮小球位置表',
  subtitle: '波形移动跨度 ΔN = 10 λ，竖直声场测定泡沫小球悬浮间距',
  description: '记录示波器双踪波形同相移动 10 个完整周期的始末位置（3 组），以及超声波驻波声场中 5 个相邻悬浮平衡点坐标',
  defaultRowCount: 5,
  canAddRow: false,
  columns: [
    {
      key: 'group',
      title: '组别',
      symbol: 'k',
      unit: '',
      precision: 0,
      readOnly: true,
      tooltip: '测量组别 k (1 ~ 5)',
    },
    {
      key: 'wf_x',
      title: '波形移动始端',
      symbol: 'x_k',
      unit: 'mm',
      precision: 3,
      step: 0.001,
      min: 0,
      max: 250.0,
      tooltip: '波形移动法起始同相点位置读数 x_k (mm，前 3 组有效)',
    },
    {
      key: 'wf_x_prime',
      title: '隔 10 周期终端',
      symbol: "x_k'",
      unit: 'mm',
      precision: 3,
      step: 0.001,
      min: 0,
      max: 250.0,
      tooltip: "连续移动跨越 10 个完整波形周期后的终端位置读数 x_k' (mm，前 3 组有效)",
    },
    {
      key: 'wf_diff',
      title: '10 波长间距',
      symbol: '\\Delta x_k',
      unit: 'mm',
      type: 'calculated',
      precision: 3,
      readOnly: true,
      tooltip: "跨越 10 个波长的位移差 Δx_k = x_k - x_k' (mm)",
    },
    {
      key: 'lev_x',
      title: '驻波悬浮小球位置',
      symbol: 'x_{\\text{浮},k}',
      unit: 'mm',
      precision: 2,
      step: 0.01,
      min: 0,
      max: 200.0,
      tooltip: '竖直驻波声场中泡沫塑料小球稳定悬浮的第 k 个波节平衡位置坐标 (mm)',
    },
  ],
};

export const SOUND_VELOCITY_TABLES: TableDefinition[] = [
  TABLE1_SOUND_EXTREMA,
  TABLE2_SOUND_PHASE,
  TABLE3_SOUND_WAVEFORM,
];
