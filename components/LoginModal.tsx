
import React, { useState } from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (account === '9400' && password === '9401') {
      onLoginSuccess();
      setError('');
      setAccount('');
      setPassword('');
      onClose();
    } else {
      setError('帳號或密碼錯誤');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            <Lock size={18} className="text-blue-600" />
            管理者登入
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">帳號</label>
            <input 
              type="text" 
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="請輸入帳號"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">密碼</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="請輸入密碼"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-sm mt-2"
          >
            登入系統
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
