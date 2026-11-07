/**
 * 实验插件注册中心 (Core Plugin Registry)
 * 文件路径: src/core/registry.ts
 */

import { useSyncExternalStore } from 'react';
import type { ExperimentPlugin, ExperimentCategory } from '../types/experiment';

export class ExperimentRegistry {
  private plugins: Map<string, ExperimentPlugin> = new Map();
  private categoryMap: Map<string, string[]> = new Map([
    ['力热', []],
    ['电磁', []],
    ['光学', []],
    ['近代', []],
  ]);
  private listeners: Set<() => void> = new Set();
  private defaultExperimentId: string = '';

  /**
   * 注册单个实验插件
   */
  public register(plugin: ExperimentPlugin): void {
    if (!plugin || !plugin.id) {
      throw new Error('[RegistryError] 无法注册空插件或未提供唯一 ID 的插件');
    }

    if (this.plugins.has(plugin.id)) {
      console.warn(`[RegistryWarn] 实验插件 ID "${plugin.id}" 已存在，正在覆盖旧注册定义。`);
    }

    this.plugins.set(plugin.id, plugin);

    // 维护分类索引
    const catKey = String(plugin.category);
    const catList = this.categoryMap.get(catKey) || [];
    if (!catList.includes(plugin.id)) {
      catList.push(plugin.id);
      this.categoryMap.set(catKey, catList);
    }

    // 若尚未设置默认实验，首个注册的实验即为默认实验
    if (!this.defaultExperimentId) {
      this.defaultExperimentId = plugin.id;
    }

    this.notifyListeners();
  }

  /**
   * 批量注册实验插件
   */
  public registerBatch(plugins: ExperimentPlugin[]): void {
    for (const plugin of plugins) {
      this.register(plugin);
    }
  }

  /**
   * 按 ID 获取实验插件
   */
  public get(id: string): ExperimentPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * 按 ID 获取实验插件 (不存在时抛出中文详细错误)
   */
  public getOrThrow(id: string): ExperimentPlugin {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`[RegistryError] 未找到 ID 为 "${id}" 的实验插件。请检查是否已在 experiments/ 中注册。`);
    }
    return plugin;
  }

  /**
   * 获取所有已注册的实验插件清单
   */
  public getAll(): ExperimentPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 按学科分类获取实验插件列表
   */
  public getByCategory(category: ExperimentCategory): ExperimentPlugin[] {
    const ids = this.categoryMap.get(String(category)) || [];
    return ids.map((id) => this.plugins.get(id)!).filter(Boolean);
  }

  /**
   * 检查指定 ID 是否已注册
   */
  public has(id: string): boolean {
    return this.plugins.has(id);
  }

  /**
   * 获取默认选中的实验 ID
   */
  public getDefaultId(): string {
    return this.defaultExperimentId;
  }

  /**
   * 设置默认实验 ID
   */
  public setDefaultId(id: string): void {
    if (!this.plugins.has(id)) {
      throw new Error(`[RegistryError] 无法设置不存在的 ID "${id}" 为默认实验`);
    }
    this.defaultExperimentId = id;
    this.notifyListeners();
  }

  /**
   * 注册变更事件监听器 (用于与外部状态同步)
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 清空注册表 (专门用于单元测试隔离)
   */
  public clearForTesting(): void {
    this.plugins.clear();
    for (const key of this.categoryMap.keys()) {
      this.categoryMap.set(key, []);
    }
    this.defaultExperimentId = '';
    this.notifyListeners();
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('[RegistryNotificationError]', err);
      }
    }
  }
}

// 导出全局单例
export const registry = new ExperimentRegistry();

// ==========================================
// 辅助工具函数：从动态数据表中提取数值列
// ==========================================
export function extractNumericColumn(
  tableRows: Array<Record<string, any>> | undefined,
  columnKey: string
): number[] {
  if (!tableRows || !Array.isArray(tableRows)) return [];
  const result: number[] = [];
  for (const row of tableRows) {
    const val = row[columnKey];
    if (val !== null && val !== undefined && val !== '') {
      const num = Number(val);
      if (!Number.isNaN(num)) {
        result.push(num);
      }
    }
  }
  return result;
}

// ==========================================
// React 响应式 Hook 适配器
// ==========================================

/**
 * 监听并获取当前所有已注册插件列表
 */
export function useAllExperiments(): ExperimentPlugin[] {
  return useSyncExternalStore(
    (callback) => registry.subscribe(callback),
    () => registry.getAll()
  );
}

/**
 * 根据 ID 获取特定实验插件
 */
export function useExperiment(id: string | null | undefined): ExperimentPlugin | undefined {
  return useSyncExternalStore(
    (callback) => registry.subscribe(callback),
    () => (id ? registry.get(id) : undefined)
  );
}

/**
 * 根据物理分类获取实验列表
 */
export function useExperimentsByCategory(category: ExperimentCategory): ExperimentPlugin[] {
  return useSyncExternalStore(
    (callback) => registry.subscribe(callback),
    () => registry.getByCategory(category)
  );
}
