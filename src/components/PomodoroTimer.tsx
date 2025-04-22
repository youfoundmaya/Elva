'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePomodoroStore } from './PomodoroStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Create a global variable to store the interval ID
let globalIntervalId: NodeJS.Timeout | null = null;

const PomodoroTimer: React.FC = () => {
  const {
    mode,
    timeLeft,
    isRunning,
    customTimes,
    startTime,
    setMode,
    setTimeLeft,
    setIsRunning,
    updateCustomTime,
    resetTimeLeft,
    setStartTime,
  } = usePomodoroStore();

  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalTime = customTimes[mode];
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  // Initialize on client-side only
  useEffect(() => {
    setIsMounted(true);
    audioRef.current = new Audio('/finished.mp3');
    
    // Try to initialize audio
    document.addEventListener('click', function initAudio() {
      if (audioRef.current) {
        audioRef.current.volume = 0.1;
        audioRef.current.play().then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
        }).catch(e => console.log("Audio init failed, but that's expected"));
        document.removeEventListener('click', initAudio);
      }
    });
    
    return () => {
      // Don't clear the interval on unmount - we want it to continue
    };
  }, []);

  // Synchronize timer state
  useEffect(() => {
    if (!isMounted) return;
    
    // If timer is running, make sure we have an interval
    if (isRunning && startTime) {
      // Clear any existing interval
      if (globalIntervalId) {
        clearInterval(globalIntervalId);
      }
      
      // Calculate current time based on start time
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const currentTimeLeft = Math.max(0, totalTime - elapsed);
      
      // Update time left
      if (currentTimeLeft !== timeLeft) {
        setTimeLeft(currentTimeLeft);
      }
      
      // If timer has completed
      if (currentTimeLeft <= 0) {
        handleTimerComplete();
        return;
      }
      
      // Set up new interval
      globalIntervalId = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - startTime) / 1000);
        const newTimeLeft = Math.max(0, totalTime - newElapsed);
        
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft <= 0) {
          handleTimerComplete();
        }
      }, 1000);
    } 
    // If timer is not running, clear interval
    else if (!isRunning && globalIntervalId) {
      clearInterval(globalIntervalId);
      globalIntervalId = null;
    }
    
    // Cleanup function
    return () => {
      // We intentionally don't clear the interval here
      // to allow it to continue when navigating away
    };
  }, [isRunning, startTime, isMounted, totalTime]);

  const handleTimerComplete = () => {
    // Clear interval
    if (globalIntervalId) {
      clearInterval(globalIntervalId);
      globalIntervalId = null;
    }
    
    // Update state
    setTimeLeft(0);
    setIsRunning(false);
    setStartTime(null);
    
    // Play sound if possible
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.log("Couldn't play audio automatically");
        
        // Try to show a notification instead
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Timer Complete", {
            body: "Your Pomodoro timer has finished!",
            icon: "/favicon.ico"
          });
        }
      });
    }
  };

  const startTimer = () => {
    if (!isRunning) {
      // Calculate start time based on current time left
      const newStartTime = Date.now() - ((totalTime - timeLeft) * 1000);
      setStartTime(newStartTime);
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    if (globalIntervalId) {
      clearInterval(globalIntervalId);
      globalIntervalId = null;
    }
    setIsRunning(false);
    resetTimeLeft();
  };

  const handleTimeChange = (mode: 'work' | 'shortBreak' | 'longBreak', value: number) => {
    updateCustomTime(mode, value * 60); // Convert minutes to seconds
  };

  // Don't render anything until mounted
  if (!isMounted) return null;

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-black rounded-lg shadow-lg text-center">
      <h1 className="text-2xl font-bold mb-4 text-black">Pomodoro Timer</h1>

      <div className="flex justify-center mb-6 space-x-2">
        {(['work', 'shortBreak', 'longBreak'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 border rounded uppercase text-sm font-bold transition ${
              mode === m
                ? 'bg-black text-white border-black'
                : 'text-black border-gray-400 hover:border-black'
            }`}
          >
            {m === 'work' ? 'Work' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      <div className="text-7xl font-bold mb-4 text-black">
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
      
      {/* Button to test audio */}
      <button 
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio play failed"));
          }
        }}
        className="mt-4 text-xs text-gray-500 underline"
      >
        Test Sound
      </button>
    </div>
  );
};

export default PomodoroTimer;
