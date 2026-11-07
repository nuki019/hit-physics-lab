/**
 * 实验数据持久化存储契约
 * 文件路径: src/types/storage.ts
 */

export interface ExperimentPersistedState {
  version: number;
  experimentId: string;
  timestamp: number;
  tables: Record<string, (number | string | null)[][]>;
  customNotes?: Record<string, string>;
  extraParams?: Record<string, number | string>;
}
