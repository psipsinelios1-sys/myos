import React, { useState } from 'react';
import { GameState, ScheduledEvent, EventVenueType, EventFocusType } from '../types';
import { Megaphone, Calendar, Users, Zap, Award, CheckCircle, ArrowRight, ShieldCheck, MapPin, Cpu, Star } from 'lucide-react';

interface MarketingEventsProps {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'EVENT' | 'MARKET') => void;
}

export function MarketingEvents({ state, updateState, addLogMessage }: MarketingEventsProps) {
  const [selectedVenue, setSelectedVenue] = useState<EventVenueType>('BLOG_POST');
  const [selectedFocus, setSelectedFocus] = useState<EventFocusType>('AGI_VISION');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [productionLevel, setProductionLevel] = useState<number>(0);
  const [guestSpeaker, setGuestSpeaker] = useState<string>('NONE');
  const [oneMoreThing, setOneMoreThing] = useState<string>('NONE');
  const [planningDays, setPlanningDays] = useState<number>(14);

  const venueOptions = [
    { id: 'BLOG_POST', name: 'Developer Blog Post', cost: 0, hypeCap: 15, desc: 'Quiet drop on technical blogs.' },
    { id: 'VIRTUAL_STREAM', name: 'Virtual Livestream', cost: 250000, hypeCap: 40, desc: 'A produced pre-recorded presentation.' },
    { id: 'CONFERENCE_HALL', name: 'Moscone Conference Center', cost: 5000000, hypeCap: 80, desc: 'Massive in-person developer conference.' },
    { id: 'GLOBAL_STADIUM', name: 'Las Vegas Sphere', cost: 25000000, hypeCap: 200, desc: 'A worldwide spectacle dominating all media.' },
  ];

  const focusOptions = [
    { id: 'AGI_VISION', name: 'AGI & The Future', icon: Zap, desc: 'Boosts hype massively, higher risk if demo fails.' },
    { id: 'ENTERPRISE_SAFETY', name: 'Enterprise Safety', icon: ShieldCheck, desc: 'Boosts corporate adoption & B2B valuation.' },
    { id: 'CONSUMER_FUN', name: 'Consumer Lifestyle', icon: Users, desc: 'Maximum active user growth, viral potential.' },
    { id: 'DEVELOPER_API', name: 'Developer API', icon: Cpu, desc: 'Attracts software ecosystem integrations.' },
  ];

  const speakerOptions = [
    { id: 'NONE', name: 'No Guest Speaker', cost: 0, hype: 0 },
    { id: 'TECH_INFLUENCER', name: 'Marquez (Tech YouTuber)', cost: 150000, hype: 15 },
    { id: 'HOLLYWOOD', name: 'A-List Sci-Fi Actor', cost: 2000000, hype: 35 },
    { id: 'BILLIONAIRE', name: 'Eccentric Tech Billionaire', cost: 5000000, hype: 50 },
  ];

  const oneMoreThingOptions = [
    { id: 'NONE', name: 'No Surprises', risk: 0 },
    { id: 'ROBOTICS', name: 'Robotics OS Teaser', risk: 25 },
    { id: 'QUANTUM', name: 'Quantum AI Simulator', risk: 40 },
    { id: 'BRAIN_LINK', name: 'Neural Link API', risk: 60 },
  ];

  const selectedVenueDetails = venueOptions.find(v => v.id === selectedVenue)!;
  const speakerDetails = speakerOptions.find(s => s.id === guestSpeaker)!;
  
  const productionCost = productionLevel === 0 ? 0 : productionLevel === 1 ? selectedVenueDetails.cost * 0.5 : selectedVenueDetails.cost * 1.5;
  const totalCost = selectedVenueDetails.cost + speakerDetails.cost + productionCost;

  const handleScheduleEvent = () => {
    if (!selectedModelId) {
      addLogMessage('❌ You must select a trained model to showcase.', 'SYSTEM');
      return;
    }
    
    if (state.cash < totalCost) {
      addLogMessage(`❌ Insufficient funds. Event costs $${totalCost.toLocaleString()}.`, 'SYSTEM');
      return;
    }

    const eventDate = new Date(state.currentDate);
    eventDate.setDate(eventDate.getDate() + planningDays);
    const targetDateStr = eventDate.toISOString().split('T')[0];

    const newEvent: ScheduledEvent = {
      id: `ev_${Date.now()}`,
      targetDate: targetDateStr,
      daysRemaining: planningDays,
      venueType: selectedVenue,
      focus: selectedFocus,
      modelId: selectedModelId,
      productionValueLevel: productionLevel,
      guestSpeaker: guestSpeaker !== 'NONE' ? speakerDetails.name : undefined,
      venueCost: selectedVenueDetails.cost,
      productionCost,
      speakerCost: speakerDetails.cost,
      oneMoreThingTease: oneMoreThing !== 'NONE' ? oneMoreThingOptions.find(o => o.id === oneMoreThing)?.name : undefined,
    };

    updateState({
      cash: state.cash - totalCost,
      scheduledEvent: newEvent
    });

    addLogMessage(`🎉 EVENT SCHEDULED: You have booked ${selectedVenueDetails.name} for a major keynote in ${planningDays} days (-$${totalCost.toLocaleString()}).`, 'EVENT');
  };

  const handleCancelEvent = () => {
    if (!state.scheduledEvent) return;
    
    const refund = Math.floor((state.scheduledEvent.venueCost + state.scheduledEvent.productionCost + state.scheduledEvent.speakerCost) * 0.5);
    updateState({
      cash: state.cash + refund,
      scheduledEvent: null
    });
    addLogMessage(`🗑️ EVENT CANCELLED: Keynote cancelled. Recovered $${refund.toLocaleString()} in refunds.`, 'SYSTEM');
  };

  const deployedModels = state.trainedModels.filter(m => m.isDeployed);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-fuchsia-500" />
            Keynotes & PR Events
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Schedule massive media spectacles to showcase your AI models, attract millions of users, and boost your company valuation. Higher hype means higher risk of a live demo disaster.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Current Hype Level</div>
          <div className="text-3xl font-black text-fuchsia-400">{state.hypeLevel.toFixed(1)}</div>
        </div>
      </div>

      {state.scheduledEvent ? (
        <div className="bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 border border-fuchsia-500/50 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Calendar className="w-32 h-32 text-fuchsia-300" />
          </div>
          
          <h3 className="font-bold text-fuchsia-300 mb-4 flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 animate-pulse" />
            Upcoming Keynote Scheduled
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Countdown</div>
              <div className="text-4xl font-black text-white">{state.scheduledEvent.daysRemaining} <span className="text-lg text-slate-400">days</span></div>
              <div className="text-xs text-slate-400 mt-2 font-mono">Date: {state.scheduledEvent.targetDate}</div>
            </div>
            
            <div className="md:col-span-2 bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Venue</div>
                <div className="text-sm font-bold text-slate-200">{venueOptions.find(v => v.id === state.scheduledEvent!.venueType)?.name}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Showcase Model</div>
                <div className="text-sm font-bold text-cyan-400">{state.trainedModels.find(m => m.id === state.scheduledEvent!.modelId)?.name || 'Unknown Model'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Event Focus</div>
                <div className="text-sm font-bold text-purple-400">{focusOptions.find(f => f.id === state.scheduledEvent!.focus)?.name}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Guest Speaker</div>
                <div className="text-sm font-bold text-emerald-400">{state.scheduledEvent.guestSpeaker || 'None'}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCancelEvent}
              className="px-4 py-2 bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800 rounded-lg text-xs font-bold transition-all"
            >
              Cancel Event (50% Refund)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="font-bold text-slate-200 mb-3 border-b border-slate-800 pb-2 text-sm">1. Select Venue & Scale</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {venueOptions.map((venue) => (
                  <div
                    key={venue.id}
                    onClick={() => setSelectedVenue(venue.id as EventVenueType)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedVenue === venue.id
                        ? 'bg-fuchsia-950/30 border-fuchsia-500/60 shadow-md shadow-fuchsia-900/20'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-slate-200 text-sm">{venue.name}</div>
                      <div className="text-xs font-mono text-slate-400">${(venue.cost / 1000000).toFixed(2)}M</div>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">{venue.desc}</div>
                    <div className="mt-2 text-[9px] font-bold text-fuchsia-400/80 uppercase">Max Hype Cap: {venue.hypeCap}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-5 border-t border-slate-800 pt-4">
                <label className="text-[10px] uppercase text-slate-500 font-bold mb-2 block">Production Value (Spectacle & VFX)</label>
                <div className="flex gap-2">
                  {[
                    { level: 0, label: 'Standard Presentation' },
                    { level: 1, label: 'High-End AV + Lasers (+50% venue cost)' },
                    { level: 2, label: 'Holographic & AR Show (+150% venue cost)' }
                  ].map(opt => (
                    <button
                      key={opt.level}
                      onClick={() => setProductionLevel(opt.level)}
                      className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-bold transition-all border ${
                        productionLevel === opt.level
                          ? 'bg-fuchsia-900/60 border-fuchsia-500 text-fuchsia-100'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="font-bold text-slate-200 mb-3 border-b border-slate-800 pb-2 text-sm">2. Content & Demos</h3>
              
              <div className="mb-4">
                <label className="text-[10px] uppercase text-slate-500 font-bold mb-2 block">Select Model to Showcase</label>
                {deployedModels.length === 0 ? (
                  <div className="text-xs text-amber-400 bg-amber-950/30 border border-amber-900/50 p-3 rounded-lg">
                    You have no deployed models. Deploy a model in the Product Factory first.
                  </div>
                ) : (
                  <select
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-fuchsia-500"
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                  >
                    <option value="">-- Select a deployed model --</option>
                    {deployedModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name} (MMLU: {m.benchmarks.mmlu.toFixed(1)} | Safety: {m.safetyScore.toFixed(1)})</option>
                    ))}
                  </select>
                )}
                {selectedModelId && (
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                    Model selected. Low safety scores dramatically increase live-demo hallucination risks!
                  </div>
                )}
              </div>

              <label className="text-[10px] uppercase text-slate-500 font-bold mb-2 block">Keynote Narrative Focus</label>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {focusOptions.map((focus) => {
                  const Icon = focus.icon;
                  return (
                    <div
                      key={focus.id}
                      onClick={() => setSelectedFocus(focus.id as EventFocusType)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        selectedFocus === focus.id
                          ? 'bg-purple-950/30 border-purple-500/60 shadow-md shadow-purple-900/20'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${selectedFocus === focus.id ? 'text-purple-400' : 'text-slate-600'}`} />
                      <div>
                        <div className="font-bold text-slate-200 text-xs">{focus.name}</div>
                        <div className="text-[9px] text-slate-500 leading-tight mt-0.5">{focus.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 font-bold mb-2 block">Guest Speaker</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-fuchsia-500"
                    value={guestSpeaker}
                    onChange={(e) => setGuestSpeaker(e.target.value)}
                  >
                    {speakerOptions.map(s => (
                      <option key={s.id} value={s.id}>{s.name} {s.cost > 0 ? `(+$${(s.cost/1000000).toFixed(2)}M)` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-500 font-bold mb-2 block">"One More Thing..."</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-rose-500"
                    value={oneMoreThing}
                    onChange={(e) => setOneMoreThing(e.target.value)}
                  >
                    {oneMoreThingOptions.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sticky top-6">
              <h3 className="font-bold text-slate-200 mb-3 border-b border-slate-800 pb-2 text-sm">Event Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                  <span className="text-slate-400 text-xs">Venue Cost</span>
                  <span className="text-slate-200 font-mono">${(selectedVenueDetails.cost / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                  <span className="text-slate-400 text-xs">Production (Level {productionLevel})</span>
                  <span className="text-slate-200 font-mono">${(productionCost / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                  <span className="text-slate-400 text-xs">Guest Speaker</span>
                  <span className="text-slate-200 font-mono">${(speakerDetails.cost / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-slate-300">Total Upfront Cost</span>
                  <span className={`font-black font-mono ${state.cash >= totalCost ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${(totalCost / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[10px] uppercase text-slate-500 font-bold mb-2 block flex justify-between">
                  <span>Planning Time</span>
                  <span className="text-fuchsia-400">{planningDays} Days</span>
                </label>
                <input 
                  type="range" 
                  min="3" max="60" 
                  value={planningDays} 
                  onChange={(e) => setPlanningDays(parseInt(e.target.value))}
                  className="w-full accent-fuchsia-500"
                />
                <p className="text-[9px] text-slate-500 mt-1">Longer planning builds more passive pre-event hype.</p>
              </div>

              <button
                onClick={handleScheduleEvent}
                disabled={!selectedModelId || state.cash < totalCost}
                className="w-full mt-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-black uppercase tracking-wider py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
              >
                Schedule Event <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past Events Log */}
      {state.pastEvents && state.pastEvents.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-4">
          <h3 className="font-bold text-slate-200 mb-3 border-b border-slate-800 pb-2 text-sm">Keynote History</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
            {state.pastEvents.slice().reverse().map(ev => (
              <div key={ev.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-200 text-sm">{ev.focus.replace('_', ' ')} Keynote</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {ev.dateString} • {ev.modelName} • {ev.venueType.replace('_', ' ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-black ${ev.valuationMultiplier && ev.valuationMultiplier > 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Valuation {ev.valuationMultiplier ? `${(ev.valuationMultiplier * 100 - 100).toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    +{ev.usersGained.toLocaleString()} Users
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
