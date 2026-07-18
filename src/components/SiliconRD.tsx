import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Zap, 
  Flame, 
  Layers, 
  UserPlus, 
  Users, 
  Hammer, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  TrendingUp, 
  Layers3, 
  Info,
  DollarSign,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { GameState, Staff, GPUHardware, ChipProject } from '../types';
import { playSound } from '../utils/audio';
import { generateRandomStaff } from '../data';
import { syncServerInstances } from '../gameEngine';

interface SiliconRDProps {
  state: GameState;
  updateState: (fields: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'MARKET' | 'COMPETITOR' | 'EVENT' | 'MILESTONE') => void;
}

export default function SiliconRD({ state, updateState, addLogMessage }: SiliconRDProps) {
  const [chipName, setChipName] = useState('Centaur V1');
  const [nodeSize, setNodeSize] = useState<number>(5);
  const [designFocus, setDesignFocus] = useState<'TFLOPS' | 'EFFICIENCY' | 'HEAT_REDUCTION'>('TFLOPS');
  const [dieSize, setDieSize] = useState<number>(450); // default in sq mm
  const [recruiting, setRecruiting] = useState(false);

  const hardwareTeam = (state.staff || []).filter(s => s.role === 'HARDWARE_ENGINEER');
  const customChips = state.customChips || [];
  const activeProject = state.activeChipProject || null;

  // Compute stats of team
  const totalHardwareSkill = hardwareTeam.reduce((sum, s) => sum + s.skill * (s.morale / 100), 0);
  const avgHardwareSkill = hardwareTeam.length > 0 
    ? hardwareTeam.reduce((sum, s) => sum + s.skill, 0) / hardwareTeam.length
    : 0;

  // Calculate design costs & speculative specs based on input parameters
  const getNodeMultiplier = (node: number) => {
    if (node === 7) return 3.0;
    if (node === 5) return 4.5;
    if (node === 3) return 6.8;
    if (node === 2) return 9.5;
    if (node === 1.4) return 15.0;
    if (node === 1.0) return 25.0;
    if (node === 0.5) return 45.0;
    return 90.0; // 0.1nm
  };

  const getNodeEfficiency = (node: number) => {
    if (node === 7) return 1.4;
    if (node === 5) return 1.0;
    if (node === 3) return 0.7;
    if (node === 2) return 0.5;
    if (node === 1.4) return 0.35;
    if (node === 1.0) return 0.2;
    if (node === 0.5) return 0.1;
    return 0.02; // 0.1nm
  };

  const getNodeThermal = (node: number) => {
    if (node === 7) return 1.3;
    if (node === 5) return 1.0;
    if (node === 3) return 0.8;
    if (node === 2) return 0.65;
    if (node === 1.4) return 0.5;
    if (node === 1.0) return 0.35;
    if (node === 0.5) return 0.2;
    return 0.05; // 0.1nm
  };

  const getNodeWaferCost = (node: number) => {
    if (node === 7) return 8000;
    if (node === 5) return 14000;
    if (node === 3) return 25000;
    if (node === 2) return 48000;
    if (node === 1.4) return 90000;
    if (node === 1.0) return 180000;
    if (node === 0.5) return 400000;
    return 1000000; // 0.1nm
  };

  const getNodeBaseCost = (node: number) => {
    if (node === 7) return 1500;
    if (node === 5) return 3000;
    if (node === 3) return 6500;
    if (node === 2) return 14000;
    if (node === 1.4) return 30000;
    if (node === 1.0) return 70000;
    if (node === 0.5) return 180000;
    return 500000; // 0.1nm
  };

  const getTapeoutCost = (node: number) => {
    if (node === 7) return 80000;
    if (node === 5) return 180000;
    if (node === 3) return 450000;
    if (node === 2) return 1200000;
    if (node === 1.4) return 3500000;
    if (node === 1.0) return 12000000;
    if (node === 0.5) return 45000000;
    return 180000000; // 0.1nm
  };

  const getDesignResearchCost = (node: number) => {
    if (node === 7) return 15000;
    if (node === 5) return 30000;
    if (node === 3) return 75000;
    return 200000; // 2nm
  };

  // Spec calculations
  const specTflops = Math.round(getNodeMultiplier(nodeSize) * (dieSize / 10) * (designFocus === 'TFLOPS' ? 1.30 : 1.0));
  const specPower = Math.round((specTflops / 1200) * getNodeEfficiency(nodeSize) * (designFocus === 'EFFICIENCY' ? 0.65 : (designFocus === 'TFLOPS' ? 1.20 : 1.0)) * 100) / 100;
  const specHeat = Math.round((specTflops / 1500) * getNodeThermal(nodeSize) * (designFocus === 'HEAT_REDUCTION' ? 0.65 : (designFocus === 'TFLOPS' ? 1.20 : 1.0)) * 100) / 100;
  const specUnitCost = Math.round((getNodeWaferCost(nodeSize) * (dieSize / 400)) / 10 + getNodeBaseCost(nodeSize));

  // Hire Hardware Engineer
  const hireHardwareEngineer = () => {
    const cost = 22000; // standard job listing & agency cost
    if (state.cash < cost) {
      playSound('alert');
      addLogMessage(`❌ RECRUITMENT FAILED: Insufficient liquid cash to recruit hardware engineer ($${cost.toLocaleString()} required).`, 'SYSTEM');
      return;
    }

    setRecruiting(true);
    playSound('click');

    setTimeout(() => {
      const newEngineer = generateRandomStaff('HARDWARE_ENGINEER', 45);
      const updatedStaff = [...state.staff, newEngineer];

      updateState({
        cash: state.cash - cost,
        staff: updatedStaff
      });

      addLogMessage(`🎉 HARDWARE RECRUIT: Hired hardware specialist "${newEngineer.name}" with skill level ${newEngineer.skill} to lead custom silicon R&D!`, 'SYSTEM');
      playSound('success');
      setRecruiting(false);
    }, 600);
  };

  // Initiate custom chip project
  const initiateProject = () => {
    const setupCost = getDesignResearchCost(nodeSize);
    
    if (state.cash < setupCost) {
      playSound('alert');
      addLogMessage(`❌ DESIGN ABORTED: Insufficient cash to fund architectural tooling ($${setupCost.toLocaleString()} required).`, 'SYSTEM');
      return;
    }

    if (activeProject) {
      playSound('alert');
      addLogMessage('⚠️ R&D BLOCKED: An active silicon design pipeline is already running in your labs!', 'SYSTEM');
      return;
    }

    playSound('success');
    
    const newProject: ChipProject = {
      id: `chip_${nodeSize}nm_${Math.random().toString(36).substring(2, 6)}`,
      name: chipName,
      nodeSizeNM: nodeSize,
      designFocus: designFocus,
      dieSizeSqMM: dieSize,
      stage: 'DESIGN',
      progress: 0,
      status: 'ACTIVE',
      estimatedTflops: specTflops,
      estimatedPowerKW: specPower,
      estimatedHeatFactor: specHeat,
      unitCost: specUnitCost,
      totalDaysElapsed: 0,
      tapeoutFeePaid: false,
      bugResolved: false
    };

    updateState({
      cash: state.cash - setupCost,
      activeChipProject: newProject
    });

    addLogMessage(`⚙️ PROJECT INITIATED: Authorized silicon layout development for custom chip "${chipName}" on ${nodeSize}nm architecture!`, 'SYSTEM');
  };

  // Resolve design bug in verification stage
  const resolveVerificationBug = (useCash: boolean) => {
    if (!activeProject) return;

    if (useCash) {
      const bugCost = 35000;
      if (state.cash < bugCost) {
        playSound('alert');
        addLogMessage('❌ REPAIR BLOCKED: Insufficient cash to deploy automated silicon synthesis hotfixes.', 'SYSTEM');
        return;
      }
      playSound('success');
      updateState({
        cash: state.cash - bugCost,
        activeChipProject: {
          ...activeProject,
          status: 'ACTIVE',
          bugResolved: true
        }
      });
      addLogMessage(`🛠️ CHIP RESTORED: Paid $35,000 to implement standard hardware silicon logic patches. Verification resumed.`, 'SYSTEM');
    } else {
      const rpCost = 25;
      if (state.researchPoints < rpCost) {
        playSound('alert');
        addLogMessage('❌ REPAIR BLOCKED: Insufficient Research Points to re-simulate formal layout verification.', 'SYSTEM');
        return;
      }
      playSound('success');
      updateState({
        researchPoints: state.researchPoints - rpCost,
        activeChipProject: {
          ...activeProject,
          status: 'ACTIVE',
          bugResolved: true
        }
      });
      addLogMessage(`🔬 CHIP RESTORED: Spent 25 Research Points to run exhaustive formal logic re-verifications. Verification resumed.`, 'SYSTEM');
    }
  };

  // Pay tapeout mask-set fee
  const payTapeoutFee = () => {
    if (!activeProject) return;
    const fee = getTapeoutCost(activeProject.nodeSizeNM);

    if (state.cash < fee) {
      playSound('alert');
      addLogMessage(`❌ FOUNDRY DENIED: Insufficient cash to clear Taiwan/Korea mask-set production allocation fee ($${fee.toLocaleString()} required).`, 'SYSTEM');
      return;
    }

    playSound('success');
    updateState({
      cash: state.cash - fee,
      activeChipProject: {
        ...activeProject,
        tapeoutFeePaid: true
      }
    });
    addLogMessage(`🇹🇼 TAPEOUT ORDERED: Transmitted physical GDSII photomask tooling layout to advanced lithography fab. Prototyping wafer run has commenced!`, 'SYSTEM');
  };

  // Resolve validation critical failure
  const resolveValidationBug = () => {
    if (!activeProject) return;
    const patchCost = 60000;

    if (state.cash < patchCost) {
      playSound('alert');
      addLogMessage('❌ DEBUG DENIED: Insufficient capital to order a corrective stepper re-spin run.', 'SYSTEM');
      return;
    }

    playSound('success');
    updateState({
      cash: state.cash - patchCost,
      activeChipProject: {
        ...activeProject,
        status: 'ACTIVE',
        validationBugs: 'NONE' // fixed
      }
    });
    addLogMessage(`🛠️ PHYSICAL HOTFIX: Spent $60,000 to re-spin foundry photomask reticles. Silicon validated successfully with zero flaws!`, 'SYSTEM');
  };

  // Scrap Active project
  const [confirmScrap, setConfirmScrap] = useState(false);

  const scrapProject = () => {
    if (!activeProject) return;

    playSound('alert');
    updateState({
      activeChipProject: null
    });
    addLogMessage(`🗑️ R&D SCRAPPED: Forfeited design pipelines for chip project "${activeProject.name}".`, 'SYSTEM');
    setConfirmScrap(false);
  };

  // Buy custom silicon chips in bulk fabrication runs
  const orderFabricationRun = (chip: GPUHardware, qty: number) => {
    let price = chip.cost * qty;
    if (qty >= 100) {
      price = price * 0.85; // 15% bulk discount for wafer volumes!
    }

    if (state.cash < price) {
      playSound('alert');
      addLogMessage(`❌ FABRICATION DENIED: Insufficient liquid cash. Ordered run requires $${Math.round(price).toLocaleString()}.`, 'SYSTEM');
      return;
    }

    playSound('success');
    const currentQty = state.gpusInstalled[chip.id] || 0;
    const nextGpusInstalled = { ...state.gpusInstalled, [chip.id]: currentQty + qty };
    const nextCash = state.cash - price;

    // sync server instances array immediately
    const tempState = { ...state, gpusInstalled: nextGpusInstalled, cash: nextCash };
    const nextServerInstances = syncServerInstances(tempState);

    updateState({
      cash: nextCash,
      gpusInstalled: nextGpusInstalled,
      serverInstances: nextServerInstances
    });

    addLogMessage(`⚙️ WAFER DEPLOYED: Fabricated & installed ${qty}x custom "${chip.name}" silicon processors in the compute cluster!`, 'SYSTEM');
  };

  return (
    <div id="silicon_rd_module" className="space-y-4">
      
      {/* Title & Stats */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            Silicon R&D Department
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-normal">
            Bypass foreign GPU constraints by inventing in-house custom processors. Hire specialized chip designers, navigate verification risks, fund physical foundry tapeouts, and manufacture custom ASICs for a fraction of market prices.
          </p>
        </div>

        {/* Global Import Warning to push player to use Custom Silicon */}
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-3 max-w-xs flex items-start gap-2.5">
          <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-rose-300 block uppercase tracking-wider font-mono">FOREIGN IMPORT CRISIS</span>
            <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
              Standard GPU market prices are heavily taxed (+50% tariff penalty)! Designing in-house silicon yields massive computational sovereignty.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Staffing & Core Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Hardware Engineer Board */}
        <div className="md:col-span-2 bg-slate-950/80 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 font-mono">
              <Users className="h-4 w-4 text-purple-400" />
              Specialized Hardware Engineering Team
            </h3>
            
            {hardwareTeam.length === 0 ? (
              <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800/80 rounded-xl mt-3 flex flex-col items-center justify-center space-y-2">
                <Users className="h-8 w-8 text-slate-600" />
                <p className="text-xs">No Hardware Engineers actively employed.</p>
                <p className="text-[10px] text-slate-600">You cannot design, verify, or validate custom chips without specialized designers!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {hardwareTeam.map((eng) => (
                  <div key={eng.id} className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-3 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200">{eng.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-purple-950/40 border border-purple-800/30 rounded font-mono text-purple-300 font-bold">HW ENGINEER</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span>Skill: <b className="text-cyan-400">{eng.skill}</b></span>
                        <span>Morale: <b className="text-emerald-400">{eng.morale}%</b></span>
                        <span>Salary: <b>${eng.salary.toLocaleString()}/mo</b></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-900">
            <div className="text-[10px] text-slate-400 leading-snug">
              Listing fee: <span className="font-mono text-emerald-400 font-bold">$22,000</span> <br />
              Hardware salaries average <span className="text-slate-300">$13,500/mo</span>.
            </div>
            <button
              onClick={hireHardwareEngineer}
              disabled={recruiting}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-purple-500/10 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {recruiting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              Publish Silicon Job Board
            </button>
          </div>
        </div>

        {/* Core R&D Pipeline Metrics */}
        <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 font-mono">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Department Capabilities
            </h3>
            
            <div className="mt-4 space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Engineering Force:</span>
                <span className="font-mono font-bold text-slate-200">{hardwareTeam.length} Active Engineers</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Cumulative Skill Index:</span>
                <span className="font-mono font-bold text-cyan-400">{Math.round(totalHardwareSkill)} Points</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Silicon Validation Yield Rating:</span>
                <span className={`font-mono font-bold ${
                  avgHardwareSkill >= 75 ? 'text-emerald-400' : (avgHardwareSkill >= 50 ? 'text-amber-400' : 'text-rose-400')
                }`}>
                  {avgHardwareSkill >= 75 ? 'Elite (High Photomask Success)' : (avgHardwareSkill >= 50 ? 'Moderate (Yield Risk)' : 'Low (High Failure Rate)')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-3 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              Your cumulative skill index directly determines layout designing, logic verification, and physical hardware validation speeds. Keep engineers well paid and highly motivated!
            </p>
          </div>
        </div>
      </div>

      {/* Main Block: Architectural Pipeline (Active or Empty project creator) */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4">
        {!activeProject ? (
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 font-mono border-b border-slate-900 pb-3 mb-5">
              <Layers3 className="h-4.5 w-4.5 text-cyan-400" />
              Design & Conceptualize New Custom Chip Project
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Processor Microarchitecture Name</label>
                    <input
                      type="text"
                      value={chipName}
                      onChange={(e) => setChipName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500/50"
                      placeholder="e.g. Centaur V1"
                    />
                  </div>

                  {/* Design Focus */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Design Pipeline Primary Focus</label>
                    <select
                      value={designFocus}
                      onChange={(e) => setDesignFocus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                    >
                      <option value="TFLOPS">TFLOPS Maxima (+30% Compute Power)</option>
                      <option value="EFFICIENCY">Low-Power Efficiency (-35% Energy Usage)</option>
                      <option value="HEAT_REDUCTION">Thermal Heat Reduction (-35% Cooling Need)</option>
                    </select>
                  </div>
                </div>

                {/* Node Size Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Silicon Lithography Node Size</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                    {([7, 5, 3, 2, 1.4, 1.0, 0.5, 0.1]).map((node) => {
                      const active = nodeSize === node;
                      return (
                        <button
                          key={node}
                          onClick={() => setNodeSize(node)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            active
                              ? 'bg-cyan-950/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/5'
                              : 'bg-slate-900/60 border-slate-800/75 hover:bg-slate-900 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <span className="text-xs font-bold block">{node}nm</span>
                          <span className="text-[9px] text-slate-400 font-mono mt-1 font-semibold leading-tight">
                            {node === 7 && 'Legacy - Low Fee'}
                            {node === 5 && 'Enterprise'}
                            {node === 3 && 'State-Of-The-Art'}
                            {node === 2 && 'Exp. Quantum'}
                            {node === 1.4 && 'Angstrom Era'}
                            {node === 1.0 && 'Atomic Limits'}
                            {node === 0.5 && 'Sub-Atomic'}
                            {node === 0.1 && 'Picometer'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Die Size Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Target Die Size (Wafer Area)</span>
                    <span className="font-mono text-cyan-400">{dieSize} mm²</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={dieSize}
                    onChange={(e) => setDieSize(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-900 rounded-lg cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>100 mm² (High Wafer Yield, Low TFLOPS)</span>
                    <span>2000 mm² (Wafer-Scale, Ultra Compute)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Spec Predictions & Action Card */}
              <div className="lg:col-span-5 bg-slate-900/35 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono mb-3.5">
                    SPECULATIVE SILICON SPECIFICATION
                  </h4>

                  <div className="space-y-3 font-mono">
                    <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-850/40">
                      <span className="text-slate-400">Transistor Density Class:</span>
                      <span className="text-slate-200">{nodeSize}nm Photolithography</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-850/40">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                        Predicted Compute:
                      </span>
                      <span className="text-cyan-400 font-bold">{specTflops.toLocaleString()} TFLOPS</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-850/40">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        Estimated Power Draw:
                      </span>
                      <span className="text-amber-400 font-bold">{specPower} kW / unit</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-850/40">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-rose-400" />
                        Thermal Dissipation Surcharge:
                      </span>
                      <span className="text-rose-400 font-bold">x{specHeat} Multiplier</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Unit Fabrication Cost:</span>
                      <span className="text-emerald-400 font-bold">${specUnitCost.toLocaleString()} / unit</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-850/60">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Design Pipeline Fund Tooling Cost:</span>
                    <span className="font-mono font-bold text-white">${getDesignResearchCost(nodeSize).toLocaleString()}</span>
                  </div>

                  <button
                    onClick={initiateProject}
                    disabled={hardwareTeam.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-cyan-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Hammer className="h-4 w-4" />
                    Authorize Design Phase
                  </button>
                  {hardwareTeam.length === 0 && (
                    <p className="text-[10px] text-center text-rose-400 leading-normal">
                      ⚠️ Hire at least one Hardware Engineer to unlock silicon blueprint layouts.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Pipeline Progress UI */
          <div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                  Active Custom Silicon Pipeline: <span className="text-cyan-400">"{activeProject.name}"</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Node Size: <b className="text-slate-200">{activeProject.nodeSizeNM}nm</b> | Target spec: <b className="text-slate-200">{activeProject.estimatedTflops} TFLOPS</b> | Focus: <b className="text-slate-200">{activeProject.designFocus}</b>
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirmScrap) {
                    scrapProject();
                  } else {
                    setConfirmScrap(true);
                    setTimeout(() => setConfirmScrap(false), 3000);
                  }
                }}
                className={`text-[10px] uppercase font-mono px-3 py-1.5 rounded-xl cursor-pointer transition-all border ${
                  confirmScrap 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 font-bold shadow-[0_0_15px_rgba(225,29,72,0.5)]'
                    : 'bg-rose-950/30 hover:bg-rose-900/30 border-rose-900/50 text-rose-400'
                }`}
              >
                {confirmScrap ? 'ARE YOU SURE? (CLICK TO SCRAP)' : 'Scrap R&D Project'}
              </button>
            </div>

            {/* Pipeline Stage Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              {([
                { id: 'DESIGN', label: '1. Logical Design', desc: 'Synthesizing gate grids & register files.' },
                { id: 'VERIFICATION', label: '2. Verification', desc: 'Running exhaustive trace simulations.' },
                { id: 'TAPEOUT', label: '3. Foundry Tapeout', desc: 'Physical lithography wafer run.' },
                { id: 'VALIDATION', label: '4. Silicon Validation', desc: 'Post-silicon validation & testing.' }
              ] as const).map((s) => {
                const currentStage = activeProject.stage;
                const isCurrent = currentStage === s.id;
                const stagesOrdered = ['DESIGN', 'VERIFICATION', 'TAPEOUT', 'VALIDATION'];
                const currentIndex = stagesOrdered.indexOf(currentStage);
                const stageIndex = stagesOrdered.indexOf(s.id);
                const isCompleted = stageIndex < currentIndex;

                return (
                  <div
                    key={s.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-500/5'
                        : isCompleted
                        ? 'bg-slate-950/40 border-emerald-950/60 text-slate-500'
                        : 'bg-slate-950/20 border-slate-900 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isCurrent ? 'text-cyan-400' : isCompleted ? 'text-emerald-500' : 'text-slate-500'
                      }`}>
                        {s.label}
                      </span>
                      {isCompleted && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{s.desc}</p>
                    
                    {isCurrent && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1 font-mono">
                          <span>Progress:</span>
                          <span className="font-bold text-cyan-400">{Math.round(activeProject.progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${activeProject.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stage specific interaction callouts (high stakes bugs, payments, failures) */}
            <AnimatePresence mode="wait">
              {activeProject.stage === 'VERIFICATION' && activeProject.status === 'BUG_BLOCKED' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-amber-950/15 border border-amber-900/30 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-300">Pipeline Blocked: Trace Simulation Glitch</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal max-w-2xl">
                        Simulators flagged a timing-closure hazard on the custom chip's cache coherence bus. If uncorrected, this logic defect will result in a severely degraded silicon wafer yield. Choose how to handle the hotfix:
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => resolveVerificationBug(false)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      Formal Re-Verify (25 R&D Points)
                    </button>
                    <button
                      onClick={() => resolveVerificationBug(true)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      Deploy Logic Patch ($35,000)
                    </button>
                  </div>
                </motion.div>
              )}

              {activeProject.stage === 'TAPEOUT' && !activeProject.tapeoutFeePaid && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-cyan-950/10 border border-cyan-900/30 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <Cpu className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-cyan-300">Awaiting Photomask Mask-Set Tapeout Fee</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal max-w-2xl">
                        Design specs have been verified! To book the advanced extreme ultraviolet (EUV) photolithography lines in Taiwan or Korea for the mask-set, we must submit the tapeout fee allocation:
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <div className="text-right text-xs font-mono pr-2">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Tapeout Surcharge:</span>
                      <span className="text-white font-bold">${getTapeoutCost(activeProject.nodeSizeNM).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={payTapeoutFee}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Approve Foundry Tapeout
                    </button>
                  </div>
                </motion.div>
              )}

              {activeProject.stage === 'VALIDATION' && activeProject.status === 'BUG_BLOCKED' && activeProject.validationBugs === 'CRITICAL' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-rose-950/15 border border-rose-900/30 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-300">Post-Silicon Critical Logic Failure</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal max-w-2xl">
                        Disaster! The physical prototypes arrived with severe lithography line logic shorts. The chip suffers from complete thermal runaway and refuses to post-boot. We must spend capital to re-spin the stepper layouts and resolve the silicon bug:
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <button
                      onClick={resolveValidationBug}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Re-Spin Stepper photomasks ($60,000)
                    </button>
                  </div>
                </motion.div>
              )}

              {activeProject.stage === 'VALIDATION' && activeProject.status === 'ACTIVE' && activeProject.validationBugs === 'MINOR' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 border border-amber-900/20 rounded-xl p-3 flex items-start gap-2 text-[10px] text-slate-400 leading-normal"
                >
                  <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    <b className="text-amber-300">Minor Silicon Bug Flagged:</b> There is a minor substrate thermal leakage defect in this prototype batch. The processor is fully functional, but has a slight performance degradation of <b className="text-amber-300">-15% TFLOPS</b> in its final specs. Proceeding to validate anyway.
                  </p>
                </motion.div>
              )}

              {activeProject.status === 'ACTIVE' && activeProject.stage !== 'TAPEOUT' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-900/20 border border-slate-850 rounded-xl p-3 text-[10px] text-slate-400 leading-normal flex items-start gap-2"
                >
                  <Loader2 className="h-4 w-4 text-cyan-400 animate-spin shrink-0 mt-0.5" />
                  <p>
                    Your Hardware Engineers are actively working on this pipeline stage. Cumulative team skill accelerates R&D progress.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Manufactured Silicon Floor */}
      <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 font-mono border-b border-slate-900 pb-3 mb-5">
          <Hammer className="h-4.5 w-4.5 text-emerald-400" />
          Silicon Fabrication Plant (Manufacture Floor)
        </h3>

        {customChips.length === 0 ? (
          <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center space-y-2">
            <Cpu className="h-10 w-10 text-slate-600" />
            <p className="text-xs font-bold text-slate-400">No Custom Silicon Architectures Invented Yet</p>
            <p className="text-[10px] text-slate-600 max-w-md">
              Authorize a design project above, navigate it through design, verification, tapeout, and physical silicon validation to unlock your custom processor lines!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {customChips.map((chip) => {
              const installedCount = state.gpusInstalled[chip.id] || 0;
              return (
                <div
                  key={chip.id}
                  className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                >
                  
                  {/* Specs Summary */}
                  <div className="lg:col-span-4 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white">{chip.name}</h4>
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 rounded font-bold uppercase tracking-wider">
                        {chip.generation}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                      <span>Compute: <b className="text-cyan-400">{chip.tflops} TF</b></span>
                      <span>Draw: <b className="text-amber-400">{chip.powerUsageKW} kW</b></span>
                      <span>Thermal: <b className="text-rose-400">x{chip.heatOutputFactor}</b></span>
                    </div>
                  </div>

                  {/* Quantity Active Display */}
                  <div className="lg:col-span-3 text-left lg:text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">
                      ACTIVE UNITS IN CLUSTER
                    </span>
                    <span className="text-base font-black font-mono text-cyan-400">
                      {installedCount.toLocaleString()} units
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      Total Custom Compute: { (installedCount * chip.tflops).toLocaleString() } TFLOPS
                    </span>
                  </div>

                  {/* Ordering Options */}
                  <div className="lg:col-span-5 flex flex-wrap gap-2 justify-start lg:justify-end">
                    {[
                      { label: 'Fab x10', qty: 10, cost: chip.cost * 10 },
                      { label: 'Fab x50', qty: 50, cost: chip.cost * 50 },
                      { label: 'Wafer x100 (15% off)', qty: 100, cost: chip.cost * 100 * 0.85 },
                      { label: 'Volume x500 (15% off)', qty: 500, cost: chip.cost * 500 * 0.85 }
                    ].map((opt) => (
                      <button
                        key={opt.qty}
                        onClick={() => orderFabricationRun(chip, opt.qty)}
                        className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl transition-all hover:border-emerald-800/40 cursor-pointer text-left space-y-0.5"
                      >
                        <span className="text-[10px] font-bold text-slate-200 block">
                          {opt.label}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold block">
                          ${Math.round(opt.cost).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
