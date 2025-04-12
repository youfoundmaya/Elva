// app/store/usePomodoroStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Mode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroStore {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  customTimes: Record<Mode, number>;
  startTimestamp: number | null;

  setMode: (mode: Mode) => void;
  setTimeLeft: (time: number) => void;
  setIsRunning: (running: boolean) => void;
  updateCustomTime: (mode: Mode, minutes: number) => void;
  resetTimeLeft: () => void;
  setStartTimestamp: (timestamp: number | null) => void;
}

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
          // If the timer is running, stop it before applying the change
          if (isRunning) {
            set({ isRunning: false });
          }
      
          // Now, set the updated timeLeft based on new custom time
          set({ timeLeft: newTimeInSeconds });
        }
      },      
      resetTimeLeft: () => {
        const { mode, customTimes } = get();
        set({ timeLeft: customTimes[mode], startTimestamp: null });
      },
      setStartTimestamp: (timestamp) => set({ startTimestamp: timestamp }),
    }),
    {
      name: 'pomodoro-store',
    }
  )
);
