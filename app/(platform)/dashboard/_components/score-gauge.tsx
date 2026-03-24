"use client";

import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  maxScore: number;
  label: string;
  size?: number;
}

export function ScoreGauge({ score, maxScore, label, size = 180 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc from 225° to -45° (270° sweep)
  const sweepAngle = 270;
  const arcLength = (sweepAngle / 360) * circumference;
  const filledLength = (animatedScore / 100) * arcLength;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Color based on score
  const getColor = (pct: number) => {
    if (pct >= 70) return "hsl(var(--primary))";
    if (pct >= 40) return "hsl(45, 93%, 47%)";
    return "hsl(0, 72%, 51%)";
  };

  const center = size / 2;
  const startAngle = 135; // degrees (bottom-left)

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-0">
          {/* Background arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted) / 0.2)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
          />
          {/* Filled arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={getColor(animatedScore)}
            strokeWidth={strokeWidth}
            strokeDasharray={`${filledLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
            style={{
              transition: "stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease",
              filter: `drop-shadow(0 0 8px ${getColor(animatedScore)})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-headline font-black text-4xl tabular-nums"
            style={{ color: getColor(animatedScore) }}
          >
            {score}
          </span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            / {maxScore}
          </span>
        </div>
      </div>
      <p className="text-xs font-headline font-bold text-muted-foreground mt-1 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}
