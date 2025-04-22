// timerService.ts
let globalInterval: NodeJS.Timeout | null = null;
let notificationPermission: NotificationPermission = 'default';

// Request notification permission early
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return;
  
  notificationPermission = await Notification.requestPermission();
};

// Play sound and show notification
export const notifyTimerComplete = (title: string) => {
  // Play sound
  const audio = new Audio('/finished.mp3');
  
  // Play with user interaction fallback if needed
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.log('Audio play failed, will try again with user interaction');
      
      // We'll rely on the notification click to play audio if autoplay fails
      if (notificationPermission === 'granted') {
        const notification = new Notification(`${title} Timer Completed`, {
          body: 'Click to acknowledge and play sound',
          icon: '/favicon.ico'
        });
        
        notification.onclick = () => {
          audio.play();
          notification.close();
          window.focus();
        };
      }
    });
  }
  
  // Show notification regardless of audio success
  if (notificationPermission === 'granted') {
    const notification = new Notification(`${title} Timer Completed`, {
      body: 'Your timer has finished!',
      icon: '/favicon.ico'
    });
    
    notification.onclick = () => {
      notification.close();
      window.focus();
    };
  }
};

// Setup global timer that works across pages
export const setupGlobalTimer = (
  isRunning: boolean,
  startTimestamp: number | null,
  totalTime: number,
  onTick: (timeLeft: number) => void,
  onComplete: () => void
) => {
  // Clear any existing interval
  if (globalInterval) {
    clearInterval(globalInterval);
    globalInterval = null;
  }
  
  // If timer should be running, start it
  if (isRunning && startTimestamp) {
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      const remaining = Math.max(0, totalTime - elapsed);
      
      onTick(remaining);
      
      if (remaining <= 0) {
        clearInterval(globalInterval!);
        globalInterval = null;
        onComplete();
      }
    };
    
    // Run once immediately
    updateTimer();
    
    // Then set interval
    globalInterval = setInterval(updateTimer, 1000);
  }
};

export const clearGlobalTimer = () => {
  if (globalInterval) {
    clearInterval(globalInterval);
    globalInterval = null;
  }
};
