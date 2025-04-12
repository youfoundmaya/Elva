'use client';

import React, { useEffect, useState, useRef } from 'react';
import clsx from 'clsx'; // optional for conditional classes

type Mode = 'work' | 'shortBreak' | 'longBreak';

const DURATIONS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(DURATIONS['work']);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = DURATIONS[mode];

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeLeft(DURATIONS[mode]);
  };

  const switchMode = (newMode: Mode) => {
    pauseTimer();
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white border border-black rounded-lg shadow-lg text-center">
      <h1 className="text-2xl font-bold mb-4 text-black">Pomodoro Timer</h1>

      {/* Mode Switch */}
      <div className="flex justify-center mb-6 space-x-2">
        {(['work', 'shortBreak', 'longBreak'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={clsx(
              'px-3 py-1 border rounded uppercase text-sm font-bold transition',
              mode === m
                ? 'bg-black text-white border-black'
                : 'text-black border-gray-400 hover:border-black'
            )}
          >
            {m === 'work' ? 'Work' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div className="text-7xl font-pomodoro font-bold mb-4 text-black">
        {formatTime(timeLeft)}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-3 rounded mb-6">
        <div
          className="h-full bg-black rounded transition-all duration-500 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Controls */}
      <div className="space-x-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="px-4 py-2 bg-black text-white rounded hover:opacity-90 transition"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:opacity-90 transition"
          >
            Pause
          </button>
        )}
        <button
          onClick={resetTimer}
          className="px-4 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
