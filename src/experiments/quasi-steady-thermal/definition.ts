/**
 * 实验二十八：用准稳态法测定不良导体的比热容和导热系数 - 元数据与表格 Schema 定义
 * 文件路径: src/experiments/quasi-steady-thermal/definition.ts
 */

import { TableDefinition, ParameterDefinition } from '@/types/experiment';

// 实验仪器与不良导体样品参数定义（100% 还原实测报告参数）
export const QUASI_STEADY_PARAMETERS: ParameterDefinition[] = [
  {
    key: 'T0',
    name: '初始室温',
    symbol: 'T_0',
    defaultValue: 25.0,
    unit: '°C',
    step: 0.1,
    min: 0.0,
    max: 50.0,
    description: '实验初始环境温度及热电偶冷端保温杯恒定温度 (T0 = 25.0 °C)',
  },
  {
    key: 'U',
    name: '加热器工作电压',
    symbol: 'U',
    defaultValue: 20.0,
    unit: 'V',
    step: 0.1,
    min: 5.0,
    max: 50.0,
    description: '稳压电源加载在薄膜电加热器两端的工作电压 (U = 20.0 V)',
  },
  {
    key: 'S',
    name: '加热器面积',
    symbol: 'S',
    defaultValue: 0.0100,
    unit: 'm²',
    step: 0.0001,
    min: 0.0010,
    max: 0.1000,
    description: '方形薄膜加热器与样品的有效接触传热面积 (100 mm × 100 mm = 0.0100 m²)',
  },
  {
    key: 'k_tc',
    name: '铜-康铜热电偶温差电动势率',
    symbol: 'k_{\\text{tc}}',
    defaultValue: 0.040,
    unit: 'mV/°C',
    step: 0.001,
    min: 0.010,
    max: 0.100,
    description: '铜-康铜热电偶灵敏度系数 (0.040 mV/°C，即 1 mV 对应 25 °C 温差)',
  },
  {
    key: 'h1',
    name: '有机玻璃单块样品厚度',
    symbol: 'h_1',
    defaultValue: 0.0100,
    unit: 'm',
    step: 0.0001,
    min: 0.0010,
    max: 0.0500,
    description: '有机玻璃 (PMMA) 单块方形样品板厚度 (10.0 mm = 0.0100 m)',
  },
  {
    key: 'rho1',
    name: '有机玻璃密度',
    symbol: '\\rho_1',
    defaultValue: 1171,
    unit: 'kg/m³',
    step: 1,
    min: 500,
    max: 3000,
    description: '有机玻璃样品材料体密度 (ρ1 = 1171 kg/m³)',
  },
  {
    key: 'R1',
    name: '有机玻璃侧加热器电阻',
    symbol: 'R_1',
    defaultValue: 141.0,
    unit: 'Ω',
    step: 0.1,
    min: 10.0,
    max: 500.0,
    description: '有机玻璃测量组方形电加热器实测电阻 (R1 = 141.0 Ω)',
  },
  {
    key: 'h2',
    name: '橡胶单块样品厚度',
    symbol: 'h_2',
    defaultValue: 0.0100,
    unit: 'm',
    step: 0.0001,
    min: 0.0010,
    max: 0.0500,
    description: '橡胶单块方形样品板厚度 (10.0 mm = 0.0100 m)',
  },
  {
    key: 'rho2',
    name: '橡胶密度',
    symbol: '\\rho_2',
    defaultValue: 1401,
    unit: 'kg/m³',
    step: 1,
    min: 500,
    max: 3000,
    description: '橡胶样品材料体密度 (ρ2 = 1401 kg/m³)',
  },
  {
    key: 'R2',
    name: '橡胶侧加热器电阻',
    symbol: 'R_2',
    defaultValue: 140.1,
    unit: 'Ω',
    step: 0.1,
    min: 10.0,
    max: 500.0,
    description: '橡胶测量组方形电加热器实测电阻 (R2 = 140.1 Ω)',
  },
];

// 通用交替测量表格列定义生成器
function createAlternatingMeasurementColumns(sampleName: string): TableDefinition['columns'] {
  return [
    {
      key: 'no',
      title: '序号',
      symbol: 'i',
      unit: '',
      precision: 0,
      readOnly: true,
      tooltip: `${sampleName}测量点序号 (1 ~ 12)`,
    },
    {
      key: 't_dt',
      title: '温差测量时间',
      symbol: 't_{\\Delta T}',
      unit: 's',
      precision: 0,
      min: 0,
      max: 3600,
      step: 30,
      tooltip: '切换至温差电偶档位读取两面温差电动势的时刻 (s)',
    },
    {
      key: 'e_dt',
      title: '温差电偶读数',
      symbol: 'E_{\\Delta T}',
      unit: 'mV',
      precision: 3,
      step: 0.001,
      tooltip: '样品加热面与中心绝热面之间的温差热电偶电动势读数 (mV)',
    },
    {
      key: 'delta_t',
      title: '两面温差',
      symbol: '\\Delta T',
      unit: '°C',
      precision: 3,
      step: 0.001,
      tooltip: '样品加热面与中心面温差 ΔT = (E_ΔT - E_ΔT0) / k_tc (°C)，支持自动计算或手动录入',
    },
    {
      key: 't_center',
      title: '中心面测量时间',
      symbol: 't_T',
      unit: 's',
      precision: 0,
      min: 0,
      max: 3600,
      step: 30,
      tooltip: '切换至测温电偶档位读取中心面温度电动势的时刻 (s)',
    },
    {
      key: 'e_center',
      title: '中心面电偶读数',
      symbol: 'E_T',
      unit: 'mV',
      precision: 3,
      step: 0.001,
      tooltip: '样品中心绝热面相对于冷端保温杯的测温热电偶电动势读数 (mV)',
    },
    {
      key: 'temp_center',
      title: '中心面温度',
      symbol: 'T',
      unit: '°C',
      precision: 3,
      step: 0.001,
      tooltip: '样品中心绝热面温度 T = T0 + (E_T - E_T0) / k_tc (°C)，支持自动计算或手动录入',
    },
  ];
}

// 表 1: 有机玻璃样品准稳态法温差 ΔT 与中心面温度 T 交替测量表
export const TABLE1_PMMA: TableDefinition = {
  id: 'table1_pmma',
  title: '表 1 有机玻璃样品准稳态法温差 ΔT 与中心面温度 T 交替测量表',
  subtitle: 'h1 = 10.0 mm, ρ1 = 1171 kg/m³, R1 = 141.0 Ω, U = 20.0 V, 每隔 30 s 交替测量温差与中心面温度',
  description: '前 7 组为非稳态过渡段，后 5 组 (t_ΔT = 390~630 s, t_T = 420~660 s) 进入 ΔT 恒定、中心面温度线性上升的准稳态区间',
  defaultRowCount: 12,
  canAddRow: true,
  columns: createAlternatingMeasurementColumns('有机玻璃样品'),
};

// 表 2: 橡胶样品准稳态法温差 ΔT 与中心面温度 T 交替测量表
export const TABLE2_RUBBER: TableDefinition = {
  id: 'table2_rubber',
  title: '表 2 橡胶样品准稳态法温差 ΔT 与中心面温度 T 交替测量表',
  subtitle: 'h2 = 10.0 mm, ρ2 = 1401 kg/m³, R2 = 140.1 Ω, U = 20.0 V, 每隔 30 s 交替测量温差与中心面温度',
  description: '后 5 组 (t_ΔT = 390~630 s, t_T = 420~660 s) 温差恒定为 1.350 °C，中心面温度随时间呈显著线性上升',
  defaultRowCount: 12,
  canAddRow: true,
  columns: createAlternatingMeasurementColumns('橡胶样品'),
};

export const QUASI_STEADY_TABLES: TableDefinition[] = [
  TABLE1_PMMA,
  TABLE2_RUBBER,
];
