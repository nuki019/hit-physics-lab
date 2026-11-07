/**
 * 哈工大大物实验 - 全书 65 实验目录索引与本学期 13 门实验规划模态框
 * 文件路径: src/components/layout/CatalogModal.tsx
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Layers,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  ArrowRight,
  GraduationCap,
  Sparkles,
  BookMarked,
  Info,
} from 'lucide-react';
import {
  BOOK_METADATA,
  ALL_65_EXPERIMENTS,
  SEMESTER_13_EXPERIMENTS,
  SemesterExperiment,
  CatalogItem,
} from '@/data/semesterData';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExperiment: (id: string) => void;
  activeExpId?: string;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectExperiment,
  activeExpId,
}) => {
  // 当前主选项卡: 'semester' = 本学期 13 实验规划, 'all' = 全书 65 实验全景目录
  const [activeTab, setActiveTab] = useState<'semester' | 'all'>('semester');

  // 本学期状态筛选: 'all' | 'online' | 'fireworks' | 'extracted'
  const [semesterFilter, setSemesterFilter] = useState<string>('all');

  // 全书章节筛选: 'all' | 'chapter2' | 'chapter3' | 'chapter4'
  const [chapterFilter, setChapterFilter] = useState<string>('all');

  // 搜索关键词
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 过滤后的本学期 13 门实验列表
  const filteredSemesterList = useMemo(() => {
    return SEMESTER_13_EXPERIMENTS.filter((exp) => {
      // 状态筛选
      if (semesterFilter === 'online' && !exp.isOnline) return false;
      if (semesterFilter === 'fireworks' && exp.status !== 'fireworks') return false;
      if (semesterFilter === 'extracted' && exp.status !== 'extracted') return false;

      // 文本搜索
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = exp.name.toLowerCase().includes(q);
        const matchDesc = exp.description.toLowerCase().includes(q);
        const matchChapter = exp.chapter.toLowerCase().includes(q);
        const matchCat = exp.category.toLowerCase().includes(q);
        return matchName || matchDesc || matchChapter || matchCat;
      }
      return true;
    });
  }, [semesterFilter, searchQuery]);

  // 过滤后的全书 65 门实验列表
  const filteredCatalogList = useMemo(() => {
    return ALL_65_EXPERIMENTS.filter((exp) => {
      // 章节筛选
      if (chapterFilter === 'chapter2' && !exp.chapter.includes('第二章')) return false;
      if (chapterFilter === 'chapter3' && !exp.chapter.includes('第三章')) return false;
      if (chapterFilter === 'chapter4' && !exp.chapter.includes('第四章')) return false;

      // 文本搜索
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = exp.title.toLowerCase().includes(q);
        const matchAliases = exp.aliases.some((a) => a.toLowerCase().includes(q));
        const matchKeywords = exp.keywords.some((k) => k.toLowerCase().includes(q));
        const matchCategory = exp.category.toLowerCase().includes(q);
        const matchId = String(exp.id) === q;
        return matchTitle || matchAliases || matchKeywords || matchCategory || matchId;
      }
      return true;
    });
  }, [chapterFilter, searchQuery]);

  if (!isOpen) return null;

  const handleLaunchExperiment = (pluginId?: string) => {
    if (pluginId) {
      onSelectExperiment(pluginId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* =========================================================================
            1. 顶部 Header 栏与概览指标统计
           ========================================================================= */}
        <div className="bg-slate-900 text-white px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hit-blue border border-blue-400 flex items-center justify-center shadow-md">
              <BookMarked className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-sans">
                  大学物理实验教材全书 65 实验目录索引与本学期规划
                </h2>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-mono hidden sm:inline-block">
                  赵海发《大学物理实验(第三版)》
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                全书三大章节 65 门实验全覆盖 • 本学期 13 门大物实验适配对齐 • 靶向抽取管道与薪火笔记题库
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="关闭窗口"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 概览统计条 (KPI Highlights) */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-700">
              <GraduationCap className="w-4 h-4 text-hit-blue" />
              <span>本学期规划: <strong>13 门</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>已上线交互: <strong>14 门</strong> (本学期 13 门 100% 全覆盖 + 实验五黏度)</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-700">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>实测报告还原: <strong>100%</strong> (准稳态/声速/夫琅禾费等全量接入)</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono hidden md:flex items-center gap-2">
            <span>教材全书共 {BOOK_METADATA.total_experiments} 实验</span>
            <span>•</span>
            <span>PDF 扫描偏置 +{BOOK_METADATA.page_offset} 页</span>
          </div>
        </div>

        {/* =========================================================================
            2. 控制与筛选栏 (选项卡切换 + 搜索框 + 筛选器)
           ========================================================================= */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* 主选项卡切换 */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('semester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'semester'
                  ? 'bg-hit-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>本学期 13 门大物实验专项清单</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-hit-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-hit-lightBlue" />
              <span>全书三大章节 65 实验全景目录</span>
            </button>
          </div>

          {/* 实时搜索与状态筛选器 */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            {/* 搜索框 */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  activeTab === 'semester'
                    ? '搜索实验名、原理或章节...'
                    : '搜索实验标题、别名、关键词或编号...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hit-blue focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 子筛选器 */}
            {activeTab === 'semester' ? (
              <div className="relative shrink-0">
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-hit-blue"
                >
                  <option value="all">全部状态 (13)</option>
                  <option value="online">🟢 已上线 (4)</option>
                  <option value="fireworks">🔵 薪火已有 (7)</option>
                  <option value="extracted">🟣 教材已提取 (3)</option>
                </select>
              </div>
            ) : (
              <div className="relative shrink-0">
                <select
                  value={chapterFilter}
                  onChange={(e) => setChapterFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-hit-blue"
                >
                  <option value="all">全书全部章节 (65)</option>
                  <option value="chapter2">第二章 基础性 (25)</option>
                  <option value="chapter3">第三章 综合性 (21)</option>
                  <option value="chapter4">第四章 近现代 (19)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            3. 内容区域 (双选项卡视图)
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-100 space-y-4">
          {/* -----------------------------------------------------------------------
              选项卡 1：本学期 13 门大物实验专项清单
             ----------------------------------------------------------------------- */}
          {activeTab === 'semester' && (
            <div className="space-y-4">
              {/* 提示条 */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>本学期选课与教学要求：</strong> 用户所列 13 门大物实验现已 <strong>100% 全部上线可交互</strong>（动态磁滞回线、准稳态法测不良导体、探究乐音、光的等厚干涉、自组显微镜望远镜、霍尔效应、迈克耳孙干涉仪、密立根油滴、夫琅禾费衍射、测定空气中的声速、光电效应普朗克、全息照相、光纤传输技术），加上重点扩展<strong>实验五（液体黏度的测定）</strong>共计 <strong>14 门完整交互式实验</strong>，均支持完整数据录入、实时拟合、手机端保存/跨端同步与 B5 双页剪贴版导出！
                </div>
              </div>

              {/* 实验卡片列表网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredSemesterList.map((exp: SemesterExperiment) => {
                  const isCurrentActive = exp.pluginId === activeExpId;
                  return (
                    <div
                      key={exp.index}
                      className={`bg-white rounded-xl border p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between ${
                        exp.isOnline
                          ? 'border-emerald-200 ring-1 ring-emerald-50'
                          : exp.status === 'extracted'
                          ? 'border-purple-200'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* 顶部标号、名称与状态徽章 */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                              {exp.index}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {exp.name}
                            </h3>
                          </div>

                          {/* 状态徽章 */}
                          {exp.isOnline ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>已上线可交互</span>
                            </span>
                          ) : exp.status === 'extracted' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full shrink-0">
                              <FileText className="w-3 h-3 text-purple-600" />
                              <span>教材已切片提取</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>薪火已有报告</span>
                            </span>
                          )}
                        </div>

                        {/* 教材位置与分类信息 */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {exp.category}类
                          </span>
                          <span>{exp.chapter}</span>
                          <span>•</span>
                          <span>教材 p.{exp.bookPage} (PDF p.{exp.pdfPage})</span>
                        </div>

                        {/* 核心原理描述 */}
                        <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2">
                          {exp.description}
                        </p>
                      </div>

                      {/* 底部操作与对应说明 */}
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                          {exp.isOnline ? (
                            <span className="text-emerald-700 font-medium">
                              {isCurrentActive ? '★ 当前正处于本实验' : '支持数据录入、拟合与剪贴版'}
                            </span>
                          ) : exp.status === 'extracted' ? (
                            <span className="text-purple-700 font-mono text-[10px]">
                              {exp.fireworksPath}
                            </span>
                          ) : (
                            <span className="text-blue-700 font-mono text-[10px] truncate" title={exp.fireworksPath}>
                              {exp.fireworksPath}
                            </span>
                          )}
                        </div>

                        {exp.isOnline && exp.pluginId ? (
                          <button
                            onClick={() => handleLaunchExperiment(exp.pluginId)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isCurrentActive
                                ? 'bg-slate-200 text-slate-700 cursor-default'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            <span>{isCurrentActive ? '正在使用' : '进入实验'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : exp.status === 'extracted' ? (
                          <span className="text-[11px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">
                            待后续模块接入
                          </span>
                        ) : (
                          <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                            薪火参考已对齐
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSemesterList.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">未检索到符合条件的本学期实验</p>
                </div>
              )}
            </div>
          )}

          {/* -----------------------------------------------------------------------
              选项卡 2：全书三大章节 65 实验全景目录
             ----------------------------------------------------------------------- */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {/* 统计提示条 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-hit-blue" />
                  <span>
                    全书共收录 <strong>65 门实验</strong>，包含第二章基础性（25门）、第三章综合性（21门）及第四章近现代（19门）。
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  当前展示 {filteredCatalogList.length} / 65 门
                </div>
              </div>

              {/* 全书表格列表 */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase font-sans">
                    <tr>
                      <th className="px-4 py-3 w-16 text-center">序号</th>
                      <th className="px-4 py-3">实验名称与别名</th>
                      <th className="px-4 py-3 w-36">所属章节</th>
                      <th className="px-4 py-3 w-28">实验分类</th>
                      <th className="px-4 py-3 w-28 text-center font-mono">教材页码</th>
                      <th className="px-4 py-3 w-28 text-center font-mono">PDF页码</th>
                      <th className="px-4 py-3 w-32 text-center">状态 / 操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCatalogList.map((exp: CatalogItem) => {
                      const isCurrentActive = exp.pluginId === activeExpId;
                      return (
                        <tr
                          key={exp.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            exp.isOnline ? 'bg-emerald-50/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">
                            Exp {String(exp.id).padStart(2, '0')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{exp.title}</div>
                            {exp.aliases && exp.aliases.length > 0 && (
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                别名: {exp.aliases.join(' / ')}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{exp.chapter}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                              {exp.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-600">
                            p.{exp.book_start_page} ({exp.page_count}页)
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-600">
                            p.{exp.pdf_start_page}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {exp.isOnline && exp.pluginId ? (
                              <button
                                onClick={() => handleLaunchExperiment(exp.pluginId)}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all inline-flex items-center gap-1 ${
                                  isCurrentActive
                                    ? 'bg-slate-200 text-slate-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                }`}
                              >
                                <span>{isCurrentActive ? '当前实验' : '前往实验'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">
                                索引就绪
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredCatalogList.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">未检索到匹配的实验条目</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            4. 底部 Footer 栏
           ========================================================================= */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              已接入核心微内核 <strong>14 门完整实验插件 (本学期 13 门 100% 全覆盖)</strong>: 霍尔效应、迈克耳孙、等厚干涉、液体黏度、磁滞回线、准稳态法、探究乐音、显微镜望远镜、密立根油滴、夫琅禾费衍射、空气声速、光电效应、全息照相、光纤传输
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
