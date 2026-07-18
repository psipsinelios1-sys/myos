import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Briefcase, Award, ArrowUpRight, DollarSign, Heart, Sparkles, Megaphone, Trash2, ShieldAlert, GraduationCap, Building2 } from 'lucide-react';
import { GameState, Staff, StaffRole } from '../types';
import { generateRandomStaff } from '../data';

interface ExecutiveDeskProps {
  state: GameState;
  updateState: (newState: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'EVENT' | 'MILESTONE' | 'MARKET') => void;
}

export default function ExecutiveDesk({ state, updateState, addLogMessage }: ExecutiveDeskProps) {
  const [candidates, setCandidates] = useState<Staff[]>([
    generateRandomStaff('RESEARCH_SCIENTIST', 45),
    generateRandomStaff('DATA_ENGINEER', 40),
    generateRandomStaff('FRONTEND_APP_DEV', 40),
    generateRandomStaff('PR_LEGAL_SPECIALIST', 30),
  ]);

  const [marketingBudget, setMarketingBudget] = useState(15000);

  // Hire Staff
  const hireStaff = (candidate: Staff) => {
    if (state.cash < candidate.recruitmentCost) {
      addLogMessage(`❌ Insufficient capital: Recruiting ${candidate.name} requires $${candidate.recruitmentCost.toLocaleString()}.`, 'SYSTEM');
      return;
    }

    const updatedStaff = [...state.staff, candidate];
    const updatedCash = state.cash - candidate.recruitmentCost;

    updateState({
      staff: updatedStaff,
      cash: updatedCash,
    });

    addLogMessage(`💼 Hired ${candidate.name} as a ${candidate.role.replace(/_/g, ' ')} (Skill: ${candidate.skill}/100) for a salary of $${candidate.salary.toLocaleString()}/mo.`, 'SYSTEM');

    // Remove candidate from marketplace, replace with a new one
    setCandidates(candidates.map(c => c.id === candidate.id ? generateRandomStaff(candidate.role, 30) : c));
  };

  // Skip Candidate / Refresh Candidate
  const refreshCandidate = (id: string, role: StaffRole) => {
    setCandidates(candidates.map(c => c.id === id ? generateRandomStaff(role, 35) : c));
  };

  // Fire Staff
  const fireStaff = (id: string, name: string) => {
    const updatedStaff = state.staff.filter((s) => s.id !== id);
    updateState({ staff: updatedStaff });
    addLogMessage(`⚠️ Fired employee: ${name} was released from their employment contract.`, 'SYSTEM');
  };

  // Run Marketing/Hype Campaign
  const triggerHypeCampaign = () => {
    if (state.cash < marketingBudget) {
      addLogMessage(`❌ Insufficient funds for a marketing campaign of $${marketingBudget.toLocaleString()}`, 'SYSTEM');
      return;
    }

    const hypeInc = Math.round(marketingBudget * 0.001 * (1 + state.founder.charisma * 0.015));
    const nextHype = Math.min(150, state.hypeLevel + hypeInc);
    const nextCash = state.cash - marketingBudget;

    updateState({
      cash: nextCash,
      hypeLevel: nextHype,
    });

    addLogMessage(`📣 MARKETING CAMPAIGN: Spend $${marketingBudget.toLocaleString()} on Tech Crunch features and targeted developer ads. Brand Hype increased (+${hypeInc})!`, 'SYSTEM');
  };

  // Give Morale Bonus
  const boostMorale = (id: string, cost: number) => {
    if (state.cash < cost) return;
    const updatedStaff = state.staff.map((s) => {
      if (s.id === id) {
        return { ...s, morale: Math.min(100, s.morale + 20) };
      }
      return s;
    });

    updateState({
      cash: state.cash - cost,
      staff: updatedStaff,
    });
  };

  const getRoleBadgeColor = (role: StaffRole) => {
    switch (role) {
      case 'RESEARCH_SCIENTIST': return 'bg-purple-950/60 border-purple-800 text-purple-300';
      case 'DATA_ENGINEER': return 'bg-amber-950/60 border-amber-800 text-amber-300';
      case 'FRONTEND_APP_DEV': return 'bg-cyan-950/60 border-cyan-800 text-cyan-300';
      case 'PR_LEGAL_SPECIALIST': return 'bg-blue-950/60 border-blue-800 text-blue-300';
    }
  };

  // Render expenses item
  const exp = state.monthlyExpenses;
  const totalExp = exp.infrastructureCost + exp.powerBill + exp.salaries + exp.rent + exp.legalOverhead;

  return (
    <div className="space-y-4">
      {/* Overview Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Cash Balance */}
        <motion.div 
          whileHover={{ scale: 1.025, y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4.5 shadow-xl shadow-emerald-950/5 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider group-hover:text-emerald-450 transition-colors">Capital Reserve</span>
            <span className="p-1 px-2 rounded-md font-mono text-[8px] bg-emerald-950/80 text-emerald-400 border border-emerald-900/30 group-hover:bg-emerald-900/40 transition-colors uppercase font-bold">CASH</span>
          </div>
          <div className="my-3 relative z-10">
            <h3 id="capital_reserve_display" className="text-2xl font-bold font-mono text-emerald-450 drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]">${state.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              Monthly Cashburn: <span className="text-red-400 font-mono">-${totalExp.toLocaleString()}</span>
            </p>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between pt-2 border-t border-slate-800/80 relative z-10 font-mono">
            <span>Monthly Revenue:</span>
            <span className="text-emerald-400 font-bold">${state.monthlyRevenue.toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Startup Valuation */}
        <motion.div 
          whileHover={{ scale: 1.025, y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4.5 shadow-xl shadow-cyan-950/5 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider group-hover:text-cyan-455 transition-colors">Equity Valuation</span>
            <span className="p-1 px-2 rounded-md font-mono text-[8px] bg-cyan-950/80 text-cyan-400 border border-cyan-900/30 group-hover:bg-cyan-900/40 transition-colors uppercase font-bold">{state.fundingStage.replace(/_/g, ' ')}</span>
          </div>
          <div className="my-3 relative z-10">
            <h3 id="valuation_display" className="text-2xl font-bold font-mono text-cyan-400 drop-shadow-[0_0_15px_rgba(0,209,255,0.15)]">${state.valuation.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Equity Ownership: <span className="text-cyan-300 font-semibold">{state.equityPercent}%</span>
            </p>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between pt-2 border-t border-slate-800/80 relative z-10 font-mono">
            <span>R&D Intellectual Points:</span>
            <span id="research_points_display" className="text-purple-400 font-bold">{state.researchPoints} pt</span>
          </div>
        </motion.div>

        {/* Public Sentiment & Brand Hype */}
        <motion.div 
          whileHover={{ scale: 1.025, y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4.5 shadow-xl shadow-purple-950/5 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider group-hover:text-purple-455 transition-colors">Brand Sentiment</span>
            <span className="p-1 px-2 rounded-md font-mono text-[8px] bg-purple-950/80 text-purple-400 border border-purple-900/30 group-hover:bg-purple-900/40 transition-colors uppercase font-bold">BRAND</span>
          </div>
          <div className="my-3 space-y-2.5 relative z-10">
            <div>
              <div className="flex justify-between text-[10px] mb-1 font-mono">
                <span className="text-slate-400">Public Sentiment:</span>
                <span className="text-slate-205 font-bold">{state.globalPublicSentiment}%</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                <div 
                  className={`h-full transition-all duration-500 ${state.globalPublicSentiment > 70 ? 'bg-emerald-500' : state.globalPublicSentiment > 40 ? 'bg-amber-405' : 'bg-rose-500'}`}
                  style={{ width: `${state.globalPublicSentiment}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1 font-mono">
                <span className="text-slate-400">Media Hype:</span>
                <span className="text-indigo-400 font-bold">{Math.round(state.hypeLevel)}x multiplier</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.min(100, Math.round(state.hypeLevel))}%` }} />
              </div>
            </div>
          </div>
          <div className="text-[9.5px] text-slate-500 pt-0.5 italic relative z-10 truncate">Hype boosts adoption and growth loops</div>
        </motion.div>

        {/* Board Approval */}
        <motion.div 
          whileHover={{ scale: 1.025, y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-rose-500/20 rounded-2xl p-4.5 shadow-xl shadow-rose-950/5 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider group-hover:text-rose-455 transition-colors">Board Approval</span>
            <span className="p-1 px-2 rounded-md font-mono text-[8px] bg-rose-950/80 text-rose-450 border border-rose-900/30 group-hover:bg-rose-900/40 transition-colors uppercase font-bold">VETO POWER</span>
          </div>
          <div className="my-3 relative z-10">
            <h3 className="text-2xl font-bold font-mono text-rose-455 drop-shadow-[0_0_15px_rgba(239,68,68,0.15)]">{state.boardApproval}%</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              {state.boardApproval > 75 
                ? '🟢 Highly supportive of CEO directives.' 
                : state.boardApproval > 45 
                  ? '🟡 Cautious. Expecting better growth.' 
                  : '🔴 Backlash! Venture Board is eyeing changes.'}
            </p>
          </div>
          <div className="text-[11px] text-slate-405 flex justify-between pt-2 border-t border-slate-800/80 relative z-10 font-mono">
            <span>Founder Class:</span>
            <span className="text-lime-400 font-bold uppercase text-[9px] tracking-wider">{state.founder.background.replace(/_/g, ' ')}</span>
          </div>
        </motion.div>
      </div>

      {/* Staff and Talent recruitment boards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Hired Staff Panel */}
        <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-cyan-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 relative z-10">
            <div className="flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
              <h3 className="font-bold text-slate-100 text-sm">Active Talent Roster ({state.staff.length})</h3>
            </div>
            <p className="text-xs text-slate-405">Personnel cost: <span className="text-amber-400 font-mono font-bold">${totalExp.toLocaleString()}/mo</span></p>
          </div>

          {state.staff.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm relative z-10">
              No staff members hired. Models require Research Scientists & Data Engineers to initialize training.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {state.staff.map((employee) => (
                <div key={employee.id} className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 hover:border-slate-800 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar design */}
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-350 text-sm font-mono relative">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                        <div className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-slate-950 ${employee.morale > 75 ? 'bg-emerald-500' : employee.morale > 45 ? 'bg-amber-400' : 'bg-rose-500'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">{employee.name}</h4>
                        <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 inline-block mt-0.5 uppercase tracking-wider ${getRoleBadgeColor(employee.role)}`}>
                          {employee.role.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    {/* Fire button */}
                    <button
                      type="button"
                      onClick={() => fireStaff(employee.id, employee.name)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                      title="Fire Employee"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Technical Skill:</span>
                      <span className="font-semibold text-cyan-400">{employee.skill}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Compensation:</span>
                      <span className="font-bold text-amber-500">${employee.salary.toLocaleString()} / mo</span>
                    </div>
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-slate-500 flex items-center gap-1 font-sans"><Heart className="h-3 w-3 text-red-500 fill-current" /> Morale:</span>
                      <span className="font-bold text-slate-300">{employee.morale}%</span>
                    </div>
                  </div>

                  {employee.morale < 60 && (
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-800/80">
                      <span className="text-[9px] text-rose-400 flex items-center gap-1 font-mono">
                        <ShieldAlert className="h-3 w-3" /> Demotivated!
                      </span>
                      <button
                        onClick={() => boostMorale(employee.id, Math.round(employee.salary * 0.15))}
                        className="text-[9px] bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-900/40 font-bold font-mono cursor-pointer transition-colors"
                      >
                        Bonus (+${Math.round(employee.salary * 0.15)})
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Talent Market recruitment */}
        <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-purple-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="border-b border-slate-800/80 pb-3 relative z-10">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <GraduationCap className="h-4.5 w-4.5 text-purple-400" />
              Talent Marketplace
            </h3>
            <p className="text-xs text-slate-400 mt-1">Recruit top specialized engineers.</p>
          </div>

          <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent relative z-10">
            {candidates.map((employee) => (
              <div key={employee.id} className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex flex-col justify-between gap-3 shadow hover:border-slate-800 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{employee.name}</h4>
                    <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 inline-block mt-1.5 uppercase tracking-wider ${getRoleBadgeColor(employee.role)}`}>
                      {employee.role.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="bg-cyan-950/40 text-cyan-400 border border-cyan-900/40 text-[10px] font-mono px-2 py-0.5 rounded">
                    Skill: {employee.skill}/100
                  </span>
                </div>

                <div className="space-y-1 text-xs font-mono border-y border-slate-800/80 py-2.5 my-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bounty Fee:</span>
                    <span className="font-bold text-emerald-450">${employee.recruitmentCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Salary Demand:</span>
                    <span className="font-bold text-amber-500">${employee.salary.toLocaleString()}/mo</span>
                  </div>
                </div>

                <div className="flex justify-between gap-2 pt-0.5">
                  <button
                    onClick={() => refreshCandidate(employee.id, employee.role)}
                    className="w-1/3 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 rounded-lg py-2 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => hireStaff(employee)}
                    className="w-2/3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-100 font-bold rounded-lg py-2 text-xs cursor-pointer shadow-lg shadow-purple-950/15 relative active:translate-y-px transition-all cta-glow"
                  >
                    Hire Candidate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corporate Culture & Locations bonuses + Brand Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Brand Hype Panel */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-5 space-y-4 shadow-xl">
          <h4 className="font-bold text-slate-100 flex items-center gap-2 text-sm border-b border-slate-800/80 pb-3">
            <Megaphone className="h-4.5 w-4.5 text-indigo-400" />
            Launch Marketing Campaign
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hype fuels user acquisition for your closed/open source platforms. Invest capital in key developer conferences and social campaigns.
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {[10000, 25000, 75000].map((budget) => (
              <button
                key={budget}
                onClick={() => setMarketingBudget(budget)}
                className={`py-2 px-3 border rounded-xl text-xs font-mono font-bold text-center transition-all cursor-pointer ${
                  marketingBudget === budget
                    ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200'
                    : 'border-slate-850 bg-slate-950/40 text-slate-400 hover:border-slate-800'
                }`}
              >
                ${budget.toLocaleString()}
              </button>
            ))}
          </div>

          <button
            onClick={triggerHypeCampaign}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-slate-100 font-bold rounded-xl py-2.5 text-xs shadow-lg shadow-indigo-600/10 cursor-pointer transition-all active:translate-y-px"
          >
            Fund Publicity Drive (-${marketingBudget.toLocaleString()})
          </button>
        </div>

        {/* Corporate Office & Bonuses */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-5 space-y-4 shadow-xl">
          <h4 className="font-bold text-slate-100 flex items-center gap-2 text-sm border-b border-slate-800/80 pb-3">
            <Building2 className="h-4.5 w-4.5 text-emerald-400" />
            Headquarters & Philosophy
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 flex flex-col justify-between">
              <div>
                <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block mb-1">Company Culture</span>
                <span className="font-bold text-slate-205 leading-normal block">{state.culture.name}</span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed mt-2 font-mono">{state.culture.description}</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 flex flex-col justify-between">
              <div>
                <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block mb-1">Operating Location</span>
                <span className="font-bold text-slate-205 leading-normal block">{state.hqLocation.name}</span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed mt-2 font-mono">{state.hqLocation.bonusText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
