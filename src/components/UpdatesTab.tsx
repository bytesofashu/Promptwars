import { motion } from 'motion/react';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { CheckIn } from '../types';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UpdatesTabProps {
  key?: string;
  notifications: CheckIn[];
}

export function UpdatesTab({ notifications }: UpdatesTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-black text-slate-900 mb-6 px-2">Recent Updates</h2>
      {notifications.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
          <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No check-ins received yet.</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div 
            key={n.id}
            className={cn(
              "bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm transition-all",
              !n.read && "border-blue-100 bg-blue-50/20"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                n.status === 'healthy' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              )}>
                {n.status === 'healthy' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <p className="font-black text-slate-900">
                  {n.senderName} is <span className={n.status === 'healthy' ? "text-emerald-600" : "text-rose-600"}>{n.status.replace('_', ' ')}</span>
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  {format(n.timestamp.toDate(), 'MMM d, h:mm a')}
                </p>
                {n.location && (
                  <a 
                    href={`https://www.google.com/maps?q=${n.location.latitude},${n.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-500 hover:underline font-bold uppercase tracking-widest mt-1 block"
                  >
                    View Location
                  </a>
                )}
              </div>
            </div>
            {!n.read && (
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-lg shadow-blue-200" />
            )}
          </div>
        ))
      )}
    </motion.div>
  );
}
