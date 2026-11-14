import { useEffect, useState } from "react";

export function useCountdown(endsAt: number | null): number {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (!endsAt) return 0;
    return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!endsAt) {
      setSecondsLeft(0);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [endsAt]);

  return secondsLeft;
}
