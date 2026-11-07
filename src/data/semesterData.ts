/**
/**
 * 哈工大大物实验 - 本学期 13 门大物实验与全书 65 门实验数据中心
 * 文件路径: src/data/semesterData.ts
 */

import catalogJson from './catalog.json';

export interface CatalogItem {
  id: number;
  chapter: string;
  title: string;
  category: string;
  book_start_page: number;
  page_count: number;
  pdf_start_page: number;
  aliases: string[];
  keywords: string[];
  isOnline?: boolean;
  pluginId?: string;
}

export interface BookMeta {
  title: string;
  authors: string[];
  publisher: string;
  total_pages: number;
  page_offset: number;
  total_experiments: number;
}

export type SemesterExpStatus = 'online' | 'fireworks' | 'extracted';

export interface SemesterExperiment {
  index: number;
  name: string;
  catalogId: number;
  chapter: string;
  bookPage: number;
  pdfPage: number;
  category: '力热' | '电磁' | '光学' | '近代' | string;
  status: SemesterExpStatus;
  statusText: string;
  badgeColor: string;
  description: string;
  fireworksPath?: string;
  pluginId?: string;
  isOnline: boolean;
}

// 全书教材元数据
export const BOOK_METADATA: BookMeta = catalogJson.book_meta;

// 已在平台正式上线并具备交互计算、拟合与 B5 导出的实验映射
export const ONLINE_PLUGIN_MAP: Record<number, string> = {
  5: 'liquid-viscosity',          // 实验五：液体黏度的测定
  8: 'quasi-steady-thermal',      // 培养大纲实验八 / 教材实验二十八：准稳态法
  16: 'sound-velocity',           // 培养大纲实验十六 / 教材实验二十九：测定空气中的声速
  17: 'musical-sound',            // 实验十七：探究乐音
  20: 'musical-sound',            // 实验二十：探究乐音
  21: 'microscope-telescope',     // 实验二十一：自组显微镜和望远镜
  22: 'newton-ring-wedge',        // 实验二十二：光的等厚干涉现象与应用（牛顿环与劈尖）
  24: 'fraunhofer-diffraction',   // 实验二十四：单缝和圆孔的夫琅禾费衍射
  28: 'quasi-steady-thermal',     // 实验二十八：用准稳态法测定不良导体的比热容和导热系数
  29: 'sound-velocity',           // 实验二十九：测定空气中的声速
  31: 'hysteresis-loop',          // 实验三十一/三十三：用示波器观测动态磁滞回线
  32: 'hall-effect',              // 实验三十二：霍尔效应
  33: 'hysteresis-loop',          // 实验三十三：用示波器观测动态磁滞回线
  35: 'hysteresis-loop',          // 别名/目录编号兼容
  36: 'michelson',                // 实验三十六：迈克耳孙干涉仪
  37: 'fraunhofer-diffraction',   // 培养大纲实验三十七：单缝和圆孔的夫琅禾费衍射
  41: 'millikan-oil-drop',        // 实验四十一/四十五：用密立根油滴法测定电子电荷
  43: 'photoelectric-planck',     // 实验四十三/四十六：用光电效应法测定普朗克常量
  44: 'holography',               // 实验四十四/四十九：全息照相
  45: 'millikan-oil-drop',        // 实验四十五：用密立根油滴法测定电子电荷
  46: 'photoelectric-planck',     // 实验四十六：用光电效应法测定普朗克常量
  47: 'millikan-oil-drop',        // 实验四十七：用密立根油滴法测定电子电荷
  48: 'photoelectric-planck',
  49: 'holography',
  58: 'optical-fiber',
};

// 全书 65 门实验列表（带在线状态标注）
export const ALL_65_EXPERIMENTS: CatalogItem[] = catalogJson.experiments.map((exp: any) => ({
  ...exp,
  isOnline: Boolean(ONLINE_PLUGIN_MAP[exp.id]),
  pluginId: ONLINE_PLUGIN_MAP[exp.id],
}));

/**
 * 本学期 13 门大物实验规划全景清单 (包含薪火笔记对齐与教材切片提取状态)
 */
export const SEMESTER_13_EXPERIMENTS: SemesterExperiment[] = [
  {
    index: 1,
    name: '用示波器观测动态磁滞回线',
    catalogId: 35,
    chapter: '第三章 综合性实验',
    bookPage: 207,
    pdfPage: 222,
    category: '电磁',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '采用爱泼斯坦方圈和积分电阻电容电路，在示波器上显示动态饱和磁化曲线，测量矫顽力与剩磁。',
    fireworksPath: 'HIT-Fireworks/COURSES-RA-9A906994DD1F/main/实验/用示波器观测磁滞回线-2025.pdf',
    pluginId: 'hysteresis-loop',
    isOnline: true,
  },
  {
    index: 2,
    name: '用准稳态法测定不良导体的比热容和导热系数',
    catalogId: 28,
    chapter: '第三章 综合性实验',
    bookPage: 179,
    pdfPage: 194,
    category: '力热',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '实验二十八。利用对称平板热源的准稳态导热微分方程，交替测量有机玻璃与橡胶样品温差 ΔT 及中心面温升率 dT/dt，精确测定导热系数 λ 与比热容 c。',
    fireworksPath: '已根据用户实测满分报告 (有机玻璃+橡胶双样品) 100% 还原适配',
    pluginId: 'quasi-steady-thermal',
    isOnline: true,
  },
  {
    index: 3,
    name: '探究乐音',
    catalogId: 20,
    chapter: '第二章 基础性实验',
    bookPage: 142,
    pdfPage: 157,
    category: '力热',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '采集真实管弦乐与人声音频信号，进行快速傅里叶变换 (FFT) 频域分析，分析基频、泛音谐波幅值与乐音音色感知。',
    fireworksPath: 'HIT-Fireworks/COURSES-RA-9A906994DD1F/main/实验/探究乐音.pdf',
    pluginId: 'musical-sound',
    isOnline: true,
  },
  {
    index: 4,
    name: '光的等厚干涉现象与应用 (牛顿环与劈尖)',
    catalogId: 22,
    chapter: '第二章 基础性实验',
    bookPage: 151,
    pdfPage: 166,
    category: '光学',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '利用钠光灯等厚干涉条纹，暗环平方差逐差法消除接触膜厚畸变测定透镜曲率半径 R；剔除 m=19 异常点再拟合对比；测定劈尖微丝直径。',
    pluginId: 'newton-ring-wedge',
    isOnline: true,
  },
  {
    index: 5,
    name: '自组显微镜和望远镜',
    catalogId: 21,
    chapter: '第二章 基础性实验',
    bookPage: 147,
    pdfPage: 162,
    category: '光学',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '根据几何光学共轴球面系统成像原理，用物镜和目镜组装开普勒望远镜与复式显微镜，测定放大率、出瞳直径与视场角。',
    fireworksPath: 'HIT-Fireworks/COURSES-RA-9A906994DD1F/main/实验/自组显微镜及望远镜-2025.pdf',
    pluginId: 'microscope-telescope',
    isOnline: true,
  },
  {
    index: 6,
    name: '霍尔效应',
    catalogId: 32,
    chapter: '第三章 综合性实验',
    bookPage: 196,
    pdfPage: 211,
    category: '电磁',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '对称四次换向法消除不等位电势等 4 大副效应；线性拟合霍尔电压 UH 与控制电流 Is、磁感应强度 B 关系；螺线管轴向梯度场微位移定标。',
    pluginId: 'hall-effect',
    isOnline: true,
  },
  {
    index: 7,
    name: '迈克耳孙干涉仪',
    catalogId: 36,
    chapter: '第三章 综合性实验',
    bookPage: 211,
    pdfPage: 226,
    category: '光学',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '分振幅双光束干涉；动镜移动逐差法（传动比 1:20）精密测量 He-Ne 激光波长 λ 与 A 类不确定度；气室抽气线性回归测定空气折射率 n。',
    pluginId: 'michelson',
    isOnline: true,
  },
  {
    index: 8,
    name: '用密立根油滴法测定电子电荷',
    catalogId: 47,
    chapter: '第四章 近现代实验',
    bookPage: 266,
    pdfPage: 281,
    category: '近代',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '动态平衡法测量带电微小油滴在重力场和静电场中的沉降与上升速度，验证电荷量子化并测定基本电荷常数 e。',
    fireworksPath: 'HIT-Fireworks/COURSES-RA-9A906994DD1F/main/实验/油滴法测电子电荷.pdf',
    pluginId: 'millikan-oil-drop',
    isOnline: true,
  },
  {
    index: 9,
    name: '单缝和圆孔的夫琅禾费衍射',
    catalogId: 24,
    chapter: '第二章 基础性实验',
    bookPage: 160,
    pdfPage: 175,
    category: '光学',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '实验二十四。用光电探头与测微目镜精密测量夫琅禾费单缝衍射暗纹位置与圆孔爱里斑直径，最小二乘法线性拟合测定狭缝宽度 a 与圆孔直径 D。',
    fireworksPath: '教材 p.160 完整适配 (单缝线性回归测缝宽 + 圆孔爱里斑测孔径)',
    pluginId: 'fraunhofer-diffraction',
    isOnline: true,
  },
  {
    index: 10,
    name: '测定空气中的声速',
    catalogId: 29,
    chapter: '第三章 综合性实验',
    bookPage: 183,
    pdfPage: 198,
    category: '力热',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '实验二十九。压电陶瓷超声换能器发射与接收超声波，综合运用极值法、相位比较法（14点最小二乘拟合）、波形移动法测定空气声速及超声波驻波悬浮小球波长。',
    fireworksPath: '已根据用户实测报告 (极值法+相位法+波形移动法+超声悬浮) 100% 还原适配',
    pluginId: 'sound-velocity',
    isOnline: true,
  },
  {
    index: 11,
    name: '用光电效应法测定普朗克常量',
    catalogId: 48,
    chapter: '第四章 近现代实验',
    bookPage: 273,
    pdfPage: 288,
    category: '近代',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '测量光电管在不同单色光照射下的伏安特性曲线，确定截止反向电压 U0，线性拟合截止电压与光频率关系并求解普朗克常量 h。',
    fireworksPath: 'HIT-Fireworks/COURSES-RA-9A906994DD1F/main/实验/普朗克常数.pdf',
    pluginId: 'photoelectric-planck',
    isOnline: true,
  },
  {
    index: 12,
    name: '全息照相',
    catalogId: 44,
    chapter: '第三章 综合性实验',
    bookPage: 253,
    pdfPage: 268,
    category: '光学',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '利用激光的高相干性，物光与参考光在全息干板上发生微米级干涉条纹记录三维物场的全部相位与振幅信息，再现逼真立体虚像。',
    fireworksPath: 'HIT-Fireworks/COURSES-RA-9A906994DD1F/main/实验/全息照相.pdf',
    pluginId: 'holography',
    isOnline: true,
  },
  {
    index: 13,
    name: '光纤传输技术',
    catalogId: 45,
    chapter: '第三章 综合性实验',
    bookPage: 258,
    pdfPage: 273,
    category: '光学',
    status: 'online',
    statusText: '已上线可交互 (支持 B5 导出)',
    badgeColor: 'emerald',
    description: '掌握半导体激光器与光敏探测器性能，测量多模光纤的端面出光分布与数值孔径 NA，搭建光纤模拟音频/数字信号通信链路。',
    fireworksPath: 'HIT-Fireworks/COURSES-RA-9A906994DD1F/main/实验/光纤传输实验.pdf',
    pluginId: 'optical-fiber',
    isOnline: true,
  },
];
