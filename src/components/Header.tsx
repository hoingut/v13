import React from 'react';
import { User } from '../types';
import { ShieldCheck, User as UserIcon, Sparkles, Wallet } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenWithdraw: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenAuth, onOpenAdmin, onOpenWithdraw }) => {
  return (
    <header className="px-4 pt-3 pb-2 flex items-center justify-between text-amber-50">
      {/* Left / Profile */}
      {user ? (
        <div className="flex items-center gap-3 bg-[#2a1d18]/80 backdrop-blur-md p-2 pr-4 rounded-2xl border border-[#4a342a]/60 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-md relative overflow-hidden">
            <span className="text-lg">{user.name.charAt(0).toUpperCase()}</span>
            <div className="absolute inset-0 bg-white/20 pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-amber-200/70 font-medium">Hey</span>
              <span className="text-xs font-bold text-amber-100">@{user.name.toLowerCase().replace(/\s+/g, '')}</span>
              {user.role === 'admin' && (
                <span className="text-[10px] bg-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded-full font-semibold border border-orange-500/40">
                  ADMIN
                </span>
              )}
            </div>
            <div className="text-[11px] text-amber-400/80 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Gmail Verified</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2 rounded-2xl font-medium text-xs shadow-lg transition-all border border-amber-400/30 active:scale-95 cursor-pointer"
        >
          <UserIcon className="w-4 h-4" />
          <span>Login / Signup (Gmail)</span>
        </button>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {user && (
          <button
            onClick={onOpenWithdraw}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-md border border-emerald-400/50 hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>
        )}

        {user?.role === 'admin' && (
          <button
            onClick={onOpenAdmin}
            className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};

