
import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, CloudOff, Lock, LogOut, CheckCircle2, Save, RefreshCw, Loader2 } from 'lucide-react';
import { WORKFLOW_DATA, DEFAULT_APP_CONFIG, JSONBIN_CONFIG } from './constants';
import { WorkflowStep, AmountFilter, AppConfig } from './types';
import StepCard from './components/StepCard';
import FilterCard from './components/FilterCard';
import DetailModal from './components/DetailModal';
import LoginModal from './components/LoginModal';
import Footer from './components/Footer';

const STORAGE_KEY = 'admin_workflow_data_v1';
const CONFIG_STORAGE_KEY = 'admin_workflow_config_v1';

// Helper to check if cloud config is valid
const isCloudConfigured = () => {
  return (
    JSONBIN_CONFIG.API_KEY && 
    JSONBIN_CONFIG.API_KEY.length > 10 && 
    JSONBIN_CONFIG.BIN_ID && 
    JSONBIN_CONFIG.BIN_ID.length > 5
  );
};

const App: React.FC = () => {
  // 1. Data States
  const [workflowData, setWorkflowData] = useState<WorkflowStep[]>(WORKFLOW_DATA);
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  
  // 2. UI & Filter States
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('low');
  
  // 3. System States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load Data on Mount
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      // Step A: Load from LocalStorage first (Fast render)
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (savedData) setWorkflowData(JSON.parse(savedData));
        if (savedConfig) setAppConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error("Local read error:", error);
      }

      // Step B: If Cloud is configured, fetch latest
      if (isCloudConfigured()) {
        setIsCloudMode(true);
        try {
          const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_CONFIG.BIN_ID}/latest`, {
            headers: {
              'X-Master-Key': JSONBIN_CONFIG.API_KEY,
              'X-Bin-Meta': 'false' // We just want the data body
            }
          });
          
          if (response.ok) {
            const cloudData = await response.json();
            // Assuming structure: { workflowData: [...], appConfig: {...} }
            if (cloudData.workflowData) {
              setWorkflowData(cloudData.workflowData);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData.workflowData)); // Sync to local
            }
            if (cloudData.appConfig) {
              setAppConfig(cloudData.appConfig);
              localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cloudData.appConfig)); // Sync to local
            }
            console.log("Cloud sync successful");
          } else {
            console.warn("Cloud fetch returned:", response.status);
          }
        } catch (e) {
          console.error("Cloud fetch failed:", e);
        }
      }
      
      setIsLoading(false);
    };

    initData();
  }, []);

  const saveToCloud = async (newData: WorkflowStep[], newConfig: AppConfig) => {
    if (!isCloudConfigured()) return;
    
    setIsSaving(true);
    try {
      await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_CONFIG.BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_CONFIG.API_KEY
        },
        body: JSON.stringify({
          workflowData: newData,
          appConfig: newConfig
        })
      });
    } catch (e) {
      console.error("Cloud save failed:", e);
      alert("雲端存檔失敗，但已儲存於本機。請檢查網路連線。");
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

  // Update Workflow Steps
  const handleUpdateStep = (updatedStep: WorkflowStep) => {
    const newData = workflowData.map(step => 
      step.id === updatedStep.id ? updatedStep : step
    );
    
    // 1. Update State (Optimistic)
    setWorkflowData(newData);
    setSelectedStep(updatedStep);

    // 2. Save Local
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    triggerSaveToast();

    // 3. Save Cloud
    saveToCloud(newData, appConfig);
  };

  // Update Footer Config
  const handleUpdateConfig = (newConfig: AppConfig) => {
    // 1. Update State
    setAppConfig(newConfig);

    // 2. Save Local
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    triggerSaveToast();

    // 3. Save Cloud
    saveToCloud(workflowData, newConfig);
  };

  const triggerSaveToast = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setSelectedStep(null);
  };

  const handleResetData = async () => {
    if (window.confirm('確定要重置所有資料 (含流程內容與版本資訊) 回到預設值嗎？\n注意：這將會覆蓋雲端與本機的資料！')) {
      const resetData = WORKFLOW_DATA;
      const resetConfig = DEFAULT_APP_CONFIG;
      
      setWorkflowData(resetData);
      setAppConfig(resetConfig);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(resetConfig));
      
      if (isCloudConfigured()) {
        await saveToCloud(resetData, resetConfig);
      }
      
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
            
            {/* Sync Status Badge */}
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
          
          <div className="flex items-center gap-3">
            {isAdmin ? (
               <>
                 <span className="hidden md:flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <CheckCircle2 size={12} />
                    管理者模式
                 </span>
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
                    <span>登出</span>
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
        
        {/* Vertical Line */}
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

        {/* Footer Area */}
        <Footer 
          config={appConfig} 
          isAdmin={isAdmin} 
          onUpdate={handleUpdateConfig} 
        />

      </main>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Detail Modal */}
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
