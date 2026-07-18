import React, { useEffect, useState } from 'react';
import { GameState, ActiveLiveEventState } from '../types';
import { Mic, Zap, TrendingUp, AlertTriangle, MessageSquare, MonitorPlay, Activity, CheckCircle } from 'lucide-react';

interface KeynoteLiveModalProps {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'EVENT' | 'MARKET') => void;
}

export function KeynoteLiveModal({ state, updateState, addLogMessage }: KeynoteLiveModalProps) {
  const ev = state.activeLiveEvent;
  const [currentPhaseChoicesDone, setCurrentPhaseChoicesDone] = useState<Record<string, string>>({});

  if (!ev) return null;

  interface StageChoice {
    id: string;
    title: string;
    desc: string;
    impactLabel: string;
    apply: (ev: ActiveLiveEventState) => { hype: number; sentiment: number; successRate: number };
    outcomeText: string;
  }

  const STAGE_CHOICES: Record<string, StageChoice[]> = {
    INTRO: [
      {
        id: 'CLAIM_AGI',
        title: '🚀 Claim AGI is Solved',
        desc: 'Declare that this model represents artificial general intelligence and human-level reasoning.',
        impactLabel: '📈 Hype +30 | 📉 Sentiment -15 | ⚠️ Demo Stability -15%',
        apply: (e) => ({ hype: e.currentHype + 30, sentiment: e.audienceSentiment - 15, successRate: e.demoSuccessRate - 15 }),
        outcomeText: 'The crowd gasps as you announce AGI is solved. The media goes wild, but developers look highly skeptical.'
      },
      {
        id: 'ENGINEERING_FOCUS',
        title: '💻 Practical Engineering Focus',
        desc: 'Focus on actual tokens-per-second benchmarks, reliability, and code generation speed.',
        impactLabel: '📈 Hype +10 | 📈 Sentiment +15 | 🟢 Demo Stability +10%',
        apply: (e) => ({ hype: e.currentHype + 10, sentiment: e.audienceSentiment + 15, successRate: e.demoSuccessRate + 10 }),
        outcomeText: 'You focus on real-world tokens-per-second benchmarks. The crowd nods in agreement, appreciating the engineering focus.'
      },
      {
        id: 'SAFETY_HUMILITY',
        title: '🛡️ Safety & Alignment Humble Speech',
        desc: 'Pledge commitment to safety guidelines, red-teaming, and preventing malicious misuse.',
        impactLabel: '📉 Hype -5 | 📈 Sentiment +25 | 🟢 Demo Stability +5%',
        apply: (e) => ({ hype: e.currentHype - 5, sentiment: e.audienceSentiment + 25, successRate: e.demoSuccessRate + 5 }),
        outcomeText: 'You pledge our dedication to safety and governance. The regulators applaud, but the hype levels cool down slightly.'
      }
    ],
    DEMO: [
      {
        id: 'REASONING_MATH',
        title: '🧠 Complex Unscripted Reasoning',
        desc: 'Let the model solve a multi-step logic problem live on the screen without pre-compiled prompts.',
        impactLabel: '📈 Hype +30 | ⚠️ Demo Stability -20%',
        apply: (e) => ({ hype: e.currentHype + 30, sentiment: e.audienceSentiment, successRate: e.demoSuccessRate - 20 }),
        outcomeText: 'You launch the live mathematical reasoning demo. Sweating as the progress bar runs...'
      },
      {
        id: 'SAFE_EMAIL',
        title: '✉️ Basic Conversational Agent Demo',
        desc: 'Demonstrate basic text generation, like writing an email or summarizing a pdf.',
        impactLabel: '📈 Hype +5 | 🟢 Demo Stability +25%',
        apply: (e) => ({ hype: e.currentHype + 5, sentiment: e.audienceSentiment, successRate: e.demoSuccessRate + 25 }),
        outcomeText: 'You play it safe, asking the model to write a basic email. It works flawlessly, though it feels a bit basic.'
      },
      {
        id: 'SELF_DEBUG',
        title: '⚙️ Agentic Self-Debugging Run',
        desc: 'Have the model run in an iterative coding terminal loop, detecting and fixing its own syntax errors.',
        impactLabel: '📈 Hype +15 | 🟢 Demo Stability -5%',
        apply: (e) => ({ hype: e.currentHype + 15, sentiment: e.audienceSentiment, successRate: e.demoSuccessRate - 5 }),
        outcomeText: 'You showcase the model debugging its own source code live. The audience leans in, fascinated.'
      }
    ],
    GUEST: [
      {
        id: 'LIVE_CODE',
        title: '💻 Ask Guest to Write Code',
        desc: 'Challenge the guest speaker to type a prompt live and integrate it with their platform.',
        impactLabel: '📈 Hype +20 | ⚠️ Demo Stability -10%',
        apply: (e) => ({ hype: e.currentHype + 20, sentiment: e.audienceSentiment, successRate: e.demoSuccessRate - 10 }),
        outcomeText: 'You pull up a compiler and ask the guest speaker to write code. It is highly engaging!'
      },
      {
        id: 'FIRESIDE_CHAT',
        title: '🛋️ Fireside Corporate Chat',
        desc: 'Have a casual conversation about enterprise partnerships and scaling efficiencies.',
        impactLabel: '📈 Hype +5 | 📈 Sentiment +15%',
        apply: (e) => ({ hype: e.currentHype + 5, sentiment: e.audienceSentiment + 15, successRate: e.demoSuccessRate }),
        outcomeText: 'You sit down for a chat about enterprise governance. Investors look very pleased.'
      }
    ],
    ONE_MORE_THING: [
      {
        id: 'ROBOTICS_TEASE',
        title: '🤖 Robotics OS Integration Tease',
        desc: 'Show a video snippet of our neural model operating a robotic actuator arm.',
        impactLabel: '📈 Hype +25 | 📉 Sentiment -5%',
        apply: (e) => ({ hype: e.currentHype + 25, sentiment: e.audienceSentiment - 5, successRate: e.demoSuccessRate }),
        outcomeText: 'You show a robotic hand powered by our model. The tech blogs go crazy!'
      },
      {
        id: 'OPEN_SOURCE_BASE',
        title: '🔓 Announce Base Open Weights',
        desc: 'Announce that developer weights are open sourced for the research community.',
        impactLabel: '📈 Hype +15 | 📈 Sentiment +20%',
        apply: (e) => ({ hype: e.currentHype + 15, sentiment: e.audienceSentiment + 20, successRate: e.demoSuccessRate }),
        outcomeText: 'You announce the base weights are available for download. Massive cheer from the developer community.'
      }
    ],
    QA: [
      {
        id: 'DODGE_SAFETY',
        title: '🙈 Dodge Compliance Safety Questions',
        desc: 'Brushing off questions about copyright and data scrape ethics, emphasizing speed.',
        impactLabel: '📈 Hype +15 | 📉 Sentiment -15',
        apply: (e) => ({ hype: e.currentHype + 15, sentiment: e.audienceSentiment - 15, successRate: e.demoSuccessRate }),
        outcomeText: 'You brush off regulatory concerns, focusing on benchmark leadership.'
      },
      {
        id: 'TRANSPARENT_SAFETY',
        title: '🛡️ Extreme Governance Transparency',
        desc: 'Discuss alignment bugs openly and pledge research grants for safety standardizations.',
        impactLabel: '📉 Hype -5 | 📈 Sentiment +20',
        apply: (e) => ({ hype: e.currentHype - 5, sentiment: e.audienceSentiment + 20, successRate: e.demoSuccessRate }),
        outcomeText: 'You speak openly about alignment challenges. The press respects the honesty.'
      }
    ]
  };

  useEffect(() => {
    if (ev.isPaused) return;
    if (ev.phase === 'FINISHED') return;

    // Wait for the player to click their stage management option before ticking!
    if (!currentPhaseChoicesDone[ev.phase]) {
      return;
    }

    const timer = setTimeout(() => {
      let nextPhase = ev.phase;
      let nextTicks = ev.ticksInPhase + 1;
      let nextHype = ev.currentHype;
      let nextSentiment = ev.audienceSentiment;
      let nextDemoResult = ev.demoResult;
      let nextQaResult = ev.qaResult;
      let nextOmResult = ev.oneMoreThingResult;

      // Phase transitions
      if (nextTicks >= ev.maxTicksInPhase) {
        if (ev.phase === 'INTRO') {
          nextPhase = 'DEMO';
          nextTicks = 0;
        } else if (ev.phase === 'DEMO') {
          nextPhase = ev.guestSpeaker ? 'GUEST' : (ev.oneMoreThingTease ? 'ONE_MORE_THING' : 'QA');
          nextTicks = 0;
        } else if (ev.phase === 'GUEST') {
          nextPhase = ev.oneMoreThingTease ? 'ONE_MORE_THING' : 'QA';
          nextTicks = 0;
        } else if (ev.phase === 'ONE_MORE_THING') {
          nextPhase = 'QA';
          nextTicks = 0;
        } else if (ev.phase === 'QA') {
          nextPhase = 'FINISHED';
          nextTicks = 0;
          
          finishEvent(nextHype, nextSentiment, nextDemoResult, nextQaResult);
          return;
        }
      }

      // Tick logic per phase
      if (ev.phase === 'INTRO') {
        nextHype += 0.2;
        nextSentiment += 0.1;
      } else if (ev.phase === 'DEMO') {
        if (!nextDemoResult) {
          if (nextTicks === Math.floor(ev.maxTicksInPhase / 2)) {
            const roll = Math.random() * 100;
            if (roll > ev.demoSuccessRate + 15) {
              nextDemoResult = 'CRASH';
            } else if (roll > ev.demoSuccessRate) {
              nextDemoResult = 'HALLUCINATION';
            } else if (roll < ev.demoSuccessRate - 30) {
              nextDemoResult = 'FLAWLESS';
            } else {
              nextDemoResult = 'SUCCESS';
            }
          }
        }
        
        if (nextDemoResult === 'CRASH') {
          nextSentiment -= 1.5;
          nextHype -= 0.5;
        } else if (nextDemoResult === 'HALLUCINATION') {
          nextSentiment -= 0.5;
        } else if (nextDemoResult === 'FLAWLESS') {
          nextHype += 1.0;
          nextSentiment += 0.5;
        } else if (nextDemoResult === 'SUCCESS') {
          nextHype += 0.5;
          nextSentiment += 0.2;
        }
      } else if (ev.phase === 'GUEST') {
        nextHype += 1.5;
        nextSentiment += 0.2;
      } else if (ev.phase === 'ONE_MORE_THING') {
        if (!nextOmResult && nextTicks === 2) {
           nextOmResult = Math.random() > 0.4 ? 'MIND_BLOWN' : 'DISAPPOINTMENT';
        }
        if (nextOmResult === 'MIND_BLOWN') {
          nextHype += 2.0;
        } else if (nextOmResult === 'DISAPPOINTMENT') {
          nextSentiment -= 1.0;
        }
      } else if (ev.phase === 'QA') {
        if (!nextQaResult && nextTicks === 2) {
          nextQaResult = Math.random() > 0.5 ? 'ACED' : (Math.random() > 0.5 ? 'SURVIVED' : 'BOMBED');
        }
        if (nextQaResult === 'ACED') {
          nextSentiment += 0.8;
        } else if (nextQaResult === 'BOMBED') {
          nextSentiment -= 1.2;
        }
      }

      nextHype = Math.max(0, Math.min(250, nextHype));
      nextSentiment = Math.max(0, Math.min(100, nextSentiment));

      updateState({
        activeLiveEvent: {
          ...ev,
          phase: nextPhase,
          ticksInPhase: nextTicks,
          currentHype: nextHype,
          audienceSentiment: nextSentiment,
          demoResult: nextDemoResult,
          qaResult: nextQaResult,
          oneMoreThingResult: nextOmResult
        }
      });

    }, 1200);

    return () => clearTimeout(timer);
  }, [ev, updateState, currentPhaseChoicesDone]);

  const finishEvent = (finalHype: number, finalSentiment: number, demoRes: string | undefined, qaRes: string | undefined) => {
    // Calculate final rewards
    const hypeMult = finalHype / 50; // Every 50 hype is 1x normal
    const sentimentMult = finalSentiment / 50;
    
    const valuationBump = 1.0 + (hypeMult * sentimentMult * 0.05); // e.g. 1.0 + (2 * 1.5 * 0.05) = 1.15 (+15% valuation)
    
    let userSpike = Math.floor(100000 * hypeMult * sentimentMult);
    if (demoRes === 'CRASH') userSpike = Math.floor(userSpike * 0.1);
    if (demoRes === 'FLAWLESS') userSpike = Math.floor(userSpike * 1.5);
    
    let merchRevenue = Math.floor(finalHype * 5000);
    if (ev.venueType === 'GLOBAL_STADIUM') merchRevenue *= 5;
    
    const newPastEvent = {
      id: ev.eventId,
      dateString: state.currentDate,
      venueType: ev.venueType,
      focus: ev.focus,
      modelName: ev.modelName,
      totalCost: 0, // already paid
      revenueGenerated: merchRevenue,
      hypeGenerated: finalHype,
      usersGained: userSpike,
      valuationMultiplier: valuationBump,
      finalSentiment: finalSentiment,
      demoResult: demoRes || 'UNKNOWN',
      qaResult: qaRes || 'UNKNOWN'
    };
    
    // Apply rewards
    const updatedApps = state.apps.map(app => {
      if (app.modelId === ev.modelId) {
        return { ...app, activeUsers: app.activeUsers + userSpike };
      }
      return app; // Could distribute users to all apps, but let's give it to the showcased one if deployed. 
    });
    // If model isn't deployed in an app, we just increase global hype massively.
    
    updateState({
      activeLiveEvent: null, // close modal
      pastEvents: [...(state.pastEvents || []), newPastEvent],
      cash: state.cash + merchRevenue,
      hypeLevel: state.hypeLevel + (finalHype * 0.5),
      globalPublicSentiment: finalSentiment,
      apps: updatedApps,
    });
    
    addLogMessage(`🎉 KEYNOTE CONCLUDED: ${ev.modelName} event finished! Valuation jumped by ${((valuationBump-1)*100).toFixed(1)}%. Gained ${userSpike.toLocaleString()} users and $${merchRevenue.toLocaleString()} in merch.`, 'EVENT');
  };

  const getPhaseMessage = () => {
    switch (ev.phase) {
      case 'INTRO': return "CEO takes the stage. The audience roars as the lights dim. Laying out the vision...";
      case 'DEMO': 
        if (!ev.demoResult) return `Starting the live, unscripted demo of ${ev.modelName}. Nervous whispers in the crowd...`;
        if (ev.demoResult === 'FLAWLESS') return "INCREDIBLE! The demo is executing logic flawlessly in real-time. Standing ovation!";
        if (ev.demoResult === 'SUCCESS') return "The demo completed successfully. Solid capabilities demonstrated.";
        if (ev.demoResult === 'HALLUCINATION') return "Uh oh... the model confidently output false information. Reporters are typing frantically.";
        if (ev.demoResult === 'CRASH') return "DISASTER! The servers crashed on stage. Blue screen of death. The crowd goes silent.";
        return "";
      case 'GUEST': return `Special guest ${ev.guestSpeaker} is now on stage talking about how ${ev.modelName} changed their workflow.`;
      case 'ONE_MORE_THING':
        if (!ev.oneMoreThingResult) return '"But wait... there\'s one more thing." The screen goes black...';
        if (ev.oneMoreThingResult === 'MIND_BLOWN') return `The crowd loses their minds over the ${ev.oneMoreThingTease} teaser! Stock surging!`;
        return `The ${ev.oneMoreThingTease} teaser falls flat. People seem confused.`;
      case 'QA':
        if (!ev.qaResult) return "Opening the floor to the tech journalists for Q&A...";
        if (ev.qaResult === 'ACED') return "You effortlessly deflected hard questions about AI safety and copyright.";
        if (ev.qaResult === 'BOMBED') return "Journalists cornered you on data scraping ethics. Sweating profusely on camera.";
        return "You survived the Q&A with standard PR answers.";
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 lg:p-8 backdrop-blur-xl">
      <div className="w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-fuchsia-950/40 p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <div className="text-rose-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-1 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              LIVE BROADCAST
            </div>
            <h2 className="text-3xl font-black text-white">{state.companyName} Keynote</h2>
            <p className="text-slate-400 mt-1 font-mono text-sm">{ev.venueType.replace('_', ' ')} • Unveiling {ev.modelName}</p>
          </div>
          <div className="text-right flex items-center gap-6">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Global Hype</div>
              <div className="text-3xl font-black text-fuchsia-400">{ev.currentHype.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Sentiment</div>
              <div className={`text-3xl font-black ${ev.audienceSentiment > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {ev.audienceSentiment.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Main Stage Screen */}
          <div className="w-full aspect-video max-h-[350px] bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center text-center p-8">
            <div className="absolute top-4 left-4 flex gap-2">
              {['INTRO', 'DEMO', 'GUEST', 'ONE_MORE_THING', 'QA'].map((p) => {
                // If this phase isn't used (like no guest), hide it
                if (p === 'GUEST' && !ev.guestSpeaker) return null;
                if (p === 'ONE_MORE_THING' && !ev.oneMoreThingTease) return null;
                
                const isActive = ev.phase === p;
                const isPast = ['INTRO', 'DEMO', 'GUEST', 'ONE_MORE_THING', 'QA'].indexOf(ev.phase) > ['INTRO', 'DEMO', 'GUEST', 'ONE_MORE_THING', 'QA'].indexOf(p);
                
                return (
                  <div key={p} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                    isActive ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.5)]' : 
                    isPast ? 'bg-slate-800 text-slate-400' : 'bg-slate-950 border border-slate-800 text-slate-600'
                  }`}>
                    {p.replace('_', ' ')}
                  </div>
                )
              })}
            </div>
            
            <Mic className={`h-16 w-16 mb-6 ${ev.phase === 'INTRO' || ev.phase === 'QA' ? 'text-white animate-pulse' : 'text-slate-700'}`} />
            
            <h3 className="text-2xl font-bold text-white mb-4">
              {getPhaseMessage()}
            </h3>
            
            {ev.phase === 'DEMO' && (
               <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-left">
                 <div className="text-slate-500 mb-2">// Executing live agentic workflow...</div>
                 <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                   <div className="h-full bg-cyan-500 transition-all duration-1000 ease-linear" style={{ width: `${(ev.ticksInPhase / ev.maxTicksInPhase) * 100}%` }}></div>
                 </div>
               </div>
            )}
            
            <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 font-mono">
              Phase Progress: {ev.ticksInPhase} / {ev.maxTicksInPhase}
            </div>
          </div>
          
          {/* Interactive Stage Manager Choice Panel */}
          {(() => {
            const choices = STAGE_CHOICES[ev.phase];
            const choiceMadeId = currentPhaseChoicesDone[ev.phase];

            if (!choices) return null;

            if (!choiceMadeId) {
              return (
                <div className="bg-slate-900 border border-fuchsia-500/20 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold text-fuchsia-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-fuchsia-500 animate-bounce" />
                      Stage Decision Required: Choose Keynote Action
                    </span>
                    <span className="text-[10px] text-slate-500">The live feed is paused waiting for your cue...</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {choices.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => {
                          const impacts = choice.apply(ev);
                          updateState({
                            activeLiveEvent: {
                              ...ev,
                              currentHype: impacts.hype,
                              audienceSentiment: impacts.sentiment,
                              demoSuccessRate: impacts.successRate,
                              ticksInPhase: 1, // Advance from 0 to resume ticker
                            }
                          });
                          setCurrentPhaseChoicesDone((prev) => ({ ...prev, [ev.phase]: choice.id }));
                          addLogMessage(`🎤 KEYNOTE ACTION: Chosen "${choice.title}"`, 'SYSTEM');
                        }}
                        className="bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-fuchsia-550/40 p-4 rounded-xl text-left cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between space-y-2 group h-full"
                      >
                        <div>
                          <h4 className="font-bold text-slate-100 text-xs font-mono group-hover:text-fuchsia-400 transition-colors">{choice.title}</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-1 font-sans">{choice.desc}</p>
                        </div>
                        <div className="text-[9px] font-mono text-amber-500 font-semibold bg-amber-955/20 border border-amber-900/30 px-2 py-0.5 rounded-lg inline-block w-fit mt-2">
                          {choice.impactLabel}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            } else {
              const selectedChoice = choices.find(c => c.id === choiceMadeId);
              return (
                <div className="bg-slate-955 border border-slate-900 p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div className="font-mono text-[11px] text-slate-350">
                    <span className="font-bold text-emerald-400">STAGE ACTION TAKEN: </span>
                    {selectedChoice ? selectedChoice.outcomeText : 'Stage director cues next section.'}
                  </div>
                </div>
              );
            }
          })()}

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 shrink-0">
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
               <div className="flex items-center justify-between mb-2">
                 <div className="text-xs uppercase text-slate-400 font-bold flex items-center gap-2">
                   <MonitorPlay className="h-4 w-4" /> Live Viewers
                 </div>
               </div>
               <div className="text-2xl font-black text-white">
                 {Math.floor((ev.currentHype * 12500) * (ev.productionValueLevel + 1)).toLocaleString()}
               </div>
             </div>
             
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
               <div className="flex items-center justify-between mb-2">
                 <div className="text-xs uppercase text-slate-400 font-bold flex items-center gap-2">
                   <Activity className="h-4 w-4" /> Demo Stability
                 </div>
               </div>
               <div className="text-2xl font-black text-cyan-400">
                 {ev.demoSuccessRate.toFixed(1)}%
               </div>
             </div>
             
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
               <div className="flex items-center justify-between mb-2">
                 <div className="text-xs uppercase text-slate-400 font-bold flex items-center gap-2">
                   <TrendingUp className="h-4 w-4" /> Valuation Impact
                 </div>
               </div>
               <div className="text-2xl font-black text-emerald-400">
                 +{(ev.currentHype * ev.audienceSentiment / 2500).toFixed(1)}%
               </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
