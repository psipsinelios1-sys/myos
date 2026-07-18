import React, { useState } from 'react';
import { 
  Cpu, Zap, Flame, Thermometer, Snowflake, Server, AlertTriangle, 
  Lightbulb, Wrench, RotateCcw, RefreshCw, CheckCircle, Info, Filter 
} from 'lucide-react';
import { GameState, GPUHardware, ResearchState } from '../types';
import { GPUMARKETPLACE } from '../data';
import { syncServerInstances } from '../gameEngine';

interface ComputeClusterProps {
  state: GameState;
  updateState: (newState: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'EVENT' | 'MILESTONE' | 'MARKET') => void;
}

export default function ComputeCluster({ state, updateState, addLogMessage }: ComputeClusterProps) {
  const [maintFilter, setMaintFilter] = useState<'ALL' | 'DEGRADED' | 'HEALTHY' | 'QUEUED'>('ALL');

  // Get current active server instances list (sync immediately if empty)
  const servers = state.serverInstances && state.serverInstances.length > 0
    ? state.serverInstances
    : syncServerInstances(state);

  // Buy GPU Hardware
  const buyGPU = (gpu: GPUHardware) => {
    let price = gpu.cost;
    
    // Apply tariff surcharge (+50%) for standardized commercial GPUs
    const isCustom = (gpu as any).isCustom;
    if (!isCustom) {
      price = price * 1.5;
    }
    
    // Shenzhen bonus: GPUs are 20% cheaper
    if (state.hqLocation.type === 'SHENZHEN') {
      price = price * 0.8;
    }

    if (state.gpuShortageMultiplier && state.gpuShortageMultiplier > 1) {
      price = Math.round(price * state.gpuShortageMultiplier);
    }

    if (state.cash < price) {
      addLogMessage(`❌ FAILED TO PROCURE: Insufficient liquidity to purchase ${gpu.name}. Requires $${Math.round(price).toLocaleString()}.`, 'SYSTEM');
      return;
    }

    const currentQty = state.gpusInstalled[gpu.id] || 0;
    const updatedQty = currentQty + 1;
    const nextGpusInstalled = { ...state.gpusInstalled, [gpu.id]: updatedQty };
    const nextCash = state.cash - price;

    // Synchronize servers array on this next state structure
    const tempState = { ...state, gpusInstalled: nextGpusInstalled, cash: nextCash };
    const nextServerInstances = syncServerInstances(tempState);

    updateState({
      gpusInstalled: nextGpusInstalled,
      cash: nextCash,
      serverInstances: nextServerInstances,
    });

    addLogMessage(`⚙️ HARDWARE GRIDS: Procured 1x unit of ${gpu.name}. Cluster flops capacity immediately expanded!`, 'SYSTEM');
  };

  // Sell GPU Hardware
  const sellGPU = (gpu: GPUHardware) => {
    const currentQty = state.gpusInstalled[gpu.id] || 0;
    if (currentQty <= 0) return;

    let refundVal = gpu.cost * 0.6; // Sell at 60% salvage rate
    const updatedQty = currentQty - 1;
    const nextGpusInstalled = { ...state.gpusInstalled, [gpu.id]: updatedQty };
    const nextCash = state.cash + refundVal;

    const tempState = { ...state, gpusInstalled: nextGpusInstalled, cash: nextCash };
    const nextServerInstances = syncServerInstances(tempState);

    updateState({
      gpusInstalled: nextGpusInstalled,
      cash: nextCash,
      serverInstances: nextServerInstances,
    });

    addLogMessage(`🔩 SALVAGE DEPOT: Sold 1x unit of ${gpu.name} for 60% salvage refund value: $${refundVal.toLocaleString()}.`, 'SYSTEM');
  };

  // Upgrade cooling fans
  const upgradeCooling = () => {
    if (state.coolingLevel >= 15) {
      addLogMessage(`❄️ COOLING MAXED: Ventilation grids are running at absolute zero refrigeration capacity.`, 'SYSTEM');
      return;
    }

    const cost = state.coolingLevel * 14000;
    if (state.cash < cost) {
      addLogMessage(`❌ FAILED TO UPGRADE: Insufficient cash to upgrade fans. Requires $${cost.toLocaleString()}.`, 'SYSTEM');
      return;
    }

    updateState({
      cash: state.cash - cost,
      coolingLevel: state.coolingLevel + 1,
    });

    addLogMessage(`❄️ SYSTEMS REFIT: Liquid coolant tubes refitted with upgraded high-static fans. Refrigeration Level: ${state.coolingLevel + 1}.`, 'SYSTEM');
  };

  // Maintenance & Repair Handlers
  const maintainServer = (server: any) => {
    const cost = 500;
    if (state.cash < cost) {
      addLogMessage(`❌ MAINTENANCE FAILED: Insufficient cash ($500 needed).`, 'SYSTEM');
      return;
    }

    if (server.condition >= 100) {
      addLogMessage(`ℹ️ UPKEEP: Server ${server.id} is already in pristine condition.`, 'SYSTEM');
      return;
    }

    if (server.status === 'SHUTDOWN') {
      addLogMessage(`❌ MAINTENANCE FAILED: Unit is fully shut down or halted. Schedule a full Hardware Repair instead.`, 'SYSTEM');
      return;
    }

    const nextServers = servers.map((s) => {
      if (s.id === server.id) {
        const nextCondition = Math.min(100, s.condition + 20);
        return {
          ...s,
          condition: nextCondition,
          status: (nextCondition >= 50 ? 'OPERATIONAL' : (nextCondition >= 20 ? 'NEEDS_MAINTENANCE' : 'CRITICAL')) as 'OPERATIONAL' | 'NEEDS_MAINTENANCE' | 'CRITICAL' | 'SHUTDOWN',
        };
      }
      return s;
    });

    updateState({
      cash: state.cash - cost,
      serverInstances: nextServers,
    });

    addLogMessage(`🔧 UPKEEP SECURED: Performed routine maintenance on ${server.gpuName} (-$500). Fluid filters cleaned and fans re-calibrated.`, 'SYSTEM');
  };

  const repairServer = (server: any) => {
    const spec = GPUMARKETPLACE.find((g) => g.id === server.gpuId) || (state.customChips || []).find((g) => g.id === server.gpuId);
    const baseCost = 2500;
    let gpuPrice = spec ? spec.cost : 30000;
    if (state.gpuShortageMultiplier && state.gpuShortageMultiplier > 1) gpuPrice = Math.round(gpuPrice * state.gpuShortageMultiplier);
    
    const cost = baseCost + Math.round(gpuPrice * 0.15); // $2500 + 15% of gpu price

    if (state.cash < cost) {
      addLogMessage(`❌ REPAIR FAILED: Insufficient cash ($${cost.toLocaleString()} needed).`, 'SYSTEM');
      return;
    }

    const nextServers = servers.map((s) => {
      if (s.id === server.id) {
        return {
          ...s,
          condition: 100,
          status: 'OPERATIONAL' as const,
          thermalShutdown: false,
        };
      }
      return s;
    });

    updateState({
      cash: state.cash - cost,
      serverInstances: nextServers,
    });

    addLogMessage(`🔩 REPAIRS SEEDED: Refitted and repaired ${server.gpuName} (-$${cost.toLocaleString()}). Transistor boards replaced.`, 'SYSTEM');
  };

  const replaceServer = (server: any) => {
    const spec = GPUMARKETPLACE.find((g) => g.id === server.gpuId) || (state.customChips || []).find((g) => g.id === server.gpuId);
    let gpuPrice = spec ? spec.cost : 30000;
    if (state.gpuShortageMultiplier && state.gpuShortageMultiplier > 1) gpuPrice = Math.round(gpuPrice * state.gpuShortageMultiplier);
    
    const cost = Math.round(gpuPrice * 0.85); // 85% of price

    if (state.cash < cost) {
      addLogMessage(`❌ REPLACEMENT FAILED: Insufficient cash ($${cost.toLocaleString()} needed).`, 'SYSTEM');
      return;
    }

    const nextServers = servers.map((s) => {
      if (s.id === server.id) {
        return {
          ...s,
          condition: 100,
          status: 'OPERATIONAL' as const,
          ageDays: 0,
          thermalShutdown: false,
        };
      }
      return s;
    });

    updateState({
      cash: state.cash - cost,
      serverInstances: nextServers,
    });

    addLogMessage(`🛰️ HOT-SWAP COMPLETE: Fully replaced ${server.gpuName} with a factory-new node unit (-$${cost.toLocaleString()}).`, 'SYSTEM');
  };

  const queueMaintenance = (server: any) => {
    const spec = GPUMARKETPLACE.find((g) => g.id === server.gpuId) || (state.customChips || []).find((g) => g.id === server.gpuId);
    let gpuCost = spec ? spec.cost : 30000;
    if (state.gpuShortageMultiplier && state.gpuShortageMultiplier > 1) gpuCost = Math.round(gpuCost * state.gpuShortageMultiplier);
    
    const isCritical = server.condition < 50 || server.status === 'SHUTDOWN';
    const cost = isCritical 
      ? 1000 + Math.round(gpuCost * 0.10) 
      : 300 + Math.round(gpuCost * 0.05);
    const days = isCritical ? 4 : 2;

    if (state.cash < cost) {
      addLogMessage(`❌ QUEUE MAINTENANCE FAILED: Insufficient cash ($${cost.toLocaleString()} needed).`, 'SYSTEM');
      return;
    }

    const nextServers = servers.map((s) => {
      if (s.id === server.id) {
        return {
          ...s,
          underMaintenance: true,
          maintenanceDaysRemaining: days,
        };
      }
      return s;
    });

    updateState({
      cash: state.cash - cost,
      serverInstances: nextServers,
    });

    addLogMessage(`⚙️ MAINTENANCE QUEUED: Sent ${server.gpuName} to the Maintenance Queue. Upkeep cost: -$${cost.toLocaleString()}. Work will complete in ${days} days.`, 'SYSTEM');
  };

  const triggerEmergencyCooling = () => {
    if (heatLevel <= 80) return;

    const nextServers = servers.map((s) => {
      if (s.status !== 'SHUTDOWN' && !s.underMaintenance) {
        return {
          ...s,
          isPoweredOff: true,
        };
      }
      return s;
    });

    updateState({
      serverInstances: nextServers,
    });

    addLogMessage(`🚨 EMERGENCY COOLING ACTIVATED: Initiated immediate safe power-down of all active compute nodes to prevent permanent hardware damage! Rack temperature is declining.`, 'EVENT');
  };

  const powerOnAllServers = () => {
    const nextServers = servers.map((s) => {
      if (s.isPoweredOff) {
        return {
          ...s,
          isPoweredOff: false,
        };
      }
      return s;
    });

    updateState({
      serverInstances: nextServers,
    });

    addLogMessage(`🔌 POWER GRID ON: Booted up all safe-shutdown nodes. Compute clusters are returning to service.`, 'SYSTEM');
  };

  const togglePower = (server: any) => {
    const nextServers = servers.map((s) => {
      if (s.id === server.id) {
        return {
          ...s,
          isPoweredOff: !s.isPoweredOff,
        };
      }
      return s;
    });

    updateState({
      serverInstances: nextServers,
    });

    const action = !server.isPoweredOff ? 'POWERED DOWN' : 'POWERED ON';
    addLogMessage(`🔌 POWER CONTROL: ${server.gpuName} was manually ${action}.`, 'SYSTEM');
  };

  const maintainAllServers = () => {
    const targets = servers.filter((s) => s.status !== 'SHUTDOWN' && s.condition < 90);
    if (targets.length === 0) {
      addLogMessage(`ℹ️ CLUSTER OPTIMAL: All operational servers are already in excellent condition.`, 'SYSTEM');
      return;
    }

    const totalCost = targets.length * 500;
    if (state.cash < totalCost) {
      addLogMessage(`❌ BULK MAINTENANCE FAILED: Insufficient cash ($${totalCost.toLocaleString()} needed).`, 'SYSTEM');
      return;
    }

    const nextServers = servers.map((s) => {
      if (s.status !== 'SHUTDOWN' && s.condition < 90) {
        const nextCondition = Math.min(100, s.condition + 20);
        return {
          ...s,
          condition: nextCondition,
          status: (nextCondition >= 50 ? 'OPERATIONAL' : (nextCondition >= 20 ? 'NEEDS_MAINTENANCE' : 'CRITICAL')) as 'OPERATIONAL' | 'NEEDS_MAINTENANCE' | 'CRITICAL' | 'SHUTDOWN',
        };
      }
      return s;
    });

    updateState({
      cash: state.cash - totalCost,
      serverInstances: nextServers,
    });

    addLogMessage(`🔧 BULK MAINTENANCE COMPLETE: Cleaned and serviced ${targets.length} servers (-$${totalCost.toLocaleString()}).`, 'SYSTEM');
  };

  const repairAllServers = () => {
    const targets = servers.filter((s) => s.status === 'SHUTDOWN' || s.condition < 50);
    if (targets.length === 0) {
      addLogMessage(`ℹ️ CLUSTER HEALTHY: No critical or halted servers require complex hardware repairs.`, 'SYSTEM');
      return;
    }

    let totalCost = 0;
    targets.forEach((s) => {
      const spec = GPUMARKETPLACE.find((g) => g.id === s.gpuId) || (state.customChips || []).find((g) => g.id === s.gpuId);
      let gpuPrice = spec ? spec.cost : 30000;
      if (state.gpuShortageMultiplier && state.gpuShortageMultiplier > 1) gpuPrice = Math.round(gpuPrice * state.gpuShortageMultiplier);
      totalCost += 2500 + Math.round(gpuPrice * 0.15);
    });

    if (state.cash < totalCost) {
      addLogMessage(`❌ BULK REPAIR FAILED: Insufficient cash ($${totalCost.toLocaleString()} needed).`, 'SYSTEM');
      return;
    }

    const nextServers = servers.map((s) => {
      if (s.status === 'SHUTDOWN' || s.condition < 50) {
        return {
          ...s,
          condition: 100,
          status: 'OPERATIONAL' as const,
          thermalShutdown: false,
        };
      }
      return s;
    });

    updateState({
      cash: state.cash - totalCost,
      serverInstances: nextServers,
    });

    addLogMessage(`🔩 BULK REPAIRS SECURED: Overhauled and restored ${targets.length} critical server nodes to 100% capacity (-$${totalCost.toLocaleString()}).`, 'SYSTEM');
  };

  const purchaseHardwareUpgrade = (upgradeId: 'liquid_cooling' | 'overclock' | 'power_inverters') => {
    let cost = 0;
    let field: keyof ResearchState | null = null;
    let upgradeName = '';

    if (upgradeId === 'liquid_cooling') {
      cost = 40;
      field = 'unlockedLiquidCooling';
      upgradeName = 'Liquid Cooling Systems';
    } else if (upgradeId === 'overclock') {
      cost = 50;
      field = 'unlockedOverclockingRigs';
      upgradeName = 'Overclocking Rigs';
    } else if (upgradeId === 'power_inverters') {
      cost = 45;
      field = 'unlockedAdvancedInverters';
      upgradeName = 'Advanced Power Inverters';
    }

    if (!field) return;

    if ((state.researchPoints || 0) < cost) {
      addLogMessage(`❌ UPGRADE LOCKED: Insufficient research points. Requires ${cost} R&D points.`, 'SYSTEM');
      return;
    }

    const nextResearch = {
      ...state.research,
      [field]: true,
    };

    updateState({
      researchPoints: (state.researchPoints || 0) - cost,
      research: nextResearch,
    });

    addLogMessage(`🛠️ HARDWARE UPGRADE: Successfully researched and deployed ${upgradeName}! Passive cluster modifiers applied.`, 'EVENT');
  };

  // Compute operational stats dynamically based on server conditions
  let totalTflops = 0;
  let totalPowerUsage = 0;
  let gpuActiveCount = 0;
  
  const isTrainingActive = !!state.training;

  servers.forEach((srv) => {
    const spec = GPUMARKETPLACE.find((g) => g.id === srv.gpuId) || (state.customChips || []).find((g) => g.id === srv.gpuId);
    if (spec) {
      if (srv.status !== 'SHUTDOWN' && !srv.underMaintenance && !srv.isPoweredOff) {
        gpuActiveCount += 1;
        const performanceFactor = srv.condition >= 80 ? 1.0 : Math.max(0.1, srv.condition / 80);
        let tflops = spec.tflops * performanceFactor;
        if (state.research?.unlockedOverclockingRigs) {
          tflops *= 1.25; // Overclocking Rigs: 25% compute performance boost
        }
        totalTflops += tflops;

        let power = spec.powerUsageKW;
        if (state.research?.unlockedAdvancedInverters) {
          power *= 0.8; // Advanced Power Inverters: 20% power reduction
        }
        
        if (!isTrainingActive) {
          totalPowerUsage += 0.05; // Idle
        } else {
          totalPowerUsage += power;
        }
      } else {
        let standbyPower = 0.05;
        if (state.research?.unlockedAdvancedInverters) {
          standbyPower *= 0.8;
        }
        totalPowerUsage += standbyPower; // standby power
      }
    }
  });

  const heatReduction = state.research?.unlockedLiquidCooling ? 0.7 : 1.0;
  const overclockHeatIncrease = state.research?.unlockedOverclockingRigs ? 1.2 : 1.0;

  // Calculate heat based on current actual standby/active draw
  const heatLevel = Math.max(
    25,
    Math.min(
      110,
      25 + (totalPowerUsage > 0 ? ((totalPowerUsage / 8) / (state.coolingLevel * 1.5)) * heatReduction * overclockHeatIncrease : 0)
    )
  );

  const getHeatColor = (temp: number) => {
    if (temp < 60) return 'text-emerald-400';
    if (temp < 80) return 'text-amber-400';
    return 'text-red-500 font-bold animate-pulse';
  };

  const getHeatBarBg = (temp: number) => {
    if (temp < 60) return 'bg-emerald-500';
    if (temp < 80) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  const getSrvHealthColor = (cond: number, status: string) => {
    if (status === 'SHUTDOWN') return 'text-slate-500';
    if (cond >= 80) return 'text-[#00FF41]';
    if (cond >= 50) return 'text-amber-400';
    return 'text-red-500 font-bold animate-pulse';
  };

  const getSrvSlotClass = (srv: any) => {
    let classes = '';
    
    if (srv.status === 'SHUTDOWN') {
      classes = 'bg-red-950/20 border-red-900/60 opacity-70';
    } else if (srv.condition >= 80) {
      classes = 'bg-slate-950 border-[#00FF41] shadow-[0_0_8px_rgba(0,255,65,0.06)]';
    } else if (srv.condition >= 50) {
      classes = 'bg-slate-950 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.06)]';
    } else {
      classes = 'bg-slate-950 border-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.15)]';
    }

    if (srv.status !== 'SHUTDOWN') {
      if (heatLevel > 80) {
        classes += ' animate-pulse-red border-red-500!';
      } else if (state.research?.unlockedOverclockingRigs) {
        classes += ' animate-pulse-orange';
      } else if (srv.condition < 50) {
        classes += ' animate-pulse';
      }
    }
    
    return classes;
  };

  // Check locks for procuring newer hardware generations
  const isUnlocked = (stageNeeded: string) => {
    const list = ['BOOTSTRAPPED', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'PUBLIC_IPO'];
    const current = list.indexOf(state.fundingStage);
    const needed = list.indexOf(stageNeeded);
    return current >= needed;
  };

  const totalSlots = 24;

  // Filtered servers for the bench list
  const filteredServers = servers.filter((s) => {
    if (maintFilter === 'DEGRADED') return (s.status === 'SHUTDOWN' || s.condition < 80) && !s.underMaintenance;
    if (maintFilter === 'HEALTHY') return s.status === 'OPERATIONAL' && s.condition >= 80 && !s.underMaintenance;
    if (maintFilter === 'QUEUED') return !!s.underMaintenance;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Visual Server Rack Matrix Grid */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-cyan-950/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-indigo-500/[0.02] pointer-events-none rounded-[inherit]" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/80 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Server className="h-4.5 w-4.5 text-[#00D1FF] animate-pulse" />
            <h4 className="font-bold font-mono text-xs text-slate-100 tracking-wider uppercase">
              CLUSTER VISUAL SERVER RACK MATRIX
            </h4>
            {servers.some((s) => s.status === 'SHUTDOWN') ? (
              <span className="inline-flex items-center gap-1 bg-red-950/80 text-rose-400 border border-red-900/30 text-[9px] font-mono px-2 py-0.5 font-bold uppercase select-none animate-pulse rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                NODE_STATUS: DISRUPTED
              </span>
            ) : servers.some((s) => s.condition < 50) ? (
              <span className="inline-flex items-center gap-1 bg-amber-950/80 text-amber-400 border border-amber-900/30 text-[9px] font-mono px-2 py-0.5 font-bold uppercase select-none animate-pulse rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                NODE_STATUS: DEGRADED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-emerald-950/60 text-[#00FF41] border border-emerald-900/30 text-[9px] font-mono px-2 py-0.5 font-bold uppercase select-none rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] inline-block animate-pulse"></span>
                NODE_STATUS: NOMINAL
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
            <div>
              COOL_EFFICIENCY: <span className="text-[#00D1FF] font-bold">{Math.max(40, Math.round(100 - (heatLevel - 25)))}%</span>
            </div>
            <div className="hidden md:block text-slate-500 animate-pulse">
              [SYS-GRID]: {gpuActiveCount} ACTIVE CORES // WEAR SCALERS ENGAGED
            </div>
          </div>
        </div>

        {/* 24 server rack slots visualizer */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 relative z-10">
          {Array.from({ length: totalSlots }).map((_, index) => {
            const isActive = index < servers.length;
            const srv = isActive ? servers[index] : null;

            return (
              <div
                key={index}
                className={`border p-2 flex flex-col justify-between h-15 select-none transition-all duration-300 rounded-xl relative overflow-hidden ${
                  isActive
                    ? getSrvSlotClass(srv)
                    : 'bg-slate-950/20 border-slate-900/60 opacity-30'
                }`}
              >
                <div className="flex justify-between items-center leading-none">
                  <span className="text-[7.5px] font-mono text-slate-500">U{String(index + 1).padStart(2, '0')}</span>
                  {isActive ? (
                    <span className="relative flex h-1.5 w-1.5">
                      {srv?.status !== 'SHUTDOWN' && (srv?.condition ?? 100) < 50 && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                      )}
                      {srv?.status === 'SHUTDOWN' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                        srv?.status === 'SHUTDOWN' ? 'bg-rose-500' : (srv?.condition ?? 100) >= 80 ? 'bg-[#00FF41]' : (srv?.condition ?? 100) >= 50 ? 'bg-amber-400' : 'bg-rose-450'
                      }`}></span>
                    </span>
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-slate-850/40"></span>
                  )}
                </div>
                
                <div className="text-left font-mono leading-none mt-1.5">
                  {srv ? (
                    <>
                      <div className="text-[8.5px] font-bold text-slate-100 truncate leading-none uppercase tracking-tight">
                        {srv.gpuId.toUpperCase()}
                      </div>
                      <div className="flex justify-between items-center mt-1 leading-none">
                        <span className="text-[6px] text-slate-500">COND:</span>
                        <span className={`text-[7px] font-mono font-bold ${getSrvHealthColor(srv.condition, srv.status)}`}>
                          {srv.status === 'SHUTDOWN' ? 'OFF' : `${Math.round(srv.condition)}%`}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-[7.5px] text-slate-700 tracking-wider">EMPTY</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Rack & Health status dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Thermal Controls */}
        <div className={`lg:col-span-4 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-between h-full shadow-xl relative overflow-hidden border transition-all duration-500 ${
          heatLevel > 80 
            ? 'border-red-500 shadow-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.25)]' 
            : 'border-amber-500/20 shadow-amber-950/5'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 relative z-10">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <Thermometer className="h-4.5 w-4.5 text-amber-400" />
              Thermal Control Core
            </h4>
            <span className="font-mono text-[9px] text-slate-500">REALTIME TEMP</span>
          </div>

          <div className="flex items-center justify-between py-2 relative z-10">
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Rack Air Temp</span>
              <span className={`text-3xl font-mono font-extrabold ${getHeatColor(heatLevel)}`}>
                {heatLevel.toFixed(1)}°C
              </span>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Cooling Speed</span>
              <span className="text-lg font-mono font-bold text-cyan-400">
                Lvl {state.coolingLevel} / 15
              </span>
            </div>
          </div>

          {/* Temperature visual bar */}
          <div className="space-y-1.5 relative z-10">
            <div className="glow-bar-container h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850 relative">
              <div
                className="glow-bar-fill h-full rounded-full transition-all duration-550"
                style={{
                  width: `${Math.min(100, (heatLevel / 110) * 100)}%`,
                  '--glow-color': heatLevel > 80 ? '#f43f5e' : heatLevel > 60 ? '#fbbf24' : '#10b981'
                } as React.CSSProperties}
              />
            </div>
            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
              <span>COOL (25°C)</span>
              <span>NOMINAL (65°C)</span>
              <span>OVERHEAT (80°C+)</span>
            </div>
          </div>

          {/* Warnings */}
          {heatLevel > 80 && (
            <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-3 flex gap-2 text-xs text-red-300 relative z-10">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 select-none animate-bounce" />
              <p className="leading-relaxed text-[10px] font-mono">
                <b>WARNING: Silicon Decay Active!</b> Silicon temperatures exceeded 80°C. Individual server units will experience accelerated wear. Procure cooling refits.
              </p>
            </div>
          )}

          {/* Emergency Cooling power-down */}
          <div className="space-y-2 pt-2 relative z-10">
            <button
              onClick={triggerEmergencyCooling}
              disabled={heatLevel <= 80}
              className={`w-full font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
                heatLevel > 80
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-slate-950 border-red-500 cursor-pointer shadow-lg shadow-red-900/30 animate-pulse'
                  : 'bg-slate-950 border-slate-850 text-slate-600 cursor-not-allowed'
              }`}
              title={heatLevel > 80 ? "Power down all operating servers safely to prevent permanent thermal degradation." : "Available when cluster temperature exceeds 80°C"}
            >
              <Flame className="h-4 w-4" />
              Emergency Power-Down
            </button>

            {servers.some((s) => s.isPoweredOff) && (
              <button
                onClick={powerOnAllServers}
                className="w-full bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/60 text-emerald-450 font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                Power On All Nodes
              </button>
            )}

            <button
              onClick={upgradeCooling}
              className="w-full bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-850 text-cyan-300 font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Snowflake className="h-3.5 w-3.5" />
              Upgrade Refrigeration Fans (-${(state.coolingLevel * 14000).toLocaleString()})
            </button>
          </div>
        </div>

        {/* Installed Racks list */}
        <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-5 flex flex-col justify-between h-full shadow-xl shadow-indigo-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 relative z-10">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <Server className="h-4.5 w-4.5 text-indigo-400" />
              Server Grid Metrics
            </h4>
            <span className="font-mono text-[9px] text-slate-500">OPERATIONAL DATA</span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2 relative z-10">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Active Nodes</span>
              <span className="text-xl font-mono font-bold text-slate-100">{gpuActiveCount} / {servers.length}</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Cluster Capacity</span>
              <span className="text-xl font-mono font-bold text-purple-400">
                {Math.round(totalTflops).toLocaleString()} <span className="text-[10px] text-slate-500">TFLOPS</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 border border-slate-850 rounded-xl space-y-1.5 relative z-10">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-yellow-500 animate-pulse" /> Active Draw:
              </span>
              <span className="font-bold text-slate-200">{totalPowerUsage.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Est. Daily Electric Bill:</span>
              <span className="font-semibold text-amber-400">
                ${(totalPowerUsage * 24 * state.hqLocation.electricityCost).toLocaleString(undefined, { maximumFractionDigits: 0 })} / day
              </span>
            </div>
          </div>

          <p className="text-[9.5px] text-slate-500 italic relative z-10 pt-1 leading-normal">
            Compute capabilities auto-scale dynamically based on physical core health values. Clean server units periodically to prevent operational bottlenecks.
          </p>
        </div>
      </div>

      {/* Main Cluster Status row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider block mb-1">Maintenance Protocol</span>
            <h4 className="font-bold text-slate-200 text-sm mb-2">Cluster Wear Physics</h4>
            <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
              <li className="flex gap-2 items-start">
                <span className="text-indigo-400 text-base leading-none select-none">•</span>
                <span><b>Condition Wear</b>: Servers age daily. High rack temperature (80°C+) exponentially accelerates physical aging speed.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-indigo-400 text-base leading-none select-none">•</span>
                <span><b>Performance Loss</b>: When a node's condition falls below 80%, its floating-point TFLOPS output degrades linearly.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-indigo-400 text-base leading-none select-none">•</span>
                <span><b>Thermal Shutdowns</b>: Badly degraded or overheated nodes trigger automated emergency shuts to avoid silicon destruction.</span>
              </li>
            </ul>
          </div>
          <p className="text-[10px] font-mono text-slate-500 uppercase mt-3">Silicon Wear Operations Directive</p>
        </div>
      </div>

      {/* Diagnostics & Maintenance Bench */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-purple-950/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-3 relative z-10">
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm uppercase font-mono">
              <Wrench className="h-4.5 w-4.5 text-purple-400" />
              Node Diagnostics & Maintenance Bench
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Routine cleaning, node repairs, or block replacements. Perform bulk services below to minimize downtime.
            </p>
          </div>

          {/* Bulk Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={maintainAllServers}
              className="bg-slate-950 hover:bg-slate-850 text-slate-200 hover:text-slate-100 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Wrench className="h-3.5 w-3.5 text-cyan-400" />
              Service All (-$500/srv)
            </button>
            <button
              onClick={repairAllServers}
              className="bg-purple-950/30 hover:bg-purple-950/60 text-purple-300 hover:text-purple-250 border border-purple-900/50 px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-purple-400 animate-spin-slow" />
              Repair Halted & Crit All
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex gap-1 bg-slate-950/60 p-1 rounded-xl w-fit border border-slate-850/80 relative z-10">
          <button
            onClick={() => setMaintFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              maintFilter === 'ALL'
                ? 'bg-slate-800 text-slate-100 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            All Nodes ({servers.length})
          </button>
          <button
            onClick={() => setMaintFilter('DEGRADED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              maintFilter === 'DEGRADED'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-900/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Requires Upkeep ({servers.filter((s) => (s.status === 'SHUTDOWN' || s.condition < 80) && !s.underMaintenance).length})
          </button>
          <button
            onClick={() => setMaintFilter('HEALTHY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              maintFilter === 'HEALTHY'
                ? 'bg-emerald-950/40 text-[#00FF41] border border-emerald-900/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Pristine ({servers.filter((s) => s.status === 'OPERATIONAL' && s.condition >= 80 && !s.underMaintenance).length})
          </button>
          <button
            onClick={() => setMaintFilter('QUEUED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              maintFilter === 'QUEUED'
                ? 'bg-purple-950/60 text-purple-300 border border-purple-900/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            In Queue ({servers.filter((s) => s.underMaintenance).length})
          </button>
        </div>

        {/* Diagnostic Server List */}
        <div className="max-h-[340px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950 relative z-10">
          {filteredServers.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/30">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-65" />
              <p className="text-xs font-mono text-slate-400">Diagnostic clean. No servers match the current filter.</p>
            </div>
          ) : (
            <>
              {filteredServers.slice(0, 50).map((srv, idx) => {
                const spec = GPUMARKETPLACE.find((g) => g.id === srv.gpuId) || state.customChips?.find((g) => g.id === srv.gpuId);
                const gpuCost = spec ? spec.cost : 30000;
                const repairCost = 2500 + Math.round(gpuCost * 0.15);
                const replacementCost = Math.round(gpuCost * 0.85);

                // Status badges styling
                const getBadgeStyle = (status: string, condition: number) => {
                  if (srv.underMaintenance) return 'bg-purple-950 text-purple-400 border-purple-900 animate-pulse';
                  if (srv.isPoweredOff) return 'bg-slate-900 text-slate-450 border-slate-800';
                  if (status === 'SHUTDOWN') return 'bg-rose-950/80 text-rose-450 border-rose-900/30';
                  if (condition < 20) return 'bg-rose-950/50 text-rose-350 border-rose-900/20 animate-pulse';
                  if (condition < 50) return 'bg-amber-950/50 text-amber-350 border-amber-900/25';
                  if (condition < 80) return 'bg-slate-900 text-yellow-350 border-slate-800';
                  return 'bg-emerald-950/60 text-emerald-450 border-emerald-900/30';
                };

                return (
                  <div 
                    key={srv.id} 
                    className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:border-slate-800 transition-all"
                  >
                    {/* Left: Metadata & Identity */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          NODE #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="font-bold text-xs text-slate-200">
                          {srv.gpuName}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono">
                        <span>Age: <b className="text-slate-400">{srv.ageDays} operating days</b></span>
                        <span>Type: <b className="text-slate-400">{spec?.generation || 'N/A'}</b></span>
                        <span>Contributed: <b className="text-purple-400">
                          {srv.underMaintenance || srv.status === 'SHUTDOWN' || srv.isPoweredOff ? '0 TFLOPS (Offline)' : `${Math.round(spec ? spec.tflops * (srv.condition >= 80 ? 1.0 : srv.condition / 80) : 0)} TFLOPS`}
                        </b></span>
                      </div>
                    </div>

                    {/* Center: Condition Slider & Status */}
                    <div className="w-full md:w-64 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400 font-bold">Node health</span>
                        <span className="font-bold text-slate-300">{Math.round(srv.condition)}%</span>
                      </div>
                      
                      <div className="h-1.5 bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            srv.underMaintenance ? 'bg-purple-600' : srv.isPoweredOff ? 'bg-slate-600' : srv.status === 'SHUTDOWN' ? 'bg-slate-700' : srv.condition >= 80 ? 'bg-emerald-500' : srv.condition >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${srv.condition}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase font-mono leading-none ${getBadgeStyle(srv.status, srv.condition)}`}>
                          {srv.underMaintenance ? `🛠️ REPAIRING` : srv.isPoweredOff ? '🔌 POWERED OFF' : srv.status === 'SHUTDOWN' ? (srv.thermalShutdown ? '🚨 THERMAL HALTED' : '🛑 HALTED') : srv.status}
                        </span>
                        {srv.status !== 'SHUTDOWN' && srv.condition < 80 && !srv.underMaintenance && !srv.isPoweredOff && (
                          <span className="text-[8px] text-amber-500 font-mono animate-pulse">
                            ⚠️ -{Math.round(100 - (srv.condition >= 80 ? 100 : (srv.condition / 80) * 100))}% TFLOPS loss
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions Bench buttons */}
                    <div className="flex gap-2 w-full md:w-auto flex-wrap">
                      {/* Individual Power Switch */}
                      {!srv.underMaintenance && (
                        srv.isPoweredOff ? (
                          <button
                            onClick={() => togglePower(srv)}
                            className="flex-1 md:flex-none px-2 py-1 text-[9px] font-mono font-bold rounded border border-emerald-900 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Power on this node unit"
                          >
                            <Zap className="h-3 w-3" />
                            Power On
                          </button>
                        ) : (
                          <button
                            onClick={() => togglePower(srv)}
                            disabled={srv.status === 'SHUTDOWN'}
                            className={`flex-1 md:flex-none px-2 py-1 text-[9px] font-mono font-bold rounded border flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                              srv.status === 'SHUTDOWN'
                                ? 'border-slate-850 bg-slate-900 text-slate-600 cursor-not-allowed'
                                : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                            }`}
                            title="Power down this node unit safely"
                          >
                            <Zap className="h-3 w-3 text-slate-500" />
                            Power Down
                          </button>
                        )
                      )}

                      {/* Routine maintenance */}
                      {!srv.underMaintenance && !srv.isPoweredOff && (
                        <button
                          onClick={() => maintainServer(srv)}
                          disabled={srv.status === 'SHUTDOWN' || srv.condition >= 100}
                          className={`flex-1 md:flex-none px-2 py-1 text-[9px] font-mono font-bold rounded border flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            srv.status === 'SHUTDOWN' || srv.condition >= 100
                              ? 'border-slate-850 bg-slate-900 text-slate-600 cursor-not-allowed'
                              : 'border-cyan-900 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/40'
                          }`}
                          title="Service node filters and liquid coolants (+20 Condition)"
                        >
                          <Wrench className="h-3 w-3" />
                          Service ($500)
                        </button>
                      )}

                      {/* Complex repairs */}
                      {!srv.underMaintenance && (
                        <button
                          onClick={() => repairServer(srv)}
                          disabled={srv.condition >= 100 && srv.status !== 'SHUTDOWN'}
                          className={`flex-1 md:flex-none px-2 py-1 text-[9px] font-mono font-bold rounded border flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            srv.condition >= 100 && srv.status !== 'SHUTDOWN'
                              ? 'border-slate-850 bg-slate-900 text-slate-600 cursor-not-allowed'
                              : 'border-purple-900 bg-purple-950/20 text-purple-400 hover:bg-purple-950/40'
                          }`}
                          title="Replace damaged transistors (100% Condition)"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Repair (${repairCost.toLocaleString()})
                        </button>
                      )}

                      {/* Queue maintenance (Time delay) */}
                      {!srv.underMaintenance && !srv.isPoweredOff ? (
                        srv.condition < 100 && (
                          <button
                            onClick={() => queueMaintenance(srv)}
                            className="flex-1 md:flex-none px-2 py-1 text-[9px] font-mono font-bold rounded border border-amber-900/60 bg-amber-950/20 text-amber-400 hover:bg-amber-950/40 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title={`Queue repair: Cost $${(srv.condition < 50 || srv.status === 'SHUTDOWN' ? (1000 + Math.round(gpuCost * 0.10)) : (300 + Math.round(gpuCost * 0.05))).toLocaleString()}`}
                          >
                            <RefreshCw className="h-3 w-3 animate-spin-slow" />
                            Queue (${(srv.condition < 50 || srv.status === 'SHUTDOWN' ? 'Crit' : 'Maint')})
                          </button>
                        )
                      ) : srv.underMaintenance && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-950/30 text-purple-400 border border-purple-900/40 rounded text-[9px] font-mono font-bold select-none">
                          <RefreshCw className="h-3 w-3 animate-spin text-purple-400" />
                          IN QUEUE ({srv.maintenanceDaysRemaining}d)
                        </div>
                      )}

                      {/* Hot-Swap replacement */}
                      {!srv.underMaintenance && !srv.isPoweredOff && (
                        <button
                          onClick={() => replaceServer(srv)}
                          className="flex-1 md:flex-none px-2 py-1 text-[9px] font-mono font-bold rounded border border-slate-800 bg-slate-900 text-slate-350 hover:bg-slate-850 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Swap (${replacementCost.toLocaleString()})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {filteredServers.length > 50 && (
                <div className="text-center py-4 text-xs font-mono text-slate-500 bg-slate-950/50 rounded-lg border border-dashed border-slate-800 mt-2">
                  ••• Showing first 50 of {filteredServers.length.toLocaleString()} servers. •••
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Passive Hardware Upgrades Section */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm uppercase font-mono">
              <Cpu className="h-4 w-4 text-purple-400" />
              Hardware Passive Efficiency Upgrades
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Invest your R&D Research Points into state-of-the-art passive enhancements to permanently optimize thermodynamics, energy draws, or raw clock cycles.
            </p>
          </div>
          <div className="bg-purple-950/40 text-purple-300 border border-purple-900/60 rounded-xl px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0">
            <Lightbulb className="h-3.5 w-3.5 text-purple-400" />
            R&D Research Points: {state.researchPoints || 0} RP
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Upgrade 1: Liquid Cooling Systems */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between h-56 transition-all relative ${
            state.research?.unlockedLiquidCooling 
              ? 'bg-emerald-950/15 border-emerald-500/30' 
              : 'bg-slate-950/60 border-slate-850 hover:border-slate-800'
          }`}>
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-cyan-950/40 border border-cyan-900/50 rounded-lg text-cyan-400">
                  <Snowflake className="h-5 w-5" />
                </div>
                {state.research?.unlockedLiquidCooling ? (
                  <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                    INSTALLED
                  </span>
                ) : (
                  <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                    40 RP Cost
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-200">Liquid Cooling Systems</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  Replaces basic fan grids with closed-loop water chambers. Passively reduces overall cluster heat accumulation by <span className="text-[#00FF41] font-bold">30%</span>, protecting silicon from extreme thermal wear.
                </p>
              </div>
            </div>
            {!state.research?.unlockedLiquidCooling && (
              <button
                type="button"
                onClick={() => purchaseHardwareUpgrade('liquid_cooling')}
                disabled={(state.researchPoints || 0) < 40}
                className={`w-full py-2 text-xs font-bold rounded transition-colors cursor-pointer ${
                  (state.researchPoints || 0) >= 40
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed'
                }`}
              >
                Procure Upgrade (40 RP)
              </button>
            )}
          </div>

          {/* Upgrade 2: Overclocking Rigs */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between h-56 transition-all relative ${
            state.research?.unlockedOverclockingRigs 
              ? 'bg-amber-950/15 border-amber-500/30' 
              : 'bg-slate-950/60 border-slate-850 hover:border-slate-800'
          }`}>
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-amber-950/40 border border-amber-900/50 rounded-lg text-amber-400">
                  <Flame className="h-5 w-5" />
                </div>
                {state.research?.unlockedOverclockingRigs ? (
                  <span className="bg-amber-950/80 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                    ACTIVE
                  </span>
                ) : (
                  <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                    50 RP Cost
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-200">Overclocking Rigs</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  Modulates silicon power limiters and increases clock multiplier values. Boosts training speeds (TFLOPS) by <span className="text-cyan-400 font-bold">+25%</span>, but generates <span className="text-red-400 font-bold">+20%</span> more thermal load.
                </p>
              </div>
            </div>
            {!state.research?.unlockedOverclockingRigs && (
              <button
                type="button"
                onClick={() => purchaseHardwareUpgrade('overclock')}
                disabled={(state.researchPoints || 0) < 50}
                className={`w-full py-2 text-xs font-bold rounded transition-colors cursor-pointer ${
                  (state.researchPoints || 0) >= 50
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed'
                }`}
              >
                Procure Upgrade (50 RP)
              </button>
            )}
          </div>

          {/* Upgrade 3: Advanced Power Inverters */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between h-56 transition-all relative ${
            state.research?.unlockedAdvancedInverters 
              ? 'bg-purple-950/15 border-purple-500/30' 
              : 'bg-slate-950/60 border-slate-850 hover:border-slate-800'
          }`}>
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-purple-950/40 border border-purple-900/50 rounded-lg text-purple-400">
                  <Zap className="h-5 w-5" />
                </div>
                {state.research?.unlockedAdvancedInverters ? (
                  <span className="bg-purple-950/80 text-purple-300 border border-purple-900/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                    INSTALLED
                  </span>
                ) : (
                  <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                    45 RP Cost
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-200">Advanced Power Inverters</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  Integrates highly efficient solid-state capacitors and voltage filters. Passively cuts all core node electricity consumption and standby draw by <span className="text-[#00FF41] font-bold">20%</span>.
                </p>
              </div>
            </div>
            {!state.research?.unlockedAdvancedInverters && (
              <button
                type="button"
                onClick={() => purchaseHardwareUpgrade('power_inverters')}
                disabled={(state.researchPoints || 0) < 45}
                className={`w-full py-2 text-xs font-bold rounded transition-colors cursor-pointer ${
                  (state.researchPoints || 0) >= 45
                    ? 'bg-purple-600 hover:bg-purple-500 text-slate-950'
                    : 'bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed'
                }`}
              >
                Procure Upgrade (45 RP)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hardware Marketplace */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="font-bold text-slate-200 flex items-center justify-between gap-2 border-b border-slate-800 pb-3 text-sm">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            Compute Procurement Marketplace
          </div>
          {state.gpuShortageDaysRemaining && state.gpuShortageDaysRemaining > 0 && (
            <span className="bg-rose-950 text-rose-400 px-2 py-0.5 rounded text-[10px] font-mono border border-rose-900 animate-pulse">
              ⚠️ GLOBAL SUPPLY SHORTAGE: Prices elevated for {state.gpuShortageDaysRemaining} days
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GPUMARKETPLACE.map((gpu) => {
            const qty = state.gpusInstalled[gpu.id] || 0;
            const unlocked = isUnlocked(gpu.unlockedAtStage);
            let displayPrice = gpu.cost;
            const isCustom = (gpu as any).isCustom;
            if (!isCustom) {
              displayPrice = displayPrice * 1.5; // +50% import tariff
            }
            if (state.hqLocation.type === 'SHENZHEN') {
              displayPrice = displayPrice * 0.8; // 20% discount
            }
            if (state.gpuShortageMultiplier && state.gpuShortageMultiplier > 1) {
              displayPrice = Math.round(displayPrice * state.gpuShortageMultiplier);
            }

            return (
              <div
                key={gpu.id}
                className={`border rounded-xl p-4 flex flex-col justify-between h-64 transition-all relative ${
                  unlocked 
                    ? 'bg-slate-950/60 border-slate-850 hover:border-slate-700' 
                    : 'bg-slate-900/10 border-slate-900/60 opacity-60 overflow-hidden text-slate-500'
                }`}
              >
                {/* Active Lock overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-4 z-10 selection:bg-transparent">
                    <AlertTriangle className="h-6 w-6 text-amber-500 mb-1.5" />
                    <span className="font-bold text-xs uppercase text-slate-300">Operational Block</span>
                    <span className="text-[10px] text-slate-500 mt-1">Requires stage: <b className="text-cyan-500 font-mono">{gpu.unlockedAtStage}</b></span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{gpu.name}</h4>
                      <span className="text-[10px] font-mono text-slate-500 block">{gpu.generation}</span>
                    </div>
                    <span className="bg-purple-950/40 text-purple-400 border border-purple-900/40 px-2 py-0.5 rounded text-[10px] font-mono">
                      {qty} Units In Stock
                    </span>
                  </div>

                  {!isCustom && (
                    <span className="inline-block text-[9px] font-mono px-2 py-0.5 bg-rose-950/40 border border-rose-900/40 text-rose-400 rounded font-bold">
                      ⚠️ +50% Import Tariff Surcharge
                    </span>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div className="bg-slate-900 p-1.5 rounded border border-slate-850 text-center">
                      <span className="text-[9px] text-slate-400 block font-mono">Performance</span>
                      <span className="font-bold text-slate-200 font-mono">{gpu.tflops.toLocaleString()} TF</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded border border-slate-850 text-center">
                      <span className="text-[9px] text-slate-400 block font-mono">Power Draw</span>
                      <span className="font-bold text-slate-200 font-mono">{gpu.powerUsageKW} kW</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Unit Cost:</span>
                    <span className="font-mono font-bold text-base text-cyan-400">${Math.round(displayPrice).toLocaleString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={qty <= 0}
                      onClick={() => sellGPU(gpu)}
                      className={`w-1/3 py-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        qty > 0 
                          ? 'border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-950/40' 
                          : 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      Sell (60%)
                    </button>
                    <button
                      type="button"
                      onClick={() => buyGPU(gpu)}
                      className="w-2/3 py-2 text-xs font-bold rounded bg-gradient-to-r from-cyan-600 to-teal-600 text-slate-100 hover:opacity-95 shadow cursor-pointer"
                    >
                      Procure Unit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
