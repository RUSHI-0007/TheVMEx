"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/config";

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[4rem] md:min-w-[5rem]">
      <span className="font-display text-3xl md:text-4xl text-gold tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs uppercase tracking-widest text-text-muted mt-1">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer() {
  const [time, setTime] = useState(getTimeLeft(EVENT.dateISO));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft(EVENT.dateISO));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (time.expired) {
    return (
      <p className="text-gold-muted font-display text-xl">The night is here</p>
    );
  }

  return (
    <div className="flex items-center gap-3 md:gap-6">
      <TimeBlock value={time.days} label="Days" />
      <span className="text-gold-muted text-2xl">:</span>
      <TimeBlock value={time.hours} label="Hours" />
      <span className="text-gold-muted text-2xl">:</span>
      <TimeBlock value={time.minutes} label="Mins" />
      <span className="text-gold-muted text-2xl">:</span>
      <TimeBlock value={time.seconds} label="Secs" />
    </div>
  );
}

export function OrderCountdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Expired");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <span className="font-display text-gold tabular-nums">{remaining}</span>
  );
}
