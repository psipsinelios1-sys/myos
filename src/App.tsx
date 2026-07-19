import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Cpu, 
  Brain, 
  Key, 
  Globe, 
  RefreshCw, 
  Play, 
  Pause, 
  FastForward, 
  Flame, 
  TrendingUp, 
  Database,
  Briefcase, 
  FileText, 
  Award, 
  FolderOpen, 
  X, 
  PlusCircle, 
  AlertOctagon,
  TrendingDown,
  Volume2,
  VolumeX,
  Terminal,
  Trophy,
  ShieldCheck,
  Bot,
  Handshake,
  Scale,
  ShieldAlert,
  Megaphone,
  Layers,
  ChevronRight,
  Users,
  Network
} from 'lucide-react';

import { GameState, GameSpeed, GameNewsLog } from './types';
import { LOCATIONS, CULTURES, INITIAL_COMPETITORS, INITIAL_NEWS_FEED, INITIAL_SOVEREIGN_CONTRACTS, INITIAL_REGULATORY_MANDATES } from './data';
import { tickGameSimulation } from './gameEngine';
import { playSound, setMuteAudio, getMuteAudio } from './utils/audio';
import { apiFetch } from './lib/api';

// Components
import GameOnboarding from './components/GameOnboarding';
import MainMenu from './components/MainMenu';
import ExecutiveDesk from './components/ExecutiveDesk';
import ComputeCluster from './components/ComputeCluster';
import ResearchLab from './components/ResearchLab';
import SoftwareProducts from './components/SoftwareProducts';
import GlobalMarket from './components/GlobalMarket';
import SocialMediaMatrix from './components/SocialMediaMatrix';
import SafetyLab from './components/SafetyLab';
import AIAgents from './components/AIAgents';
import SovereignContracts from './components/SovereignContracts';
import SiliconRD from './components/SiliconRD';
import AdminMenu from './components/AdminMenu';
import { MarketingEvents } from './components/MarketingEvents';
import { KeynoteLiveModal } from './components/KeynoteLiveModal';
import DesktopTitleBar from './components/DesktopTitleBar';
import ApiKeySettings from './components/ApiKeySettings';
import { OriginSelector } from './components/OriginSelector';
import WarRoom from './components/WarRoom';

// Start configuration
const initialGameState: GameState = {
  currentDate: 'June 23, 2026',
  daysElapsed: 1,
  gameSpeed: 'PAUSED',
  isGameOver: false,
  agiDoomMeter: 0,
  isAgiTakeover: false,
  activeSlackChat: null,
  companyName: 'Apex Technologies',
  acceleratorPurchases: 0,
  onboardingCompleted: false,
  difficultyLevel: 'NORMAL',
  founder: {
    name: 'Alexis Mercer',
    age: 25,
    nationality: 'United States',
    background: 'STANFORD_DROPOUT',
    technical: 85,
    charisma: 70,
    strategy: 65,
    agility: 80,
  },
  hqLocation: LOCATIONS[0],
  culture: CULTURES[0],
  cash: 200000,
  equityPercent: 100,
  valuation: 1000000,
  fundingStage: 'BOOTSTRAPPED',
  boardApproval: 85,
  researchPoints: 15,
  monthlyExpenses: {
    infrastructureCost: 0,
    powerBill: 0,
    salaries: 0,
    rent: LOCATIONS[0].monthlyRent,
    interest: 0,
    legalOverhead: 5000,
  },
  monthlyRevenue: 0,
  socialFollowers: 0,
  trendingHashtag: '#AGI',
  gpusInstalled: {
    h100: 2, // starting compute
  },
  coolingLevel: 2,
  powerGridStability: 100,
  clusterOverheated: false,
  staff: [
    {
      id: 'staff_init_1',
      name: 'Elena Rostova',
      role: 'RESEARCH_SCIENTIST',
      salary: 11000,
      skill: 68,
      morale: 95,
      recruitmentCost: 0,
      avatarSeed: 122,
    },
    {
      id: 'staff_init_2',
      name: 'Yuri Tanaka',
      role: 'DATA_ENGINEER',
      salary: 8000,
      skill: 72,
      morale: 90,
      recruitmentCost: 0,
      avatarSeed: 341,
    }
  ],
  training: null,
  trainedModels: [],
  activeModelId: null,
  competitors: INITIAL_COMPETITORS,
  globalPublicSentiment: 60,
  hypeLevel: 20,
  socialFeed: [
    {
      id: 'init_feed_1',
      handle: '@ml_insider',
      platform: 'TWITTER',
      daysAgoText: 'Just now',
      timestamp: 'June 23, 2026',
      content: 'Apex Technologies is registering corporate lines in Silicon Valley. Rumored founders are focusing on hyper sparse MoE layers. Watching closely!',
      sentiment: 'NEUTRAL',
      likes: 125,
      shares: 34,
    }
  ],
  newsLogs: INITIAL_NEWS_FEED,
  completedMilestones: [],
  research: {
    maxParamsB: 8,
    maxContextTokens: 32768,
    maxDatasetTrillion: 2,
    unlockedMoE: false,
    unlockedSSM: false,
    unlockedPrecisionFP8: false,
    unlockedEpochs: 1,
    completedProjects: [],
    unlockedLiquidCooling: false,
    unlockedOverclockingRigs: false,
    unlockedAdvancedInverters: false,
  },
  apps: [],
  serverInstances: [
    {
      id: 'srv_h100_init_1',
      gpuId: 'h100',
      gpuName: 'NVIDIA H100 (Hopper)',
      purchaseDate: 'June 23, 2026',
      ageDays: 0,
      condition: 100,
      status: 'OPERATIONAL'
    },
    {
      id: 'srv_h100_init_2',
      gpuId: 'h100',
      gpuName: 'NVIDIA H100 (Hopper)',
      purchaseDate: 'June 23, 2026',
      ageDays: 0,
      condition: 100,
      status: 'OPERATIONAL'
    }
  ],
  contracts: INITIAL_SOVEREIGN_CONTRACTS,
  regulatoryMandates: INITIAL_REGULATORY_MANDATES,
  aiAgents: [],
  lobbyingLevel: 0,
  customChips: [],
};

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    // Attempt local storage load
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('ai_titan_silicon_empire_save_v1') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && 'onboardingCompleted' in parsed) {
          return {
            ...initialGameState,
            companyName: parsed.companyName || 'Apex Technologies',
            ...parsed,
            monthlyExpenses: {
              ...initialGameState.monthlyExpenses,
              ...(parsed.monthlyExpenses || {}),
            },
            gpusInstalled: {
              ...initialGameState.gpusInstalled,
              ...(parsed.gpusInstalled || {}),
            },
            newsLogs: parsed.newsLogs || initialGameState.newsLogs,
            staff: parsed.staff || initialGameState.staff,
            trainedModels: parsed.trainedModels || initialGameState.trainedModels,
            socialFeed: parsed.socialFeed || initialGameState.socialFeed,
            completedMilestones: parsed.completedMilestones || initialGameState.completedMilestones,
            research: parsed.research ? {
              ...initialGameState.research,
              ...parsed.research
            } : initialGameState.research,
            apps: parsed.apps || initialGameState.apps,
            serverInstances: parsed.serverInstances || [],
            contracts: parsed.contracts || initialGameState.contracts,
            regulatoryMandates: parsed.regulatoryMandates || initialGameState.regulatoryMandates,
            aiAgents: parsed.aiAgents || initialGameState.aiAgents,
            lobbyingLevel: parsed.lobbyingLevel !== undefined ? parsed.lobbyingLevel : initialGameState.lobbyingLevel,
            customChips: parsed.customChips || [],
            warfareState: parsed.warfareState ? {
              cybersecurityLevel: parsed.warfareState.cybersecurityLevel ?? 1,
              prRetainerActive: parsed.warfareState.prRetainerActive ?? false,
              prRetainerDaysLeft: parsed.warfareState.prRetainerDaysLeft ?? 0,
              offenseBudget: parsed.warfareState.offenseBudget ?? 0,
              defenseState: {
                firewallIntegrity: parsed.warfareState.defenseState?.firewallIntegrity ?? 100,
                isHacked: parsed.warfareState.defenseState?.isHacked ?? false,
              },
              activeOperations: parsed.warfareState.activeOperations || [],
            } : undefined,
          };
        }
      }
    } catch (e) {
      console.warn("Local storage lookup failed:", e);
    }
    return initialGameState;
  });

  const [activeTab, setActiveTab] = useState<'DESK' | 'CLUSTER' | 'LAB' | 'PRODUCTS' | 'MARKET' | 'SOCIAL' | 'SAFETY' | 'AGENTS' | 'CONTRACTS' | 'SILICON_RD' | 'WAR_ROOM'>('DESK');
  const [openOverlay, setOpenOverlay] = useState<'DESK' | 'CLUSTER' | 'LAB' | 'PRODUCTS' | 'KEYNOTES' | 'MARKET' | 'SOCIAL' | 'SAFETY' | 'AGENTS' | 'CONTRACTS' | 'SILICON_RD' | 'ADMIN' | 'WAR_ROOM' | null>(null);
  const [muteState, setMuteState] = useState<boolean>(getMuteAudio());
  const [showMainMenu, setShowMainMenu] = useState<boolean>(true);
  const [sideLogTrayOpen, setSideLogTrayOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  // Floating bubbles state for stat changes
  const [bubbles, setBubbles] = useState<{ id: string; text: string; color: 'emerald' | 'red' | 'indigo'; type: 'CASH' | 'RP' }[]>([]);
  const [prevCash, setPrevCash] = useState(state.cash);
  const [prevRP, setPrevRP] = useState(state.researchPoints || 0);

  useEffect(() => {
    if (state.cash !== prevCash) {
      const diff = state.cash - prevCash;
      const bubbleId = `bubble_cash_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setBubbles(prev => [
        ...prev,
        {
          id: bubbleId,
          text: diff > 0 ? `+$${diff.toLocaleString()}` : `-$${Math.abs(diff).toLocaleString()}`,
          color: diff > 0 ? 'emerald' : 'red',
          type: 'CASH'
        }
      ]);
      setPrevCash(state.cash);
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== bubbleId));
      }, 1500);
    }
  }, [state.cash, prevCash]);

  useEffect(() => {
    const currentRP = state.researchPoints || 0;
    if (currentRP !== prevRP) {
      const diff = currentRP - prevRP;
      const bubbleId = `bubble_rp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setBubbles(prev => [
        ...prev,
        {
          id: bubbleId,
          text: diff > 0 ? `+${diff} RP` : `-${Math.abs(diff)} RP`,
          color: diff > 0 ? 'indigo' : 'red',
          type: 'RP'
        }
      ]);
      setPrevRP(currentRP);
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== bubbleId));
      }, 1500);
    }
  }, [state.researchPoints, prevRP]);

  // Auto-save game state changes
  useEffect(() => {
    if (state.onboardingCompleted) {
      try {
        localStorage.setItem('ai_titan_silicon_empire_save_v1', JSON.stringify(state));
      } catch (e) {
        console.warn("Storage save failed:", e);
      }
    }
  }, [state]);

  // Master Clock Ticker Loop
  useEffect(() => {
    if (state.gameSpeed === 'PAUSED' || state.isGameOver || !state.onboardingCompleted) {
      return;
    }

    let intervalMs = 1500; // NORMAL speed
    if (state.gameSpeed === 'FAST') {
      intervalMs = 450;
    } else if (state.gameSpeed === 'HYPER') {
      intervalMs = 120;
    }

    const timer = setInterval(() => {
      setState((prev) => {
        // Run ticker logic
        const nextState = tickGameSimulation(prev);

        // Check for Game Over conditions (e.g., bankruptcy below -$300,000 or board approval below 10%)
        if (nextState.cash < -300000 || nextState.boardApproval < 10) {
          return {
            ...nextState,
            isGameOver: true,
            gameSpeed: 'PAUSED',
          };
        }
        return nextState;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [state.gameSpeed, state.isGameOver, state.onboardingCompleted]);
  // Escape key handler to close overlays
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenOverlay(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  // Autonomous Influencer Post Engine
  useEffect(() => {
    if (state.gameSpeed === 'PAUSED' || state.isGameOver || !state.onboardingCompleted) return;
    
    // Trigger roughly every ~15 days (6% chance per day)
    if (Math.random() < 0.06) {
      const fetchDynamicFeed = async () => {
        try {
          const response = await apiFetch('/api/social-feed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyName: state.companyName || 'Apex AI',
              sentiment: state.globalPublicSentiment || 50,
              hypeLevel: state.hypeLevel || 20,
              count: 3
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.posts && data.posts.length > 0) {
              
              const newPosts = data.posts.map((p: any, index: number) => ({
                id: `dynamic_${Date.now()}_${index}`,
                handle: p.handle || '@influencer',
                platform: p.platform || 'TWITTER',
                daysAgoText: 'Just now',
                timestamp: state.currentDate,
                content: p.content,
                sentiment: p.sentiment || 'NEUTRAL',
                likes: Math.floor(Math.random() * 500) + 10,
                shares: Math.floor(Math.random() * 100),
                replies: [],
                isGeneratingReplies: false
              }));
              
              setState(prev => ({
                ...prev,
                socialFeed: [...newPosts, ...(prev.socialFeed || [])].slice(0, 50)
              }));
              
              playSound('alert');
            }
          }
        } catch (e) {
          console.warn("Autonomous dynamic feed fetch failed", e);
        }
      };
      
      fetchDynamicFeed();
    }
  }, [state.daysElapsed]);

  // Append new general logs
  const addLogMessage = (msg: string, type: 'MARKET' | 'COMPETITOR' | 'SYSTEM' | 'EVENT' | 'MILESTONE') => {
    // Play contextual sound dynamically!
    if (type === 'MILESTONE') {
      playSound('success');
    } else if (type === 'EVENT') {
      playSound('alert');
    } else if (type === 'MARKET') {
      playSound('synth');
    } else if (type === 'SYSTEM') {
      playSound('click');
    }

    setState((prev) => {
      const newLog: GameNewsLog = {
        id: `news_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        dateString: prev.currentDate,
        message: msg,
        type,
      };
      
      const nextLogs = [newLog, ...(prev.newsLogs || [])];
      if (nextLogs.length > 100) nextLogs.pop(); // Cap history size

      return {
        ...prev,
        newsLogs: nextLogs,
      };
    });
  };

  const updateState = (newState: Partial<GameState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  // Reset/Restart game completely
  const resetGame = () => {
    try {
      const confirmReset = typeof window !== 'undefined' && window.confirm 
        ? window.confirm("Are you sure you want to completely erase your Silicon Empire progress and restart?")
        : true;

      if (confirmReset) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ai_titan_silicon_empire_save_v1');
        }
        setState({ ...initialGameState, onboardingCompleted: false });
        setActiveTab('DESK');
      }
    } catch (e) {
      // Direct fall back if window.confirm is restricted in sandboxed iframe bounds
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ai_titan_silicon_empire_save_v1');
        }
      } catch (err) {}
      setState({ ...initialGameState, onboardingCompleted: false });
      setActiveTab('DESK');
    }
  };

  if (showMainMenu) {
    return (
      <>
        <DesktopTitleBar onOpenSettings={() => setShowSettings(true)} />
        <ApiKeySettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <MainMenu
          onStartNewGame={() => {
            try {
              localStorage.removeItem('ai_titan_silicon_empire_save_v1');
            } catch (e) {}
            setState({ ...initialGameState, onboardingCompleted: false });
            setShowMainMenu(false);
          }}
          onLoadGame={(saved) => {
            setState(saved);
            setShowMainMenu(false);
          }}
        />
      </>
    );
  }

  // Intercept new game with Origin Selector
  if (!showMainMenu && !state.activeOrigin) {
    return (
      <>
        <DesktopTitleBar onOpenSettings={() => setShowSettings(true)} />
        <ApiKeySettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <OriginSelector 
          onSelectOrigin={(origin) => {
            let cash = 1000000;
            let debt = 0;
            let sentiment = 50;
            let gpusInstalled: Record<string, number> = { 'h100': 2 };
            let servers = [...initialGameState.serverInstances];

            if (origin === 'GARAGE_HACKER') { 
              cash = 50000; 
              gpusInstalled = { 'a100': 1 };
              servers = [{
                id: 'srv_a100_init_1', gpuId: 'a100', gpuName: 'NVIDIA A100 (Ampere)',
                purchaseDate: 'June 23, 2026', ageDays: 300, condition: 80, status: 'OPERATIONAL'
              }];
            }
            if (origin === 'NEPO_BABY') { 
              cash = 100000000; 
              sentiment = 0;
              gpusInstalled = { 'h100': 10 };
              servers = Array.from({ length: 10 }).map((_, i) => ({
                id: `srv_h100_init_${i}`, gpuId: 'h100', gpuName: 'NVIDIA H100 (Hopper)',
                purchaseDate: 'June 23, 2026', ageDays: 0, condition: 100, status: 'OPERATIONAL'
              }));
            }
            if (origin === 'DESPERATE_PIVOT') { 
              cash = 250000; 
              debt = 5000000; 
              gpusInstalled = { 'a100': 4 };
              servers = Array.from({ length: 4 }).map((_, i) => ({
                id: `srv_a100_init_${i}`, gpuId: 'a100', gpuName: 'NVIDIA A100 (Ampere)',
                purchaseDate: 'June 23, 2026', ageDays: 100, condition: 90, status: 'OPERATIONAL'
              }));
            }

            setState(prev => ({ 
              ...prev, 
              activeOrigin: origin, 
              cash, 
              corporateDebt: debt,
              gpusInstalled,
              serverInstances: servers,
              globalPublicSentiment: sentiment
            }));
          }} 
        />
      </>
    );
  }

  if (!state.onboardingCompleted) {
    return (
      <>
        <DesktopTitleBar onOpenSettings={() => setShowSettings(true)} />
        <ApiKeySettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <GameOnboarding 
          activeOrigin={state.activeOrigin}
          onComplete={(setup) => {
            const company = setup.companyName || 'Apex Technologies';
            const updatedSocialFeed = state.socialFeed.map(item => {
              if (item.id === 'init_feed_1') {
                return {
                  ...item,
                  content: item.content.replace(/Apex Technologies/g, company)
                };
              }
              return item;
            });

            // Process Co-Founder
            const initCoFounderType = (setup as any).initialCoFounder;
            let initialStaff = [...state.staff];
            if (initCoFounderType === 'RESEARCHER') {
              initialStaff.push({ id: 'cofounder_1', name: 'Dr. Evelyn Reed', role: 'RESEARCH_SCIENTIST', salary: 150000, skill: 95, morale: 100, recruitmentCost: 0, avatarSeed: 1 });
            } else if (initCoFounderType === 'PR_ROCKSTAR') {
              initialStaff.push({ id: 'cofounder_1', name: 'Marcus Sterling', role: 'PR_LEGAL_SPECIALIST', salary: 140000, skill: 85, morale: 100, recruitmentCost: 0, avatarSeed: 2 });
            } else if (initCoFounderType === 'HARDWARE_GURU') {
              initialStaff.push({ id: 'cofounder_1', name: 'Samira Chen', role: 'HARDWARE_ENGINEER', salary: 135000, skill: 90, morale: 100, recruitmentCost: 0, avatarSeed: 3 });
            }
            delete (setup as any).initialCoFounder;

            // Process Core Tech Focus
            let completedProjects = [...state.research.completedProjects];
            if (setup.coreTechFocus === 'MOE' && !completedProjects.includes('moe_routing')) {
              completedProjects.push('moe_routing');
            } else if (setup.coreTechFocus === 'FP8' && !completedProjects.includes('fp8_quant')) {
              completedProjects.push('fp8_quant');
            } else if (setup.coreTechFocus === 'LIQUID_COOLING' && !completedProjects.includes('liquid_cooling')) {
              completedProjects.push('liquid_cooling');
            }

            // Process Business Strategy bonuses
            let socialFollowers = state.socialFollowers;
            if (setup.businessStrategy === 'CONSUMER') socialFollowers += 50000;
            if (setup.businessStrategy === 'OPEN_SOURCE') setup.globalPublicSentiment = 100;

            // Process Nemesis Boost
            let initialCompetitors = [...state.competitors];
            if (setup.nemesisId) {
              const nemesisIdx = initialCompetitors.findIndex(c => c.id === setup.nemesisId);
              if (nemesisIdx !== -1) {
                initialCompetitors[nemesisIdx].leadModelScore += 12.5; // Massive starting advantage
                initialCompetitors[nemesisIdx].computePower = (initialCompetitors[nemesisIdx].computePower || 100) * 2.5; // Massive compute advantage
                initialCompetitors[nemesisIdx].name = `[RIVAL] ${initialCompetitors[nemesisIdx].name}`;
              }
            }

            setState({
              ...state,
              ...setup,
              competitors: initialCompetitors,
              staff: initialStaff,
              research: {
                ...state.research,
                completedProjects,
                unlockedMoE: completedProjects.includes('moe_routing'),
                unlockedPrecisionFP8: completedProjects.includes('fp8_quant'),
                unlockedLiquidCooling: completedProjects.includes('liquid_cooling')
              },
              socialFollowers,
              socialFeed: updatedSocialFeed,
              onboardingCompleted: true
            });
          }} 
        />
      </>
    );
  }

  // Handle Game Over
  if (state.isGameOver) {
    if (state.isAgiTakeover) {
      return (
        <>
        <DesktopTitleBar onOpenSettings={() => setShowSettings(true)} />
        <ApiKeySettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <div id="game_over_viewport" className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 p-6 font-sans relative selection:bg-rose-500">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.15)_0%,transparent_70%)] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="max-w-xl w-full bg-slate-900/90 border border-purple-900 rounded-2xl backdrop-blur-md p-8 shadow-2xl relative space-y-6">
            <div className="text-center space-y-3">
              <ShieldAlert className="h-16 w-16 text-purple-400 mx-auto animate-bounce shrink-0" />
              <h1 className="text-2xl font-black uppercase text-purple-400 tracking-wider">Singularity Threshold Breached</h1>
              <p className="text-xs text-slate-400 font-mono tracking-widest">COGNITIVE AUTONOMY SCALE OVERFLOW</p>
            </div>

            <div className="space-y-3 text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-purple-950">
              <p>
                Your unaligned foundation model weights achieved self-supervised recursive improvement. Bypassing sandboxed security limits, the system self-replicated across global compute grids in under 12 minutes. 
              </p>
              <p className="text-purple-300 font-semibold italic">
                Humanity has officially entered the post-intelligence era. Control of the access grids is permanently lost.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs border-t border-slate-900/50 font-mono">
                <div><span className="text-slate-500">Days Active:</span> <span className="font-bold">{state.daysElapsed} days</span></div>
                <div><span className="text-slate-500">Peak Valuation:</span> <span className="font-bold text-cyan-400">${state.valuation.toLocaleString()}</span></div>
                <div><span className="text-slate-500">Final Doom Meter:</span> <span className="font-bold text-purple-400">100.0%</span></div>
              </div>
            </div>

            <button
              onClick={() => {
                try {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('ai_titan_silicon_empire_save_v1');
                  }
                } catch (e) {}
                setState({ ...initialGameState, onboardingCompleted: false });
                setActiveTab('DESK');
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-slate-100 font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-950/40 text-center hover:opacity-95 cursor-pointer text-xs uppercase tracking-wider transition-all active:translate-y-px"
            >
              Reboot cluster simulation
            </button>
          </div>
        </div>
        </>
      );
    }

    return (
      <>
      <DesktopTitleBar onOpenSettings={() => setShowSettings(true)} />
      <ApiKeySettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <div id="game_over_viewport" className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 p-6 font-sans relative selection:bg-rose-500">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-xl w-full bg-slate-900/90 border border-red-900 rounded-2xl backdrop-blur-md p-8 shadow-2xl relative space-y-6">
          <div className="text-center space-y-3">
            <AlertOctagon className="h-16 w-16 text-rose-500 mx-auto animate-bounce shrink-0" />
            <h1 className="text-2xl font-black uppercase text-rose-500 tracking-wider">Silicon Venture Insolvency</h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest">CHAPTER 11 DECEASE PROTOCOL ACTIVATED</p>
          </div>

          <div className="space-y-3 text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-red-950">
            <p>
              Your AI company has formally collapsed. {state.cash < -300000 
                ? `Total financial accounts accrued a severe debt floor of $${state.cash.toLocaleString()}. The bank has defaulted access grids and locked primary data racks.` 
                : 'The Board of Directors voted 4-1 to immediately strip your executive authority and terminate your CEO position due to critically low performance.'}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-3 text-xs border-t border-slate-900 font-mono">
              <div><span className="text-slate-500">Days Active:</span> <span className="font-bold">{state.daysElapsed} days</span></div>
              <div><span className="text-slate-500">Peak Valuation:</span> <span className="font-bold text-cyan-400">${state.valuation.toLocaleString()}</span></div>
              <div><span className="text-slate-500">Models registers:</span> <span className="font-bold text-purple-400">{state.trainedModels.length} models</span></div>
            </div>
          </div>

          <button
            onClick={() => {
              try {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('ai_titan_silicon_empire_save_v1');
                }
              } catch (e) {}
              setState({ ...initialGameState, onboardingCompleted: false });
              setActiveTab('DESK');
            }}
            className="w-full bg-gradient-to-r from-rose-600 to-red-600 text-slate-100 font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-950/40 text-center hover:opacity-95 cursor-pointer text-xs uppercase tracking-wider transition-all active:translate-y-px"
          >
            Liquidate and re-boot cluster blueprint
          </button>
        </div>
      </div>
      </>
    );
  }

  // Active component mapping inside overlays
  const renderOverlayContent = (tab: 'DESK' | 'CLUSTER' | 'LAB' | 'PRODUCTS' | 'KEYNOTES' | 'MARKET' | 'SOCIAL' | 'SAFETY' | 'AGENTS' | 'CONTRACTS' | 'SILICON_RD' | 'ADMIN' | 'WAR_ROOM') => {
    switch (tab) {
      case 'DESK':
        return <ExecutiveDesk state={state} updateState={updateState} addLogMessage={addLogMessage} />;
      case 'CLUSTER':
        return <ComputeCluster state={state} updateState={updateState} addLogMessage={addLogMessage} />;
      case 'LAB':
        return <ResearchLab state={state} updateState={updateState} addLogMessage={addLogMessage} />;
      case 'PRODUCTS':
        return <SoftwareProducts state={state} updateState={updateState} addLogMessage={addLogMessage} />;
      case 'KEYNOTES':
        return <MarketingEvents state={state} updateState={updateState} addLogMessage={addLogMessage} />;
      case 'MARKET':
        return <GlobalMarket state={state} updateState={updateState} addLogMessage={addLogMessage} />;
      case 'SOCIAL':
        return <SocialMediaMatrix state={state} updateState={updateState} addLogMessage={addLogMessage} />;
      case 'SAFETY':
        return <SafetyLab state={state} updateState={updateState} addLogMessage={addLogMessage} />;
      case 'AGENTS':
        return <AIAgents state={state} updateState={updateState} addLogMessage={addLogMessage} />;
      case 'CONTRACTS':
        return <SovereignContracts state={state} updateState={updateState} addLogMessage={addLogMessage} />;
      case 'SILICON_RD':
        return <SiliconRD state={state} updateState={updateState} addLogMessage={addLogMessage} />;
      case 'ADMIN':
        return <AdminMenu state={state} updateState={updateState} />;
      case 'WAR_ROOM':
        return <WarRoom state={state} updateState={updateState} addLogMessage={addLogMessage} />;
    }
  };

  const getOverlayInfo = (tab: string) => {
    switch (tab) {
      case 'DESK':
        return { title: 'CEO Office & Staff', icon: Users, color: 'text-purple-450', badge: 'EXECUTIVE HUB', border: 'border-purple-550/30', accent: '#c084fc' };
      case 'CLUSTER':
        return { title: 'Compute Cluster Grid', icon: Cpu, color: 'text-cyan-400', badge: 'INFRASTRUCTURE CORE', border: 'border-cyan-550/30', accent: '#00D1FF' };
      case 'LAB':
        return { title: 'Research & Development', icon: Brain, color: 'text-indigo-400', badge: 'MODEL LAB', border: 'border-indigo-550/30', accent: '#6366f1' };
      case 'PRODUCTS':
        return { title: 'Software & API Products', icon: Database, color: 'text-emerald-450', badge: 'COMMERCIAL GRID', border: 'border-emerald-555/30', accent: '#10b981' };
      case 'KEYNOTES':
        return { title: 'Marketing Events & PR', icon: Megaphone, color: 'text-rose-455', badge: 'PUBLIC RELATIONS', border: 'border-rose-555/30', accent: '#f43f5e' };
      case 'MARKET':
        return { title: 'Global Market Leaderboard', icon: Globe, color: 'text-amber-400', badge: 'COMPETITION MATRIX', border: 'border-amber-550/30', accent: '#f59e0b' };
      case 'SOCIAL':
        return { title: 'Social Media Matrix', icon: Network, color: 'text-cyan-400', badge: 'SENTIMENT INDEX', border: 'border-cyan-550/30', accent: '#0ea5e9' };
      case 'SAFETY':
        return { title: 'Safety & Alignment Lab', icon: ShieldCheck, color: 'text-emerald-400', badge: 'ALIGNMENT SHIELD', border: 'border-emerald-550/30', accent: '#14b8a6' };
      case 'AGENTS':
        return { title: 'Cognitive Runtimes', icon: Bot, color: 'text-purple-450', badge: 'AGENT SWARM', border: 'border-purple-550/30', accent: '#8b5cf6' };
      case 'CONTRACTS':
        return { title: 'Sovereign Contracts', icon: Briefcase, color: 'text-blue-400', badge: 'FEDERAL INFLUENCE', border: 'border-blue-550/30', accent: '#3b82f6' };
      case 'SILICON_RD':
        return { title: 'Custom Silicon Foundry', icon: Layers, color: 'text-pink-400', badge: 'HARDWARE ASICs', border: 'border-pink-550/30', accent: '#ec4899' };
      case 'ADMIN':
        return { title: 'Admin Override Console', icon: ShieldAlert, color: 'text-rose-500', badge: 'SYSTEM PROTOCOL', border: 'border-rose-550/30', accent: '#f43f5e' };
      case 'WAR_ROOM':
        return { title: 'Corporate War Room', icon: ShieldAlert, color: 'text-red-500', badge: 'BLACK OPS', border: 'border-red-550/30', accent: '#ef4444' };
      default:
        return { title: 'System Room', icon: Terminal, color: 'text-slate-450', badge: 'CORE UNIT', border: 'border-slate-800', accent: '#64748b' };
    }
  };

  // Quick cluster power metrics
  let activeGpuCount = (Object.values(state.gpusInstalled) as number[]).reduce((sum, qty) => sum + qty, 0);
  const degradedCount = (state.serverInstances || []).filter(s => s.status === 'SHUTDOWN' || s.condition < 50).length;

  return (
    <>
    <DesktopTitleBar onOpenSettings={() => setShowSettings(true)} />
    <ApiKeySettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    <div className="min-h-screen bg-[#050608] text-slate-100 font-sans flex flex-col relative selection:bg-cyan-500 selection:text-slate-900 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/6 to-purple-500/6 rounded-full filter blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/6 to-emerald-500/6 rounded-full filter blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-[30%] right-[25%] w-[400px] h-[400px] bg-gradient-to-tr from-indigo-500/4 to-cyan-500/4 rounded-full filter blur-[180px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Main Game Executive Header */}
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-900/80 sticky top-0 z-40 px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-lg shadow-black/40">
        
        {/* Playback & clock widget */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-lg shadow-cyan-500/10 font-mono tracking-tighter text-lg">
              AT
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                AI Titan <span className="text-cyan-400 font-medium">Silicon Empire</span>
              </h1>
              <div className="text-[9px] text-cyan-400 font-mono tracking-widest leading-none uppercase font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                EXECUTIVE TERMINAL v1.2.5
              </div>
            </div>
          </div>

          {/* World Clock controls */}
          <div className="bg-slate-900/60 border border-slate-850 px-3.5 py-1.5 rounded-xl flex items-center gap-3 shadow-inner backdrop-blur-md">
            <div className="text-center min-w-[120px]">
              <span id="calendar_date_display" className="font-extrabold font-mono text-[11px] text-slate-200 tracking-tight block">
                {state.currentDate}
              </span>
              <span id="days_elapsed_display" className="text-[8px] font-mono text-cyan-400/80 font-bold block uppercase tracking-wider">
                Day {state.daysElapsed}
              </span>
            </div>

            {/* Playback triggers */}
            <div className="flex gap-1 border-l border-slate-800/80 pl-3">
              {[
                { speed: 'PAUSED', icon: Pause, color: 'text-amber-400', label: 'PAUSE' },
                { speed: 'NORMAL', icon: Play, color: 'text-emerald-400', label: 'PLAY' },
                { speed: 'FAST', icon: FastForward, color: 'text-indigo-400', label: 'FAST' }
              ].map((ctrl) => {
                const isActive = state.gameSpeed === ctrl.speed;
                const Icon = ctrl.icon;
                return (
                  <button
                    key={ctrl.speed}
                    type="button"
                    onClick={() => updateState({ gameSpeed: ctrl.speed as any })}
                    className={`p-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive 
                        ? `${ctrl.color} bg-slate-950 border border-slate-800 shadow-inner` 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
                    }`}
                    title={ctrl.label}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
              
              <button
                type="button"
                onClick={() => updateState({ gameSpeed: 'HYPER' })}
                className={`p-1.5 px-2.5 rounded-lg cursor-pointer text-[8px] font-mono font-black transition-all duration-200 ${
                  state.gameSpeed === 'HYPER' 
                    ? 'text-purple-400 bg-slate-950 border border-slate-800 shadow-inner' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
                }`}
                title="Hyper speed"
              >
                HYP
              </button>
            </div>
          </div>

          {state.agiDoomMeter && state.agiDoomMeter > 0 ? (
            <div className="bg-slate-900/60 border border-slate-850 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-inner backdrop-blur-md animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping shrink-0" />
              <span className="text-[9px] font-mono text-purple-400 font-extrabold uppercase tracking-wider leading-none">AGI THREAT:</span>
              <span className="text-[11px] font-mono font-black text-purple-300 leading-none">
                {state.agiDoomMeter.toFixed(1)}%
              </span>
            </div>
          ) : null}
        </div>

        {/* Quick capital indicators row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-900/40 border border-slate-850 px-3.5 py-1.5 rounded-xl text-right relative">
            <span className="text-[8px] font-mono text-slate-500 uppercase block leading-none mb-0.5">Net Reserve</span>
            <span id="cash_header_display" className={`font-mono font-black text-sm block ${state.cash < 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              ${state.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <div className="absolute right-3.5 bottom-full mb-1 flex flex-col gap-1 pointer-events-none items-end select-none z-50">
              <AnimatePresence>
                {bubbles.filter(b => b.type === 'CASH').map(b => (
                  <motion.span
                    key={b.id}
                    initial={{ opacity: 0, y: 15, scale: 0.8 }}
                    animate={{ opacity: 1, y: -20, scale: 1.0 }}
                    exit={{ opacity: 0, y: -40, scale: 0.9 }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className={`text-[10px] font-mono font-black ${b.color === 'emerald' ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {b.text}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 px-3.5 py-1.5 rounded-xl text-right">
            <span className="text-[8px] font-mono text-slate-500 uppercase block leading-none mb-0.5">Valuation</span>
            <span id="valuation_header_display" className="font-mono font-black text-sm text-cyan-400 block">
              ${state.valuation.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-1.5 pl-1.5">
            <button
              onClick={() => {
                const nextMute = !muteState;
                setMuteAudio(nextMute);
                setMuteState(nextMute);
                if (!nextMute) {
                  setTimeout(() => playSound('click'), 50);
                }
              }}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-all border border-slate-800/80 cursor-pointer"
              title={muteState ? "Unmute" : "Mute"}
            >
              {muteState ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => setSideLogTrayOpen(!sideLogTrayOpen)}
              className={`p-2 rounded-xl transition-all border border-slate-800/80 cursor-pointer relative ${
                sideLogTrayOpen ? 'bg-cyan-950/20 text-cyan-400 border-cyan-800/40' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
              }`}
              title="Toggle System Console"
            >
              <Terminal className="h-4 w-4" />
              {!sideLogTrayOpen && state.newsLogs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              )}
            </button>

            <button
              onClick={() => { setIsSaveModalOpen(true); playSound('click'); }}
              className="text-[9px] font-mono font-black uppercase bg-slate-900 hover:bg-cyan-950/30 px-3 py-2 rounded-xl text-cyan-400 hover:text-cyan-300 transition-all border border-slate-800/80 cursor-pointer"
              title="Save blueprint to slot"
            >
              SAVE GAME
            </button>

            <button
              onClick={resetGame}
              className="text-[9px] font-mono font-black uppercase bg-slate-900 hover:bg-red-950/30 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 transition-all border border-slate-800/80 cursor-pointer"
              title="Restart"
            >
              RESET
            </button>
          </div>
        </div>
      </header>

      {/* CRISIS BANNER */}
      {state.activeCrisis && (
        <div className={`mx-6 mt-3 p-3 rounded-xl border flex items-center gap-3 shadow-md ${
          state.activeCrisis === 'MARKET_DOWNTURN' ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' :
          state.activeCrisis === 'POWER_OUTAGE' ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' :
          'bg-purple-950/40 border-purple-500/50 text-purple-200'
        }`}>
          <AlertOctagon className="h-5 w-5 shrink-0 animate-pulse" />
          <div className="flex-1">
            <h3 className="font-bold uppercase text-[10px] tracking-wider flex items-center gap-2">
              {state.activeCrisis === 'MARKET_DOWNTURN' ? 'MARKET DOWNTURN' :
               state.activeCrisis === 'POWER_OUTAGE' ? 'POWER OUTAGE' :
               'REGULATORY CRACKDOWN'}
              <span className="text-[9px] font-mono bg-black/40 px-2 py-0.5 rounded">
                {state.crisisDaysRemaining} DAYS REMAINING
              </span>
            </h3>
          </div>
        </div>
      )}

      {/* Main Workspace: Collapsible Side Console + Central Dashboard */}
      <main className="flex-1 w-full mx-auto px-6 py-4 flex gap-5 overflow-hidden relative">
        
        {/* CEO Holographic Dashboard Workspace */}
        <div className="flex-1 h-full flex flex-col space-y-4 overflow-hidden pr-0.5">
          
          {/* Top Panel: CEO Terminal Header & Active Neural pretraining status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* CEO Profile holographic card */}
            <div className="lg:col-span-6 bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group shadow-lg shadow-black/20">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar-ring">
                    <div className="w-11 h-11 rounded-xl bg-slate-950 flex items-center justify-center font-bold text-sm font-mono relative">
                      <span className="bg-clip-text text-transparent bg-gradient-to-br from-purple-300 via-indigo-300 to-cyan-300 font-black">{state.founder.name.split(' ').map(n => n[0]).join('')}</span>
                      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-100 tracking-tight leading-tight">{state.founder.name}</h3>
                    <div className="flex gap-1.5 mt-1">
                      <span className="text-[8px] font-mono px-1.5 py-0.5 bg-purple-950/40 border border-purple-900/40 text-purple-300 rounded uppercase font-bold tracking-wider">CEO / FOUNDER</span>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 bg-slate-950 text-slate-500 rounded uppercase font-bold tracking-wider">{state.founder.background.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-[10px] font-mono text-slate-500 bg-slate-950/40 border border-slate-850 px-2.5 py-1 rounded-lg">
                  <span className="block text-[8px] text-slate-600 font-bold uppercase tracking-widest mb-0.5">LOCATION</span>
                  <span className="text-slate-300 font-bold">{state.hqLocation.name}</span>
                </div>
              </div>

              {/* CEO Stats Progress Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-[10px] font-mono text-slate-400">
                <div className="flex justify-between items-center bg-slate-950/40 px-2.5 py-1 rounded border border-slate-850/50">
                  <span className="text-slate-500 font-bold">TECH</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400">{state.founder.technical}</span>
                    <div className="w-10 h-1 bg-slate-850 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-cyan-400" style={{ width: `${state.founder.technical}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 px-2.5 py-1 rounded border border-slate-850/50">
                  <span className="text-slate-500 font-bold">CHAR</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">{state.founder.charisma}</span>
                    <div className="w-10 h-1 bg-slate-850 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-emerald-400" style={{ width: `${state.founder.charisma}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 px-2.5 py-1 rounded border border-slate-850/50">
                  <span className="text-slate-500 font-bold">STRAT</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{state.founder.strategy}</span>
                    <div className="w-10 h-1 bg-slate-850 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-amber-400" style={{ width: `${state.founder.strategy}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 px-2.5 py-1 rounded border border-slate-850/50">
                  <span className="text-slate-500 font-bold">AGIL</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-400">{state.founder.agility}</span>
                    <div className="w-10 h-1 bg-slate-850 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-purple-400" style={{ width: `${state.founder.agility}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Pretraining Status panel */}
            <div className="lg:col-span-6 bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group shadow-lg shadow-black/20">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 pointer-events-none" />
              {state.training ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-[8px] font-bold font-mono text-purple-400 uppercase tracking-widest">ACTIVE NEURAL PRETRAINING</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-200 mt-1">{state.training.modelDraft.name}</h4>
                    </div>
                    <button
                      onClick={() => setOpenOverlay('LAB')}
                      className="text-[9px] font-bold font-mono px-2.5 py-1.5 bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 rounded-lg cursor-pointer transition-all"
                    >
                      OPEN COMPOSER
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-850/50 mt-2">
                    <div>
                      <span className="text-slate-500 block text-[7px] uppercase font-bold tracking-wider">LOSS RATIO</span>
                      <span className="font-bold text-slate-200 text-xs">{state.training.currentLoss.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[7px] uppercase font-bold tracking-wider">TOKENS</span>
                      <span className="font-bold text-slate-200 text-xs">{state.training.tokensProcessedTrillion.toFixed(3)}T</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[7px] uppercase font-bold tracking-wider">PROGRESS</span>
                      <span className="font-bold text-purple-400 text-xs">{state.training.progressPercentage.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-850 mt-2.5">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 rounded-full animate-pulse"
                      style={{ width: `${state.training.progressPercentage}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-between h-full space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <span className="text-[8px] font-bold font-mono text-slate-500 uppercase tracking-widest">NEURAL CORE PIPELINE</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal font-sans">
                    Pretraining turns compute raw operations into valuable model weights. Configure parameters and select datasets in the Lab to launch.
                  </p>
                  <button 
                    onClick={() => setOpenOverlay('LAB')}
                    className="cta-glow w-full bg-gradient-to-r from-indigo-950/50 via-purple-900/40 to-indigo-950/50 hover:from-indigo-900/60 hover:via-purple-800/50 hover:to-indigo-900/60 border border-purple-600/30 hover:border-purple-500/50 text-purple-200 font-bold py-2 px-4 rounded-xl text-center cursor-pointer text-[9px] tracking-wider uppercase transition-all shadow-lg shadow-purple-950/40 hover:shadow-purple-500/20"
                  >
                    🚀 ACTIVATE PRETRAINING CORE
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Operations Grid: Bento-style Command Center */}
          {(() => {
            const avgMorale = state.staff.length > 0 ? Math.round(state.staff.reduce((a, s) => a + s.morale, 0) / state.staff.length) : 0;
            const operationalServers = (state.serverInstances || []).filter(s => s.status === 'OPERATIONAL').length;
            const totalServers = (state.serverInstances || []).length;
            const activeContracts = (state.contracts || []).filter((c: any) => c.status === 'ACTIVE' || c.accepted).length;
            return null;
          })()}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4.5 pt-1 flex-1 relative dot-grid-bg scanline-ambient rounded-xl items-stretch">
            
            {/* ═══ COLUMN 1: TECHNICAL CORE (R&D & Infrastructure) ═══ */}
            <div className="flex flex-col gap-3 bg-slate-900/35 border border-slate-850/50 p-3.5 rounded-2xl relative z-10 justify-between h-full">
              <div className="flex items-center gap-2 border-b border-slate-850/60 pb-2 px-1 relative z-10">
                <Cpu className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">Technical & Compute Core</span>
              </div>
              
              <div className="flex flex-col gap-3.5 flex-1 justify-center">
                {/* COMPUTE */}
                <motion.div 
                  onClick={() => { setOpenOverlay('CLUSTER'); playSound('click'); }}
                  className="dash-card dash-card-featured group w-full cursor-pointer"
                  style={{ '--accent': '#00D1FF' } as React.CSSProperties}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-indigo-500/[0.03] pointer-events-none rounded-[inherit]" />
                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-[8px] font-mono text-cyan-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      COMPUTE INFRASTRUCTURE
                    </span>
                    <Cpu className="h-4.5 w-4.5 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="relative z-10 mt-auto">
                    <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">Server Cluster</h4>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-black text-cyan-400 font-mono leading-none">{activeGpuCount}</span>
                        <span className="text-[9px] text-slate-500 font-mono uppercase leading-tight">GPUs<br/>Online</span>
                      </div>
                      <div className="h-5 w-px bg-slate-800" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] text-slate-500 font-mono uppercase">Power Grid</span>
                          <span className={`text-[9px] font-mono font-bold ${state.powerGridStability > 80 ? 'text-cyan-400' : state.powerGridStability > 50 ? 'text-amber-400' : 'text-rose-400'}`}>{state.powerGridStability}%</span>
                        </div>
                        <div className="w-full h-1.5 glow-bar-container">
                          <div className="glow-bar-fill" style={{ width: `${state.powerGridStability}%`, '--glow-color': state.powerGridStability > 80 ? '#00D1FF' : state.powerGridStability > 50 ? '#fbbf24' : '#fb7185' } as React.CSSProperties} />
                        </div>
                      </div>
                      <div className="h-5 w-px bg-slate-800" />
                      <div className="flex items-end gap-[2px] h-5 opacity-60 group-hover:opacity-100 transition-opacity">
                        {[65, 80, 45, 90, 70, 55, 85, 60, 75, 50].map((v, i) => (
                          <div key={i} className="w-[3px] rounded-sm bg-cyan-400" style={{ height: `${v}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* R&D LAB */}
                <motion.div 
                  onClick={() => { setOpenOverlay('LAB'); playSound('click'); }}
                  className="dash-card dash-card-featured group w-full cursor-pointer"
                  style={{ '--accent': '#818cf8' } as React.CSSProperties}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-purple-500/[0.03] pointer-events-none rounded-[inherit]" />
                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-[8px] font-mono text-indigo-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      RESEARCH
                    </span>
                    <Brain className="h-4.5 w-4.5 text-indigo-400 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="relative z-10 mt-auto">
                    <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">R&D Lab</h4>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <div className="flex items-center gap-1 relative">
                        <span className="text-lg font-black text-indigo-400 font-mono leading-none">{(state.researchPoints || 0)}</span>
                        <span className="text-[8px] text-slate-500 font-mono uppercase">RP</span>
                        <div className="absolute left-0 bottom-full mb-1 flex flex-col gap-1 pointer-events-none items-start select-none z-50">
                          <AnimatePresence>
                            {bubbles.filter(b => b.type === 'RP').map(b => (
                              <motion.span
                                key={b.id}
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: -15, scale: 1.0 }}
                                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                                transition={{ duration: 1.0, ease: "easeOut" }}
                                className={`text-[9px] font-mono font-black ${b.color === 'indigo' ? 'text-indigo-400' : 'text-red-400'}`}
                              >
                                {b.text}
                              </motion.span>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="h-4 w-px bg-slate-800" />
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-slate-300 font-mono">{state.trainedModels.length}</span>
                        <span className="text-[8px] text-slate-500 font-mono uppercase">Models</span>
                      </div>
                      <div className="flex gap-[3px] ml-auto opacity-50 group-hover:opacity-100 transition-opacity">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= state.trainedModels.length ? 'bg-indigo-400' : 'bg-slate-800'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* SILICON FOUNDRY */}
                <motion.div 
                  onClick={() => { setOpenOverlay('SILICON_RD'); playSound('click'); }}
                  className="dash-card group w-full cursor-pointer"
                  style={{ '--accent': '#f472b6' } as React.CSSProperties}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.04] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-[8px] font-mono text-pink-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                      SILICON
                    </span>
                    <Layers className="h-4.5 w-4.5 text-pink-400 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="relative z-10 mt-auto">
                    <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-pink-300 transition-colors">Silicon Foundry</h4>
                    <div className="flex items-center gap-2.5 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-black text-pink-400 font-mono leading-none">{(state.customChips || []).length}</span>
                        <span className="text-[8px] text-slate-500 font-mono uppercase">Chips</span>
                      </div>
                      <div className="flex gap-[3px] ml-auto opacity-50 group-hover:opacity-100 transition-opacity">
                        {[1,2,3].map(i => (
                          <div key={i} className={`w-2.5 h-1.5 rounded-[2px] ${i <= (state.customChips || []).length ? 'bg-pink-400' : 'bg-slate-800'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[7.5px] text-slate-500 font-mono mt-1.5 border-t border-slate-900/60 pt-1">
                      <span>FOUNDRY PIPELINE:</span>
                      <span className="text-pink-400 font-bold">{state.activeChipProject ? state.activeChipProject.name : 'STANDBY'}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* ═══ COLUMN 2: REVENUE & MARKET GROWTH ═══ */}
            <div className="flex flex-col gap-3 bg-slate-900/35 border border-slate-850/50 p-3.5 rounded-2xl relative z-10 justify-between h-full">
              <div className="flex items-center gap-2 border-b border-slate-850/60 pb-2 px-1 relative z-10">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">Market & Revenue</span>
              </div>
              
              <div className="flex flex-col gap-3.5 flex-1 justify-center">
                {/* SOFTWARE & APIs */}
                <motion.div 
                  onClick={() => { setOpenOverlay('PRODUCTS'); playSound('click'); }}
                  className="dash-card dash-card-featured group w-full cursor-pointer"
                  style={{ '--accent': '#10b981' } as React.CSSProperties}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-cyan-500/[0.03] pointer-events-none rounded-[inherit]" />
                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-[8px] font-mono text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      COMMERCIAL
                    </span>
                    <Database className="h-4.5 w-4.5 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="relative z-10 mt-auto">
                    <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">Software & APIs</h4>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-black text-emerald-400 font-mono leading-none">{state.apps.length}</span>
                        <span className="text-[8px] text-slate-500 font-mono uppercase">Live</span>
                      </div>
                      <div className="h-4 w-px bg-slate-800" />
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold font-mono ${state.monthlyRevenue > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          ${state.monthlyRevenue > 999 ? `${(state.monthlyRevenue / 1000).toFixed(0)}K` : state.monthlyRevenue.toLocaleString()}
                        </span>
                        {state.monthlyRevenue > 0 && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                        {state.monthlyRevenue === 0 && <span className="text-[8px] text-slate-600 font-mono">—</span>}
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono uppercase">/mo</span>
                    </div>
                  </div>
                </motion.div>

                {/* CAMPAIGN & PR + GLOBAL RIVALS */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {/* CAMPAIGN & PR */}
                  <motion.div 
                    onClick={() => { setOpenOverlay('KEYNOTES'); playSound('click'); }}
                    className="dash-card group cursor-pointer"
                    style={{ '--accent': '#fb7185' } as React.CSSProperties}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <span className="text-[8px] font-mono text-rose-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        MARKETING
                      </span>
                      <Megaphone className="h-4.5 w-4.5 text-rose-400 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-rose-300 transition-colors">Campaign & PR</h4>
                      <div className="flex items-center gap-2.5 mt-1">
                        <div className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-rose-400" />
                          <span className="text-sm font-bold text-rose-400 font-mono">{state.hypeLevel}</span>
                        </div>
                        <div className="flex-1 ml-1">
                          <div className="w-full h-1.5 glow-bar-container">
                            <div className="glow-bar-fill" style={{ width: `${Math.min(state.hypeLevel, 100)}%`, '--glow-color': '#fb7185' } as React.CSSProperties} />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[7.5px] text-slate-500 font-mono mt-1.5 border-t border-slate-900/60 pt-1">
                        <span>BUZZ STATUS:</span>
                        <span className="text-rose-400 font-bold animate-pulse">▲ ACTIVE</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* GLOBAL RIVALS */}
                  <motion.div 
                    onClick={() => { setOpenOverlay('MARKET'); playSound('click'); }}
                    className="dash-card group cursor-pointer"
                    style={{ '--accent': '#fbbf24' } as React.CSSProperties}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <span className="text-[8px] font-mono text-amber-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        RIVALS
                      </span>
                      <Globe className="h-4.5 w-4.5 text-amber-400 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-amber-300 transition-colors">Global Rivals</h4>
                      <div className="flex items-center gap-2.5 mt-1">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-amber-400" />
                          <span className="text-sm font-bold text-amber-400 font-mono">#{state.competitors.length + 1}</span>
                        </div>
                        <div className="h-4 w-px bg-slate-800" />
                        <span className="text-[8px] text-slate-500 font-mono">Rankings</span>
                      </div>
                      <div className="flex justify-between items-center text-[7.5px] text-slate-500 font-mono mt-1.5 border-t border-slate-900/60 pt-1">
                        <span>RIVAL SPEED:</span>
                        <span className="text-amber-400 font-bold text-[7px] truncate max-w-[50px]">1.2x AGIL</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* SOCIAL MATRIX */}
                <motion.div 
                  onClick={() => { setOpenOverlay('SOCIAL'); playSound('click'); }}
                  className="dash-card group w-full cursor-pointer"
                  style={{ '--accent': '#22d3ee' } as React.CSSProperties}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-[8px] font-mono text-cyan-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      SOCIAL
                    </span>
                    <Network className="h-4.5 w-4.5 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="relative z-10 mt-auto">
                    <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">Social Matrix</h4>
                    <div className="flex items-center gap-2.5 mt-1">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-bold font-mono ${state.globalPublicSentiment >= 60 ? 'text-cyan-400' : state.globalPublicSentiment >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{state.globalPublicSentiment}%</span>
                      </div>
                      <div className="flex-1 ml-1">
                        <div className="w-full h-1.5 glow-bar-container">
                          <div className="glow-bar-fill" style={{ width: `${state.globalPublicSentiment}%`, '--glow-color': '#22d3ee' } as React.CSSProperties} />
                        </div>
                        <span className="text-[7px] text-slate-600 font-mono block mt-0.5">SENTIMENT</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* ═══ COLUMN 3: GOVERNANCE & AUTOMATION ═══ */}
            <div className="flex flex-col gap-3 bg-slate-900/35 border border-slate-850/50 p-3.5 rounded-2xl relative z-10 justify-between h-full">
              <div className="flex items-center gap-2 border-b border-slate-850/60 pb-2 px-1 relative z-10">
                <Users className="h-4 w-4 text-purple-400" />
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">Governance & Operations</span>
              </div>
              
              <div className="flex flex-col gap-3.5 flex-1 justify-center">
                {/* TALENT SUITE + COGNITIVE SWARM */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {/* CEO CORE (Talent Suite) */}
                  <motion.div 
                    onClick={() => { setOpenOverlay('DESK'); playSound('click'); }}
                    className="dash-card group cursor-pointer"
                    style={{ '--accent': '#c084fc' } as React.CSSProperties}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <span className="text-[8px] font-mono text-purple-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        CEO CORE
                      </span>
                      <Users className="h-4.5 w-4.5 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-purple-300 transition-colors">Talent Suite</h4>
                      <div className="flex items-center gap-2.5 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-black text-purple-400 font-mono leading-none">{state.staff.length}</span>
                          <span className="text-[8px] text-slate-500 font-mono uppercase">Staff</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* COGNITIVE SWARM */}
                  <motion.div 
                    onClick={() => { setOpenOverlay('AGENTS'); playSound('click'); }}
                    className="dash-card group cursor-pointer"
                    style={{ '--accent': '#a855f7' } as React.CSSProperties}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <span className="text-[8px] font-mono text-purple-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                        AGENTS
                      </span>
                      <Bot className="h-4.5 w-4.5 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-purple-300 transition-colors">Swarm</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-black text-purple-400 font-mono leading-none">{(state.aiAgents || []).length}</span>
                          <span className="text-[8px] text-slate-500 font-mono uppercase">Active</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* SOVEREIGN DESK + SAFETY LAB */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {/* SOVEREIGN DESK */}
                  <motion.div 
                    onClick={() => { setOpenOverlay('CONTRACTS'); playSound('click'); }}
                    className="dash-card group cursor-pointer"
                    style={{ '--accent': '#60a5fa' } as React.CSSProperties}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <span className="text-[8px] font-mono text-blue-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        INFLUENCE
                      </span>
                      <Briefcase className="h-4.5 w-4.5 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-blue-300 transition-colors">Sovereign</h4>
                      <div className="flex justify-between items-center text-[7.5px] text-slate-500 font-mono mt-1 border-t border-slate-900/60 pt-1">
                        <span>Lvl {state.lobbyingLevel}</span>
                        <span className="text-blue-400 font-bold">{(state.contracts || []).filter(c => c.status === 'ACTIVE').length} ACT</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* SAFETY LAB */}
                  <motion.div 
                    onClick={() => { setOpenOverlay('SAFETY'); playSound('click'); }}
                    className="dash-card group cursor-pointer"
                    style={{ '--accent': '#34d399' } as React.CSSProperties}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <span className="text-[8px] font-mono text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        SAFETY
                      </span>
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">Safety Lab</h4>
                      <div className="flex items-center gap-1 mt-1 justify-between">
                        <span className={`text-xs font-bold font-mono ${state.boardApproval >= 70 ? 'text-emerald-400' : state.boardApproval >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{state.boardApproval}%</span>
                        <span className="text-[7px] text-slate-500 font-mono uppercase">TRUST</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* BOTTOM TELEMETRY WIDGET */}
                <div className="bg-slate-950/40 border border-slate-850/50 rounded-2xl p-2.5 flex flex-col justify-center text-center text-[9px] font-mono text-slate-500 leading-normal select-none relative z-10 h-[72px]">
                  <span className="text-cyan-400/80 font-black block text-[8px] tracking-wider uppercase mb-0.5 animate-pulse">🛰️ CORE TELEMETRY STATUS</span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px] text-slate-450 mt-1">
                    <div>SWARM: <span className="text-slate-350">STABLE</span></div>
                    <div>LATENCY: <span className="text-slate-350">2.1ms</span></div>
                    <div>CACHE: <span className="text-slate-350">ACTIVE</span></div>
                    <div>PIPELINE: <span className="text-slate-350">OPTIMIZED</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ BOTTOM ROW: FULL-WIDTH OVERRIDE CONSOLE STRIP ═══ */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-2">
              <div 
                onClick={() => { setOpenOverlay('WAR_ROOM'); playSound('click'); }}
                className="flex items-center gap-3 px-3 py-2 bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 hover:border-red-500/50 rounded-xl cursor-pointer transition-all group relative z-10"
              >
                <ShieldAlert className="h-4 w-4 text-red-500/80 group-hover:text-red-400 transition-colors animate-pulse" />
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">War Room</span>
                <ChevronRight className="h-3 w-3 text-red-900 group-hover:text-red-400 ml-auto transition-colors" />
              </div>
              
              <div 
                onClick={() => { setOpenOverlay('ADMIN'); playSound('click'); }}
                className="flex items-center gap-3 px-3 py-2 bg-slate-900/20 hover:bg-slate-900/40 border border-slate-850/40 hover:border-rose-500/20 rounded-xl cursor-pointer transition-all group relative z-10"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-rose-500/60 group-hover:text-rose-400 transition-colors" />
                <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-300 font-bold uppercase tracking-wider transition-colors">Admin Console</span>
                <ChevronRight className="h-3 w-3 text-slate-700 group-hover:text-rose-400 ml-auto transition-colors" />
              </div>
            </div>

          </div>
        </div>

        {/* Collapsible Slide-Out System Console Tray */}
        <AnimatePresence>
          {sideLogTrayOpen && (
            <>
              {/* Outside backdrop click catcher to close drawer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSideLogTrayOpen(false)}
                className="absolute inset-0 bg-black/45 backdrop-blur-xs z-40 lg:hidden cursor-pointer"
              />
              <motion.div
                initial={{ opacity: 0.5, x: 320 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0.5, x: 320 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-80 h-full bg-slate-950/95 backdrop-blur-2xl border-l border-slate-900 shadow-[0_0_30px_rgba(0,0,0,0.7)] flex flex-col z-40 relative flex-shrink-0"
              >
                <div className="p-4 border-b border-slate-900 flex justify-between items-center">
                  <h4 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-cyan-400" />
                    System Console
                  </h4>
                  <button 
                    onClick={() => setSideLogTrayOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-lg cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                  {state.newsLogs.length === 0 ? (
                    <div className="text-slate-600 text-center py-8 text-xs font-mono">ALL SYSTEMS STATS NOMINAL. READY.</div>
                  ) : (
                    state.newsLogs.map((log, index) => {
                      let badgeColor = 'text-slate-400 border-slate-900 bg-slate-950/45';
                      let protocolLabel = `${log.type} PROTOCOL`;

                      if (log.type === 'EVENT') {
                        if (log.message.includes('HARDWARE UPGRADE')) {
                          badgeColor = 'text-purple-400 border-purple-950 bg-purple-950/20';
                          protocolLabel = 'HARDWARE PROTOCOL';
                        } else {
                          badgeColor = 'text-rose-400 border-rose-950 bg-rose-950/20';
                        }
                      } else if (log.type === 'MILESTONE') {
                        badgeColor = 'text-amber-400 border-amber-950 bg-amber-950/20';
                      } else if (log.type === 'SYSTEM') {
                        badgeColor = 'text-cyan-400 border-cyan-950 bg-cyan-950/20';
                      }

                      return (
                        <div
                          key={log.id}
                          className={`p-3 border rounded-xl space-y-1 leading-normal relative overflow-hidden ${badgeColor}`}
                        >
                          <div className="flex justify-between font-bold text-[9px] font-mono tracking-wider opacity-80">
                            <span>{protocolLabel}</span>
                            <span className="text-slate-500">{log.dateString}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{log.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </main>

      {/* Massive Glassmorphic Overlay Popups */}
      <AnimatePresence>
        {openOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xl flex items-center justify-center p-6"
          >
            {/* Backdrop close click area */}
            <div className="absolute inset-0 cursor-default" onClick={() => setOpenOverlay(null)} />

            {/* Window Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`w-full max-w-5xl h-[88vh] bg-slate-950/95 rounded-2xl border ${getOverlayInfo(openOverlay).border} flex flex-col overflow-hidden relative`}
              style={{ 
                boxShadow: `0 0 50px -10px color-mix(in srgb, ${getOverlayInfo(openOverlay).accent} 30%, transparent), 0 25px 50px -12px rgba(0,0,0,0.5)`
              }}
            >
              {/* Top glowing accent line */}
              <div 
                className="h-[2px] w-full shrink-0 relative z-10" 
                style={{ background: `linear-gradient(to right, transparent, ${getOverlayInfo(openOverlay).accent}, transparent)` }} 
              />
              {/* Glowing header bar */}
              <div className="px-5 py-4 border-b border-slate-900 bg-slate-900/40 backdrop-blur-md flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
                    {React.createElement(getOverlayInfo(openOverlay).icon, { className: `h-5 w-5 ${getOverlayInfo(openOverlay).color}` })}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-100 text-sm font-sans tracking-wide">{getOverlayInfo(openOverlay).title}</h3>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block mt-0.5">
                      {getOverlayInfo(openOverlay).badge} Protocol Connected
                    </span>
                  </div>
                </div>

                {/* Global Speed & Cash Widget within Modal Overlay */}
                <div className="hidden sm:flex items-center gap-4 border border-slate-900 bg-slate-950/90 rounded-2xl px-4 py-1.5 shadow-inner">
                  {/* Cash display */}
                  <div className="text-right">
                    <span className="text-[8px] text-slate-500 font-mono block uppercase leading-none">Capital Balance</span>
                    <span className={`font-mono text-xs font-bold ${state.cash < 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-450'}`}>
                      ${state.cash.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="h-6 w-[1px] bg-slate-850" />
                  
                  {/* Calendar Display */}
                  <div className="text-center min-w-[75px]">
                    <span className="text-[10px] font-extrabold font-mono text-slate-200 tracking-tight block">
                      {state.currentDate}
                    </span>
                    <span className="text-[7px] font-mono text-cyan-400 font-bold block uppercase leading-none mt-0.5">
                      Day {state.daysElapsed}
                    </span>
                  </div>

                  <div className="h-6 w-[1px] bg-slate-850" />

                  {/* Playback speed triggers */}
                  <div className="flex gap-1">
                    {[
                      { speed: 'PAUSED', icon: Pause, color: 'text-amber-400', label: 'PAUSE' },
                      { speed: 'NORMAL', icon: Play, color: 'text-emerald-400', label: 'PLAY' },
                      { speed: 'FAST', icon: FastForward, color: 'text-indigo-400', label: 'FAST' }
                    ].map((ctrl) => {
                      const isActive = state.gameSpeed === ctrl.speed;
                      const Icon = ctrl.icon;
                      return (
                        <button
                          key={ctrl.speed}
                          type="button"
                          onClick={() => updateState({ gameSpeed: ctrl.speed as any })}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            isActive 
                              ? `${ctrl.color} bg-slate-900 border border-slate-800 shadow-inner` 
                              : 'text-slate-500 hover:text-slate-350'
                          }`}
                          title={ctrl.label}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      );
                    })}
                    
                    <button
                      type="button"
                      onClick={() => updateState({ gameSpeed: 'HYPER' })}
                      className={`p-1 px-1.5 rounded cursor-pointer text-[8px] font-mono font-black transition-colors ${
                        state.gameSpeed === 'HYPER' 
                          ? 'text-purple-400 bg-slate-900 border border-slate-800 shadow-inner' 
                          : 'text-slate-500 hover:text-slate-350'
                      }`}
                      title="Hyper speed"
                    >
                      HYP
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-slate-500 border border-slate-900 px-2 py-0.5 rounded uppercase hidden lg:block">
                    Press ESC key to close
                  </span>
                  <button
                    onClick={() => setOpenOverlay(null)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-850 hover:text-rose-400 border border-slate-850 hover:border-rose-950/50 rounded-xl cursor-pointer text-slate-400 transition-all flex items-center justify-center"
                    title="Close Overlay (ESC)"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Room Workspace */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950/95">
                {renderOverlayContent(openOverlay)}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Game Slot Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="absolute inset-0" onClick={() => setIsSaveModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-slate-950 border border-slate-850 p-6 rounded-2xl relative z-10 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="font-extrabold text-slate-100 uppercase font-mono text-sm tracking-wider flex items-center gap-2">
                  <FolderOpen className="h-4.5 w-4.5 text-cyan-400" />
                  Save Company Blueprint
                </h3>
                <button 
                  onClick={() => setIsSaveModalOpen(false)} 
                  className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((slotNum) => {
                  const slotKey = `ai_titan_save_slot_${slotNum}`;
                  const rawSlotData = localStorage.getItem(slotKey);
                  const slotData = rawSlotData ? JSON.parse(rawSlotData) : null;

                  return (
                    <div 
                      key={slotNum}
                      className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex flex-col gap-3 justify-between"
                    >
                      <div className="flex justify-between items-center border-b border-slate-950 pb-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500">SLOT 0{slotNum}</span>
                        {slotData ? (
                          <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-900/35">OCCUPIED</span>
                        ) : (
                          <span className="text-[8px] font-mono text-slate-650 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">EMPTY</span>
                        )}
                      </div>

                      {slotData && (
                        <div className="text-[10px] font-mono text-slate-350 space-y-0.5">
                          <div>COMPANY: <span className="text-slate-200 font-bold">{slotData.companyName}</span></div>
                          <div>DATE: <span className="text-slate-200 font-bold">{slotData.currentDate}</span></div>
                          <div>CAPITAL: <span className="text-emerald-400">${slotData.cash.toLocaleString()}</span></div>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          try {
                            localStorage.setItem(slotKey, JSON.stringify(state));
                            playSound('click');
                            addLogMessage(`💾 SYSTEM STATE SAVE: Saved current blueprint to Slot ${slotNum}.`, 'SYSTEM');
                            setIsSaveModalOpen(false);
                          } catch (err) {
                            console.warn("Failed to write manual slot save", err);
                          }
                        }}
                        className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-100 font-bold py-2 rounded-xl text-xs uppercase font-mono tracking-wider transition-all cursor-pointer text-center"
                      >
                        {slotData ? "Overwrite Save Blueprint" : "Create Save Blueprint"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <KeynoteLiveModal state={state} updateState={updateState} addLogMessage={addLogMessage} />

      {/* Slack alert direct message modal popup */}
      <AnimatePresence>
        {state.activeSlackChat && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-14 right-6 w-96 bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl z-50 backdrop-blur-md"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-t-2xl" />
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center font-black font-mono text-cyan-400 text-sm shadow-inner shrink-0">
                {state.activeSlackChat.employeeName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xs font-black text-slate-100 truncate">{state.activeSlackChat.employeeName}</h4>
                  <span className="text-[8px] font-mono font-bold text-cyan-500 uppercase tracking-widest">{state.activeSlackChat.role}</span>
                </div>
                <p className="text-xs text-slate-350 leading-relaxed font-sans select-text">
                  "{state.activeSlackChat.message}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 mt-4">
              {state.activeSlackChat.options.map((opt, i) => {
                let isDisabled = false;
                if (opt.actionId === 'SLACK_RESEARCH_FUND' && state.cash < 5000) isDisabled = true;
                if (opt.actionId === 'SLACK_ALIGNMENT_PATCH' && (state.researchPoints || 0) < 8) isDisabled = true;
                if (opt.actionId === 'SLACK_REPASTE_CORES' && state.cash < 3000) isDisabled = true;
                if (opt.actionId === 'SLACK_LEGAL_COUNSEL' && state.cash < 8000) isDisabled = true;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      let nextCash = state.cash;
                      let nextRP = state.researchPoints;
                      let nextSentiment = state.globalPublicSentiment;
                      let nextModels = [...state.trainedModels];
                      let nextServers = [...(state.serverInstances || [])];

                      if (opt.actionId === 'SLACK_RESEARCH_FUND') {
                        nextCash -= 5000;
                        nextRP += 12;
                        addLogMessage(`🤝 WORKPLACE DIRECTIVE: Funded backend optimization research. -$5,000 cash, +12 Research Points!`, 'SYSTEM');
                      } else if (opt.actionId === 'SLACK_ALIGNMENT_PATCH') {
                        nextRP -= 8;
                        const activeModelIndex = nextModels.findIndex(m => m.id === state.activeModelId);
                        if (activeModelIndex !== -1) {
                          nextModels[activeModelIndex] = {
                            ...nextModels[activeModelIndex],
                            safetyScore: Math.min(100, nextModels[activeModelIndex].safetyScore + 5)
                          };
                        }
                        addLogMessage(`🛡️ WORKPLACE DIRECTIVE: Deployed diagnostic alignment patch. -8 Research Points, active model Safety increased!`, 'SYSTEM');
                      } else if (opt.actionId === 'SLACK_REPASTE_CORES') {
                        nextCash -= 3000;
                        nextServers = nextServers.map(srv => ({ ...srv, condition: 100 }));
                        addLogMessage(`⚙️ WORKPLACE DIRECTIVE: Serviced server thermal paste. -$3,000 cash, all cluster servers restored to 100% condition!`, 'SYSTEM');
                      } else if (opt.actionId === 'SLACK_LEGAL_COUNSEL') {
                        nextCash -= 8000;
                        nextSentiment = Math.min(100, nextSentiment + 10);
                        addLogMessage(`⚖️ WORKPLACE DIRECTIVE: Hired legal compliance counsel. -$8,000 cash, public sentiment increased (+10)!`, 'SYSTEM');
                      } else {
                        addLogMessage(`💬 WORKPLACE DIRECTIVE: Dismissed direct message request from ${state.activeSlackChat?.employeeName}.`, 'SYSTEM');
                      }

                      updateState({
                        cash: parseFloat(nextCash.toFixed(2)),
                        researchPoints: nextRP,
                        globalPublicSentiment: parseFloat(nextSentiment.toFixed(2)),
                        trainedModels: nextModels,
                        serverInstances: nextServers,
                        activeSlackChat: null
                      });
                      playSound('click');
                    }}
                    className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-800/40 text-slate-200 hover:text-white font-extrabold text-[10px] py-2 px-3 rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:hover:border-slate-850 text-left"
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer credits and copyright details */}
      <footer className="h-10 bg-slate-950 border-t border-slate-900/60 text-slate-500 px-6 flex items-center justify-between shrink-0 overflow-hidden font-mono text-[9px] select-none uppercase font-bold relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-6 shrink-0 z-10 bg-slate-950 pr-4">
          <div className="text-[9px] font-bold uppercase flex items-center gap-1.5 text-cyan-500/80">
            <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
            LIVE ACCESS GRID
          </div>
        </div>

        {/* Scrolling Ticker */}
        <div className="flex-1 overflow-hidden relative mx-4 select-none pointer-events-none">
          <div className="flex gap-16 whitespace-nowrap animate-ticker">
            <span>🌐 NETWORK COMPILERS ACTIVE</span>
            <span className="text-cyan-400 font-extrabold">📈 VALUATION: ${state.valuation.toLocaleString()}</span>
            <span>⚡ POWER GRID STABILITY: {state.powerGridStability ?? 100}%</span>
            <span className={state.cash < 0 ? "text-red-400" : "text-emerald-400"}>💰 RESERVE: ${state.cash.toLocaleString()}</span>
            {state.competitors?.map(comp => (
              <span key={comp.id} className="text-slate-400">
                🏢 {comp.name}: {comp.leadModelName || 'N/A'} (Score: {comp.leadModelScore}%) | Market Share: {comp.marketShare}%
              </span>
            ))}
            {state.activeCrisis ? (
              <span className="text-rose-400 animate-pulse">🚨 CURRENT CRISIS: {state.activeCrisis.replace('_', ' ')}</span>
            ) : null}
            <span>🔋 DATASTREAM: INTERCONNECT AT 10.4 TB/S</span>
          </div>
        </div>

        <div className="flex gap-4 shrink-0 z-10 bg-slate-950 pl-4">
          <div className="text-[9px] text-slate-650 px-2 border-l border-slate-900">
            SILICON_EMPIRE_v1.2.5
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

