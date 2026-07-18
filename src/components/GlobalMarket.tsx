import React from 'react';
import { Award, Landmark, TrendingUp, Trophy, Sparkles, Building2, ChevronRight, CheckCircle, ShieldAlert } from 'lucide-react';
import { GameState, Competitor, FundingStage, ModelDomain } from '../types';
import { getMetricLabel, getMetricShortLabel } from './ResearchLab';

interface GlobalMarketProps {
  state: GameState;
  updateState: (newState: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'EVENT' | 'MILESTONE' | 'MARKET') => void;
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function GlobalMarket({ state, updateState, addLogMessage }: GlobalMarketProps) {
  const [boardType, setBoardType] = React.useState<'AVERAGE' | 'CODING' | 'MATH' | 'EXPERTISE' | 'ALIGNMENT' | 'ARENA'>('AVERAGE');
  const [marketDomain, setMarketDomain] = React.useState<ModelDomain>('TEXT_LLM');
  
  // Combine user-trained models & competitor models into a single comparative leaderboard array
  interface LeaderboardRow {
    companyName: string;
    modelName: string;
    mmlu: number;
    humanEval: number;
    gsm8k: number;
    math: number;
    gpqa: number;
    sweBench: number;
    ifeval: number;
    arenaElo: number;
    average: number;
    isUser: boolean;
  }

  const leaderboard: LeaderboardRow[] = [];

  // Add Competitors
  state.competitors.forEach((c) => {
    const isImageModel = c.leadModelName.toLowerCase().includes('image');
    const isVideoModel = c.leadModelName.toLowerCase().includes('video');
    const compDomain: ModelDomain = isImageModel ? 'IMAGE_DIFFUSION' : isVideoModel ? 'VIDEO_GENERATION' : 'TEXT_LLM';
    
    let displayModelName = c.leadModelName;
    let displayModelScore = c.leadModelScore;
    
    if (compDomain !== marketDomain) {
      const suffix = marketDomain === 'IMAGE_DIFFUSION' ? ' Diffusion v1.2' : marketDomain === 'VIDEO_GENERATION' ? ' Motion v1.0' : ' Base';
      displayModelName = `${c.name.split(' ')[0]}${suffix}`;
      displayModelScore = Math.max(50, Math.min(99.0, c.leadModelScore * (marketDomain === 'IMAGE_DIFFUSION' ? 0.92 : 0.85)));
    }

    let mmlu = displayModelScore;
    let evalScore = displayModelScore - 3;
    let gsm8k = displayModelScore - 2;
    let mathScore = displayModelScore - 6;
    let gpqa = displayModelScore - 10;
    let sweBench = displayModelScore - 18;
    let ifeval = displayModelScore + 1;
    let arenaElo = displayModelScore + 2;

    if (c.id === 'google') {
      mmlu = displayModelScore; 
      evalScore = displayModelScore - 4.4; 
      gsm8k = displayModelScore + 1.9; 
      mathScore = displayModelScore - 9.3;
      gpqa = displayModelScore - 8.2;
      sweBench = displayModelScore - 16.5;
      ifeval = displayModelScore - 1.2;
      arenaElo = displayModelScore + 0.5;
    } else if (c.id === 'openai') {
      mmlu = displayModelScore; 
      evalScore = displayModelScore - 0.7; 
      gsm8k = displayModelScore + 2.0; 
      mathScore = displayModelScore - 6.7;
      gpqa = displayModelScore - 6.1;
      sweBench = displayModelScore - 12.4;
      ifeval = displayModelScore + 2.5;
      arenaElo = displayModelScore + 4.1;
    } else if (c.id === 'anthropic') {
      mmlu = displayModelScore; 
      evalScore = displayModelScore + 0.4; 
      gsm8k = displayModelScore - 0.2; 
      mathScore = displayModelScore - 6.6;
      gpqa = displayModelScore - 5.5;
      sweBench = displayModelScore - 11.2;
      ifeval = displayModelScore + 4.0;
      arenaElo = displayModelScore + 3.2;
    } else if (c.id === 'meta') {
      mmlu = displayModelScore; 
      evalScore = displayModelScore - 2.9; 
      gsm8k = displayModelScore - 0.6; 
      mathScore = displayModelScore - 14.1;
      gpqa = displayModelScore - 15.3;
      sweBench = displayModelScore - 22.0;
      ifeval = displayModelScore + 0.5;
      arenaElo = displayModelScore + 1.1;
    } else if (c.id === 'xai') {
      mmlu = displayModelScore; 
      evalScore = displayModelScore - 3.9; 
      gsm8k = displayModelScore - 2.1; 
      mathScore = displayModelScore - 15.0;
      gpqa = displayModelScore - 17.5;
      sweBench = displayModelScore - 24.1;
      ifeval = displayModelScore - 1.8;
      arenaElo = displayModelScore + 2.6;
    } else if (c.id === 'deepseek') {
      mmlu = displayModelScore; 
      evalScore = displayModelScore + 2.5; 
      gsm8k = displayModelScore + 1.2; 
      mathScore = displayModelScore - 5.1;
      gpqa = displayModelScore - 7.0;
      sweBench = displayModelScore - 13.0;
      ifeval = displayModelScore - 2.1;
      arenaElo = displayModelScore + 1.5;
    }

    const average = (mmlu + evalScore + gsm8k + mathScore + gpqa + sweBench + ifeval + arenaElo) / 8;

    leaderboard.push({
      companyName: c.name,
      modelName: displayModelName,
      mmlu: parseFloat(Math.min(99.9, mmlu).toFixed(1)),
      humanEval: parseFloat(Math.min(99.9, evalScore).toFixed(1)),
      gsm8k: parseFloat(Math.min(99.9, gsm8k).toFixed(1)),
      math: parseFloat(Math.min(99.9, mathScore).toFixed(1)),
      gpqa: parseFloat(Math.min(99.9, gpqa).toFixed(1)),
      sweBench: parseFloat(Math.min(99.9, sweBench).toFixed(1)),
      ifeval: parseFloat(Math.min(99.9, ifeval).toFixed(1)),
      arenaElo: parseFloat(Math.min(99.9, arenaElo).toFixed(1)),
      average: Math.round(average * 10) / 10,
      isUser: false,
    });
  });

  // Add Player Models of the active filtered domain!
  state.trainedModels.filter(m => (m.domain || 'TEXT_LLM') === marketDomain).forEach((m) => {
    const mmluVerified = !m.benchmarkStatus || m.benchmarkStatus.mmlu === 'VERIFIED';
    const humanEvalVerified = !m.benchmarkStatus || m.benchmarkStatus.humanEval === 'VERIFIED';
    const gsm8kVerified = !m.benchmarkStatus || m.benchmarkStatus.gsm8k === 'VERIFIED';
    const mathVerified = !m.benchmarkStatus || m.benchmarkStatus.math === 'VERIFIED';
    const gpqaVerified = !m.benchmarkStatus || m.benchmarkStatus.gpqa === 'VERIFIED';
    const sweVerified = !m.benchmarkStatus || m.benchmarkStatus.sweBench === 'VERIFIED';
    const ifVerified = !m.benchmarkStatus || m.benchmarkStatus.ifeval === 'VERIFIED';
    const eloVerified = !m.benchmarkStatus || m.benchmarkStatus.arenaElo === 'VERIFIED';

    // Get effective penalized values
    const getEffectiveValue = (metric: keyof typeof m.benchmarks) => {
      let val = m.benchmarks[metric];
      if (m.flaws) {
        m.flaws.forEach(flaw => {
          if (!flaw.isFixed && flaw.metricImpacted === metric) {
            val *= (1 - flaw.penaltyPct / 100);
          }
        });
      }
      return val;
    };

    const mmluVal = mmluVerified ? getEffectiveValue('mmlu') : 0;
    const humanEvalVal = humanEvalVerified ? getEffectiveValue('humanEval') : 0;
    const gsm8kVal = gsm8kVerified ? getEffectiveValue('gsm8k') : 0;
    const mathVal = mathVerified ? getEffectiveValue('math') : 0;
    const gpqaVal = gpqaVerified ? getEffectiveValue('gpqa') : 0;
    const sweVal = sweVerified ? getEffectiveValue('sweBench') : 0;
    const ifVal = ifVerified ? getEffectiveValue('ifeval') : 0;
    const eloVal = eloVerified ? getEffectiveValue('arenaElo') : 0;

    const verifiedCount = 
      (mmluVerified ? 1 : 0) + 
      (humanEvalVerified ? 1 : 0) + 
      (gsm8kVerified ? 1 : 0) + 
      (mathVerified ? 1 : 0) +
      (gpqaVerified ? 1 : 0) +
      (sweVerified ? 1 : 0) +
      (ifVerified ? 1 : 0) +
      (eloVerified ? 1 : 0);

    const average = verifiedCount > 0 ? (mmluVal + humanEvalVal + gsm8kVal + mathVal + gpqaVal + sweVal + ifVal + eloVal) / verifiedCount : 0;

    leaderboard.push({
      companyName: `${state.companyName || state.founder.name} (You)`,
      modelName: m.name,
      mmlu: mmluVerified ? mmluVal : -1,
      humanEval: humanEvalVerified ? humanEvalVal : -1,
      gsm8k: gsm8kVerified ? gsm8kVal : -1,
      math: mathVerified ? mathVal : -1,
      gpqa: gpqaVerified ? gpqaVal : -1,
      sweBench: sweVerified ? sweVal : -1,
      ifeval: ifVerified ? ifVal : -1,
      arenaElo: eloVerified ? eloVal : -1,
      average: verifiedCount === 8 ? Math.round(average * 10) / 10 : -1,
      isUser: true,
    });
  });

  // Sort Leaderboard dynamically based on chosen metrics, moving unverified ones to the bottom
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (boardType === 'CODING') {
      // Sort primarily by SWE-bench, fallback to HumanEval
      const valA = a.sweBench !== -1 ? a.sweBench : a.humanEval;
      const valB = b.sweBench !== -1 ? b.sweBench : b.humanEval;
      if (valA === -1 && valB !== -1) return 1;
      if (valB === -1 && valA !== -1) return -1;
      return valB - valA;
    }
    if (boardType === 'MATH') {
      // Sort primarily by competition MATH, fallback to GSM8K
      const valA = a.math !== -1 ? a.math : a.gsm8k;
      const valB = b.math !== -1 ? b.math : b.gsm8k;
      if (valA === -1 && valB !== -1) return 1;
      if (valB === -1 && valA !== -1) return -1;
      return valB - valA;
    }
    if (boardType === 'EXPERTISE') {
      // Sort primarily by GPQA, fallback to MMLU
      const valA = a.gpqa !== -1 ? a.gpqa : a.mmlu;
      const valB = b.gpqa !== -1 ? b.gpqa : b.mmlu;
      if (valA === -1 && valB !== -1) return 1;
      if (valB === -1 && valA !== -1) return -1;
      return valB - valA;
    }
    if (boardType === 'ALIGNMENT') {
      if (a.ifeval === -1 && b.ifeval !== -1) return 1;
      if (b.ifeval === -1 && a.ifeval !== -1) return -1;
      return b.ifeval - a.ifeval;
    }
    if (boardType === 'ARENA') {
      if (a.arenaElo === -1 && b.arenaElo !== -1) return 1;
      if (b.arenaElo === -1 && a.arenaElo !== -1) return -1;
      return b.arenaElo - a.arenaElo;
    }
    // Default: AVG
    if (a.average === -1 && b.average !== -1) return 1;
    if (b.average === -1 && a.average !== -1) return -1;
    return b.average - a.average;
  });

  // Pitch requirements for each VC funding round
  interface VCPlan {
    stage: FundingStage;
    grantCash: number;
    equitySold: number;
    name: string;
    desc: string;
    reqMmlu: number;
    reqValuation: number;
  }

  const VC_ROUNDS: VCPlan[] = [
    {
      stage: 'SEED',
      grantCash: 1200000,
      equitySold: 12,
      name: 'Angel Syndicate Series',
      desc: 'Dilute minor equity to tech veterans to expand core GPUs and hire more PhD researchers.',
      reqMmlu: 65,
      reqValuation: 2000000,
    },
    {
      stage: 'SERIES_A',
      grantCash: 5000000,
      equitySold: 15,
      name: 'Sand Hill Ventures',
      desc: 'Venture Capital firm steps in to finance heavy Blackwell compute cluster blocks.',
      reqMmlu: 76,
      reqValuation: 6000000,
    },
    {
      stage: 'SERIES_B',
      grantCash: 15000000,
      equitySold: 15,
      name: 'Sovereign Wealth Funds',
      desc: 'Acquire massive capital backing to fund nuclear datacenter deals and compute gigaclusters.',
      reqMmlu: 84,
      reqValuation: 20000000,
    },
    {
      stage: 'SERIES_C',
      grantCash: 60000000,
      equitySold: 18,
      name: 'Consortium IPO Deck',
      desc: 'The ultimate investment stage. Achieve institutional prominence to rival Google and OpenAI.',
      reqMmlu: 90,
      reqValuation: 80000000,
    }
  ];

  // Pick next candidate VC stage
  const getNextApplicableVCRound = (): VCPlan | null => {
    const list: FundingStage[] = ['BOOTSTRAPPED', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C'];
    const currentIdx = list.indexOf(state.fundingStage);
    if (currentIdx === -1 || currentIdx >= VC_ROUNDS.length) return null;
    return VC_ROUNDS[currentIdx];
  };

  const nextVCRound = getNextApplicableVCRound();

  // Exec Pitch dilution event
  const pitchRound = (plan: VCPlan) => {
    if (state.activeCrisis === 'MARKET_DOWNTURN') {
      addLogMessage(`❌ PITCH DECLINED: All venture capital funding is currently frozen due to the Global Market Downturn. Try again when the economy recovers.`, 'SYSTEM');
      return;
    }

    const highestModel = [...state.trainedModels].sort((a,b) => b.benchmarks.mmlu - a.benchmarks.mmlu)[0];
    const maxMmlu = highestModel ? highestModel.benchmarks.mmlu : 0;

    if (maxMmlu < plan.reqMmlu) {
      addLogMessage(`❌ PITCH DECLINED: VC firm "${plan.name}" requested model average MMLU score > ${plan.reqMmlu}. Your best model scored: ${maxMmlu.toFixed(1)}%.`, 'SYSTEM');
      return;
    }

    if (state.valuation < plan.reqValuation) {
      addLogMessage(`❌ PITCH DECLINED: VC firm requires company valuation > $${plan.reqValuation.toLocaleString()}. Yours: $${state.valuation.toLocaleString()}.`, 'SYSTEM');
      return;
    }

    // Dilute
    const nextEquity = Math.max(5, state.equityPercent - plan.equitySold);
    const nextCash = state.cash + plan.grantCash;

    updateState({
      cash: nextCash,
      equityPercent: nextEquity,
      fundingStage: plan.stage,
      boardApproval: Math.min(100, state.boardApproval + 10), // VCs happy
    });

    addLogMessage(`🚀 CAPITAL FUNDED: Successfully closed pitching round! VC injected +$${plan.grantCash.toLocaleString()} capital. Equity diluted (-${plan.equitySold}%). Venture Board satisfied.`, 'MILESTONE');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      
      {/* Benchmark Leaderboard Widget */}
      <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 flex flex-col h-[520px] shadow-xl shadow-cyan-950/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
        
        <div className="flex flex-col gap-1 border-b border-slate-800/80 pb-3 mb-3 shrink-0 relative z-10">
          <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Trophy className="h-4.5 w-4.5 text-amber-450 animate-pulse" />
            LMSYS Global AI Leaderboard
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Standardized evaluation ranks. Your trained models automatically enter comparison grids once validation completes.
          </p>
        </div>

        {/* Domain Filter Sub-tabs */}
        <div className="flex gap-2 mb-3 relative z-10 shrink-0 flex-wrap">
          {[
            { id: 'TEXT_LLM', label: '📝 Large Language Models', color: 'border-purple-500/40 text-purple-300' },
            { id: 'IMAGE_DIFFUSION', label: '🖼️ Image Diffusion', color: 'border-cyan-500/40 text-cyan-300' },
            { id: 'VIDEO_GENERATION', label: '🎥 Video Motion', color: 'border-emerald-500/40 text-emerald-300' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setMarketDomain(tab.id as ModelDomain); }}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold cursor-pointer transition-all duration-150 flex items-center gap-1.5 ${
                marketDomain === tab.id
                  ? 'bg-purple-950/20 shadow-md shadow-purple-500/10 ' + tab.color
                  : 'bg-slate-950/30 border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Category Filter Sub-tabs */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-850 mb-4 shrink-0 relative z-10">
          <button
            onClick={() => setBoardType('AVERAGE')}
            className={`py-1.5 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all duration-150 whitespace-nowrap text-center ${
              boardType === 'AVERAGE'
                ? 'bg-purple-955/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            🏆 Avg
          </button>
          <button
            onClick={() => setBoardType('CODING')}
            className={`py-1.5 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all duration-150 whitespace-nowrap text-center ${
              boardType === 'CODING'
                ? 'bg-purple-955/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            💻 Coding
          </button>
          <button
            onClick={() => setBoardType('MATH')}
            className={`py-1.5 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all duration-150 whitespace-nowrap text-center ${
              boardType === 'MATH'
                ? 'bg-purple-955/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            🧠 Math
          </button>
          <button
            onClick={() => setBoardType('EXPERTISE')}
            className={`py-1.5 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all duration-150 whitespace-nowrap text-center ${
              boardType === 'EXPERTISE'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            🧬 Expert
          </button>
          <button
            onClick={() => setBoardType('ALIGNMENT')}
            className={`py-1.5 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all duration-150 whitespace-nowrap text-center ${
              boardType === 'ALIGNMENT'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            📝 Align
          </button>
          <button
            onClick={() => setBoardType('ARENA')}
            className={`py-1.5 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all duration-150 whitespace-nowrap text-center ${
              boardType === 'ARENA'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            🎭 Arena
          </button>
        </div>

        {/* CSS Table Grid */}
        <div className="overflow-x-auto flex-grow scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent relative z-10 pr-1">
          <table className="w-full text-left text-[10px] font-mono min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-2">Rank</th>
                <th className="py-2.5 px-2">Company</th>
                <th className="py-2.5 px-2">Model</th>
                <th className="py-2.5 px-1 text-center" title={getMetricLabel('mmlu', marketDomain)}>{getMetricShortLabel('mmlu', marketDomain)}</th>
                <th className="py-2.5 px-1 text-center" title={getMetricLabel('humanEval', marketDomain)}>{getMetricShortLabel('humanEval', marketDomain)}</th>
                <th className="py-2.5 px-1 text-center" title={getMetricLabel('gsm8k', marketDomain)}>{getMetricShortLabel('gsm8k', marketDomain)}</th>
                <th className="py-2.5 px-1 text-center" title={getMetricLabel('gpqa', marketDomain)}>{getMetricShortLabel('gpqa', marketDomain)}</th>
                <th className="py-2.5 px-1 text-center" title={getMetricLabel('ifeval', marketDomain)}>{getMetricShortLabel('ifeval', marketDomain)}</th>
                <th className="py-2.5 px-1 text-center" title={getMetricLabel('arenaElo', marketDomain)}>{getMetricShortLabel('arenaElo', marketDomain)}</th>
                <th className="py-2.5 px-2 text-center font-bold">AVG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {sortedLeaderboard.slice(0, 20).map((row, index) => (
                <tr 
                  key={`${row.modelName}_${index}`}
                  className={`transition-colors hover:bg-slate-950/40 ${
                    row.isUser 
                      ? 'bg-purple-950/20 border-l-2 border-l-purple-500 font-bold' 
                      : ''
                  }`}
                >
                  <td className="py-2 px-2 text-slate-405 font-bold">{index + 1}</td>
                  <td className="py-2 px-2 text-slate-200 truncate max-w-[140px]">{row.companyName}</td>
                  <td className="py-2 px-2 text-slate-300 truncate max-w-[150px]">{row.modelName}</td>
                  <td className="py-2 px-1 text-center text-slate-400">{row.mmlu >= 0 ? `${row.mmlu.toFixed(1)}%` : '❓'}</td>
                  <td className="py-2 px-1 text-center text-slate-400">{row.humanEval >= 0 ? `${row.humanEval.toFixed(1)}%` : '❓'}</td>
                  <td className="py-2 px-1 text-center text-slate-400">{row.gsm8k >= 0 ? `${row.gsm8k.toFixed(1)}%` : '❓'}</td>
                  <td className="py-2 px-1 text-center text-slate-400">{row.gpqa >= 0 ? `${row.gpqa.toFixed(1)}%` : '❓'}</td>
                  <td className="py-2 px-1 text-center text-slate-400">{row.ifeval >= 0 ? `${row.ifeval.toFixed(1)}%` : '❓'}</td>
                  <td className="py-2 px-1 text-center text-slate-400">{row.arenaElo >= 0 ? `${Math.round(row.arenaElo)}` : '❓'}</td>
                  <td className="py-2 px-2 text-center font-bold text-emerald-450">{row.average >= 0 ? `${row.average.toFixed(1)}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VC Deck pitching board */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Venture Rounds widgets */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-indigo-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="border-b border-slate-800/80 pb-3 relative z-10">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm font-mono uppercase">
              <Landmark className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
              VC Capital Desk
            </h3>
          </div>

          {nextVCRound ? (
            <div className="space-y-4 relative z-10">
              <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl space-y-3">
                <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-900/40 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider inline-block">
                  {nextVCRound.stage.replace(/_/g, ' ')} ROUND
                </span>
                <h4 className="font-bold text-slate-200 text-sm leading-tight">{nextVCRound.name}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{nextVCRound.desc}</p>
                
                <div className="text-xs font-mono space-y-1.5 pt-2 border-t border-slate-900">
                  <div className="flex justify-between">
                    <span className="text-slate-500">VC Grant Cash:</span>
                    <span className="font-bold text-emerald-450">+${nextVCRound.grantCash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Equity Diluted:</span>
                    <span className="font-bold text-rose-455">-{nextVCRound.equitySold}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {(() => {
                  const highestModel = [...state.trainedModels].sort((a,b) => b.benchmarks.mmlu - a.benchmarks.mmlu)[0];
                  const maxMmlu = highestModel ? highestModel.benchmarks.mmlu : 0;
                  const hasMmlu = maxMmlu >= nextVCRound.reqMmlu;
                  const hasValuation = state.valuation >= nextVCRound.reqValuation;
                  const isMarketFrozen = state.activeCrisis === 'MARKET_DOWNTURN';

                  return (
                    <div className="space-y-2">
                      <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl space-y-2 font-mono text-[10px]">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Req. MMLU Score: &gt;={nextVCRound.reqMmlu}%</span>
                          <span className={`font-bold ${hasMmlu ? 'text-emerald-400' : 'text-rose-500'}`}>
                            {hasMmlu ? '🟢 READY' : `${maxMmlu.toFixed(1)}%`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Req. Valuation: &gt;=${nextVCRound.reqValuation.toLocaleString()}</span>
                          <span className={`font-bold ${hasValuation ? 'text-emerald-400' : 'text-rose-500'}`}>
                            {hasValuation ? '🟢 READY' : `$${state.valuation.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => pitchRound(nextVCRound)}
                        disabled={!hasMmlu || !hasValuation || isMarketFrozen}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                          hasMmlu && hasValuation && !isMarketFrozen
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-100 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/20 active:translate-y-px' 
                            : 'bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isMarketFrozen ? '🚨 VC Funding Frozen' : 'Deliver IPO Deck Pitch'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/60 p-5 border border-emerald-500/20 rounded-xl flex flex-col justify-center items-center text-center relative z-10">
              <Award className="h-8 w-8 text-emerald-400 mb-2 animate-bounce" />
              <h4 className="font-bold text-slate-200">IPO Capital Achieved</h4>
              <p className="text-xs text-slate-500 mt-1">You have dominated all public and private equity markets.</p>
            </div>
          )}
        </div>

        {/* Global Competitor Stats */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 space-y-4 shadow-xl">
          <h4 className="font-bold text-slate-100 text-sm border-b border-slate-800/80 pb-3 flex items-center gap-2 font-mono uppercase">
            <TrendingUp className="h-4.5 w-4.5 text-cyan-405" />
            Ecosystem Marketshare
          </h4>
          <div className="space-y-3.5">
            {(() => {
              const playerUsers = state.apps?.reduce((sum, a) => sum + (a.activeUsers || 0), 0) || 0;
              let rawPlayerShare = (playerUsers / 1000000) * 100;
              if (rawPlayerShare < 0.1 && playerUsers > 0) rawPlayerShare = 0.1;

              const totalCompetitorShare = state.competitors.reduce((acc, c) => acc + c.marketShare, 0);
              const normFactor = 100 / (totalCompetitorShare + rawPlayerShare || 1);

              const allPlayers = [
                { id: 'player', name: state.companyName || 'Your Company', marketShare: rawPlayerShare * normFactor, isPlayer: true },
                ...state.competitors.map(c => ({ ...c, marketShare: c.marketShare * normFactor, isPlayer: false }))
              ].sort((a, b) => b.marketShare - a.marketShare);

              return allPlayers.map((c) => {
                const actualComp = state.competitors.find(comp => comp.id === c.id);
                const activeTraining = actualComp?.activeTraining;
                const isPanicking = actualComp?.isPanicking;

                return (
                  <div key={c.id} className={`space-y-1.5 text-xs ${c.isPlayer ? 'p-3 bg-cyan-950/20 rounded-xl border border-cyan-900/40 shadow-sm' : 'p-2 bg-slate-950/20 border border-slate-900 rounded-xl'}`}>
                    <div className="flex justify-between items-center font-mono">
                      <span className={c.isPlayer ? "text-cyan-400 font-bold" : "text-slate-350 font-bold"}>
                        {c.name} {c.isPlayer && "(You)"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isPanicking && (
                          <span className="text-[8px] bg-red-950 text-red-400 border border-red-800 font-bold px-1.5 py-0.2 rounded font-mono uppercase tracking-wider animate-pulse">
                            🚨 PANIC
                          </span>
                        )}
                        <span className={`font-bold ${c.isPlayer ? 'text-cyan-400' : 'text-slate-300'}`}>
                          {c.marketShare.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                      <div 
                        className={`h-full transition-all duration-500 ${c.isPlayer ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-indigo-550/80'}`} 
                        style={{ width: `${Math.max(c.marketShare, c.isPlayer ? 0.5 : 0)}%` }} 
                      />
                    </div>
                    {/* Competitor pipeline active training project display */}
                    {!c.isPlayer && activeTraining && (
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-900 mt-1.5 font-mono text-[9px] space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span className="truncate max-w-[130px] font-bold text-slate-300">
                            {activeTraining.domain === 'IMAGE_DIFFUSION' ? '🖼️ ' : activeTraining.domain === 'VIDEO_GENERATION' ? '🎥 ' : '📝 '}
                            {activeTraining.modelName}
                          </span>
                          <span className="text-slate-450 font-bold">{activeTraining.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isPanicking ? 'bg-red-500 animate-pulse' : 'bg-purple-550'}`}
                            style={{ width: `${activeTraining.progress}%` }}
                          />
                        </div>
                        <div className="text-slate-500 text-[8px] text-right">
                          Est. completion: {activeTraining.estDaysRemaining} days
                        </div>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
