import React from 'react';

export const CalibrationRuler: React.FC = () => {
  // 生成 0 到 10 cm 的 21 个刻度 (每个大格 10mm，中间小格 5mm)
  const ticks = Array.from({ length: 21 }, (_, i) => i);

  return (
    <div className="physical-ruler-container select-none">
      <div className="text-[7pt] text-slate-500 mb-1 flex items-center gap-1 font-sans">
        <span className="font-semibold text-slate-700">★ 打印比例校验标尺</span>
        <span>（打印后请用文具直尺实测，下方两端线长必须精确等于 10.0 cm）</span>
      </div>
      
      <div className="physical-ruler-10cm">
        {ticks.map((t) => {
          const isMajor = t % 2 === 0;
          const cmValue = t / 2;
          return (
            <div
              key={t}
              className={`ruler-tick ${isMajor ? 'major' : 'minor'}`}
              style={{ left: `${(t / 20) * 100}%` }}
            >
              {isMajor && (
                <span
                  className="ruler-label"
                  style={{
                    transform: 'translateX(-50%)',
                    left: `${(t / 20) * 100}%`,
                  }}
                >
                  {cmValue}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-[6.5pt] text-slate-400 mt-5 font-mono">
        100.0 mm PHYSICAL SCALE CALIBRATION (TOLERANCE ±0.5 mm)
      </div>
    </div>
  );
};
