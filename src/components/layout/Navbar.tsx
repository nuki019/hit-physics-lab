import React from 'react';
import {
  Printer,
  RotateCcw,
  HelpCircle,
  BookOpen,
  FlaskConical,
  ChevronDown,
  Layers,
  BookMarked,
  Save,
  Share2,
} from 'lucide-react';

export interface ExperimentOption {
  id: string;
  name: string;
  category: '力热' | '电磁' | '光学' | '近代' | string;
  bookChapter: string;
  bookPage: number;
}

interface NavbarProps {
  experiments: ExperimentOption[];
  activeId: string;
  onSelectExperiment: (id: string) => void;
  onLoadDefaultData: () => void;
  onResetData: () => void;
  onPrint: () => void;
  onOpenHelp: () => void;
  onOpenCatalog?: () => void;
  onQuickSave?: () => void;
  onOpenSaveModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  experiments,
  activeId,
  onSelectExperiment,
  onLoadDefaultData,
  onResetData,
  onPrint,
  onOpenHelp,
  onOpenCatalog,
  onQuickSave,
  onOpenSaveModal,
}) => {
  const currentExp = experiments.find((e) => e.id === activeId);

  return (
    <header className="no-print bg-hit-navy text-white shadow-md sticky top-0 z-40 border-b border-slate-700">
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* 左侧：Logo 与平台标题 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-hit-blue border border-blue-400 flex items-center justify-center shadow-inner">
            <FlaskConical className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wide font-sans text-white">
                哈工大大物实验数据处理与报告生成平台
              </h1>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] px-1.5 py-0.5 rounded font-mono">
                未来技术学院 B5 专版
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans">
              HIT Physics Lab • 纯前端离线运行 • 13.8cm 剪贴版 PDF 输出
            </p>
          </div>
        </div>

        {/* 中间：实验下拉选择器 */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={activeId}
              onChange={(e) => onSelectExperiment(e.target.value)}
              className="appearance-none bg-slate-800 text-white text-xs font-medium pl-3 pr-8 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-hit-lightBlue focus:border-transparent cursor-pointer shadow-sm hover:bg-slate-750"
            >
              {experiments.map((exp) => (
                <option key={exp.id} value={exp.id} className="bg-slate-800 text-white">
                  [{exp.category}] {exp.name} (教材 p.{exp.bookPage})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {currentExp && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700">
              <BookOpen className="w-3.5 h-3.5 text-hit-lightBlue" />
              <span>{currentExp.bookChapter}</span>
            </div>
          )}
        </div>

        {/* 右侧：动作按钮工具栏 */}
        <div className="flex items-center gap-2">
          {/* 立即保存按钮（手机与电脑端显式存档） */}
          {onQuickSave && (
            <button
              onClick={onQuickSave}
              title="立即将当前实验数据与思考题保存至本地缓存与历史存档点"
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg border border-emerald-400 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>立即保存</span>
            </button>
          )}

          {/* 存档管理与跨设备传电脑 */}
          {onOpenSaveModal && (
            <button
              onClick={onOpenSaveModal}
              title="管理手机历史存档点、导出 JSON 备份或生成跨设备同步链接传给电脑打印"
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/40 transition-colors shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">存档 / 传电脑</span>
            </button>
          )}

          {/* 载入参考基准数据 */}
          <button
            onClick={onLoadDefaultData}
            title="一键填入该实验的标准教材与薪火笔记实测基准数据"
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 transition-colors shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">载入基准数据</span>
          </button>

          {/* 重置数据 */}
          <button
            onClick={onResetData}
            title="清空当前录入，恢复初始状态"
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-rose-950/60 hover:text-rose-200 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-600 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">重置</span>
          </button>

          {/* 打印 / 导出 PDF 主按钮 */}
          <button
            onClick={onPrint}
            title="调起浏览器原生打印，导出 100% 物理尺寸 B5 剪贴版"
            className="flex items-center gap-1.5 text-xs font-semibold bg-hit-blue hover:bg-blue-600 text-white px-3.5 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all border border-blue-400"
          >
            <Printer className="w-4 h-4" />
            <span>打印 / 导出 PDF</span>
          </button>

          {/* 全书 65 实验目录与本学期规划 */}
          <button
            onClick={onOpenCatalog}
            title="查看全书 65 门实验目录树与本学期 13 门大物实验规划状态"
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/40 transition-colors shadow-sm"
          >
            <BookMarked className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-medium">全书 65 实验与学期规划</span>
          </button>

          {/* 使用帮助模态框触发器 */}
          <button
            onClick={onOpenHelp}
            title="查看 B5 报告册打印与裁剪贴附说明"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-amber-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
