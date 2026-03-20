import { motion } from 'motion/react';
import { Users, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile, HealthStatus } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FamilyTabProps {
  key?: string;
  users: UserProfile[];
  favorites: string[];
  onToggleFavorite: (uid: string) => void;
  onSendCheckIn: (receiver: UserProfile, status: HealthStatus) => void;
  onSyncContacts: () => void;
}

export function FamilyTab({ 
  users, 
  favorites, 
  onToggleFavorite, 
  onSendCheckIn,
  onSyncContacts
}: FamilyTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black text-slate-900">Family & Caregivers</h2>
        <div className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">
          {users.length} Registered
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
          <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No family members found. Sync your contacts to connect.</p>
          <button 
            onClick={onSyncContacts}
            className="mt-6 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            Sync Contacts Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map((fUser) => (
            <motion.div
              key={fUser.uid}
              layout
              className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all relative group"
            >
              <button 
                onClick={() => onToggleFavorite(fUser.uid)}
                className="absolute top-5 right-5 z-10 p-1"
                aria-label={favorites.includes(fUser.uid) ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={cn(
                  "w-5 h-5 transition-all",
                  favorites.includes(fUser.uid) ? "text-amber-400 fill-amber-400 scale-110" : "text-slate-200"
                )} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={fUser.photoURL || `https://ui-avatars.com/api/?name=${fUser.displayName}&background=random`} 
                  alt="" 
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 truncate">{fUser.displayName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Caregiver</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onSendCheckIn(fUser, 'healthy')}
                  className="py-3 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
                  aria-label={`Send healthy check-in to ${fUser.displayName}`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Healthy</span>
                </button>
                <button
                  onClick={() => onSendCheckIn(fUser, 'needs_attention')}
                  className="py-3 bg-rose-50 text-rose-700 rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
                  aria-label={`Send help request to ${fUser.displayName}`}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Need Help</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
