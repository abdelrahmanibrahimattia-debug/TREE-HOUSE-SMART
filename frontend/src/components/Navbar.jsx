import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import TreeHouseLogo from './TreeHouseLogo.jsx';
import { LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-40 px-6 flex items-center justify-between shadow-xs">
      {/* Brand & Logo */}
      <div className="flex items-center gap-4">
        <TreeHouseLogo size={38} showText={true} />
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-xl py-1.5 px-3">
            <div className="w-8 h-8 rounded-lg bg-tree-green/10 text-tree-green flex items-center justify-center font-bold text-sm">
              {user.name ? user.name[0] : <UserIcon size={16} />}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                {user.role === 'OWNER' ? (
                  <span className="text-amber-700 font-bold flex items-center gap-0.5">
                    <ShieldCheck size={12} /> المالك (Owner)
                  </span>
                ) : (
                  <span>{user.role}</span>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="تسجيل الخروج"
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
}
