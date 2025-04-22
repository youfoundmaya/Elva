import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Mode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroStore {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  customTimes: Record<Mode, number>;
  startTimestamp: number | null;
  timerCompleted: boolean;

  setTimerCompleted: (completed: boolean) => void;
  setMode: (mode: Mode) => void;
  setTimeLeft: (time: number) => void;
  setIsRunning: (running: boolean) => void;
  updateCustomTime: (mode: Mode, minutes: number) => void;
  resetTimeLeft: () => void;
  setStartTimestamp: (timestamp: number | null) => void;
}

// Create a storage object that handles SSR properly
const zustandStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') {
      return null;
    }
    return JSON.parse(window.localStorage.getItem(name) || 'null');
  },
  setItem: (name: string, value: any) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(name, JSON.stringify(value));
    }
  },
  removeItem: (name: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(name);
    }
  },
};

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      mode: 'work',
      timeLeft: 25 * 60,
      isRunning: false,
      customTimes: {
        work: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
      },
      startTimestamp: null,
      timerCompleted: false,

      setMode: (mode) => {
        const custom = get().customTimes[mode];
        set({ mode, timeLeft: custom, isRunning: false, startTimestamp: null });
      },
      setTimeLeft: (time) => set({ timeLeft: time }),
      setIsRunning: (running) => set({ isRunning: running }),
      updateCustomTime: (mode, minutes) => {
        const newTimeInSeconds = minutes * 60;
        const newTimes = { ...get().customTimes, [mode]: newTimeInSeconds };
        const { isRunning } = get();
      
        set({ customTimes: newTimes });
      
        if (get().mode === mode) {
          if (isRunning) {
            set({ isRunning: false });
          }
          set({ timeLeft: newTimeInSeconds });
        }
      },      
      resetTimeLeft: () => {
        const { mode, customTimes } = get();
        set({ timeLeft: customTimes[mode], startTimestamp: null });
      },
      setStartTimestamp: (timestamp) => set({ startTimestamp: timestamp }),
      setTimerCompleted: (completed) => set({ timerCompleted: completed }),
    }),
    {
      name: 'pomodoro-store',
      storage: {
        getItem: zustandStorage.getItem,
        setItem: zustandStorage.setItem,
        removeItem: zustandStorage.removeItem,
      },
    }
  )
);
