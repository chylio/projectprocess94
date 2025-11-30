
export interface DocItem {
  label: string;
  url?: string;
}

export interface SubTask {
  category: string;
  requirements: (string | DocItem)[];
}

export interface WorkflowStep {
  id: number | string;
  stepNumber?: number; // Visual number shown in the blue circle
  title: string;
  executor: string; // 執行者
  task: string; // 任務 (can be long text)
  unit: string; // 辦理單位
  docs: string | (string | DocItem)[]; // 文件需求 (Compatible with old strings and new objects)
  contact: string; // 聯絡窗口
  isConditional?: boolean; // If true, depends on the budget filter
  subTasks?: SubTask[]; // For complex steps like Step 4 where tasks differ by category
}

export type AmountFilter = 'low' | 'high'; // low: < 300萬, high: >= 300萬

export interface AppConfig {
  version: string;
  authority: string;
}
