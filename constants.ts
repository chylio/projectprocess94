
import { WorkflowStep, AppConfig } from './types';

// ============================================================================
// ☁️ 雲端同步設定 (Cloud Sync Config) - 安全版
// ============================================================================
export const JSONBIN_CONFIG = {
  // 1. Bin ID (必填): 這是資料的地址，公開也沒關係，因為沒有鑰匙無法修改。
  BIN_ID: '',  // 例如: '656xxxxxxxxxxxxxxxxx'

  // 2. 唯讀鑰匙 (選填):
  // 請在 JSONBin API Keys 建立一把 "Access Key"，權限只勾選 "READ"。
  // 這把鑰匙可以安全地放在這裡，讓一般使用者讀取資料。
  // 若您的 Bin 設為 Public (公開)，此處可留空。
  READ_ACCESS_KEY: '', // 例如: '$2a$10$................'
};

// 注意：Master Key (寫入權限) 已從此檔案移除，將於管理者登入時手動輸入。

export const DEFAULT_APP_CONFIG: AppConfig = {
  version: '2025/12/01',
  authority: '本文件之最新版本以本院「深耕計畫辦公室 A1 組」發布為準',
};

export const WORKFLOW_DATA: WorkflowStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: '提案',
    executor: '行政辦公室',
    task: '簡報提案',
    unit: '深耕計畫辦公室',
    docs: '提案簡報',
    contact: '深耕辦公室 53706',
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: '分項計畫核定',
    executor: '總計畫主持人',
    task: '分項計畫方向、額度 (人事費、業務費、設備費)',
    unit: '深耕計畫辦公室',
    docs: '計畫核定通知書',
    contact: '深耕辦公室 53707',
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: '執行細節確認',
    executor: '分項計畫主持人 / 總計畫主持人',
    task: '確認設備規格、活動規劃',
    unit: '各單位主持人、總計畫主持人',
    docs: [
      '(1) KPI',
      '(2) 成果展現規格',
      '(3) 各類報支要點'
    ],
    contact: '計畫主持人',
  },
  {
    id: 'step-conditional',
    // No number, represented as special conditional block
    title: '經營決策委員會核定',
    executor: '分項計畫主持人',
    task: '單一財物案、勞務案採購 ≧ 300萬，提報每月經決會核定 (主持人通知經決會-林美吟秘書)',
    unit: '各單位主持人',
    docs: '跟院長確認經營決策委員會報告內容、簡報',
    contact: '經營決策委員會 / 林美吟秘書 265755',
    isConditional: true,
  },
  {
    id: 'step-4',
    stepNumber: 4,
    title: '簽呈完備',
    executor: '分項計畫主持人',
    task: '依據需求類別進行簽呈',
    unit: '詳見下方細節',
    docs: '詳見下方細節',
    contact: '依各單位規定',
    subTasks: [
      {
        category: '人力需求',
        requirements: [
          '辦理單位：人資、會計、深耕辦公室及相關單位',
          '文件需求：遵守院內各職級「人力聘用標準」'
        ]
      },
      {
        category: '設備需求',
        requirements: [
          '辦理單位：採購、會計、深耕辦公室及相關單位',
          '文件需求：(1) ≧ 300萬，經決會會議紀錄 (2) 計畫經費預算表 (需遵守各類報支要點規範、法規)'
        ]
      },
      {
        category: '活動/課程辦理',
        requirements: [
          '辦理單位：採購、會計、深耕辦公室及相關單位',
          '文件需求：同設備需求規範'
        ]
      }
    ]
  },
  {
    id: 'step-5',
    stepNumber: 5,
    title: '啟動採購程序',
    executor: '分項計畫主持人',
    task: '填寫規格書、合約書，依採購法規定辦理 (可參考注意事項)',
    unit: '採購',
    docs: [
      '(1) 填寫「財物勞務採購規格表」',
      '(2) 提供合約書',
      '(3) 檢附「經決會會議記錄」、「財物勞務採購規格表」、「簽呈核示通知」，於「請購系統」送出請購單。'
    ],
    contact: '資材室 欣儀/守英',
  },
  {
    id: 'step-6',
    stepNumber: 6,
    title: '完成採購、活動辦理驗收',
    executor: '分項計畫主持人、會計室、深耕辦公室',
    task: '規格驗收、經費核銷',
    unit: '採購、會計、深耕辦公室',
    docs: [
      '(1) 完成帳務核銷',
      '(2) 繳交活動成果'
    ],
    contact: '深耕辦公室 / 資材室 / 會計室',
  },
];
