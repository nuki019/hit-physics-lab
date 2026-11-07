/**
 * 哈工大大物实验数据处理与报告生成平台 - 主应用界面
 * 文件路径: src/App.tsx
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar, ExperimentOption } from '@/components/layout/Navbar';
import { HelpModal } from '@/components/layout/HelpModal';
import { CatalogModal } from '@/components/layout/CatalogModal';
import { StorageManager } from '@/core/storage/storageManager';
import { DataTable } from '@/components/data-table/DataTable';
import { PrintContainer } from '@/components/b5-report/PrintContainer';
import { MathView } from '@/components/common/MathView';
import { PlotCanvas } from '@/components/plot/PlotCanvas';
import { TableDefinition, ExperimentPlugin, CalculationResult } from '@/types/experiment';
import {
  allExperiments,
  registry,
  hallEffectPlugin,
} from '@/experiments';
import {
  FileText,
  Calculator,
  HelpCircle,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  AlertTriangle,
  Sparkles,
  Layers,
  Filter,
  BarChart3,
} from 'lucide-react';

// 导航栏候选实验清单 (直接映射已注册插件中心)
const EXPERIMENTS: ExperimentOption[] = allExperiments.map((plugin) => ({
  id: plugin.id,
  name: plugin.name,
  category: plugin.category,
  bookChapter: plugin.bookChapter,
  bookPage: plugin.bookPage,
}));

export const App: React.FC = () => {
  // 当前激活实验 ID
  const [activeExpId, setActiveExpId] = useState<string>(() =>
    StorageManager.getActiveExperimentId('hall-effect')
  );

  // 帮助模态框
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // 全书 65 实验目录与本学期规划模态框
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // 左侧面板选项卡: 0=数据录入, 1=分步计算, 2=思考题解答
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);

  // 多表格切换索引
  const [selectedTableIndex, setSelectedTableIndex] = useState<number>(0);

  // 右侧报告预览页面: 'all'=双页全览, 'p1'=第1页剪贴块, 'p2'=第2页剪贴块
  const [previewPage, setPreviewPage] = useState<'all' | 'p1' | 'p2'>('all');

  // 裁剪模式: 'split'=混合双虚线分贴(推荐), 'single'=整贴
  const [cutoutMode, setCutoutMode] = useState<'split' | 'single'>('split');

  // 预览缩放比例
  const [zoomScale, setZoomScale] = useState<number>(0.9);

  // 牛顿环剔除 m=19 异常点开关
  const [excludeM19Newton, setExcludeM19Newton] = useState<boolean>(false);

  // 获取当前实验插件对象
  const currentPlugin = useMemo(
    () => registry.get(activeExpId) || hallEffectPlugin,
    [activeExpId]
  );

  const activeExpOption = useMemo(
    () => EXPERIMENTS.find((e) => e.id === activeExpId) || EXPERIMENTS[0],
    [activeExpId]
  );

  // 获取实验默认表格数据集
  const getDefaultTables = (plugin: ExperimentPlugin): Record<string, any[][]> => {
    if (plugin.defaultData && plugin.defaultData.tables) {
      return plugin.defaultData.tables as Record<string, any[][]>;
    }
    const res: Record<string, any[][]> = {};
    for (const tbl of plugin.tables) {
      res[tbl.id] = [];
    }
    return res;
  };

  // 当前实验多表格数据集合 (从 LocalStorage 恢复或使用预置基准数据)
  const [tablesData, setTablesData] = useState<Record<string, any[][]>>(() => {
    const defaultTables = getDefaultTables(currentPlugin);
    const saved = StorageManager.loadExperimentData(activeExpId, defaultTables);
    return saved.tables || defaultTables;
  });

  // 实验结论与思考题笔记存储
  const [conclusionText, setConclusionText] = useState<string>(() => {
    const saved = StorageManager.loadExperimentData(activeExpId, {});
    if (saved.customNotes?.conclusion) {
      return saved.customNotes.conclusion;
    }
    return (
      currentPlugin.calculate(getDefaultTables(currentPlugin)).conclusions?.[0] ||
      '本实验数据测量规范，实测结果与理论参考值高度自洽。'
    );
  });

  const [questionAnswers, setQuestionAnswers] = useState<Record<string | number, string>>(() => {
    const saved = StorageManager.loadExperimentData(activeExpId, {});
    const initial: Record<string | number, string> = {};
    currentPlugin.questions.forEach((q) => {
      initial[q.id] = saved.customNotes?.[`q_${q.id}`] || q.standardAnswer;
    });
    return initial;
  });

  // 当切换实验时重新载入对应持久化状态
  useEffect(() => {
    const defaultTables = getDefaultTables(currentPlugin);
    const saved = StorageManager.loadExperimentData(activeExpId, defaultTables);
    setTablesData(saved.tables || defaultTables);
    setSelectedTableIndex(0);

    const calc = currentPlugin.calculate(saved.tables || defaultTables);
    setConclusionText(
      saved.customNotes?.conclusion ||
        calc.conclusions?.join('\n') ||
        '本实验数据测量规范，实测结果与理论参考值高度自洽。'
    );

    const initialQA: Record<string | number, string> = {};
    currentPlugin.questions.forEach((q) => {
      initialQA[q.id] = saved.customNotes?.[`q_${q.id}`] || q.standardAnswer;
    });
    setQuestionAnswers(initialQA);
  }, [activeExpId, currentPlugin]);

  // 切换实验处理
  const handleSelectExperiment = (id: string) => {
    setActiveExpId(id);
    StorageManager.setActiveExperimentId(id);
  };

  // 单元格数据变更 (自动保存并持久化)
  const handleTableChange = (tableId: string, updatedRows: any[]) => {
    const nextTablesData = {
      ...tablesData,
      [tableId]: updatedRows,
    };

    setTablesData(nextTablesData);
    StorageManager.saveExperimentDataDebounced(
      activeExpId,
      { tables: nextTablesData },
      300
    );
  };

  // 思考题作答变更
  const handleAnswerChange = (qId: string | number, text: string) => {
    const nextQA = { ...questionAnswers, [qId]: text };
    setQuestionAnswers(nextQA);
    StorageManager.saveExperimentDataDebounced(
      activeExpId,
      { customNotes: { [`q_${qId}`]: text } },
      300
    );
  };

  // 结论长文编辑变更
  const handleConclusionChange = (text: string) => {
    setConclusionText(text);
    StorageManager.saveExperimentDataDebounced(
      activeExpId,
      { customNotes: { conclusion: text } },
      300
    );
  };

  // 载入基准标准数据
  const handleLoadDefaultData = () => {
    if (
      window.confirm(
        `确定载入 [${currentPlugin.name}] 的官方标准教材与薪火笔记实测基准数据吗？当前输入将被覆盖。`
      )
    ) {
      const defaultTables = getDefaultTables(currentPlugin);
      StorageManager.resetExperimentData(activeExpId, defaultTables);
      setTablesData(defaultTables);

      const calc = currentPlugin.calculate(defaultTables);
      const defaultConclusion = calc.conclusions?.join('\n') || '实测数据高度符合预期。';
      setConclusionText(defaultConclusion);

      const initialQA: Record<string | number, string> = {};
      currentPlugin.questions.forEach((q) => {
        initialQA[q.id] = q.standardAnswer;
      });
      setQuestionAnswers(initialQA);
    }
  };

  // 重置数据
  const handleResetData = () => {
    if (window.confirm(`确定清空 [${currentPlugin.name}] 的全部录入数据吗？`)) {
      const defaultTables = getDefaultTables(currentPlugin);
      const emptyTables: Record<string, any[][]> = {};
      for (const [tblId, rows] of Object.entries(defaultTables)) {
        emptyTables[tblId] = rows.map((row) =>
          row.map((val, idx) => (idx === 0 ? val : null))
        );
      }
      StorageManager.resetExperimentData(activeExpId, emptyTables);
      setTablesData(emptyTables);
    }
  };

  // 执行核心插件计算引擎
  const calculationResult: CalculationResult = useMemo(() => {
    try {
      const extraParams: Record<string, any> = {
        exclude_m19: excludeM19Newton ? 1 : 0,
        excludeOutliers: excludeM19Newton,
      };
      return currentPlugin.calculate(tablesData, extraParams);
    } catch (err) {
      console.error('[CalculationError]', err);
      return {
        values: {},
        steps: [],
        conclusions: ['计算异常，请检查数据输入完整性。'],
      };
    }
  }, [currentPlugin, tablesData, excludeM19Newton]);

  // 当前选中的表格定义与数据
  const activeTableDef: TableDefinition = currentPlugin.tables[selectedTableIndex] || currentPlugin.tables[0];
  const activeTableData = tablesData[activeTableDef.id] || [];

  // 构造第 1 页剪贴块数据载荷
  const pageOneProps = useMemo(() => {
    return {
      experimentName: currentPlugin.name,
      tables: currentPlugin.tables.map((tDef) => ({
        definition: tDef,
        data: tablesData[tDef.id] || [],
      })),
      steps: calculationResult.steps || [],
      plot: calculationResult.plots?.[0]
        ? {
            title: calculationResult.plots[0].title,
            xLabel: calculationResult.plots[0].xLabel,
            yLabel: calculationResult.plots[0].yLabel,
            xUnit: calculationResult.plots[0].xUnit,
            yUnit: calculationResult.plots[0].yUnit,
            points: calculationResult.plots[0].points,
            fitLine: calculationResult.plots[0].fitLine,
            confidenceBand: (calculationResult.plots[0] as any).confidenceBand,
          }
        : undefined,
      uncertainties: calculationResult.uncertainties?.map((u) => ({
        targetName: u.targetName,
        formulaLatex: u.expressionLatex || u.formulaLatex,
        formattedText: u.formattedText,
        unit: u.unit,
      })),
    };
  }, [currentPlugin, tablesData, calculationResult]);

  // 构造第 2 页剪贴块数据载荷
  const pageTwoProps = useMemo(() => {
    return {
      conclusions: conclusionText ? [conclusionText] : calculationResult.conclusions || [],
      questions: currentPlugin.questions.map((q) => ({
        id: q.id,
        questionNumber: q.questionNumber || Number(q.id),
        question: q.question,
        answer: questionAnswers[q.id] || q.standardAnswer,
      })),
      mode: cutoutMode,
      showRuler: true,
    };
  }, [conclusionText, currentPlugin, questionAnswers, cutoutMode, calculationResult]);

  // 篇幅与高度超标警示计算
  const conclusionCharCount = conclusionText.length;
  const isConclusionTooLong = conclusionCharCount > 350;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      {/* 顶部统一导航栏 */}
      <Navbar
        experiments={EXPERIMENTS}
        activeId={activeExpId}
        onSelectExperiment={handleSelectExperiment}
        onLoadDefaultData={handleLoadDefaultData}
        onResetData={handleResetData}
        onPrint={() => window.print()}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
      />

      {/* 帮助指引模态框 */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* 全书 65 实验目录与本学期规划模态框 */}
      <CatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectExperiment={handleSelectExperiment}
        activeExpId={activeExpId}
      />

      {/* 核心工作区：左右双栏响应式联动布局 */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1920px] w-full mx-auto p-3 gap-3">
        {/* =========================================================================
            左侧交互面板：数据录入表、实时公式推导与思考题编辑 (no-print)
           ========================================================================= */}
        <section className="no-print flex-1 lg:max-w-[50%] bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col overflow-hidden">
          {/* 左侧头部选项卡 */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab(0)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 0
                    ? 'bg-hit-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>原始数据录入表</span>
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 1
                    ? 'bg-hit-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>实时计算与拟合图谱</span>
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 2
                    ? 'bg-hit-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>思考题与结论编辑</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono hidden sm:flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-slate-200/70 rounded">
                {activeExpOption.category}类
              </span>
              <span>p.{activeExpOption.bookPage}</span>
            </div>
          </div>

          {/* 左侧内容区 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* 选项卡 0: 数据录入表 */}
            {activeTab === 0 && (
              <div className="space-y-4">
                <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-hit-blue" />
                    <span>
                      提示：单元格输入后以 300 毫秒防抖自动暂存，刷新不丢失；支持浮点格式校验与自动公式重算。
                    </span>
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono shrink-0">
                    多表格联动管理
                  </span>
                </div>

                {/* 多表格切换标签条 */}
                {currentPlugin.tables.length > 1 && (
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
                    {currentPlugin.tables.map((tbl, idx) => {
                      const rowCount = tablesData[tbl.id]?.length || tbl.defaultRowCount;
                      return (
                        <button
                          key={tbl.id}
                          onClick={() => setSelectedTableIndex(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                            selectedTableIndex === idx
                              ? 'bg-hit-navy text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tbl.title.split(' ')[0] || `表 ${idx + 1}`} ({rowCount} 行)
                        </button>
                      );
                    })}
                  </div>
                )}

                <DataTable
                  definition={activeTableDef}
                  data={activeTableData}
                  onChange={handleTableChange}
                  onResetToDefault={handleLoadDefaultData}
                />
              </div>
            )}

            {/* 选项卡 1: 分步公式推导、拟合指标与 1:1 矢量图谱 */}
            {activeTab === 1 && (
              <div className="space-y-4">
                {/* 物理量关键指标 KPI 卡片 */}
                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-hit-blue" />
                      <span>{currentPlugin.name} - 核心测量与物理量评定结果</span>
                    </h3>

                    {/* 牛顿环特有：异常点剔除对比开关 */}
                    {activeExpId === 'newton-ring-wedge' && (
                      <button
                        onClick={() => setExcludeM19Newton((prev) => !prev)}
                        className={`text-xs px-2.5 py-1 rounded border flex items-center gap-1 transition-colors ${
                          excludeM19Newton
                            ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                            : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Filter className="w-3.5 h-3.5" />
                        <span>{excludeM19Newton ? '已剔除 m=19 (R=2.50m)' : '剔除 m=19 异常点对比'}</span>
                      </button>
                    )}
                  </div>

                  {/* 核心指标网格 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {activeExpId === 'hall-effect' && (
                      <>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">灵敏度 KH1</div>
                          <div className="font-mono font-bold text-hit-navy text-sm">
                            {Number(calculationResult.values.KH1 || 94.8).toFixed(1)} V/(A·T)
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">灵敏度 KH2</div>
                          <div className="font-mono font-bold text-hit-navy text-sm">
                            {Number(calculationResult.values.KH2 || 119.4).toFixed(1)} V/(A·T)
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">霍尔系数 RH</div>
                          <div className="font-mono font-bold text-emerald-700 text-sm">
                            {Number(calculationResult.values.RH || 0.0214).toExponential(2)} m³/C
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">载流子浓度 n</div>
                          <div className="font-mono font-bold text-hit-blue text-sm">
                            {Number(calculationResult.values.nCarrier || 2.91e20).toExponential(2)} m⁻³
                          </div>
                        </div>
                      </>
                    )}

                    {activeExpId === 'michelson' && (
                      <>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">逐差位移 Δd̄</div>
                          <div className="font-mono font-bold text-hit-navy text-sm">
                            {Number(calculationResult.values.deltaD_bar || 0.04317).toFixed(5)} mm
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">激光波长 λ</div>
                          <div className="font-mono font-bold text-hit-navy text-sm">
                            {Number(calculationResult.values.lambda_nm || 575.6).toFixed(1)} nm
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">波长不确定度 uA(λ)</div>
                          <div className="font-mono font-bold text-amber-700 text-sm">
                            ± {Math.round(Number(calculationResult.values.uA_lambda || 8))} nm
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">空气折射率 n</div>
                          <div className="font-mono font-bold text-emerald-700 text-sm">
                            {Number(calculationResult.values.n_air || 1.000258).toFixed(6)}
                          </div>
                        </div>
                      </>
                    )}

                    {activeExpId === 'newton-ring-wedge' && (
                      <>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">平方差均值 ΔD²̄</div>
                          <div className="font-mono font-bold text-hit-navy text-sm">
                            {Number(calculationResult.values.meanDiffSq || 28.383).toFixed(3)} mm²
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">透镜曲率半径 R</div>
                          <div className="font-mono font-bold text-hit-navy text-sm">
                            {Number(calculationResult.values.R_m || 2.41).toFixed(2)} m
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">合成不确定度 u(R)</div>
                          <div className="font-mono font-bold text-amber-700 text-sm">
                            ± {Number(calculationResult.values.u_R_m || 0.11).toFixed(2)} m
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">劈尖微丝直径 d</div>
                          <div className="font-mono font-bold text-emerald-700 text-sm">
                            {Number(calculationResult.values.d_wire_um || 86.6).toFixed(1)} μm
                          </div>
                        </div>
                      </>
                    )}

                    {activeExpId === 'liquid-viscosity' && (
                      <>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">20℃动力黏度 η</div>
                          <div className="font-mono font-bold text-hit-navy text-sm">
                            {Number(calculationResult.values.eta_20C || 0.996).toFixed(3)} Pa·s
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">小钢珠平均直径 d̄</div>
                          <div className="font-mono font-bold text-hit-navy text-sm">
                            {Number(calculationResult.values.grandAvg_d_mm || 2.011).toFixed(3)} mm
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">筒壁边界修正系数 λD</div>
                          <div className="font-mono font-bold text-emerald-700 text-sm">
                            {Number(calculationResult.values.correctionFactor || 1.121).toFixed(4)}
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                          <div className="text-slate-500 text-[11px] mb-0.5">20℃雷诺数 Re</div>
                          <div className="font-mono font-bold text-emerald-700 text-sm">
                            {Number(calculationResult.values.Re_20C || 0.026).toFixed(4)} &lt;&lt; 0.1
                          </div>
                        </div>
                      </>
                    )}

                    {!['hall-effect', 'michelson', 'newton-ring-wedge', 'liquid-viscosity'].includes(activeExpId) && (
                      <>
                        {Object.entries(calculationResult.values).slice(0, 4).map(([k, v]) => (
                          <div key={k} className="p-2.5 bg-slate-50 rounded border border-slate-200">
                            <div className="text-slate-500 text-[11px] mb-0.5">{k}</div>
                            <div className="font-mono font-bold text-hit-navy text-sm">
                              {typeof v === 'number'
                                ? (Math.abs(v) < 0.01 && v !== 0 ? v.toExponential(3) : v.toFixed(3))
                                : String(v)}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* 1:1 毫米刻度矢量拟合图谱渲染 */}
                {calculationResult.plots && calculationResult.plots.length > 0 && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                      <span>1:1 毫米刻度物理拟合曲线图谱</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        严格 73.5mm × 51.5mm | 刻度向内
                      </span>
                    </h3>

                    <div className="space-y-4">
                      {calculationResult.plots.map((plotDef) => (
                        <div key={plotDef.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center">
                          <PlotCanvas
                            title={plotDef.title}
                            xLabel={plotDef.xLabel}
                            yLabel={plotDef.yLabel}
                            xUnit={plotDef.xUnit}
                            yUnit={plotDef.yUnit}
                            points={plotDef.points}
                            fitLine={plotDef.fitLine}
                            confidenceBand={(plotDef as any).confidenceBand}
                            showGrid={plotDef.showGrid ?? true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 分步推导公式清单 */}
                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">
                    严格三段式 KaTeX 公式推导步骤
                  </h3>

                  {calculationResult.steps.map((st, idx) => (
                    <div key={st.id || idx} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1.5">
                      <div className="text-slate-900 font-bold flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-hit-navy text-white text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{st.name}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                        <MathView math={st.formulaLatex} displayMode />
                        <MathView math={`${st.substituteLatex} = ${st.resultLatex}`} displayMode />
                      </div>
                      {st.explanation && (
                        <div className="text-slate-500 text-[11px] italic pl-1">
                          说明：{st.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 选项卡 2: 思考题与实验结论编辑 */}
            {activeTab === 2 && (
              <div className="space-y-4">
                {/* 实验结论编辑 */}
                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800">
                      【六、实验结论】文本自由编辑
                    </h3>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        isConclusionTooLong
                          ? 'bg-red-100 text-red-700 font-bold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {conclusionCharCount} / 350 字
                    </span>
                  </div>

                  {/* 字数超标警告条 */}
                  {isConclusionTooLong && (
                    <div className="p-2.5 bg-red-50 border border-red-300 rounded text-red-800 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>
                        字数超标警告：结论篇幅过长（当前已达 {conclusionCharCount} 字，超出 350 字上限），打印将超出 B5 粘贴区，建议精简文字！
                      </span>
                    </div>
                  )}

                  <textarea
                    rows={5}
                    value={conclusionText}
                    onChange={(e) => handleConclusionChange(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-slate-200 focus:border-hit-blue focus:ring-1 focus:ring-hit-blue/20 outline-none leading-relaxed"
                    placeholder="在此编辑实验测量结果、灵敏度结论及误差分析..."
                  />
                  <div className="text-[11px] text-slate-400">
                    提示：结论文字将实时渲染在右侧 B5 剪贴块 2A 中，长文本将自动开启字号紧缩排版。
                  </div>
                </div>

                {/* 思考题解答编辑 */}
                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">
                    【七、思考题解答】权威解析与学生作答
                  </h3>

                  {currentPlugin.questions.map((q) => (
                    <div key={q.id} className="space-y-1.5 p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="text-xs font-semibold text-slate-900 flex items-start gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-hit-navy text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {q.questionNumber || q.id}
                        </span>
                        <span>{q.question}</span>
                      </div>
                      <textarea
                        rows={3}
                        value={questionAnswers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full text-xs p-2 bg-white rounded border border-slate-200 focus:border-hit-blue outline-none leading-normal text-slate-800"
                        placeholder="输入您的思考与解答..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            右侧面板：B5 剪贴版效果预览区与 PDF 打印宿主
           ========================================================================= */}
        <section className="flex-1 lg:max-w-[50%] flex flex-col bg-slate-200 rounded-xl overflow-hidden border border-slate-300">
          {/* 右侧顶部工具栏 (no-print) */}
          <div className="no-print bg-slate-100 border-b border-slate-300 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            {/* 页面切换 */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
                <Eye className="w-4 h-4 text-hit-blue" />
                <span>B5 预览</span>
              </span>

              <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
                <button
                  onClick={() => setPreviewPage('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    previewPage === 'all'
                      ? 'bg-hit-navy text-white font-medium'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  双页全览
                </button>
                <button
                  onClick={() => setPreviewPage('p1')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    previewPage === 'p1'
                      ? 'bg-hit-navy text-white font-medium'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  第 1 页
                </button>
                <button
                  onClick={() => setPreviewPage('p2')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    previewPage === 'p2'
                      ? 'bg-hit-navy text-white font-medium'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  第 2 页
                </button>
              </div>

              {/* 剪贴分块模式切换 */}
              <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs ml-2">
                <button
                  onClick={() => setCutoutMode('split')}
                  className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    cutoutMode === 'split'
                      ? 'bg-hit-blue text-white font-medium'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="混合双分块：上部六结论80mm，下部七探讨88mm，完美避让印刷大标题"
                >
                  <Layers className="w-3 h-3" />
                  <span>双虚线分贴</span>
                </button>
                <button
                  onClick={() => setCutoutMode('single')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    cutoutMode === 'single'
                      ? 'bg-hit-blue text-white font-medium'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="整贴模式：大框高175mm"
                >
                  <span>一刀切整贴</span>
                </button>
              </div>
            </div>

            {/* 缩放与操作 */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <button
                onClick={() => setZoomScale((prev) => Math.max(0.6, prev - 0.1))}
                className="p-1 hover:bg-slate-200 rounded"
                title="缩小"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-9 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((prev) => Math.min(1.2, prev + 0.1))}
                className="p-1 hover:bg-slate-200 rounded"
                title="放大"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomScale(0.9)}
                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                title="恢复 90%"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => window.print()}
                className="ml-2 px-3 py-1 bg-hit-navy hover:bg-hit-blue text-white font-semibold rounded shadow-xs flex items-center gap-1 text-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>打印 PDF</span>
              </button>
            </div>
          </div>

          {/* 报告预览画布阶段 (在屏幕上缩放展示，打印时以 @media print 100% 直出) */}
          <div className="b5-preview-stage flex-1 overflow-auto flex flex-col items-center">
            <PrintContainer
              pageOneProps={pageOneProps}
              pageTwoProps={pageTwoProps}
              previewPage={previewPage}
              zoomScale={zoomScale}
              cutoutMode={cutoutMode}
              onPrint={() => window.print()}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
