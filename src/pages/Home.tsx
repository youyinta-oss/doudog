import React from 'react';
import { 
  Power, 
  Snowflake, 
  Sun, 
  Droplets, 
  Fan, 
  Zap,
  Plus,
  Minus,
  Clock,
  ArrowUpDown,
  ArrowLeftRight,
  Move,
  Thermometer
} from 'lucide-react';
import { useACStore } from '../store/useACStore';
import { clsx } from 'clsx';

const Home: React.FC = () => {
  const { 
    power, 
    temperature, 
    mode, 
    fanSpeed, 
    swing,
    timer,
    togglePower, 
    setTemperature, 
    setMode, 
    setFanSpeed,
    setSwing,
    toggleTimerOn,
    toggleTimerOff,
    setTimerOnTime,
    setTimerOffTime
  } = useACStore();

  const getModeIcon = (m: string) => {
    switch (m) {
      case 'cool': return <Snowflake size={28} />;
      case 'heat': return <Sun size={28} />;
      case 'dry': return <Droplets size={28} />;
      case 'fan': return <Fan size={28} />;
      case 'auto': return <Zap size={28} />;
      default: return <Snowflake size={28} />;
    }
  };

  const getModeName = (m: string) => {
    switch (m) {
      case 'cool': return '制冷';
      case 'heat': return '制热';
      case 'dry': return '除湿';
      case 'fan': return '送风';
      case 'auto': return '自动';
      default: return '制冷';
    }
  };

  const getFanSpeedName = (speed: string) => {
    switch (speed) {
      case 'auto': return '自动';
      case 'low': return '低速';
      case 'medium': return '中速';
      case 'high': return '高速';
      default: return '自动';
    }
  };

  const getSwingIcon = (s: string) => {
    switch (s) {
      case 'off': return <Move size={22} />;
      case 'vertical': return <ArrowUpDown size={22} />;
      case 'horizontal': return <ArrowLeftRight size={22} />;
      case 'both': return <><ArrowUpDown size={20} /><ArrowLeftRight size={20} /></>;
      default: return <Move size={22} />;
    }
  };

  const getSwingName = (s: string) => {
    switch (s) {
      case 'off': return '关闭';
      case 'vertical': return '上下';
      case 'horizontal': return '左右';
      case 'both': return '全部';
      default: return '关闭';
    }
  };

  const getModeGradient = () => {
    if (!power) return 'from-slate-600 to-slate-700';
    switch (mode) {
      case 'cool': return 'from-blue-500 via-cyan-400 to-teal-500';
      case 'heat': return 'from-orange-500 via-red-400 to-pink-500';
      case 'dry': return 'from-cyan-400 via-teal-400 to-emerald-500';
      case 'fan': return 'from-green-400 via-emerald-400 to-teal-400';
      case 'auto': return 'from-purple-500 via-pink-400 to-rose-500';
      default: return 'from-blue-500 via-cyan-400 to-teal-500';
    }
  };

  const getModeText = () => {
    if (!power) return 'text-slate-400';
    switch (mode) {
      case 'cool': return 'text-blue-300';
      case 'heat': return 'text-orange-300';
      case 'dry': return 'text-cyan-300';
      case 'fan': return 'text-green-300';
      case 'auto': return 'text-purple-300';
      default: return 'text-blue-300';
    }
  };

  const modes = ['cool', 'heat', 'dry', 'fan', 'auto'] as const;
  const fanSpeeds = ['auto', 'low', 'medium', 'high'] as const;
  const swings = ['off', 'vertical', 'horizontal', 'both'] as const;

  return (
    <div className={clsx(
      "min-h-screen flex items-center justify-center p-4 transition-all duration-1000",
      power ? `bg-gradient-to-br ${getModeGradient()}` : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    )}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={clsx(
          "absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30 blur-3xl transition-all duration-1000",
          power ? "bg-white/20" : "bg-slate-700/50"
        )} />
        <div className={clsx(
          "absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-30 blur-3xl transition-all duration-1000",
          power ? "bg-white/15" : "bg-slate-700/40"
        )} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className={clsx(
            "text-4xl font-light tracking-wider mb-2 transition-all duration-500",
            power ? "text-white" : "text-slate-500"
          )}>
            CLIMATE
          </h1>
          <p className={clsx(
            "text-sm tracking-widest uppercase transition-all duration-500",
            power ? "text-white/60" : "text-slate-600"
          )}>
            Smart Control
          </p>
        </div>

        <div className={clsx(
          "backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-700 border",
          power 
            ? "bg-white/10 border-white/20 shadow-2xl shadow-black/30" 
            : "bg-slate-800/40 border-slate-700/50 shadow-xl shadow-black/20"
        )}>
          <div className="relative pt-12 pb-8 px-8">
            <button
              onClick={togglePower}
              className={clsx(
                "absolute top-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 backdrop-blur-sm border",
                power
                  ? "bg-white/20 border-white/30 text-white hover:bg-white/30 hover:scale-110 active:scale-95"
                  : "bg-slate-700/50 border-slate-600/50 text-slate-400 hover:bg-slate-700/70 hover:scale-110 active:scale-95"
              )}
            >
              <Power size={28} fill={power ? "currentColor" : "none"} />
            </button>

            <div className="text-center relative">
              <div className={clsx(
                "relative inline-flex items-center justify-center",
                power ? "" : "opacity-50"
              )}>
                <div className={clsx(
                  "absolute w-56 h-56 rounded-full transition-all duration-1000",
                  power ? "bg-white/5 animate-pulse" : "bg-slate-700/30"
                )} />
                
                <svg className="w-52 h-52 transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="42" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="4"
                  />
                  <circle 
                    cx="50" cy="50" r="42" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="264"
                    strokeDashoffset={264 - ((temperature - 16) / 14) * 264}
                    className="transition-all duration-700"
                    style={{
                      filter: power ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none'
                    }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex items-start justify-center">
                    <span className={clsx(
                      "text-7xl font-light tracking-tighter transition-all duration-500",
                      power ? "text-white" : "text-slate-500"
                    )}>
                      {temperature}
                    </span>
                    <span className={clsx(
                      "text-3xl mt-2 font-light transition-all duration-500",
                      power ? "text-white/70" : "text-slate-600"
                    )}>
                      °
                    </span>
                  </div>
                  <div className={clsx(
                    "flex items-center gap-2 mt-2 transition-all duration-500",
                    power ? getModeText() : "text-slate-600"
                  )}>
                    {getModeIcon(mode)}
                    <span className="text-sm font-medium tracking-wide">
                      {getModeName(mode)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-6">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setTemperature(temperature - 1)}
                disabled={!power}
                className={clsx(
                  "flex-1 py-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm border",
                  power
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 active:scale-95"
                    : "bg-slate-800/30 border-slate-700/30 text-slate-500 cursor-not-allowed"
                )}
              >
                <Minus size={28} strokeWidth={2} />
                <span className="text-xs font-medium tracking-wide">降低</span>
              </button>
              
              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-sm border bg-white/5">
                <Thermometer size={20} className={clsx(
                  "transition-all duration-500",
                  power ? "text-white/50" : "text-slate-600"
                )} />
                <span className={clsx(
                  "text-2xl font-light transition-all duration-500",
                  power ? "text-white" : "text-slate-500"
                )}>
                  {temperature}°C
                </span>
              </div>

              <button
                onClick={() => setTemperature(temperature + 1)}
                disabled={!power}
                className={clsx(
                  "flex-1 py-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm border",
                  power
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 active:scale-95"
                    : "bg-slate-800/30 border-slate-700/30 text-slate-500 cursor-not-allowed"
                )}
              >
                <Plus size={28} strokeWidth={2} />
                <span className="text-xs font-medium tracking-wide">升高</span>
              </button>
            </div>
          </div>

          <div className={clsx(
            "mx-8 h-px transition-all duration-500",
            power ? "bg-white/20" : "bg-slate-700/50"
          )} />

          <div className="p-8 space-y-6">
            <div>
              <div className={clsx(
                "flex items-center gap-2 mb-4 transition-all duration-500",
                power ? "text-white/70" : "text-slate-600"
              )}>
                <Zap size={16} />
                <span className="text-xs font-medium tracking-widest uppercase">运行模式</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {modes.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    disabled={!power}
                    className={clsx(
                      "py-4 rounded-xl flex flex-col items-center gap-2 transition-all duration-300 backdrop-blur-sm border",
                      !power && "opacity-40 cursor-not-allowed",
                      power && mode === m
                        ? "bg-white/20 border-white/40 text-white scale-105 shadow-lg shadow-black/10"
                        : power
                        ? "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:border-white/20"
                        : "bg-slate-800/20 border-transparent text-slate-600"
                    )}
                  >
                    {getModeIcon(m)}
                    <span className="text-xs font-medium tracking-wide">{getModeName(m)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={clsx(
                  "flex items-center gap-2 mb-3 transition-all duration-500",
                  power ? "text-white/70" : "text-slate-600"
                )}>
                  <Fan size={16} />
                  <span className="text-xs font-medium tracking-widest uppercase">风速</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {fanSpeeds.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setFanSpeed(speed)}
                      disabled={!power}
                      className={clsx(
                        "py-3 rounded-lg flex items-center justify-center transition-all duration-300 backdrop-blur-sm border text-xs font-medium",
                        !power && "opacity-40 cursor-not-allowed",
                        power && fanSpeed === speed
                          ? "bg-white/20 border-white/40 text-white"
                          : power
                          ? "bg-white/5 border-transparent text-white/60 hover:bg-white/10"
                          : "bg-slate-800/20 border-transparent text-slate-600"
                      )}
                    >
                      {getFanSpeedName(speed)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className={clsx(
                  "flex items-center gap-2 mb-3 transition-all duration-500",
                  power ? "text-white/70" : "text-slate-600"
                )}>
                  <Move size={16} />
                  <span className="text-xs font-medium tracking-widest uppercase">风向</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {swings.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSwing(s)}
                      disabled={!power}
                      className={clsx(
                        "py-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-300 backdrop-blur-sm border",
                        !power && "opacity-40 cursor-not-allowed",
                        power && swing === s
                          ? "bg-white/20 border-white/40 text-white"
                          : power
                          ? "bg-white/5 border-transparent text-white/60 hover:bg-white/10"
                          : "bg-slate-800/20 border-transparent text-slate-600"
                      )}
                    >
                      {getSwingIcon(s)}
                      <span className="text-[10px] font-medium">{getSwingName(s)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className={clsx(
                "flex items-center gap-2 mb-4 transition-all duration-500",
                power ? "text-white/70" : "text-slate-600"
              )}>
                <Clock size={16} />
                <span className="text-xs font-medium tracking-widest uppercase">定时设置</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <button
                    onClick={toggleTimerOn}
                    disabled={!power}
                    className={clsx(
                      "w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm border text-sm font-medium",
                      !power && "opacity-40 cursor-not-allowed",
                      timer.on
                        ? "bg-green-500/30 border-green-400/50 text-green-200"
                        : power
                        ? "bg-white/5 border-transparent text-white/60 hover:bg-white/10"
                        : "bg-slate-800/20 border-transparent text-slate-600"
                    )}
                  >
                    <span>定时开机</span>
                  </button>
                  <input
                    type="time"
                    value={timer.onTime}
                    onChange={(e) => setTimerOnTime(e.target.value)}
                    disabled={!power || !timer.on}
                    className={clsx(
                      "w-full py-2.5 px-4 rounded-xl text-center text-sm transition-all duration-300 backdrop-blur-sm border",
                      !power || !timer.on 
                        ? "bg-slate-800/20 border-transparent text-slate-500 cursor-not-allowed" 
                        : "bg-white/10 border-white/20 text-white placeholder-white/40"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <button
                    onClick={toggleTimerOff}
                    disabled={!power}
                    className={clsx(
                      "w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm border text-sm font-medium",
                      !power && "opacity-40 cursor-not-allowed",
                      timer.off
                        ? "bg-red-500/30 border-red-400/50 text-red-200"
                        : power
                        ? "bg-white/5 border-transparent text-white/60 hover:bg-white/10"
                        : "bg-slate-800/20 border-transparent text-slate-600"
                    )}
                  >
                    <span>定时关机</span>
                  </button>
                  <input
                    type="time"
                    value={timer.offTime}
                    onChange={(e) => setTimerOffTime(e.target.value)}
                    disabled={!power || !timer.off}
                    className={clsx(
                      "w-full py-2.5 px-4 rounded-xl text-center text-sm transition-all duration-300 backdrop-blur-sm border",
                      !power || !timer.off 
                        ? "bg-slate-800/20 border-transparent text-slate-500 cursor-not-allowed" 
                        : "bg-white/10 border-white/20 text-white placeholder-white/40"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 pt-4">
            <div className={clsx(
              "flex items-center justify-center gap-3 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-500",
              power 
                ? "bg-white/5 border-white/10" 
                : "bg-slate-800/30 border-slate-700/30"
            )}>
              <div className={clsx(
                "w-2.5 h-2.5 rounded-full transition-all duration-500",
                power 
                  ? "bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" 
                  : "bg-slate-600"
              )} />
              <span className={clsx(
                "text-sm font-medium tracking-wide transition-all duration-500",
                power ? "text-white/70" : "text-slate-500"
              )}>
                {power ? "运行中" : "已关闭"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className={clsx(
            "text-[10px] tracking-[0.3em] uppercase transition-all duration-500",
            power ? "text-white/40" : "text-slate-600"
          )}>
            Designed with passion
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
