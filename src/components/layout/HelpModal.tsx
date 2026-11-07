import React from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, Scissors } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* 标题栏 */}
        <div className="bg-hit-navy text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-sans">
              哈工大未来技术学院 B5 实验报告册打印与粘贴指南
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 正文指南 */}
        <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed font-sans max-h-[80vh] overflow-y-auto">
          {/* 步骤 1 */}
          <div className="flex items-start gap-3 bg-blue-50/70 p-3.5 rounded-lg border border-blue-200">
            <CheckCircle2 className="w-5 h-5 text-hit-blue flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-hit-navy text-sm mb-1">
                步骤 1：浏览器打印机参数设定（核心防错）
              </h4>
              <p>
                点击【打印 / 导出 PDF】后，在弹出的浏览器打印设置中：
              </p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600">
                <li>目标打印机：选择真实打印机，或选择“另存为 PDF”；</li>
                <li>纸张大小：选择 <strong>A4</strong>（210 mm × 297 mm）；</li>
                <li>
                  <strong className="text-rose-600">缩放比例：务必勾选【实际大小】或设定为【100%】</strong>
                  （切勿选择“适应纸张边距”或“拉伸”，否则会导致裁剪尺寸失真！）；
                </li>
                <li>页眉和页脚：取消勾选（清除浏览器默认日期和网址）。</li>
              </ul>
            </div>
          </div>

          {/* 步骤 2 */}
          <div className="flex items-start gap-3 bg-amber-50/70 p-3.5 rounded-lg border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm mb-1">
                步骤 2：10.0 cm 物理标尺真实校验
              </h4>
              <p>
                A4 纸打印完成后，请先取出文具直尺测量第二页下方的【物理校验标尺】：
              </p>
              <p className="mt-1 text-slate-600">
                两端基准线长度必须<strong>严格等于 10.0 cm</strong>（允许误差在 ±0.5 mm 以内）。若标尺长度不符，说明打印机触发了缩放，请重新调整步骤 1 设置。
              </p>
            </div>
          </div>

          {/* 步骤 3 */}
          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <Scissors className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                步骤 3：沿虚线裁剪与规范粘贴
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>
                  <strong>第 1 页卡片（数据记录与分步处理）</strong>：用剪刀沿 13.8 cm 虚线剪下，直接粘贴于实验报告册第 4 页【五、实验数据整理及处理】通栏横线下方；
                </li>
                <li>
                  <strong>第 2 页双分块（结论与思考题探讨）</strong>：
                  本系统采用哈工大报告册专属“混合双虚线”设计：
                  <div className="pl-4 mt-0.5 space-y-0.5 text-slate-700">
                    • 上半块（8.0 cm 高）贴于第 6 页【六、实验结论】下方；<br />
                    • 下半块（8.8 cm 高）贴于【七、实验收获、体会、感想及引申的问题探讨】下方；<br />
                    • 完美露出原报告册预印的大标题，不越界、不盖章、整洁美观。
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-hit-navy hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            我已知晓
          </button>
        </div>
      </div>
    </div>
  );
};
