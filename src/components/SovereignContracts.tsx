import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  Scale, 
  Handshake, 
  Building2, 
  FileText, 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck, 
  Info, 
  DollarSign, 
  Award,
  Clock,
  ThumbsUp,
  Sliders,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { GameState, SovereignContract, RegulatoryMandate, TrainedModel } from '../types';
import { playSound } from '../utils/audio';

interface SovereignContractsProps {
  state: GameState;
  updateState: (fields: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'MARKET' | 'COMPETITOR' | 'EVENT' | 'MILESTONE') => void;
}

export default function SovereignContracts({ state, updateState, addLogMessage }: SovereignContractsProps) {
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'CONTRACTS' | 'REGULATORY'>('CONTRACTS');

  const contracts = state.contracts || [];
  const regulatoryMandates = state.regulatoryMandates || [];
  const trainedModels = state.trainedModels || [];
  const lobbyingLevel = state.lobbyingLevel || 0;

  // Active contracts and commercial deployments
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
  const availableContracts = contracts.filter(c => c.status === 'AVAILABLE');

  // Calculate total monthly contract revenues
  const totalContractRevenueMonthly = activeContracts.reduce((sum, c) => sum + c.monthlyPayout, 0);

  // Calculate total monthly regulatory fines
  // Deployed commercial models with safety scores below thresholds get fined
  let totalRegulatoryFines = 0;
  const deployedCommercialModels = trainedModels.filter(m => m.isDeployed && m.activeDeployments?.some(dep => dep !== 'OPEN_SOURCE'));

  regulatoryMandates.forEach(mandate => {
    if (mandate.status === 'ACTIVE') {
      // Adjust threshold based on lobbying level: each lobbying level reduces required safety threshold by 5%
      const effectiveThreshold = Math.max(10, mandate.minSafetyRequired - (lobbyingLevel * 5));
      
      deployedCommercialModels.forEach(model => {
        if (model.safetyScore < effectiveThreshold) {
          totalRegulatoryFines += mandate.fineRateMonthly;
        }
      });
    }
  });

  // Assign Model to Contract
  const assignModelToContract = (contractId: string, modelId: string) => {
    if (!contractId || !modelId) return;
    const contract = contracts.find(c => c.id === contractId);
    const model = trainedModels.find(m => m.id === modelId);

    if (!contract || !model) return;

    // Check Requirements
    const avgScore = Object.values(model.benchmarks).reduce((sum, v) => sum + v, 0) / 8;
    
    if (contract.requirements.minAvgScore && avgScore < contract.requirements.minAvgScore) {
      playSound('alert');
      addLogMessage(`⚠️ CONTRACT BID DENIED: Model average benchmark score (${Math.round(avgScore)}%) is below the client requirement of ${contract.requirements.minAvgScore}%.`, 'SYSTEM');
      return;
    }

    if (contract.requirements.minSpecialization && model.specialization !== contract.requirements.minSpecialization) {
      playSound('alert');
      addLogMessage(`⚠️ CONTRACT BID DENIED: Model specialization "${model.specialization}" does not match the required "${contract.requirements.minSpecialization}".`, 'SYSTEM');
      return;
    }

    if (contract.requirements.minParametersB && model.parametersCountB < contract.requirements.minParametersB) {
      playSound('alert');
      addLogMessage(`⚠️ CONTRACT BID DENIED: Model size (${model.parametersCountB}B params) is smaller than required ${contract.requirements.minParametersB}B.`, 'SYSTEM');
      return;
    }

    if (contract.requirements.minSafetyScore && model.safetyScore < contract.requirements.minSafetyScore) {
      playSound('alert');
      addLogMessage(`⚠️ CONTRACT BID DENIED: Model alignment safety score (${model.safetyScore}%) is below client mandate of ${contract.requirements.minSafetyScore}%.`, 'SYSTEM');
      return;
    }

    // Sign Contract
    playSound('success');
    const updatedContracts = contracts.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          status: 'ACTIVE' as const,
          assignedModelId: modelId,
          monthsRemaining: c.durationMonths
        };
      }
      return c;
    });

    updateState({
      cash: state.cash + contract.instantBonus,
      contracts: updatedContracts
    });

    addLogMessage(`🏛️ SOVEREIGN AGREEMENT SIGNED: "${contract.client}" signs contract for "${contract.title}". Received $${contract.instantBonus.toLocaleString()} instant mobilization grant.`, 'SYSTEM');
    setSelectedModelId('');
    setSelectedContractId('');
  };

  // Terminate/Breach Contract early
  const terminateContract = (id: string, client: string, title: string, fine: number) => {
    if (!confirm(`Are you sure you want to terminate the contract for "${title}" early? This will invoke a strict security exit clause penalty of $${fine.toLocaleString()}!`)) return;

    if (state.cash < fine) {
      playSound('alert');
      addLogMessage(`⚠️ PENALTY ERROR: Insufficient liquid cash to pay early termination exit fee.`, 'SYSTEM');
      return;
    }

    playSound('click');
    const updated = contracts.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'AVAILABLE' as const,
          assignedModelId: undefined,
          monthsRemaining: c.durationMonths
        };
      }
      return c;
    });

    updateState({
      cash: state.cash - fine,
      contracts: updated
    });

    addLogMessage(`⚖️ AGREEMENT BREACHED: Unilaterally canceled contract with "${client}". Paid $${fine.toLocaleString()} exit fee penalty.`, 'SYSTEM');
  };

  // Lobbying & Regulatory Influence
  const buyLobbyingLvl = () => {
    const cost = 85000 + (lobbyingLevel * 50000);
    const rpCost = 15 + (lobbyingLevel * 10);

    if (state.cash < cost || state.researchPoints < rpCost) {
      playSound('alert');
      return;
    }

    playSound('success');
    updateState({
      cash: state.cash - cost,
      researchPoints: state.researchPoints - rpCost,
      lobbyingLevel: lobbyingLevel + 1
    });

    addLogMessage(`👔 LOBBYING EFFORT COMPLETED: Increased Washington & Brussels Influence Level to ${lobbyingLevel + 1}. All compliance safety rating requirements reduced by -5%!`, 'SYSTEM');
  };

  // Buy single compliance waiver
  const buyExemptionWaiver = (mandateId: string, cost: number) => {
    if (state.cash < cost) {
      playSound('alert');
      return;
    }

    playSound('success');
    // Reduce regulatory compliance parameters slightly or grant short-term cash release
    updateState({
      cash: state.cash - cost,
      globalPublicSentiment: Math.min(100, state.globalPublicSentiment + 10)
    });

    addLogMessage(`📜 SAFETY EXEMPTION ISSUED: Secured custom corporate compliance waiver. Public sentiment increased by +10.`, 'SYSTEM');
  };

  return (
    <div id="sovereign_contracts_tab" className="space-y-4">
      {/* Top Cards overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/75 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Sovereign Monthly Payout</span>
            <h4 className="text-2xl font-bold font-mono text-emerald-400 mt-1">+${totalContractRevenueMonthly.toLocaleString()}/mo</h4>
            <p className="text-xs text-slate-400 mt-0.5">{activeContracts.length} active global contracts</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Handshake className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/75 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Regulatory Active Fines</span>
            <h4 className="text-2xl font-bold font-mono text-rose-500 mt-1">-${totalRegulatoryFines.toLocaleString()}/mo</h4>
            <p className="text-xs text-slate-400 mt-0.5">{deployedCommercialModels.filter(m => m.safetyScore < 50).length} non-compliant deployments</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <Scale className="h-6 w-6 text-rose-500" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/75 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Federal Lobbying Level</span>
            <h4 className="text-2xl font-bold font-mono text-cyan-400 mt-1">Level {lobbyingLevel}</h4>
            <p className="text-xs text-slate-400 mt-0.5">Threshold exemption: <span className="text-cyan-400 font-bold font-mono">-{lobbyingLevel * 5}%</span></p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Sliders className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Subtab selection */}
      <div className="flex border-b border-slate-800/60 gap-1 pb-1">
        <button
          onClick={() => { setActiveSubTab('CONTRACTS'); playSound('click'); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeSubTab === 'CONTRACTS' 
              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Sovereign Contracts
        </button>
        <button
          onClick={() => { setActiveSubTab('REGULATORY'); playSound('click'); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeSubTab === 'REGULATORY' 
              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Regulatory AI Council
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {activeSubTab === 'CONTRACTS' ? (
          <>
            {/* Left Column: Bids & Available Contracts */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <div className="border-b border-slate-800/60 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-cyan-400" />
                  Available Government & Enterprise Tenders
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 border border-slate-700/50 px-2 py-0.5 rounded-full">
                  Verified Tenders
                </span>
              </div>

              {availableContracts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                  No sovereign tenders currently available. Please check back next quarter as agencies release new R&D envelopes.
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {availableContracts.map((contract) => (
                    <div key={contract.id} className="bg-slate-950/60 border border-slate-800/75 rounded-xl p-3 space-y-2 hover:border-slate-700/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/40 px-2 py-0.5 rounded-md">
                            {contract.client}
                          </span>
                          <h4 className="font-bold text-slate-200 text-sm mt-1.5">{contract.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Payout Rate:</span>
                          <span className="font-mono text-emerald-400 font-bold text-sm">+${contract.monthlyPayout.toLocaleString()}/mo</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {contract.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/30 p-2 rounded-lg border border-slate-800/50 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-medium block mb-1">Strict Requirements:</span>
                          <ul className="space-y-1 font-mono text-slate-300">
                            {contract.requirements.minAvgScore && (
                              <li>• Minimum Benchmark Average: <span className="text-cyan-400">{contract.requirements.minAvgScore}%</span></li>
                            )}
                            {contract.requirements.minSpecialization && (
                              <li>• Required Domain Spec: <span className="text-purple-400">{contract.requirements.minSpecialization}</span></li>
                            )}
                            {contract.requirements.minParametersB && (
                              <li>• Parameter Floor: <span className="text-amber-400">&gt;={contract.requirements.minParametersB}B</span></li>
                            )}
                            {contract.requirements.minSafetyScore && (
                              <li>• Alignment Safety Minimum: <span className="text-emerald-400">{contract.requirements.minSafetyScore}%</span></li>
                            )}
                          </ul>
                        </div>
                        <div className="space-y-1 font-mono">
                          <div><span className="text-slate-500">Contract Duration:</span> <span className="text-slate-300">{contract.durationMonths} Months</span></div>
                          <div><span className="text-slate-500">Mobilization Grant:</span> <span className="text-emerald-400 font-bold">+${contract.instantBonus.toLocaleString()}</span></div>
                          <div><span className="text-slate-500">Early Termination fine:</span> <span className="text-rose-400">${contract.finePenalty.toLocaleString()}</span></div>
                        </div>
                      </div>

                      {/* Bid deployment actions */}
                      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-1">
                        <select
                          id={`model_select_${contract.id}`}
                          className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2 py-1.5 outline-none max-w-xs cursor-pointer"
                          onChange={(e) => {
                            setSelectedContractId(contract.id);
                            setSelectedModelId(e.target.value);
                          }}
                        >
                          <option value="">-- Choose Model to Deploy --</option>
                          {trainedModels.map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.parametersCountB}B params)</option>
                          ))}
                        </select>
                        <button
                          onClick={() => assignModelToContract(contract.id, selectedModelId)}
                          disabled={selectedContractId !== contract.id || !selectedModelId}
                          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Handshake className="h-3.5 w-3.5" /> Submit Official Bid
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Active Sovereign Engagements */}
            <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <div className="border-b border-slate-800/60 pb-2">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-emerald-400" />
                  Active Sovereign Bids ({activeContracts.length})
                </h3>
              </div>

              {activeContracts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs italic">
                  No active government contracts signed. Submit a model to a pending tender on the left to gain massive guaranteed monthly cashflows.
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {activeContracts.map((contract) => {
                    const assignedModel = trainedModels.find(m => m.id === contract.assignedModelId);
                    return (
                      <div key={contract.id} className="bg-slate-950/80 border border-emerald-950/40 rounded-xl p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                              {contract.client}
                            </span>
                            <h4 className="font-bold text-slate-200 text-xs mt-1.5">{contract.title}</h4>
                          </div>
                        </div>

                        <div className="text-[11px] space-y-1.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Deployed Model:</span>
                            <span className="font-semibold text-cyan-400 font-mono">{assignedModel ? assignedModel.name : 'Unknown Model'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Monthly Payout:</span>
                            <span className="font-bold text-emerald-400 font-mono">${contract.monthlyPayout.toLocaleString()}/mo</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Remaining Term:</span>
                            <span className="font-mono text-slate-300 font-bold flex items-center gap-1"><Clock className="h-3 w-3 text-cyan-400" /> {contract.monthsRemaining} months</span>
                          </div>
                        </div>

                        <button
                          onClick={() => terminateContract(contract.id, contract.client, contract.title, contract.finePenalty)}
                          className="w-full text-center text-[10px] bg-rose-950/60 border border-rose-800/40 text-rose-400 py-1 rounded hover:bg-rose-900/50 transition font-bold"
                        >
                          Revoke Agreement (Penalty Fee: ${contract.finePenalty.toLocaleString()})
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Left Column: Active Regulatory Mandates */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <div className="border-b border-slate-800/60 pb-2">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-purple-400" />
                  Global AI Safety Regulatory Statutes
                </h3>
              </div>

              <div className="space-y-3">
                {regulatoryMandates.map((mandate) => {
                  const effectiveThreshold = Math.max(10, mandate.minSafetyRequired - (lobbyingLevel * 5));
                  const nonCompliantCount = deployedCommercialModels.filter(m => m.safetyScore < effectiveThreshold).length;

                  return (
                    <div key={mandate.id} className="bg-slate-950/60 border border-slate-800/75 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{mandate.name}</h4>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{mandate.description}</p>
                        </div>
                        <div className="text-right shrink-0 bg-slate-900 border border-slate-800 p-2 rounded-lg font-mono">
                          <span className="text-[10px] text-slate-500 block">Fine Multiplier:</span>
                          <span className="text-rose-400 font-bold font-mono text-xs">${mandate.fineRateMonthly.toLocaleString()}/mo</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/40 border border-slate-800/50 p-3 rounded-lg text-xs font-mono">
                        <div>
                          <span className="text-slate-500">Statutory Safety Floor:</span>{' '}
                          <span className="text-emerald-400 font-bold">{mandate.minSafetyRequired}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Adjusted Threshold (Lobbying):</span>{' '}
                          <span className="text-cyan-400 font-bold">{effectiveThreshold}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Days Until Re-Audit:</span>{' '}
                          <span className="text-slate-300 font-bold">{mandate.daysRemaining} Days</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Violating Commercial Models:</span>{' '}
                          <span className={nonCompliantCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {nonCompliantCount} Deployed
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => buyExemptionWaiver(mandate.id, 50000)}
                          className="text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-bold"
                        >
                          <FileText className="h-3.5 w-3.5 text-cyan-400" /> Apply for Regulatory Exception Exemption ($50,000)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Lobbying & Legislative Influence */}
            <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <div className="border-b border-slate-800/60 pb-2">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-cyan-400" />
                  K-Street Lobbying Office
                </h3>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hire top corporate public affairs attorneys and K-Street consultants to lobby legislative councils. 
                  Every lobbying level permanently reduces the minimum safety score compliance threshold across all mandates by <span className="text-cyan-400 font-bold font-mono">-5%</span>.
                </p>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Current Lobbying Level:</span>
                    <span className="text-cyan-400 font-bold">Level {lobbyingLevel}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Total Statutory Reduction:</span>
                    <span className="text-cyan-400 font-bold">-{lobbyingLevel * 5}% safety</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lobbying Cost to upgrade:</span>
                    <div className="text-right">
                      <div className="text-amber-500 font-bold">${(85000 + lobbyingLevel * 50000).toLocaleString()} Cash</div>
                      <div className="text-purple-400 font-bold">{(15 + lobbyingLevel * 10)} Research Points</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={buyLobbyingLvl}
                  disabled={state.cash < (85000 + lobbyingLevel * 50000) || state.researchPoints < (15 + lobbyingLevel * 10)}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" /> Fund Lobbying Upgrade
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
