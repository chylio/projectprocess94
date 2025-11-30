
import React, { useState } from 'react';
import { Cloud, Lock, LogOut, CheckCircle2, Save } from 'lucide-react';
import { WORKFLOW_DATA, DEFAULT_APP_CONFIG } from './constants';
import { WorkflowStep, AmountFilter, AppConfig } from './types';
import StepCard from './components/StepCard';
import FilterCard from './components/FilterCard';
import DetailModal from './components/DetailModal';
import LoginModal from './components/LoginModal';
import Footer from './components/Footer';

const STORAGE_KEY = 'admin_workflow_data_v1';
const CONFIG_STORAGE_KEY = 'admin_workflow_config_v1';

const App: React.FC = () => {
  // 1. Workflow Data State
  const [workflowData, setWorkflowData] = useState<WorkflowStep[]>(() => {
    if (typeof window === 'undefined') return WORKFLOW_DATA;
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("讀取儲存資料失敗:", error);
    }
    return WORKFLOW_DATA;
  });

  // 2. App Config State (Version info)
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_APP_CONFIG;
    try {
      const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (savedConfig) {
        return JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error("讀取設定失敗:", error);
    }
    return DEFAULT_APP_CONFIG;
  });

  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('low');
  
  // Auth states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const handleStepClick = (step: WorkflowStep) => {
    const currentStepData = workflowData.find(s => s.id === step.id) || step;
    setSelectedStep(currentStepData);
  };

  const handleCloseModal = () => {
    setSelectedStep(null);
  };

  // Update Workflow Steps
  const handleUpdateStep = (updatedStep: WorkflowStep) => {
    setWorkflowData(prevData => {
      const newData = prevData.map(step => 
        step.id === updatedStep.id ? updatedStep : step
      );
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        triggerSaveToast();
      } catch (e) {
        console.error("存檔失敗", e);
        alert("儲存失敗，可能是瀏覽器空間不足或隱私設定阻擋。");
      }
      
      return newData;
    });
    
    setSelectedStep(updatedStep);
  };

  // Update Footer Config
  const handleUpdateConfig = (newConfig: AppConfig) => {
    setAppConfig(newConfig);
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
      triggerSaveToast();
    } catch (e) {
      console.error("設定存檔失敗", e);
    }
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

  const handleResetData = () => {
    if (window.confirm('確定要重置所有資料 (含流程內容與版本資訊) 回到預設值嗎？此動作無法復原。')) {
      setWorkflowData(WORKFLOW_DATA);
      setAppConfig(DEFAULT_APP_CONFIG);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      window.location.reload();
    }
  };

  if (workflowData.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#F3F6FC] text-slate-800 pb-20">
      {/* Save Toast Notification */}
      {showSaveToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                <Save size={14} className="text-emerald-400" />
                變更已儲存
            </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">行政作業流程</h1>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100">
              <Cloud size={14} />
              <span>雲端連線</span>
              <span className="text-slate-300">|</span>
              <span>互動式流程圖表</span>
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
                   重置資料
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
        
        {/* Timeline Vertical Line 
            Mobile: Left 28px (8px start + 20px center)
            Desktop: Left 52px (32px start + 20px center)
        */}
        <div className="absolute left-[28px] md:left-[52px] top-[68px] bottom-32 w-0.5 bg-slate-200"></div>

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
