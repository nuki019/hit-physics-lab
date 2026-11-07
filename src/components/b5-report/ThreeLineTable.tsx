import React from 'react';
import { MathView } from '../common/MathView';

export interface TableColumnConfig {
  key: string;
  title: string;
  symbol?: string;
  unit?: string;
  precision?: number;
  width?: string;
}

export interface ThreeLineTableProps {
  title?: string;
  subtitle?: string;
  columns: TableColumnConfig[];
  data: Array<Record<string, any> | any[]>;
  caption?: string;
  compact?: boolean;
  className?: string;
}

/**
 * 哈工大大物实验规范：出版级三线表 (Three-Line Table)
 * - 顶线粗 (1.2pt solid)
 * - 栏目线细 (0.6pt solid)
 * - 底线粗 (1.2pt solid)
 * - 严格适配 134.0 mm 内部正文排版边界
 */
export const ThreeLineTable: React.FC<ThreeLineTableProps> = ({
  title,
  subtitle,
  columns,
  data,
  caption,
  compact = false,
  className = '',
}) => {
  const formatCellValue = (val: any, precision?: number): string => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'number') {
      if (Number.isNaN(val)) return 'NaN';
      if (!Number.isFinite(val)) return val > 0 ? '+∞' : '-∞';
      if (precision !== undefined) {
        return val.toFixed(precision);
      }
      // 避免浮点过多无意义尾数
      const str = val.toString();
      if (str.length > 8 && !str.includes('e')) {
        return parseFloat(val.toFixed(4)).toString();
      }
      return str;
    }
    return String(val);
  };

  return (
    <div className={`b5-table-wrapper select-none ${className}`}>
      {title && (
        <div className="text-center font-bold text-[8.5pt] text-slate-900 mb-0.5 font-serif">
          {title}
        </div>
      )}
      {subtitle && (
        <div className="text-center text-[7.5pt] text-slate-500 mb-1 font-sans">
          {subtitle}
        </div>
      )}

      <table className="b5-three-line-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{ width: col.width }}
                className={compact ? 'py-0.5 px-1' : 'py-1 px-1.5'}
              >
                <div className="flex flex-col items-center justify-center leading-tight">
                  <span className="font-semibold text-slate-900 text-[7.8pt]">
                    {col.title}
                  </span>
                  {(col.symbol || col.unit) && (
                    <span className="text-[7.2pt] text-slate-600 mt-0.5 flex items-center gap-0.5">
                      {col.symbol ? (
                        col.symbol.includes('\\') ? (
                          <MathView math={col.symbol} />
                        ) : (
                          <span className="font-serif italic">{col.symbol}</span>
                        )
                      ) : null}
                      {col.unit && (
                        <span>
                          {col.symbol ? ' ' : ''}({col.unit})
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-3 text-center text-slate-400 text-[7.5pt] italic"
              >
                暂无记录数据
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => {
              const isArray = Array.isArray(row);
              return (
                <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col, cIdx) => {
                    const rawVal = isArray ? row[cIdx] : row[col.key];
                    const formatted = formatCellValue(rawVal, col.precision);
                    return (
                      <td
                        key={col.key || cIdx}
                        className={`text-slate-800 font-mono text-[7.8pt] ${
                          compact ? 'py-0.5 px-1' : 'py-0.8 px-1.5'
                        }`}
                      >
                        {formatted}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {caption && (
        <div className="text-[7pt] text-slate-500 mt-0.5 text-right font-sans">
          {caption}
        </div>
      )}
    </div>
  );
};
