
import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Building2, FileText, Phone, Edit3, Save, RotateCcw, Plus, Trash2, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { WorkflowStep, SubTask, DocItem } from '../types';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WorkflowStep | null;
  isAdmin?: boolean;
  onUpdate?: (updatedStep: WorkflowStep) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, data, isAdmin = false, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<WorkflowStep | null>(null);

  // Sync state when data changes or modal opens
  useEffect(() => {
    if (data) {
      setFormData(JSON.parse(JSON.stringify(data))); // Deep copy
      setIsEditing(false); // Reset edit mode on open
    }
  }, [data, isOpen]);

  if (!isOpen || !data || !formData) return null;

  const handleSave = () => {
    if (onUpdate && formData) {
      onUpdate(formData);
      setIsEditing(false);
    }
  };

  const handleChange = (field: keyof WorkflowStep, value: any) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSubTaskChange = (index: number, field: keyof SubTask, value: any) => {
    if (!formData.subTasks) return;
    const newSubTasks = [...formData.subTasks];
    
    newSubTasks[index] = {
        ...newSubTasks[index],
        [field]: value
    };
    setFormData(prev => prev ? ({ ...prev, subTasks: newSubTasks }) : null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-20 ${isEditing ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3">
                {data.stepNumber && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg shadow-sm shrink-0">
                        {data.stepNumber}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase">
                        {isEditing ? '編輯模式' : '詳細資訊'}
                    </span>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="block w-full text-2xl font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 mt-1 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                        />
                    ) : (
                        <h2 className="text-2xl font-bold text-slate-800 break-words">{data.title}</h2>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 ml-4">
                {isAdmin && !isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Edit3 size={16} />
                        編輯
                    </button>
                )}
                {isAdmin && isEditing && (
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                        title="取消更改"
                    >
                        <RotateCcw size={16} />
                        取消
                    </button>
                )}
                <button 
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <EditableSection 
            icon={<User />} 
            title="執行者" 
            value={formData.executor}
            isEditing={isEditing}
            onChange={(val) => handleChange('executor', val)}
          />
          
          <EditableSection 
            icon={<Briefcase />} 
            title="任務" 
            value={formData.task}
            isEditing={isEditing}
            onChange={(val) => handleChange('task', val)}
            isMultiline
          />

          <EditableSection 
            icon={<Building2 />} 
            title="辦理單位" 
            value={formData.unit}
            isEditing={isEditing}
            onChange={(val) => handleChange('unit', val)}
          />

          {/* Subtasks Handling (Complex logic) */}
          {formData.subTasks ? (
             <div className={`p-4 rounded-xl space-y-4 border ${isEditing ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                <h3 className="flex items-center gap-2 font-semibold text-slate-700">
                    <FileText size={18} className="text-blue-500" />
                    <span>類別詳細需求</span>
                </h3>
                <div className="space-y-4">
                    {formData.subTasks.map((sub, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="flex gap-2 items-center">
                                      <span className="text-xs font-bold text-slate-400">類別名稱</span>
                                      <input 
                                          className="flex-1 font-bold text-blue-700 border-b border-blue-100 pb-1 focus:outline-none focus:border-amber-400 bg-transparent"
                                          value={sub.category}
                                          onChange={(e) => handleSubTaskChange(idx, 'category', e.target.value)}
                                      />
                                    </div>
                                    <div className="pt-2 border-t border-slate-50">
                                      <span className="text-xs font-bold text-slate-400 block mb-2">需求列表 (可設定連結)</span>
                                      <DocListEditor 
                                        items={sub.requirements} 
                                        onChange={(newItems) => handleSubTaskChange(idx, 'requirements', newItems)} 
                                      />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h4 className="font-bold text-blue-700 mb-2 border-b border-blue-100 pb-1">{sub.category}</h4>
                                    <DocListView items={sub.requirements} />
                                </>
                            )}
                        </div>
                    ))}
                </div>
             </div>
          ) : (
            /* Standard Docs Section with Link Support */
            <div className="flex gap-4">
               <div className={`mt-1 p-2 rounded-lg h-fit ${isEditing ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-500'}`}>
                  <FileText size={20} />
               </div>
               <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-700 mb-1">文件需求</h3>
                  {isEditing ? (
                    <DocListEditor 
                      items={Array.isArray(formData.docs) ? formData.docs : [formData.docs as string]}
                      onChange={(newItems) => handleChange('docs', newItems)}
                    />
                  ) : (
                    <DocListView 
                      items={Array.isArray(formData.docs) ? formData.docs : [formData.docs as string]} 
                    />
                  )}
               </div>
            </div>
          )}

          <EditableSection 
            icon={<Phone />} 
            title="聯絡窗口" 
            value={formData.contact}
            isEditing={isEditing}
            onChange={(val) => handleChange('contact', val)}
          />

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl sticky bottom-0 z-10 flex gap-3">
          {isAdmin && isEditing ? (
             <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Save size={18} />
                儲存變更
              </button>
          ) : (
              <button 
                onClick={onClose}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                關閉視窗
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Helper Components for Docs with Links
// ----------------------------------------------------------------------

const DocListView: React.FC<{ items: (string | DocItem)[] }> = ({ items }) => {
  return (
    <ul className="list-none space-y-2">
        {items.map((item, idx) => {
           if (!item) return null;
           const isObj = typeof item !== 'string';
           const label = isObj ? (item as DocItem).label : (item as string);
           const url = isObj ? (item as DocItem).url : undefined;

           return (
             <li key={idx} className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100 block break-words hover:bg-slate-100 transition-colors">
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-blue-600 hover:text-blue-800 hover:underline group">
                    <span className="mt-0.5"><LinkIcon size={14} /></span>
                    <span>{label}</span>
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </a>
                ) : (
                  <span>{label}</span>
                )}
             </li>
           );
        })}
    </ul>
  );
};

const DocListEditor: React.FC<{ items: (string | DocItem)[], onChange: (items: (string | DocItem)[]) => void }> = ({ items, onChange }) => {
  
  // Normalize everything to DocItem objects for editing
  const getNormalizedItems = () => items.map(item => {
    if (typeof item === 'string') return { label: item, url: '' };
    return { label: item.label, url: item.url || '' };
  });

  const handleUpdate = (index: number, field: 'label' | 'url', value: string) => {
    const current = getNormalizedItems();
    current[index] = { ...current[index], [field]: value };
    onChange(current);
  };

  const handleRemove = (index: number) => {
    const current = getNormalizedItems();
    onChange(current.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    const current = getNormalizedItems();
    onChange([...current, { label: '', url: '' }]);
  };

  const displayItems = getNormalizedItems();

  return (
    <div className="space-y-2">
      {displayItems.map((item, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row gap-2 bg-white p-2 border border-slate-200 rounded-lg group">
           <div className="flex-1">
             <input 
                placeholder="顯示文字 (例如: 填寫申請表)" 
                value={item.label}
                onChange={(e) => handleUpdate(idx, 'label', e.target.value)}
                className="w-full text-sm p-1.5 border-b border-slate-100 focus:border-amber-400 focus:outline-none"
             />
             <div className="flex items-center gap-2 mt-1">
                <LinkIcon size={12} className="text-slate-400" />
                <input 
                  placeholder="連結網址 (https://...)" 
                  value={item.url}
                  onChange={(e) => handleUpdate(idx, 'url', e.target.value)}
                  className="flex-1 text-xs text-blue-600 p-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-slate-300"
                />
             </div>
           </div>
           <button 
             onClick={() => handleRemove(idx)}
             className="self-start sm:self-center p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
             title="刪除"
           >
             <Trash2 size={16} />
           </button>
        </div>
      ))}
      <button 
        onClick={handleAdd}
        className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
      >
        <Plus size={16} />
        新增項目
      </button>
    </div>
  );
};

// ----------------------------------------------------------------------
// Generic Editor Section
// ----------------------------------------------------------------------

const EditableSection: React.FC<{
    icon: React.ReactNode; 
    title: string; 
    value: string;
    isEditing: boolean;
    onChange: (val: string) => void;
    isMultiline?: boolean;
}> = ({ icon, title, value, isEditing, onChange, isMultiline }) => (
    <div className="flex gap-4">
        <div className={`mt-1 p-2 rounded-lg h-fit ${isEditing ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-500'}`}>
            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
            {isEditing ? (
                isMultiline ? (
                    <textarea 
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-h-[120px] text-sm leading-relaxed"
                        placeholder={`請輸入${title}`}
                    />
                ) : (
                    <input 
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                        placeholder={`請輸入${title}`}
                    />
                )
            ) : (
               <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base break-words">
                   {value}
               </p>
            )}
        </div>
    </div>
);

export default DetailModal;
