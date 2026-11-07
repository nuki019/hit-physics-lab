/**
 * LocalStorage 数据持久化状态机
 * 文件路径: src/core/storage/storageManager.ts
 */

import { ExperimentPersistedState } from '@/types/storage';

const STORAGE_PREFIX = 'hit_physics_data_';
const ACTIVE_EXP_KEY = 'hit_physics_active_exp_id';

const isPlainObject = (v: unknown): v is Record<string, any> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export class StorageManager {
  private static debounceTimers: Record<string, number> = {};
  private static pendingStates: Record<string, Partial<ExperimentPersistedState>> = {};

  /**
   * 获取实验对应的存储键名 (统一遵循 hit_physics_ 命名空间)
   */
  public static getKey(experimentId: string): string {
    return `${STORAGE_PREFIX}${experimentId}`;
  }

  /**
   * 加载指定实验数据，若无缓存则返回默认基准数据
   */
  public static loadExperimentData(
    experimentId: string,
    defaultTables: Record<string, any[][]> = {}
  ): ExperimentPersistedState {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(this.getKey(experimentId));
        if (raw) {
          const parsed = JSON.parse(raw) as ExperimentPersistedState;
          if (parsed && parsed.version === 1 && isPlainObject(parsed.tables)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn(`[StorageManager] 读取实验 [${experimentId}] 缓存失败，将使用默认数据:`, e);
    }

    return {
      version: 1,
      experimentId,
      timestamp: Date.now(),
      tables: defaultTables,
      customNotes: {},
    };
  }

  /**
   * 防抖持久化保存实验数据 (默认延迟 300ms)
   */
  public static saveExperimentDataDebounced(
    experimentId: string,
    state: Partial<ExperimentPersistedState>,
    delayMs = 300
  ): void {
    const existing = this.pendingStates[experimentId] || {};
    this.pendingStates[experimentId] = {
      ...existing,
      ...state,
      tables: {
        ...(existing.tables || {}),
        ...(state.tables || {}),
      },
      customNotes: {
        ...(existing.customNotes || {}),
        ...(state.customNotes || {}),
      },
    };

    if (this.debounceTimers[experimentId]) {
      clearTimeout(this.debounceTimers[experimentId]);
    }

    if (typeof window !== 'undefined') {
      this.debounceTimers[experimentId] = window.setTimeout(() => {
        const pending = this.pendingStates[experimentId] || {};
        delete this.pendingStates[experimentId];
        delete this.debounceTimers[experimentId];
        this.saveExperimentDataSync(experimentId, pending);
      }, delayMs);
    }
  }

  /**
   * 同步持久化写入
   */
  public static saveExperimentDataSync(
    experimentId: string,
    state: Partial<ExperimentPersistedState>
  ): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const current = this.loadExperimentData(experimentId, {});
        const mergedTables = {
          ...(current.tables || {}),
          ...(state.tables || {}),
        };
        const mergedNotes = {
          ...(current.customNotes || {}),
          ...(state.customNotes || {}),
        };
        const merged: ExperimentPersistedState = {
          ...current,
          ...state,
          tables: mergedTables,
          customNotes: mergedNotes,
          experimentId,
          timestamp: Date.now(),
        };
        localStorage.setItem(this.getKey(experimentId), JSON.stringify(merged));
      }
    } catch (e) {
      console.error(`[StorageManager] 持久化写入实验 [${experimentId}] 失败:`, e);
    }
  }

  /**
   * 重置当前实验数据为官方基准数据
   */
  public static resetExperimentData(
    experimentId: string,
    defaultTables: Record<string, any[][]> = {}
  ): ExperimentPersistedState {
    if (this.debounceTimers[experimentId]) {
      clearTimeout(this.debounceTimers[experimentId]);
      delete this.debounceTimers[experimentId];
    }
    delete this.pendingStates[experimentId];

    const freshState: ExperimentPersistedState = {
      version: 1,
      experimentId,
      timestamp: Date.now(),
      tables: defaultTables,
      customNotes: {},
    };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.getKey(experimentId), JSON.stringify(freshState));
      }
    } catch (e) {
      console.error(`[StorageManager] 重置实验 [${experimentId}] 失败:`, e);
    }
    return freshState;
  }

  /**
   * 读取当前激活的实验 ID
   */
  public static getActiveExperimentId(fallbackId: string): string {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(ACTIVE_EXP_KEY) || fallbackId;
      }
    } catch (e) {
      console.warn('[StorageManager] 读取当前激活实验 ID 失败:', e);
    }
    return fallbackId;
  }

  /**
   * 设置当前激活的实验 ID
   */
  public static setActiveExperimentId(experimentId: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(ACTIVE_EXP_KEY, experimentId);
      }
    } catch (e) {
      console.error('[StorageManager] 保存当前激活实验 ID 失败:', e);
    }
  }

  /**
   * 清空所有大物实验缓存
   */
  public static clearAll(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('hit_physics_')) {
            localStorage.removeItem(k);
          }
        });
      }
    } catch (e) {
      console.error('[StorageManager] 清空缓存失败:', e);
    }
  }
}
