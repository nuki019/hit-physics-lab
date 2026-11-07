/**
 * 哈尔滨工业大学大学物理实验平台 - 核心实验插件契约
 * 文件路径: src/types/experiment.ts
 */

// 1. 物理学科分类 (对应赵海发《大学物理实验》教材大类)
export type ExperimentCategory = '力热' | '电磁' | '光学' | '近代' | string;

// 2. 仪器/环境常量与可调参数定义
export interface ParameterDefinition {
  key: string;               // 唯一参数键名 (如 'd', 'lambda0', 'ratio')
  name: string;              // 参数中文名 (如 '霍尔片厚度', '激光波长')
  symbol: string;            // 数学符号 LaTeX (如 'd', '\\lambda_0')
  defaultValue: number;      // 默认参考值
  unit: string;              // 物理单位 (如 'mm', 'nm', 'mT')
  step?: number;             // 输入增量步长
  min?: number;              // 允许最小值
  max?: number;              // 允许最大值
  description?: string;      // 参数说明与仪器精度说明
}

export interface NumberField {
  key: string;
  label: string;
  unit: string;
  defaultValue?: number;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  tooltip?: string;
}

// 3. 表格列定义规范
export interface TableColumn {
  key: string;               // 列键名 (如 'ih', 'uh1', 'uh_avg')
  title: string;             // 列中文表头 (如 '工作电流', '霍尔电压 UH1')
  symbol?: string;           // 数学符号 LaTeX (如 'I_H', 'U_{H1}')
  unit: string;              // 物理量单位 (如 'mA', 'mV', 'mm')
  type?: 'number' | 'string' | 'calculated'; // 字段类型 (默认为 number)
  readOnly?: boolean;        // 是否只读 (由系统自动计算填充)
  precision?: number;        // 显示与格式化浮点小数位数 (如 2 或 3)
  defaultValue?: number | string;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  tooltip?: string;          // 悬浮提示 (如 '请按照四次换向法依次测量记录')
  validator?: (value: number | null) => boolean | string; // 自定义校验函数
}

export type ColumnDefinition = TableColumn;

// 4. 动态表格 Schema
export interface TableDefinition {
  id: string;                // 表格唯一标识 (如 'table1_uh_ih')
  title: string;             // 表格全称 (如 '表 1 保持磁场 B 不变，测量 UH 与 IH 的关系')
  subtitle?: string;         // 表格副标题/测量条件 (如 'IM = 200 mA, B = 100 mT')
  description?: string;
  columns: TableColumn[];
  defaultRowCount: number;   // 默认行数
  canAddRow?: boolean;       // 是否允许学生动态新增行 (默认 false)
  minRowCount?: number;
  maxRowCount?: number;
  rowHeaders?: string[];     // 固定行表头标识 (如 ['m=25', 'm=24', ...])
}

// 5. 分步公式计算推导单元
export interface CalculationStep {
  id?: string;
  name: string;              // 计算步骤名称 (如 '霍尔灵敏度 KH1 计算')
  formulaLatex: string;      // 理论公式原式 (如 'K_{H1} = \\frac{k_1}{B}')
  substituteLatex: string;   // 代入实测数值表达式 (如 '= \\frac{9.475 \\times 10^{-3}}{0.100}')
  resultLatex: string;       // 包含单位的最终计算结果 (如 '= 94.8\\ \\text{V/(A}\\cdot\\text{T)}')
  fullLatex?: string;        // 完整串联等式
  rawNumericValue?: number;   // 原始高精度浮点计算值
  unit?: string;
  explanation?: string;      // 物理机理解释与公式适用条件
}

// 6. 不确定度评定清单单元
export interface UncertaintyItem {
  id?: string;
  target?: string;
  targetName?: string;        // 评定对象 (如 '透镜曲率半径 R')
  targetSymbol?: string;      // 数学符号 (如 'R')
  type: 'A' | 'B' | 'combined' | 'relative'; // A类/B类/合成/相对
  formulaLatex: string;      // 误差传递公式
  value: number;             // 不确定度数值
  unit: string;
  formatted?: string;        // 格式化展示
  formattedText?: string;    // 格式化展示 (如 '0.11 m' 或 '4.6%')
  expressionLatex?: string;   // 完整表达结果 (如 'R = (2.41 \\pm 0.11)\\ \\text{m}\\ (P=0.683)')
}

// 7. 拟合图谱点集与参数
export interface PlotPoint {
  x: number;
  y: number;
  label?: string;
  isExcluded?: boolean;      // 是否被学生手动剔除 (离群点)
}

export interface FitLineDefinition {
  slope: number;             // 斜率 k
  intercept: number;         // 截距 b
  rSquared: number;          // 决定系数 R^2
  r?: number;                // 线性相关系数 r
  formulaLatex?: string;     // 拟合线解析式 (如 'U_H = 9.475 I_H + 0.02')
  formulaText?: string;
  isOriginLocked?: boolean;  // 是否强制过原点 (y = kx)
}

export interface PlotDefinition {
  id: string;                // 图表唯一 ID (如 'plot_uh_ih')
  title: string;             // 图表标题 (如 'UH - IH 关系曲线与拟合直线')
  xLabel: string;            // 横轴物理量 (如 '工作电流 IH')
  yLabel: string;            // 纵轴物理量 (如 '霍尔电压 UH')
  xUnit: string;             // 横轴单位 (如 'mA')
  yUnit: string;             // 纵轴单位 (如 'mV')
  points: PlotPoint[];       // 离散实测点集
  fitLine?: FitLineDefinition;
  targetWidthMm?: number;    // B5 报告中目标宽度 (默认 134 mm，双图并列时为 73.5 mm)
  targetHeightMm?: number;   // B5 报告中目标高度 (默认 51.5 mm)
  showGrid?: boolean;
}

// 8. 计算引擎标准输入与输出上下文
export type TableRowData = Record<string, number | null | string>;
export type TableDataStore = Record<string, TableRowData[]>;
export type ParameterStore = Record<string, number>;

export interface CalculationContext {
  experimentId: string;
  parameters: ParameterStore;
  tables: TableDataStore;
  excludedPointIndices?: Record<string, number[]>; // 各表离群点索引
}

export interface CalculationResult {
  values: Record<string, number | string>; // 标量运算结果字典 (用于断言与快速引用)
  steps: CalculationStep[];                // KaTeX 分步推导清单
  uncertainties?: UncertaintyItem[];        // 不确定度评定清单
  plots?: PlotDefinition[];                 // 1:1 毫米刻度矢量拟合图
  computedTableCells?: TableDataStore;     // 反写回表格的计算列 (如 UH 均值)
  conclusions?: string[];                   // 自动生成的实验结论陈述行
  warnings?: string[];                     // 数据异常/残差过大警示
}

// 9. 思考题与解答定义 (对齐教材与薪火笔记社)
export interface QuestionDefinition {
  id: string | number;
  questionNumber?: number;    // 题目序号 (1, 2, 3...)
  category?: '误差机理' | '物理本质' | '操作细节' | '拓展设计' | string;
  question: string;          // 题目正文 (支持 LaTeX)
  standardAnswer: string;    // 官方标准物理机制解答
  analysis?: string;         // 薪火笔记考点剖析、扣分点与物理图像
  studentDraftTemplate?: string; // 学生作答预置骨架
}

// 10. 标准参考基准数据
export interface BenchmarkData {
  datasetName?: string;       // 数据集名称 (如 '哈工大大物实验官方标准参考数据')
  parameters?: ParameterStore;
  tables?: TableDataStore | Record<string, any[][]>;
  studentAnswers?: Record<string | number, string>;
  [key: string]: any;
}

// 11. B5 剪贴版双页排版参数
export interface B5LayoutConfig {
  page1: {
    targetHeightMm: number;  // 剪贴块 1 高度 (标准 148 mm，最大 185 mm)
    showTables: boolean;
    showCalculations: boolean;
    showPlotOnPage1?: boolean;
  };
  page2: {
    mode: 'split' | 'single'; // 'split' 为混合双分块(结论80mm + 思考题88mm)
    conclusionHeightMm: number; // 默认 80 mm
    discussionHeightMm: number; // 默认 88 mm
    showRuler: boolean;        // 必须渲染 100.0 mm 物理校验尺
  };
}

// 12. 统一物理实验插件契约
export interface ExperimentPlugin {
  id: string;                // 唯一标识 (如 'hall-effect', 'michelson')
  name: string;              // 实验中文全称 (如 '霍尔效应')
  category: ExperimentCategory;
  experimentNumber?: number;  // 赵海发教材编号 (1 ~ 65)
  bookChapter: string;       // 归属章节 (如 '第三章 综合性实验')
  bookPage: number;          // 教材纸质页码 (如 196)
  pdfPage?: number;           // 扫描件页码 (bookPage + 15, 如 211)
  hours?: number;             // 实验学时 (通常为 3)
  description?: string;       // 实验简要物理原理说明
  tags?: string[];

  // 输入定义
  parameters?: ParameterDefinition[];
  tables: TableDefinition[];

  // 纯计算引擎
  calculate: (inputTablesOrContext: any, extraParams?: any) => CalculationResult;

  // 思考题与讨论
  questions: QuestionDefinition[];

  // 基准测试数据 (一键载入)
  defaultData: BenchmarkData | Record<string, any[][]>;

  // 排版定制选项
  b5Layout?: Partial<B5LayoutConfig>;
}
