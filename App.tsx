import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, Lock, LogOut, CheckCircle2, Save, RefreshCw, Loader2, Settings } from 'lucide-react';
import { WORKFLOW_DATA, DEFAULT_APP_CONFIG, JSONBIN_CONFIG } from './constants';
import { WorkflowStep, AmountFilter, AppConfig } from './types';
import StepCard from './components/StepCard';
import FilterCard from './components/FilterCard';
import DetailModal from './components/DetailModal';
import LoginModal from './components/LoginModal';
import SettingsModal from './components/SettingsModal';
import Footer from './components/Footer';

const STORAGE_KEY = 'admin_workflow_data_v1';
const CONFIG_STORAGE_KEY = 'admin_workflow_config_v1';
const ADMIN_KEY_STORAGE = 'admin_master_key';
const CUSTOM_BIN_ID_STORAGE = 'custom_bin_id';

const App: React.FC = () => {
  // 1. Data States
  const [workflowData, setWorkflowData] = useState<WorkflowStep[]>(WORKFLOW_DATA);
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  
  // 2. UI & Filter States
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('low');
  
  // 3. System States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminApiKey, setAdminApiKey] = useState<string>(''); // Key for WRITING (Private)
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to get effective Bin ID (Local override > Constant)
  const getEffectiveBinId = () => {
      const custom = localStorage.getItem(CUSTOM_BIN_ID_STORAGE);
      return custom || JSONBIN_CONFIG.BIN_ID;
  };

  // Load Data on Mount
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      // A. Check for Admin Key in local storage
      const savedAdminKey = localStorage.getItem(ADMIN_KEY_STORAGE);
      if (savedAdminKey) {
          setAdminApiKey(savedAdminKey);
      }

      // B. Load from LocalStorage first (Fast render)
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (savedData) setWorkflowData(JSON.parse(savedData));
        if (savedConfig) setAppConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error("Local read error:", error);
      }

      // C. Cloud Fetch (READ ONLY)
      const targetBinId = getEffectiveBinId();
      
      if (targetBinId && targetBinId.length > 5) {
        setIsCloudMode(true);
        try {
          const headers: Record<string, string> = {
            'X-Bin-Meta': 'false'
          };
          
          if (JSONBIN_CONFIG.READ_ACCESS_KEY) {
            headers['X-Access-Key'] = JSONBIN_CONFIG.READ_ACCESS_KEY;
          }

          const response = await fetch(`https://api.jsonbin.io/v3/b/${targetBinId}/latest`, {
            headers: headers
          });
          
          if (response.ok) {
            const cloudData = await response.json();
            if (cloudData.workflowData) {
              setWorkflowData(cloudData.workflowData);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData.workflowData)); 
            }
            if (cloudData.appConfig) {
              setAppConfig(cloudData.appConfig);
              localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cloudData.appConfig));
            }
            console.log("Cloud sync successful (Read)");
          } else {
            console.warn("Cloud fetch returned:", response.status);
            if (response.status === 401 || response.status === 403) {
                console.error("Access Denied: Please check if Bin is Public or Read Key is valid.");
            }
          }
        } catch (e) {
          console.error("Cloud fetch failed:", e);
        }
      }
      
      setIsLoading(false);
    };

    initData();
  }, []);

  // Save Function - Requires Admin API Key
  const saveToCloud = async (newData: WorkflowStep[], newConfig: AppConfig) => {
    // Priority: State key > LocalStorage key
    const keyToUse = adminApiKey || localStorage.getItem(ADMIN_KEY_STORAGE);
    const targetBinId = getEffectiveBinId();

    if (!targetBinId) {
        console.warn("Cannot save: Missing Bin ID");
        return;
    }

    if (!keyToUse) {
        alert("無法儲存至雲端：找不到 Master Key。\n請至「系統設定」輸入您的 JSONBin Master Key。");
        setIsSettingsOpen(true);
        return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${targetBinId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': keyToUse
        },
        body: JSON.stringify({
          workflowData: newData,
          appConfig: newConfig
        })
      });
      
      if (!response.ok) {
          throw new Error(`Save failed: ${response.status}`);
      }
    } catch (e) {
      console.error("Cloud save failed:", e);
      alert("雲端存檔失敗！請檢查您的 Internet 連線或 Master Key 是否正確。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStepClick = (step: WorkflowStep) => {
    const currentStepData = workflowData.find(s => s.id === step.id) || step;
    setSelectedStep(currentStepData);
  };

  const handleCloseModal = () => {
    setSelectedStep(null);
  };

  const handleUpdateStep = (updatedStep: WorkflowStep) => {
    const newData = workflowData.map(step => 
      step.id === updatedStep.id ? updatedStep : step
    );
    
    setWorkflowData(newData);
    setSelectedStep(updatedStep);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    triggerSaveToast();
    saveToCloud(newData, appConfig);
  };

  const handleUpdateConfig = (newConfig: AppConfig) => {
    setAppConfig(newConfig);
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    triggerSaveToast();
    saveToCloud(workflowData, newConfig);
  };

  const triggerSaveToast = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleLoginSuccess = (key: string) => {
    setIsAdmin(true);
    if (key) setAdminApiKey(key);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminApiKey('');
    // We don't remove the key from LocalStorage here intentionally, 
    // so the admin doesn't have to re-enter it next time on the same machine.
    setSelectedStep(null);
  };

  const handleResetData = async () => {
    if (window.confirm('確定要重置所有資料 (含流程內容與版本資訊) 回到預設值嗎？此動作將覆蓋雲端資料。')) {
      const resetData = WORKFLOW_DATA;
      const resetConfig = DEFAULT_APP_CONFIG;
      
      setWorkflowData(resetData);
      setAppConfig(resetConfig);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(resetConfig));
      
      await saveToCloud(resetData, resetConfig);
      
      window.location.reload();
    }
  };

  if (!workflowData || workflowData.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#F3F6FC] text-slate-800 pb-20 font-sans">
      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                {isSaving ? <Loader2 size={14} className="animate-spin text-blue-400" /> : <Save size={14} className="text-emerald-400" />}
                {isSaving ? '同步至雲端中...' : '變更已儲存'}
            </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">行政作業流程</h1>
            
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors
              ${isCloudMode 
                ? 'bg-blue-50 text-blue-600 border-blue-100' 
                : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {isLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : isCloudMode ? (
                <Cloud size={14} />
              ) : (
                <CloudOff size={14} />
              )}
              <span>{isCloudMode ? '雲端同步中' : '本機模式'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {isAdmin ? (
               <>
                 <span className="hidden md:flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <CheckCircle2 size={12} />
                    管理者模式
                 </span>
                 
                 <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title="系統設定"
                 >
                   <Settings size={18} />
                 </button>

                 <div className="w-px h-4 bg-slate-300 mx-1 hidden md:block"></div>

                 <button 
                  onClick={handleResetData}
                  className="hidden md:block text-xs text-slate-400 hover:text-red-500 underline mr-2"
                 >
                   重置
                 </button>
                 <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <LogOut size={14} />
                    <span className="hidden md:inline">登出</span>
                 </button>
               </>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors"
              >
                <Lock size={14} />
                <span>管理者登入</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 relative">
        <div className="absolute left-[28px] md:left-[52px] top-[68px] bottom-32 w-0.5 bg-slate-200"></div>

        {/* Loading Overlay */}
        {isLoading && (
           <div className="absolute inset-0 z-30 bg-[#F3F6FC]/80 backdrop-blur-[1px] flex items-start justify-center pt-20">
             <div className="flex items-center gap-2 text-blue-600 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                <Loader2 className="animate-spin" />
                讀取雲端資料...
             </div>
           </div>
        )}

        <div className="flex flex-col gap-8 md:gap-10">
          {workflowData.map((step) => {
            if (step.isConditional) {
                return (
                  <StepCard 
                      key={step.id} 
                      step={step} 
                      onClick={handleStepClick}
                      isDisabled={amountFilter === 'low'}
                      action={
                        <FilterCard value={amountFilter} onChange={setAmountFilter} />
                      }
                  />
                );
            }
            return (
              <StepCard 
                  key={step.id} 
                  step={step} 
                  onClick={handleStepClick}
              />
            );
          })}
        </div>

        <Footer 
          config={appConfig} 
          isAdmin={isAdmin} 
          onUpdate={handleUpdateConfig} 
        />
      </main>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentBinId={getEffectiveBinId()}
      />

      <DetailModal 
        isOpen={!!selectedStep} 
        onClose={handleCloseModal} 
        data={selectedStep}
        isAdmin={isAdmin}
        onUpdate={handleUpdateStep}
      />
    </div>
  );
};

export default App;