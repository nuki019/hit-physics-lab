/**
 * LocalStorage 数据持久化状态机（含手机端多版本快照、JSON 导出导入与跨端同步口令）
 * 文件路径: src/core/storage/storageManager.ts
 */

import { ExperimentPersistedState } from '@/types/storage';

const STORAGE_PREFIX = 'hit_physics_data_';
const SNAPSHOT_PREFIX = 'hit_physics_snapshots_';
const ACTIVE_EXP_KEY = 'hit_physics_active_exp_id';

export interface ExperimentSnapshot {
  id: string;
  experimentId: string;
  label: string;
  timestamp: number;
  tables: Record<string, any[][]>;
  customNotes: Record<string, string>;
}

export interface SharePayload {
  magic: 'HIT_PHYSICS_LAB_V1';
  experimentId: string;
  experimentName: string;
  timestamp: number;
  tables: Record<string, any[][]>;
  customNotes: Record<string, string>;
}

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
   * 获取实验快照列表对应的存储键名
   */
  public static getSnapshotKey(experimentId: string): string {
    return `${SNAPSHOT_PREFIX}${experimentId}`;
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
      if (this.debounceTimers[experimentId]) {
        clearTimeout(this.debounceTimers[experimentId]);
        delete this.debounceTimers[experimentId];
      }
      const pending = this.pendingStates[experimentId] || {};
      delete this.pendingStates[experimentId];

      if (typeof window !== 'undefined' && window.localStorage) {
        const current = this.loadExperimentData(experimentId, {});
        const mergedTables = {
          ...(current.tables || {}),
          ...(pending.tables || {}),
          ...(state.tables || {}),
        };
        const mergedNotes = {
          ...(current.customNotes || {}),
          ...(pending.customNotes || {}),
          ...(state.customNotes || {}),
        };
        const merged: ExperimentPersistedState = {
          ...current,
          ...pending,
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
   * 保存手动存档快照 (每个实验最多保留最近 12 个快照)
   */
  public static saveSnapshot(
    experimentId: string,
    label: string,
    tables: Record<string, any[][]>,
    customNotes: Record<string, string>
  ): ExperimentSnapshot {
    this.saveExperimentDataSync(experimentId, { tables, customNotes });
    const now = Date.now();
    const snapshot: ExperimentSnapshot = {
      id: `snap_${now}_${Math.random().toString(36).slice(2, 6)}`,
      experimentId,
      label: label.trim() || `手机端存档 (${new Date(now).toLocaleTimeString('zh-CN', { hour12: false })})`,
      timestamp: now,
      tables,
      customNotes,
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const list = this.listSnapshots(experimentId);
        const updated = [snapshot, ...list].slice(0, 12);
        localStorage.setItem(this.getSnapshotKey(experimentId), JSON.stringify(updated));
      }
    } catch (e) {
      console.error('[StorageManager] 保存快照失败:', e);
    }
    return snapshot;
  }

  /**
   * 获取指定实验的所有历史快照
   */
  public static listSnapshots(experimentId: string): ExperimentSnapshot[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(this.getSnapshotKey(experimentId));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[StorageManager] 读取快照列表失败:', e);
    }
    return [];
  }

  /**
   * 删除指定快照
   */
  public static deleteSnapshot(experimentId: string, snapshotId: string): ExperimentSnapshot[] {
    const list = this.listSnapshots(experimentId).filter((s) => s.id !== snapshotId);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.getSnapshotKey(experimentId), JSON.stringify(list));
      }
    } catch (e) {
      console.error('[StorageManager] 删除快照失败:', e);
    }
    return list;
  }

  /**
   * 编码跨设备同步口令 (UTF-8 Base64 URL-safe)
   */
  public static encodeShareCode(payload: SharePayload): string {
    const jsonStr = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'HITLAB1:' + btoa(binary);
  }

  /**
   * 解码跨设备同步口令或 JSON 字符串
   */
  public static decodeShareInput(input: string): SharePayload | null {
    try {
      const trimmed = input.trim();
      let code = trimmed;

      // 如果粘贴的是包含 #sync= 的完整链接，提取参数部分
      const hashIdx = trimmed.indexOf('#sync=');
      if (hashIdx !== -1) {
        code = decodeURIComponent(trimmed.slice(hashIdx + 6));
      }

      if (code.startsWith('HITLAB1:')) {
        const b64 = code.slice(8);
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const jsonStr = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(jsonStr) as SharePayload;
        if (parsed && parsed.magic === 'HIT_PHYSICS_LAB_V1' && isPlainObject(parsed.tables)) {
          return parsed;
        }
      } else {
        const parsed = JSON.parse(trimmed) as SharePayload;
        if (parsed && isPlainObject(parsed.tables)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[StorageManager] 解析同步口令失败:', e);
    }
    return null;
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
