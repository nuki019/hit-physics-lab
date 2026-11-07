/**
 * 手机端与跨设备数据保存、历史存档快照与“手机填表 -> 电脑打印”同步模态框
 * 文件路径: src/components/layout/SaveModal.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Download,
  Upload,
  Copy,
  Check,
  Clock,
  Trash2,
  RotateCcw,
  Smartphone,
  Laptop,
  Share2,
} from 'lucide-react';
import {
  StorageManager,
  ExperimentSnapshot,
  SharePayload,
} from '@/core/storage/storageManager';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId: string;
  experimentName: string;
  tablesData: Record<string, any[][]>;
  conclusionText: string;
  questionAnswers: Record<string | number, string>;
  onRestorePayload: (payload: {
    experimentId?: string;
    tables: Record<string, any[][]>;
    customNotes: Record<string, string>;
  }) => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  experimentId,
  experimentName,
  tablesData,
  conclusionText,
  questionAnswers,
  onRestorePayload,
}) => {
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [snapshots, setSnapshots] = useState<ExperimentSnapshot[]>([]);
  const [importText, setImportText] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'link' | 'code'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // 组装当前实验的 customNotes
  const buildCurrentNotes = (): Record<string, string> => {
    const notes: Record<string, string> = {
      conclusion: conclusionText,
    };
    Object.entries(questionAnswers).forEach(([qId, ans]) => {
      notes[`q_${qId}`] = ans;
    });
    return notes;
  };

  useEffect(() => {
    if (isOpen) {
      setSnapshots(StorageManager.listSnapshots(experimentId));
      setFeedbackMsg(null);
      setCopyStatus('idle');
    }
  }, [isOpen, experimentId]);

  if (!isOpen) return null;

  const showTempFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    window.setTimeout(() => {
      setFeedbackMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // 1. 新增手动存档快照
  const handleCreateSnapshot = () => {
    const notes = buildCurrentNotes();
    StorageManager.saveSnapshot(experimentId, snapshotLabel, tablesData, notes);
    setSnapshots(StorageManager.listSnapshots(experimentId));
    setSnapshotLabel('');
    showTempFeedback('已成功保存当前实验数据至手机本地存档列表！');
  };

  // 2. 恢复指定历史快照
  const handleRestoreSnapshot = (snap: ExperimentSnapshot) => {
    onRestorePayload({
      experimentId: snap.experimentId,
      tables: snap.tables,
      customNotes: snap.customNotes,
    });
    showTempFeedback(`已恢复存档：「${snap.label}」`);
  };

  // 3. 删除指定快照
  const handleDeleteSnapshot = (snapId: string) => {
    const next = StorageManager.deleteSnapshot(experimentId, snapId);
    setSnapshots(next);
  };

  // 4. 生成跨端分享载荷
  const buildSharePayload = (): SharePayload => ({
    magic: 'HIT_PHYSICS_LAB_V1',
    experimentId,
    experimentName,
    timestamp: Date.now(),
    tables: tablesData,
    customNotes: buildCurrentNotes(),
  });

  // 5. 复制跨设备一键同步链接（手机微信发给电脑直接打开）
  const handleCopySyncUrl = async () => {
    try {
      const code = StorageManager.encodeShareCode(buildSharePayload());
      const baseUrl = window.location.origin + window.location.pathname;
      const syncUrl = `${baseUrl}#sync=${encodeURIComponent(code)}`;
      await navigator.clipboard.writeText(syncUrl);
      setCopyStatus('link');
      showTempFeedback('已复制跨端同步链接！发到电脑微信/浏览器打开即可直接恢复数据并打印。');
    } catch {
      showTempFeedback('复制失败，请使用下方导出 JSON 文件或手动复制同步口令。');
    }
  };

  // 6. 复制纯文本同步口令
  const handleCopySyncCode = async () => {
    try {
      const code = StorageManager.encodeShareCode(buildSharePayload());
      await navigator.clipboard.writeText(code);
      setCopyStatus('code');
      showTempFeedback('已复制同步口令！在电脑端打开本窗口粘贴即可恢复。');
    } catch {
      showTempFeedback('复制失败，请尝试下载 JSON 备份文件。');
    }
  };

  // 7. 下载 .json 备份文件到手机/电脑本地
  const handleDownloadJson = () => {
    const payload = buildSharePayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = experimentName.replace(/[\\/:*?"<>|]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${safeName}_实验数据存档_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showTempFeedback('已下载 .json 数据备份文件至本地设备！');
  };

  // 8. 从粘贴的口令/链接恢复数据
  const handleImportFromText = () => {
    if (!importText.trim()) {
      showTempFeedback('请先粘贴同步口令、同步链接或 JSON 内容！');
      return;
    }
    const decoded = StorageManager.decodeShareInput(importText);
    if (!decoded) {
      showTempFeedback('口令或文件内容格式无效，请检查是否完整复制！');
      return;
    }
    onRestorePayload({
      experimentId: decoded.experimentId,
      tables: decoded.tables,
      customNotes: decoded.customNotes || {},
    });
    setImportText('');
    showTempFeedback(`已成功导入「${decoded.experimentName || decoded.experimentId}」的实验数据！`);
  };

  // 9. 从本地 .json 文件上传恢复
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const decoded = StorageManager.decodeShareInput(content);
      if (decoded) {
        onRestorePayload({
          experimentId: decoded.experimentId,
          tables: decoded.tables,
          customNotes: decoded.customNotes || {},
        });
        showTempFeedback(`已从文件恢复「${decoded.experimentName || decoded.experimentId}」的数据！`);
      } else {
        showTempFeedback('JSON 存档文件解析失败，请确认文件格式正确。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="bg-hit-navy text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Save className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold">
                手机端数据保存、历史存档与跨设备传电脑
              </h2>
              <p className="text-[11px] text-slate-300">
                当前实验：{experimentName}（自动防抖缓存已开启）
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="关闭窗口"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 操作反馈提示条 */}
        {feedbackMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* 主体内容区 */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* 模块一：手机 -> 电脑 一键接力打印 */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-hit-blue" />
                <span>实验室手机填数据 → 回宿舍电脑一键打印 PDF</span>
                <Laptop className="w-4 h-4 text-hit-blue" />
              </h3>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
                免登录跨端接力
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              在实验室用手机测完数据后，点击下方按钮复制<strong>「跨端同步链接」</strong>发到微信文件传输助手，在电脑浏览器打开该链接即可自动恢复全部表格数据与思考题，直接打印 1:1 尺寸 B5 剪贴报告。
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleCopySyncUrl}
                className="flex-1 min-w-[180px] flex items-center justify-center gap-1.5 bg-hit-blue hover:bg-blue-700 text-white font-semibold px-3.5 py-2.5 rounded-lg shadow-xs transition-colors"
              >
                {copyStatus === 'link' ? (
                  <>
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>已复制同步链接（发给电脑打开）</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>复制「手机→电脑」同步链接</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopySyncCode}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 font-medium px-3 py-2.5 rounded-lg border border-slate-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>{copyStatus === 'code' ? '已复制口令' : '复制同步口令'}</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 font-medium px-3 py-2.5 rounded-lg border border-slate-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>下载 .json 备份文件</span>
              </button>
            </div>
          </div>

          {/* 模块二：手机本机多版本存档点 */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>本机历史存档点（防止误触重置或改乱数据）</span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                placeholder="输入存档备注（如：第一组测完、老师签字版，可留空）"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:border-hit-blue focus:outline-none text-xs"
              />
              <button
                onClick={handleCreateSnapshot}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>新建存档点</span>
              </button>
            </div>

            {snapshots.length === 0 ? (
              <div className="text-center py-4 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                暂无手动存档点（您的每次输入均已实时自动保存在浏览器缓存中）
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{snap.label}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(snap.timestamp).toLocaleString('zh-CN', { hour12: false })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRestoreSnapshot(snap)}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-hit-blue border border-blue-200 rounded font-medium flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>恢复</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSnapshot(snap.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="删除此存档"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 模块三：导入同步口令或 JSON 备份文件 */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-600" />
              <span>从手机同步口令或 .json 备份文件恢复数据</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="在此粘贴「HITLAB1:...」同步口令或完整同步链接..."
                className="flex-1 px-3 py-2 bg-white rounded-lg border border-slate-300 focus:border-hit-blue focus:outline-none text-xs font-mono"
              />
              <button
                onClick={handleImportFromText}
                className="bg-hit-navy hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg shrink-0 transition-colors"
              >
                粘贴口令恢复
              </button>
              <label className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>上传 .json 文件</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* 底部关闭栏 */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>提示：添加到手机主屏幕后可像原生 App 一样离线填表与保存。</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
