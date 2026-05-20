import { create } from 'zustand';

type Mode = 'cool' | 'heat' | 'dry' | 'fan' | 'auto';
type FanSpeed = 'auto' | 'low' | 'medium' | 'high';
type Swing = 'off' | 'vertical' | 'horizontal' | 'both';

interface Timer {
  on: boolean;
  off: boolean;
  onTime: string;
  offTime: string;
}

interface ACState {
  power: boolean;
  temperature: number;
  mode: Mode;
  fanSpeed: FanSpeed;
  swing: Swing;
  timer: Timer;
  
  togglePower: () => void;
  setTemperature: (temp: number) => void;
  setMode: (mode: Mode) => void;
  setFanSpeed: (speed: FanSpeed) => void;
  setSwing: (swing: Swing) => void;
  toggleTimerOn: () => void;
  toggleTimerOff: () => void;
  setTimerOnTime: (time: string) => void;
  setTimerOffTime: (time: string) => void;
}

export const useACStore = create<ACState>((set) => ({
  power: false,
  temperature: 24,
  mode: 'cool',
  fanSpeed: 'auto',
  swing: 'off',
  timer: {
    on: false,
    off: false,
    onTime: '08:00',
    offTime: '22:00',
  },

  togglePower: () => set((state) => ({ power: !state.power })),
  
  setTemperature: (temp) => set({ temperature: Math.max(16, Math.min(30, temp)) }),
  
  setMode: (mode) => set({ mode }),
  
  setFanSpeed: (speed) => set({ fanSpeed: speed }),
  
  setSwing: (swing) => set({ swing }),
  
  toggleTimerOn: () => set((state) => ({ timer: { ...state.timer, on: !state.timer.on } })),
  
  toggleTimerOff: () => set((state) => ({ timer: { ...state.timer, off: !state.timer.off } })),
  
  setTimerOnTime: (time) => set((state) => ({ timer: { ...state.timer, onTime: time } })),
  
  setTimerOffTime: (time) => set((state) => ({ timer: { ...state.timer, offTime: time } })),
}));
