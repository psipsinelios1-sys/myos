import React, { useState } from 'react';
import { GameState } from '../types';
import { Shield, Zap, DollarSign, TrendingUp, Cpu, Server, Activity, Briefcase, Unlock, Users, Globe, Network, Send } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface AdminMenuProps {
  state: GameState;
  updateState: (newState: Partial<GameState>) => void;
}

export default function AdminMenu({ state, updateState }: AdminMenuProps) {
  const [giveAmount, setGiveAmount] = useState(100000000);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  
  const addCash = (amount: number) => {
    updateState({ cash: (state.cash || 0) + amount });
  };
  
  const addResearchPoints = (amount: number) => {
    updateState({ researchPoints: (state.researchPoints || 0) + amount });
  };

  const addHype = (amount: number) => {
    updateState({ hypeLevel: Math.min(100, (state.hypeLevel || 0) + amount) });
  };

  const setPublicSentiment = (amount: number) => {
    updateState({ globalPublicSentiment: amount });
  };

  const handleAskAdvisor = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    setAiResponse("");
    
    try {
      // Include some context about the current state
      const context = `Context: I am the CEO of ${state.companyName || 'an AI company'}. I have $${state.cash}, ${state.researchPoints} R&D points, ${state.globalPublicSentiment}% public sentiment.`;
      
      const response = await apiFetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `${context}\n\nMy Question: ${aiPrompt}`, model: selectedModel }),
      });
      
      const data = await response.json();
      if (data.error) {
        setAiResponse("Error: " + data.error);
      } else {
        setAiResponse(data.response || "No response received.");
      }
    } catch (err: any) {
      setAiResponse("Failed to reach AI Advisor.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-rose-900/30 pb-2">
        <Shield className="h-6 w-6 text-rose-500" />
        <div>
          <h2 className="text-xl font-bold font-sans text-rose-400 tracking-tight">Admin Override Console</h2>
          <p className="text-xs text-rose-300/60 font-mono">WARNING: Manipulating underlying simulation parameters directly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Wealth Management */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-emerald-400 font-mono text-sm">Capital Injection</h3>
          </div>
          <div className="space-y-2">
            <button onClick={() => addCash(1000000)} className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors">+ $1,000,000</button>
            <button onClick={() => addCash(10000000)} className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors">+ $10,000,000</button>
            <button onClick={() => addCash(100000000)} className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors">+ $100,000,000</button>
            <button onClick={() => addCash(1000000000)} className="w-full text-left px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 rounded-lg text-xs font-mono text-emerald-400 font-bold transition-colors">+ $1,000,000,000</button>
            <button onClick={() => addCash(-10000000)} className="w-full text-left px-3 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 rounded-lg text-xs font-mono text-rose-400 transition-colors">- $10,000,000 (Burn)</button>
          </div>
        </div>

        {/* Research / Tech */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <h3 className="font-bold text-cyan-400 font-mono text-sm">R&D Manipulation</h3>
          </div>
          <div className="space-y-2">
            <button onClick={() => addResearchPoints(50)} className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors">+ 50 R&D Points</button>
            <button onClick={() => addResearchPoints(500)} className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors">+ 500 R&D Points</button>
            <button onClick={() => addResearchPoints(5000)} className="w-full text-left px-3 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 rounded-lg text-xs font-mono text-cyan-400 font-bold transition-colors">+ 5,000 R&D Points</button>
            <button onClick={() => updateState({ acceleratorPurchases: 0 })} className="w-full text-left px-3 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-800 rounded-lg text-xs font-mono text-amber-400 transition-colors">Reset R&D Cost Inflation</button>
          </div>
        </div>

        {/* Reputation / Market */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <h3 className="font-bold text-purple-400 font-mono text-sm">Market Dynamics</h3>
          </div>
          <div className="space-y-2">
            <button onClick={() => addHype(10)} className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors">+ 10% Hype Level</button>
            <button onClick={() => addHype(50)} className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors">+ 50% Hype Level</button>
            <button onClick={() => setPublicSentiment(100)} className="w-full text-left px-3 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-800 rounded-lg text-xs font-mono text-purple-400 font-bold transition-colors">Set Sentiment to 100%</button>
            <button onClick={() => setPublicSentiment(0)} className="w-full text-left px-3 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 rounded-lg text-xs font-mono text-rose-400 font-bold transition-colors">Set Sentiment to 0%</button>
          </div>
        </div>
        
        {/* Company Settings */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Briefcase className="h-4 w-4 text-blue-400" />
            <h3 className="font-bold text-blue-400 font-mono text-sm">Corporate Setup</h3>
          </div>
          <div className="space-y-2">
            <button onClick={() => updateState({ boardApproval: 100 })} className="w-full text-left px-3 py-2 bg-blue-950 hover:bg-blue-900 border border-blue-800 rounded-lg text-xs font-mono text-blue-400 transition-colors">Max Board Approval (100%)</button>
            <button onClick={() => updateState({ equityPercent: 100 })} className="w-full text-left px-3 py-2 bg-blue-950 hover:bg-blue-900 border border-blue-800 rounded-lg text-xs font-mono text-blue-400 transition-colors">Restore 100% Equity</button>
            <button onClick={() => updateState({ powerGridStability: 100 })} className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors">Fix Power Grid (100%)</button>
          </div>
        </div>
      </div>

      {/* AI Advisor - High Thinking */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-indigo-400 font-mono text-sm">Strategic AI Advisor</h3>
          </div>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-[10px] font-mono px-2 py-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-900 focus:outline-none"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          </select>
        </div>
        <p className="text-xs text-slate-400 font-sans">
          Consult the ultimate strategic intellect for your most complex corporate queries. Powered by Gemini with advanced reasoning enabled for pro models.
        </p>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. 'How should I balance R&D scaling vs. public sentiment?'"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-sans focus:outline-none focus:border-indigo-500"
              onKeyDown={(e) => { if(e.key === 'Enter') handleAskAdvisor(); }}
            />
            <button 
              onClick={handleAskAdvisor}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 font-bold text-sm"
            >
              <Send className="h-4 w-4" />
              {isAiLoading ? 'THINKING...' : 'ASK'}
            </button>
          </div>
          
          {(aiResponse || isAiLoading) && (
            <div className="bg-slate-900 border border-indigo-900/50 rounded-lg p-4 relative overflow-hidden">
              {isAiLoading && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm animate-pulse">
                    <Network className="h-4 w-4 animate-spin" /> Deep Reasoning Active...
                  </div>
                </div>
              )}
              <div className="text-sm font-sans text-slate-300 whitespace-pre-wrap leading-relaxed markdown-body">
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
