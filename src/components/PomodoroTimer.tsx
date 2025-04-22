'use client';

import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { usePomodoroStore } from './PomodoroStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const PomodoroTimer: React.FC = () => {
  const {
    mode,
    timeLeft,
    isRunning,
    customTimes,
    startTimestamp,
    setMode,
    setTimeLeft,
    setIsRunning,
    updateCustomTime,
    resetTimeLeft,
    setStartTimestamp,
  } = usePomodoroStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalTime = customTimes[mode];
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    audioRef.current = new Audio('/finished.mp3');
  }, []);

  // On mount: recalculate if timer is running
  useEffect(() => {
    if (isRunning && startTimestamp) {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      const remaining = Math.max(0, totalTime - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setIsRunning(false);
        setStartTimestamp(null);
        if (audioRef.current) {
          audioRef.current.play();
          resetTimer()
        };
        return;
      }

      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          const newElapsed = Math.floor((Date.now() - startTimestamp) / 1000);
          const newRemaining = Math.max(0, totalTime - newElapsed);

          if (newRemaining <= 0) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setTimeLeft(0);
            setIsRunning(false);
            setStartTimestamp(null);
            if (audioRef.current)  {
              audioRef.current.play();
              resetTimer()
            };
          } else {
            setTimeLeft(newRemaining);
          }
        }, 1000);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, startTimestamp, totalTime]);

  const startTimer = () => {
    if (!isRunning) {
      setStartTimestamp(Date.now() - (customTimes[mode] - timeLeft) * 1000);
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setStartTimestamp(null);
  };

  const resetTimer = () => {
    pauseTimer();
    resetTimeLeft();
  };

  const handleTimeChange = (mode: 'work' | 'shortBreak' | 'longBreak', value: number) => {
    updateCustomTime(mode, value);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-black rounded-lg shadow-lg text-center">
      <h1 className="text-2xl font-bold mb-4 text-black">Pomodoro Timer</h1>

      <div className="flex justify-center mb-6 space-x-2">
        {(['work', 'shortBreak', 'longBreak'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
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

      <div className="text-7xl font-pomodoro font-bold mb-4 text-black">
        {formatTime(timeLeft)}
      </div>

      <div className="w-full bg-gray-200 h-3 rounded mb-6">
        <div
          className="h-full bg-black rounded transition-all duration-500 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

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

      <DropdownMenu>
        <DropdownMenuTrigger className="text-sm pt-3 font-medium text-black underline cursor-pointer">
          Edit Timer Settings
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-4 space-y-4 bg-white border rounded shadow">
          <div className="mt-6 text-left">
            <div>
              <label className="block text-sm">Work Time (minutes):</label>
              <input
                type="number"
                value={customTimes.work / 60}
                onChange={(e) => handleTimeChange('work', Number(e.target.value))}
                className="w-full px-2 py-1 border rounded"
                min="1"
                max="300"
              />
            </div>
            <div>
              <label className="block text-sm">Short Break (minutes):</label>
              <input
                type="number"
                value={customTimes.shortBreak / 60}
                onChange={(e) => handleTimeChange('shortBreak', Number(e.target.value))}
                className="w-full px-2 py-1 border rounded"
                min="1"
                max="300"
              />
            </div>
            <div>
              <label className="block text-sm">Long Break (minutes):</label>
              <input
                type="number"
                value={customTimes.longBreak / 60}
                onChange={(e) => handleTimeChange('longBreak', Number(e.target.value))}
                className="w-full px-2 py-1 border rounded"
                min="1"
                max="300"
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PomodoroTimer;
