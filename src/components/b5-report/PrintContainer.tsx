import React, { useState } from 'react';
import { PageOneCutout, PageOneCutoutProps } from './PageOneCutout';
import { PageTwoCutout, PageTwoCutoutProps } from './PageTwoCutout';
import { Printer, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface PrintContainerProps {
  pageOneProps: PageOneCutoutProps;
  pageTwoProps: PageTwoCutoutProps;
  previewPage?: 'all' | 'p1' | 'p2';
  zoomScale?: number;
  cutoutMode?: 'split' | 'single';
  onPrint?: () => void;
  className?: string;
}

/**
 * 哈工大大物实验 B5 剪贴版排版与打印宿主容器
 * - 屏幕模式提供比例缩放预览与单双页切换
 * - 打印模式严格输出 A4 纸张、边距清零、剪切框 138mm 水平绝对居中 (左右外边距各 36.0mm)
 * - 提供打印设置向导模态框（指引学生选择 100% 实际大小，防止发生缩放变形）
 */
export const PrintContainer: React.FC<PrintContainerProps> = ({
  pageOneProps,
  pageTwoProps,
  previewPage = 'all',
  zoomScale = 0.9,
  cutoutMode = 'split',
  onPrint,
  className = '',
}) => {
  const [showPrintGuide, setShowPrintGuide] = useState(false);

  // 触发打印流程
  const handleTriggerPrint = () => {
    setShowPrintGuide(false);
    if (onPrint) {
      onPrint();
    } else if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className={`b5-print-host-wrapper flex flex-col items-center w-full ${className}`}>
      {/* 打印设置引导模态框 (Print Guide Modal) */}
      {showPrintGuide && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* 模态框头部 */}
            <div className="bg-hit-navy text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-sm tracking-wide">
                  哈工大 B5 实验报告打印与导出规范指引
                </h3>
              </div>
              <button
                onClick={() => setShowPrintGuide(false)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 模态框说明主体 */}
            <div className="p-5 space-y-4 text-xs text-slate-700 font-sans">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">防缩放红线：</span>
                  打印面板中务必选择「<strong>实际大小 / 100% 缩放</strong>
                  」，切勿勾选「适应纸张 / 页面大小缩放」！否则剪切框将变小，无法对齐 B5 报告册留白区域。
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="font-bold text-slate-900 text-[13px]">
                  浏览器打印推荐参数检查清单：
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>目标打印机</strong>：选择「另存为 PDF」或实体打印机
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>纸张尺寸</strong>：标准 <strong>A4</strong> 纵向 (210 mm × 297 mm)
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>边距设置</strong>：选择「<strong>无 (None)</strong>」或「默认」
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>页眉和页脚</strong>：<strong>取消勾选</strong>（去除浏览器自带网址与打印时间）
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>背景图形</strong>：<strong>勾选</strong>（确保网格与三线表背景清晰呈现）
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
                ★ 打印完成后，请使用实体直尺测量纸底标尺，标准长度应精确等于 10.0 cm。
              </div>
            </div>

            {/* 模态框操作栏 */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowPrintGuide(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleTriggerPrint}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-hit-navy hover:bg-hit-blue rounded shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>立即调起打印</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 屏幕预览画布（支持 zoomScale 缩放） */}
      <div
        className="b5-print-container flex flex-col items-center"
        style={{
          transform: `scale(${zoomScale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* =====================================================================
            第 1 张 A4 纸张：数据处理剪贴块
           ===================================================================== */}
        {(previewPage === 'all' || previewPage === 'p1') && (
          <div className="b5-page-sheet relative flex flex-col items-center justify-start">
            <PageOneCutout {...pageOneProps} />
          </div>
        )}

        {/* =====================================================================
            第 2 张 A4 纸张：结论与思考题分块 + 10.0 cm 标尺
           ===================================================================== */}
        {(previewPage === 'all' || previewPage === 'p2') && (
          <div className="b5-page-sheet relative flex flex-col items-center justify-between">
            <PageTwoCutout {...pageTwoProps} mode={cutoutMode} showRuler />
          </div>
        )}
      </div>
    </div>
  );
};
