import React from 'react';
import { ThreeLineTable } from './ThreeLineTable';
import { PlotCanvas } from '../plot/PlotCanvas';
import { MathView } from '../common/MathView';
import { TableDefinition } from '@/types/experiment';

export interface CalculationStepItem {
  id?: string;
  name: string;
  formulaLatex: string;
  substituteLatex: string;
  resultLatex: string;
  explanation?: string;
}

export interface PlotDataConfig {
  title?: string;
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  points: Array<{ x: number; y: number; isExcluded?: boolean }>;
  fitLine?: {
    slope: number;
    intercept: number;
    rSquared: number;
    r?: number;
    rmse?: number;
    formulaText?: string;
  };
  confidenceBand?: Array<{ x: number; lower: number; upper: number }>;
}

export interface PageOneCutoutProps {
  experimentName: string;
  tables?: Array<{
    definition: TableDefinition;
    data: Array<Record<string, any> | any[]>;
  }>;
  steps?: CalculationStepItem[];
  plot?: PlotDataConfig;
  uncertainties?: Array<{
    targetName?: string;
    type?: string;
    formulaLatex: string;
    formattedText?: string;
    unit?: string;
  }>;
  className?: string;
}

/**
 * 哈工大未来技术学院 B5 实验报告剪贴版：第 1 页（五、实验数据整理及处理）
 * - 外剪刀虚线框宽度精确为 138.0 mm
 * - 内部文字排版宽度严格限定为 134.0 mm
 * - 高度自适应控制在 148.0 mm ~ 185.0 mm（严格不超过 185.0 mm 避免覆盖底部 *4* 页码）
 * - 包含出版级三线表、分步推导公式与 1:1 毫米刻度矢量拟合图谱
 */
export const PageOneCutout: React.FC<PageOneCutoutProps> = ({
  experimentName,
  tables = [],
  steps = [],
  plot,
  uncertainties = [],
  className = '',
}) => {
  return (
    <div
      className={`b5-cutout-box b5-cutout-page1 relative bg-white select-none ${className}`}
      style={{
        width: '138.0mm',
        minHeight: '148.0mm',
        maxHeight: '185.0mm',
        boxSizing: 'border-box',
        padding: '2.5mm 2.0mm',
        margin: '0 auto',
      }}
    >
      {/* 顶部裁剪线标签 (居于剪刀框上方) */}
      <div className="b5-cutout-tag flex items-center justify-between text-[7pt] text-slate-500 font-sans border-b border-dashed border-slate-300 pb-1 mb-1.5">
        <span className="flex items-center gap-1">
          <span className="text-[9pt]">✂</span>
          <span className="font-medium">
            沿虚线裁剪（宽 13.8 cm，贴于 B5 报告第 4 页「五、实验数据整理及处理」下方）
          </span>
        </span>
        <span className="font-mono text-[6.5pt] text-slate-400">138.0 mm × 148~185 mm</span>
      </div>

      {/* 内部 134.0 mm 正文排版容器 */}
      <div
        className="b5-content-inner flex flex-col justify-between"
        style={{
          width: '134.0mm',
          margin: '0 auto',
          fontFamily: '"SimSun", "Songti SC", "Times New Roman", serif',
          color: '#0f172a',
        }}
      >
        {/* 顶部标题区 */}
        <div className="text-center font-bold text-[9pt] border-b border-slate-400 pb-1 mb-1.5 font-serif text-slate-900 tracking-wide">
          {experimentName} — 实验数据整理与处理
        </div>

        {/* 1. 出版级三线表区 */}
        {tables.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {tables.map((t, idx) => (
              <ThreeLineTable
                key={t.definition.id || idx}
                title={t.definition.title}
                subtitle={t.definition.subtitle}
                columns={t.definition.columns}
                data={t.data}
                compact
              />
            ))}
          </div>
        )}

        {/* 2. 1:1 毫米刻度矢量拟合图谱与回归参数卡片 (宽严格 134.0 mm, 高 51.5 mm) */}
        {plot && plot.points && plot.points.length > 0 && (
          <div className="my-1.5 flex justify-center">
            <PlotCanvas
              title={plot.title}
              xLabel={plot.xLabel}
              yLabel={plot.yLabel}
              xUnit={plot.xUnit}
              yUnit={plot.yUnit}
              points={plot.points}
              fitLine={plot.fitLine}
              confidenceBand={plot.confidenceBand}
              showGrid
            />
          </div>
        )}

        {/* 3. 分步理论推导与代入计算 */}
        {steps.length > 0 && (
          <div className="my-1 border-t border-slate-200 pt-1 text-[7.5pt]">
            <div className="font-bold text-slate-800 mb-0.5 font-serif">
              【分步推导与不确定度计算】
            </div>
            <div className="space-y-1">
              {steps.slice(0, 3).map((st, sIdx) => (
                <div key={st.id || sIdx} className="leading-snug">
                  <span className="font-medium text-slate-700">{sIdx + 1}. {st.name}：</span>
                  <span className="font-mono text-slate-900">
                    <MathView
                      math={`${st.formulaLatex} ${st.substituteLatex} ${st.resultLatex}`}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 最终合成不确定度评定 */}
        {uncertainties.length > 0 && (
          <div className="mt-1 pt-1 border-t border-dashed border-slate-300 text-[7.2pt] flex flex-wrap items-center justify-between gap-1 text-slate-700">
            {uncertainties.map((u, uIdx) => (
              <div key={uIdx} className="flex items-center gap-1 font-mono">
                <span className="font-serif font-bold text-slate-900">
                  {u.targetName || '测量结果'}:
                </span>
                <span>
                  {u.formattedText || (
                    <MathView math={`${u.formulaLatex}`} />
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
