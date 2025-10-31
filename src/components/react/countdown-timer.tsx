"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endTime: Date;
}

export function CountdownTimer({
  endTime,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) /
              (1000 * 60 * 60),
          ),
          minutes: Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60),
          ),
          seconds: Math.floor(
            (distance % (1000 * 60)) / 1000,
          ),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center space-x-1 text-xs text-red-600 font-medium">
      <span>ينتهي في:</span>
      <span className="bg-red-100 px-1 py-0.5 rounded">
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
