'use client';

import React, { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';

type Mode = 'work' | 'shortBreak' | 'longBreak';

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default work time is 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [customTimes, setCustomTimes] = useState({
    work: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
  });
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio notification for when the timer ends
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalTime = customTimes[mode];

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
          playSound(); // Play sound when time is up
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
    setTimeLeft(customTimes[mode]);
  };

  const switchMode = (newMode: Mode) => {
    pauseTimer();
    setMode(newMode);
    setTimeLeft(customTimes[newMode]);
  };

  const handleCustomTimeChange = (mode: Mode, value: number) => {
    setCustomTimes((prevTimes) => {
      const updatedTimes = { ...prevTimes, [mode]: value * 60 }; // Convert to seconds
      return updatedTimes;
    });
  };

  const toggleSettingsVisibility = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };

  // Automatically reset the timer when the custom time changes
  useEffect(() => {
    setTimeLeft(customTimes[mode]); // Reset timeLeft whenever customTimes change
  }, [customTimes, mode]);

  useEffect(() => {
    // Set up the audio file (make sure you have the correct file path)
    audioRef.current = new Audio('/finished.mp3');
    return () => {
      if (audioRef.current) audioRef.current = null;
    };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

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

      {/* Settings Toggle Button */}
      <div className="mt-6">
        <button
          onClick={toggleSettingsVisibility}
          className="text-sm font-medium text-black underline"
        >
          {isSettingsVisible ? 'Hide Timer Settings' : 'Edit Timer Settings'}
        </button>
      </div>

      {/* Timer Settings Dropdown */}
      {isSettingsVisible && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-bold">Edit Timer Durations</h2>

          <div className="flex justify-between">
            <div>
              <label className="block text-sm">Work Time (minutes):</label>
              <input
                type="number"
                value={customTimes.work / 60}
                onChange={(e) => handleCustomTimeChange('work', Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm">Short Break (minutes):</label>
              <input
                type="number"
                value={customTimes.shortBreak / 60}
                onChange={(e) => handleCustomTimeChange('shortBreak', Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm">Long Break (minutes):</label>
              <input
                type="number"
                value={customTimes.longBreak / 60}
                onChange={(e) => handleCustomTimeChange('longBreak', Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
