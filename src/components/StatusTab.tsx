import { motion } from 'motion/react';
import { ShieldCheck, Flame, Trophy } from 'lucide-react';
import { UserProfile } from '../types';

interface StatusTabProps {
  key?: string;
  profile: UserProfile | null;
}

export function StatusTab({ profile }: StatusTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm text-center">
        <div className="relative inline-block mb-6">
          <img 
            src={profile?.photoURL || ''} 
            alt="" 
            className="w-28 h-28 rounded-[2rem] mx-auto border-4 border-slate-50 shadow-xl object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-1">{profile?.displayName}</h2>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-8">{profile?.email}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-200">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-3xl font-black">{profile?.streakCount || 0}</p>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Day Streak</p>
          </div>
          <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-200">
            <Trophy className="w-6 h-6 text-blue-200 mx-auto mb-2" />
            <p className="text-3xl font-black">{profile?.badges?.length || 0}</p>
            <p className="text-[10px] uppercase font-black text-blue-200 tracking-[0.2em]">Badges</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black px-2 text-slate-900">Vitality Badges</h3>
        {profile?.badges && profile.badges.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {profile.badges.map((badge) => (
              <div key={badge} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shadow-inner">
                  <Trophy className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-xs font-black text-slate-700 uppercase tracking-tight leading-tight">{badge}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold text-sm">Maintain your daily check-ins to earn vitality badges.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
