import React, { useId, useMemo } from 'react';

export interface PlotPoint {
  x: number;
  y: number;
  label?: string;
  isExcluded?: boolean;
}

export interface FitLineInfo {
  slope: number;
  intercept: number;
  rSquared: number;
  r?: number;
  rmse?: number;
  slopeStdError?: number;
  interceptStdError?: number;
  formulaText?: string;
  formulaLatex?: string;
}

export interface ConfidenceBandPoint {
  x: number;
  lower: number;
  upper: number;
}

export interface PlotCanvasProps {
  title?: string;
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  points: PlotPoint[];
  fitLine?: FitLineInfo;
  confidenceBand?: ConfidenceBandPoint[];
  showGrid?: boolean;
  className?: string;
}

/**
 * 哈工大大物实验 1:1 真实物理比例 SVG 矢量拟合绘图组件
 * - 绘图区严格限定为 73.5 mm × 51.5 mm
 * - 毫米方格纸细网格（1mm 细网格、5mm 中网格、10mm 主网格）
 * - 向内刻度线（ticks direction: in）
 * - 包含散点、拟合直线、95% 置信带（fill_between）
 * - 右侧配合 56.2 mm 回归参数卡片
 * - 总排版宽度严格等于 134.0 mm（73.5mm + 4.3mm + 56.2mm = 134.0mm）
 */
export const PlotCanvas: React.FC<PlotCanvasProps> = ({
  title,
  xLabel,
  yLabel,
  xUnit,
  yUnit,
  points,
  fitLine,
  confidenceBand,
  showGrid = true,
  className = '',
}) => {
  const clipId = useId();

  // 1. 过滤有效点与自动拟合兜底计算
  const effectivePoints = useMemo(
    () => points.filter((p) => !p.isExcluded && Number.isFinite(p.x) && Number.isFinite(p.y)),
    [points]
  );

  // 当未显式传入 fitLine 或传入的 fitLine 缺少统计参量时，基于有效数据点自动执行最小二乘线性回归计算
  const resolvedFitLine = useMemo<FitLineInfo | undefined>(() => {
    if (effectivePoints.length < 2) {
      return fitLine;
    }

    const n = effectivePoints.length;
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < n; i++) {
      sumX += effectivePoints[i].x;
      sumY += effectivePoints[i].y;
    }
    const meanX = sumX / n;
    const meanY = sumY / n;

    let Sxx = 0;
    let Syy = 0;
    let Sxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = effectivePoints[i].x - meanX;
      const dy = effectivePoints[i].y - meanY;
      Sxx += dx * dx;
      Syy += dy * dy;
      Sxy += dx * dy;
    }

    const autoSlope = Sxx > 1e-18 ? Sxy / Sxx : 0;
    const autoIntercept = meanY - autoSlope * meanX;
    const autoR = Sxx > 1e-18 && Syy > 1e-18 ? Sxy / Math.sqrt(Sxx * Syy) : 1;
    const autoRSquared = autoR * autoR;

    let sse = 0;
    for (let i = 0; i < n; i++) {
      const err = effectivePoints[i].y - (autoSlope * effectivePoints[i].x + autoIntercept);
      sse += err * err;
    }
    const autoRmse = n > 2 ? Math.sqrt(sse / (n - 2)) : 0;

    if (fitLine) {
      return {
        ...fitLine,
        r: fitLine.r !== undefined ? fitLine.r : autoR,
        rSquared: fitLine.rSquared !== undefined ? fitLine.rSquared : autoRSquared,
        rmse: fitLine.rmse !== undefined ? fitLine.rmse : autoRmse,
      };
    }

    return {
      slope: autoSlope,
      intercept: autoIntercept,
      r: autoR,
      rSquared: autoRSquared,
      rmse: autoRmse,
    };
  }, [effectivePoints, fitLine]);

  const { xDomain, yDomain, xTicks, yTicks } = useMemo(() => {
    let minX = 0;
    let maxX = 1;
    let minY = 0;
    let maxY = 1;

    if (effectivePoints.length > 0) {
      minX = Math.min(...effectivePoints.map((p) => p.x));
      maxX = Math.max(...effectivePoints.map((p) => p.x));
      minY = Math.min(...effectivePoints.map((p) => p.y));
      maxY = Math.max(...effectivePoints.map((p) => p.y));

      // 若有拟合线，拟合点也纳入考量
      if (resolvedFitLine && Number.isFinite(resolvedFitLine.slope) && Number.isFinite(resolvedFitLine.intercept)) {
        const yAtMinX = resolvedFitLine.slope * minX + resolvedFitLine.intercept;
        const yAtMaxX = resolvedFitLine.slope * maxX + resolvedFitLine.intercept;
        minY = Math.min(minY, yAtMinX, yAtMaxX);
        maxY = Math.max(maxY, yAtMinX, yAtMaxX);
      }
    }

    // 边界保护
    if (minX === maxX) {
      minX -= 1;
      maxX += 1;
    }
    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }

    // 留出 8% 物理边缘余量
    const padX = (maxX - minX) * 0.08;
    const padY = (maxY - minY) * 0.08;
    const finalMinX = minX - padX;
    const finalMaxX = maxX + padX;
    const finalMinY = minY - padY;
    const finalMaxY = maxY + padY;

    // 生成 5 个主刻度
    const numTicks = 5;
    const xStep = (finalMaxX - finalMinX) / (numTicks - 1);
    const yStep = (finalMaxY - finalMinY) / (numTicks - 1);

    const xTicksArr = Array.from({ length: numTicks }, (_, i) => finalMinX + i * xStep);
    const yTicksArr = Array.from({ length: numTicks }, (_, i) => finalMinY + i * yStep);

    return {
      xDomain: [finalMinX, finalMaxX] as [number, number],
      yDomain: [finalMinY, finalMaxY] as [number, number],
      xTicks: xTicksArr,
      yTicks: yTicksArr,
    };
  }, [effectivePoints, resolvedFitLine]);

  // 2. 几何映射参数 (严格毫米物理单位)
  // 绘图视口: 宽 73.5 mm, 高 51.5 mm
  // 内网格区: 左边距 10.5 mm, 右边距 3.0 mm (内宽 60.0 mm)
  //          上边距 4.0 mm, 下边距 7.5 mm (内高 40.0 mm)
  const plotLeft = 10.5;
  const plotTop = 4.0;
  const plotWidth = 60.0;
  const plotHeight = 40.0;
  const plotRight = plotLeft + plotWidth; // 70.5
  const plotBottom = plotTop + plotHeight; // 44.0

  // 坐标转换函数
  const scaleX = (x: number) => {
    const ratio = (x - xDomain[0]) / (xDomain[1] - xDomain[0]);
    return plotLeft + ratio * plotWidth;
  };

  const scaleY = (y: number) => {
    const ratio = (y - yDomain[0]) / (yDomain[1] - yDomain[0]);
    return plotBottom - ratio * plotHeight;
  };

  // 3. 计算 95% 置信带闭合多边形路径
  const confidenceBandPath = useMemo(() => {
    if (!resolvedFitLine || effectivePoints.length < 3 || effectivePoints.length > 24) return '';

    // 若未传入外部预算的置信带，基于回归参数生成 30 个插值点
    let bandPoints: ConfidenceBandPoint[] = confidenceBand || [];
    if (bandPoints.length === 0) {
      const n = effectivePoints.length;
      const meanX = effectivePoints.reduce((acc, p) => acc + p.x, 0) / n;
      const Sxx = effectivePoints.reduce((acc, p) => acc + Math.pow(p.x - meanX, 2), 0);
      const rmse = resolvedFitLine.rmse || 0.1;
      const tCrit = 2.14; // t 分布自由度近似临界值 (95%)

      const steps = 30;
      const stepSize = (xDomain[1] - xDomain[0]) / steps;
      bandPoints = [];
      for (let i = 0; i <= steps; i++) {
        const curX = xDomain[0] + i * stepSize;
        const curY = resolvedFitLine.slope * curX + resolvedFitLine.intercept;
        const seAtX =
          Sxx > 0 ? rmse * Math.sqrt(1 / n + Math.pow(curX - meanX, 2) / Sxx) : rmse;
        const margin = tCrit * seAtX;
        bandPoints.push({
          x: curX,
          lower: curY - margin,
          upper: curY + margin,
        });
      }
    }

    if (bandPoints.length < 2) return '';

    // 拼装闭合多边形: 从左到右的上边界，加上从右到左的下边界
    const upperStr = bandPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(2)},${scaleY(p.upper).toFixed(2)}`)
      .join(' ');
    const lowerStr = bandPoints
      .slice()
      .reverse()
      .map((p) => `L ${scaleX(p.x).toFixed(2)},${scaleY(p.lower).toFixed(2)}`)
      .join(' ');

    return `${upperStr} ${lowerStr} Z`;
  }, [confidenceBand, effectivePoints, resolvedFitLine, xDomain, yDomain]);

  // 4. 拟合直线端点坐标与平滑物理特征曲线路径 (Catmull-Rom 样条)
  const fitLineCoords = useMemo(() => {
    if (!resolvedFitLine || !Number.isFinite(resolvedFitLine.slope) || !Number.isFinite(resolvedFitLine.intercept)) {
      return null;
    }
    const x1 = xDomain[0];
    const y1 = resolvedFitLine.slope * x1 + resolvedFitLine.intercept;
    const x2 = xDomain[1];
    const y2 = resolvedFitLine.slope * x2 + resolvedFitLine.intercept;
    return {
      x1: scaleX(x1),
      y1: scaleY(y1),
      x2: scaleX(x2),
      y2: scaleY(y2),
    };
  }, [resolvedFitLine, xDomain, yDomain]);

  const { smoothCurvePath, isClosedLoop } = useMemo(() => {
    if (effectivePoints.length < 2) return { smoothCurvePath: '', isClosedLoop: false };
    const pts = effectivePoints.map((p) => ({ x: scaleX(p.x), y: scaleY(p.y) }));
    const first = pts[0];
    const last = pts[pts.length - 1];
    const closed =
      pts.length > 16 && Math.hypot(first.x - last.x, first.y - last.y) < 2.0;

    if (pts.length === 2) {
      return {
        smoothCurvePath: `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)} L ${pts[1].x.toFixed(2)},${pts[1].y.toFixed(2)}`,
        isClosedLoop: false,
      };
    }

    let d = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return { smoothCurvePath: d, isClosedLoop: closed };
  }, [effectivePoints, xDomain, yDomain]);

  const isNonlinearCurve =
    !fitLine || isClosedLoop || (resolvedFitLine ? resolvedFitLine.rSquared < 0.96 : false);

  // 5. 格式化数值展示
  const formatTick = (val: number) => {
    if (Math.abs(val) >= 1000 || (Math.abs(val) > 0 && Math.abs(val) < 0.01)) {
      return val.toExponential(1);
    }
    return Number(val.toPrecision(3)).toString();
  };

  const formatParam = (val?: number, precision = 4) => {
    if (val === undefined || Number.isNaN(val)) return '—';
    if (!Number.isFinite(val)) return val > 0 ? '+∞' : '-∞';
    if (Math.abs(val) >= 10000 || (Math.abs(val) > 0 && Math.abs(val) < 0.001)) {
      return val.toExponential(3);
    }
    return val.toFixed(precision);
  };

  return (
    <div
      className={`b5-plot-combined flex items-start select-none ${className}`}
      style={{ width: '134.0mm', gap: '4.3mm' }}
    >
      {/* =====================================================================
          左侧: 1:1 真实物理比例 SVG 拟合图谱 (严格 73.5 mm × 51.5 mm)
         ===================================================================== */}
      <div
        className="b5-plot-canvas-wrapper relative bg-white border border-slate-300 rounded overflow-hidden"
        style={{ width: '73.5mm', height: '51.5mm', flexShrink: 0 }}
      >
        <svg
          viewBox="0 0 73.5 51.5"
          className="w-full h-full block"
          style={{ width: '73.5mm', height: '51.5mm' }}
        >
          <defs>
            {/* 裁剪区域：锁死在 60mm × 40mm 内网格区 */}
            <clipPath id={clipId}>
              <rect x={plotLeft} y={plotTop} width={plotWidth} height={plotHeight} />
            </clipPath>
          </defs>

          {/* 1. 毫米方格纸细网格 (1mm / 5mm / 10mm) */}
          {showGrid && (
            <g className="grid-lines" clipPath={`url(#${clipId})`}>
              {/* 1mm 细网格 */}
              {Array.from({ length: 61 }, (_, i) => plotLeft + i).map((x) => (
                <line
                  key={`gx1-${x}`}
                  x1={x}
                  y1={plotTop}
                  x2={x}
                  y2={plotBottom}
                  stroke="#f1f5f9"
                  strokeWidth="0.1"
                />
              ))}
              {Array.from({ length: 41 }, (_, i) => plotTop + i).map((y) => (
                <line
                  key={`gy1-${y}`}
                  x1={plotLeft}
                  y1={y}
                  x2={plotRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="0.1"
                />
              ))}

              {/* 5mm 中网格 */}
              {Array.from({ length: 13 }, (_, i) => plotLeft + i * 5).map((x) => (
                <line
                  key={`gx5-${x}`}
                  x1={x}
                  y1={plotTop}
                  x2={x}
                  y2={plotBottom}
                  stroke="#e2e8f0"
                  strokeWidth="0.18"
                />
              ))}
              {Array.from({ length: 9 }, (_, i) => plotTop + i * 5).map((y) => (
                <line
                  key={`gy5-${y}`}
                  x1={plotLeft}
                  y1={y}
                  x2={plotRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="0.18"
                />
              ))}

              {/* 10mm 主网格 */}
              {Array.from({ length: 7 }, (_, i) => plotLeft + i * 10).map((x) => (
                <line
                  key={`gx10-${x}`}
                  x1={x}
                  y1={plotTop}
                  x2={x}
                  y2={plotBottom}
                  stroke="#cbd5e1"
                  strokeWidth="0.28"
                />
              ))}
              {Array.from({ length: 5 }, (_, i) => plotTop + i * 10).map((y) => (
                <line
                  key={`gy10-${y}`}
                  x1={plotLeft}
                  y1={y}
                  x2={plotRight}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="0.28"
                />
              ))}
            </g>
          )}

          {/* 2. 95% 置信带 (半透明浅蓝 fill_between) */}
          {confidenceBandPath && (
            <path
              d={confidenceBandPath}
              fill="rgba(59, 130, 246, 0.14)"
              stroke="none"
              clipPath={`url(#${clipId})`}
            />
          )}

          {/* 2.5 平滑物理特征曲线 / 闭合磁滞回线连接轨迹 */}
          {smoothCurvePath && (
            <path
              d={smoothCurvePath}
              fill={isClosedLoop ? 'rgba(59, 130, 246, 0.08)' : 'none'}
              stroke={isNonlinearCurve ? '#1d4ed8' : '#93c5fd'}
              strokeWidth={isNonlinearCurve ? '0.48' : '0.28'}
              clipPath={`url(#${clipId})`}
            />
          )}

          {/* 3. 最小二乘拟合直线 / 线性趋势轴线 */}
          {fitLineCoords && (
            <line
              x1={fitLineCoords.x1}
              y1={fitLineCoords.y1}
              x2={fitLineCoords.x2}
              y2={fitLineCoords.y2}
              stroke={isNonlinearCurve ? '#0284c7' : '#2563eb'}
              strokeWidth={isNonlinearCurve ? '0.35' : '0.45'}
              strokeDasharray={isNonlinearCurve ? '1.2 0.8' : undefined}
              clipPath={`url(#${clipId})`}
            />
          )}

          {/* 4. 数据散点 */}
          <g className="data-points" clipPath={`url(#${clipId})`}>
            {points.map((pt, idx) => {
              // 针对高密度采样曲线（如64点闭合磁滞回线），抽稀显示特征采样点以保持画面清爽
              if (points.length > 24 && idx % 4 !== 0) return null;

              const cx = scaleX(pt.x);
              const cy = scaleY(pt.y);
              if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;

              if (pt.isExcluded) {
                // 剔除的离群点：红灰虚线圈加斜线
                return (
                  <g key={`pt-${idx}`} opacity="0.6">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="1.2"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="0.3"
                      strokeDasharray="0.6 0.4"
                    />
                    <line
                      x1={cx - 1.0}
                      y1={cy - 1.0}
                      x2={cx + 1.0}
                      y2={cy + 1.0}
                      stroke="#ef4444"
                      strokeWidth="0.25"
                    />
                  </g>
                );
              }

              // 正常物理测量点：深蓝实心圆点 + 中心白标十字
              const radius = points.length > 24 ? '0.65' : '1.0';
              return (
                <g key={`pt-${idx}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="#1e3a8a"
                    stroke="#ffffff"
                    strokeWidth="0.22"
                  />
                  {points.length <= 24 && (
                    <>
                      <line
                        x1={cx - 1.3}
                        y1={cy}
                        x2={cx + 1.3}
                        y2={cy}
                        stroke="#1e3a8a"
                        strokeWidth="0.2"
                      />
                      <line
                        x1={cx}
                        y1={cy - 1.3}
                        x2={cx}
                        y2={cy + 1.3}
                        stroke="#1e3a8a"
                        strokeWidth="0.2"
                      />
                    </>
                  )}
                </g>
              );
            })}
          </g>

          {/* 5. 坐标轴外框 (60mm × 40mm) */}
          <rect
            x={plotLeft}
            y={plotTop}
            width={plotWidth}
            height={plotHeight}
            fill="none"
            stroke="#1e293b"
            strokeWidth="0.4"
          />

          {/* 6. 向内刻度线 (Ticks direction: in) */}
          {/* 下轴向内刻度线 */}
          {xTicks.map((val, i) => {
            const x = scaleX(val);
            if (x < plotLeft || x > plotRight) return null;
            return (
              <g key={`xtick-${i}`}>
                <line
                  x1={x}
                  y1={plotBottom}
                  x2={x}
                  y2={plotBottom - 1.4}
                  stroke="#1e293b"
                  strokeWidth="0.35"
                />
                <text
                  x={x}
                  y={plotBottom + 2.5}
                  fontSize="2.1"
                  textAnchor="middle"
                  fill="#475569"
                  fontFamily="Consolas, monospace"
                >
                  {formatTick(val)}
                </text>
              </g>
            );
          })}

          {/* 上轴向内刻度线 (无数字) */}
          {xTicks.map((val, i) => {
            const x = scaleX(val);
            if (x < plotLeft || x > plotRight) return null;
            return (
              <line
                key={`xtick-top-${i}`}
                x1={x}
                y1={plotTop}
                x2={x}
                y2={plotTop + 1.0}
                stroke="#1e293b"
                strokeWidth="0.25"
              />
            );
          })}

          {/* 左轴向内刻度线 */}
          {yTicks.map((val, i) => {
            const y = scaleY(val);
            if (y < plotTop || y > plotBottom) return null;
            return (
              <g key={`ytick-${i}`}>
                <line
                  x1={plotLeft}
                  y1={y}
                  x2={plotLeft + 1.4}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="0.35"
                />
                <text
                  x={plotLeft - 0.8}
                  y={y + 0.7}
                  fontSize="2.1"
                  textAnchor="end"
                  fill="#475569"
                  fontFamily="Consolas, monospace"
                >
                  {formatTick(val)}
                </text>
              </g>
            );
          })}

          {/* 右轴向内刻度线 (无数字) */}
          {yTicks.map((val, i) => {
            const y = scaleY(val);
            if (y < plotTop || y > plotBottom) return null;
            return (
              <line
                key={`ytick-right-${i}`}
                x1={plotRight}
                y1={y}
                x2={plotRight - 1.0}
                y2={y}
                stroke="#1e293b"
                strokeWidth="0.25"
              />
            );
          })}

          {/* 7. 坐标轴名称与物理单位 */}
          {/* 横轴标签 */}
          <text
            x={plotLeft + plotWidth / 2}
            y={50.0}
            fontSize="2.3"
            fontWeight="bold"
            textAnchor="middle"
            fill="#0f172a"
            fontFamily="SimSun, serif"
          >
            {xLabel} {xUnit ? `(${xUnit})` : ''}
          </text>

          {/* 纵轴标签 (旋转 -90 度) */}
          <text
            x={-(plotTop + plotHeight / 2)}
            y={2.6}
            transform="rotate(-90)"
            fontSize="2.3"
            fontWeight="bold"
            textAnchor="middle"
            fill="#0f172a"
            fontFamily="SimSun, serif"
          >
            {yLabel} {yUnit ? `(${yUnit})` : ''}
          </text>

          {/* 图顶简易标题 */}
          {title && (
            <text
              x={plotLeft + plotWidth / 2}
              y={2.9}
              fontSize="2.2"
              fontWeight="bold"
              textAnchor="middle"
              fill="#334155"
              fontFamily="SimSun, serif"
            >
              {title}
            </text>
          )}
        </svg>
      </div>

      {/* =====================================================================
          右侧: 56.2 mm 紧凑回归参数卡片 (严格 56.2 mm 宽)
         ===================================================================== */}
      <div
        className="b5-plot-card bg-slate-50 border border-slate-300 rounded p-1.5 flex flex-col justify-between font-sans"
        style={{ width: '56.2mm', height: '51.5mm', flexShrink: 0, boxSizing: 'border-box' }}
      >
        <div>
          {/* 卡片头部 */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
            <span className="font-bold text-[7.5pt] text-slate-800 font-serif">
              {isNonlinearCurve ? '特征曲线与回归' : '线性回归分析'}
            </span>
            <span className="text-[6.5pt] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-mono">
              {isNonlinearCurve ? 'Spline + OLS' : 'Poly1 (95% CI)'}
            </span>
          </div>

          {/* 回归方程或物理特征表达式 */}
          <div className="text-[7.0pt] font-mono text-slate-900 bg-white border border-slate-200 rounded px-1.5 py-0.8 mb-1 truncate">
            {resolvedFitLine ? (
              resolvedFitLine.formulaText ? (
                <span title={resolvedFitLine.formulaText}>{resolvedFitLine.formulaText}</span>
              ) : (
                <span>
                  y = {formatParam(resolvedFitLine.slope, 3)}x{' '}
                  {resolvedFitLine.intercept >= 0 ? '+' : '-'}{' '}
                  {formatParam(Math.abs(resolvedFitLine.intercept), 3)}
                </span>
              )
            ) : (
              <span className="text-slate-600">y = kx + b (线性模型)</span>
            )}
          </div>

          {/* 关键统计参量表格 */}
          <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[6.8pt]">
            <div className="flex justify-between border-b border-slate-200/60 py-0.3">
              <span className="text-slate-500 font-serif">斜率 k:</span>
              <span className="font-mono font-semibold text-slate-800">
                {formatParam(resolvedFitLine?.slope, 4)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 py-0.3">
              <span className="text-slate-500 font-serif">截距 b:</span>
              <span className="font-mono font-semibold text-slate-800">
                {formatParam(resolvedFitLine?.intercept, 4)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 py-0.3">
              <span className="text-slate-500 font-serif">相关系数 r:</span>
              <span className="font-mono font-bold text-hit-blue">
                {formatParam(resolvedFitLine?.r, 4)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 py-0.3">
              <span className="text-slate-500 font-serif">决定系数 R²:</span>
              <span className="font-mono font-bold text-emerald-600">
                {formatParam(resolvedFitLine?.rSquared, 4)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 py-0.3">
              <span className="text-slate-500 font-serif">剩余标准差:</span>
              <span className="font-mono text-slate-800">
                {formatParam(resolvedFitLine?.rmse, 3)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 py-0.3">
              <span className="text-slate-500 font-serif">有效样本 n:</span>
              <span className="font-mono text-slate-800">{effectivePoints.length}</span>
            </div>
          </div>
        </div>

        {/* 底部质量评估与异常点状态 */}
        <div className="pt-1 border-t border-slate-200 text-[6.5pt] flex items-center justify-between text-slate-500">
          <span>
            {resolvedFitLine &&
            (resolvedFitLine.rSquared >= 0.999 ||
              (resolvedFitLine.r && Math.abs(resolvedFitLine.r) >= 0.999)) ? (
              <span className="text-emerald-700 font-medium">★ 拟合极佳 (R²&gt;0.999)</span>
            ) : resolvedFitLine && resolvedFitLine.rSquared >= 0.95 ? (
              <span className="text-blue-700 font-medium">✔ 线性拟合符合要求</span>
            ) : (
              <span className="text-indigo-700 font-medium">✔ 物理特征曲线已拟合</span>
            )}
          </span>
          <span className="font-mono">
            {points.filter((p) => p.isExcluded).length > 0 ? (
              <span className="text-amber-600">
                剔除 {points.filter((p) => p.isExcluded).length} 异常点
              </span>
            ) : (
              '无离群点'
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
