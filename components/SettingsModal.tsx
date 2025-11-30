import React, { useState, useEffect } from 'react';
import { X, Save, KeyRound, Database, AlertTriangle, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBinId: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentBinId }) => {
  const [apiKey, setApiKey] = useState('');
  const [binId, setBinId] = useState('');
  
  useEffect(() => {
    if (isOpen) {
        const savedKey = localStorage.getItem('admin_master_key') || '';
        const savedBin = localStorage.getItem('custom_bin_id') || currentBinId || '';
        setApiKey(savedKey);
        setBinId(savedBin);
    }
  }, [isOpen, currentBinId]);

  const handleSave = () => {
    if (apiKey.trim()) {
        localStorage.setItem('admin_master_key', apiKey.trim());
    }
    if (binId.trim()) {
        // Only save custom bin ID if it's different from default to avoid clutter
        localStorage.setItem('custom_bin_id', binId.trim());
    }
    
    // Force reload to apply new settings (simplest way to reset all states)
    window.location.reload();
  };

  const handleClear = () => {
    if (window.confirm('確定要清除瀏覽器紀錄的金鑰與設定嗎？')) {
        localStorage.removeItem('admin_master_key');
        localStorage.removeItem('custom_bin_id');
        window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
            <Database size={20} className="text-slate-500" />
            系統連線設定
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100 leading-relaxed">
                此處設定僅儲存於<strong>您的瀏覽器</strong>。設定 Master Key 後，編輯資料時將自動帶入驗證，無需重複輸入。
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <KeyRound size={16} className="text-emerald-500" />
                    JSONBin Master Key (寫入權限)
                </label>
                <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                    placeholder="請輸入 $2a$10$... 開頭的金鑰"
                />
                <p className="text-xs text-slate-400">用於儲存修改後的資料。</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Database size={16} className="text-blue-500" />
                    Bin ID (資料庫位置)
                </label>
                <input 
                    type="text" 
                    value={binId}
                    onChange={(e) => setBinId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="請輸入 656... 開頭的 ID"
                />
                 <div className="flex items-start gap-2 mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>注意：若修改此處 ID，請確保一般使用者的程式碼 (`constants.ts`) 中也填入相同的 ID，否則他們將無法看到您更新的資料。</span>
                </div>
            </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
           <button 
                onClick={handleClear}
                className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
                <Trash2 size={16} />
                清除設定
            </button>
            <div className="flex-1"></div>
            <button 
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
                取消
            </button>
            <button 
                onClick={handleSave}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
                <Save size={18} />
                儲存並重整
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;