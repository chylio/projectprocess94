
import React, { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { AppConfig } from '../types';

interface FooterProps {
  config: AppConfig;
  isAdmin: boolean;
  onUpdate: (newConfig: AppConfig) => void;
}

const Footer: React.FC<FooterProps> = ({ config, isAdmin, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempConfig, setTempConfig] = useState<AppConfig>(config);

  const handleEdit = () => {
    setTempConfig(config);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    onUpdate(tempConfig);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mt-16 pt-6 border-t border-slate-200 flex flex-col items-end gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
        <div className="w-full max-w-md space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500 whitespace-nowrap w-16">版本日期:</span>
            <input
              type="text"
              value={tempConfig.version}
              onChange={(e) => setTempConfig({ ...tempConfig, version: e.target.value })}
              className="flex-1 px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500 whitespace-nowrap w-16">版本聲明:</span>
            <input
              type="text"
              value={tempConfig.authority}
              onChange={(e) => setTempConfig({ ...tempConfig, authority: e.target.value })}
              className="flex-1 px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <button 
            onClick={handleCancel}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X size={14} /> 取消
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-md shadow-sm transition-colors"
          >
            <Check size={14} /> 儲存設定
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 pt-8 border-t border-slate-200 flex justify-end">
      <div className="text-right group relative pl-8">
        {isAdmin && (
           <button 
             onClick={handleEdit}
             className="absolute -left-2 top-0 p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
             title="編輯版本資訊"
           >
             <Edit3 size={16} />
           </button>
        )}
        <p className="text-sm font-bold text-slate-700 mb-1">
          版本: {config.version}
        </p>
        <p className="text-xs text-slate-500 font-medium">
          {config.authority}
        </p>
      </div>
    </div>
  );
};

export default Footer;
