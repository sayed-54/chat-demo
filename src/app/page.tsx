"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#020617] font-sans selection:bg-cyan-500/30">
      
      {/* Header Section */}
      <div className="text-center mb-16 animate-in">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent italic tracking-tighter mb-4">
          QUICKY.
        </h1>
        <p className="text-slate-500 text-lg md:text-xl font-bold uppercase tracking-[10px] opacity-70">
          Premium Chat Simulation
        </p>
      </div>

      {/* Main Feature Card */}
      <div className="max-w-xl w-full">
        
        {/* --- PRO VERSION --- */}
        <Link 
          href="/quickchat" 
          className="group relative block overflow-hidden rounded-[44px] bg-slate-900/40 border border-slate-800 p-10 md:p-14 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10 active:scale-95 text-center"
        >
          <div className="absolute top-0 right-0 p-8">
            <div className="bg-cyan-500 rounded-full px-4 py-1 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-cyan-500/20">
              Pro Version
            </div>
          </div>
          
          <div className="w-24 h-24 bg-cyan-500/10 rounded-[36px] flex items-center justify-center mx-auto mb-10 group-hover:rotate-12 transition-transform duration-500">
            <MessageCircle className="text-cyan-400" size={48} />
          </div>
          
          <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Launch Experience</h2>
          <p className="max-w-sm mx-auto text-slate-400 text-lg leading-relaxed mb-10">
            Experience the peak of modern UI/UX with smart simulations, 
            premium aesthetics, and world-class interactions.
          </p>
          
          <div className="flex items-center justify-center gap-3 text-cyan-400 text-sm font-black uppercase tracking-[6px]">
            Enter QuickChat <ArrowRight size={20} />
          </div>
          
          {/* Subtle Glows */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-20 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[6px] text-slate-500">
          Created for Sayed • Advanced Agentic Coding
        </p>
      </div>

      <style jsx global>{`
        @keyframes slideInUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-in { animation: slideInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
