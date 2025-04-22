import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Mode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroStore {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  customTimes: Record<Mode, number>;
  startTime: number | null; // When the timer started (timestamp)

  setMode: (mode: Mode) => void;
  setTimeLeft: (time: number) => void;
  setIsRunning: (running: boolean) => void;
  updateCustomTime: (mode: Mode, minutes: number) => void;
  resetTimeLeft: () => void;
  setStartTime: (time: number | null) => void;
}

// Create store with basic persistence
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
      startTime: null,

      setMode: (mode) => {
        const custom = get().customTimes[mode];
        set({ mode, timeLeft: custom, isRunning: false, startTime: null });
      },
      setTimeLeft: (time) => set({ timeLeft: time }),
      setIsRunning: (running) => set({ isRunning: running }),
      updateCustomTime: (mode, minutes) => {
        const newTimeInSeconds = minutes * 60;
        const newTimes = { ...get().customTimes, [mode]: newTimeInSeconds };
        
        set({ customTimes: newTimes });
      
        if (get().mode === mode) {
          set({ timeLeft: newTimeInSeconds, isRunning: false, startTime: null });
        }
      },
      resetTimeLeft: () => {
        const { mode, customTimes } = get();
        set({ timeLeft: customTimes[mode], startTime: null });
      },
      setStartTime: (time) => set({ startTime: time }),
    }),
    {
      name: 'pomodoro-store',
    }
  )
);
