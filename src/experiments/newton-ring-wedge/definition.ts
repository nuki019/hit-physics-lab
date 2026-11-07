/**
 * 实验二十二：光的等厚干涉现象与应用（牛顿环与劈尖）- 元数据与表格 Schema 定义
 * 文件路径: src/experiments/newton-ring-wedge/definition.ts
 */

import { TableDefinition, ParameterDefinition } from '@/types/experiment';

// 仪器与光学常数
export const NEWTON_PARAMETERS: ParameterDefinition[] = [
  {
    key: 'lambda',
    name: '钠黄光标准波长',
    symbol: '\\lambda',
    defaultValue: 589.3,
    unit: 'nm',
    step: 0.1,
    min: 400.0,
    max: 800.0,
    description: '低压钠灯双黄线平均波长 (589.3 nm = 5.893e-4 mm)',
  },
  {
    key: 'delta_m',
    name: '逐差级差',
    symbol: '\\Delta m',
    defaultValue: 5,
    unit: '',
    step: 1,
    min: 1,
    max: 10,
    description: '前后对半逐差暗环级数差 (Δm = 5)',
  },
  {
    key: 'exclude_m19',
    name: '剔除 m=19 异常跳变点',
    symbol: 'm=19',
    defaultValue: 0,
    unit: '',
    step: 1,
    min: 0,
    max: 1,
    description: '是否剔除第 2 组 (m=19) 显微镜跳级异常读数 (0=保留, 1=剔除)',
  },
];

// 表 1: 牛顿环测定平凸透镜曲率半径 R 数据表 (Δm = 5)
export const TABLE1_NEWTON_RINGS: TableDefinition = {
  id: 'table1_newton_rings',
  title: '表 1 牛顿环测定平凸透镜曲率半径 R 数据表（钠光 λ = 589.3 nm，Δm = 5）',
  subtitle: '消除中心接触变形附加厚度 e0',
  description: '逐差法对半相减：Dm² - D_{m-5}² = 20 R λ',
  defaultRowCount: 5,
  canAddRow: true,
  columns: [
    {
      key: 'idx',
      title: '组别',
      symbol: 'i',
      unit: '',
      precision: 0,
      readOnly: true,
      tooltip: '测量组别 1 ~ 5',
    },
    {
      key: 'm',
      title: '外环级数',
      symbol: 'm',
      unit: '',
      precision: 0,
      tooltip: '外环暗环干涉级数 m (20, 19, 18, 17, 16)',
    },
    {
      key: 'dm',
      title: '外环直径 Dm',
      symbol: 'D_m',
      unit: 'mm',
      precision: 3,
      step: 0.001,
      min: 0,
      max: 50.0,
      tooltip: '读数显微镜测量外环直径 Dm = |xR - xL| (mm)',
    },
    {
      key: 'm_5',
      title: '内环级数',
      symbol: 'm - 5',
      unit: '',
      precision: 0,
      tooltip: '内环暗环干涉级数 m - 5 (15, 14, 13, 12, 11)',
    },
    {
      key: 'dm_5',
      title: '内环直径 Dm-5',
      symbol: 'D_{m-5}',
      unit: 'mm',
      precision: 3,
      step: 0.001,
      min: 0,
      max: 50.0,
      tooltip: '读数显微镜测量内环直径 D_{m-5} (mm)',
    },
    {
      key: 'diff_sq',
      title: '直径平方差 ΔD²',
      symbol: 'D_m^2 - D_{m-5}^2',
      unit: 'mm²',
      precision: 3,
      readOnly: true,
      tooltip: '直径平方差：ΔDi² = Dm² - D_{m-5}² (mm²)',
    },
  ],
};

// 表 2: 劈尖干涉测定金属丝直径 d 数据表
export const TABLE2_WEDGE: TableDefinition = {
  id: 'table2_wedge',
  title: '表 2 劈尖干涉测定细金属丝直径 d 数据表',
  subtitle: '钠光 λ = 589.3 nm, 暗纹等厚干涉',
  description: '由单条纹间距 Δx 与劈尖长度 L 计算细金属丝直径 d = 5 L λ / l',
  defaultRowCount: 1,
  canAddRow: false,
  columns: [
    {
      key: 'L',
      title: '劈尖总长 L',
      symbol: 'L',
      unit: 'mm',
      precision: 3,
      step: 0.01,
      min: 1.0,
      max: 100.0,
      tooltip: '劈棱至金属丝垫片处几何距离 L (mm)',
    },
    {
      key: 'l',
      title: '10条暗纹总长 l',
      symbol: 'l',
      unit: 'mm',
      precision: 4,
      step: 0.001,
      min: 0.1,
      max: 20.0,
      tooltip: '读数显微镜测得连续 10 个条纹总跨距 l (mm)',
    },
    {
      key: 'delta_x',
      title: '单条纹间距 Δx',
      symbol: '\\Delta x',
      unit: 'mm',
      precision: 4,
      readOnly: true,
      tooltip: '相邻暗纹平均间距 Δx = l / 10 (mm)',
    },
    {
      key: 'd_um',
      title: '微丝直径 d',
      symbol: 'd',
      unit: 'μm',
      precision: 1,
      readOnly: true,
      tooltip: '由倾角关系反算的微丝直径 d (μm)',
    },
  ],
};

export const NEWTON_TABLES = [TABLE1_NEWTON_RINGS, TABLE2_WEDGE];
