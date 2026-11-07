/**
 * 实验四十九：全息照相 - 元数据与表格 Schema 定义
 * 文件路径: src/experiments/holography/definition.ts
 */

import { TableDefinition, ParameterDefinition } from '@/types/experiment';

// 仪器与光路物理参数
export const HOLOGRAPHY_PARAMETERS: ParameterDefinition[] = [
  {
    key: 'laser_wavelength',
    name: '激光波长',
    symbol: '\\lambda',
    defaultValue: 632.8,
    unit: 'nm',
    step: 0.1,
    min: 400.0,
    max: 800.0,
    description: '氦氖 (He-Ne) 气体激光器主辐射波长 (标称 632.8 nm)',
  },
  {
    key: 'plate_res_limit',
    name: '全息底片极限分辨率',
    symbol: 'N_{\\text{limit}}',
    defaultValue: 3000,
    unit: 'lines/mm',
    step: 100,
    min: 1000,
    max: 6000,
    description: '天津 I 型等超细微颗粒银盐全息干板的分辨率极限 (通常 ≥ 3000 线/毫米)',
  },
  {
    key: 'plate_width',
    name: '全息干板有效宽度',
    symbol: 'W',
    defaultValue: 60.0,
    unit: 'mm',
    step: 1.0,
    min: 20.0,
    max: 120.0,
    description: '全息感光干板感光区域横向几何尺寸 (标称 60.0 mm)',
  },
  {
    key: 'object_distance',
    name: '物面到全息底片距离',
    symbol: 'D',
    defaultValue: 150.0,
    unit: 'mm',
    step: 5.0,
    min: 50.0,
    max: 500.0,
    description: '漫反射立体实物中心至全息感光平面的垂轴轴向距离 (标称 150.0 mm)',
  },
];

// 表 1: 光路几何与相干光强比记录表
export const TABLE1_OPTICAL_PATH: TableDefinition = {
  id: 'table1_optical_path',
  title: '表 1 全息照相光路几何、光程差与光强比测量记录表',
  subtitle: 'He-Ne 激光 λ = 632.8 nm, 漫反射物体透射全息光路',
  description: '测量物光路与参考光路各几何分段，检验光程差 |ΔL| ≤ 2.0 cm 以及光强比 K = IR / IO 是否落在 4:1 ~ 10:1 线性动态区间',
  defaultRowCount: 6,
  canAddRow: true,
  columns: [
    {
      key: 'item',
      title: '测量参数项',
      symbol: '\\text{Item}',
      unit: '',
      type: 'string',
      readOnly: true,
      tooltip: '光路几何参数或光强测量项目',
    },
    {
      key: 'measured',
      title: '实测数值',
      symbol: 'X_{\\text{meas}}',
      unit: '',
      precision: 2,
      step: 0.1,
      tooltip: '学生实验现场激光测距或照度计实测读数',
    },
    {
      key: 'unit',
      title: '单位',
      symbol: '\\text{Unit}',
      unit: '',
      type: 'string',
      readOnly: true,
      tooltip: '物理量单位',
    },
    {
      key: 'criterion',
      title: '技术标准与要求',
      symbol: '\\text{Spec}',
      unit: '',
      type: 'string',
      readOnly: true,
      tooltip: '全息照相干涉记录规范标准',
    },
    {
      key: 'status',
      title: '合规校验',
      symbol: '\\text{Status}',
      unit: '',
      type: 'string',
      readOnly: true,
      tooltip: '是否符合全息相干长度或曝光动态线性范围要求',
    },
  ],
};

// 表 2: 不同物光与参考光夹角下干涉条纹特性表
export const TABLE2_SPATIAL_FREQUENCY: TableDefinition = {
  id: 'table2_spatial_frequency',
  title: '表 2 不同物光与参考光夹角下干涉条纹间距与空间频率特性表',
  subtitle: 'λ = 632.8 nm, d = λ / (2 sin(θ/2)), 空间频率 f = 1/d',
  description: '分析不同物光与参考光夹角 θ 对全息底片微观干涉条纹密度的影响，并与底片极限分辨率做裕量评定',
  defaultRowCount: 5,
  canAddRow: true,
  columns: [
    {
      key: 'theta',
      title: '夹角 θ',
      symbol: '\\theta',
      unit: '°',
      precision: 1,
      min: 10,
      max: 90,
      step: 1.0,
      tooltip: '参考光束轴线与物光束轴线交汇夹角 (°)',
    },
    {
      key: 'half_sin',
      title: 'sin(θ/2)',
      symbol: '\\sin(\\theta/2)',
      unit: '',
      precision: 4,
      readOnly: true,
      tooltip: '半角正弦值',
    },
    {
      key: 'fringe_spacing',
      title: '条纹间距 d',
      symbol: 'd',
      unit: 'μm',
      precision: 3,
      readOnly: true,
      tooltip: '微观明暗干涉条纹空间几何间距 (μm)',
    },
    {
      key: 'spatial_frequency',
      title: '空间频率 f',
      symbol: 'f',
      unit: 'lines/mm',
      precision: 1,
      readOnly: true,
      tooltip: '每毫米微观干涉条纹线对数 (lines/mm)',
    },
    {
      key: 'margin',
      title: '分辨率安全裕量比',
      symbol: 'N_{\\text{lim}}/f',
      unit: '',
      precision: 2,
      readOnly: true,
      tooltip: '底片极限分辨率 (3000 lines/mm) 与当前空间频率之比 (> 1.5 为安全合格)',
    },
  ],
};

export const HOLOGRAPHY_TABLES = [TABLE1_OPTICAL_PATH, TABLE2_SPATIAL_FREQUENCY];
