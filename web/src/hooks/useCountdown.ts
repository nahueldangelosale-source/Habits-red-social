import { useState, useEffect } from 'react';

type TickCallback = () => void;

class GlobalTicker {
  private subscribers: Set<TickCallback> = new Set();
  private intervalId: number | null = null;

  subscribe(callback: TickCallback) {
    this.subscribers.add(callback);
    if (this.subscribers.size === 1 && !this.intervalId) {
      this.start();
    }
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.stop();
      }
    };
  }

  private start() {
    this.intervalId = window.setInterval(() => {
      this.subscribers.forEach((cb) => cb());
    }, 1000);
  }

  private stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

const globalTicker = new GlobalTicker();

export function useCountdown(targetDateIso: string | null) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!targetDateIso) {
      setTimeLeft(0);
      return;
    }

    const targetTime = new Date(targetDateIso).getTime();

    const updateTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, targetTime - now);
      setTimeLeft(remaining);
    };

    // Initial update
    updateTime();

    // Subscribe to global ticker
    const unsubscribe = globalTicker.subscribe(updateTime);

    return () => unsubscribe();
  }, [targetDateIso]);

  return timeLeft;
}
