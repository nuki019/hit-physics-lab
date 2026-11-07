/**
 * 哈尔滨工业大学大学物理实验 - 插件聚合注册与导出入口
 * 文件路径: src/experiments/index.ts
 */

import { registry } from '@/core/registry';
import { ExperimentPlugin } from '@/types/experiment';
import { hallEffectPlugin } from './hall-effect';
import { michelsonPlugin } from './michelson';
import { newtonRingWedgePlugin } from './newton-ring-wedge';
import { liquidViscosityPlugin } from './liquid-viscosity';
import { hysteresisLoopPlugin } from './hysteresis-loop';
import { quasiSteadyThermalPlugin } from './quasi-steady-thermal';
import { musicalSoundPlugin } from './musical-sound';
import { microscopeTelescopePlugin } from './microscope-telescope';
import { millikanOilDropPlugin } from './millikan-oil-drop';
import { fraunhoferDiffractionPlugin } from './fraunhofer-diffraction';
import { soundVelocityPlugin } from './sound-velocity';
import { photoelectricPlanckPlugin } from './photoelectric-planck';
import { holographyPlugin } from './holography';
import { opticalFiberPlugin } from './optical-fiber';

export { registry };
export * from './hall-effect';
export * from './michelson';
export * from './newton-ring-wedge';
export * from './liquid-viscosity';
export * from './hysteresis-loop';
export * from './quasi-steady-thermal';
export * from './musical-sound';
export * from './microscope-telescope';
export * from './millikan-oil-drop';
export * from './fraunhofer-diffraction';
export * from './sound-velocity';
export * from './photoelectric-planck';
export * from './holography';
export * from './optical-fiber';

export const allExperiments: ExperimentPlugin[] = [
  hallEffectPlugin,
  michelsonPlugin,
  newtonRingWedgePlugin,
  liquidViscosityPlugin,
  hysteresisLoopPlugin,
  quasiSteadyThermalPlugin,
  musicalSoundPlugin,
  microscopeTelescopePlugin,
  millikanOilDropPlugin,
  fraunhoferDiffractionPlugin,
  soundVelocityPlugin,
  photoelectricPlanckPlugin,
  holographyPlugin,
  opticalFiberPlugin,
];

/**
 * 自动向核心插件中心注册首批三大物理实验
 */
export function registerAllExperiments(): void {
  for (const plugin of allExperiments) {
    if (!registry.has(plugin.id)) {
      registry.register(plugin);
    }
  }
}

// 模块载入时自动执行注册
registerAllExperiments();
