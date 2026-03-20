import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="mb-8 flex justify-center">
          <div className="bg-blue-600 p-6 rounded-3xl shadow-2xl shadow-blue-200">
            <ShieldCheck className="w-16 h-16 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-900">iamalive</h1>
        <p className="text-slate-500 mb-10 text-lg leading-relaxed">
          A vital connection for isolated patients. Reassure your family with daily health check-ins.
        </p>
        <button
          onClick={onLogin}
          className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          aria-label="Sign in with Google"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
          Sign in with Google
        </button>
        <p className="mt-8 text-xs text-slate-400 font-medium uppercase tracking-widest">
          Secure • Private • Reliable
        </p>
      </motion.div>
    </div>
  );
}
