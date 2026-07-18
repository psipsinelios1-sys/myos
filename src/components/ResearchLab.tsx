import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Brain, Database, Play, Pause, RefreshCw, Zap, ShieldCheck, 
  Flame, Cpu, Award, Lock, BookOpen, Settings, GraduationCap, Network, CheckCircle, Info,
  TrendingUp, Coins, GitFork, ChevronRight, Terminal, Sliders, ShieldAlert, Layers, AlertTriangle,
  Swords, Activity
} from 'lucide-react';
import { GameState, ModelDraft, OngoingTraining, ArchitectureStyle, ModelDomain } from '../types';
import { playSound } from '../utils/audio';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

function CustomDropdown({ value, options, onChange }: { value: string, options: {value: string, label: string}[], onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-stone-900 border border-amber-900/40 hover:border-amber-500/50 rounded-lg py-2 px-3 flex justify-between items-center cursor-pointer transition-colors shadow-inner font-mono text-xs text-amber-100"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : value}
        </span>
        <ChevronRight className={`h-4 w-4 text-amber-500 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 top-full mt-2 left-0 w-full bg-stone-900 border border-amber-500/30 rounded-lg shadow-2xl overflow-hidden"
          >
            {options.map((opt) => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`py-2 px-3 text-xs font-mono cursor-pointer transition-colors flex items-center gap-2 ${value === opt.value ? 'bg-amber-950 text-amber-300 font-bold border-l-2 border-amber-500' : 'text-stone-400 hover:text-amber-100 hover:bg-stone-800'}`}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface TechNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  tier: 1 | 2 | 3 | 4 | 5;
  category: 'PARAMETERS' | 'CONTEXT' | 'DATASETS' | 'ARCHITECTURES';
  prereqs: string[];
  key: string;
  val: any;
  unlockText: string;
}

export const TECH_TREE: TechNode[] = [
  // --- TIER 1 ---
  {
    id: 'params30B',
    name: 'Scale Out: 30B Parameters',
    description: 'Optimize weight partitioning across GPU tensors to enable training models up to 30 Billion parameters.',
    cost: 120,
    tier: 1,
    category: 'PARAMETERS',
    prereqs: [],
    key: 'maxParamsB',
    val: 30,
    unlockText: 'Max Parameters Limit: 30B'
  },
  {
    id: 'context128k',
    name: 'Long Horizon: 128k Context',
    description: 'Compile specialized FlashAttention kernels to handle deep document lookups up to 128,000 sequence lengths.',
    cost: 25,
    tier: 1,
    category: 'CONTEXT',
    prereqs: [],
    key: 'maxContextTokens',
    val: 131072,
    unlockText: 'Max Context Window: 128k'
  },
  {
    id: 'dataset5T',
    name: 'Deep Dataset: 5T Tokens',
    description: 'Deploy distributed stream processors to coordinate dataset processing up to 5 Trillion tokens.',
    cost: 25,
    tier: 1,
    category: 'DATASETS',
    prereqs: [],
    key: 'maxDatasetTrillion',
    val: 5,
    unlockText: 'Max Training Dataset: 5T Tokens'
  },
  {
    id: 'flashAttention3',
    name: 'FlashAttention-3 Speedup',
    description: 'Pioneer hardware-aware attention modules, accelerating pre-training compute speeds by +20%.',
    cost: 45,
    tier: 1,
    category: 'ARCHITECTURES',
    prereqs: [],
    key: 'unlockedFlashAttention3',
    val: true,
    unlockText: 'Training speed +20% globally'
  },

  // --- TIER 2 ---
  {
    id: 'params70B',
    name: 'Frontier Medium: 70B Parameters',
    description: 'Apply layer pipelining architectures across nodes to compile networks up to 70 Billion weights.',
    cost: 250,
    tier: 2,
    category: 'PARAMETERS',
    prereqs: ['params30B'],
    key: 'maxParamsB',
    val: 70,
    unlockText: 'Max Parameters Limit: 70B'
  },
  {
    id: 'unlockedSSM',
    name: 'SSM Mamba Architecture',
    description: 'Pioneer State Space Model blocks with linear sequence time-scaling. Fits massive tokens into lightweight arrays.',
    cost: 75,
    tier: 2,
    category: 'ARCHITECTURES',
    prereqs: ['context128k'],
    key: 'unlockedSSM',
    val: true,
    unlockText: 'Unlocks SSM Mamba Neural Architecture'
  },
  {
    id: 'context262k',
    name: 'Vast Horizon: 256k Context',
    description: 'Implement distributed Ring Attention ring-buffers to coordinate up to 256,000 context windows.',
    cost: 55,
    tier: 2,
    category: 'CONTEXT',
    prereqs: ['context128k'],
    key: 'maxContextTokens',
    val: 262144,
    unlockText: 'Max Context Window: 256k'
  },
  {
    id: 'dataset15T',
    name: 'Gigantic Dataset: 15T Tokens',
    description: 'Integrate automated deduplication filters and deep internet scraping arrays for 15 Trillion tokens.',
    cost: 80,
    tier: 2,
    category: 'DATASETS',
    prereqs: ['dataset5T'],
    key: 'maxDatasetTrillion',
    val: 15,
    unlockText: 'Max Training Dataset: 15T Tokens'
  },
  {
    id: 'unlockedEpochs',
    name: 'Multi-Epoch Optimization',
    description: 'Over-train on high-quality indices with multi-epoch routing, granting massive benchmark score multipliers.',
    cost: 240,
    tier: 2,
    category: 'DATASETS',
    prereqs: ['dataset5T'],
    key: 'unlockedEpochs',
    val: 3,
    unlockText: 'Unlocks Multi-Epoch pretraining (Up to 3 Epochs)'
  },
  {
    id: 'speculativeDecoding',
    name: 'Speculative Decoding',
    description: 'Use a smaller model to speculate tokens, cutting active API inference latency and memory cost by 30%.',
    cost: 95,
    tier: 2,
    category: 'ARCHITECTURES',
    prereqs: ['params30B'],
    key: 'unlockedSpeculativeDecoding',
    val: true,
    unlockText: 'Reduces software product server maintenance costs by 15%'
  },

  // --- TIER 3 ---
  {
    id: 'params100B',
    name: 'Heavyweight: 100B Parameters',
    description: 'Assemble high-bandwidth 3D mesh tensor groups to scale dense parameters limits to 100 Billion weights.',
    cost: 580,
    tier: 3,
    category: 'PARAMETERS',
    prereqs: ['params70B'],
    key: 'maxParamsB',
    val: 100,
    unlockText: 'Max Parameters Limit: 100B'
  },
  {
    id: 'unlockedMoE',
    name: 'Mixture of Experts (MoE)',
    description: 'Pioneer sparse-gated neural clusters. Only activates optimal sub-networks, accelerating training speeds by +35%.',
    cost: 160,
    tier: 3,
    category: 'ARCHITECTURES',
    prereqs: ['params70B', 'unlockedSSM'],
    key: 'unlockedMoE',
    val: true,
    unlockText: 'Unlocks Sparse Mixture of Experts Style'
  },
  {
    id: 'context1M',
    name: 'Infinite Horizon: 1M Context',
    description: 'Scale Rotary Position Embeddings (RoPE) under ultra-dense weight intervals to digest 1,048,576 tokens.',
    cost: 180,
    tier: 3,
    category: 'CONTEXT',
    prereqs: ['context262k'],
    key: 'maxContextTokens',
    val: 1048576,
    unlockText: 'Max Context Window: 1M'
  },
  {
    id: 'dataset50T',
    name: 'Omnicognitive: 50T Tokens',
    description: 'Compile the complete text and multimedia historical logs of human-kind: 50 Trillion tokens.',
    cost: 450,
    tier: 3,
    category: 'DATASETS',
    prereqs: ['dataset15T'],
    key: 'maxDatasetTrillion',
    val: 50,
    unlockText: 'Max Training Dataset: 50T Tokens'
  },
  {
    id: 'dpo',
    name: 'Direct Preference Optimization',
    description: 'Skip RL reward modeling, directly optimizing weights on preference pairs. Halves alignment phase duration.',
    cost: 210,
    tier: 3,
    category: 'ARCHITECTURES',
    prereqs: ['unlockedEpochs'],
    key: 'unlockedDPO',
    val: true,
    unlockText: 'Alignment feedback speed doubled (+100%)'
  },
  {
    id: 'qualityFilters',
    name: 'Semantic Deduplication Filters',
    description: 'Build semantic embeddings classifiers to filter training inputs, removing legal copyright fines risk by 40%.',
    cost: 150,
    tier: 3,
    category: 'DATASETS',
    prereqs: ['dataset15T'],
    key: 'unlockedQualityFilters',
    val: true,
    unlockText: 'Scraping lawsuits probability reduced by 40%'
  },

  // --- TIER 4 ---
  {
    id: 'params405B',
    name: 'Supermassive: 405B Parameters',
    description: 'Pioneer global-scale weight orchestration across optical backplane switches to compile 405B weights.',
    cost: 1200,
    tier: 4,
    category: 'PARAMETERS',
    prereqs: ['params100B', 'unlockedMoE'],
    key: 'maxParamsB',
    val: 405,
    unlockText: 'Max Parameters Limit: 405B'
  },
  {
    id: 'params1T',
    name: 'Brain-Scale: 1 Trillion Parameters',
    description: 'Deploy ultra-massive sync lattices across cluster rings to pretrain up to 1,000 Billion parameters.',
    cost: 1900,
    tier: 4,
    category: 'PARAMETERS',
    prereqs: ['params405B'],
    key: 'maxParamsB',
    val: 1000,
    unlockText: 'Max Parameters Limit: 1T (1,000B)'
  },
  {
    id: 'context5M',
    name: 'Cosmic Horizon: 5M Context',
    description: 'Manage sequence representations using streaming sparse attention arrays up to 5,242,880 token limits.',
    cost: 380,
    tier: 4,
    category: 'CONTEXT',
    prereqs: ['context1M'],
    key: 'maxContextTokens',
    val: 5242880,
    unlockText: 'Max Context Window: 5M'
  },
  {
    id: 'dataset500T',
    name: 'Galactic Corpus: 500T Tokens',
    description: 'Ingest virtually all recorded human and machine data across multiple simulated domains.',
    cost: 2800,
    tier: 4,
    category: 'DATASETS',
    prereqs: ['dataset50T'],
    key: 'maxDatasetTrillion',
    val: 500,
    unlockText: 'Max Training Dataset: 500T Tokens'
  },
  {
    id: 'syntheticGen',
    name: 'High-Density Synthetic Generation',
    description: 'Use advanced generators to bootstrap synthetic datasets, boosting training speeds by +25% when scraped data runs dry.',
    cost: 340,
    tier: 4,
    category: 'DATASETS',
    prereqs: ['qualityFilters'],
    key: 'unlockedSyntheticGen',
    val: true,
    unlockText: 'Synthetic data training speed boost +25%'
  },
  {
    id: 'hbm4',
    name: 'HBM4 Memory Architecture',
    description: 'Unlock ultra-high bandwidth memory hardware layers, allowing training parameters to go beyond 1T.',
    cost: 650,
    tier: 4,
    category: 'PARAMETERS',
    prereqs: ['params405B'],
    key: 'unlockedHbm4',
    val: true,
    unlockText: 'Prerequisite for Tier 5 AGI parameters limits'
  },

  // --- TIER 5 (AGI TIER) ---
  {
    id: 'params3T',
    name: 'Multiverse Node: 3 Trillion Parameters',
    description: 'The ultimate theoretical boundary. Synchronize millions of clusters for a 3 Trillion weights singularity.',
    cost: 4500,
    tier: 5,
    category: 'PARAMETERS',
    prereqs: ['params1T', 'hbm4'],
    key: 'maxParamsB',
    val: 3000,
    unlockText: 'Max Parameters Limit: 3T (3,000B)'
  },
  {
    id: 'reasoningTokens',
    name: 'Reasoning Search Chains',
    description: 'Integrate post-training Monte Carlo tree-search reasoning. Massive quality boost to Reasoning and Math benchmarks.',
    cost: 2500,
    tier: 5,
    category: 'ARCHITECTURES',
    prereqs: ['dpo'],
    key: 'unlockedReasoningTokens',
    val: true,
    unlockText: 'Reasoning specialization models receive +25 quality ELO boost'
  },
  {
    id: 'dataConsortium',
    name: 'Global Licensing Contracts',
    description: 'Form legal data consortia with global publishers to secure clean, licensed tokens, eliminating lawsuits.',
    cost: 2200,
    tier: 5,
    category: 'DATASETS',
    prereqs: ['syntheticGen'],
    key: 'unlockedDataConsortium',
    val: true,
    unlockText: 'Scraping litigation legal risk set to 0%'
  },
  {
    id: 'liquidCooling',
    name: 'Liquid-Immersion Coolant',
    description: 'Install advanced dielectric coolant tanks to prevent GPU overheating even at maximum hardware workloads.',
    cost: 1800,
    tier: 5,
    category: 'CONTEXT',
    prereqs: ['context5M'],
    key: 'unlockedLiquidCooling',
    val: true,
    unlockText: 'Reduces server maintenance downtime probability by 80%'
  }
];

export function getMetricLabel(metric: string, domain?: string): string {
  if (domain === 'IMAGE_DIFFUSION') {
    switch (metric) {
      case 'mmlu': return 'FID Realism';
      case 'humanEval': return 'GenEval Prompt';
      case 'gsm8k': return 'HPSv2 Pref';
      case 'math': return 'Latency Speed';
      case 'gpqa': return 'Aesthetic Style';
      case 'sweBench': return 'Coherence Textures';
      case 'ifeval': return 'Multi-Subject';
      case 'arenaElo': return 'Image Arena ELO';
      default: return metric.toUpperCase();
    }
  }
  if (domain === 'VIDEO_GENERATION') {
    switch (metric) {
      case 'mmlu': return 'FVD Video Fidelity';
      case 'humanEval': return 'Temporal Consistency';
      case 'gsm8k': return 'Motion Smooth';
      case 'math': return 'Generation Speed';
      case 'gpqa': return '3D Physics';
      case 'sweBench': return 'Frame Stability';
      case 'ifeval': return 'Prompt-Video Align';
      case 'arenaElo': return 'Video Arena ELO';
      default: return metric.toUpperCase();
    }
  }
  switch (metric) {
    case 'mmlu': return 'MMLU';
    case 'humanEval': return 'HumanEval';
    case 'gsm8k': return 'GSM8K';
    case 'math': return 'MATH';
    case 'gpqa': return 'GPQA';
    case 'sweBench': return 'SWE-bench';
    case 'ifeval': return 'IFEval';
    case 'arenaElo': return 'Arena ELO';
    default: return metric.toUpperCase();
  }
}

export function getMetricShortLabel(metric: string, domain?: string): string {
  if (domain === 'IMAGE_DIFFUSION') {
    switch (metric) {
      case 'mmlu': return 'FID';
      case 'humanEval': return 'GEN.EV';
      case 'gsm8k': return 'HPSV2';
      case 'math': return 'LAT.';
      case 'gpqa': return 'AESTH.';
      case 'sweBench': return 'SPATIAL';
      case 'ifeval': return 'LAY.';
      case 'arenaElo': return 'IMG.ELO';
    }
  }
  if (domain === 'VIDEO_GENERATION') {
    switch (metric) {
      case 'mmlu': return 'FVD';
      case 'humanEval': return 'TEMP.';
      case 'gsm8k': return 'MOTION';
      case 'math': return 'FPS';
      case 'gpqa': return 'PHYS.';
      case 'sweBench': return 'FR.STAB';
      case 'ifeval': return 'ALIGN';
      case 'arenaElo': return 'VID.ELO';
    }
  }
  switch (metric) {
    case 'mmlu': return 'MMLU';
    case 'humanEval': return 'H.EVAL';
    case 'gsm8k': return 'GSM8K';
    case 'math': return 'MATH';
    case 'gpqa': return 'GPQA';
    case 'sweBench': return 'SWE';
    case 'ifeval': return 'IFEv';
    case 'arenaElo': return 'ELO';
    default: return metric.toUpperCase();
  }
}

const SCRAPING_STRATEGIES = [
  { value: 'CLEAN', label: '🛡️ Clean compliance crawl', desc: 'Strict robot.txt compliance. Safe, standard licensing alignment, +0% Lawsuit Risk.' },
  { value: 'AGGRESSIVE', label: '⚡ Aggressive High-Volume Crawl', desc: 'Ignore non-commercial blocks. +25% dataset yield, +30% Lawsuit Risk.' },
  { value: 'SHADOW', label: '💀 Shadow Archive Scrape (Unsanctioned)', desc: 'Scrape paywalled archives and dark repository hubs. +50% dataset yield, +65% Lawsuit Risk, but model starts with -20% Safety Alignment.' }
] as const;

interface ResearchLabProps {
  state: GameState;
  updateState: (newState: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'EVENT' | 'MILESTONE' | 'MARKET') => void;
}

export default function ResearchLab({ state, updateState, addLogMessage }: ResearchLabProps) {
  const [activeSector, setActiveSector] = useState<'S01' | 'S02' | 'S03' | 'S04' | 'S05'>('S01');

  // Redesigned upgrades tree states
  const [selectedTechId, setSelectedTechId] = useState<string>('params30B');
  const [techFilter, setTechFilter] = useState<'ALL' | 'PARAMETERS' | 'CONTEXT' | 'DATASETS' | 'ARCHITECTURES'>('ALL');

  // New features states
  const [scrapingStrategy, setScrapingStrategy] = useState<'CLEAN' | 'AGGRESSIVE' | 'SHADOW'>('CLEAN');
  const [arenaModelId, setArenaModelId] = useState<string>('');
  const [arenaCompetitorId, setArenaCompetitorId] = useState<string>('');
  const [isSimulatingArena, setIsSimulatingArena] = useState(false);
  const [arenaWinner, setArenaWinner] = useState<'PLAYER' | 'COMPETITOR' | null>(null);
  const [arenaLogs, setArenaLogs] = useState<string[]>([]);
  const [arenaWinRate, setArenaWinRate] = useState<number | null>(null);
  const [arenaTrainedRewards, setArenaTrainedRewards] = useState<string[]>([]);

  // Architectural design states
  const [modelName, setModelName] = useState('DeepNova 8B');
  const [architecture, setArchitecture] = useState<ArchitectureStyle>('TRANSFORMER');
  const [parameters, setParameters] = useState(8); 
  const [contextWindow, setContextWindow] = useState(32768); 
  const [datasetSize, setDatasetSize] = useState(2); 
  const [specialization, setSpecialization] = useState<'GENERAL' | 'CODING' | 'REASONING' | 'MULTIMODAL_ROBOTICS' | 'MEDICAL'>('GENERAL');
  const [epochs, setEpochs] = useState(1); 
  const [domain, setDomain] = useState<ModelDomain>('TEXT_LLM');

  // Dataset Mix auto-balancing state. WebScraping, Synthetic, Licensed
  const [scraping, setScraping] = useState(60);
  const [synthetic, setSynthetic] = useState(30);
  const [licensed, setLicensed] = useState(10);

  // Manual benchmarking states
  const [selectedModelIdForBench, setSelectedModelIdForBench] = useState<string | null>(null);
  const [evaluatingModelId, setEvaluatingModelId] = useState<string | null>(null);
  const [evaluatingMetric, setEvaluatingMetric] = useState<string | null>(null);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [evaluationLogs, setEvaluationLogs] = useState<string[]>([]);

  // Auto-select first model for benchmarks and arena if none is selected
  useEffect(() => {
    if (state.trainedModels.length > 0) {
      if (!selectedModelIdForBench) {
        setSelectedModelIdForBench(state.trainedModels[0].id);
      }
      if (!arenaModelId) {
        setArenaModelId(state.trainedModels[0].id);
      }
    }
  }, [state.trainedModels, selectedModelIdForBench, arenaModelId]);

  // Set default competitor if none selected
  useEffect(() => {
    if (state.competitors && state.competitors.length > 0 && !arenaCompetitorId) {
      setArenaCompetitorId(state.competitors[0].id);
    }
  }, [state.competitors, arenaCompetitorId]);

  // Difficulty multiplier for research points costs
  const getUpgradeCost = (baseCost: number) => {
    const mult = state.difficultyLevel === 'EXPERT' ? 2.2 : state.difficultyLevel === 'HARD' ? 1.5 : 1.0;
    return Math.round(baseCost * mult);
  };

  // Launch training
  const beginModelTraining = () => {
    if (state.training) return;

    let totalGpus = Object.values(state.gpusInstalled).reduce((sum, qty) => sum + qty, 0);
    if (totalGpus === 0) {
      addLogMessage('❌ TRAINING FAILED: No GPUs installed in compute cluster. Browse Compute Grid tab.', 'SYSTEM');
      return;
    }

    const scientists = state.staff.filter(s => s.role === 'RESEARCH_SCIENTIST');
    if (scientists.length === 0) {
      addLogMessage('❌ TRAINING FAILED: Neural architectures require at least 1 Research Scientist in active staff.', 'SYSTEM');
      return;
    }

    // Adjust cost and safety based on Strategy selection
    let costMult = 1.0;
    let baseAlignment = 80;
    if (scrapingStrategy === 'AGGRESSIVE') {
      costMult = 0.8; 
      baseAlignment = 70;
    } else if (scrapingStrategy === 'SHADOW') {
      costMult = 0.5; 
      baseAlignment = 50;
    }

    const licenseCost = Math.round((licensed / 10) * datasetSize * 15000 * costMult);
    if (state.cash < licenseCost) {
      addLogMessage(`❌ TRAINING FAILED: Insufficient funds for licensed data. Requires: $${licenseCost.toLocaleString()}.`, 'SYSTEM');
      return;
    }

    const draft: ModelDraft = {
      name: modelName,
      architecture,
      parametersCountB: parameters,
      contextWindowTokens: contextWindow,
      datasetSizeTrillionTokens: datasetSize,
      datasetMix: {
        webScraping: scraping,
        synthetic: synthetic,
        licensed: licensed,
      },
      specialization,
      epochs,
      domain,
    };

    const initialTraining: OngoingTraining = {
      modelDraft: draft,
      startedOnDate: state.currentDate,
      progressPercentage: 0,
      currentLoss: 8.5,
      lossHistory: [8.5],
      tokensProcessedTrillion: 0,
      tflopsRate: 0,
      learningRate: 0.001,
      alignmentRating: baseAlignment,
      isPaused: false,
      expectedDaysLeft: 30,
      explodingGradientRisk: 5,
      accumulatedCost: licenseCost,
    };

    updateState({
      training: initialTraining,
      cash: state.cash - licenseCost,
    });

    addLogMessage(`⚡ TRAINING ACTIVATED: Launched pipeline for "${draft.name}" under ${scrapingStrategy} strategy. Licensing fee: -$${licenseCost.toLocaleString()}`, 'SYSTEM');
    
    // Switch view to S01 training console
    setActiveSector('S01');
  };

  const togglePause = () => {
    if (!state.training) return;
    updateState({
      training: {
        ...state.training,
        isPaused: !state.training.isPaused,
      }
    });
    addLogMessage(`⚙️ TRAINING PIPELINE: Training on ${state.training.modelDraft.name} ${state.training.isPaused ? 'RESUMED' : 'PAUSED'}.`, 'SYSTEM');
  };

  const scrapeTraining = () => {
    if (!state.training) return;
    updateState({ training: null });
    addLogMessage(`⚠️ PIPELINE ABANDONED: Scraped active training on ${state.training.modelDraft.name}.`, 'SYSTEM');
  };

  // Tech Tree Helpers
  const isProjectUnlocked = (techId: string) => {
    if (state.research?.completedProjects?.includes(techId)) return true;
    const tech = TECH_TREE.find(t => t.id === techId);
    if (!tech) return false;
    
    // Fallback checks for old save compatibility
    if (tech.key === 'maxParamsB') return (state.research?.maxParamsB || 8) >= tech.val;
    if (tech.key === 'maxContextTokens') return (state.research?.maxContextTokens || 32768) >= tech.val;
    if (tech.key === 'maxDatasetTrillion') return (state.research?.maxDatasetTrillion || 2) >= tech.val;
    if (tech.key === 'unlockedMoE') return !!state.research?.unlockedMoE;
    if (tech.key === 'unlockedSSM') return !!state.research?.unlockedSSM;
    if (tech.key === 'unlockedEpochs') return (state.research?.unlockedEpochs || 1) >= 3;
    
    return false;
  };

  const canUnlockProject = (techId: string) => {
    const tech = TECH_TREE.find(t => t.id === techId);
    if (!tech) return false;
    if (tech.prereqs.length === 0) return true;
    return tech.prereqs.every(prereqId => isProjectUnlocked(prereqId));
  };

  const handlePurchaseTreeProject = (tech: TechNode) => {
    const costAfterMult = getUpgradeCost(tech.cost);
    if ((state.researchPoints || 0) < costAfterMult) return;
    if (isProjectUnlocked(tech.id)) return;
    if (!canUnlockProject(tech.id)) return;

    const initialResearch = state.research || {
      maxParamsB: 8,
      maxContextTokens: 32768,
      maxDatasetTrillion: 2,
      unlockedMoE: false,
      unlockedSSM: false,
      unlockedPrecisionFP8: false,
      unlockedEpochs: 1,
      completedProjects: [],
    };

    const updatedResearch = {
      ...initialResearch,
      [tech.key]: tech.val,
      completedProjects: [...(initialResearch.completedProjects || []), tech.id]
    } as any;

    playSound('upgrade');
    updateState({
      researchPoints: (state.researchPoints || 0) - costAfterMult,
      research: updatedResearch,
    });

    addLogMessage(`🔬 R&D BREAKTHROUGH: Spending research matrix coordinates to deploy "${tech.name}".`, 'MILESTONE');
  };

  const handleCashToPoints = (baseCashCost: number, pointsYield: number, name: string) => {
    const costMultiplier = Math.pow(1.05, state.acceleratorPurchases || 0);
    const actualCashCost = Math.round(baseCashCost * costMultiplier);
    
    if (state.cash < actualCashCost) return;

    let finalYield = pointsYield;
    if (state.activeOrigin === 'GARAGE_HACKER') {
      finalYield = Math.round(finalYield * 1.5);
    }

    playSound('success');
    updateState({
      cash: state.cash - actualCashCost,
      researchPoints: (state.researchPoints || 0) + finalYield,
      acceleratorPurchases: (state.acceleratorPurchases || 0) + 1
    });

    addLogMessage(`💰 RESEARCH FUNDING: Transferred $${actualCashCost.toLocaleString()} to procure specialized compute accelerator cells (+${finalYield} pts)`, 'EVENT');
  };

  const triggerBenchmarkTest = (modelId: string, metric: 'mmlu' | 'humanEval' | 'gsm8k' | 'math' | 'gpqa' | 'sweBench' | 'ifeval' | 'arenaElo') => {
    if (evaluatingModelId) return;

    const model = state.trainedModels.find(m => m.id === modelId);
    if (!model) return;

    playSound('laser');
    setEvaluatingModelId(modelId);
    setEvaluatingMetric(metric);
    setEvaluationProgress(0);
    const metricLabel = getMetricLabel(metric, model.domain);
    
    setEvaluationLogs([
      `[SYS] Initializing evaluation pipeline for metric: ${metricLabel}`,
      `[SYS] Spin-up of model parameters cluster complete.`
    ]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setEvaluationProgress(Math.min(100, progress));

      if (progress === 30) {
        setEvaluationLogs(prev => [...prev, `[EVAL] Ingesting validation batches from certified dataset pools...`]);
      } else if (progress === 60) {
        setEvaluationLogs(prev => [...prev, `[EVAL] Scoring model output coherence, perplexity, and precision...`]);
      } else if (progress >= 100) {
        clearInterval(interval);
        playSound('success');
        
        const updatedModels = state.trainedModels.map(m => {
          if (m.id === modelId) {
            const currentStatus = m.benchmarkStatus || {
              mmlu: 'UNTESTED', humanEval: 'UNTESTED', gsm8k: 'UNTESTED', math: 'UNTESTED',
              gpqa: 'UNTESTED', sweBench: 'UNTESTED', ifeval: 'UNTESTED', arenaElo: 'UNTESTED',
            };
            return {
              ...m,
              benchmarkStatus: { ...currentStatus, [metric]: 'VERIFIED' as const }
            };
          }
          return m;
        });

        let finalScore = model.benchmarks[metric];
        if (model.flaws) {
          model.flaws.forEach(flaw => {
            if (!flaw.isFixed && flaw.metricImpacted === metric) {
              finalScore *= (1 - flaw.penaltyPct / 100);
            }
          });
        }
        
        addLogMessage(`🚀 BENCHMARK COMPLETE: "${model.name}" scored ${finalScore.toFixed(1)}% on ${metricLabel}.`, 'MILESTONE');
        
        updateState({ trainedModels: updatedModels });
        setEvaluationLogs(prev => [
          ...prev, 
          `[SUCCESS] Test sequence finalized.`,
          `[RESULT] Certified Score: ${finalScore.toFixed(1)}%`
        ]);

        setTimeout(() => {
          setEvaluatingModelId(null);
          setEvaluatingMetric(null);
        }, 1500);
      }
    }, 100);
  };

  const triggerAllBenchmarksTest = (modelId: string) => {
    if (evaluatingModelId) return;
    const model = state.trainedModels.find(m => m.id === modelId);
    if (!model) return;

    playSound('laser');
    setEvaluatingModelId(modelId);
    setEvaluatingMetric('ALL METRICS');
    setEvaluationProgress(0);
    setEvaluationLogs([
      `[SYS] Spin-up of testing clusters for all remaining benchmarks...`
    ]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      setEvaluationProgress(Math.min(100, progress));

      if (progress >= 100) {
        clearInterval(interval);
        playSound('success');
        
        const updatedModels = state.trainedModels.map(m => {
          if (m.id === modelId) {
            return {
              ...m,
              benchmarkStatus: {
                mmlu: 'VERIFIED' as const, humanEval: 'VERIFIED' as const, gsm8k: 'VERIFIED' as const, math: 'VERIFIED' as const,
                gpqa: 'VERIFIED' as const, sweBench: 'VERIFIED' as const, ifeval: 'VERIFIED' as const, arenaElo: 'VERIFIED' as const,
              }
            };
          }
          return m;
        });

        updateState({ trainedModels: updatedModels });
        addLogMessage(`🚀 BATCH BENCHMARKS: Verified all benchmarks on "${model.name}".`, 'MILESTONE');
        setEvaluationLogs(prev => [...prev, `[SUCCESS] Batch validation sequence finalized successfully.`]);

        setTimeout(() => {
          setEvaluatingModelId(null);
          setEvaluatingMetric(null);
        }, 1500);
      }
    }, 100);
  };

  const applyModelFix = (modelId: string, flawId: string) => {
    const model = state.trainedModels.find(m => m.id === modelId);
    if (!model || !model.flaws) return;
    const flaw = model.flaws.find(f => f.id === flawId);
    if (!flaw || flaw.isFixed) return;

    if ((state.researchPoints || 0) < flaw.remedyCostPoints || state.cash < flaw.remedyCostCash) {
      playSound('alert');
      return;
    }

    playSound('success');
    const updatedModels = state.trainedModels.map(m => {
      if (m.id === modelId && m.flaws) {
        return {
          ...m,
          flaws: m.flaws.map(f => f.id === flawId ? { ...f, isFixed: true } : f)
        };
      }
      return m;
    });

    updateState({
      researchPoints: (state.researchPoints || 0) - flaw.remedyCostPoints,
      cash: state.cash - flaw.remedyCostCash,
      trainedModels: updatedModels
    });

    addLogMessage(`🔧 WEIGHT HOTFIX DEPLOYED: Removed penalty from weight anomaly [${flaw.name}] on "${model.name}".`, 'MILESTONE');
  };

  const handleSetAlignmentBudget = (modelId: string, budget: number) => {
    const updatedModels = state.trainedModels.map(m => {
      if (m.id === modelId) {
        return { ...m, alignmentBudget: budget };
      }
      return m;
    });
    updateState({ trainedModels: updatedModels });
    addLogMessage(`🎯 ALIGNMENT CONFIG: Daily budget set to $${budget.toLocaleString()}/day.`, 'SYSTEM');
  };

  const formatParams = (params: number) => {
    if (params >= 1000) return `${(params / 1000).toFixed(1)}T`;
    return `${params}B`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1048576) return `${(tokens / 1048576).toFixed(1)}M`;
    return `${(tokens / 1024).toFixed(0)}k`;
  };

  const handleMixChange = (type: 'SCRAPE' | 'SYNTH' | 'LICENSE', value: number) => {
    const val = Math.max(0, Math.min(100, value));
    if (type === 'SCRAPE') {
      const remaining = 100 - val;
      const totalOthers = synthetic + licensed || 1;
      setScraping(val);
      setSynthetic(Math.round((synthetic / totalOthers) * remaining));
      setLicensed(Math.round((licensed / totalOthers) * remaining));
    } else if (type === 'SYNTH') {
      const remaining = 100 - val;
      const totalOthers = scraping + licensed || 1;
      setSynthetic(val);
      setScraping(Math.round((scraping / totalOthers) * remaining));
      setLicensed(Math.round((licensed / totalOthers) * remaining));
    } else if (type === 'LICENSE') {
      const remaining = 100 - val;
      const totalOthers = scraping + synthetic || 1;
      setLicensed(val);
      setScraping(Math.round((scraping / totalOthers) * remaining));
      setSynthetic(Math.round((synthetic / totalOthers) * remaining));
    }
  };

  // Keep sum exactly 100
  useEffect(() => {
    const total = scraping + synthetic + licensed;
    if (total !== 100) {
      const diff = 100 - total;
      setScraping(Math.max(0, scraping + diff));
    }
  }, [scraping, synthetic, licensed]);

  // Keep sliders clamped to research ceilings
  useEffect(() => {
    const maxP = state.research?.maxParamsB || 8;
    if (parameters > maxP) setParameters(maxP);

    const maxC = state.research?.maxContextTokens || 32768;
    if (contextWindow > maxC) setContextWindow(maxC);

    const maxD = state.research?.maxDatasetTrillion || 2;
    if (datasetSize > maxD) setDatasetSize(maxD);
  }, [state.research]);

  // Arena Simulator Logic
  const startArenaBattle = () => {
    if (isSimulatingArena || !arenaModelId || !arenaCompetitorId) return;

    const userModel = state.trainedModels.find(m => m.id === arenaModelId);
    const competitor = state.competitors.find(c => c.id === arenaCompetitorId);
    if (!userModel || !competitor) return;

    setIsSimulatingArena(true);
    setArenaWinner(null);
    setArenaLogs([]);
    playSound('laser');

    const diff = userModel.qualityScore - competitor.leadModelScore;
    const winRate = Math.max(5, Math.min(95, Math.round(50 + diff * 2.8)));
    setArenaWinRate(winRate);

    const battlePrompts = [
      { q: "Create a multithreaded database indexer", weight: 0.35 },
      { q: "Synthesize spatial coordinates for active robotics telemetry", weight: 0.3 },
      { q: "Answer complex logic chain math checks", weight: 0.35 }
    ];

    let currentLog = ["⚙️ Spin up LMSYS diagnostics node... Allocating sandboxed test weights.", `📊 Competitor Average: ${competitor.leadModelScore}% • Your Model: ${userModel.qualityScore}%` ];
    setArenaLogs(currentLog);

    let round = 0;
    let userWins = 0;

    const runRound = () => {
      if (round < battlePrompts.length) {
        const bp = battlePrompts[round];
        const playerRoll = Math.random() * 100 < winRate;
        
        setTimeout(() => {
          currentLog = [...currentLog, `[ROUND ${round + 1}] Evaluating Prompt: "${bp.q}"` ];
          setArenaLogs(currentLog);
          playSound('click');

          setTimeout(() => {
            if (playerRoll) {
              userWins++;
              currentLog = [
                ...currentLog, 
                `↳ ${userModel.name} Response: Validated semantic context, high accuracy, optimal latency.`,
                `↳ ${competitor.name} Response: Slight degradation in edge case logic patterns.`,
                `🔥 Round winner: ${userModel.name}!`
              ];
            } else {
              currentLog = [
                ...currentLog, 
                `↳ ${competitor.name} Response: Impeccably tuned response matrices, flawless logic layout.`,
                `↳ ${userModel.name} Response: Slight loss of coherence in temporal weights.`,
                `💀 Round winner: ${competitor.name}!`
              ];
            }
            setArenaLogs(currentLog);
            playSound(playerRoll ? 'success' : 'alert');
            round++;
            runRound();
          }, 1200);
        }, 800);
      } else {
        setTimeout(() => {
          const finalWinner = userWins >= 2 ? 'PLAYER' : 'COMPETITOR';
          setArenaWinner(finalWinner);
          setIsSimulatingArena(false);

          if (finalWinner === 'PLAYER') {
            playSound('success');
            currentLog = [...currentLog, `🏆 ARENA VICTORY: ${userModel.name} defeated ${competitor.name}! Total win percentage: ${winRate}%` ];
            
            if (!arenaTrainedRewards.includes(userModel.id)) {
              setArenaTrainedRewards(prev => [...prev, userModel.id]);
              updateState({
                researchPoints: (state.researchPoints || 0) + 15,
                socialFollowers: state.socialFollowers + 8000
              });
              addLogMessage(`🌟 ARENA DECK CHAMPION: "${userModel.name}" won the LMSYS battle. Rep boosts unlocked: +15 R&D Points, +8k Followers!`, 'MILESTONE');
              currentLog = [...currentLog, `🎁 REWARD SECURED: +15 Research Points & +8,000 Social Media followers injected!`];
            } else {
              currentLog = [...currentLog, `ℹ️ Reward already claimed for this model's architectural blueprint.`];
            }
          } else {
            playSound('alert');
            currentLog = [...currentLog, `❌ ARENA DEFEAT: ${competitor.name} outperformed ${userModel.name}. Optimize layers, parameters, or patch anomalies.` ];
          }
          setArenaLogs(currentLog);
        }, 1000);
      }
    };

    setTimeout(() => {
      runRound();
    }, 1000);
  };

  const renderLossCurve = (history: number[]) => {
    if (history.length < 2) {
      return (
        <div className="h-[140px] w-full rounded-xl bg-stone-950 flex flex-col items-center justify-center text-amber-600/70 text-xs border border-amber-900/20 font-mono">
          <RefreshCw className="h-5 w-5 animate-spin mb-1 text-amber-500" />
          Synchronizing validation clusters...
        </div>
      );
    }
    const width = 450;
    const height = 140;
    const padding = 20;
    const minLoss = 1.0;
    const maxLoss = 9.0;

    const points = history.map((val, idx) => {
      const x = padding + (idx / (history.length - 1)) * (width - padding * 2);
      const ratio = (val - minLoss) / (maxLoss - minLoss);
      const y = height - padding - ratio * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[140px] bg-stone-950 rounded-xl border border-amber-900/30 p-2">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#443015" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#443015" strokeWidth="1" />
          <line 
            x1={padding} 
            y1={height - padding - 0.05 * (height - padding * 2)} 
            x2={width - padding} 
            y2={height - padding - 0.05 * (height - padding * 2)} 
            stroke="#f59e0b" 
            strokeWidth="1" 
            strokeDasharray="3,3" 
            className="opacity-40"
          />
          <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  };

  const getSpecializationDescription = (spec: string) => {
    switch (spec) {
      case 'GENERAL': return 'Optimized for average conversational tasks, MMLU general intelligence benchmarks, and versatile queries.';
      case 'CODING': return 'Heavy emphasis on logical syntax tree optimization. Greatly buffs HumanEval and code debugging.';
      case 'REASONING': return 'Tuned for continuous thought chain reasoning. Massive boost on GSM8K and medical datasets.';
      case 'MULTIMODAL_ROBOTICS': return 'Processes sensory coordinate data. Synergizes with spatial actuators and agents.';
      case 'MEDICAL': return 'Specialized on bioinformatics, scientific libraries, and healthcare consultation pipelines.';
      default: return '';
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Dynamic Industrial Top Grid Info */}
      <div className="bg-stone-950/90 border-2 border-amber-500/30 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4 shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1c1917_25%,transparent_25%,transparent_50%,#1c1917_50%,#1c1917_75%,transparent_75%,transparent)] bg-[size:10px_10px] opacity-10 pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/40 rounded-xl">
            <Activity className="h-6 w-6 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)] animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-amber-400 font-mono uppercase tracking-widest flex items-center gap-2">
              Silicon Lab: Frontline Orchestration
            </h2>
            <p className="text-[10px] text-stone-500 font-mono mt-0.5">MATRIX R&D PROTOCOL CONNECTED • CONVERGENCE SECURE</p>
          </div>
        </div>

        <div className="flex gap-4 relative z-10">
          <div className="bg-stone-900 border border-amber-900/40 rounded-xl px-4 py-2 text-right">
            <span className="text-[9px] text-stone-500 font-mono block uppercase">R&D reserve</span>
            <span className="font-mono text-amber-400 font-bold text-xs flex items-center justify-end gap-1">
              <Zap className="h-3 w-3 fill-amber-500 text-amber-500 animate-pulse" /> {state.researchPoints || 0} Points
            </span>
          </div>
        </div>
      </div>

      {/* Main R&D Workspace (Sidebar & Main content panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[560px] items-stretch">
        <div className="lg:col-span-3 bg-stone-950/80 border border-amber-900/40 rounded-3xl p-4 flex flex-col justify-between h-full shadow-inner overflow-hidden shrink-0">
          <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-none flex flex-col">
            <span className="text-[9px] font-mono text-amber-500/60 uppercase tracking-widest font-black block border-b border-amber-900/20 pb-1.5 mb-2 shrink-0">ORCHESTRATION SECTORS</span>
            <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-none">
              {[
                { id: 'S01', label: 'NEURAL COMPILER', icon: Brain, desc: 'Draft & training composer' },
                { id: 'S02', label: 'DATASET LAB', icon: Database, desc: 'Corpus strategies & balance' },
                { id: 'S03', label: 'BLUEPRINT GRID', icon: Network, desc: 'Tiered frontiers tree' },
                { id: 'S04', label: 'DIAGNOSTICS & ARENA', icon: Swords, desc: 'Standard benchmarks & chat simulator' },
                { id: 'S05', label: 'COMPUTE ACCELERATOR', icon: Coins, desc: 'R&D reserve funding' }
              ].map((sector) => {
                const isSelected = activeSector === sector.id;
                const IconComp = sector.icon;
                return (
                  <button
                    key={sector.id}
                    onClick={() => { setActiveSector(sector.id as any); playSound('click'); }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all duration-300 font-mono group cursor-pointer flex items-center gap-3 relative shrink-0 ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-stone-900/40 border-stone-850 text-stone-500 hover:text-amber-400 hover:border-amber-900/40'
                    }`}
                  >
                    <IconComp className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-amber-400 animate-pulse' : 'text-stone-600 group-hover:text-amber-500/60'}`} />
                    <div className="truncate">
                      <span className="text-[11px] font-bold block leading-tight">{sector.label}</span>
                      <span className="text-[8px] text-stone-500 block truncate leading-tight mt-0.5 group-hover:text-amber-500/40">{sector.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="bg-stone-900/60 border border-stone-850 p-2 rounded-xl text-[9px] font-mono text-stone-500 mt-3 text-center shrink-0">
              CLUSTER INTEGRITY: SECURE (100%)
            </div>
          </div>
        </div>

        {/* Right Scrollable Work Deck */}
        <div className="lg:col-span-9 bg-stone-900/60 backdrop-blur-3xl border border-amber-900/30 rounded-3xl p-6 overflow-y-auto shadow-inner h-full scrollbar-thin scrollbar-thumb-amber-900/20 pr-3">
          
          {/* Sector 01: Core Architecture Compiler */}
          {activeSector === 'S01' && (
            <div className="space-y-6">
              {state.training ? (
                <div className="space-y-5">
                  <div className="flex justify-between items-center border-b border-amber-900/30 pb-3">
                    <div>
                      <span className="bg-amber-950 text-amber-400 border border-amber-800/60 text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase">ACTIVE RUN PIPELINE</span>
                      <h3 className="font-extrabold text-base text-amber-100 font-mono mt-1">{state.training.modelDraft.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={togglePause}
                        className="p-2 border border-amber-900/40 bg-stone-950 text-amber-500 rounded-xl hover:bg-amber-950 transition-colors cursor-pointer"
                      >
                        {state.training.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={scrapeTraining}
                        className="px-3.5 py-1 text-xs border border-red-955 bg-red-955/20 text-red-400 rounded-xl hover:bg-red-955/40 transition-colors cursor-pointer font-mono font-bold"
                      >
                        ABORT
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 bg-stone-950/50 p-4 border border-amber-900/20 rounded-2xl font-mono text-xs text-stone-400">
                    <div>
                      <span className="text-stone-500 block text-[9px] uppercase tracking-wider">SGD Loss</span>
                      <span className="font-bold text-amber-200 text-sm">{state.training.currentLoss.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[9px] uppercase tracking-wider">Tokens Processed</span>
                      <span className="font-bold text-amber-200 text-sm">{state.training.tokensProcessedTrillion.toFixed(3)}T</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[9px] uppercase tracking-wider">Training Progress</span>
                      <span className="font-bold text-amber-500 text-sm animate-pulse">{state.training.progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[9px] uppercase tracking-wider">Focus Specialty</span>
                      <span className="font-bold text-amber-300 text-sm">{state.training.modelDraft.specialization}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-3 bg-stone-950 rounded-full overflow-hidden p-0.5 border border-amber-900/20">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-600 to-orange-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                        style={{ width: `${state.training.progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-stone-500">
                      <span>INITIALIZED</span>
                      {state.training.isPaused && <span className="text-amber-500 font-bold animate-pulse">PAUSED</span>}
                      <span>CONVERGENCE COMPLETED</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-amber-500/80 uppercase tracking-widest block font-bold">Inference Convergence History</span>
                    {renderLossCurve(state.training.lossHistory)}
                  </div>

                  <div className="bg-stone-950/80 border border-amber-900/30 rounded-2xl p-4 flex justify-between items-center gap-4 text-xs font-mono shadow-inner">
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-amber-200">RLHF Human Alignment Protocol</h5>
                      <p className="text-stone-500 text-[10px] leading-tight">Inject reinforcement datasets to elevate baseline alignment scores by +15%.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (!state.training || state.cash < 8000) return;
                        updateState({
                          cash: state.cash - 8000,
                          training: {
                            ...state.training,
                            alignmentRating: Math.min(100, state.training.alignmentRating + 15),
                          }
                        });
                        addLogMessage(`🛡️ ALIGNMENT INTERVENE: Injected reinforcement guidelines (-$8,000)`, 'SYSTEM');
                      }}
                      disabled={state.cash < 8000}
                      className="bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer disabled:opacity-40 transition-colors"
                    >
                      Inject Alignment (-$8k)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="border-b border-amber-900/20 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-amber-400 text-base font-mono uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="h-5 w-5 animate-pulse text-amber-500" />
                        Neural Synapse Compiler
                      </h3>
                      <p className="text-xs text-stone-500 font-mono mt-0.5">Design foundational parameters and architecture layers to compile next-gen model weights.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-[50]">
                    <div className="bg-stone-950/50 border border-amber-900/20 p-3.5 rounded-2xl space-y-1.5">
                      <label className="block text-[9px] font-mono text-amber-500 uppercase tracking-widest">Model Name</label>
                      <input
                        type="text"
                        className="w-full bg-stone-900 border border-amber-900/40 rounded-lg py-1.5 px-3 text-xs font-mono text-amber-100 focus:border-amber-500 focus:outline-none transition-colors"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                      />
                    </div>

                    <div className="bg-stone-950/50 border border-amber-900/20 p-3.5 rounded-2xl space-y-1.5">
                      <label className="block text-[9px] font-mono text-amber-500 uppercase tracking-widest mb-1">Model Domain</label>
                      <CustomDropdown
                        value={domain}
                        onChange={(v) => setDomain(v as ModelDomain)}
                        options={[
                          { value: 'TEXT_LLM', label: 'Text LLM (GPT / Llama Style)' },
                          { value: 'IMAGE_DIFFUSION', label: 'Image Diffusion (Stable Diffusion)' },
                          { value: 'VIDEO_GENERATION', label: 'Video Motion Transformer' }
                        ]}
                      />
                    </div>

                    <div className="bg-stone-950/50 border border-amber-900/20 p-3.5 rounded-2xl space-y-1.5">
                      <label className="block text-[9px] font-mono text-amber-500 uppercase tracking-widest mb-1">Neural Style</label>
                      <CustomDropdown
                        value={architecture}
                        onChange={(v) => setArchitecture(v as ArchitectureStyle)}
                        options={[
                          { value: 'TRANSFORMER', label: 'Standard Transformer (Multipurpose)' },
                          ...(state.research?.unlockedSSM ? [{ value: 'SSM_MAMBA', label: 'SSM Mamba (Linear Context, Fast)' }] : []),
                          ...(state.research?.unlockedMoE ? [{ value: 'HYBRID_MOE', label: 'Hybrid MoE (Sparse Activation)' }] : [])
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-[45]">
                    <div className="bg-stone-950/50 border border-amber-900/20 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-stone-400 flex items-center gap-1.5"><Sliders className="h-4 w-4 text-amber-500" /> Parameter Scale</span>
                        <span className="text-amber-400 font-bold font-mono">{formatParams(parameters)}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={state.research?.maxParamsB || 8}
                        step="1"
                        className="w-full accent-amber-500 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer"
                        value={Math.min(parameters, state.research?.maxParamsB || 8)}
                        onChange={(e) => setParameters(parseInt(e.target.value, 10))}
                      />
                      <div className="flex justify-between text-[8px] font-mono text-stone-500 pt-0.5">
                        <span>MIN: 1B</span>
                        <span>LIMIT: {formatParams(state.research?.maxParamsB || 8)}</span>
                      </div>
                    </div>

                    <div className="bg-stone-950/50 border border-amber-900/20 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-stone-400 flex items-center gap-1.5"><Sliders className="h-4 w-4 text-amber-500" /> Context Window</span>
                        <span className="text-amber-400 font-bold font-mono">{formatTokens(contextWindow)}</span>
                      </div>
                      <input
                        type="range"
                        min="8192"
                        max={state.research?.maxContextTokens || 32768}
                        step="8192"
                        className="w-full accent-amber-500 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer"
                        value={Math.min(contextWindow, state.research?.maxContextTokens || 32768)}
                        onChange={(e) => setContextWindow(parseInt(e.target.value, 10))}
                      />
                      <div className="flex justify-between text-[8px] font-mono text-stone-500 pt-0.5">
                        <span>MIN: 8k</span>
                        <span>LIMIT: {formatTokens(state.research?.maxContextTokens || 32768)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-[40]">
                    <div className="bg-stone-950/50 border border-amber-900/20 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-stone-400 flex items-center gap-1.5"><Sliders className="h-4 w-4 text-amber-500" /> Corpus Dataset</span>
                        <span className="text-amber-400 font-bold font-mono">{datasetSize}T Tokens</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={state.research?.maxDatasetTrillion || 2}
                        step="1"
                        className="w-full accent-amber-500 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer"
                        value={Math.min(datasetSize, state.research?.maxDatasetTrillion || 2)}
                        onChange={(e) => setDatasetSize(parseInt(e.target.value, 10))}
                      />
                      <div className="flex justify-between text-[8px] font-mono text-stone-500 pt-0.5">
                        <span>MIN: 1T</span>
                        <span>LIMIT: {state.research?.maxDatasetTrillion || 2}T</span>
                      </div>
                    </div>

                    <div className="bg-stone-950/50 border border-amber-900/20 p-4 rounded-2xl space-y-2 relative z-[42]">
                      <label className="block text-[9px] font-mono text-amber-500 uppercase tracking-widest mb-1">Pretraining Focus</label>
                      <CustomDropdown
                        value={specialization}
                        onChange={(v) => setSpecialization(v as any)}
                        options={[
                          { value: 'GENERAL', label: 'General Intelligence Multi-task' },
                          { value: 'CODING', label: 'App Development & Syntactics' },
                          { value: 'REASONING', label: 'Logical Chain-of-Thought (Math)' },
                          { value: 'MULTIMODAL_ROBOTICS', label: 'Multimodal Spatial Actuators' },
                          { value: 'MEDICAL', label: 'Healthcare & Bioinformatics' }
                        ]}
                      />
                      <p className="text-[8px] text-stone-500 font-mono leading-tight pt-1.5 truncate">{getSpecializationDescription(specialization)}</p>
                    </div>
                  </div>

                  {state.research?.unlockedEpochs && state.research.unlockedEpochs > 1 && (
                    <div className="bg-stone-950/50 p-4 rounded-2xl border border-amber-900/20 space-y-3 relative z-[30]">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-amber-400 flex items-center gap-1.5">🔄 Multi-Epoch Optimization</span>
                        <span className="text-amber-450 font-bold">{epochs} Epochs</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="1"
                        className="w-full accent-amber-500 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer"
                        value={epochs}
                        onChange={(e) => setEpochs(parseInt(e.target.value, 10))}
                      />
                      <span className="text-[8px] text-stone-500 block leading-tight font-mono">Quality Boost: +{15 * (epochs - 1)}% • Multiplies pretraining duration cycles.</span>
                    </div>
                  )}

                  <button
                    onClick={beginModelTraining}
                    className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:via-orange-500 hover:to-amber-500 text-stone-950 font-mono font-black py-4 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] cursor-pointer text-xs uppercase tracking-widest relative z-10 transition-all transform hover:scale-[1.01]"
                  >
                    <Zap className="h-4.5 w-4.5 animate-bounce text-stone-950 fill-stone-950" />
                    Initialize Training Sequence
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sector 02: Dataset Synthesis Lab */}
          {activeSector === 'S02' && (
            <div className="space-y-6">
              <div className="border-b border-amber-900/20 pb-3">
                <h3 className="font-bold text-amber-400 text-base font-mono uppercase tracking-widest flex items-center gap-2">
                  <Database className="h-5 w-5 text-amber-500 animate-pulse" />
                  Corpus Synthesis Deck
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">Determine the data ingestion pipeline structure. Manage the balance between cost-effective scraping and compliance-safe licensed tokens.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-stone-950/50 border border-amber-900/20 p-4 rounded-2xl space-y-2 group hover:border-amber-500/40 transition-colors">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-300 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]"></span>
                      Web Scraping
                    </span>
                    <span className="text-amber-400 font-bold">{scraping}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!!state.training}
                    className="w-full h-1.5 bg-stone-900 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
                    value={scraping}
                    onChange={(e) => handleMixChange('SCRAPE', parseInt(e.target.value, 10))}
                  />
                  <span className="text-[8px] text-stone-500 block leading-tight pt-1">Unsanctioned data streams. Lowers pretraining initialization cost but accrues lawsuit risks.</span>
                </div>

                <div className="bg-stone-950/50 border border-amber-900/20 p-4 rounded-2xl space-y-2 group hover:border-orange-500/40 transition-colors">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-300 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]"></span>
                      Synthetic Generation
                    </span>
                    <span className="text-orange-400 font-bold">{synthetic}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!!state.training}
                    className="w-full h-1.5 bg-stone-900 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-40"
                    value={synthetic}
                    onChange={(e) => handleMixChange('SYNTH', parseInt(e.target.value, 10))}
                  />
                  <span className="text-[8px] text-stone-500 block leading-tight pt-1">LLM self-generated logic tokens. Speeds up pretraining ticks but reduces baseline safety scores.</span>
                </div>

                <div className="bg-stone-950/50 border border-amber-900/20 p-4 rounded-2xl space-y-2 group hover:border-yellow-500/40 transition-colors">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-300 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.8)]"></span>
                      Licensed Publishers
                    </span>
                    <span className="text-yellow-400 font-bold">{licensed}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!!state.training}
                    className="w-full h-1.5 bg-stone-900 rounded-lg appearance-none cursor-pointer accent-yellow-500 disabled:opacity-40"
                    value={licensed}
                    onChange={(e) => handleMixChange('LICENSE', parseInt(e.target.value, 10))}
                  />
                  <span className="text-[8px] text-stone-500 block leading-tight pt-1">Fully compliant publisher deal frameworks. High upfront costs but completely aligns legal risk.</span>
                </div>
              </div>

              {/* Scraping Strategy Selector (New Gameplay mechanic) */}
              <div className="bg-stone-950 border border-amber-900/30 p-5 rounded-2xl space-y-3 relative z-10">
                <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-black block">Active Ingestion Strategy Compliance</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SCRAPING_STRATEGIES.map((strat) => {
                    const active = scrapingStrategy === strat.value;
                    return (
                      <button
                        key={strat.value}
                        onClick={() => {
                          if (state.training) return;
                          setScrapingStrategy(strat.value);
                          playSound('click');
                        }}
                        disabled={!!state.training}
                        className={`text-left p-3.5 rounded-2xl border transition-all duration-300 font-mono cursor-pointer flex flex-col justify-between h-36 ${
                          active 
                            ? 'bg-amber-950/20 border-amber-500/70 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                            : 'bg-stone-900/40 border-stone-850 text-stone-500 hover:border-amber-900/30'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{strat.label}</span>
                          <span className="text-[8px] text-stone-500 block mt-1 leading-normal">{strat.desc}</span>
                        </div>
                        {active && (
                          <span className="text-[8px] font-bold text-amber-400 bg-amber-900/30 border border-amber-700/40 px-2 py-0.5 rounded uppercase mt-2 self-start animate-pulse">
                            DEPLOYED
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-950/80 border border-amber-900/20 rounded-2xl p-4 space-y-3 text-xs font-mono">
                  <span className="text-[9px] text-amber-500 uppercase tracking-widest block font-bold border-b border-stone-800 pb-1.5">Projected Pipeline Economics</span>
                  <div className="flex justify-between bg-stone-900/40 p-2 rounded-xl">
                    <span className="text-stone-500">Upfront Deal Costs:</span>
                    <span className="font-bold text-amber-400">
                      ${Math.round((licensed / 10) * datasetSize * 15000 * (scrapingStrategy === 'AGGRESSIVE' ? 0.8 : scrapingStrategy === 'SHADOW' ? 0.5 : 1)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-stone-900/40 p-2 rounded-xl">
                    <span className="text-stone-500">Lawsuit Liability Risk:</span>
                    {(() => {
                      const modifier = scrapingStrategy === 'AGGRESSIVE' ? 30 : scrapingStrategy === 'SHADOW' ? 65 : 0;
                      const rawRisk = scraping + modifier;
                      return (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest ${
                          rawRisk > 75 ? 'bg-red-950 border border-red-800 text-red-400 animate-pulse' :
                          rawRisk > 35 ? 'bg-orange-950 border border-orange-850 text-orange-400' :
                          'bg-emerald-950 border border-emerald-850 text-emerald-400'
                        }`}>
                          {rawRisk > 75 ? 'CRITICAL THREAT' : rawRisk > 35 ? 'MODERATE WARNING' : 'COMPLIANCE SECURE'}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="bg-stone-950/80 border border-amber-900/20 rounded-2xl p-4 flex flex-col justify-between text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-amber-500 uppercase tracking-widest block font-bold border-b border-stone-800 pb-1.5">Stream Quality Deduplication</span>
                    <p className="text-[9px] text-stone-500 mt-2 leading-relaxed">
                      Deploying deduplication algorithms allows the pipeline to sift low-quality garbage tokens, reducing base legal lawsuit vulnerabilities globally.
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${state.research?.unlockedQualityFilters ? 'text-amber-400' : 'text-stone-600'}`}>
                    {state.research?.unlockedQualityFilters ? '🛡️ DEDUPLICATION ALGORITHMS: ENABLED (-40% Risk)' : '🔒 DEDUPLICATION ALGORITHMS: LOCKED'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sector 03: Frontiers Technology Grid */}
          {activeSector === 'S03' && (
            <div className="space-y-6">
              <div className="border-b border-amber-900/20 pb-3 flex justify-between items-end flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-amber-400 text-base font-mono uppercase tracking-widest flex items-center gap-2">
                    <Network className="h-5 w-5 text-amber-500 animate-pulse" />
                    Frontiers Technology Grid
                  </h3>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">Spend earned Research points to unlock advanced parameters ranges, sequence sizes, and architectures.</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-1.5 border-b border-stone-850">
                {(['ALL', 'PARAMETERS', 'CONTEXT', 'DATASETS', 'ARCHITECTURES'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setTechFilter(cat); playSound('click'); }}
                    className={`px-3 py-1 text-[9px] font-mono tracking-wider font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                      techFilter === cat
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'bg-stone-900 border-stone-800 text-stone-500 hover:text-amber-300'
                    }`}
                  >
                    {cat === 'ALL' ? '⊚ SHOW ALL' : cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Tech node list */}
                <div className="lg:col-span-7 max-h-[440px] overflow-y-auto pr-1 space-y-6 scrollbar-thin scrollbar-thumb-amber-900/10">
                  {[1, 2, 3, 4, 5].map(tierNum => {
                    const tierNodes = TECH_TREE.filter(node => node.tier === tierNum && (techFilter === 'ALL' || node.category === techFilter));
                    if (tierNodes.length === 0) return null;

                    const tierNames = {
                      1: 'TIER I: COGNITIVE BASE',
                      2: 'TIER II: TENSOR OPTIMIZATION',
                      3: 'TIER III: ADVANCED SCALE ARCHITECTS',
                      4: 'TIER IV: SUPERMASSIVE COMPUTATION',
                      5: 'TIER V: COGNITIVE SINGULARITY'
                    };

                    return (
                      <div key={tierNum} className="space-y-2.5">
                        <span className="text-[9px] font-mono text-amber-500/70 uppercase tracking-widest font-black block border-l-2 border-amber-500/50 pl-2">
                          {tierNames[tierNum as keyof typeof tierNames]}
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {tierNodes.map(node => {
                            const unlocked = isProjectUnlocked(node.id);
                            const available = !unlocked && canUnlockProject(node.id);
                            const selected = selectedTechId === node.id;
                            return (
                              <button
                                key={node.id}
                                onClick={() => { setSelectedTechId(node.id); playSound('click'); }}
                                className={`text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-32 group cursor-pointer ${
                                  selected
                                    ? 'bg-stone-900 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.01]'
                                    : 'bg-stone-950/60 border-stone-850 hover:border-amber-900/30'
                                }`}
                              >
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[8px] font-mono font-bold text-stone-500">{node.category}</span>
                                    {unlocked ? (
                                      <span className="text-[8px] font-mono text-emerald-450 font-bold bg-emerald-950/50 border border-emerald-900/30 px-1.5 py-0.2 rounded">RESOLVED</span>
                                    ) : available ? (
                                      <span className="text-[8px] font-mono text-amber-400 font-bold bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.2 rounded animate-pulse">AVAILABLE</span>
                                    ) : (
                                      <span className="text-[8px] font-mono text-stone-600 bg-stone-900 border border-stone-800 px-1.5 py-0.2 rounded">LOCKED</span>
                                    )}
                                  </div>
                                  <h4 className={`text-xs font-bold font-mono tracking-tight ${selected ? 'text-amber-300' : 'text-stone-300'}`}>{node.name}</h4>
                                </div>
                                <span className="text-[9px] font-mono text-amber-500/80 font-bold">Cost: {getUpgradeCost(node.cost)} pts</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Node Details Panel */}
                <div className="lg:col-span-5 bg-stone-950 border border-amber-900/20 rounded-2xl p-5 space-y-4 font-mono">
                  {(() => {
                    const node = TECH_TREE.find(t => t.id === selectedTechId);
                    if (!node) return <p className="text-stone-500 text-xs">Select a blueprint to inspect parameters.</p>;

                    const unlocked = isProjectUnlocked(node.id);
                    const available = !unlocked && canUnlockProject(node.id);
                    const costAfterMult = getUpgradeCost(node.cost);
                    const affordable = (state.researchPoints || 0) >= costAfterMult;

                    return (
                      <div className="space-y-4">
                        <div className="border-b border-stone-850 pb-2">
                          <span className="text-[9px] text-amber-500 uppercase font-bold tracking-widest">{node.category} MODULE</span>
                          <h4 className="text-sm font-bold text-amber-100 mt-1">{node.name}</h4>
                        </div>

                        <p className="text-[10px] text-stone-400 leading-relaxed font-sans">{node.description}</p>

                        <div className="space-y-1.5 text-[10px]">
                          <div className="flex justify-between border-b border-stone-900 py-1">
                            <span className="text-stone-500">Tier Sector:</span>
                            <span className="text-amber-400">Sector Tier 0{node.tier}</span>
                          </div>
                          <div className="flex justify-between border-b border-stone-900 py-1">
                            <span className="text-stone-500">Resource Required:</span>
                            <span className="text-amber-400">{costAfterMult} R&D Points</span>
                          </div>
                          <div className="flex justify-between border-b border-stone-900 py-1">
                            <span className="text-stone-500">Direct Unlock Effect:</span>
                            <span className="text-emerald-400 font-bold">{node.unlockText}</span>
                          </div>
                          {node.prereqs.length > 0 && (
                            <div className="flex justify-between border-b border-stone-900 py-1 flex-wrap">
                              <span className="text-stone-500">Prerequisite nodes:</span>
                              <span className="text-stone-400 text-right">{node.prereqs.map(p => TECH_TREE.find(t => t.id === p)?.name || p).join(', ')}</span>
                            </div>
                          )}
                        </div>

                        {unlocked ? (
                          <div className="w-full text-center py-2 bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold rounded-xl text-xs uppercase tracking-wider">
                            Blueprint Fully Active
                          </div>
                        ) : available ? (
                          <button
                            onClick={() => handlePurchaseTreeProject(node)}
                            disabled={!affordable}
                            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black rounded-xl text-xs uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          >
                            Compile Research Matrix
                          </button>
                        ) : (
                          <div className="w-full text-center py-2 bg-stone-900 border border-stone-850 text-stone-600 font-bold rounded-xl text-xs uppercase tracking-wider">
                            Locked (Awaiting Prerequisites)
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Sector 04: Diagnostics & Battle Arena */}
          {activeSector === 'S04' && (
            <div className="space-y-6">
              <div className="border-b border-amber-900/20 pb-3">
                <h3 className="font-bold text-amber-400 text-base font-mono uppercase tracking-widest flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500 animate-bounce" />
                  Neural Diagnostics & Arena
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">Perform formal standardized benchmarks testing, resolve weight anomalies, and pit models against competitor clusters inside the LMSYS Simulator.</p>
              </div>

              {state.trainedModels.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-amber-900/30 rounded-3xl bg-stone-950/30 font-mono">
                  <Cpu className="h-10 w-10 text-stone-700 mx-auto mb-3 animate-pulse" />
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">No Compiled Models Found</h4>
                  <p className="text-[10px] text-stone-500 max-w-sm mx-auto mt-1 leading-normal">
                    You must compile at least 1 neural blueprint under SECTOR 01: NEURAL COMPILER before you can validate weights or simulate battles.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  
                  {/* Benchmarks Matrix Grid Table (Left Column) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-800 pb-1.5">
                      <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-black block">Certified Weights Database</span>
                      {(() => {
                        const selectedModel = state.trainedModels.find(m => m.id === selectedModelIdForBench) || state.trainedModels[0];
                        if (!selectedModel) return null;
                        
                        const currentStatus = selectedModel.benchmarkStatus || {
                          mmlu: 'UNTESTED', humanEval: 'UNTESTED', gsm8k: 'UNTESTED', math: 'UNTESTED',
                          gpqa: 'UNTESTED', sweBench: 'UNTESTED', ifeval: 'UNTESTED', arenaElo: 'UNTESTED',
                        };
                        const hasUntested = 
                          currentStatus.mmlu !== 'VERIFIED' ||
                          currentStatus.humanEval !== 'VERIFIED' ||
                          currentStatus.gsm8k !== 'VERIFIED' ||
                          currentStatus.math !== 'VERIFIED' ||
                          currentStatus.gpqa !== 'VERIFIED' ||
                          currentStatus.sweBench !== 'VERIFIED' ||
                          currentStatus.ifeval !== 'VERIFIED' ||
                          currentStatus.arenaElo !== 'VERIFIED';
                        
                        if (hasUntested) {
                          return (
                            <button
                              onClick={() => triggerAllBenchmarksTest(selectedModel.id)}
                              disabled={!!evaluatingModelId}
                              className="bg-amber-955 hover:bg-amber-900 border border-amber-800 text-amber-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all cursor-pointer disabled:opacity-40 animate-pulse"
                            >
                              ⚡ Test All ({selectedModel.name})
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    
                    <div className="max-h-[220px] overflow-y-auto border border-stone-800 rounded-2xl bg-stone-950/60 scrollbar-thin">
                      <table className="w-full text-[9px] font-mono text-left whitespace-nowrap">
                        <thead className="bg-stone-900 text-stone-400 border-b border-stone-800 sticky top-0 z-10">
                          <tr>
                            <th className="px-3 py-2">Model</th>
                            <th className="px-2 py-2">MMLU</th>
                            <th className="px-2 py-2">H.EV</th>
                            <th className="px-2 py-2">GSM</th>
                            <th className="px-2 py-2">MATH</th>
                            <th className="px-2 py-2">GPQA</th>
                            <th className="px-2 py-2">SWE</th>
                            <th className="px-2 py-2">IFEv</th>
                            <th className="px-2 py-2">ELO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-850/60">
                          {state.trainedModels.map((m) => {
                            const dom = m.domain;
                            const isSel = selectedModelIdForBench === m.id;
                            return (
                              <tr 
                                key={m.id}
                                onClick={() => { setSelectedModelIdForBench(m.id); playSound('click'); }}
                                className={`cursor-pointer transition-colors ${isSel ? 'bg-amber-950/20 text-amber-300' : 'hover:bg-stone-900/40 text-stone-400'}`}
                              >
                                <td className="px-3 py-2 font-bold max-w-[100px] truncate">{m.name}</td>
                                {['mmlu', 'humanEval', 'gsm8k', 'math', 'gpqa', 'sweBench', 'ifeval', 'arenaElo'].map((met) => {
                                  const ver = !m.benchmarkStatus || m.benchmarkStatus[met as keyof typeof m.benchmarkStatus] === 'VERIFIED';
                                  return (
                                    <td key={met} className="px-2 py-2">
                                      {ver ? (
                                        <span className="font-bold text-amber-400">{m.benchmarks[met as keyof typeof m.benchmarks].toFixed(0)}</span>
                                      ) : (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); triggerBenchmarkTest(m.id, met as any); }}
                                          disabled={!!evaluatingModelId}
                                          className="bg-stone-900 hover:bg-stone-850 border border-amber-955 px-1 py-0.2 rounded text-[7px] text-amber-500 font-bold transition-colors disabled:opacity-40"
                                        >
                                          TEST
                                        </button>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Active testing console logs */}
                    {evaluatingModelId && (
                      <div className="bg-stone-950 border border-amber-900/20 rounded-2xl p-4 space-y-3 font-mono">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-amber-500 font-bold animate-pulse">&gt; Evaluating {getMetricLabel(evaluatingMetric || '', state.trainedModels.find(m => m.id === evaluatingModelId)?.domain)}</span>
                          <span className="text-amber-400">{evaluationProgress}%</span>
                        </div>
                        <div className="bg-stone-900/50 p-2.5 rounded-lg text-[9px] text-stone-500 max-h-[120px] overflow-y-auto space-y-1 scrollbar-thin">
                          {evaluationLogs.map((log, i) => <div key={i}>&gt; {log}</div>)}
                        </div>
                      </div>
                    )}

                    {/* Weight Anomalies (flaws) */}
                    {(() => {
                      const selectedModel = state.trainedModels.find(m => m.id === selectedModelIdForBench) || state.trainedModels[0];
                      if (!selectedModel || !selectedModel.flaws || selectedModel.flaws.length === 0) return null;
                      return (
                        <div className="bg-stone-950/80 border border-amber-900/20 p-4 rounded-2xl space-y-3 font-mono">
                          <span className="text-[9px] text-red-500 font-black uppercase tracking-widest block flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5 animate-pulse" /> Critical weight anomalies detected
                          </span>
                          <div className="space-y-2">
                            {selectedModel.flaws.map((flaw) => (
                              <div key={flaw.id} className="bg-stone-900/40 border border-red-955/40 p-3 rounded-xl flex justify-between items-center gap-3">
                                <div className="text-[9px]">
                                  <span className="font-bold text-red-400 block">{flaw.name}</span>
                                  <span className="text-stone-500 leading-normal font-sans block mt-0.5">{flaw.description}</span>
                                  {!flaw.isFixed && (
                                    <span className="text-stone-500 block mt-1">
                                      Remedy: <span className="text-amber-500">{flaw.remedyCostPoints} R&D Pts</span> • <span className="text-emerald-500">${flaw.remedyCostCash.toLocaleString()}</span>
                                    </span>
                                  )}
                                </div>
                                {!flaw.isFixed && (
                                  <button
                                    onClick={() => applyModelFix(selectedModel.id, flaw.id)}
                                    disabled={(state.researchPoints || 0) < flaw.remedyCostPoints || state.cash < flaw.remedyCostCash}
                                    className="px-3 py-1.5 bg-red-955/20 hover:bg-red-955/50 disabled:opacity-40 text-red-400 border border-red-955/40 text-[8px] font-bold rounded-lg transition-colors uppercase shrink-0"
                                  >
                                    PATCH
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* LMSYS Chat Arena Battle Simulator (Right Column, New Feature) */}
                  <div className="lg:col-span-5 bg-stone-950 border border-amber-900/30 rounded-2xl p-5 space-y-4 font-mono shadow-inner">
                    <div className="border-b border-amber-900/20 pb-2">
                      <span className="text-[9px] text-amber-500 uppercase tracking-widest font-black block flex items-center gap-1.5 animate-pulse">
                        <Swords className="h-4.5 w-4.5 text-amber-500" /> LMSYS Arena Chat Simulator
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] text-stone-500 uppercase tracking-wider mb-1">Select Candidate Model</label>
                        <CustomDropdown
                          value={arenaModelId}
                          onChange={(v) => setArenaModelId(v)}
                          options={state.trainedModels.map(m => ({ value: m.id, label: `${m.name} (${formatParams(m.parametersCountB)})` }))}
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-stone-500 uppercase tracking-wider mb-1">Select Competitor Target</label>
                        <CustomDropdown
                          value={arenaCompetitorId}
                          onChange={(v) => setArenaCompetitorId(v)}
                          options={state.competitors.slice(0, 10).map(c => ({ value: c.id, label: `${c.name} (${c.leadModelScore.toFixed(0)}%)` }))}
                        />
                      </div>

                      {isSimulatingArena ? (
                        <div className="bg-stone-900/70 border border-amber-900/20 p-3.5 rounded-2xl space-y-3 h-[240px] overflow-y-auto scrollbar-thin">
                          {arenaLogs.map((logLine, idx) => (
                            <div key={idx} className="text-[9px] leading-relaxed text-stone-400">
                              <span className="text-amber-500 select-none">&gt;</span> {logLine}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 h-[240px] bg-stone-900/20 border border-stone-855 rounded-2xl">
                          <Swords className="h-10 w-10 text-stone-700 animate-pulse" />
                          <div className="space-y-1">
                            <h5 className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Arena Room Ready</h5>
                            <p className="text-[8px] text-stone-500 max-w-xs mx-auto leading-normal font-sans">
                              Simulating blind preference tests dynamically calculates win rate probabilities. Defeating competitor models unlocks followings and coordinates R&D points.
                            </p>
                          </div>
                          <button
                            onClick={startArenaBattle}
                            disabled={!arenaModelId || !arenaCompetitorId}
                            className="bg-amber-955 hover:bg-amber-900 border border-amber-800 text-amber-400 font-bold py-2 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                          >
                            Simulate Arena Battle
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sector 05: Compute Funding Center */}
          {activeSector === 'S05' && (
            <div className="space-y-6 font-mono">
              <div className="border-b border-amber-900/20 pb-3">
                <h3 className="font-bold text-amber-400 text-base uppercase tracking-widest flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-500 animate-pulse" />
                  Compute Funding & Accelerators
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Procure extra-surplus high bandwidth interconnects, liquid loops, and cluster hardware architectures using capital assets to boost Research reserve pools directly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Deploy Fiber Ring Matrix', cash: 20000, points: 20, desc: 'Acquire high-speed cross-cluster fiber networks to boost training synchronization speeds.' },
                  { name: 'Procure Liquid Intercooler Pods', cash: 45000, points: 50, desc: 'Install specialized cooling lines into training cages to enable over-clocked compute cycles.' },
                  { name: 'Surplus Gpu Batch Lease', cash: 120000, points: 150, desc: 'Lease a surplus pool of H100 arrays for 30 cycles, generating massive raw R&D coordinates.' },
                  { name: 'Frontiers Quantum Lattice', cash: 350000, points: 480, desc: 'Procure early-access access blocks on a quantum accelerator lattice to bootstrap AGI nodes.' }
                ].map((acc, idx) => {
                  const costMultiplier = Math.pow(1.05, state.acceleratorPurchases || 0);
                  const actualCost = Math.round(acc.cash * costMultiplier);
                  const affordable = state.cash >= actualCost;
                  const finalYield = state.activeOrigin === 'GARAGE_HACKER' ? Math.round(acc.points * 1.5) : acc.points;

                  return (
                    <div key={idx} className="bg-stone-950 border border-amber-900/20 rounded-2xl p-5 flex flex-col justify-between h-44 group hover:border-amber-500/40 transition-colors">
                      <div>
                        <div className="flex justify-between items-start border-b border-stone-850 pb-2">
                          <h4 className="text-xs font-bold text-amber-300">{acc.name}</h4>
                          <span className="text-[10px] font-bold text-emerald-400">+{finalYield} Pts</span>
                        </div>
                        <p className="text-[9px] text-stone-500 leading-normal font-sans mt-2">{acc.desc}</p>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-stone-900 mt-2">
                        <span className="text-[9px] text-stone-400">Cost: ${actualCost.toLocaleString()}</span>
                        <button
                          onClick={() => handleCashToPoints(acc.cash, acc.points, acc.name)}
                          disabled={!affordable}
                          className="bg-amber-955 hover:bg-amber-900 disabled:bg-stone-900 disabled:border-stone-800 disabled:text-stone-600 text-amber-400 border border-amber-800 px-3.5 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-colors cursor-pointer"
                        >
                          Acquire Cells
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
