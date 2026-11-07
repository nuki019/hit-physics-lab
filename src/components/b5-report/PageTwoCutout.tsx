import React, { useMemo } from 'react';
import { CalibrationRuler } from './CalibrationRuler';

export interface QuestionAnswerItem {
  id: string | number;
  questionNumber?: number;
  question: string;
  answer: string;
}

export interface PageTwoCutoutProps {
  conclusions: string[];
  questions: QuestionAnswerItem[];
  mode?: 'split' | 'single'; // 'split' 混合双虚线分贴 (推荐) | 'single' 一刀切整贴
  showRuler?: boolean;
  className?: string;
}

/**
 * 哈工大未来技术学院 B5 实验报告剪贴版：第 2 页（六、实验结论 与 七、思考探讨）
 * - 外剪刀虚线框宽度精确为 138.0 mm，内宽 134.0 mm
 * - 默认采用混合双分块模式 (Split Mode):
 *   - 上半块【六、实验结论】高 80.0 mm（贴于预印标题「六、实验结论」下方）
 *   - 下半块【七、思考探讨】高 88.0 mm（贴于预印标题「七、实验收获...」下方）
 *   - 中间带有剪刀细虚线分割线，贴入后完美避让报告册预印黑体大标题与页底 *5*
 * - 动态字号自适应：长文本时自动从 8.5pt 紧缩为 7.8pt，行高从 1.25 紧缩为 1.15
 * - 包含 100.0 mm 物理防缩放比对标尺
 */
export const PageTwoCutout: React.FC<PageTwoCutoutProps> = ({
  conclusions = [],
  questions = [],
  mode = 'split',
  showRuler = true,
  className = '',
}) => {
  // 1. 篇幅统计与自适应字号判定
  const totalConclusionChars = useMemo(
    () => conclusions.reduce((sum, str) => sum + str.length, 0),
    [conclusions]
  );

  const totalQuestionChars = useMemo(
    () => questions.reduce((sum, q) => sum + q.question.length + q.answer.length, 0),
    [questions]
  );

  // 判定是否需要紧凑排版微调 (结论 > 260 字 或 思考题 > 420 字)
  const isConclusionCompact = totalConclusionChars > 260;
  const isQuestionCompact = totalQuestionChars > 420;

  // 溢出告警门槛 (结论 > 380 字 或 思考题 > 600 字)
  const isConclusionOverflow = totalConclusionChars > 380;
  const isQuestionOverflow = totalQuestionChars > 600;

  return (
    <div className={`b5-page2-container flex flex-col items-center select-none ${className}`}>
      {/* 字符超标预警条 (屏幕模式高亮提示，打印时不侵占版心) */}
      {(isConclusionOverflow || isQuestionOverflow) && (
        <div className="no-print mb-2 p-2 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs flex items-center justify-between" style={{ width: '138.0mm' }}>
          <span>
            ⚠️ 文本字数偏多（结论 {totalConclusionChars} 字，思考题 {totalQuestionChars} 字），已自动启动紧凑排版微调；建议精炼文字以防打印截断。
          </span>
        </div>
      )}

      {/* =====================================================================
          模式 A: 混合双虚线分贴模式 (推荐：完美避开报告册预印标题)
         ===================================================================== */}
      {mode === 'split' ? (
        <div className="flex flex-col items-center" style={{ width: '138.0mm' }}>
          {/* 上半块：【六、实验结论专用贴】 (高 80.0 mm) */}
          <div
            className="b5-cutout-box b5-cutout-block-conclusion relative bg-white"
            style={{
              width: '138.0mm',
              height: '80.0mm',
              maxHeight: '80.0mm',
              boxSizing: 'border-box',
              border: '0.75pt dashed #94a3b8',
              padding: '2.5mm 2.0mm',
              marginBottom: '6.0mm',
              overflow: 'hidden',
            }}
          >
            {/* 裁剪标签 */}
            <div className="b5-cutout-tag flex items-center justify-between text-[6.5pt] text-slate-500 font-sans border-b border-dashed border-slate-300 pb-0.5 mb-1">
              <span className="flex items-center gap-1 font-medium">
                ✂ 剪贴块 2A（宽 13.8 cm × 高 8.0 cm，贴于报告册「六、实验结论」标题下方）
              </span>
              <span className="font-mono text-[6pt] text-slate-400">避让预印标题</span>
            </div>

            {/* 正文内宽 134.0 mm */}
            <div
              className="b5-content-inner flex flex-col justify-between h-full"
              style={{
                width: '134.0mm',
                margin: '0 auto',
                fontFamily: '"SimSun", "Songti SC", "Times New Roman", serif',
                fontSize: isConclusionCompact ? '7.8pt' : '8.5pt',
                lineHeight: isConclusionCompact ? 1.18 : 1.25,
                color: '#0f172a',
              }}
            >
              <div>
                <div className="font-bold text-[8.5pt] mb-1 font-serif text-slate-900 border-b border-slate-300 pb-0.5">
                  【实验测量结论与误差分析】
                </div>
                {conclusions.length === 0 ? (
                  <p className="text-slate-400 italic text-[7.5pt]">暂无实验结论内容</p>
                ) : (
                  <div className="space-y-1 text-justify indent-5">
                    {conclusions.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 下半块：【七、思考探讨专用贴】 (高 88.0 mm) */}
          <div
            className="b5-cutout-box b5-cutout-block-discussion relative bg-white"
            style={{
              width: '138.0mm',
              height: '88.0mm',
              maxHeight: '88.0mm',
              boxSizing: 'border-box',
              border: '0.75pt dashed #94a3b8',
              padding: '2.5mm 2.0mm',
              overflow: 'hidden',
            }}
          >
            {/* 裁剪标签 */}
            <div className="b5-cutout-tag flex items-center justify-between text-[6.5pt] text-slate-500 font-sans border-b border-dashed border-slate-300 pb-0.5 mb-1">
              <span className="flex items-center gap-1 font-medium">
                ✂ 剪贴块 2B（宽 13.8 cm × 高 8.8 cm，贴于报告册「七、实验收获与探讨」标题下方）
              </span>
              <span className="font-mono text-[6pt] text-slate-400">避开底端页码</span>
            </div>

            {/* 正文内宽 134.0 mm */}
            <div
              className="b5-content-inner flex flex-col justify-between h-full"
              style={{
                width: '134.0mm',
                margin: '0 auto',
                fontFamily: '"SimSun", "Songti SC", "Times New Roman", serif',
                fontSize: isQuestionCompact ? '7.8pt' : '8.5pt',
                lineHeight: isQuestionCompact ? 1.15 : 1.25,
                color: '#0f172a',
              }}
            >
              <div>
                <div className="font-bold text-[8.5pt] mb-1 font-serif text-slate-900 border-b border-slate-300 pb-0.5">
                  【思考探讨题标准解答与心得体会】
                </div>
                {questions.length === 0 ? (
                  <p className="text-slate-400 italic text-[7.5pt]">暂无思考题内容</p>
                ) : (
                  <div className="space-y-1.5 text-justify">
                    {questions.map((q, qIdx) => (
                      <div key={q.id || qIdx}>
                        <div className="font-semibold text-slate-800">
                          {q.questionNumber || qIdx + 1}. {q.question}
                        </div>
                        <div className="text-slate-700 indent-4 mt-0.5">
                          答：{q.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =====================================================================
            模式 B: 单大块整贴模式 (高 175.0 mm，中间带分割提示线)
           ===================================================================== */
        <div
          className="b5-cutout-box b5-cutout-page2-full relative bg-white"
          style={{
            width: '138.0mm',
            height: '175.0mm',
            maxHeight: '175.0mm',
            boxSizing: 'border-box',
            border: '0.75pt dashed #94a3b8',
            padding: '2.5mm 2.0mm',
            overflow: 'hidden',
          }}
        >
          {/* 顶部整贴裁剪标签 */}
          <div className="b5-cutout-tag flex items-center justify-between text-[6.5pt] text-slate-500 font-sans border-b border-dashed border-slate-300 pb-0.5 mb-1">
            <span className="flex items-center gap-1 font-medium">
              ✂ 剪贴块 2（整贴 13.8 cm × 17.5 cm，贴于 B5 报告第 6 页）
            </span>
            <span className="font-mono text-[6pt] text-slate-400">支持整贴或中线分贴</span>
          </div>

          <div
            className="b5-content-inner flex flex-col justify-between h-full"
            style={{
              width: '134.0mm',
              margin: '0 auto',
              fontFamily: '"SimSun", "Songti SC", "Times New Roman", serif',
              fontSize: isConclusionCompact || isQuestionCompact ? '7.8pt' : '8.5pt',
              lineHeight: 1.2,
              color: '#0f172a',
            }}
          >
            {/* 上半块：结论 (高约 78mm) */}
            <div style={{ minHeight: '76.0mm' }}>
              <div className="font-bold text-[8.5pt] mb-1 font-serif text-slate-900 border-b border-slate-300 pb-0.5">
                【实验测量结论与结果陈述】
              </div>
              <div className="space-y-1 text-justify indent-5">
                {conclusions.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>

            {/* 中间剪刀分割虚线 */}
            <div className="border-t border-dashed border-slate-400 my-1 pt-0.5 flex items-center justify-between text-[6.5pt] text-slate-400 font-sans">
              <span>✂ 分割线（可沿此处剪开分别贴于「六、结论」与「七、探讨」空白区）</span>
              <span>下半部：思考探讨</span>
            </div>

            {/* 下半块：思考探讨 (高约 86mm) */}
            <div style={{ minHeight: '84.0mm' }}>
              <div className="font-bold text-[8.5pt] mb-1 font-serif text-slate-900 border-b border-slate-300 pb-0.5">
                【思考探讨题标准解答与收获体会】
              </div>
              <div className="space-y-1.5 text-justify">
                {questions.map((q, qIdx) => (
                  <div key={q.id || qIdx}>
                    <div className="font-semibold text-slate-800">
                      {q.questionNumber || qIdx + 1}. {q.question}
                    </div>
                    <div className="text-slate-700 indent-4 mt-0.5">
                      答：{q.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部严格 100.0 mm 物理防缩放校验标尺 */}
      {showRuler && (
        <div className="mt-4 flex justify-center">
          <CalibrationRuler />
        </div>
      )}
    </div>
  );
};
