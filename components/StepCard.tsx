
import React from 'react';
import { ArrowRight, Lock, AlertTriangle } from 'lucide-react';
import { WorkflowStep } from '../types';

interface StepCardProps {
  step: WorkflowStep;
  onClick: (step: WorkflowStep) => void;
  isDisabled?: boolean;
  action?: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ step, onClick, isDisabled = false, action }) => {
  return (
    // Updated Margins: ml-12 (48px) on mobile, ml-24 (96px) on desktop
    // Removed mb-8 so parent flex gap controls spacing
    <div className="ml-12 md:ml-24 relative group">
      {/* Connector Circle 
          Mobile: -left-[40px] -> 48px - 40px = starts at 8px. Center at 8+20=28px.
          Desktop: -left-[64px] -> 96px - 64px = starts at 32px. Center at 32+20=52px.
      */}
      <div 
        className={`absolute -left-[40px] md:-left-[64px] top-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm z-10 transition-transform duration-300 group-hover:scale-110 
        ${step.isConditional ? 'bg-amber-100 text-amber-600 ring-4 ring-white' : 'bg-blue-600 text-white ring-4 ring-white'}`}
      >
        {step.isConditional ? <AlertTriangle size={20} /> : step.stepNumber}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Main Card Content */}
          <div 
            className="flex-1 w-full"
            onClick={() => !isDisabled && onClick(step)}
          >
            {isDisabled ? (
                <div className="relative select-none cursor-not-allowed">
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="bg-slate-200 p-1 rounded-full">
                                <Lock size={12} className="text-slate-500" />
                             </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">此步驟已略過 (Skipped)</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-400 mb-1">{step.title}</h3>
                        <p className="text-slate-400 text-sm">此步驟僅適用於採購金額 ≧ 300 萬之案件。</p>
                    </div>
                </div>
            ) : (
                <div 
                    className={`bg-white rounded-xl p-6 shadow-sm border border-slate-100 transition-all duration-300 cursor-pointer relative overflow-hidden
                    hover:shadow-md hover:border-blue-200 hover:-translate-y-1
                    ${step.isConditional ? 'border-amber-200 bg-amber-50/30' : ''}`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-bold tracking-wider uppercase ${step.isConditional ? 'text-amber-600' : 'text-blue-600'}`}>
                                    {step.isConditional ? 'Conditional Step' : `Step ${step.stepNumber}`}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                                {step.title}
                            </h3>
                            
                            <p className="text-slate-500 text-sm line-clamp-2">
                                {step.executor} · {step.unit}
                            </p>
                        </div>

                        <div className="mt-2 ml-4 text-slate-300 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1 duration-300">
                            <ArrowRight size={24} />
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* Action Slot (e.g., Filter) */}
          {action && (
              <div className="w-full md:w-72 shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
                  {action}
              </div>
          )}
      </div>
    </div>
  );
};

export default StepCard;
