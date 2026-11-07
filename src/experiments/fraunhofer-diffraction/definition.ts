/**
 * 实验二十四：单缝和圆孔的夫琅禾费衍射 - 元数据与表格 Schema 定义
 * 100% 对齐哈工大高分真实实验报告（9.8分）实测参数与数据结构
 * 文件路径: src/experiments/fraunhofer-diffraction/definition.ts
 */

import { TableDefinition, ParameterDefinition } from '@/types/experiment';

// 1. 实验仪器与光学实测环境参数 (对齐真实报告：λ=632.8nm, L1=78.33cm, L2=76.24cm, φ1=0.85cm)
export const FRAUNHOFER_PARAMETERS: ParameterDefinition[] = [
  {
    key: 'lambda_nm',
    name: 'He-Ne 激光波长',
    symbol: '\\lambda',
    defaultValue: 632.8,
    unit: 'nm',
    step: 0.1,
    min: 400.0,
    max: 800.0,
    description: '氦氖激光器标准单色光波长 (λ = 632.8 nm = 6.328×10⁻⁴ mm)',
  },
  {
    key: 'L1_mm',
    name: '狭缝到光电探测器距离 L₁',
    symbol: 'L_1',
    defaultValue: 783.3,
    unit: 'mm',
    step: 0.1,
    min: 100.0,
    max: 2000.0,
    description: '单缝衍射屏到光电探头接收狭缝的距离 (报告实测 L₁ = 78.33 cm = 783.3 mm)',
  },
  {
    key: 'L2_mm',
    name: '圆孔到观察屏距离 L₂',
    symbol: 'L_2',
    defaultValue: 762.4,
    unit: 'mm',
    step: 0.1,
    min: 100.0,
    max: 2000.0,
    description: '圆孔衍射光阑到观察屏的距离 (报告实测 L₂ = 76.24 cm = 762.4 mm)',
  },
  {
    key: 'phi1_mm',
    name: '圆孔衍射艾里斑直径 φ₁',
    symbol: '\\phi_1',
    defaultValue: 8.50,
    unit: 'mm',
    step: 0.05,
    min: 0.5,
    max: 50.0,
    description: '圆孔衍射第一级暗环（艾里斑）直径 (报告实测 φ₁ = 0.85 cm = 8.50 mm)',
  },
];

// 2. 表 1：单缝衍射特征级次位置与狭缝宽度计算表 (对应真实报告第 3 页表，k = 1, 2, 3)
export const TABLE1_SINGLE_SLIT: TableDefinition = {
  id: 'table1_single_slit',
  title: '表 1 单缝夫琅禾费衍射特征级次位置与狭缝宽度计算表',
  subtitle: 'He-Ne 激光 λ = 632.8 nm，狭缝到光电探测器距离 L₁ = 78.33 cm = 783.3 mm',
  description:
    '对称测量 ±1、±2、±3 级特征位置 x_{-k} 与 x_{+k}，计算单侧距离 x̄_k = |x_{+k} - x_{-k}| / 2 及对应狭缝宽度 a_k = k·λ·L₁ / x̄_k，求取平均缝宽 ā',
  defaultRowCount: 3,
  canAddRow: true,
  columns: [
    {
      key: 'order_k',
      title: '级次 k',
      symbol: 'k',
      unit: '',
      precision: 0,
      step: 1,
      min: 1,
      max: 10,
      tooltip: '衍射条纹特征级次 k = 1, 2, 3',
    },
    {
      key: 'x_left',
      title: '左侧 -k 级位置 x_{-k}',
      symbol: 'x_{-k}',
      unit: 'mm',
      precision: 1,
      step: 0.1,
      min: 0,
      max: 200.0,
      tooltip: '中央主极大左侧第 -k 级特征坐标 x_{-k} (mm)',
    },
    {
      key: 'x_right',
      title: '右侧 +k 级位置 x_{+k}',
      symbol: 'x_{+k}',
      unit: 'mm',
      precision: 1,
      step: 0.1,
      min: 0,
      max: 200.0,
      tooltip: '中央主极大右侧第 +k 级特征坐标 x_{+k} (mm)',
    },
    {
      key: 'delta_x',
      title: '对称间距 Δx_k',
      symbol: '\\Delta x_k = |x_{+k} - x_{-k}|',
      unit: 'mm',
      precision: 2,
      readOnly: true,
      tooltip: '左右对称级次之间的总跨距 Δx_k = |x_{+k} - x_{-k}| (mm)',
    },
    {
      key: 'x_k_half',
      title: '单侧距离 x̄_k',
      symbol: '\\bar{x}_k = \\Delta x_k / 2',
      unit: 'mm',
      precision: 2,
      readOnly: true,
      tooltip: '第 k 级到零级中心的平均半距离 x̄_k = |x_{+k} - x_{-k}| / 2 (mm)',
    },
    {
      key: 'a_calc',
      title: '狭缝宽度 a_k',
      symbol: 'a_k = k\\lambda L_1 / \\bar{x}_k',
      unit: 'mm',
      precision: 4,
      readOnly: true,
      tooltip: '由 a_k = k·λ·L₁ / x̄_k 算得的狭缝宽度 (mm，报告记作 ×10⁻² mm)',
    },
  ],
};

// 3. 表 2：单缝衍射光强分布扫描数据表 I(x) (对应真实报告第 3 页 21 个核心特征扫描点)
export const TABLE2_INTENSITY_SCAN: TableDefinition = {
  id: 'table2_intensity_scan',
  title: '表 2 单缝夫琅禾费衍射光强分布扫描记录表 I(x)',
  subtitle: '中央主极大位于 x₀ = 84.0 mm (I_max = 1140.2)，含 ±1、±2、±3 级次极大峰值与暗纹谷值坐标',
  description:
    '光电探头沿垂直光轴方向步进扫描记录衍射光强分布曲线 I(x)，定量定位中央主极大、各级暗纹极小谷值与次极大峰值',
  defaultRowCount: 21,
  canAddRow: true,
  columns: [
    {
      key: 'x_mm',
      title: '探测器坐标 x',
      symbol: 'x',
      unit: 'mm',
      precision: 1,
      step: 0.2,
      min: 0,
      max: 200.0,
      tooltip: '光电探头横向平移坐标 x (mm)',
    },
    {
      key: 'intensity',
      title: '相对光强读数 I',
      symbol: 'I(x)',
      unit: '',
      precision: 1,
      step: 0.1,
      min: 0,
      max: 5000.0,
      tooltip: '激光功率计/光强记录仪测得的相对光强值 I(x)',
    },
    {
      key: 'norm_intensity',
      title: '归一化光强 I/I_max',
      symbol: 'I / I_{\\max}',
      unit: '',
      precision: 4,
      readOnly: true,
      tooltip: '相对于中央主极大峰值 I_max = 1140.2 的归一化相对光强',
    },
    {
      key: 'feature_tag',
      title: '衍射特征点标识',
      symbol: '\\text{Feature}',
      unit: '',
      type: 'string',
      readOnly: true,
      tooltip: '该坐标点对应的物理特征（中央主极大 / ±k级暗纹谷 / ±k级次极大峰）',
    },
  ],
};

// 4. 表 3：圆孔夫琅禾费衍射艾里斑测量与孔径计算表 (对应报告第 3 页圆孔数据)
export const TABLE3_CIRCULAR_HOLE: TableDefinition = {
  id: 'table3_circular_hole',
  title: '表 3 圆孔夫琅禾费衍射艾里斑（Airy 斑）测量与孔径计算表',
  subtitle: 'L₂ = 76.24 cm = 762.4 mm，艾里斑直径 φ₁ = 0.85 cm = 8.50 mm',
  description:
    '由圆孔夫琅禾费衍射第一级暗环（艾里斑）半角公式 θ₀ = 1.22 λ / D₁ ≈ (φ₁/2) / L₂ 反推圆孔直径 D₁',
  defaultRowCount: 1,
  canAddRow: true,
  columns: [
    {
      key: 'L2_cm',
      title: '圆孔到屏距离 L₂',
      symbol: 'L_2',
      unit: 'cm',
      precision: 2,
      step: 0.01,
      min: 10.0,
      max: 200.0,
      tooltip: '圆孔衍射屏到观察屏的距离 L₂ (cm，报告实测 76.24 cm)',
    },
    {
      key: 'phi1_cm',
      title: '艾里斑直径 φ₁',
      symbol: '\\phi_1',
      unit: 'cm',
      precision: 2,
      step: 0.01,
      min: 0.05,
      max: 10.0,
      tooltip: '观察屏上描出的第一级暗环（艾里斑）直径 φ₁ (cm，报告实测 0.85 cm)',
    },
    {
      key: 'r1_mm',
      title: '艾里斑半径 φ₁/2',
      symbol: '\\phi_1 / 2',
      unit: 'mm',
      precision: 2,
      readOnly: true,
      tooltip: '艾里斑半径 r₁ = φ₁ / 2 (mm，4.25 mm)',
    },
    {
      key: 'D1_mm',
      title: '圆孔直径 D₁',
      symbol: 'D_1 = \\frac{1.22\\lambda L_2}{\\phi_1 / 2}',
      unit: 'mm',
      precision: 3,
      readOnly: true,
      tooltip: '反推圆孔直径 D₁ (mm，报告实测 0.138 mm = 1.38×10⁻⁴ m)',
    },
  ],
};

export const FRAUNHOFER_TABLES: TableDefinition[] = [
  TABLE1_SINGLE_SLIT,
  TABLE2_INTENSITY_SCAN,
  TABLE3_CIRCULAR_HOLE,
];
