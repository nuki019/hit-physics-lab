import React, { useState } from 'react';
import { TableDefinition, TableColumn } from '@/types/experiment';
import { MathView } from '../common/MathView';
import { Plus, Trash2, RotateCcw, AlertCircle } from 'lucide-react';

export interface DataTableProps {
  definition: TableDefinition;
  data: Array<Record<string, any> | any[]>;
  onChange: (tableId: string, updatedRows: any[]) => void;
  onResetToDefault?: (tableId: string) => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * 实验原始测量数据交互式录入表
 * - 支持逐单元格实时编辑
 * - 浮点格式校验 (即时高亮非数字或超出范围输入)
 * - 动态添加/删除行
 * - 自动与 LocalStorage 防抖服务联动
 */
export const DataTable: React.FC<DataTableProps> = ({
  definition,
  data,
  onChange,
  onResetToDefault,
  readOnly = false,
  className = '',
}) => {
  // 记录每个单元格的局部输入草稿字符串，以便学生输入小数点如 "0." 时不被强制转为 0
  const [draftInputs, setDraftInputs] = useState<Record<string, string>>({});
  // 记录校验错误单元格
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { id: tableId, title, subtitle, columns, canAddRow, minRowCount = 2, maxRowCount = 30 } = definition;

  // 获取单元格真实值
  const getCellValue = (rowIndex: number, colIndex: number, colKey: string): any => {
    const row = data[rowIndex];
    if (!row) return '';
    return Array.isArray(row) ? row[colIndex] : row[colKey];
  };

  // 单元格输入处理
  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    col: TableColumn,
    rawText: string
  ) => {
    const cellKey = `${rowIndex}_${col.key}`;
    
    // 更新本地输入草稿
    setDraftInputs((prev) => ({ ...prev, [cellKey]: rawText }));

    // 格式校验
    const trimmed = rawText.trim();
    let hasError = false;
    let errorMessage = '';

    if (trimmed !== '') {
      const num = Number(trimmed);
      if (Number.isNaN(num)) {
        hasError = true;
        errorMessage = '请输入有效数字';
      } else if (col.min !== undefined && num < col.min) {
        hasError = true;
        errorMessage = `数值不能小于 ${col.min}`;
      } else if (col.max !== undefined && num > col.max) {
        hasError = true;
        errorMessage = `数值不能大于 ${col.max}`;
      } else if (col.validator) {
        const customRes = col.validator(num);
        if (customRes !== true) {
          hasError = true;
          errorMessage = typeof customRes === 'string' ? customRes : '输入不符合要求';
        }
      }
    }

    setValidationErrors((prev) => {
      const next = { ...prev };
      if (hasError) {
        next[cellKey] = errorMessage;
      } else {
        delete next[cellKey];
      }
      return next;
    });

    // 向上同步数值
    const parsedValue = trimmed === '' ? null : Number.isNaN(Number(trimmed)) ? trimmed : Number(trimmed);
    const newRows = data.map((r, rIdx) => {
      if (rIdx !== rowIndex) return r;
      if (Array.isArray(r)) {
        const nextArr = [...r];
        nextArr[colIndex] = parsedValue;
        return nextArr;
      }
      return {
        ...r,
        [col.key]: parsedValue,
      };
    });

    onChange(tableId, newRows);
  };

  // 添加一行
  const handleAddRow = () => {
    if (data.length >= maxRowCount) return;
    const isArrayFormat = data.length > 0 && Array.isArray(data[0]);
    if (isArrayFormat) {
      const emptyRow = columns.map((c) => c.defaultValue ?? null);
      onChange(tableId, [...data, emptyRow]);
    } else {
      const emptyRow: Record<string, any> = {};
      columns.forEach((c) => {
        emptyRow[c.key] = c.defaultValue ?? null;
      });
      onChange(tableId, [...data, emptyRow]);
    }
  };

  // 删除一行
  const handleDeleteRow = (rowIndex: number) => {
    if (data.length <= minRowCount) return;
    const nextRows = data.filter((_, idx) => idx !== rowIndex);
    onChange(tableId, nextRows);
  };

  return (
    <div className={`data-table-container bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* 表格标题栏 */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>{title}</span>
            <span className="text-[11px] font-mono font-normal text-slate-500">
              ({data.length} 行数据)
            </span>
          </h4>
          {subtitle && (
            <div className="text-xs text-slate-500 mt-0.5 font-sans">
              测量条件 / 实验参数: {subtitle}
            </div>
          )}
        </div>

        {/* 表格快捷工具 */}
        <div className="flex items-center gap-2">
          {onResetToDefault && (
            <button
              onClick={() => onResetToDefault(tableId)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 border border-slate-300 rounded shadow-2xs transition-colors"
              title="重置为官方预置标准数据"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>载入基准</span>
            </button>
          )}
          {canAddRow && !readOnly && (
            <button
              onClick={handleAddRow}
              disabled={data.length >= maxRowCount}
              className="flex items-center gap-1 text-xs px-2.5 py-1 text-white bg-hit-navy hover:bg-hit-blue rounded shadow-2xs transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加行</span>
            </button>
          )}
        </div>
      </div>

      {/* 表格主体滚动区 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs text-center">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200">
              <th className="py-2.5 px-3 text-slate-500 font-medium w-12 border-r border-slate-200/80">
                序号
              </th>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className="py-2.5 px-3 font-semibold text-slate-800 border-r border-slate-200/80 last:border-r-0"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{col.title}</span>
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      {col.symbol && (
                        col.symbol.includes('\\') ? (
                          <MathView math={col.symbol} />
                        ) : (
                          <span className="italic font-serif">{col.symbol}</span>
                        )
                      )}
                      {col.unit && <span>({col.unit})</span>}
                    </span>
                  </div>
                </th>
              ))}
              {canAddRow && !readOnly && (
                <th className="py-2.5 px-2 text-slate-400 w-10">操作</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((_row, rIdx) => {
              const rowHeaderLabel = definition.rowHeaders?.[rIdx] || `${rIdx + 1}`;
              return (
                <tr key={rIdx} className="hover:bg-blue-50/30 transition-colors">
                  {/* 序号列 */}
                  <td className="py-1.5 px-2 text-slate-400 font-mono text-[11px] bg-slate-50/50 border-r border-slate-200/60">
                    {rowHeaderLabel}
                  </td>

                  {/* 动态数据列 */}
                  {columns.map((col, cIdx) => {
                    const rawVal = getCellValue(rIdx, cIdx, col.key);
                    const cellKey = `${rIdx}_${col.key}`;
                    const displayStr =
                      draftInputs[cellKey] !== undefined
                        ? draftInputs[cellKey]
                        : rawVal !== null && rawVal !== undefined
                        ? typeof rawVal === 'number' && col.precision !== undefined
                          ? rawVal.toFixed(col.precision)
                          : String(rawVal)
                        : '';
                    const hasError = !!validationErrors[cellKey];
                    const isReadOnly = readOnly || col.readOnly || col.type === 'calculated';

                    return (
                      <td
                        key={col.key || cIdx}
                        className={`py-1 px-1.5 border-r border-slate-200/60 last:border-r-0 ${
                          isReadOnly ? 'bg-slate-50/80' : ''
                        }`}
                      >
                        {isReadOnly ? (
                          <div className="py-1 px-2 font-mono text-slate-700 bg-slate-100/70 rounded text-center">
                            {displayStr || '—'}
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="text"
                              value={displayStr}
                              onChange={(e) =>
                                handleCellChange(rIdx, cIdx, col, e.target.value)
                              }
                              placeholder={col.placeholder || '0.00'}
                              className={`w-full py-1 px-2 text-center font-mono rounded border transition-all outline-none text-slate-800 ${
                                hasError
                                  ? 'border-red-400 bg-red-50/50 focus:ring-1 focus:ring-red-400'
                                  : 'border-slate-200 bg-white hover:border-slate-300 focus:border-hit-blue focus:ring-1 focus:ring-hit-blue/20'
                              }`}
                            />
                            {hasError && (
                              <div
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-red-500"
                                title={validationErrors[cellKey]}
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* 行删除按钮 */}
                  {canAddRow && !readOnly && (
                    <td className="py-1 px-1">
                      <button
                        onClick={() => handleDeleteRow(rIdx)}
                        disabled={data.length <= minRowCount}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-20"
                        title="删除该行"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
