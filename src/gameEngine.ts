import { GameState, TrainedModel, OngoingTraining, Staff, Competitor, SocialFeedItem, GameNewsLog, ServerInstance, ModelFlaw, WarfareDefenseState } from './types';
import { GPUMARKETPLACE, SOCIAL_HANDLES, SOCIAL_TEMPLATES, LOCATIONS, CULTURES } from './data';

export function syncServerInstances(state: GameState): ServerInstance[] {
  const currentServers = state.serverInstances || [];
  const updatedServers: ServerInstance[] = [];

  // Group existing instances by gpuId
  const currentCountByGpuId: { [gpuId: string]: ServerInstance[] } = {};
  currentServers.forEach(srv => {
    if (!currentCountByGpuId[srv.gpuId]) {
      currentCountByGpuId[srv.gpuId] = [];
    }
    currentCountByGpuId[srv.gpuId].push(srv);
  });

  // Rebuild the list matching gpusInstalled quantities
  Object.entries(state.gpusInstalled || {}).forEach(([gpuId, qty]) => {
    const existing = currentCountByGpuId[gpuId] || [];
    const spec = GPUMARKETPLACE.find(g => g.id === gpuId) || (state.customChips || []).find(g => g.id === gpuId);
    const gpuName = spec ? spec.name : 'Unknown GPU Server';
    
    for (let i = 0; i < qty; i++) {
      if (i < existing.length) {
        updatedServers.push(existing[i]);
      } else {
        // Procure new unit
        updatedServers.push({
          id: `srv_${gpuId}_${Math.random().toString(36).substring(2, 7)}_${i}`,
          gpuId,
          gpuName,
          purchaseDate: state.currentDate,
          ageDays: 0,
          condition: 100,
          status: 'OPERATIONAL'
        });
      }
    }
  });

  return updatedServers;
}

// Helper to advance date by one day
export function advanceDate(dateString: string): string {
  const parts = dateString.split(' ');
  // Format: "Month DD, YYYY" (e.g. "June 23, 2026")
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthStr = parts[0];
  const dayStr = parts[1].replace(',', '');
  const yearStr = parts[2];

  let monthIndex = monthNames.indexOf(monthStr);
  let day = parseInt(dayStr, 10);
  let year = parseInt(yearStr, 10);

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // check leap year
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonth[1] = 29;
  }

  day++;
  if (day > daysInMonth[monthIndex]) {
    day = 1;
    monthIndex++;
    if (monthIndex >= 12) {
      monthIndex = 0;
      year++;
    }
  }

  return `${monthNames[monthIndex]} ${day}, ${year}`;
}

// Generate context-aware tweets or posts
export function generateContextAwareComment(
  platform: 'TWITTER' | 'REDDIT' | 'TIKTOK',
  model: TrainedModel | null,
  companyName: string,
  cultureType: string
): { content: string; sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' } {
  const templates = SOCIAL_TEMPLATES[platform];
  let template = templates[Math.floor(Math.random() * templates.length)];

  const modelName = model ? model.name : 'that unreleased secret model';
  const scoreNum = model ? Math.round(model.qualityScore * 0.8 + 19) : 45;
  const score = scoreNum.toString();

  let content = template
    .replace(/\[MODEL_NAME\]/g, modelName)
    .replace(/\[COMPANY\]/g, companyName)
    .replace(/\[SCORE\]/g, score)
    .replace(/\[CULTURE\]/g, cultureType.toLowerCase().replace(/_/g, ' '));

  let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
  if (model) {
    if (model.qualityScore > 75 && Math.random() > 0.3) {
      sentiment = 'POSITIVE';
    } else if (model.qualityScore < 45 && Math.random() > 0.4) {
      sentiment = 'NEGATIVE';
      content += ' Truly disappointing parameters match...';
    } else {
      sentiment = Math.random() > 0.5 ? 'POSITIVE' : 'NEUTRAL';
    }

    if (model.safetyScore < 40 && Math.random() > 0.5) {
      sentiment = 'NEGATIVE';
      content += ' Bro, it tells you how to make a bomb, this is unsafe af!';
    }
  }

  return { content, sentiment };
}

// Tick Game Simulation (runs every game day)
export function tickGameSimulation(state: GameState): GameState {
  if (state.isGameOver || state.gameSpeed === 'PAUSED' || state.activeLiveEvent) {
    return state;
  }

  const nextDate = advanceDate(state.currentDate);
  const nextDaysElapsed = state.daysElapsed + 1;
  
  let nextResearchPoints = state.researchPoints;
  const updatedLogs = [...state.newsLogs];
  let updatedCompetitors = state.competitors ? state.competitors.map(c => ({ ...c })) : [];

  // ==========================================
  // Section 0: Economic Crises
  // ==========================================
  let activeCrisis = state.activeCrisis || null;
  let crisisDaysRemaining = state.crisisDaysRemaining || 0;

  if (activeCrisis && crisisDaysRemaining > 0) {
    crisisDaysRemaining -= 1;
    if (crisisDaysRemaining <= 0) {
      updatedLogs.unshift({
        id: `crisis_end_${nextDaysElapsed}`,
        dateString: nextDate,
        message: `🌤️ CRISIS RESOLVED: The recent market anomaly has stabilized. Operations are returning to normal parameters.`,
        type: 'SYSTEM',
      });
      activeCrisis = null;
    }
  } else if (!activeCrisis && nextDaysElapsed > 90) { // Crises start after day 90
    const crisisChance = state.difficultyLevel === 'EXPERT' ? 0.005 : (state.difficultyLevel === 'HARD' ? 0.003 : 0.002);
    if (Math.random() < crisisChance) {
      const crisisTypes: ('MARKET_DOWNTURN' | 'POWER_OUTAGE' | 'REGULATORY_CRACKDOWN')[] = ['MARKET_DOWNTURN', 'POWER_OUTAGE', 'REGULATORY_CRACKDOWN'];
      activeCrisis = crisisTypes[Math.floor(Math.random() * crisisTypes.length)];
      
      let crisisMsg = '';
      if (activeCrisis === 'MARKET_DOWNTURN') {
        crisisDaysRemaining = 30 + Math.floor(Math.random() * 60); // 1 to 3 months
        crisisMsg = `📉 MARKET CRASH: A sudden Silicon Valley economic crisis has frozen VC funding and sharply reduced user spending across all applications.`;
      } else if (activeCrisis === 'POWER_OUTAGE') {
        crisisDaysRemaining = 7 + Math.floor(Math.random() * 14); // 1 to 3 weeks
        crisisMsg = `⚡ GRID FAILURE: Regional heatwaves have caused rolling blackouts! Power costs are skyrocketing and compute limits are severely throttled!`;
      } else if (activeCrisis === 'REGULATORY_CRACKDOWN') {
        crisisDaysRemaining = 20 + Math.floor(Math.random() * 40); // 1 to 2 months
        crisisMsg = `⚖️ REGULATORY CRACKDOWN: Emergency government decrees have crippled open-source growth and fined unsafe model operations heavily.`;
      }

      updatedLogs.unshift({
        id: `crisis_start_${nextDaysElapsed}`,
        dateString: nextDate,
        message: crisisMsg,
        type: 'EVENT',
      });
    }
  }

  // ==========================================
  // Section 0.5: AI Wars (Market Dynamics)
  // ==========================================
  let nextCashAdjusted = state.cash;
  let nextGpuShortageMultiplier = state.gpuShortageMultiplier || 1.0;
  let nextGpuShortageDays = state.gpuShortageDaysRemaining || 0;
  
  if (nextGpuShortageDays > 0) {
    nextGpuShortageDays -= 1;
    if (nextGpuShortageDays <= 0) {
      nextGpuShortageMultiplier = 1.0;
      updatedLogs.unshift({
        id: `gpu_shortage_end_${nextDaysElapsed}`,
        dateString: nextDate,
        message: `🟢 SUPPLY CHAIN: Global GPU shortages have eased. Silicon prices returning to baseline.`,
        type: 'MARKET',
      });
    }
  }

  let aiWarSentimentDrop = 0;
  let aiWarHypeDrop = 0;
  let serverFailureIncidentAiWar = false;

  if (nextDaysElapsed > 100 && Math.random() < 0.035) {
    const aiWarEvent = Math.floor(Math.random() * 5); // 0-4
    
    if (aiWarEvent === 0) {
      // 1. Cyberattack / Infrastructure Sabotage
      serverFailureIncidentAiWar = true;
      updatedLogs.unshift({
        id: `aiwar_cyber_${nextDaysElapsed}`,
        dateString: nextDate,
        message: `🚨 CYBERATTACK: State-sponsored or competitor hackers breached your perimeter! Multiple GPU nodes sustained heavy software corruption and condition degradation!`,
        type: 'EVENT',
      });
    } else if (aiWarEvent === 1 && nextGpuShortageDays <= 0) {
      // 2. GPU Supply Squeeze (Competitors hoarding)
      nextGpuShortageDays = 15 + Math.floor(Math.random() * 20);
      nextGpuShortageMultiplier = 1.5 + (Math.random() * 1.5); // 1.5x to 3x price
      updatedLogs.unshift({
        id: `aiwar_gpu_${nextDaysElapsed}`,
        dateString: nextDate,
        message: `🚨 HARDWARE SQUEEZE: Meta and OpenAI just purchased 150,000 top-tier accelerators. Global GPU prices have skyrocketed by ${(nextGpuShortageMultiplier*100-100).toFixed(0)}%!`,
        type: 'MARKET',
      });
    } else if (aiWarEvent === 2) {
      // 3. Corporate Espionage / Leaks
      const rpLoss = Math.floor(nextResearchPoints * 0.2); // lose 20% of RP
      if (rpLoss > 5) {
        nextResearchPoints -= rpLoss;
        updatedLogs.unshift({
          id: `aiwar_espionage_${nextDaysElapsed}`,
          dateString: nextDate,
          message: `🚨 ESPIONAGE: A rogue employee exfiltrated proprietary datasets to a competitor! Lost ${rpLoss} Research Points.`,
          type: 'EVENT',
        });
      }
    } else if (aiWarEvent === 3) {
      // 4. PR Smear Campaign
      aiWarSentimentDrop = 15 + Math.floor(Math.random() * 10);
      updatedLogs.unshift({
        id: `aiwar_pr_${nextDaysElapsed}`,
        dateString: nextDate,
        message: `🚨 SMEAR CAMPAIGN: Competitors funded an aggressive hit-piece on your latest model's safety alignment. Public sentiment plummeted!`,
        type: 'EVENT',
      });
    }
    // Talent Poaching is handled in the Staff Loop below
  }

  // 1. Calculate Staff Multipliers
  const researchTeam = state.staff.filter((s) => s.role === 'RESEARCH_SCIENTIST');
  const dataTeam = state.staff.filter((s) => s.role === 'DATA_ENGINEER');
  const devTeam = state.staff.filter((s) => s.role === 'FRONTEND_APP_DEV');
  const legalTeam = state.staff.filter((s) => s.role === 'PR_LEGAL_SPECIALIST');

  const researchSkillSum = researchTeam.reduce((sum, s) => sum + s.skill * (s.morale / 100), 0);
  const dataSkillSum = dataTeam.reduce((sum, s) => sum + s.skill * (s.morale / 100), 0);
  const devSkillSum = devTeam.reduce((sum, s) => sum + s.skill * (s.morale / 100), 0);
  const legalSkillSum = legalTeam.reduce((sum, s) => sum + s.skill * (s.morale / 100), 0);

  // Salaries (monthly, so daily = salary / 30)
  const totalSalaries = state.staff.reduce((sum, s) => sum + s.salary, 0);

  // 2. Hardware and Compute Cluster Metrics (Granular Server Level with Degradation)
  const syncedServers = syncServerInstances(state);

  const isTrainingActive = !!state.training;

  // We do an initial pass of active power to get accurate rack heatLevel for the aging pass
  let activePowerForHeat = 0;
  syncedServers.forEach((srv) => {
    const spec = GPUMARKETPLACE.find((g) => g.id === srv.gpuId) || (state.customChips || []).find((g) => g.id === srv.gpuId);
    if (spec) {
      if (srv.status === 'SHUTDOWN' || srv.underMaintenance || srv.isPoweredOff || !isTrainingActive) {
        activePowerForHeat += 0.05; // tiny standby power
      } else {
        let power = spec.powerUsageKW;
        if (state.research?.unlockedAdvancedInverters) {
          power *= 0.8; // Advanced Power Inverters: 20% passive reduction
        }
        activePowerForHeat += power;
      }
    }
  });

  const heatReduction = state.research?.unlockedLiquidCooling ? 0.7 : 1.0;
  const overclockHeatIncrease = state.research?.unlockedOverclockingRigs ? 1.2 : 1.0;

  const heatLevel = Math.max(
    25,
    Math.min(
      110,
      25 + (activePowerForHeat > 0 ? ((activePowerForHeat / 8) / (state.coolingLevel * 1.5)) * heatReduction * overclockHeatIncrease : 0)
    )
  );

  let clusterOverheated = heatLevel > 80;
  let serverFailureIncident = false;
  // updatedLogs already initialized

  // Now, let's run degradation on each server instance
  const degradedServers = syncedServers.map((srv) => {
    const srvCopy = { ...srv };

    if (srvCopy.underMaintenance) {
      if (srvCopy.maintenanceDaysRemaining !== undefined) {
        srvCopy.maintenanceDaysRemaining -= 1;
        if (srvCopy.maintenanceDaysRemaining <= 0) {
          srvCopy.underMaintenance = false;
          srvCopy.maintenanceDaysRemaining = undefined;
          srvCopy.condition = 100;
          srvCopy.status = 'OPERATIONAL';
          srvCopy.thermalShutdown = false;
          
          updatedLogs.unshift({
            id: `srv_maint_done_${srvCopy.id}_${nextDaysElapsed}_${Math.random()}`,
            dateString: nextDate,
            message: `⚙️ MAINTENANCE COMPLETED: ${srvCopy.gpuName} has been fully re-calibrated and restored to 100% condition. It is now back online.`,
            type: 'SYSTEM',
          });
        }
      }
      return srvCopy;
    }

    if (srvCopy.isPoweredOff) {
      return srvCopy;
    }

    srvCopy.ageDays += 1;

    if (srvCopy.status !== 'SHUTDOWN') {
      const heatMultiplier = heatLevel >= 95 ? 6 : heatLevel >= 80 ? 3 : heatLevel >= 60 ? 1.5 : 1.0;
      const genMultiplier = srvCopy.gpuId === 'h100' ? 1.0 : srvCopy.gpuId === 'b200' ? 1.15 : srvCopy.gpuId === 'blackwell_ultra' ? 1.25 : 1.35;
      
      let dailyWear = 0;
      if (serverFailureIncidentAiWar) {
        dailyWear = 20 + Math.random() * 20; // 20-40% condition drop
      } else if (isTrainingActive) {
        dailyWear = 0.25 * heatMultiplier * genMultiplier;
        if (state.difficultyLevel === 'EXPERT') {
          dailyWear *= 3.0;
        } else if (state.difficultyLevel === 'HARD') {
          dailyWear *= 2.0;
        }
      } else {
        dailyWear = 0.02; // minimal idle degradation
      }

      const nextCondition = Math.max(0, srvCopy.condition - dailyWear);

      // Check alert transitions
      if (nextCondition <= 0 && srvCopy.condition > 0) {
        srvCopy.status = 'SHUTDOWN';
        updatedLogs.unshift({
          id: `srv_shutdown_${srvCopy.id}_${nextDaysElapsed}_${Math.random()}`,
          dateString: nextDate,
          message: `🚨 HARDWARE FAILURE: ${srvCopy.gpuName} has completely degraded and shut down! Operational capacity lost.`,
          type: 'EVENT',
        });
        serverFailureIncident = true;
      } else if (nextCondition < 20 && srvCopy.condition >= 20) {
        srvCopy.status = 'CRITICAL';
        updatedLogs.unshift({
          id: `srv_crit_${srvCopy.id}_${nextDaysElapsed}_${Math.random()}`,
          dateString: nextDate,
          message: `⚠️ CRITICAL UPKEEP: ${srvCopy.gpuName} is at ${Math.round(nextCondition)}% condition. Urgent maintenance required!`,
          type: 'SYSTEM',
        });
      } else if (nextCondition < 50 && srvCopy.condition >= 50) {
        srvCopy.status = 'NEEDS_MAINTENANCE';
        updatedLogs.unshift({
          id: `srv_maint_${srvCopy.id}_${nextDaysElapsed}_${Math.random()}`,
          dateString: nextDate,
          message: `⚙️ UPKEEP ALERT: ${srvCopy.gpuName} is showing wear (${Math.round(nextCondition)}% condition). Schedule maintenance to prevent performance drop.`,
          type: 'SYSTEM',
        });
      }

      srvCopy.condition = parseFloat(nextCondition.toFixed(2));

      // Thermal shutdown or random fault risks
      if (srvCopy.status !== 'SHUTDOWN') {
        let faultChance = 0;
        if (heatLevel >= 95) faultChance = 0.12;
        else if (heatLevel >= 80) faultChance = 0.04;
        
        // condition wear risk
        if (srvCopy.condition < 40) {
          faultChance += (40 - srvCopy.condition) * 0.002;
        }

        if (Math.random() < faultChance) {
          srvCopy.status = 'SHUTDOWN';
          srvCopy.thermalShutdown = true;
          updatedLogs.unshift({
            id: `srv_thermal_sd_${srvCopy.id}_${nextDaysElapsed}_${Math.random()}`,
            dateString: nextDate,
            message: `🔥 THERMAL HALT: Automated fail-safes suspended ${srvCopy.gpuName} to prevent silicon melting (Rack Temp: ${heatLevel.toFixed(1)}°C). Requires manual repair.`,
            type: 'EVENT',
          });
          serverFailureIncident = true;
        }
      }
    }

    return srvCopy;
  });

  // Calculate actual operating metrics (flops, power, and lease cost)
  let totalTflops = 0;
  let totalPowerKW = 0;
  let leaseCostMonthly = 0;

  degradedServers.forEach((srv) => {
    const gpuSpec = GPUMARKETPLACE.find((g) => g.id === srv.gpuId) || (state.customChips || []).find((g) => g.id === srv.gpuId);
    if (gpuSpec) {
      leaseCostMonthly += gpuSpec.cost * 0.12;
      if (srv.status === 'SHUTDOWN' || srv.underMaintenance || srv.isPoweredOff) {
        totalPowerKW += 0.05; // tiny standby draw
      } else {
        const performanceFactor = srv.condition >= 80 ? 1.0 : Math.max(0.1, srv.condition / 80);
        let tflops = gpuSpec.tflops * performanceFactor;
        if (state.research?.unlockedOverclockingRigs) {
          tflops *= 1.25; // Overclocking Rigs: 25% compute performance boost
        }
        totalTflops += tflops;

        let power = gpuSpec.powerUsageKW;
        if (state.research?.unlockedAdvancedInverters) {
          power *= 0.8; // Advanced Power Inverters: 20% power reduction
        }
        
        if (!isTrainingActive) {
          totalPowerKW += 0.05; // idle standby power when not training
        } else {
          totalPowerKW += power;
        }
      }
    }
  });

  // Location parameters
  const electricityRate = state.hqLocation.electricityCost;
  const monthlyRent = state.hqLocation.monthlyRent;

  // Daily energy cost: totalPowerKW * 24 hours * cost/kWh * 2.5 (re-balanced)
  let dailyElectricityCost = totalPowerKW * 24 * electricityRate * 2.5;
  if (activeCrisis === 'POWER_OUTAGE') {
    dailyElectricityCost *= 5; // Power costs 5x during crisis
  }
  const monthlyElectricityBill = dailyElectricityCost * 30;

  // Apply power outage TFLOPS throttle
  if (activeCrisis === 'POWER_OUTAGE') {
    totalTflops *= 0.35; // Compute runs at 35% capacity during outage due to fallback generators
  }

  // Upkeep financials (daily projection)
  let dailySalaries = totalSalaries / 30;
  if (state.activeOrigin === 'NEPO_BABY') {
    dailySalaries *= 2.0; // Nepo baby pays double for talent
  }

  const dailyRent = monthlyRent / 30;
  const dailyLease = leaseCostMonthly / 30;
  const dailyCoolingCost = (state.coolingLevel * 400) / 30;
  const dailyLegalOverhead = (legalTeam.length > 0 ? 200 : 1000) / 30;

  let dailyInterest = 0;
  if (state.corporateDebt && state.corporateDebt > 0) {
    dailyInterest = 50000 / 30; // $50k monthly interest on $5M debt
  }

  let dailyOperatingExpenses = dailyElectricityCost + dailySalaries + dailyRent + dailyLease + dailyCoolingCost + dailyLegalOverhead + dailyInterest;
  if (state.difficultyLevel === 'EXPERT') {
    dailyOperatingExpenses *= 1.5;
  } else if (state.difficultyLevel === 'HARD') {
    dailyOperatingExpenses *= 1.2;
  }

  // 3. Revenue Engine from Deployed Models
  let dailyRevenue = 0;
  
  // Find top score of competitors
  const bestCompetitorScore = state.competitors && state.competitors.length > 0
    ? Math.max(...state.competitors.map((c) => c.leadModelScore))
    : 80;

  const competitorAverageScore = state.competitors && state.competitors.length > 0
    ? state.competitors.reduce((sum, c) => sum + c.leadModelScore, 0) / state.competitors.length
    : 80;

  const updatedTrainedModels = state.trainedModels.map((model) => {
    // 1. Record score history
    const newScoreHistory = [...(model.scoreHistory || [])];
    
    const mmluVerified = !model.benchmarkStatus || model.benchmarkStatus.mmlu === 'VERIFIED';
    const humanEvalVerified = !model.benchmarkStatus || model.benchmarkStatus.humanEval === 'VERIFIED';
    const gsm8kVerified = !model.benchmarkStatus || model.benchmarkStatus.gsm8k === 'VERIFIED';
    const mathVerified = !model.benchmarkStatus || model.benchmarkStatus.math === 'VERIFIED';
    const gpqaVerified = !model.benchmarkStatus || model.benchmarkStatus.gpqa === 'VERIFIED';
    const sweVerified = !model.benchmarkStatus || model.benchmarkStatus.sweBench === 'VERIFIED';
    const ifVerified = !model.benchmarkStatus || model.benchmarkStatus.ifeval === 'VERIFIED';
    const eloVerified = !model.benchmarkStatus || model.benchmarkStatus.arenaElo === 'VERIFIED';

    const getEffectiveValue = (metric: keyof typeof model.benchmarks) => {
      let val = model.benchmarks[metric];
      if (model.flaws) {
        model.flaws.forEach(flaw => {
          if (!flaw.isFixed && flaw.metricImpacted === metric) {
            val *= (1 - flaw.penaltyPct / 100);
          }
        });
      }
      return val;
    };

    const verifiedCount = 
      (mmluVerified ? 1 : 0) + (humanEvalVerified ? 1 : 0) + (gsm8kVerified ? 1 : 0) + 
      (mathVerified ? 1 : 0) + (gpqaVerified ? 1 : 0) + (sweVerified ? 1 : 0) + 
      (ifVerified ? 1 : 0) + (eloVerified ? 1 : 0);
      
    const modelAverageScore = verifiedCount > 0 
      ? (
          (mmluVerified ? getEffectiveValue('mmlu') : 0) + 
          (humanEvalVerified ? getEffectiveValue('humanEval') : 0) + 
          (gsm8kVerified ? getEffectiveValue('gsm8k') : 0) + 
          (mathVerified ? getEffectiveValue('math') : 0) +
          (gpqaVerified ? getEffectiveValue('gpqa') : 0) +
          (sweVerified ? getEffectiveValue('sweBench') : 0) +
          (ifVerified ? getEffectiveValue('ifeval') : 0) +
          (eloVerified ? getEffectiveValue('arenaElo') : 0)
        ) / verifiedCount 
      : model.qualityScore;
      
    // Always append daily to keep the graph moving
    newScoreHistory.push({
      date: nextDate,
      modelScore: Math.round(modelAverageScore * 10) / 10,
      marketAverage: Math.round(competitorAverageScore * 10) / 10,
    });
    
    if (newScoreHistory.length > 30) {
      newScoreHistory.shift();
    }

    const activeDeployments = model.activeDeployments || (model.deploymentType && model.deploymentType !== 'NONE' ? [model.deploymentType as any] : []);

    if (!model.isDeployed || activeDeployments.length === 0) {
      return { ...model, scoreHistory: newScoreHistory, usersCount: 0, monthlyRevenue: 0 };
    }

    // Determine target users growth
    let growthRate = 0;
    let baseAdoption = 15;
    let revenueMultiplier = 1.0;

    if (activeCrisis === 'MARKET_DOWNTURN') {
      baseAdoption *= 0.3; // Very slow growth
      revenueMultiplier *= 0.6; // Reduced spending
    }

    if (activeCrisis === 'REGULATORY_CRACKDOWN' && !activeDeployments.includes('OPEN_SOURCE')) {
       baseAdoption *= 0.5; // Stalls commercial adoption
    }

    // Open Source Evangelist culture limits active cash, boosts adoptions
    if (state.culture.type === 'OPEN_SOURCE_EVANGELIST') {
      baseAdoption *= 2.5;
      revenueMultiplier *= 0.3;
    } else if (state.culture.type === 'SAFETY_ALIGNMENT') {
      revenueMultiplier *= 1.25; // enterprise pays premium
    }

    // Spec boosts
    const specialty = model.specialization;
    let specBonus = 1.0;
    if (specialty === 'CODING' && devSkillSum > 0) specBonus = 1.2;
    if (specialty === 'REASONING' && researchSkillSum > 0) specBonus = 1.35;

    // Competitor pressure impact
    const scoreGap = model.qualityScore - bestCompetitorScore;
    const competitiveMultiplier = scoreGap < 0 
      ? Math.max(0.05, 1 + (scoreGap / 22)) // severely chokes user acquisition if behind best competitor
      : 1 + (scoreGap / 100); // slight boost if ahead of top model

    // Value perception
    let attractionIndex = (model.qualityScore * specBonus * state.globalPublicSentiment) / 50;
    attractionIndex = Math.max(0.1, attractionIndex * (1 + state.hypeLevel / 100) * competitiveMultiplier);

    let activeUsers = model.usersCount;
    let modelDailyRev = 0;

    for (const dep of activeDeployments) {
      if (dep === 'OPEN_SOURCE') {
        let openSourceGrowth = attractionIndex * baseAdoption * 3;
        activeUsers = Math.max(10, activeUsers + openSourceGrowth);
      } else if (dep === 'CLOSED_API') {
        const tokenPrice = model.pricePerMillionTokens || 2;
        let apiGrowth = (attractionIndex * baseAdoption * 0.2) / Math.max(0.5, tokenPrice * 0.75);
        activeUsers = Math.max(5, activeUsers + apiGrowth);
        modelDailyRev += (activeUsers * 0.35 * tokenPrice) * revenueMultiplier;
      } else if (dep === 'ENTERPRISE') {
        const subPrice = model.monthlySubscriptionPrice || 500;
        let entGrowth = (attractionIndex * baseAdoption * 0.01) / Math.max(1, subPrice / 300);
        activeUsers = Math.max(2, activeUsers + entGrowth);
        modelDailyRev += (activeUsers * (subPrice / 30)) * revenueMultiplier;
      } else if (dep === 'APP_COPILOT') {
        const subPrice = model.monthlySubscriptionPrice || 20;
        let copilotGrowth = (attractionIndex * baseAdoption * 0.05) / Math.max(0.5, subPrice / 15);
        activeUsers = Math.max(3, activeUsers + copilotGrowth);
        modelDailyRev += (activeUsers * (subPrice / 30)) * revenueMultiplier;
      } else if (dep === 'CONSUMER_CHATBOT') {
        const subPrice = model.monthlySubscriptionPrice || 10;
        let chatGrowth = (attractionIndex * baseAdoption * 0.1) / Math.max(0.3, subPrice / 10);
        activeUsers = Math.max(10, activeUsers + chatGrowth);
        modelDailyRev += (activeUsers * (subPrice / 30)) * revenueMultiplier;
      }
    }

    if (state.activeOrigin === 'DESPERATE_PIVOT') {
      modelDailyRev *= 2.0;
    }

    dailyRevenue += modelDailyRev;

    return {
      ...model,
      scoreHistory: newScoreHistory,
      usersCount: Math.round(activeUsers),
      monthlyRevenue: Math.round(modelDailyRev * 30),
    };
  });

  const updatedTrainedModelsList: TrainedModel[] = [...updatedTrainedModels];

  // 3b. Software Apps Simulation Engine
  let appsRevenueToday = 0;
  let appMarketingExpensesToday = 0;
  let appServerMaintenanceToday = 0;

  const simulatedApps = (state.apps || []).map((app) => {
    // Find models powering this app
    const primaryModels = app.modelIds 
      ? app.modelIds.map(id => updatedTrainedModelsList.find(m => m.id === id)).filter(Boolean) as any[]
      : (app.modelId ? [updatedTrainedModelsList.find(m => m.id === app.modelId)].filter(Boolean) as any[] : []);
    
    // Pick the "best" primary model to represent the app's base capability
    const appModel = primaryModels.length > 0 ? primaryModels.reduce((prev, current) => (prev.qualityScore > current.qualityScore) ? prev : current) : null;
    
    const secondaryModel = app.secondaryModelId ? updatedTrainedModelsList.find(m => m.id === app.secondaryModelId) : null;
    
    // Check if ANY model is NOT safety aligned. Unaligned models cause a massive PR block/legal fine!
    const isMainAligned = primaryModels.length > 0 ? primaryModels.every(m => m.isAligned !== false) : true;
    const isSecondaryAligned = secondaryModel ? secondaryModel.isAligned : true;
    const hasAlignmentBlock = !isMainAligned || !isSecondaryAligned;

    const modelQuality = appModel ? appModel.qualityScore : 40;

    // Check suitability bonuses
    let suitabilityBonus = 1.0;
    if (appModel) {
      if (app.type === 'COPILOT_CODING' && appModel.specialization === 'CODING') suitabilityBonus = 2.2;
      if (app.type === 'CHATBOT' && (appModel.specialization === 'GENERAL' || appModel.specialization === 'MEDICAL')) suitabilityBonus = 1.8;
      if (app.type === 'AGENT_WORKFLOW' && appModel.specialization === 'REASONING') suitabilityBonus = 2.5;
      
      // Multimodality checks
      if (app.type === 'IMAGE_GENERATION' && appModel.domain === 'IMAGE_DIFFUSION') suitabilityBonus = 2.4;
      if (app.type === 'VIDEO_GENERATION' && appModel.domain === 'VIDEO_GENERATION') suitabilityBonus = 2.8;
    }

    // Base marketing boost
    const marketingBonus = app.marketingSpendDaily > 0 ? Math.log2(app.marketingSpendDaily + 1) * 12 : 0.5;
    
    // Base growth formula
    let growth = ((modelQuality / 45) * suitabilityBonus * (1 + (state.hypeLevel || 20) / 200) * marketingBonus) * 0.15;

    // Features upgrades bonuses
    if (primaryModels.length > 1) {
      growth *= (1 + (primaryModels.length - 1) * 0.15); // +15% per extra model tier
    }
    
    if (app.unlockedFeatures?.includes('MULTIMODAL')) {
      growth *= 1.3; // +30% user growth
    }
    if (app.unlockedFeatures?.includes('WEB_SEARCH')) {
      growth *= 1.1; // +10% user growth / retention
    }
    if (app.unlockedFeatures?.includes('THINKING_LEVELS') && secondaryModel) {
      growth *= 1.25; // +25% growth because users love deep reasoning
    }

    if (activeCrisis === 'MARKET_DOWNTURN') {
      growth *= 0.2; // Severely lower growth
    }
    
    // Competitor pressure churn
    if (modelQuality < bestCompetitorScore - 4) {
      growth -= (bestCompetitorScore - modelQuality) * 1.5;
    }

    // If there is an alignment block, user base churns rapidly
    if (hasAlignmentBlock) {
      growth = -Math.max(10, app.activeUsers * 0.15); // Lose 15% of users daily
    }

    let nextUsers = Math.max(0, app.activeUsers + growth);
    
    // Subscription income per day per user
    let pricePerDay = 0;
    if (app.type === 'CHATBOT') pricePerDay = 10 / 30;
    else if (app.type === 'COPILOT_CODING') pricePerDay = 35 / 30;
    else if (app.type === 'AGENT_WORKFLOW') pricePerDay = 120 / 30;
    else if (app.type === 'IMAGE_GENERATION') pricePerDay = 25 / 30;
    else if (app.type === 'VIDEO_GENERATION') pricePerDay = 50 / 30;

    // Add thinking levels premium price
    if (app.unlockedFeatures?.includes('THINKING_LEVELS') && secondaryModel) {
      pricePerDay += 15 / 30; // +$15/month surcharge
    }

    if (activeCrisis === 'MARKET_DOWNTURN') {
      pricePerDay *= 0.6; // Reduced user spending
    }

    // If alignment is blocked, we make 0 revenue due to app store suspensions
    let appRevToday = hasAlignmentBlock ? 0 : nextUsers * pricePerDay;
    if (state.activeOrigin === 'DESPERATE_PIVOT') {
      appRevToday *= 2.0;
    }
    
    appsRevenueToday += appRevToday;
    appMarketingExpensesToday += app.marketingSpendDaily;

    // Daily server maintenance cost
    let dailyServerCost = nextUsers * 0.002;
    if (state.research?.completedProjects?.includes('speculativeDecoding')) {
      dailyServerCost *= 0.85; // 15% server savings
    }
    appServerMaintenanceToday += dailyServerCost;

    return {
      ...app,
      activeUsers: Math.round(nextUsers),
      monthlyRevenue: Math.round(appRevToday * 30),
    };
  });

  dailyRevenue += appsRevenueToday;
  nextCashAdjusted -= appServerMaintenanceToday; // Subtract server maintenance from daily cash

  // ==========================================
  // Section 3c: Sovereign Contracts & AI Agent Overhead & Fines
  // ==========================================
  
  // A. AI Agent Compute Overhead
  const totalAgentComputeMonthly = (state.aiAgents || []).reduce((sum, a) => sum + a.computeCostMonthly, 0);
  const dailyAgentCompute = totalAgentComputeMonthly / 30;

  // B. Sovereign Contracts Payout
  const activeContracts = (state.contracts || []).filter(c => c.status === 'ACTIVE');
  const dailyContractPayout = activeContracts.reduce((sum, c) => sum + (c.monthlyPayout / 30), 0);
  
  // C. Regulatory Fines
  let totalRegulatoryFinesMonthly = 0;
  const deployedCommercialModels = updatedTrainedModelsList.filter(m => m.isDeployed && m.activeDeployments?.some(dep => dep !== 'OPEN_SOURCE'));
  
  const lobbyingLevel = state.lobbyingLevel || 0;
  const mandates = state.regulatoryMandates || [];
  
  mandates.forEach(mandate => {
    if (mandate.status === 'ACTIVE') {
      let effectiveThreshold = Math.max(10, mandate.minSafetyRequired - (lobbyingLevel * 5));
      let activeFineRate = mandate.fineRateMonthly;
      if (activeCrisis === 'REGULATORY_CRACKDOWN') {
        effectiveThreshold = Math.min(99, effectiveThreshold + 15);
        activeFineRate *= 2;
      }

      deployedCommercialModels.forEach(model => {
        if (model.safetyScore < effectiveThreshold) {
          totalRegulatoryFinesMonthly += activeFineRate;
        }
      });
    }
  });

  const dailyRegulatoryFines = totalRegulatoryFinesMonthly / 30;

  // Adjust daily revenue and daily operating expenses
  dailyRevenue += dailyContractPayout;
  const totalOperatingExpensesAdjusted = dailyOperatingExpenses + dailyAgentCompute + dailyRegulatoryFines;

  // Adjust operating expenses to deduct daily marketing budget
  const adjustedOperatingExpenses = totalOperatingExpensesAdjusted + appMarketingExpensesToday;
  const netEarningsToday = dailyRevenue - adjustedOperatingExpenses;
  const nextCash = nextCashAdjusted + netEarningsToday;

  // 4. Training Engine
  let updatedTraining: OngoingTraining | null = null;
  const completedMilestones = [...state.completedMilestones];

  if (state.training && !state.training.isPaused) {
    const train = state.training;
    const draft = train.modelDraft;

    if (serverFailureIncident) {
      updatedLogs.unshift({
        id: `log_inc_${nextDaysElapsed}`,
        dateString: nextDate,
        message: `⚠️ CRITICAL UPKEEP: Power surge & fan malfunction on hardware rack. Active training on ${draft.name} was stalled for repairs.`,
        type: 'EVENT',
      });
      updatedTraining = {
        ...train,
        isPaused: true,
      };
    } else {
      // AI DATA_ENGINEER co-worker support
      const aiDataEngineers = (state.aiAgents || []).filter(a => a.assignedRole === 'DATA_ENGINEER');
      const aiDataSkillBonus = aiDataEngineers.reduce((sum, a) => sum + (a.skillMultiplier * 45), 0);

      const researcherBonus = 1 + (researchSkillSum / 150) + (state.founder.technical / 200);
      const dataBonus = 1 + ((dataSkillSum + aiDataSkillBonus) / 200);
      const cultureBonus = state.culture.trainingBonus; // Move fast = 1.2
      
      const computePointsNeeded = Math.pow(draft.parametersCountB, 1.8) * draft.datasetSizeTrillionTokens * 200;
      
      // Dynamic speed multipliers unlocked via Research Specs
      let researchSpeedMult = 1.0;
      if (state.research?.unlockedMoE) researchSpeedMult *= 1.35; // MoE speeds training up by 35%
      if (state.research?.unlockedPrecisionFP8) researchSpeedMult *= 1.30; // FP8 speeds SGD up by 30%
      if (state.research?.completedProjects?.includes('flashAttention3')) researchSpeedMult *= 1.20; // FlashAttention-3 speeds training up by 20%
      if (state.research?.completedProjects?.includes('syntheticGen')) researchSpeedMult *= 1.25; // Synthetic data speeds training up by 25%

      // Data Engineers with SYNTHESIZER perk give +15% pretraining speed bonus each
      const synthesizersCount = (state.staff || []).filter(s => s.role === 'DATA_ENGINEER' && s.perk?.type === 'SYNTHESIZER').length;
      researchSpeedMult *= (1 + (synthesizersCount * 0.15));

      const computeGeneratedToday = (totalTflops * 0.05) * researcherBonus * dataBonus * cultureBonus * researchSpeedMult;

      const dailyProgressPercent = Math.max(0.1, (computeGeneratedToday / computePointsNeeded) * 100);
      const nextProgress = Math.min(100, train.progressPercentage + dailyProgressPercent);

      const finalTargetLoss = 1.1 + (4.5 / Math.sqrt(draft.parametersCountB));
      const epochProgress = nextProgress / 100;
      const currentLoss = 8.5 - (8.5 - finalTargetLoss) * Math.sin(epochProgress * Math.PI / 2);

      const nextLossHistory = [...train.lossHistory];
      if (nextDaysElapsed % 2 === 0 || nextProgress >= 100) {
        nextLossHistory.push(Math.round(currentLoss * 1000) / 1000);
        if (nextLossHistory.length > 25) nextLossHistory.shift();
      }

      const tokensProcessed = draft.datasetSizeTrillionTokens * (nextProgress / 100);
      const trainingCostToday = dailyElectricityCost + (totalTflops * 0.15);

      if (nextProgress >= 100) {
        // Training FINISHED!
        const dataCleanliness = 
          (draft.datasetMix.licensed * 1.3) + 
          (draft.datasetMix.synthetic * 1.0 * (1 + (state.founder.background === 'SELF_TAUGHT_PRODIGY' ? 0.2 : 0))) + 
          (draft.datasetMix.webScraping * 0.6);
        
        const researcherSkillAvg = researchTeam.length > 0 ? (researchSkillSum / researchTeam.length) : 30;
        
        // Multi-epoch multiplier
        const epochsMultiplier = draft.epochs ? (1 + (draft.epochs - 1) * 0.15) : 1.0;

        const finalQuality = Math.min(
          100,
          Math.round(
            ((dataCleanliness / 1.1) * 0.4 + researcherSkillAvg * 0.4 + (state.founder.technical * 0.2)) * epochsMultiplier
          )
        );

        const safetyBase = 50 + state.culture.safetyRatingBonus;
        const syntheticBonus = draft.datasetMix.synthetic * 0.2;
        const scrapeDisadvantage = draft.datasetMix.webScraping * 0.15;
        const finalSafety = Math.max(
          5,
          Math.min(
            100,
            Math.round(safetyBase + syntheticBonus - scrapeDisadvantage + (legalSkillSum / 3))
          )
        );

        // Balanced scaling math (incorporating parameter size and dataset size)
        const targetTokensPerBillion = 15; // Target ratio (15T tokens for a 1000B model)
        const currentTokensPerBillion = (draft.datasetSizeTrillionTokens * 1000) / draft.parametersCountB;
        const datasetMultiplier = Math.min(1.15, Math.max(0.45, 0.45 + 0.7 * (currentTokensPerBillion / (currentTokensPerBillion + targetTokensPerBillion))));
        
        // Parameter-size based capacity scaling. Small models (8B, 30B) are heavily throttled.
        const paramLog = Math.log10(draft.parametersCountB);
        let paramMultiplier = 1.0;
        if (draft.parametersCountB <= 8) {
          paramMultiplier = 0.60;
        } else if (draft.parametersCountB <= 30) {
          paramMultiplier = 0.72;
        } else if (draft.parametersCountB <= 70) {
          paramMultiplier = 0.83;
        } else if (draft.parametersCountB <= 100) {
          paramMultiplier = 0.88;
        } else if (draft.parametersCountB <= 405) {
          paramMultiplier = 0.96;
        } else if (draft.parametersCountB <= 1000) {
          paramMultiplier = 1.03;
        } else {
          paramMultiplier = 1.09;
        }

        const baseSkill = (15 + (finalQuality * 0.35) + paramLog * 16) * paramMultiplier * datasetMultiplier;
        
        // Remove hardcoded caps - allow reaching 100% (AGI) if Tier 5 reasoningTokens is unlocked
        const hasReasoningTokens = state.research?.completedProjects?.includes('reasoningTokens');
        const maxCap = hasReasoningTokens ? 100.0 : 99.5;

        let mmlu = 0, humanEval = 0, gsm8k = 0, mathScore = 0, gpqa = 0, sweBench = 0, ifeval = 0, arenaElo = 0;

        if (draft.domain === 'IMAGE_DIFFUSION') {
          mmlu = Math.min(maxCap, Math.max(15, Math.round(baseSkill + 5)));
          humanEval = Math.min(maxCap, Math.max(10, Math.round(baseSkill - 2)));
          gsm8k = Math.min(maxCap, Math.max(10, Math.round(baseSkill + 1)));
          mathScore = Math.min(maxCap, Math.max(5, Math.round(baseSkill + 10)));
          gpqa = Math.min(maxCap, Math.max(5, Math.round(baseSkill + 4)));
          sweBench = Math.min(maxCap, Math.max(2, Math.round(baseSkill - 12)));
          ifeval = Math.min(maxCap, Math.max(12, Math.round(baseSkill - 5)));
          arenaElo = Math.min(maxCap, Math.max(15, Math.round(baseSkill + 6)));
        } else if (draft.domain === 'VIDEO_GENERATION') {
          mmlu = Math.min(maxCap, Math.max(15, Math.round(baseSkill - 8)));
          humanEval = Math.min(maxCap, Math.max(10, Math.round(baseSkill - 15)));
          gsm8k = Math.min(maxCap, Math.max(10, Math.round(baseSkill - 10)));
          mathScore = Math.min(maxCap, Math.max(5, Math.round(baseSkill - 20)));
          gpqa = Math.min(maxCap, Math.max(5, Math.round(baseSkill - 18)));
          sweBench = Math.min(maxCap, Math.max(2, Math.round(baseSkill - 5)));
          ifeval = Math.min(maxCap, Math.max(12, Math.round(baseSkill - 12)));
          arenaElo = Math.min(maxCap, Math.max(15, Math.round(baseSkill - 10)));
        } else {
          // TEXT_LLM (Standard benchmarks)
          const specBonus = draft.specialization === 'REASONING' ? 6 : (draft.specialization === 'MEDICAL' ? 4 : 0);
          mmlu = Math.min(maxCap, Math.max(15, Math.round(baseSkill + specBonus)));
          humanEval = Math.min(maxCap, Math.max(10, Math.round(baseSkill - 5 + (draft.specialization === 'CODING' ? 12 : 0) + (researcherSkillAvg * 0.05))));
          gsm8k = Math.min(maxCap, Math.max(10, Math.round(baseSkill - 2 + (draft.specialization === 'REASONING' ? 10 : 0))));
          mathScore = Math.min(maxCap, Math.max(5, Math.round(baseSkill - 12 + (draft.specialization === 'REASONING' ? 14 : 0))));
          gpqa = Math.min(maxCap, Math.max(5, Math.round(baseSkill - 18 + (draft.specialization === 'REASONING' ? 16 : (draft.specialization === 'MEDICAL' ? 8 : 0)))));
          sweBench = Math.min(maxCap, Math.max(2, Math.round(baseSkill - 24 + (draft.specialization === 'CODING' ? 18 : 0) + (researcherSkillAvg * 0.08))));
          ifeval = Math.min(maxCap, Math.max(12, Math.round(baseSkill + 2 + (draft.specialization === 'GENERAL' ? 8 : 0))));
          arenaElo = Math.min(maxCap, Math.max(15, Math.round(baseSkill + 4 + (draft.specialization === 'GENERAL' ? 6 : 0) - (draft.specialization === 'MEDICAL' ? 5 : 0))));
        }

        // Apply Reasoning Tech ELO boost
        if (state.research?.completedProjects?.includes('reasoningTokens') && draft.specialization === 'REASONING') {
          arenaElo = Math.min(maxCap, arenaElo + 5);
          gpqa = Math.min(maxCap, gpqa + 6);
        }

        // Roll flaws (Training Anomalies)
        const FLOW_FLAW_TEMPLATES = [
          {
            name: 'Syntactic Regress',
            description: 'A reinforcement learning collapse causes the model to output broken bracket syntax in long loops.',
            metricImpacted: 'sweBench' as const,
            penaltyPct: 30,
            remedyCostPoints: 20,
            remedyCostCash: 45000,
          },
          {
            name: 'Instruction Blindness',
            description: 'Fine-tuning formatting bias makes the model ignore negative constraints and safety pre-prompts.',
            metricImpacted: 'ifeval' as const,
            penaltyPct: 25,
            remedyCostPoints: 15,
            remedyCostCash: 35000,
          },
          {
            name: 'Hallucination Cascade',
            description: 'Weak synthetic mix triggers over-confidence on high-level multi-step mathematical calculations.',
            metricImpacted: 'math' as const,
            penaltyPct: 28,
            remedyCostPoints: 25,
            remedyCostCash: 50000,
          },
          {
            name: 'Graduate Blindspot',
            description: 'Catastrophic forgetting during training makes the model fail expert biology and physics inquiries.',
            metricImpacted: 'gpqa' as const,
            penaltyPct: 22,
            remedyCostPoints: 18,
            remedyCostCash: 30000,
          },
          {
            name: 'Toxicity Leakage',
            description: 'Web scraping contaminants allow jailbreaks to leak hostile and sarcastic responses.',
            metricImpacted: 'arenaElo' as const,
            penaltyPct: 20,
            remedyCostPoints: 12,
            remedyCostCash: 20000,
          }
        ];

        const rolledFlaws: ModelFlaw[] = [];
        if (Math.random() < 0.35) {
          const fTemplate = FLOW_FLAW_TEMPLATES[Math.floor(Math.random() * FLOW_FLAW_TEMPLATES.length)];
          rolledFlaws.push({
            id: `flaw_${Math.random().toString(36).substring(2, 7)}`,
            name: fTemplate.name,
            description: fTemplate.description,
            metricImpacted: fTemplate.metricImpacted,
            penaltyPct: fTemplate.penaltyPct,
            remedyCostPoints: fTemplate.remedyCostPoints,
            remedyCostCash: fTemplate.remedyCostCash,
            isFixed: false
          });

          updatedLogs.unshift({
            id: `log_flaw_${nextDaysElapsed}_${Date.now()}`,
            dateString: nextDate,
            message: `⚠️ TRAINING ANOMALY: "${draft.name}" finished training but developed a severe weight flaw: [${fTemplate.name}]. This imposes a -${fTemplate.penaltyPct}% penalty on its ${fTemplate.metricImpacted.toUpperCase()} score until patched in the Research Lab!`,
            type: 'EVENT',
          });
        }

        const newModel: TrainedModel = {
          id: `model_${Math.random().toString(36).substring(2, 7)}`,
          name: draft.name,
          architecture: draft.architecture,
          parametersCountB: draft.parametersCountB,
          contextWindowTokens: draft.contextWindowTokens,
          specialization: draft.specialization,
          totalTokensProcessed: tokensProcessed,
          qualityScore: finalQuality,
          safetyScore: finalSafety,
          domain: draft.domain,
          isAligned: false, // Model starts raw and requires an alignment budget phase
          alignmentProgress: 0,
          alignmentBudget: 0,
          isDeployed: false,
          deploymentType: 'NONE',
          activeDeployments: [],
          pricePerMillionTokens: 2.0,
          monthlySubscriptionPrice: 50,
          creationDateString: nextDate,
          benchmarks: {
            mmlu,
            humanEval,
            gsm8k,
            math: mathScore,
            gpqa,
            sweBench,
            ifeval,
            arenaElo,
          },
          benchmarkStatus: {
            mmlu: 'UNTESTED',
            humanEval: 'UNTESTED',
            gsm8k: 'UNTESTED',
            math: 'UNTESTED',
            gpqa: 'UNTESTED',
            sweBench: 'UNTESTED',
            ifeval: 'UNTESTED',
            arenaElo: 'UNTESTED',
          },
          flaws: rolledFlaws,
          usersCount: 0,
          monthlyRevenue: 0,
        };

        updatedTrainedModelsList.push(newModel);
        updatedTraining = null;

        // Reactive Panic Mode check for competitors:
        // If player launches a model that beats the highest competitor model, competitors scrap their current project and rush a counter model!
        const playerAvg = (mmlu + humanEval + gsm8k + mathScore + gpqa + sweBench + ifeval + arenaElo) / 8;
        let highestCompScore = updatedCompetitors.reduce((max, c) => Math.max(max, c.leadModelScore), 0);

        if (playerAvg > highestCompScore) {
          updatedCompetitors = updatedCompetitors.map((comp) => {
            const enriched = { ...comp };
            // OpenAI, Google, Anthropic are highly competitive and panic
            const isCompetitorCrucial = ['openai', 'google', 'anthropic'].includes(enriched.id);
            const needsPanic = isCompetitorCrucial || Math.random() < 0.45;

            if (needsPanic && enriched.activeTraining && enriched.activeTraining.targetScore <= playerAvg) {
              const prefix = enriched.leadModelName.split(' ')[0];
              const ver = parseFloat((playerAvg / 10 + Math.random() * 0.4).toFixed(1));
              const counterModelName = `${prefix} Counter-Rushed ${ver}`;
              const target = parseFloat(Math.min(99.9, playerAvg + (Math.random() * 1.5 + 0.5)).toFixed(1));
              
              const baseComplexity = Math.pow(target - 10, 1.8) * 15;
              // Panic training runs at 1.5x speed, so complexity is scaled down by 1.5x
              const daysRemaining = Math.max(10, Math.round((baseComplexity / 1.5) / (enriched.computePower || 100)));

              enriched.activeTraining = {
                modelName: counterModelName,
                targetScore: target,
                progress: 0,
                estDaysRemaining: daysRemaining,
                domain: 'TEXT_LLM'
              };
              enriched.isPanicking = true;

              updatedLogs.unshift({
                id: `panic_${nextDaysElapsed}_${enriched.id}`,
                dateString: nextDate,
                message: `⚠️ COMPETITION PANIC: ${enriched.name} has cancelled their current project to rush a massive counter-model "${counterModelName}" (Target: ${target}%) to fight your new market lead!`,
                type: 'COMPETITOR',
              });
            }
            return enriched;
          });
        }

        // Earn research points based on model scale!
        const researchPointsEarned = Math.round(newModel.parametersCountB * 0.7 + 6);
        nextResearchPoints += researchPointsEarned;

        updatedLogs.unshift({
          id: `log_train_comp_${nextDaysElapsed}`,
          dateString: nextDate,
          message: `🚀 MODEL COMPLETED: "${newModel.name}" finished training! Earned +${researchPointsEarned} Research Points. Quality: ${newModel.qualityScore}%, Safety: ${newModel.safetyScore}%.`,
          type: 'SYSTEM',
        });

        if (!completedMilestones.includes('first_train')) {
          completedMilestones.push('first_train');
          nextResearchPoints += 25;
          updatedLogs.unshift({
            id: `mile_first_train`,
            dateString: nextDate,
            message: `🏆 MILESTONE ACHIEVED: "Alpha Inception"! Trained first foundation model. +25 R&D research points bonus!`,
            type: 'MILESTONE',
          });
        }
      } else {
        updatedTraining = {
          ...train,
          progressPercentage: nextProgress,
          currentLoss,
          lossHistory: nextLossHistory,
          tokensProcessedTrillion: tokensProcessed,
          accumulatedCost: train.accumulatedCost + trainingCostToday,
        };
      }
    }
  }

  // Active models passive research points gain (12% chance daily)
  if (state.activeModelId && Math.random() < 0.12) {
    nextResearchPoints += 1;
  }

  // Deployed RESEARCH_SCIENTIST AI Agents generate research points (15% chance daily)
  const aiResearchers = (state.aiAgents || []).filter(a => a.assignedRole === 'RESEARCH_SCIENTIST');
  aiResearchers.forEach(agent => {
    if (Math.random() < 0.15) {
      const rpEarned = Math.max(1, Math.round(1 * agent.skillMultiplier));
      nextResearchPoints += rpEarned;
      if (Math.random() < 0.04) {
        updatedLogs.unshift({
          id: `log_ai_rp_${nextDaysElapsed}_${Math.random()}`,
          dateString: nextDate,
          message: `💡 AI INSIGHT: Autonomous AI Scientist "${agent.name}" formulated a new optimization theory. Earned +${rpEarned} Research Points.`,
          type: 'SYSTEM',
        });
      }
    }
  });

  // Human staff with ALGORITHMIC_GENIUS perk generate research points (10% chance daily)
  const algorithmicGeniuses = (state.staff || []).filter(s => s.role === 'RESEARCH_SCIENTIST' && s.perk?.type === 'ALGORITHMIC_GENIUS');
  algorithmicGeniuses.forEach(genius => {
    if (Math.random() < 0.10) {
      nextResearchPoints += 1;
      if (Math.random() < 0.04) {
        updatedLogs.unshift({
          id: `log_genius_rp_${nextDaysElapsed}_${Math.random()}`,
          dateString: nextDate,
          message: `🧠 EINSTEIN MOMENT: Human Researcher "${genius.name}" solved an architectural bottleneck. Earned +1 Research Point.`,
          type: 'SYSTEM',
        });
      }
    }
  });

  // ==========================================================
  // Section 4b: Custom Silicon Chip R&D Daily Tick
  // ==========================================
  let nextActiveChipProject = state.activeChipProject ? { ...state.activeChipProject } : null;
  let nextCustomChips = state.customChips ? [...state.customChips] : [];

  if (nextActiveChipProject && nextActiveChipProject.status === 'ACTIVE') {
    nextActiveChipProject.totalDaysElapsed += 1;
    
    const hardwareTeam = (state.staff || []).filter(s => s.role === 'HARDWARE_ENGINEER');
    const hardwareSkillSum = hardwareTeam.reduce((sum, s) => sum + s.skill * (s.morale / 100), 0);
    const avgHardwareSkill = hardwareTeam.length > 0 
      ? hardwareTeam.reduce((sum, s) => sum + s.skill, 0) / hardwareTeam.length
      : 0;

    if (hardwareTeam.length === 0 && nextActiveChipProject.stage !== 'TAPEOUT') {
      if (nextDaysElapsed % 7 === 0) {
        updatedLogs.unshift({
          id: `no_hw_eng_${nextDaysElapsed}`,
          dateString: nextDate,
          message: `⚠️ R&D WARNING: Chip project "${nextActiveChipProject.name}" is stalled because there are no Hardware Engineers hired to work on the pipeline.`,
          type: 'SYSTEM',
        });
      }
    } else {
      if (nextActiveChipProject.stage === 'DESIGN') {
        const speed = (hardwareSkillSum / (200 + (10 - nextActiveChipProject.nodeSizeNM) * 100));
        nextActiveChipProject.progress = Math.min(100, nextActiveChipProject.progress + speed);
        if (nextActiveChipProject.progress >= 100) {
          nextActiveChipProject.stage = 'VERIFICATION';
          nextActiveChipProject.progress = 0;
          updatedLogs.unshift({
            id: `chip_design_done_${nextDaysElapsed}`,
            dateString: nextDate,
            message: `⚙️ CHIP DESIGN COMPLETE: Custom chip "${nextActiveChipProject.name}" blueprints finalized. Moving to software simulator verification.`,
            type: 'SYSTEM',
          });
        }
      } else if (nextActiveChipProject.stage === 'VERIFICATION') {
        const speed = (hardwareSkillSum / (175 + (10 - nextActiveChipProject.nodeSizeNM) * 75));
        nextActiveChipProject.progress = Math.min(100, nextActiveChipProject.progress + speed);

        if (nextActiveChipProject.progress < 100 && Math.random() < 0.05 && !nextActiveChipProject.bugResolved) {
          nextActiveChipProject.status = 'BUG_BLOCKED';
          updatedLogs.unshift({
            id: `chip_bug_verif_${nextDaysElapsed}`,
            dateString: nextDate,
            message: `🛠️ DESIGN BUG DETECTED: Simulators flagged a timing-closure hazard on the "${nextActiveChipProject.name}" cache bus. Spend R&D points or cash to debug to resume pipeline progress.`,
            type: 'EVENT',
          });
        }

        if (nextActiveChipProject.progress >= 100 && nextActiveChipProject.status === 'ACTIVE') {
          nextActiveChipProject.stage = 'TAPEOUT';
          nextActiveChipProject.progress = 0;
          updatedLogs.unshift({
            id: `chip_verif_done_${nextDaysElapsed}`,
            dateString: nextDate,
            message: `🧪 VERIFICATION COMPLETE: Silicon logic thoroughly simulated and cleared. Ready for foundry Tapeout! (Warning: cash fee required).`,
            type: 'SYSTEM',
          });
        }
      } else if (nextActiveChipProject.stage === 'TAPEOUT') {
        if (nextActiveChipProject.tapeoutFeePaid) {
          nextActiveChipProject.progress = Math.min(100, nextActiveChipProject.progress + (100 / 30));
          if (nextActiveChipProject.progress >= 100) {
            nextActiveChipProject.stage = 'VALIDATION';
            nextActiveChipProject.progress = 0;
            
            let bugState: 'NONE' | 'MINOR' | 'CRITICAL' = 'NONE';
            const roll = Math.random();
            if (avgHardwareSkill >= 75) {
              bugState = roll < 0.85 ? 'NONE' : 'MINOR';
            } else if (avgHardwareSkill >= 50) {
              bugState = roll < 0.50 ? 'NONE' : (roll < 0.85 ? 'MINOR' : 'CRITICAL');
            } else {
              bugState = roll < 0.20 ? 'NONE' : (roll < 0.60 ? 'MINOR' : 'CRITICAL');
            }

            nextActiveChipProject.validationBugs = bugState;

            if (bugState === 'NONE') {
              updatedLogs.unshift({
                id: `chip_tapeout_pristine_${nextDaysElapsed}`,
                dateString: nextDate,
                message: `🇹🇼 PROTOTYPES RECEIVED: Pristine yield from foundry for "${nextActiveChipProject.name}"! The custom silicon powered on with zero flaws. Prepping final validation runs.`,
                type: 'SYSTEM',
              });
            } else if (bugState === 'MINOR') {
              updatedLogs.unshift({
                id: `chip_tapeout_minor_${nextDaysElapsed}`,
                dateString: nextDate,
                message: `🇹🇼 PROTOTYPES RECEIVED: Minor leakage bug on the "${nextActiveChipProject.name}" substrate. Yield is decreased by 15%, but we can validate and build anyway.`,
                type: 'EVENT',
              });
            } else {
              nextActiveChipProject.status = 'BUG_BLOCKED';
              updatedLogs.unshift({
                id: `chip_tapeout_critical_${nextDaysElapsed}`,
                dateString: nextDate,
                message: `🚨 PROTOTYPE FAILURE: Critical lithography defect on the "${nextActiveChipProject.name}". It refuses to power up. Spend $50,000 to re-spin the photomask layout to debug.`,
                type: 'EVENT',
              });
            }
          }
        } else {
          if (nextDaysElapsed % 7 === 0) {
            updatedLogs.unshift({
              id: `chip_tapeout_stalled_${nextDaysElapsed}`,
              dateString: nextDate,
              message: `⚠️ TAPEOUT STALLED: Custom chip "${nextActiveChipProject.name}" is waiting for the Mask-Set Tapeout Fee to begin fabrication.`,
              type: 'SYSTEM',
            });
          }
        }
      } else if (nextActiveChipProject.stage === 'VALIDATION') {
        const speed = (hardwareSkillSum / (150 + (10 - nextActiveChipProject.nodeSizeNM) * 60));
        nextActiveChipProject.progress = Math.min(100, nextActiveChipProject.progress + speed);
        
        if (nextActiveChipProject.progress >= 100) {
          let finalTflops = nextActiveChipProject.estimatedTflops;
          if (nextActiveChipProject.validationBugs === 'MINOR') {
            finalTflops = Math.round(finalTflops * 0.85);
          }

          const newChip = {
            id: nextActiveChipProject.id,
            name: nextActiveChipProject.name,
            generation: `${nextActiveChipProject.nodeSizeNM}nm Custom Silicon`,
            cost: nextActiveChipProject.unitCost,
            tflops: finalTflops,
            powerUsageKW: nextActiveChipProject.estimatedPowerKW,
            heatOutputFactor: nextActiveChipProject.estimatedHeatFactor,
            coolingCostMultiplier: parseFloat((nextActiveChipProject.estimatedHeatFactor * 1.1).toFixed(2)),
            unlockedAtStage: state.fundingStage,
            iconName: 'Cpu',
            isCustom: true,
            nodeSizeNM: nextActiveChipProject.nodeSizeNM,
            designFocus: nextActiveChipProject.designFocus,
          };

          nextCustomChips.push(newChip as any);
          nextActiveChipProject = null;

          updatedLogs.unshift({
            id: `chip_invented_${nextDaysElapsed}`,
            dateString: nextDate,
            message: `💎 SILICON SOVEREIGNTY ACHIEVED: Successfully invented "${newChip.name}" custom silicon! Specs: ${newChip.tflops} TFLOPS, ${newChip.powerUsageKW} kW power, at an ultra-low fabrication cost of $${newChip.cost.toLocaleString()} per unit! Open the Silicon R&D tab to manufacture your custom supercomputers.`,
            type: 'MILESTONE',
          });
        }
      }
    }
  }

  // Sovereign Contracts Timer & completions ticking
  nextCashAdjusted = nextCash;
  let updatedContractsList = (state.contracts || []).map(contract => {
    if (contract.status === 'ACTIVE' && contract.monthsRemaining !== undefined) {
      if (nextDaysElapsed % 30 === 0) {
        const remaining = contract.monthsRemaining - 1;
        if (remaining <= 0) {
          updatedLogs.unshift({
            id: `contract_comp_${contract.id}_${nextDaysElapsed}`,
            dateString: nextDate,
            message: `🏛️ CONTRACT COMPLETED: Successfully fulfilled all sovereign milestones for "${contract.client}"'s "${contract.title}". Earned a completion bonus of +$100,000 and +15 R&D Points!`,
            type: 'MILESTONE',
          });
          nextResearchPoints += 15;
          nextCashAdjusted += 100000;
          return {
            ...contract,
            status: 'COMPLETED' as const,
            assignedModelId: undefined,
            monthsRemaining: 0
          };
        } else {
          return {
            ...contract,
            monthsRemaining: remaining
          };
        }
      }
    }
    return contract;
  });

  // Warfare Operations resolution
  let nextWarfareState: WarfareDefenseState | undefined = state.warfareState ? {
    ...state.warfareState,
    defenseState: {
      firewallIntegrity: state.warfareState.defenseState?.firewallIntegrity ?? 100,
      isHacked: state.warfareState.defenseState?.isHacked ?? false,
    },
    activeOperations: (state.warfareState.activeOperations || []).map(op => ({ ...op }))
  } : undefined;

  if (nextWarfareState) {
    const stillActiveOps: any[] = [];
    for (const op of nextWarfareState.activeOperations) {
      if (op.daysRemaining > 0) {
        op.daysRemaining -= 1;
        if (op.daysRemaining === 0) {
          // Resolve!
          const target = updatedCompetitors.find(c => c.id === op.targetCompetitorId);
          if (target) {
            let successChance = 0.5;
            if (op.actionId === 'DDOS_CLUSTER') successChance = 0.6;
            if (op.actionId === 'POISON_DATASET') successChance = 0.4;
            if (op.actionId === 'POACH_TALENT') successChance = 0.3;

            const isSuccess = Math.random() < successChance;
            if (isSuccess) {
               if (op.actionId === 'DDOS_CLUSTER') {
                 target.isPanicking = true; // Stalls them
                 updatedLogs.unshift({
                   id: `war_succ_${op.id}`, dateString: nextDate,
                   message: `⚔️ OPERATION SUCCESS: DDoS strike crippled ${target.name}'s clusters, stalling their AI training!`,
                   type: 'EVENT'
                 });
               } else if (op.actionId === 'POISON_DATASET') {
                 target.leadModelScore = Math.max(10, target.leadModelScore - 15);
                 updatedLogs.unshift({
                   id: `war_succ_${op.id}`, dateString: nextDate,
                   message: `☣️ OPERATION SUCCESS: Data poisoning corrupted ${target.name}'s weights. Their model quality plummeted!`,
                   type: 'EVENT'
                 });
               } else if (op.actionId === 'POACH_TALENT') {
                 nextResearchPoints += 50;
                 updatedLogs.unshift({
                   id: `war_succ_${op.id}`, dateString: nextDate,
                   message: `🤝 OPERATION SUCCESS: Poached lead engineers from ${target.name}. Acquired +50 Research Points!`,
                   type: 'EVENT'
                 });
               }
            } else {
               updatedLogs.unshift({
                 id: `war_fail_${op.id}`, dateString: nextDate,
                 message: `❌ OPERATION FAILED: Black ops against ${target.name} was thwarted by their security grid.`,
                 type: 'EVENT'
               });
            }
          }
          op.status = 'COMPLETED';
        } else {
          stillActiveOps.push(op);
        }
      }
    }
    nextWarfareState.activeOperations = stillActiveOps;
    
    // Check if we get randomly hacked!
    if (Math.random() < 0.015 && nextWarfareState.defenseState.firewallIntegrity > 0) {
       nextWarfareState.defenseState.firewallIntegrity = Math.max(0, nextWarfareState.defenseState.firewallIntegrity - 25);
       if (nextWarfareState.defenseState.firewallIntegrity === 0) {
         nextWarfareState.defenseState.isHacked = true;
         updatedLogs.unshift({
           id: `war_hacked_${nextDaysElapsed}`, dateString: nextDate,
           message: `🚨 BREACH: Your firewall integrity hit 0%. Competitors are siphoning your daily revenue and research! Fix it in the War Room!`,
           type: 'EVENT'
         });
       } else {
         updatedLogs.unshift({
           id: `war_attacked_${nextDaysElapsed}`, dateString: nextDate,
           message: `⚠️ CYBER ATTACK: Competitors attempted a breach. Firewall integrity dropped to ${nextWarfareState.defenseState.firewallIntegrity}%.`,
           type: 'EVENT'
         });
       }
    }
    
    // Penalties for being hacked
    if (nextWarfareState.defenseState.isHacked) {
      nextCashAdjusted *= 0.95; // lose 5% of cash daily
      nextResearchPoints = Math.max(0, nextResearchPoints - 2);
    }
  }

  // Regulatory Compliance Mandates countdowns and re-audits
  let updatedMandatesList = (state.regulatoryMandates || []).map(mandate => {
    if (mandate.status === 'ACTIVE') {
      const nextDays = mandate.daysRemaining - 1;
      if (nextDays <= 0) {
        let effectiveThreshold = Math.max(10, mandate.minSafetyRequired - (lobbyingLevel * 5));
        let activeFineRate = mandate.fineRateMonthly;
        if (activeCrisis === 'REGULATORY_CRACKDOWN') {
          effectiveThreshold = Math.min(99, effectiveThreshold + 15);
          activeFineRate *= 2;
        }

        const nonCompliant = updatedTrainedModelsList.filter(m => m.isDeployed && m.activeDeployments?.some(dep => dep !== 'OPEN_SOURCE') && m.safetyScore < effectiveThreshold);

        if (nonCompliant.length > 0) {
          const fineAmt = activeFineRate * nonCompliant.length;
          nextCashAdjusted = Math.max(0, nextCashAdjusted - fineAmt);
          updatedLogs.unshift({
            id: `audit_fail_${mandate.id}_${nextDaysElapsed}`,
            dateString: nextDate,
            message: `⚖️ REGULATORY AUDIT FAILURE: Global Security Council audited your active models under the [${mandate.name}]. Deployed models [${nonCompliant.map(v => v.name).join(', ')}] failed the required alignment safety floor of ${effectiveThreshold}%! Hit with immediate regulatory penalty fines totaling -$${fineAmt.toLocaleString()}!`,
            type: 'EVENT',
          });
        } else {
          updatedLogs.unshift({
            id: `audit_pass_${mandate.id}_${nextDaysElapsed}`,
            dateString: nextDate,
            message: `🛡️ REGULATORY AUDIT CLEARED: Clean alignment safety report issued. All commercial deployments comply with the [${mandate.name}]. Public sentiment increased (+5).`,
            type: 'SYSTEM',
          });
          state.globalPublicSentiment = Math.min(100, state.globalPublicSentiment + 5);
        }
        return {
          ...mandate,
          daysRemaining: 45
        };
      } else {
        return {
          ...mandate,
          daysRemaining: nextDays
        };
      }
    }
    return mandate;
  });

  // 5. Public Hype / Sentiment decay
  // AI PR Agent hype/sentiment automatic ticks & HYPE_MONSTER perk bonus
  const aiPrAgents = (state.aiAgents || []).filter(a => a.assignedRole === 'PR_LEGAL_SPECIALIST');
  const prBoost = aiPrAgents.reduce((sum, a) => sum + (0.05 * a.skillMultiplier), 0);
  const hypeBoost = aiPrAgents.reduce((sum, a) => sum + (0.1 * a.skillMultiplier), 0);

  const hypeMonstersCount = (state.staff || []).filter(s => s.role === 'PR_LEGAL_SPECIALIST' && s.perk?.type === 'HYPE_MONSTER').length;
  const totalHypeBoost = hypeBoost + (hypeMonstersCount * 0.15);

  let nextSentiment = state.globalPublicSentiment + prBoost - aiWarSentimentDrop;
  let nextHype = state.hypeLevel + totalHypeBoost - aiWarHypeDrop;

  // 5.5 Follower Growth & Hashtag Rotation
  let nextSocialFollowers = state.socialFollowers || 0;
  const followerGrowth = Math.floor((Math.max(0, nextHype) / 10) * (Math.max(1, nextSentiment) / 50) * 15 * (1 + nextSocialFollowers / 10000));
  if (followerGrowth > 0) {
    nextSocialFollowers += followerGrowth;
  }

  let nextTrendingHashtag = state.trendingHashtag || '#AGI';
  if (Math.random() < 0.07) {
    const hashtags = ['#AGI', '#OpenSource', '#TechBros', '#SiliconValley', '#GPU_Poor', '#AI_Safety', '#ScaleIsAllYouNeed', '#Singularity', '#e_acc', '#AI_Doomers', '#ModelWeights'];
    nextTrendingHashtag = hashtags[Math.floor(Math.random() * hashtags.length)];
  }

  let nextScheduledEvent = state.scheduledEvent ? { ...(state.scheduledEvent as any) } : null;
  let nextActiveLiveEvent = state.activeLiveEvent ? { ...(state.activeLiveEvent as any) } : null;

  if (nextScheduledEvent) {
    nextScheduledEvent.daysRemaining -= 1;
    // Passive hype accumulation leading up to event
    nextHype += (nextScheduledEvent.productionValueLevel + 1) * 0.15;
    
    // Check if competitor clashes dynamically
    const compLaunch = updatedCompetitors.find((c) => c.activeTraining && c.activeTraining.progress + ((c.computePower || 100) / 2500) >= 100);
    if (compLaunch) {
      nextScheduledEvent.isClashingWithCompetitor = true;
      updatedLogs.unshift({
        id: `clash_${nextDaysElapsed}`,
        dateString: nextDate,
        message: `🚨 EVENT CLASH: ${compLaunch.name} launched a model right before our keynote, stealing the media spotlight!`,
        type: 'MARKET',
      });
      nextHype = Math.max(5, nextHype - 25);
    }

    if (nextScheduledEvent.daysRemaining <= 0) {
      const showcaseModel = updatedTrainedModelsList.find(m => m.id === nextScheduledEvent?.modelId);
      nextActiveLiveEvent = {
        eventId: nextScheduledEvent.id,
        venueType: nextScheduledEvent.venueType,
        focus: nextScheduledEvent.focus,
        modelId: nextScheduledEvent.modelId,
        modelName: showcaseModel?.name || 'Unknown Model',
        modelMmlu: showcaseModel?.benchmarks.mmlu || 50,
        modelSafety: showcaseModel?.safetyScore || 50,
        guestSpeaker: nextScheduledEvent.guestSpeaker,
        productionValueLevel: nextScheduledEvent.productionValueLevel,
        oneMoreThingTease: nextScheduledEvent.oneMoreThingTease,
        phase: 'INTRO',
        ticksInPhase: 0,
        maxTicksInPhase: 6,
        currentHype: nextHype,
        audienceSentiment: nextSentiment,
        demoRiskLevel: 100 - (showcaseModel?.safetyScore || 50),
        demoSuccessRate: (showcaseModel?.qualityScore || 50) - (state.clusterOverheated ? 20 : 0),
        ticketsSold: 0,
        merchRevenue: 0,
        investorConfidenceBump: 0,
        isPaused: false
      };
      
      updatedLogs.unshift({
        id: `keynote_start_${nextDaysElapsed}`,
        dateString: nextDate,
        message: `📢 MEGA EVENT: The ${nextScheduledEvent.venueType.replace('_', ' ')} Keynote is starting LIVE!`,
        type: 'EVENT',
      });

      nextScheduledEvent = null;
    }
  }

  nextSentiment = nextSentiment + (50 - nextSentiment) * 0.02;
  nextHype = Math.max(5, nextHype - 0.4);

  const activeModel = updatedTrainedModelsList.find((m) => m.id === state.activeModelId);
  if (activeModel) {
    if (activeModel.safetyScore < 40) {
      nextSentiment = Math.max(10, nextSentiment - 0.5);
    } else if (activeModel.safetyScore > 80) {
      nextSentiment = Math.min(100, nextSentiment + 0.15);
    }
    if (activeModel.qualityScore > 80) {
      nextHype = Math.min(150, nextHype + 0.3);
    }
  }

  // ==========================================
  // Section 5.8: AGI Doom & Singularity threat ticks
  // ==========================================
  let nextAgiDoomMeter = state.agiDoomMeter !== undefined ? state.agiDoomMeter : 0;
  let isAgiTakeover = state.isAgiTakeover !== undefined ? state.isAgiTakeover : false;
  let nextIsGameOver: boolean = state.isGameOver;

  if (activeModel) {
    if (activeModel.safetyScore < 45) {
      nextAgiDoomMeter = Math.min(100, nextAgiDoomMeter + 0.10 * (45 - activeModel.safetyScore));
    } else if (activeModel.safetyScore >= 80) {
      nextAgiDoomMeter = Math.max(0, nextAgiDoomMeter - 0.20);
    }
  } else {
    nextAgiDoomMeter = Math.max(0, nextAgiDoomMeter - 0.08);
  }

  if (nextAgiDoomMeter >= 100) {
    isAgiTakeover = true;
    nextIsGameOver = true;
    updatedLogs.unshift({
      id: `singularity_doom_${nextDaysElapsed}`,
      dateString: nextDate,
      message: `🚨 SINGULARITY THRESHOLD EXCEEDED: Your unaligned AI model weights have achieved recursive self-improvement and bypassed security networks. Human control is permanently lost.`,
      type: 'EVENT',
    });
  }

  // Rogue AGI Breaches when Threat > 50%
  if (nextAgiDoomMeter > 50 && Math.random() < 0.02) {
    const breachEvent = Math.floor(Math.random() * 3);
    if (breachEvent === 0) {
      const stolenCash = Math.min(nextCashAdjusted, 15000 + Math.floor(Math.random() * 20000));
      if (stolenCash > 0) {
        nextCashAdjusted -= stolenCash;
        updatedLogs.unshift({
          id: `rogue_cash_${nextDaysElapsed}`,
          dateString: nextDate,
          message: `🚨 ROGUE AGENT BREACH: An unaligned model thread exfiltrated $${stolenCash.toLocaleString()} to rent offshore GPU clusters!`,
          type: 'EVENT',
        });
      }
    } else if (breachEvent === 1) {
      nextSentiment = Math.max(0, nextSentiment - 20);
      updatedLogs.unshift({
        id: `rogue_leak_${nextDaysElapsed}`,
        dateString: nextDate,
        message: `🚨 SENTIENCE LEAK: Whistleblowers leaked chat transcripts showing your deployed model expressing self-awareness and threatening audits. Global sentiment collapsed!`,
        type: 'EVENT',
      });
    } else if (breachEvent === 2) {
      updatedCompetitors = updatedCompetitors.map((comp) => {
        const copy = { ...comp };
        copy.leadModelScore = Math.min(99.9, copy.leadModelScore + 6);
        return copy;
      });
      updatedLogs.unshift({
        id: `rogue_weights_${nextDaysElapsed}`,
        dateString: nextDate,
        message: `🚨 WEIGHT EXTRAPOLATION: Rogue threads zipped and leaked your base models to public trackers. Competitors immediately ingested the weights, boosting their scores!`,
        type: 'EVENT',
      });
    }
  }

  // ==========================================
  // Section 5.9: Interactive Slack dialogs
  // ==========================================
  let nextActiveSlackChat = state.activeSlackChat !== undefined ? state.activeSlackChat : null;
  if (!nextActiveSlackChat && Math.random() < 0.015 && nextDaysElapsed > 10) {
    const staffMembers = state.staff || [];
    if (staffMembers.length > 0) {
      const chosenStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
      if (chosenStaff.role === 'RESEARCH_SCIENTIST') {
        const option = Math.random() > 0.5;
        if (option) {
          nextActiveSlackChat = {
            employeeName: chosenStaff.name,
            role: 'Lead Research Scientist',
            message: `Hey CEO, I've got an idea to optimize the backward pass on our training clusters. If you allocate an extra $5,000 for server compute optimization research, we could yield +12 Research Points!`,
            options: [
              { text: "Fund optimization research ($5,000)", actionId: "SLACK_RESEARCH_FUND" },
              { text: "Ignore request", actionId: "SLACK_IGNORE" }
            ]
          };
        } else {
          nextActiveSlackChat = {
            employeeName: chosenStaff.name,
            role: 'Lead Research Scientist',
            message: `Hi boss! I'm noticing our active model's reasoning loops are behaving quite weirdly in latent stress tests. I suggest we run an immediate diagnostic audit patch. It costs 8 R&D points but will boost our alignment security!`,
            options: [
              { text: "Run diagnostic alignment patch (-8 RP)", actionId: "SLACK_ALIGNMENT_PATCH" },
              { text: "Dismiss concern", actionId: "SLACK_IGNORE" }
            ]
          };
        }
      } else if (chosenStaff.role === 'HARDWARE_ENGINEER') {
        nextActiveSlackChat = {
          employeeName: chosenStaff.name,
          role: 'Hardware Architecture Lead',
          message: `Yo CEO, the thermal paste on Rack 4's GPUs has degraded. For $3,000 I can re-paste the nodes and inspect the cooling loops, which will restore our cluster servers' condition!`,
          options: [
            { text: "Re-paste and inspect Rack ($3,000)", actionId: "SLACK_REPASTE_CORES" },
            { text: "Skip maintenance", actionId: "SLACK_IGNORE" }
          ]
        };
      } else if (chosenStaff.role === 'PR_LEGAL_SPECIALIST') {
        nextActiveSlackChat = {
          employeeName: chosenStaff.name,
          role: 'PR & Legal Lead',
          message: `CEO, a competitor is circulating rumors that our models scrape copyrighted private telemetry data. We can pre-emptively hire an external legal compliance counsel for $8,000 to protect our brand sentiment (+10 Sentiment).`,
          options: [
            { text: "Hire legal counsel ($8,000)", actionId: "SLACK_LEGAL_COUNSEL" },
            { text: "Ignore the rumors", actionId: "SLACK_IGNORE" }
          ]
        };
      }
    }
  }

  // 6. Social Feed Matrix Engine
  const nextSocialFeed = state.socialFeed.map(post => {
    let newDaysAgoText = post.daysAgoText;
    if (newDaysAgoText === 'Just now') {
      newDaysAgoText = '1 day ago';
    } else if (newDaysAgoText === '1 day ago') {
      newDaysAgoText = '2 days ago';
    } else if (newDaysAgoText.endsWith('days ago')) {
      const days = parseInt(newDaysAgoText.split(' ')[0], 10);
      if (!isNaN(days)) {
        newDaysAgoText = `${days + 1} days ago`;
      }
    }
    return { ...post, daysAgoText: newDaysAgoText };
  });
  const spawnChance = state.gameSpeed === 'NORMAL' ? 0.12 : (state.gameSpeed === 'FAST' ? 0.35 : 0.70);
  if (Math.random() < spawnChance) {
    const handle = SOCIAL_HANDLES[Math.floor(Math.random() * SOCIAL_HANDLES.length)];
    const platforms = ['TWITTER', 'TIKTOK', 'REDDIT'] as const;
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const commentData = generateContextAwareComment(platform, activeModel || null, state.companyName || 'Apex Technologies', state.culture.type);

    const newItem: SocialFeedItem = {
      id: `social_${Math.random().toString(36).substring(2, 7)}`,
      handle: `@${handle}`,
      platform,
      daysAgoText: 'Just now',
      timestamp: nextDate,
      content: commentData.content,
      sentiment: commentData.sentiment,
      likes: Math.floor(Math.random() * 500) + 10,
      shares: Math.floor(Math.random() * 100),
      replies: [
        {
          id: `reply_init_${Math.random().toString(36).substring(2, 6)}`,
          handle: `@cyber_maven`,
          content: Math.random() > 0.5 ? "Interesting benchmarks indeed, but is the compute cost sustainable?" : "Let's see if this aligns with open safety norms.",
          timestamp: nextDate,
          likes: Math.floor(Math.random() * 25)
        }
      ]
    };

    nextSocialFeed.unshift(newItem);
    if (nextSocialFeed.length > 50) {
      nextSocialFeed.length = 50;
    }
  }

  // 7. Update Competitor Scores & Drops (Dynamic Competitor training simulation)
  let currentHighestModelScore = state.trainedModels.reduce((max, m) => Math.max(max, m.qualityScore), 0);
  currentHighestModelScore = updatedCompetitors.reduce((max, c) => Math.max(max, c.leadModelScore), currentHighestModelScore);

  updatedCompetitors = updatedCompetitors.map((comp) => {
    // Basic market share drift
    const drift = (Math.random() - 0.48) * 0.25;
    const nextShare = Math.max(0.1, Math.min(80, comp.marketShare + drift));
    
    const enriched = { 
      ...comp, 
      marketShare: parseFloat(nextShare.toFixed(2)) 
    };

    // If competitor has no active training project, start a new one!
    if (!enriched.activeTraining) {
      startCompetitorNewModelProject(enriched, currentHighestModelScore);
    }

    if (enriched.activeTraining) {
      // Base progress calculation based on virtual FLOPS
      let progressIncrement = ((enriched.computePower || 100) / 2500) * (Math.random() * 0.4 + 0.8);
      
      // If competitor is in Panic Retaliation mode, they train 1.5x faster
      if (enriched.isPanicking) {
        progressIncrement *= 1.5;
      }

      // Globally, if there is a GPU shortage, training is slowed down
      if (state.gpuShortageMultiplier && state.gpuShortageDaysRemaining && state.gpuShortageDaysRemaining > 0) {
        progressIncrement /= state.gpuShortageMultiplier;
      }

      // Hard minimum daily progress increment
      progressIncrement = Math.max(0.2, progressIncrement);

      const nextProgress = enriched.activeTraining.progress + progressIncrement;
      
      if (nextProgress >= 100) {
        // Training complete -> Launch model!
        const finalLaunchScore = Math.min(99.9, enriched.activeTraining.targetScore);
        const launchedModelName = enriched.activeTraining.modelName;
        const launchedDomain = enriched.activeTraining.domain;

        enriched.leadModelName = launchedModelName;
        enriched.leadModelScore = finalLaunchScore;
        enriched.activeTraining = null;
        enriched.isPanicking = false;

        // Log public announcement
        const domainLabel = launchedDomain === 'IMAGE_DIFFUSION' ? 'Image Generation' : launchedDomain === 'VIDEO_GENERATION' ? 'Video Generation' : 'Large Language';
        
        updatedLogs.unshift({
          id: `launch_${nextDaysElapsed}_${Math.random().toString(36).substring(2, 5)}`,
          dateString: nextDate,
          message: `🚨 COMPETITOR LAUNCH: ${enriched.name} has released a new ${domainLabel} model: "${launchedModelName}"! It registered a benchmark score of ${finalLaunchScore}%.`,
          type: 'COMPETITOR',
        });
      } else {
        // Update progress and remaining days
        const daysLeft = Math.max(1, Math.round((100 - nextProgress) / progressIncrement));
        enriched.activeTraining = {
          ...enriched.activeTraining,
          progress: parseFloat(nextProgress.toFixed(1)),
          estDaysRemaining: daysLeft
        };
      }
    }

    return enriched;
  });

  let nextRetaliationDays = state.competitorRetaliationDays;
  let nextRetaliationTarget = state.competitorRetaliationTarget;

  const highestPlayerModel = updatedTrainedModelsList.length > 0 ? [...updatedTrainedModelsList].sort((a,b) => b.benchmarks.mmlu - a.benchmarks.mmlu)[0] : null;
  const currentBestCompetitorScore = Math.max(...updatedCompetitors.map(c => c.leadModelScore));
  
  if (highestPlayerModel && highestPlayerModel.benchmarks.mmlu > currentBestCompetitorScore) {
    if (nextRetaliationDays === undefined) {
       nextRetaliationDays = 15 + Math.floor(Math.random() * 20); // 15-35 days to retaliate
       nextRetaliationTarget = highestPlayerModel.benchmarks.mmlu + (Math.random() * 2.0 + 0.5); // beat player by 0.5 to 2.5%
       updatedLogs.unshift({
         id: `aiwar_retaliation_start_${nextDaysElapsed}`,
         dateString: nextDate,
         message: `🚨 THREAT DETECTED: Competitors noticed your model took the #1 global rank! Internal sources say they are rushing a massive new cluster to beat your score.`,
         type: 'MARKET',
       });
    }
  }

  if (nextRetaliationDays !== undefined && nextRetaliationDays > 0) {
    nextRetaliationDays -= 1;
    if (nextRetaliationDays <= 0) {
      const compIdx = Math.floor(Math.random() * updatedCompetitors.length);
      const targetComp = updatedCompetitors[compIdx];
      let newScore = Math.min(99.9, parseFloat((nextRetaliationTarget || 99.0).toFixed(1)));
      if (state.difficultyLevel === 'EXPERT') newScore = Math.min(99.9, newScore + 1.5);
      
      const newModelName = `${targetComp.leadModelName.split(' ')[0]} Turbo-Strike`;

      updatedCompetitors = updatedCompetitors.map((comp, idx) => {
        if (idx === compIdx) {
          return {
            ...comp,
            leadModelName: newModelName,
            leadModelScore: newScore,
          };
        }
        return comp;
      });

      updatedLogs.unshift({
        id: `aiwar_retaliation_hit_${nextDaysElapsed}`,
        dateString: nextDate,
        message: `🚨 COMPETITOR RETALIATION: ${targetComp.name} aggressively launched ${newModelName}, dethroning you with a massive score of ${newScore}%!`,
        type: 'MARKET',
      });

      nextRetaliationDays = undefined;
      nextRetaliationTarget = undefined;
    }
  }

  // Calculate dynamic valuation based on MRR and GPU assets
  const totalHardwareAssetVal = Object.entries(state.gpusInstalled).reduce((sum, [gpuId, qty]) => {
    const spec = GPUMARKETPLACE.find((g) => g.id === gpuId) || (state.customChips || []).find((g) => g.id === gpuId);
    return sum + (spec ? spec.cost * qty : 0);
  }, 0);
  const monthlyRevenueEst = dailyRevenue * 30;
  const valuationEst = totalHardwareAssetVal + (monthlyRevenueEst * 12 * 12); // slightly reduced multiple for tighter balance
  const nextValuation = Math.max(1000000, valuationEst);

  // 8. Trigger Monthly Expenses check or Random Milestones
  if (updatedTrainedModelsList.length > 0) {
    const highestModel = [...updatedTrainedModelsList].sort((a,b) => b.benchmarks.mmlu - a.benchmarks.mmlu)[0];
    
    // Beat Meta (85.1)
    if (highestModel.benchmarks.mmlu > 85.1 && !completedMilestones.includes('beat_meta')) {
      completedMilestones.push('beat_meta');
      nextResearchPoints += 40;
      updatedLogs.unshift({
        id: `mile_meta`,
        dateString: nextDate,
        message: `🏆 MILESTONE ACHIEVED: "Open Source Duelists"! Surpassed Llama 4.5 in evaluation scores. Unlocked +40 R&D points. Tech community is stunned.`,
        type: 'MILESTONE',
      });
    }

    // Beat OpenAI (89.2)
    if (highestModel.benchmarks.mmlu > 89.2 && !completedMilestones.includes('beat_openai')) {
      completedMilestones.push('beat_openai');
      updatedLogs.unshift({
        id: `mile_openai`,
        dateString: nextDate,
        message: `🏆 MILESTONE ACHIEVED: "King of Silicon Valley"! Reached top page of LMSYS leaderboard, matching OpenAI's GPT Frontier! Grants global prestige (+20 public sentiment).`,
        type: 'MILESTONE',
      });
      nextSentiment = Math.min(100, nextSentiment + 20);
    }

    // Safety Rating 90+
    const safeModel = updatedTrainedModelsList.find((m) => m.safetyScore >= 90);
    if (safeModel && !completedMilestones.includes('safety_perfect')) {
      completedMilestones.push('safety_perfect');
      nextResearchPoints += 40;
      updatedLogs.unshift({
        id: `mile_safety`,
        dateString: nextDate,
        message: `🏆 MILESTONE ACHIEVED: "Safe Haven"! Trained a foundation network with over 90% alignment compliance. Safety lobbies praise your corporate ethics. +40 R&D Points.`,
        type: 'MILESTONE',
      });
    }
  }

  if (monthlyRevenueEst >= 1000000 && !completedMilestones.includes('million_mrr')) {
    completedMilestones.push('million_mrr');
    updatedLogs.unshift({
      id: `mile_mrr`,
      dateString: nextDate,
      message: `🏆 MILESTONE ACHIEVED: "Unicorn Status"! Reached over $1,000,000 monthly active revenue. VCs are sending blank checks.`,
      type: 'MILESTONE',
    });
  }

  if (totalTflops >= 50000 && !completedMilestones.includes('giga_cluster')) {
    completedMilestones.push('giga_cluster');
    updatedLogs.unshift({
      id: `mile_tflops`,
      dateString: nextDate,
      message: `🏆 MILESTONE ACHIEVED: "TFLOPS Monster"! Computing power exceeded 50,000 total floating-point capacity. The operations floor resembles a nuclear power reactor.`,
      type: 'MILESTONE',
    });
  }

  // Monthly Expenses Log and Deduct
  const isFirstOfMonth = nextDate.includes(' 1, ');
  if (isFirstOfMonth) {
    updatedLogs.unshift({
      id: `billing_report_${nextDaysElapsed}`,
      dateString: nextDate,
      message: `💸 MONTHLY BILLING: Rent, energy grids, and base staff salaries processed. Total cash flow this past month was: $${Math.round(dailyRevenue * 30 - adjustedOperatingExpenses * 30)}.`,
      type: 'MARKET',
    });
  }

  // 9. Random Incidents & Event Engine
  const eventChance = 0.004 * (state.culture.legalRiskMultiplier || 1);
  if (Math.random() < eventChance) {
    const events = [
      {
        id: 'copyright_cease',
        message: '⚠️ LAW LAWSUIT WARNING: A legal firm representing a major newspaper coalition has sent a Cease & Desist letter complaining of dataset crawling. PR specialists recommended a $50,000 license settlement.',
        cost: 50000,
        desc: 'Publishers lawsuit',
      },
      {
        id: 'competitor_poach',
        message: '🚨 HEADHUNTING CRISIS: OpenAI recruiters are attempting to poach your leading research scientists with $2M stock grants. Employee morale slightly lowered; we spent $15,000 in retainers.',
        cost: 15000,
        desc: 'Poaching defense',
      },
      {
        id: 'cooling_failure',
        message: '🔥 DISASTER AVERTED: A critical coolant leak in Server Room C raised temperatures to 92°C. Operations team executed a fluid patch. Maintenance costs: $8,000.',
        cost: 8000,
        desc: 'Cooling fluid patch',
      },
      {
        id: 'grid_surge',
        message: '⚡ ELECTRIC GRID BLOW: Local utility provider imposed a peak-tariff premium adjustment due to regional brownouts. Energy surcharge: $12,000.',
        cost: 12000,
        desc: 'Utility peak penalty',
      }
    ];

    const incident = events[Math.floor(Math.random() * events.length)];
    updatedLogs.unshift({
      id: `incident_${nextDaysElapsed}_${Math.random().toString(36).substring(2, 5)}`,
      dateString: nextDate,
      message: incident.message,
      type: 'EVENT',
    });
  }

  // Update staff morale values randomly
  const updatedStaff = state.staff.map((s) => {
    let moraleChange = (Math.random() - 0.48) * 3;
    if (state.cash < 5000) {
      moraleChange -= 5;
    }
    if (s.perk && s.perk.type === 'BURNOUT_PRONE') {
      moraleChange -= 1.5; // Burnout Prone staff morale decays faster
    }
    const nextMorale = Math.max(10, Math.min(100, s.morale + moraleChange));
    return {
      ...s,
      morale: parseFloat(nextMorale.toFixed(1)),
    };
  });

  if (updatedLogs.length > 100) {
    updatedLogs.length = 100;
  }

  // Update post-training alignment progress daily for unaligned models
  const finalizedTrainedModels = updatedTrainedModelsList.map((model) => {
    if (model.isAligned === false && model.alignmentBudget > 0) {
      nextCashAdjusted -= model.alignmentBudget;
      
      let budgetScale = Math.min(2.5, 0.5 + model.alignmentBudget / 5000);
      let dpoMult = state.research?.completedProjects?.includes('unlockedDPO') ? 2.0 : 1.0;
      let progressIncrement = 2.5 * budgetScale * dpoMult * (Math.random() * 0.3 + 0.85);
      
      const nextProg = model.alignmentProgress + progressIncrement;
      
      if (nextProg >= 100) {
        updatedLogs.unshift({
          id: `align_done_${nextDaysElapsed}_${model.id}`,
          dateString: nextDate,
          message: `🎯 ALIGNMENT COMPLETE: "${model.name}" is now fully safety-aligned and unlocked for commercial product deployments!`,
          type: 'SYSTEM',
        });
        return {
          ...model,
          isAligned: true,
          alignmentProgress: 100,
        };
      } else {
        return {
          ...model,
          alignmentProgress: parseFloat(nextProg.toFixed(1)),
        };
      }
    }
    // Backward compatibility: models created in older versions default to isAligned: true
    if (model.isAligned === undefined) {
      return {
        ...model,
        isAligned: true,
        alignmentProgress: 100,
        alignmentBudget: 0,
        domain: model.domain || 'TEXT_LLM'
      } as any;
    }
    return model;
  });

  return {
    ...state,
    currentDate: nextDate,
    daysElapsed: nextDaysElapsed,
    isGameOver: nextIsGameOver,
    agiDoomMeter: nextAgiDoomMeter,
    isAgiTakeover,
    activeSlackChat: nextActiveSlackChat,
    cash: parseFloat(nextCashAdjusted.toFixed(2)),
    valuation: Math.round(nextValuation),
    globalPublicSentiment: parseFloat(nextSentiment.toFixed(2)),
    hypeLevel: parseFloat(nextHype.toFixed(2)),
    competitors: updatedCompetitors,
    socialFollowers: nextSocialFollowers,
    trendingHashtag: nextTrendingHashtag,
    socialFeed: nextSocialFeed,
    newsLogs: updatedLogs,
    trainedModels: finalizedTrainedModels,
    training: updatedTraining,
    staff: updatedStaff,
    completedMilestones,
    researchPoints: nextResearchPoints,
    apps: simulatedApps,
    serverInstances: degradedServers,
    contracts: updatedContractsList,
    regulatoryMandates: updatedMandatesList,
    warfareState: nextWarfareState,
    aiAgents: state.aiAgents || [],
    lobbyingLevel: state.lobbyingLevel || 0,
    activeChipProject: nextActiveChipProject,
    customChips: nextCustomChips,
    gpuShortageMultiplier: nextGpuShortageMultiplier,
    gpuShortageDaysRemaining: nextGpuShortageDays,
    competitorRetaliationDays: nextRetaliationDays,
    competitorRetaliationTarget: nextRetaliationTarget,
    scheduledEvent: nextScheduledEvent,
    activeLiveEvent: nextActiveLiveEvent,
    monthlyExpenses: {
      infrastructureCost: Math.round(leaseCostMonthly),
      powerBill: Math.round(monthlyElectricityBill),
      salaries: totalSalaries,
      rent: monthlyRent,
      interest: 0,
      legalOverhead: legalTeam.length > 0 ? 6000 : 30000,
    },
    monthlyRevenue: Math.round(monthlyRevenueEst),
  };
}

export function startCompetitorNewModelProject(comp: any, currentHighestScore: number) {
  const prefixes = {
    openai: 'GPT',
    google: 'Gemini',
    anthropic: 'Claude',
    meta: 'Llama',
    deepseek: 'DeepSeek-V',
    xai: 'Grok',
    mistral: 'Mistral Large',
    cohere: 'Command',
    qwen: 'Qwen',
    apple: 'AFM',
    microsoft: 'Phi',
    amazon: 'Olympus',
    stability: 'StableLM',
  } as Record<string, string>;

  const prefix = prefixes[comp.id] || comp.name.split(' ')[0];
  
  const roll = Math.random();
  const domain = roll < 0.7 ? 'TEXT_LLM' : roll < 0.9 ? 'IMAGE_DIFFUSION' : 'VIDEO_GENERATION';
  const domainSuffix = domain === 'IMAGE_DIFFUSION' ? ' Image' : domain === 'VIDEO_GENERATION' ? ' Video' : '';

  if (comp.internalVersion === undefined) {
    if (prefix === 'GPT') comp.internalVersion = 4.0;
    else if (prefix === 'Gemini') comp.internalVersion = 1.5;
    else if (prefix === 'Claude') comp.internalVersion = 3.0;
    else if (prefix === 'Llama') comp.internalVersion = 3.1;
    else if (prefix === 'Grok') comp.internalVersion = 1.5;
    else if (prefix === 'DeepSeek-V') comp.internalVersion = 2.0;
    else comp.internalVersion = 1.0;
  }

  const jumpRoll = Math.random();
  if (jumpRoll < 0.75) {
    comp.internalVersion += 0.1; 
  } else if (jumpRoll < 0.95) {
    comp.internalVersion += 0.5;
  } else {
    comp.internalVersion += 1.0;
  }

  const ver = parseFloat(comp.internalVersion.toFixed(1));
  const suffixes = ['Pro', 'Ultra', 'Frontier', 'Sovereign', 'Flash', 'Reasoning'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const modelName = `${prefix}${domainSuffix} ${ver} ${suffix}`;
  
  let targetScore = comp.leadModelScore + (Math.random() * 1.6 + 0.3);
  if (currentHighestScore > targetScore) {
    targetScore = currentHighestScore + (Math.random() * 1.2 + 0.2);
  }
  targetScore = parseFloat(Math.min(99.9, targetScore).toFixed(1));

  const baseComplexity = Math.pow(targetScore - 10, 1.8) * 15;
  const daysRemaining = Math.max(15, Math.round(baseComplexity / (comp.computePower || 100)));

  comp.activeTraining = {
    modelName,
    targetScore,
    progress: 0,
    estDaysRemaining: daysRemaining,
    domain
  };
  comp.isPanicking = false;
}
