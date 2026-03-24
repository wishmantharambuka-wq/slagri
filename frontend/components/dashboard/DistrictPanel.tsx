// DistrictPanel - Sliding details panel with Framer Motion
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DistrictData } from '@/lib/types/crops';
import { GlassCard, Badge } from '@/components/ui';

interface DistrictPanelProps {
  district: DistrictData | null;
  crop: string;
  horizon: number;
}

// Status color mapping
const statusColors = {
  surplus: 'bg-green-100 text-green-700 border-green-200',
  shortage: 'bg-red-100 text-red-700 border-red-200',
  balanced: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  stable: 'bg-blue-100 text-blue-700 border-blue-200',
};

// AI insight text generator
function generateAIInsight(district: DistrictData, crop: string, horizon: number): string {
  const horizonLabels = ['current period', 'next month', 'two months out', 'three months out'];
  const horizonText = horizonLabels[horizon] || 'current period';

  if (district.status === 'surplus') {
    return `Gemini AI analysis indicates a robust surplus of ${crop} in ${district.name} for the ${horizonText}. With production at ${(district.harvest / 1000).toFixed(1)}k MT exceeding consumption, prices may dip. Recommendation: Activate storage protocols or plan redistribution to shortage zones.`;
  } else if (district.status === 'shortage') {
    return `Critical alert from Gemini AI: ${crop} stocks in ${district.name} are critically low for the ${horizonText}. Demand outstrips supply by ${Math.abs(district.surplus).toLocaleString()} MT. Immediate import or inter-provincial transport required to stabilize the projected price hike of ${Math.floor(Math.random() * 20 + 10)}%.`;
  } else {
    return `Gemini AI detects a balanced ${crop} market in ${district.name} for the ${horizonText}. Supply meets local demand with minimal deviation. Monitor climate risks (${district.risk.score}/100) closely as minor disruptions could tip the balance.`;
  }
}

export default function DistrictPanel({ district, crop, horizon }: DistrictPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {district ? (
        <motion.div
          key={district.name}
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full lg:w-80 h-full flex flex-col bg-white/65 backdrop-blur-xl border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/40 bg-white/40 flex-shrink-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  District Intelligence
                </span>
                <h2 className="text-2xl font-black text-gray-800 leading-tight">
                  {district.name}
                </h2>
              </div>
              <Badge
                className={statusColors[district.status] || statusColors.balanced}
              >
                {district.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {/* AI Insights Box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-200 to-transparent opacity-20 rounded-bl-full" />
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-sparkles text-indigo-500 text-sm animate-pulse" />
                <h4 className="text-[11px] font-black text-indigo-800 uppercase tracking-wide">
                  AI Analysis
                </h4>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {generateAIInsight(district, crop, horizon)}
              </p>
            </motion.div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <GlassCard className="p-3 rounded-xl bg-blue-50/50 border-blue-100">
                <div className="text-[9px] font-bold text-blue-400 uppercase mb-1">
                  Cultivated Area
                </div>
                <div className="text-xl font-bold text-gray-800">
                  {district.cultivatedArea.toLocaleString()}
                  <span className="text-xs font-normal text-gray-500"> Ha</span>
                </div>
              </GlassCard>
              <GlassCard className="p-3 rounded-xl bg-orange-50/50 border-orange-100">
                <div className="text-[9px] font-bold text-orange-400 uppercase mb-1">
                  Total Harvest
                </div>
                <div className="text-xl font-bold text-gray-800">
                  {(district.harvest / 1000).toFixed(1)}k
                  <span className="text-xs font-normal text-gray-500"> MT</span>
                </div>
              </GlassCard>
            </div>

            {/* Supply vs Demand Bar */}
            <GlassCard className="p-4 rounded-xl bg-white border border-gray-100">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3">
                Supply vs. Demand
              </h4>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                <div
                  className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min((district.consumption / district.harvest) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                <span>Consumption: {district.consumption.toLocaleString()} MT</span>
                <span>Supply: {district.harvest.toLocaleString()} MT</span>
              </div>
            </GlassCard>

            {/* Risk & Price Row */}
            <div className="grid grid-cols-2 gap-3">
              <GlassCard className="p-3 rounded-xl bg-white border border-gray-100">
                <div className="text-[9px] font-bold text-gray-400 uppercase">
                  Risk Score
                </div>
                <div className="flex items-end gap-2 mt-1">
                  <span
                    className={`text-2xl font-bold ${
                      district.risk.score > 70 ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {district.risk.score}
                  </span>
                  <span className="text-[10px] text-gray-400 mb-1">/ 100</span>
                </div>
              </GlassCard>
              <GlassCard className="p-3 rounded-xl bg-white border border-gray-100">
                <div className="text-[9px] font-bold text-gray-400 uppercase">
                  Market Price
                </div>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-800">
                    LKR {district.price.current}
                  </span>
                  <i
                    className={`fas fa-arrow-${district.price.trend === 'up' ? 'up text-red-500' : 'down text-green-500'
                    } mb-1.5 text-xs`}
                  />
                </div>
              </GlassCard>
            </div>

            {/* Land Suitability */}
            <GlassCard className="p-4 rounded-xl bg-white border border-gray-100">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3">
                Land Suitability
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span className="text-gray-500">Soil Type</span>
                  <span className="font-semibold text-gray-700">
                    {district.suitability.soil}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span className="text-gray-500">Water Access</span>
                  <span className="font-semibold text-gray-700">
                    {district.suitability.water}% Coverage
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Elevation</span>
                  <span className="font-semibold text-gray-700">
                    {district.suitability.elevation}m
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* AI Recommended Crops */}
            <GlassCard className="p-4 rounded-xl bg-white border border-gray-100">
              <h4 className="text-[9px] text-gray-400 uppercase block mb-2">
                AI Recommended Crops
              </h4>
              <div className="flex flex-wrap gap-1">
                {['Maize', 'Sorghum', 'Groundnut'].map((c) => (
                  <span
                    key={c}
                    className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] border border-green-100"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full lg:w-80 h-full bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
        >
          <div className="text-center py-10 opacity-50">
            <i className="fas fa-map-marked-alt text-4xl mb-3 text-gray-300" />
            <p className="text-xs text-gray-400">
              Select a district on the map
              <br />
              to view detailed intelligence.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
