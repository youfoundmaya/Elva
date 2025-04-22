'use client';

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { usePomodoroStore } from './PomodoroStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { setupGlobalTimer, clearGlobalTimer, requestNotificationPermission, notifyTimerComplete } from './timerService';

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
    timerCompleted,
    setMode,
    setTimeLeft,
    setIsRunning,
    updateCustomTime,
    resetTimeLeft,
    setStartTimestamp,
    setTimerCompleted,
  } = usePomodoroStore();

  const [mounted, setMounted] = useState(false);

  const totalTime = customTimes[mode];
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;
  
  // Request notification permission on mount
  useEffect(() => {
    setMounted(true);
    requestNotificationPermission();
    
    return () => {
      // Don't clear the global timer on unmount
    };
  }, []);
  
  // Check for completed timer that needs to play sound
  useEffect(() => {
    if (mounted && timerCompleted) {
      // Play notification sound and reset the flag
      notifyTimerComplete(mode === 'work' ? 'Work' : mode === 'shortBreak' ? 'Short Break' : 'Long Break');
      setTimerCompleted(false);
    }
  }, [mounted, timerCompleted, mode, setTimerCompleted]);

  // Setup global timer
  useEffect(() => {
    if (!mounted) return;
    
    setupGlobalTimer(
      isRunning,
      startTimestamp,
      totalTime,
      (remaining) => {
        setTimeLeft(remaining);
      },
      () => {
        // Timer completed
        setTimeLeft(0);
        setIsRunning(false);
        setStartTimestamp(null);
        setTimerCompleted(true); // Set flag to play sound
        resetTimer();
      }
    );
  }, [isRunning, startTimestamp, totalTime, mounted, setTimeLeft, setIsRunning, setStartTimestamp, setTimerCompleted]);

  const startTimer = () => {
    if (!isRunning) {
      setStartTimestamp(Date.now() - (customTimes[mode] - timeLeft) * 1000);
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setStartTimestamp(null);
    clearGlobalTimer();
  };

  const resetTimer = () => {
    pauseTimer();
    resetTimeLeft();
  };

  const handleTimeChange = (mode: 'work' | 'shortBreak' | 'longBreak', value: number) => {
    updateCustomTime(mode, value);
  };

  // Don't render until mounted
  if (!mounted) return null;

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
