import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Menu, 
  Clock, 
  Users, 
  Bell, 
  Activity, 
  X, 
  LogOut 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: ReactNode;
  activeTab: 'family' | 'updates' | 'status';
  setActiveTab: (tab: 'family' | 'updates' | 'status') => void;
  streakCount: number;
  hasUnreadNotifications: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onLogout: () => void;
  onSyncContacts: () => void;
}

export function Layout({ 
  children, 
  activeTab, 
  setActiveTab, 
  streakCount, 
  hasUnreadNotifications,
  isMenuOpen,
  setIsMenuOpen,
  onLogout,
  onSyncContacts
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28 selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">iamalive</span>
        </div>
        
        <div className="flex items-center gap-3">
          {streakCount > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
              <Clock className="w-4 h-4" />
              {streakCount}d
            </div>
          )}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Open settings menu"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        {children}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-8 left-6 right-6 bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-3 flex justify-around items-center z-40 shadow-2xl shadow-slate-300 border border-slate-800">
        <button 
          onClick={() => setActiveTab('family')}
          className={cn(
            "p-4 rounded-[2rem] transition-all flex flex-col items-center gap-1.5",
            activeTab === 'family' ? "bg-white text-slate-900 scale-105 shadow-lg" : "text-slate-500 hover:text-slate-300"
          )}
          aria-label="View family members"
        >
          <Users className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Family</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('updates')}
          className={cn(
            "p-4 rounded-[2rem] transition-all flex flex-col items-center gap-1.5 relative",
            activeTab === 'updates' ? "bg-white text-slate-900 scale-105 shadow-lg" : "text-slate-500 hover:text-slate-300"
          )}
          aria-label="View recent updates"
        >
          <Bell className="w-6 h-6" />
          {hasUnreadNotifications && (
            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-900" />
          )}
          <span className="text-[9px] font-black uppercase tracking-widest">Updates</span>
        </button>

        <button 
          onClick={() => setActiveTab('status')}
          className={cn(
            "p-4 rounded-[2rem] transition-all flex flex-col items-center gap-1.5",
            activeTab === 'status' ? "bg-white text-slate-900 scale-105 shadow-lg" : "text-slate-500 hover:text-slate-300"
          )}
          aria-label="View your status and streak"
        >
          <Activity className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Status</span>
        </button>
      </nav>

      {/* Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-black text-xl tracking-tight">Settings</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-4">
                <button 
                  onClick={() => {
                    onSyncContacts();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-600 font-black text-sm uppercase tracking-tight"
                >
                  <Users className="w-5 h-5" />
                  Sync Family Contacts
                </button>
                <div className="h-px bg-slate-100 my-4" />
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-4 p-4 hover:bg-rose-50 rounded-2xl transition-all text-rose-600 font-black text-sm uppercase tracking-tight"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center uppercase tracking-[0.3em] font-black">
                iamalive v2.1
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
