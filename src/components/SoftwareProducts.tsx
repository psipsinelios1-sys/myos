import React, { useState } from 'react';
import { 
  Sparkles, Play, Globe, CheckCircle, Database, DollarSign, Server, Key, 
  ShieldAlert, Award, Star, Terminal, Trash2, Rocket, Landmark, Settings, Heart
} from 'lucide-react';
import { GameState, TrainedModel, SoftwareApp } from '../types';

interface SoftwareProductsProps {
  state: GameState;
  updateState: (newState: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'EVENT' | 'MILESTONE' | 'MARKET') => void;
}

export default function SoftwareProducts({ state, updateState, addLogMessage }: SoftwareProductsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'DEPLOY' | 'APPS'>('DEPLOY');

  // Deployment-specific States
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const models = state.trainedModels || [];
  const currentModel = models.find((m) => m.id === selectedModelId) || models[0] || null;

  const [apiPrice, setApiPrice] = useState(2.00); // per million tokens
  const [subPrice, setSubPrice] = useState(20); // standard monthly sub
  type DeployProtocol = 'CLOSED_API' | 'ENTERPRISE' | 'APP_COPILOT' | 'CONSUMER_CHATBOT' | 'OPEN_SOURCE';
  const [activeDeployments, setActiveDeployments] = useState<DeployProtocol[]>(['CLOSED_API']);

  const toggleDeployment = (protocol: DeployProtocol) => {
    setActiveDeployments(prev => 
      prev.includes(protocol) ? prev.filter(p => p !== protocol) : [...prev, protocol]
    );
  };

  // Custom App Creator States
  const [appName, setAppName] = useState('My AI Copilot');
  const [appType, setAppType] = useState<'CHATBOT' | 'COPILOT_CODING' | 'AGENT_WORKFLOW' | 'IMAGE_GENERATION'>('CHATBOT');
  const [appModelIds, setAppModelIds] = useState<string[]>([]);
  const toggleAppModel = (id: string) => {
    setAppModelIds(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 3) return prev; // max 3 tiers
      return [...prev, id];
    });
  };

  const deployModel = () => {
    if (!currentModel) return;

    let ptsToGrant = 0;
    const updatedModels = models.map((m) => {
      if (m.id === currentModel.id) {
        if (!m.isDeployed) {
          ptsToGrant = Math.round(m.parametersCountB * 0.15 + 4);
        }
        return {
          ...m,
          isDeployed: activeDeployments.length > 0,
          deploymentType: (activeDeployments.length > 0 ? activeDeployments[0] : 'NONE') as any,
          activeDeployments: activeDeployments as any,
          pricePerMillionTokens: activeDeployments.includes('CLOSED_API') ? apiPrice : 0,
          monthlySubscriptionPrice: activeDeployments.some(d => d !== 'CLOSED_API' && d !== 'OPEN_SOURCE') ? subPrice : 0,
          usersCount: Math.max(10, m.usersCount),
        };
      }
      return m;
    });

    updateState({
      trainedModels: updatedModels,
      activeModelId: currentModel.id,
      researchPoints: (state.researchPoints || 0) + ptsToGrant,
    });

    if (ptsToGrant > 0) {
      addLogMessage(`📡 FIRST RUN LAUNCHED: Deployed "${currentModel.name}" for the first time. Neural telemetry synthesized +${ptsToGrant} Research Points!`, 'SYSTEM');
    } else {
      addLogMessage(`🌐 DEPLOYMENT ACTIVE: Deployed "${currentModel.name}" under ${activeDeployments.map(d => d.replace(/_/g, ' ')).join(', ')}. User graphs are online.`, 'SYSTEM');
    }
  };

  const deactivateModel = () => {
    if (!currentModel) return;

    const updatedModels = models.map((m) => {
      if (m.id === currentModel.id) {
        return {
          ...m,
          isDeployed: false,
          deploymentType: 'NONE' as const,
          activeDeployments: [],
          usersCount: 0,
          monthlyRevenue: 0,
        };
      }
      return m;
    });

    const isCurrentActive = state.activeModelId === currentModel.id;

    updateState({
      trainedModels: updatedModels,
      activeModelId: isCurrentActive ? null : state.activeModelId,
    });

    addLogMessage(`⚠️ DEPLOYMENT TERMINATED: Cold-stopped API endpoints for "${currentModel.name}". All live user tunnels disconnected.`, 'SYSTEM');
  };

  // Build a bespoke software application
  const handleCreateApp = () => {
    if (!appName.trim()) {
      addLogMessage('❌ APP CREATION FAILED: Application name must not be blank.', 'SYSTEM');
      return;
    }

    const activeIds = appModelIds.length > 0 ? appModelIds : (models[0] ? [models[0].id] : []);
    if (activeIds.length === 0) {
      addLogMessage('❌ APP CREATION FAILED: You must have at least one trained AI model to power this application.', 'SYSTEM');
      return;
    }
    const selectedModels = activeIds.map(id => models.find(m => m.id === id)).filter(Boolean) as any[];
    const maxScore = Math.max(...selectedModels.map(m => m.qualityScore));

    const upfrontDevCost = 5000;
    if (state.cash < upfrontDevCost) {
      addLogMessage(`❌ APP CREATION FAILED: Insufficient funds. Requires $${upfrontDevCost.toLocaleString()} upfront setup/hosting costs.`, 'SYSTEM');
      return;
    }

    const newApp: SoftwareApp = {
      id: `app_${Date.now()}`,
      name: appName,
      type: appType,
      modelIds: [...activeIds],
      creationDate: state.currentDate,
      qualityScore: maxScore,
      activeUsers: 12, // initial core alpha users
      monthlyRevenue: 0,
      marketingSpendDaily: 10, // initial tiny marketing budget
      unlockedFeatures: [],
    };

    updateState({
      cash: state.cash - upfrontDevCost,
      apps: [...(state.apps || []), newApp]
    });

    addLogMessage(`🚀 APPLICATION ENGINE INSTALLED: "${newApp.name}" (${appType.replace(/_/g, ' ')}) has launched on Google Cloud! Upfront integration invoice processed: -$$5,000.`, 'SYSTEM');
    setAppName('New AI Agent');
  };

  // Shutdown application
  const handleShutdownApp = (id: string, name: string) => {
    updateState({
      apps: (state.apps || []).filter(a => a.id !== id)
    });
    addLogMessage(`🗑️ APPLICATION TERMINATED: Permanently shutdown application server clusters for "${name}".`, 'SYSTEM');
  };

  // Adjust app marketing budget on the fly
  const handleMarketingBudgetChange = (appId: string, budget: number) => {
    updateState({
      apps: (state.apps || []).map((app) => {
        if (app.id === appId) {
          return { ...app, marketingSpendDaily: budget };
        }
        return app;
      })
    });
  };

  const buyAppUpgrade = (appId: string, feature: string, cost: number) => {
    if (state.cash < cost) return;
    updateState({
      cash: state.cash - cost,
      apps: (state.apps || []).map((app) => {
        if (app.id === appId) {
          const features = app.unlockedFeatures || [];
          if (!features.includes(feature)) {
            return { ...app, unlockedFeatures: [...features, feature] };
          }
        }
        return app;
      })
    });
    addLogMessage(`🛠️ APP UPGRADE: Purchased ${feature.replace(/_/g, ' ')} upgrade for application. (-$${cost.toLocaleString()})`, 'SYSTEM');
  };

  const handleRouteModel = (appId: string, modelId: string, isSecondary: boolean = false) => {
    updateState({
      apps: (state.apps || []).map((app) => {
        if (app.id === appId) {
          if (isSecondary) {
            return { ...app, secondaryModelId: modelId };
          } else {
            return { ...app, modelId: modelId };
          }
        }
        return app;
      })
    });
    addLogMessage(`🔗 ROUTING UPDATE: Swapped routed model engine on application.`, 'SYSTEM');
  };

  const getDeploymentDescription = (type: string) => {
    switch (type) {
      case 'CLOSED_API': return 'Access raw weights behind an SSL authenticated proxy endpoint. Charging on volume processed. High margin, high developer flexibility.';
      case 'ENTERPRISE': return 'Custom dedicated instances, bespoke compliance rules, secure firewalls, and priority SLAs. Highly expensive corporate subscription models.';
      case 'APP_COPILOT': return 'Integrated desktop agents that complete, generate, or debug codebases. Caters to software developers, engineers, and tech hubs.';
      case 'CONSUMER_CHATBOT': return 'Casual text-interface available on web & mobile networks. Caters to students, copywriters, and general queries.';
      case 'OPEN_SOURCE': return 'Release full float weights to the public under standard Apache licences. Massive developer fame, but zero direct earnings.';
      default: return '';
    }
  };

  // Render tiny cosmetic display chart
  const renderMiniTrend = (seedVal: number) => {
    const width = 120;
    const height = 40;
    const points: string[] = [];

    for (let x = 0; x <= width; x += 10) {
      const angle = (x / width) * Math.PI * 3 + (seedVal * 0.1);
      const y = (height / 2) + Math.sin(angle) * (height / 2.5);
      points.push(`${x},${y}`);
    }

    return (
      <svg width={width} height={height} className="opacity-75 overflow-visible">
        <polyline
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeDasharray="4,2"
          points={points.join(' ')}
        />
      </svg>
    );
  };

  // Stars rating helper
  const getRatingStars = (quality: number) => {
    const starsCount = Math.min(5, Math.max(1, Math.round(quality / 20)));
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < starsCount ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
    ));
  };

  return (
    <div className="space-y-4">
      {/* Product sub tab selector */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-3 flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.01] to-transparent pointer-events-none" />
        
        <div className="flex gap-2 relative z-10">
          <button
            onClick={() => setActiveSubTab('DEPLOY')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all ${
              activeSubTab === 'DEPLOY'
                ? 'bg-cyan-950/65 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Model Endpoints & API Deployments
          </button>
          <button
            onClick={() => setActiveSubTab('APPS')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all ${
              activeSubTab === 'APPS'
                ? 'bg-cyan-950/65 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Bespoke App Builder
          </button>
        </div>
        <div className="text-right text-[9px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block relative z-10 pr-2">
          DISTRIBUTION HUB v2.5 // ONLINE
        </div>
      </div>

      {models.length === 0 ? (
        <div id="no_models_fallback" className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl p-10 text-center space-y-4 max-w-2xl mx-auto">
          <Server className="h-12 w-12 text-slate-600 mx-auto select-none stroke-[1.5] animate-pulse" />
          <h3 className="font-bold text-base text-slate-200">No raw models available in registries</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            You must first pretrain base foundation models before deploying consumer products or custom SaaS apps. Navigate to the <b>R&D Lab / training</b> tab to construct layers, curate dataset parameters, and begin SGD runs.
          </p>
        </div>
      ) : activeSubTab === 'DEPLOY' ? (
        /* Original Model Deployment Hub screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 space-y-5 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
            
            <div className="border-b border-slate-800/80 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
              <div>
                <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                  <Key className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
                  Product Deployment Console
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure public endpoints, subscription bands, and pricing structures for your trained models.</p>
              </div>

              <select
                className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg py-1.5 px-3 text-xs text-slate-350 font-mono focus:outline-none cursor-pointer transition-colors"
                value={selectedModelId || (models[0] && models[0].id) || ''}
                onChange={(e) => setSelectedModelId(e.target.value)}
              >
                {models.map((m) => {
                  const apiInfo = (m.activeDeployments || []).includes('CLOSED_API') ? `API: $${m.pricePerMillionTokens.toFixed(2)}` : '';
                  const subInfo = (m.activeDeployments || []).some(d => d !== 'CLOSED_API' && d !== 'OPEN_SOURCE') ? `Sub: $${m.monthlySubscriptionPrice}` : '';
                  const pricingText = m.isDeployed && (apiInfo || subInfo) ? ` [${[apiInfo, subInfo].filter(Boolean).join(' | ')}]` : '';
                  return (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.parametersCountB}B) - {m.isDeployed ? `🌐 Active${pricingText}` : '💤 Idle'}
                    </option>
                  );
                })}
              </select>
            </div>

            {currentModel && (
              <div className="space-y-5 relative z-10">
                <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                    <span className="text-slate-500 block uppercase text-[8px]">Architecture</span>
                    <span className="font-bold text-slate-200 text-xs block mt-0.5">{currentModel.architecture}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                    <span className="text-slate-500 block uppercase text-[8px]">Weights Size</span>
                    <span className="font-bold text-slate-200 text-xs block mt-0.5">{currentModel.parametersCountB}B Params</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                    <span className="text-slate-500 block uppercase text-[8px]">Model Quality</span>
                    <span className="font-bold text-cyan-400 text-xs block mt-0.5">{currentModel.qualityScore}%</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                    <span className="text-slate-500 block uppercase text-[8px]">Safety Score</span>
                    <span className="font-bold text-emerald-400 text-xs block mt-0.5">{currentModel.safetyScore}%</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <span className="block text-xs font-mono text-cyan-400 uppercase tracking-wide">Select Distribution Protocol</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      onClick={() => { toggleDeployment('CLOSED_API'); setApiPrice(2.50); }}
                      className={`text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer relative overflow-hidden ${
                        activeDeployments.includes('CLOSED_API') 
                          ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/50' 
                          : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <h4 className="font-bold text-slate-200 mb-0.5 flex items-center justify-between">
                        Programmatic API Proxies
                        {activeDeployments.includes('CLOSED_API') && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Charge developers based on Million Tokens input/output queries. Ideal for lightweight API clients.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => { toggleDeployment('APP_COPILOT'); setSubPrice(20); }}
                      className={`text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer relative overflow-hidden ${
                        activeDeployments.includes('APP_COPILOT') 
                          ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/50' 
                          : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <h4 className="font-bold text-slate-200 mb-0.5 flex items-center justify-between">
                        Developer App Copilot
                        {activeDeployments.includes('APP_COPILOT') && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Premium subscription. Auto completes and debugs inside local editor grids. High software developer affinity.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => { toggleDeployment('ENTERPRISE'); setSubPrice(500); }}
                      className={`text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer relative overflow-hidden ${
                        activeDeployments.includes('ENTERPRISE') 
                          ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/50' 
                          : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <h4 className="font-bold text-slate-200 mb-0.5 flex items-center justify-between">
                        SaaS Enterprise Suite
                        {activeDeployments.includes('ENTERPRISE') && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1">High volume B2B servers. Custom compliance guarantees, secure nodes. Extremely high sub payouts.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => { toggleDeployment('CONSUMER_CHATBOT'); setSubPrice(10); }}
                      className={`text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer relative overflow-hidden ${
                        activeDeployments.includes('CONSUMER_CHATBOT') 
                          ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/50' 
                          : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <h4 className="font-bold text-slate-200 mb-0.5 flex items-center justify-between">
                        Consumer Assistant Agent
                        {activeDeployments.includes('CONSUMER_CHATBOT') && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1">General chat interface available to the public. High viral growth potential but low active average sub cost.</p>
                    </button>
                  </div>
                </div>

                {activeDeployments.includes('CLOSED_API') && (
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">Set API Token Cost (per 1 Million Tokens):</span>
                      <span className="text-cyan-400 font-bold text-sm">${apiPrice.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="15.00"
                      step="0.10"
                      className="w-full accent-cyan-400 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                      value={apiPrice}
                      onChange={(e) => setApiPrice(parseFloat(e.target.value))}
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 font-mono pt-0.5">
                      <span>Cheap ($0.10)</span>
                      <span>Premium ($15.00)</span>
                    </div>
                  </div>
                )}

                {activeDeployments.some(d => d !== 'CLOSED_API' && d !== 'OPEN_SOURCE') && (
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">Monthly Subscription Pricing Plan ($):</span>
                      <span className="text-indigo-400 font-bold text-sm">${subPrice.toLocaleString()} / mo</span>
                    </div>
                    <input
                      type="range"
                      min={activeDeployments.includes('ENTERPRISE') ? '100' : '5'}
                      max={activeDeployments.includes('ENTERPRISE') ? '3000' : '150'}
                      step={activeDeployments.includes('ENTERPRISE') ? '50' : '1'}
                      className="w-full accent-indigo-400 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                      value={subPrice}
                      onChange={(e) => setSubPrice(parseInt(e.target.value, 10))}
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 font-mono pt-0.5">
                      <span>Affordable</span>
                      <span>High Premium Corporate Rate</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 border-t border-slate-800/80 pt-4">
                  <button
                    onClick={deactivateModel}
                    disabled={!currentModel.isDeployed}
                    className={`w-1/3 py-2.5 rounded-xl font-bold text-xs border text-center transition-all ${
                      currentModel.isDeployed 
                        ? 'border-red-900 bg-red-950/20 text-red-400 hover:bg-red-950/40 cursor-pointer' 
                        : 'border-slate-850 bg-slate-900 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    Off-line Server Nodes
                  </button>

                  <button
                    onClick={deployModel}
                    className="w-2/3 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-100 shadow-lg shadow-cyan-950/10 cursor-pointer text-center relative active:translate-y-px transition-all cta-glow"
                  >
                    {currentModel.isDeployed ? 'Update Deployed pricing parameters' : 'Activate Live Endpoints Deployment'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-emerald-950/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
              
              <h4 className="font-bold text-slate-100 text-sm border-b border-slate-800/80 pb-3 flex items-center gap-2 relative z-10">
                <Globe className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                Live Network Telemetry
              </h4>

              {currentModel && currentModel.isDeployed ? (
                <div className="space-y-4 font-mono text-xs relative z-10">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 space-y-4">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block leading-none">Active Model</span>
                      <span className="font-bold text-slate-200 text-xs block mt-1">{currentModel.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 pt-1">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Active Tunnels</span>
                        <span id="active_users_display" className="font-bold text-base text-emerald-400 mt-1 block">
                          {currentModel.usersCount.toLocaleString()} <span className="text-[8px] text-slate-500 block font-sans">API USERS</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Monthly Proj MRR</span>
                        <span id="monthly_mrr_display" className="font-bold text-base text-cyan-400 mt-1 block">
                          ${currentModel.monthlyRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3.5 flex justify-between items-center bg-[radial-gradient(circle_at_bottom,rgba(6,182,212,0.03)_0%,transparent_60%)]">
                    <div className="pr-1.5">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">API Client Load</span>
                      <p className="text-slate-500 text-[10px] leading-tight mt-1 truncate">HTTP socket bounds nominal.</p>
                    </div>
                    {renderMiniTrend(currentModel.usersCount)}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-500 font-mono text-xs relative z-10">
                  Offline. Deploy the selected model to activate user monitoring systems.
                </div>
              )}
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 space-y-3.5">
              <h4 className="font-bold text-slate-100 text-sm mb-1.5 flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-indigo-400" />
                Distribution Rules
              </h4>
              <ul className="text-xs text-slate-400 space-y-2.5 leading-relaxed">
                <li className="flex gap-2 items-start">
                  <span className="text-indigo-400 text-base leading-none select-none">•</span>
                  <span><b>PRICING SENSITIVITY:</b> Setting prices too high creates heavy user migration drops, causing active user sub channels to contract.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-indigo-400 text-base leading-none select-none">•</span>
                  <span><b>BRAND HYPE:</b> High corporate hype (raised via PR campaigns) increases initial user acquisition rates tenfold.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-indigo-400 text-base leading-none select-none">•</span>
                  <span><b>SAFETY BACKLASH:</b> Deploying models with safety alignment below 40% will trigger heavy regulatory compliance fines.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* II. Bespoke App Builder Factory */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Create Custom App Panel */}
          <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-cyan-950/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
            
            <div className="border-b border-slate-800/80 pb-3 relative z-10">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                <Rocket className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
                Launch New Custom App
              </h3>
              <p className="text-xs text-slate-400 mt-1">Develop and launch custom application services powered by your models to monetize standard consumer subscriptions.</p>
            </div>

            <div className="space-y-3.5 text-xs relative z-10">
              <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl space-y-1.5">
                <label className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider">Application Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none transition-colors"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. ChatSonic"
                />
              </div>

              <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl space-y-1.5">
                <label className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider">Application Type</label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg py-1.5 px-3 text-xs text-slate-350 focus:outline-none font-sans cursor-pointer transition-colors"
                  value={appType}
                  onChange={(e) => setAppType(e.target.value as any)}
                >
                  <option value="CHATBOT">Consumer Chatbot ($10/mo pricing standard)</option>
                  <option value="COPILOT_CODING">Developer Copilot IDE app ($35/mo pricing standard)</option>
                  <option value="AGENT_WORKFLOW">Agentic Corporate Workflow ($120/mo pricing standard)</option>
                  <option value="IMAGE_GENERATION">SaaS Image Generation portal ($25/mo pricing standard)</option>
                  <option value="VIDEO_GENERATION">SaaS Video Generator ($50/mo pricing standard)</option>
                </select>
              </div>

              <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider">Underlying AI Model Engines</label>
                  <span className="text-[9px] font-mono text-cyan-500">{appModelIds.length}/3 Tiers Selected</span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {models.length === 0 ? (
                    <div className="text-[10px] text-slate-500 italic">No models available. Train one first!</div>
                  ) : (
                    models.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-1.5 hover:bg-slate-900/50 rounded-lg border border-transparent hover:border-slate-800 transition-colors">
                        <input 
                          type="checkbox" 
                          className="accent-cyan-500"
                          checked={appModelIds.includes(m.id)}
                          onChange={() => toggleAppModel(m.id)}
                          disabled={!appModelIds.includes(m.id) && appModelIds.length >= 3}
                        />
                        <span className="truncate">{m.name} <span className="text-slate-500 text-[10px] font-mono">(Q: {m.qualityScore}%, {m.specialization})</span></span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-[9px] text-slate-500 mt-1 italic leading-normal">Hint: Selecting multiple models boosts user reach (up to 3 tiers). Matching specialization grants multipliers!</p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Setup Cost:</span>
                  <span className="font-bold text-rose-400 font-mono">$5,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Liquidity check:</span>
                  <span className={`font-bold font-mono ${state.cash >= 5000 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    ${state.cash.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateApp}
                disabled={state.cash < 5000}
                className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 disabled:opacity-45 hover:from-cyan-500 hover:to-indigo-500 text-slate-100 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 mt-1 cursor-pointer transition-all active:translate-y-px cta-glow text-xs uppercase tracking-wider"
              >
                <Rocket className="h-4 w-4" />
                Deploy App on Server Racks
              </button>
            </div>
          </div>

          {/* Active Custom Apps List */}
          <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-indigo-950/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
            
            <div className="border-b border-slate-800/80 pb-3 relative z-10">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                <Server className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                Your Running Application Clusters
              </h3>
              <p className="text-xs text-slate-400 mt-1">Review application telemetry, scale marketing budgets, and manage consumer app subscriptions.</p>
            </div>

            {(!state.apps || state.apps.length === 0) ? (
              <div className="text-center py-16 border border-dashed border-slate-800/80 rounded-2xl space-y-3 bg-slate-950/30 relative z-10">
                <Star className="h-8 w-8 text-slate-700 mx-auto animate-pulse" />
                <h4 className="font-bold text-slate-400 text-xs font-mono">No custom applications online</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  You have not built any consumer software apps yet. Use the launcher on the left to deploy your first application onto server grids.
                </p>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {(state.apps || []).map((app) => {
                  const underlyingModel = models.find(m => m.id === app.modelId);
                  const secondaryModel = app.secondaryModelId ? models.find(m => m.id === app.secondaryModelId) : null;
                  
                  const features = app.unlockedFeatures || [];
                  const hasThinking = features.includes('THINKING_LEVELS');
                  const hasMultimodal = features.includes('MULTIMODAL');
                  const hasSearch = features.includes('WEB_SEARCH');

                  // Filter available models that are safety aligned
                  const alignedModels = models.filter(m => m.isAligned !== false);
                  const reasoningModels = models.filter(m => m.isAligned !== false && (m.specialization === 'REASONING' || m.qualityScore >= 80));

                  return (
                    <div key={app.id} className="bg-slate-955/75 p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-4 shadow-lg shadow-black/20">
                      
                      {/* Row 1: App Header */}
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-100 font-extrabold text-sm tracking-tight">{app.name}</span>
                            <span className="text-[8px] bg-cyan-950/80 text-cyan-400 font-bold border border-cyan-900/40 px-2 py-0.5 rounded uppercase tracking-wider">
                              {app.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="flex gap-0.5 items-center">
                            {getRatingStars(app.qualityScore || 50)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleShutdownApp(app.id, app.name)}
                          className="p-2 rounded-lg bg-red-950/20 hover:bg-red-955/50 text-red-400 border border-red-900/40 transition-colors cursor-pointer inline-flex items-center justify-center animate-none"
                          title="Shutdown application"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Row 2: Model Routing Engine Slot Selector */}
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
                        <div className="space-y-1">
                          <label className="block text-slate-500 text-[8px] uppercase tracking-wider">Primary Model Tiers</label>
                          <div className="w-full bg-slate-900 border border-slate-800 rounded py-1.5 px-2 text-[10px] text-slate-350 flex flex-col gap-1">
                            {app.modelIds ? app.modelIds.map(id => {
                              const m = models.find(mod => mod.id === id);
                              return m ? <span key={id} className="truncate flex items-center gap-1.5"><span className="text-cyan-500/50">•</span> {m.name} <span className="text-slate-500 font-sans">(Q: {m.qualityScore}%)</span></span> : null;
                            }) : (
                              <span className="truncate flex items-center gap-1.5"><span className="text-cyan-500/50">•</span> {underlyingModel?.name || 'Unknown'} <span className="text-slate-500 font-sans">(Q: {underlyingModel?.qualityScore || 0}%)</span></span>
                            )}
                          </div>
                        </div>

                        {hasThinking ? (
                          <div className="space-y-1">
                            <label className="block text-slate-500 text-[8px] uppercase tracking-wider">Secondary Slot (Thinking Engine)</label>
                            <select
                              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded py-1 px-2 text-[10px] text-slate-355 focus:outline-none cursor-pointer"
                              value={app.secondaryModelId || ''}
                              onChange={(e) => handleRouteModel(app.id, e.target.value, true)}
                            >
                              <option value="">-- None (Pure fast mode) --</option>
                              {reasoningModels.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} (Q: {m.qualityScore}%)
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center border border-dashed border-slate-800 rounded p-2 text-[10px] text-slate-600 text-center leading-tight">
                            Thinking Engine Slot Locked.<br />Buy Thinking Levels upgrade below to unlock.
                          </div>
                        )}
                      </div>

                      {/* Row 3: Telemetry, Budget, Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
                        {/* Telemetry metrics */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900 text-center">
                            <span className="text-slate-500 text-[8px] uppercase block">Customers</span>
                            <span className="font-bold text-slate-200 text-xs block mt-0.5">{(app.activeUsers || 0).toLocaleString()}</span>
                          </div>
                          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900 text-center">
                            <span className="text-slate-500 text-[8px] uppercase block">Monthly MRR</span>
                            <span className="font-bold text-emerald-450 text-xs block mt-0.5">${(app.monthlyRevenue || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Interactive budget slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-500 uppercase">Daily Marketing:</span>
                            <span className="text-cyan-400 font-bold">${app.marketingSpendDaily || 0}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="300"
                            step="10"
                            className="w-full accent-cyan-400 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                            value={app.marketingSpendDaily || 0}
                            onChange={(e) => handleMarketingBudgetChange(app.id, parseInt(e.target.value, 10))}
                          />
                        </div>

                        {/* Status / Safety Indicators */}
                        <div className="text-[10px] font-mono space-y-1 text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60">
                          <div className="flex justify-between">
                            <span>Main Safety:</span>
                            <span className={underlyingModel && underlyingModel.safetyScore < 40 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-300'}>
                              {underlyingModel ? `${underlyingModel.safetyScore}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={underlyingModel?.isAligned === false || (hasThinking && secondaryModel?.isAligned === false) ? 'text-red-400 font-extrabold animate-pulse' : 'text-emerald-400 font-bold'}>
                              {underlyingModel?.isAligned === false || (hasThinking && secondaryModel?.isAligned === false) ? '🚫 UNALIGNED BLOCK' : '🟢 ACTIVE ON RACKS'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Row 4: Upgrades purchase panel */}
                      <div className="pt-3 border-t border-slate-900 space-y-2">
                        <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-extrabold">Available Feature Upgrades</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {/* Upgrade 1: Thinking levels */}
                          {hasThinking ? (
                            <div className="bg-emerald-950/20 border border-emerald-900/40 p-2 rounded-lg text-center flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold">
                              <CheckCircle className="h-4 w-4 text-emerald-400" /> Thinking Levels Active
                            </div>
                          ) : (
                            <button
                              onClick={() => buyAppUpgrade(app.id, 'THINKING_LEVELS', 25000)}
                              disabled={state.cash < 25000}
                              className="bg-slate-900 hover:bg-slate-850 disabled:opacity-40 border border-slate-800 text-slate-350 hover:text-slate-200 py-1.5 px-3 rounded-lg text-[10px] font-mono cursor-pointer transition-all flex flex-col items-center justify-center leading-tight gap-0.5"
                            >
                              <span className="font-bold">🧠 Thinking Levels</span>
                              <span className="text-[8px] text-amber-500 font-semibold">$25,000 Upfront</span>
                            </button>
                          )}

                          {/* Upgrade 2: Multimodal */}
                          {hasMultimodal ? (
                            <div className="bg-emerald-950/20 border border-emerald-900/40 p-2 rounded-lg text-center flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold">
                              <CheckCircle className="h-4 w-4 text-emerald-400" /> Multimodal Uploads Active
                            </div>
                          ) : (
                            <button
                              onClick={() => buyAppUpgrade(app.id, 'MULTIMODAL', 15000)}
                              disabled={state.cash < 15000}
                              className="bg-slate-900 hover:bg-slate-850 disabled:opacity-40 border border-slate-800 text-slate-350 hover:text-slate-200 py-1.5 px-3 rounded-lg text-[10px] font-mono cursor-pointer transition-all flex flex-col items-center justify-center leading-tight gap-0.5"
                            >
                              <span className="font-bold">🖼️ Multimodal Support</span>
                              <span className="text-[8px] text-amber-500 font-semibold">$15,000 Upfront</span>
                            </button>
                          )}

                          {/* Upgrade 3: Web Search */}
                          {hasSearch ? (
                            <div className="bg-emerald-950/20 border border-emerald-900/40 p-2 rounded-lg text-center flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold">
                              <CheckCircle className="h-4 w-4 text-emerald-400" /> Web Search Agent Active
                            </div>
                          ) : (
                            <button
                              onClick={() => buyAppUpgrade(app.id, 'WEB_SEARCH', 10000)}
                              disabled={state.cash < 10000}
                              className="bg-slate-900 hover:bg-slate-850 disabled:opacity-40 border border-slate-800 text-slate-350 hover:text-slate-200 py-1.5 px-3 rounded-lg text-[10px] font-mono cursor-pointer transition-all flex flex-col items-center justify-center leading-tight gap-0.5"
                            >
                              <span className="font-bold">🔍 Web Search Agent</span>
                              <span className="text-[8px] text-amber-500 font-semibold">$10,000 Upfront</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
