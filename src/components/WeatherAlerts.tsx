import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Bell } from 'lucide-react';

interface Alert {
  id?: number;
  alert_id?: string;
  onset?: string;
  expires?: string;
  severity?: 'minor' | 'moderate' | 'severe' | 'extreme';
  event_de?: string;
  event_en?: string;
  headline_de?: string;
  headline_en?: string;
  description_de?: string;
  description_en?: string;
  instruction_de?: string;
  instruction_en?: string;
}

interface WeatherAlertsProps {
  alerts?: Alert[];
}

const severityConfig = {
  minor: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-900/30',
    text: 'text-amber-800 dark:text-amber-300',
    iconColor: 'text-amber-600 dark:text-amber-400',
    label: 'Wetterwarnung'
  },
  moderate: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300',
    iconColor: 'text-orange-600 dark:text-orange-400',
    label: 'Markante Wetterwarnung'
  },
  severe: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    iconColor: 'text-red-600 dark:text-red-400',
    label: 'Unwetterwarnung'
  },
  extreme: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-900/40 animate-pulse',
    text: 'text-purple-800 dark:text-purple-300',
    iconColor: 'text-purple-600 dark:text-purple-400',
    label: 'Extremes Unwetter'
  }
};

const formatAlertTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  try {
    const date = new Date(timeStr);
    return date.toLocaleString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' Uhr';
  } catch (e) {
    return timeStr;
  }
};

export default function WeatherAlerts({ alerts }: WeatherAlertsProps) {
  const [expandedAlerts, setExpandedAlerts] = useState<Record<string, boolean>>({});

  if (!alerts || alerts.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedAlerts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      <div className="flex items-center gap-2 px-1">
        <Bell className="h-5 w-5 text-red-500 animate-bounce" />
        <h3 className="text-sm font-black uppercase tracking-wider text-red-500">
          Aktive Unwetterwarnungen ({alerts.length})
        </h3>
      </div>
      
      <div className="flex flex-col gap-3.5">
        {alerts.map((alert, index) => {
          const id = alert.alert_id || alert.id?.toString() || index.toString();
          const config = severityConfig[alert.severity || 'minor'];
          const isExpanded = !!expandedAlerts[id];

          return (
            <div 
              key={id}
              className={`rounded-3xl border ${config.bg} ${config.border} p-5 transition-all duration-300`}
            >
              {/* Header section (Clickable to expand) */}
              <div 
                onClick={() => toggleExpand(id)}
                className="flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="flex gap-3.5">
                  <div className={`mt-0.5 p-2 rounded-2xl bg-white dark:bg-zinc-900/60 shadow-sm border border-black/5 ${config.iconColor}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/50 dark:bg-black/20 ${config.text}`}>
                      {config.label}
                    </span>
                    <h4 className={`text-base font-extrabold mt-2 leading-snug ${config.text}`}>
                      {alert.headline_de || alert.headline_en}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 font-semibold">
                      Gültig von: <span className="text-slate-700 dark:text-zinc-200">{formatAlertTime(alert.onset)}</span> bis <span className="text-slate-700 dark:text-zinc-200">{formatAlertTime(alert.expires)}</span>
                    </p>
                  </div>
                </div>
                
                <button 
                  className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${config.text} transition-colors`}
                  aria-label="Expand alert description"
                >
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {/* Collapsible details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-3 select-text text-sm">
                  {/* Warning Description */}
                  {alert.description_de && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Beschreibung</span>
                      <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                        {alert.description_de}
                      </p>
                    </div>
                  )}

                  {/* Safety Instructions */}
                  {alert.instruction_de && (
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Verhaltenshinweise / Gefahren</span>
                      <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed italic">
                        {alert.instruction_de}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
