import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Bot, 
  Sparkles, 
  Trash2, 
  Plus, 
  Heart, 
  Brain, 
  Code, 
  Cpu, 
  ShieldCheck, 
  UserPlus, 
  Zap, 
  DollarSign, 
  Info,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { GameState, Staff, AIAgentEmployee, StaffRole } from '../types';
import { playSound } from '../utils/audio';
import { generateRandomStaff } from '../data';

interface AIAgentsProps {
  state: GameState;
  updateState: (fields: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'MARKET' | 'COMPETITOR' | 'EVENT' | 'MILESTONE') => void;
}

export default function AIAgents({ state, updateState, addLogMessage }: AIAgentsProps) {
  const [recruitmentRole, setRecruitmentRole] = useState<StaffRole>('RESEARCH_SCIENTIST');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [agentRole, setAgentRole] = useState<StaffRole>('RESEARCH_SCIENTIST');
  const [recruitingInProgress, setRecruitingInProgress] = useState(false);

  const humanStaff = state.staff || [];
  const aiAgents = state.aiAgents || [];
  const trainedModels = state.trainedModels || [];

  // Calculate salary & compute expenses
  const totalSalaries = humanStaff.reduce((sum, s) => sum + s.salary, 0);
  const totalAgentCompute = aiAgents.reduce((sum, a) => sum + a.computeCostMonthly, 0);

  // Hire Human Staff
  const recruitStaff = () => {
    let cost = 12000;
    if (recruitmentRole === 'RESEARCH_SCIENTIST') cost = 25000;
    if (recruitmentRole === 'DATA_ENGINEER') cost = 18000;
    if (recruitmentRole === 'PR_LEGAL_SPECIALIST') cost = 15000;

    if (state.cash < cost) {
      playSound('alert');
      addLogMessage(`❌ RECRUITMENT FAILED: Insufficient liquid cash ($${cost.toLocaleString()} required).`, 'SYSTEM');
      return;
    }

    setRecruitingInProgress(true);
    playSound('click');

    setTimeout(() => {
      const newEmployee = generateRandomStaff(recruitmentRole, 30);
      const updatedStaff = [...humanStaff, newEmployee];
      
      updateState({
        cash: state.cash - cost,
        staff: updatedStaff
      });

      addLogMessage(`🎉 NEW TALENT ACQUIRED: Hired "${newEmployee.name}" as ${newEmployee.role.replace(/_/g, ' ')} with perk "${newEmployee.perk?.name || 'Standard'}".`, 'SYSTEM');
      playSound('success');
      setRecruitingInProgress(false);
    }, 600);
  };

  // Fire Human Staff
  const fireStaff = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to terminate ${name}?`)) return;
    const updated = humanStaff.filter((s) => s.id !== id);
    updateState({ staff: updated });
    addLogMessage(`💼 STAFF DEPARTURE: Terminated contract for "${name}".`, 'SYSTEM');
    playSound('click');
  };

  // Pay Morale Bonus
  const payBonus = (id: string, salary: number) => {
    const cost = Math.round(salary * 0.15);
    if (state.cash < cost) {
      playSound('alert');
      return;
    }
    const updated = humanStaff.map((s) => {
      if (s.id === id) {
        return { ...s, morale: Math.min(100, s.morale + 25) };
      }
      return s;
    });
    updateState({
      cash: state.cash - cost,
      staff: updated
    });
    playSound('success');
  };

  // Harness Model as Autonomous AI Agent
  const deployAIAgent = () => {
    if (!selectedModelId) return;
    const targetModel = trainedModels.find(m => m.id === selectedModelId);
    if (!targetModel) return;

    // Check if model is already deployed as an AI agent
    if (aiAgents.some(a => a.modelId === selectedModelId)) {
      playSound('alert');
      addLogMessage(`⚠️ AGENT ERROR: Model "${targetModel.name}" is already actively running as an AI Agent co-worker.`, 'SYSTEM');
      return;
    }

    playSound('click');

    // Calculate agent metrics based on its benchmarks
    // Average benchmark score maps to skill contribution
    const scores = Object.values(targetModel.benchmarks);
    const avgScore = scores.reduce((s, val) => s + val, 0) / scores.length;
    
    // AI Agents cost server power/FLOPs (compute equivalent to ~$1500 to $6500 monthly depending on size)
    const computeCost = Math.round(1500 + (targetModel.parametersCountB * 8) + (avgScore * 20));

    const newAgent: AIAgentEmployee = {
      id: `ai_agent_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: `${targetModel.name} [AGI Agent]`,
      assignedRole: agentRole,
      modelId: targetModel.id,
      computeCostMonthly: computeCost,
      skillMultiplier: parseFloat((0.5 + (avgScore / 100) * 1.5).toFixed(2)), // e.g. 0.5 to 2.0x
      morale: 100,
      efficiency: 100
    };

    updateState({
      aiAgents: [...aiAgents, newAgent]
    });

    addLogMessage(`🤖 AUTONOMOUS AGENT ACTIVE: Model "${targetModel.name}" deployed to department "${agentRole.replace(/_/g, ' ')}". Server operating cost: $${computeCost.toLocaleString()}/mo.`, 'SYSTEM');
    playSound('success');
  };

  // Terminate/Shutdown AI Agent
  const terminateAIAgent = (id: string, name: string) => {
    const updated = aiAgents.filter(a => a.id !== id);
    updateState({ aiAgents: updated });
    addLogMessage(`🔌 AGENT DECOMMISSIONED: Suspended runtime instances for "${name}". Compute cluster resources reclaimed.`, 'SYSTEM');
    playSound('click');
  };

  const getRoleIcon = (role: StaffRole) => {
    switch (role) {
      case 'RESEARCH_SCIENTIST': return <Brain className="h-4 w-4 text-cyan-400" />;
      case 'DATA_ENGINEER': return <Cpu className="h-4 w-4 text-amber-400" />;
      case 'FRONTEND_APP_DEV': return <Code className="h-4 w-4 text-purple-400" />;
      case 'PR_LEGAL_SPECIALIST': return <Users className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getPerkColor = (perkType: string) => {
    switch (perkType) {
      case 'GPU_WHISPERER': return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'SYNTHESIZER': return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40';
      case 'SAFETY_ZEALOT': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      case 'HYPE_MONSTER': return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      case 'ALGORITHMIC_GENIUS': return 'text-purple-400 bg-purple-950/40 border-purple-800/40';
      case 'BURNOUT_PRONE': return 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40';
      default: return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div id="ai_agents_talents_tab" className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Human Staff */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-purple-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          <div className="relative z-10">
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Human Staff Force</span>
            <h4 className="text-xl font-bold font-mono text-slate-150 mt-1">{humanStaff.length} Employees</h4>
            <p className="text-xs text-slate-400 mt-1 font-mono">Payroll: <span className="text-amber-400 font-bold">${totalSalaries.toLocaleString()}/mo</span></p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 relative z-10 shrink-0">
            <Users className="h-5 w-5 text-purple-400" />
          </div>
        </div>

        {/* Autonomous AI Workers */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-cyan-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          <div className="relative z-10">
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Autonomous AI Workers</span>
            <h4 className="text-xl font-bold font-mono text-cyan-400 mt-1">{aiAgents.length} Active Agents</h4>
            <p className="text-xs text-slate-400 mt-1 font-mono">Compute cost: <span className="text-indigo-400 font-bold">${totalAgentCompute.toLocaleString()}/mo</span></p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 relative z-10 shrink-0">
            <Bot className="h-5 w-5 text-cyan-400" />
          </div>
        </div>

        {/* Virtual Productivity Boost */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-emerald-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          <div className="relative z-10">
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Virtual Productivity Boost</span>
            <h4 className="text-xl font-bold font-mono text-emerald-400 mt-1">
              +{aiAgents.reduce((acc, a) => acc + Math.round(a.skillMultiplier * 100), 0)}%
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">Calculated from deployed model metrics</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 relative z-10 shrink-0">
            <Zap className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Human Personnel & Perks */}
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-slate-150 flex items-center gap-2 text-xs uppercase font-mono tracking-wider">
              <Users className="h-4.5 w-4.5 text-purple-400" />
              Human Engineering & R&D Team
            </h3>
            <span className="text-[10px] bg-slate-950 text-slate-450 px-2.5 py-0.5 rounded-lg border border-slate-850 font-mono font-bold uppercase tracking-wider">
              Perk Multiplier Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {humanStaff.map((employee) => (
              <div key={employee.id} className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 flex flex-col justify-between space-y-3.5 hover:border-slate-800 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-350 text-xs font-mono relative shrink-0">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                      <div className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-slate-950 ${employee.morale > 75 ? 'bg-emerald-500' : employee.morale > 45 ? 'bg-amber-400' : 'bg-rose-500'}`} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-200 text-xs">{employee.name}</h5>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        {getRoleIcon(employee.role)}
                        {employee.role.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => fireStaff(employee.id, employee.name)}
                    className="text-slate-550 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900/60 cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Perk Box */}
                {employee.perk && employee.perk.type !== 'NONE' ? (
                  <div className={`text-[10px] border p-2.5 rounded-xl flex items-start gap-2 ${getPerkColor(employee.perk.type)}`}>
                    <Sparkles className="h-3 w-3 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block uppercase tracking-wider text-[9px]">{employee.perk.name}</span>
                      <p className="opacity-80 mt-0.5 leading-relaxed font-sans">{employee.perk.description}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] bg-slate-950/40 border border-slate-900 p-2.5 rounded-xl text-slate-400 flex items-start gap-2 font-mono">
                    <Info className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-slate-400 uppercase text-[9px] tracking-wider">Standard Operator</span>
                      <p className="opacity-70 mt-0.5 font-sans leading-relaxed text-slate-500">Works at normal, steady corporate capabilities.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-900 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Skill Rating:</span>
                    <span className="font-bold text-cyan-400">{employee.skill}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Salary:</span>
                    <span className="font-bold text-amber-500">${employee.salary.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Morale:</span>
                    <span className="font-bold text-slate-350">{employee.morale}%</span>
                  </div>
                </div>

                {employee.morale < 65 && (
                  <button
                    onClick={() => payBonus(employee.id, employee.salary)}
                    className="w-full text-center text-[10px] bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 py-1.5 rounded-xl hover:bg-emerald-900/60 transition-all font-mono font-bold uppercase tracking-wider"
                  >
                    Pay 15% Morale Bonus (+${Math.round(employee.salary * 0.15).toLocaleString()})
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Hiring Panel */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4.5 space-y-3.5 mt-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <UserPlus className="h-4.5 w-4.5 text-purple-400 animate-pulse" />
              Recruit New Talent
            </h4>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <select
                value={recruitmentRole}
                onChange={(e) => setRecruitmentRole(e.target.value as any)}
                className="flex-1 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 px-3.5 py-2 outline-none focus:border-cyan-500 cursor-pointer transition-colors"
              >
                <option value="RESEARCH_SCIENTIST">Research Scientist (Compute Cost Focus) - $25,000</option>
                <option value="DATA_ENGINEER">Data Engineer (Training Speed Focus) - $18,000</option>
                <option value="FRONTEND_APP_DEV">App Developer (App Quality Focus) - $12,000</option>
                <option value="PR_LEGAL_SPECIALIST">PR & Legal Speciality (Hype & Safety Focus) - $15,000</option>
              </select>
              <button
                onClick={recruitStaff}
                disabled={recruitingInProgress}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-100 font-mono font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all shrink-0 cursor-pointer uppercase tracking-wider"
              >
                {recruitingInProgress ? 'Interviewing...' : 'Publish Job Posting'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Autonomous AI Agent Co-workers */}
        <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-slate-150 flex items-center gap-2 text-xs uppercase font-mono tracking-wider">
              <Bot className="h-4.5 w-4.5 text-cyan-400" />
              Model Co-workers (AI Agents)
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Employ your own trained models as virtual agents. They work 24/7 with zero morale penalty, boosting output.
            </p>
          </div>

          {/* AI Harness Controls */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-3.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 block font-bold">Deploy Model as Agent</span>
            
            {trainedModels.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 italic text-center font-mono">
                You must fully train and complete at least one model to hire an AI Agent.
              </p>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 gap-1.5">
                  <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Select Trained Model:</label>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 px-3.5 py-2.5 outline-none focus:border-cyan-500 cursor-pointer transition-colors"
                  >
                    <option value="">-- Choose Completed Model --</option>
                    {trainedModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.parametersCountB}B params)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Department:</label>
                  <select
                    value={agentRole}
                    onChange={(e) => setAgentRole(e.target.value as any)}
                    className="bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 px-3.5 py-2.5 outline-none focus:border-cyan-500 cursor-pointer transition-colors"
                  >
                    <option value="RESEARCH_SCIENTIST">R&D Lab (Generates Research Points)</option>
                    <option value="DATA_ENGINEER">Pre-training (Boosts Token FLOP rate)</option>
                    <option value="FRONTEND_APP_DEV">Product Factory (Boosts newly created App Quality)</option>
                    <option value="PR_LEGAL_SPECIALIST">Marketing & Legal (Triggers Auto Hype & Sentiment)</option>
                  </select>
                </div>

                <button
                  onClick={deployAIAgent}
                  disabled={!selectedModelId}
                  className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-slate-100 font-mono font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all uppercase tracking-wider"
                >
                  Spin Up AI Agent Instance
                </button>
              </div>
            )}
          </div>

          {/* Active AI Agent List */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              Active Agents Roster ({aiAgents.length})
            </h4>

            {aiAgents.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-850 rounded-2xl text-slate-500 text-xs italic font-mono leading-relaxed px-4">
                No active autonomous agent workloads running. Deployed models consume cluster compute but provide massive multiplicative output.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {aiAgents.map((agent) => (
                  <div key={agent.id} className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 flex flex-col justify-between space-y-3.5 hover:border-cyan-900/40 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2.5 items-center">
                        <div className="w-8.5 h-8.5 rounded-lg bg-cyan-950/40 border border-cyan-800 flex items-center justify-center font-bold text-cyan-400 shrink-0">
                          <Bot className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-200 text-xs">{agent.name}</h5>
                          <span className="text-[9px] font-mono border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 px-2 py-0.5 rounded-lg mt-1 inline-block uppercase font-bold tracking-wider">
                            ASSIGNED: {agent.assignedRole.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => terminateAIAgent(agent.id, agent.name)}
                        className="text-slate-550 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900/60 cursor-pointer transition-colors"
                        title="Shutdown Agent"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-[11px] bg-slate-950/60 p-3 rounded-xl border border-slate-900 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Agent Boost Efficiency:</span>
                        <span className="font-bold text-emerald-400">x{agent.skillMultiplier} boost</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Compute Overhead Cost:</span>
                        <span className="text-purple-400 font-bold">${agent.computeCostMonthly.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Work Morale Equivalent:</span>
                        <span className="text-cyan-400 font-bold">100% (Constant)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
