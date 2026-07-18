import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Crosshair, Cpu, Eye, Lock, Zap } from 'lucide-react';
import { GameState, WarfareAction, WarfareDefenseState } from '../types';

interface WarRoomProps {
  state: GameState;
  updateState: (newState: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'EVENT' | 'MILESTONE' | 'MARKET') => void;
}

export default function WarRoom({ state, updateState, addLogMessage }: WarRoomProps) {
  const ws = {
    cybersecurityLevel: state.warfareState?.cybersecurityLevel ?? 1,
    prRetainerActive: state.warfareState?.prRetainerActive ?? false,
    prRetainerDaysLeft: state.warfareState?.prRetainerDaysLeft ?? 0,
    offenseBudget: state.warfareState?.offenseBudget ?? 0,
    defenseState: {
      firewallIntegrity: state.warfareState?.defenseState?.firewallIntegrity ?? 100,
      isHacked: state.warfareState?.defenseState?.isHacked ?? false,
    },
    activeOperations: state.warfareState?.activeOperations || [],
  };

  const [targetCompetitorId, setTargetCompetitorId] = useState<string>('');

  const competitors = state.competitors || [];

  const handleLaunchAttack = (action: WarfareAction) => {
    if (state.cash < action.cost) {
      addLogMessage(`❌ Insufficient capital for ${action.name}. Requires $${action.cost.toLocaleString()}`, 'SYSTEM');
      return;
    }
    if (!targetCompetitorId) {
      addLogMessage('❌ You must select a target competitor first.', 'SYSTEM');
      return;
    }

    const target = competitors.find(c => c.id === targetCompetitorId);
    if (!target) return;

    updateState({
      cash: state.cash - action.cost,
      warfareState: {
        ...ws,
        activeOperations: [
          ...ws.activeOperations,
          {
            id: `op_${Math.random().toString(36).substring(2, 9)}`,
            actionId: action.id,
            targetCompetitorId: target.id,
            daysRemaining: 3, // Operations take 3 days
            status: 'IN_PROGRESS'
          }
        ]
      }
    });

    addLogMessage(`⚔️ BLACK OPS LAUNCHED: ${action.name} initiated against ${target.name}. Awaiting operational results in 3 days.`, 'EVENT');
  };

  const handleRepairFirewall = () => {
    const cost = 250000;
    if (state.cash < cost) return;
    updateState({
      cash: state.cash - cost,
      warfareState: {
        ...ws,
        defenseState: {
          ...ws.defenseState,
          firewallIntegrity: 100,
          isHacked: false
        }
      }
    });
    addLogMessage('🛡️ FIREWALL RESTORED: Cyber-security teams patched all vulnerabilities.', 'SYSTEM');
  };

  const actions: WarfareAction[] = [
    {
      id: 'DDOS_CLUSTER',
      name: 'DDoS Cluster Strike',
      description: 'Flood their training clusters with junk traffic, halting their model progress.',
      cost: 500000,
      baseSuccessRate: 60,
      type: 'OFFENSE'
    },
    {
      id: 'POISON_DATASET',
      name: 'Data Poisoning',
      description: 'Inject toxic gradients into their synthetic data pipeline. Lowers their next model quality.',
      cost: 1500000,
      baseSuccessRate: 40,
      type: 'OFFENSE'
    },
    {
      id: 'POACH_TALENT',
      name: 'Executive Poaching',
      description: 'Bribe their lead engineers to defect, stealing their active research points.',
      cost: 2000000,
      baseSuccessRate: 30,
      type: 'OFFENSE'
    }
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden h-[85vh] overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="flex items-center gap-3 border-b border-red-900/30 pb-4 mb-6">
        <ShieldAlert className="h-6 w-6 text-red-500" />
        <h2 className="text-xl font-black text-red-500 tracking-wider">CORPORATE WAR ROOM</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Defense Panel */}
        <div className="space-y-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-500" />
              Cyber-Defense Grid
            </h3>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Firewall Integrity:</span>
                <span className={ws.defenseState.firewallIntegrity > 50 ? 'text-emerald-400' : 'text-red-500'}>
                  {ws.defenseState.firewallIntegrity}%
                </span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${ws.defenseState.firewallIntegrity > 50 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${ws.defenseState.firewallIntegrity}%` }}
                />
              </div>
            </div>

            {ws.defenseState.isHacked && (
              <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-lg text-xs text-red-400 mb-4 font-mono animate-pulse">
                ⚠️ WARNING: NETWORK BREACH DETECTED. IP STOLEN DAILY.
              </div>
            )}

            <button
              onClick={handleRepairFirewall}
              disabled={ws.defenseState.firewallIntegrity === 100}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold py-2 rounded-lg transition-colors border border-slate-700"
            >
              Deploy Security Patch ($250,000)
            </button>
          </div>

          {/* Active Operations */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              Active Black Ops
            </h3>
            
            {ws.activeOperations.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-600 text-xs font-mono">
                No active operations.
              </div>
            ) : (
              <div className="space-y-3">
                {ws.activeOperations.map(op => {
                  const target = competitors.find(c => c.id === op.targetCompetitorId);
                  const action = actions.find(a => a.id === op.actionId);
                  return (
                    <div key={op.id} className="bg-slate-900 border border-purple-900/30 p-3 rounded-lg text-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-purple-400">{action?.name}</span>
                        <span className="text-slate-500 font-mono">T-{op.daysRemaining} Days</span>
                      </div>
                      <div className="text-slate-400">Target: <span className="text-slate-200">{target?.name}</span></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Offense Panel */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-red-500" />
            Offensive Campaigns
          </h3>

          <div className="mb-6">
            <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-mono">Select Target Asset</label>
            <select
              value={targetCompetitorId}
              onChange={(e) => setTargetCompetitorId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="">-- Choose a Competitor --</option>
              {competitors.map(c => (
                <option key={c.id} value={c.id}>{c.name} (Share: {c.marketShare}%)</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {actions.map(action => (
              <div key={action.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:border-red-900/50 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-200">{action.name}</h4>
                  <span className="text-xs font-mono text-emerald-400">${action.cost.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">{action.description}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] text-slate-500 font-mono">Est. Success: {action.baseSuccessRate}%</span>
                  <button
                    onClick={() => handleLaunchAttack(action)}
                    className="bg-red-950/50 hover:bg-red-900 text-red-400 font-bold py-1.5 px-4 rounded border border-red-900/50 text-xs transition-colors"
                  >
                    Initiate Strike
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
