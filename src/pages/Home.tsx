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
  Move
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
      case 'cool': return <Snowflake size={24} />;
      case 'heat': return <Sun size={24} />;
      case 'dry': return <Droplets size={24} />;
      case 'fan': return <Fan size={24} />;
      case 'auto': return <Zap size={24} />;
      default: return <Snowflake size={24} />;
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
      case 'off': return <Move size={20} />;
      case 'vertical': return <ArrowUpDown size={20} />;
      case 'horizontal': return <ArrowLeftRight size={20} />;
      case 'both': return <><ArrowUpDown size={18} /><ArrowLeftRight size={18} /></>;
      default: return <Move size={20} />;
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

  const getModeColor = () => {
    if (!power) return 'text-gray-400';
    switch (mode) {
      case 'cool': return 'text-blue-500';
      case 'heat': return 'text-orange-500';
      case 'dry': return 'text-cyan-500';
      case 'fan': return 'text-green-500';
      case 'auto': return 'text-purple-500';
      default: return 'text-blue-500';
    }
  };

  const getBgGradient = () => {
    if (!power) return 'from-gray-100 to-gray-200';
    switch (mode) {
      case 'cool': return 'from-blue-500 to-cyan-400';
      case 'heat': return 'from-orange-500 to-red-400';
      case 'dry': return 'from-cyan-500 to-teal-400';
      case 'fan': return 'from-green-500 to-emerald-400';
      case 'auto': return 'from-purple-500 to-pink-400';
      default: return 'from-blue-500 to-cyan-400';
    }
  };

  const modes = ['cool', 'heat', 'dry', 'fan', 'auto'] as const;
  const fanSpeeds = ['auto', 'low', 'medium', 'high'] as const;
  const swings = ['off', 'vertical', 'horizontal', 'both'] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">智能空调</h1>
          <p className="text-slate-400">Smart Air Conditioner</p>
        </div>

        {/* Main Card */}
        <div className={clsx(
          "bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500",
          power ? "ring-4 ring-blue-500/20" : ""
        )}>
          {/* Top Section - Temperature Display */}
          <div className={clsx(
            "relative p-8 text-center transition-all duration-500",
            `bg-gradient-to-br ${getBgGradient()}`
          )}>
            {/* Power Button */}
            <button
              onClick={togglePower}
              className={clsx(
                "absolute top-6 right-6 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                power 
                  ? "bg-white text-red-500 hover:bg-red-50 hover:scale-110" 
                  : "bg-slate-700 text-white hover:bg-slate-600 hover:scale-110"
              )}
            >
              <Power size={28} fill={power ? "currentColor" : "none"} />
            </button>

            {/* Temperature Circle */}
            <div className="relative inline-block">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.2)" 
                  strokeWidth="6"
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - ((temperature - 16) / 14) * 283}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={clsx(
                  "text-6xl font-bold transition-all duration-300",
                  power ? "text-white" : "text-white/50"
                )}>
                  {temperature}°
                </span>
                <span className={clsx(
                  "text-lg mt-1 flex items-center gap-2 transition-all duration-300",
                  power ? "text-white/90" : "text-white/40"
                )}>
                  {getModeIcon(mode)}
                  {getModeName(mode)}
                </span>
              </div>
            </div>

            {/* Status Light */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className={clsx(
                "w-3 h-3 rounded-full transition-all duration-300",
                power 
                  ? "bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" 
                  : "bg-gray-400"
              )} />
            </div>
          </div>

          {/* Controls Section */}
          <div className="p-6 space-y-6">
            {/* Temperature Control */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setTemperature(temperature - 1)}
                disabled={!power}
                className={clsx(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200",
                  power 
                    ? "bg-slate-100 hover:bg-blue-50 hover:text-blue-500 hover:scale-105 active:scale-95" 
                    : "bg-slate-50 text-slate-300 cursor-not-allowed"
                )}
              >
                <Minus size={32} strokeWidth={2.5} />
              </button>
              <div className="text-center">
                <span className="text-sm text-slate-400 block">温度</span>
                <span className={clsx(
                  "text-4xl font-bold transition-all duration-300",
                  power ? getModeColor() : "text-slate-300"
                )}>
                  {temperature}°C
                </span>
              </div>
              <button
                onClick={() => setTemperature(temperature + 1)}
                disabled={!power}
                className={clsx(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200",
                  power 
                    ? "bg-slate-100 hover:bg-red-50 hover:text-red-500 hover:scale-105 active:scale-95" 
                    : "bg-slate-50 text-slate-300 cursor-not-allowed"
                )}
              >
                <Plus size={32} strokeWidth={2.5} />
              </button>
            </div>

            {/* Mode Selection */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <Zap size={16} />
                运行模式
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {modes.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    disabled={!power}
                    className={clsx(
                      "py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-200",
                      !power && "opacity-40 cursor-not-allowed",
                      power && mode === m
                        ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : power
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105"
                        : "bg-slate-50 text-slate-300"
                    )}
                  >
                    {getModeIcon(m)}
                    <span className="text-xs">{getModeName(m)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fan Speed */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <Fan size={16} />
                风速
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {fanSpeeds.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setFanSpeed(speed)}
                    disabled={!power}
                    className={clsx(
                      "py-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-200",
                      !power && "opacity-40 cursor-not-allowed",
                      power && fanSpeed === speed
                        ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                        : power
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-slate-50 text-slate-300"
                    )}
                  >
                    <span className="font-semibold">{getFanSpeedName(speed)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Swing Control */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <Move size={16} />
                风向
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {swings.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSwing(s)}
                    disabled={!power}
                    className={clsx(
                      "py-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-200",
                      !power && "opacity-40 cursor-not-allowed",
                      power && swing === s
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                        : power
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-slate-50 text-slate-300"
                    )}
                  >
                    {getSwingIcon(s)}
                    <span className="text-xs">{getSwingName(s)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <Clock size={16} />
                定时设置
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <button
                    onClick={toggleTimerOn}
                    disabled={!power}
                    className={clsx(
                      "w-full py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200",
                      !power && "opacity-40 cursor-not-allowed",
                      timer.on
                        ? "bg-green-500 text-white"
                        : power
                        ? "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                        : "bg-white text-slate-300 border border-slate-100"
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
                      "w-full py-2 px-3 rounded-xl text-center transition-all duration-200",
                      !power || !timer.on ? "bg-slate-100 text-slate-400" : "bg-white border border-slate-200"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <button
                    onClick={toggleTimerOff}
                    disabled={!power}
                    className={clsx(
                      "w-full py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200",
                      !power && "opacity-40 cursor-not-allowed",
                      timer.off
                        ? "bg-red-500 text-white"
                        : power
                        ? "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                        : "bg-white text-slate-300 border border-slate-100"
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
                      "w-full py-2 px-3 rounded-xl text-center transition-all duration-200",
                      !power || !timer.off ? "bg-slate-100 text-slate-400" : "bg-white border border-slate-200"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 text-center">
            <span className={clsx(
              "text-sm transition-all duration-300",
              power ? "text-green-600" : "text-slate-400"
            )}>
              {power ? "运行中" : "已关闭"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
