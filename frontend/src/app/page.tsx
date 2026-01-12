'use client';

import React from 'react';
import IntakeWizard from '@/components/IntakeWizard';
import Header from '@/components/Header';
import { Sparkles, Library, Layers, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen gradient-bg selection:bg-indigo-500/30 overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Background blobs for depth */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-12">
            <Sparkles size={14} className="animate-pulse" />
            <span>AI-Powered Personal Mastery</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] max-w-4xl">
            The <span className="gradient-text">Infinite</span> Way To Master Anything
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-20 leading-relaxed font-light">
            Stop scrolling generic tutorials. Generate a bespoke, interactive curriculum
            tailored to your level, schedule, and goals—instantly.
          </p>

          <IntakeWizard />

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-48 w-full text-left">
            <div className="glass p-10 rounded-3xl border-white/5 group hover:bg-white/10 transition-all duration-500">
              <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 transition-transform">
                <Library size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Instant Curricula</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                From quantum biology to 18th-century philosophy, get a structured path in seconds.
              </p>
            </div>

            <div className="glass p-10 rounded-3xl border-white/5 group hover:bg-white/10 transition-all duration-500">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform">
                <Layers size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Tiered Learning</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Start with high-level summaries and dive into deep, technical details as you progress.
              </p>
            </div>

            <div className="glass p-10 rounded-3xl border-white/5 group hover:bg-white/10 transition-all duration-500">
              <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Visualizations</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Concepts come to life with dynamic Mermaid.js diagrams and visual analogies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5 text-center text-muted-foreground text-sm glass-dark">
        <div className="flex justify-center gap-8 mb-8">
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">Discord</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
        </div>
        <p>© 2026 The Infinite Tutor. Built for the curious.</p>
      </footer>
    </main>
  );
}
