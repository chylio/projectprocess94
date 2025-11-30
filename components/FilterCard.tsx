import React from 'react';
import { Filter, Check } from 'lucide-react';
import { AmountFilter } from '../types';

interface FilterCardProps {
  value: AmountFilter;
  onChange: (val: AmountFilter) => void;
}

const FilterCard: React.FC<FilterCardProps> = ({ value, onChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <Filter size={60} />
        </div>

      <div className="flex items-center gap-2 mb-3 relative z-10">
        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
            <Filter size={16} />
        </div>
        <h3 className="font-bold text-slate-700">選擇採購金額</h3>
      </div>
      
      <div className="space-y-3 relative z-10">
        <label className={`relative block cursor-pointer group transition-all duration-200 ${value === 'low' ? 'transform scale-[1.02]' : 'opacity-70 hover:opacity-100'}`}>
          <input 
            type="radio" 
            name="amount" 
            className="peer sr-only" 
            checked={value === 'low'}
            onChange={() => onChange('low')}
          />
          <div className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 bg-slate-50 text-slate-500 font-medium transition-all peer-checked:bg-slate-600 peer-checked:border-slate-600 peer-checked:text-white peer-checked:shadow-md group-hover:border-slate-300">
            <div className="flex flex-col">
                <span>&lt; 300 萬</span>
                <span className="text-[10px] font-normal opacity-80">免核定</span>
            </div>
            {value === 'low' && <Check size={16} />}
          </div>
        </label>

        <label className={`relative block cursor-pointer group transition-all duration-200 ${value === 'high' ? 'transform scale-[1.02]' : 'opacity-70 hover:opacity-100'}`}>
          <input 
            type="radio" 
            name="amount" 
            className="peer sr-only"
            checked={value === 'high'}
            onChange={() => onChange('high')}
          />
          <div className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 bg-white text-slate-500 font-medium transition-all peer-checked:bg-amber-500 peer-checked:border-amber-500 peer-checked:text-white peer-checked:shadow-md group-hover:border-slate-300">
             <div className="flex flex-col">
                <span>≧ 300 萬</span>
                <span className="text-[10px] font-normal opacity-80">需委員會核定</span>
             </div>
             {value === 'high' && <Check size={16} />}
          </div>
        </label>
      </div>
    </div>
  );
};

export default FilterCard;