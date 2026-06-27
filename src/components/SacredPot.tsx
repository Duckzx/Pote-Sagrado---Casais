import React, { useEffect, useState, useRef } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import { formatBRL } from "../lib/maskUtils";
import confetti from "canvas-confetti";
import "./SacredPot.css";
import { GoalType } from "../types";
import { GOAL_CATEGORIES } from "../data/goalCategories";
interface SacredPotProps {
  totalSaved: number;
  goalAmount: number;
  achievements?: any[];
  isBreaking?: boolean;
  isBroken?: boolean;
  goalType?: GoalType;
}
export const SacredPot: React.FC<SacredPotProps> = ({
  totalSaved,
  goalAmount,
  achievements = [],
  isBreaking = false,
  isBroken = false,
  goalType,
}) => {
  const currentCategory = GOAL_CATEGORIES.find(c => c.id === goalType) || GOAL_CATEGORIES[0];
  const Icon = currentCategory.icon;
  const [fillHeight, setFillHeight] = useState(0);
  /* Cap visual fill at 95% to prevent the wave animation from spilling out of the top of the CSS pot */ const calculatedPct =
    goalAmount > 0 ? (totalSaved / goalAmount) * 100 : 0;
  const targetProgress = Math.min(95, Math.max(0, calculatedPct));
  const isGoalReached = totalSaved >= goalAmount && goalAmount > 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (isBroken) {
      setFillHeight(0);
      return;
    }
    const timer = setTimeout(() => {
      setFillHeight(targetProgress);
    }, 150);
    return () => clearTimeout(timer);
  }, [targetProgress, isBroken]);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const [isPulsing, setIsPulsing] = useState(false);
  const prevTotalRef = useRef(totalSaved);

  useEffect(() => {
    if (totalSaved > prevTotalRef.current && !isBroken && !isBreaking) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 600);
      prevTotalRef.current = totalSaved;
      return () => clearTimeout(timer);
    }
    prevTotalRef.current = totalSaved;
  }, [totalSaved, isBroken, isBreaking]);

  /* Trigger light confetti if goal reached (transition only) */ 
  useEffect(() => {
    if (isGoalReached && !isBreaking && !isBroken && canvasRef.current && !hasCelebrated) {
      setHasCelebrated(true);
      const customConfetti = confetti.create(canvasRef.current, {
        resize: false,
        useWorker: false,
      });
      
      customConfetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: ["#FFD700", "#FDB931", "#FF8C00", "#FFF8DC"],
        disableForReducedMotion: true,
        ticks: 200,
        gravity: 0.8,
        scalar: 0.8,
        zIndex: 10,
      });
      
      setTimeout(() => customConfetti.reset(), 5000);
    }
  }, [isGoalReached, isBreaking, isBroken, hasCelebrated]);
  return (
    <div className="sacred-pot-container relative">
      <div className="sr-only">
        <h2>Progresso da Economia</h2>
        <table>
          <caption>Dados de progresso financeiro</caption>
          <tbody>
            <tr>
              <th scope="row">Meta</th>
              <td>{formatBRL(goalAmount)}</td>
            </tr>
            <tr>
              <th scope="row">Valor Guardado</th>
              <td>{formatBRL(totalSaved)}</td>
            </tr>
            <tr>
              <th scope="row">Progresso</th>
              <td>{calculatedPct.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      {" "}
      {/* Background Glow when Goal Reached */}{" "}
      {isGoalReached && !isBroken && (
        <div className="absolute inset-x-0 -inset-y-10 z-0 bg-cookbook-gold/20 blur-3xl rounded-full scale-110 animate-pulse-slow"></div>
      )}{" "}
      {/* Local Confetti Canvas */}{" "}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-50 scale-150"
      />{" "}
      <div
        className={`sacred-pot relative z-10 transition-transform duration-300 ${isBreaking && !isBroken ? "scale-105 rotate-1" : ""} ${isPulsing ? "scale-110" : ""} ${!isBreaking && !isBroken && !isPulsing ? "animate-float" : ""}`}
      >
        {" "}
        {/* Visual Identity Logo/Sticker */}
        <div
          className={`absolute -left-6 top-8 z-20 bg-[#1A1A1C] text-white px-3 py-1 rounded-full shadow-lg border border-white/10 rotate-[-12deg] pointer-events-none transition-opacity ${isBroken ? "opacity-0" : "opacity-100"}`}
        >
          <span className="font-serif italic text-sm font-bold tracking-wider">
            Pote Sagrado
          </span>
        </div>
        {/* Goal Specific Sticker */}
        {!isBroken && (
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[5] text-cookbook-primary/20 opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none`}
          >
            <Icon size={48} strokeWidth={1.5} />
          </div>
        )}
        {/* Dynamic Achievements Badges */}{" "}
        {achievements.length > 0 && (
          <div
            className={`absolute -right-4 top-16 z-20 bg-cookbook-gold text-white px-3 py-1.5 rounded-2xl shadow-lg rotate-[8deg] flex items-center space-x-1 border border-white/20 transition-opacity ${isBroken ? "opacity-0" : "opacity-100"}`}
          >
            {" "}
            <span className="text-xs">🏆</span>{" "}
            <span className="font-sans text-[10px] uppercase tracking-widest font-bold">
              {" "}
              {achievements.length}x Cheios{" "}
            </span>{" "}
          </div>
        )}{" "}
        {/* Glass cracking overlay (appears when isBreaking but not completely broken) */}{" "}
        {isBreaking && !isBroken && (
          <div
            className="absolute inset-x-0 inset-y-10 z-[15] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, transparent 60%)",
            }}
          >
            {" "}
            <svg
              viewBox="0 0 100 120"
              className="w-full h-full opacity-80"
              preserveAspectRatio="none"
            >
              {" "}
              <path
                d="M50 0 L45 30 L60 50 L40 70 L55 90 L48 120"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset="0"
              >
                {" "}
                <animate
                  attributeName="stroke-dashoffset"
                  from="100"
                  to="0"
                  dur="0.2s"
                  fill="freeze"
                />{" "}
              </path>{" "}
              <path
                d="M45 30 L20 40 M60 50 L80 45 M40 70 L15 80"
                stroke="white"
                strokeWidth="1"
                fill="none"
                strokeDasharray="50"
                strokeDashoffset="0"
              >
                {" "}
                <animate
                  attributeName="stroke-dashoffset"
                  from="50"
                  to="0"
                  dur="0.2s"
                  begin="0.1s"
                  fill="freeze"
                />{" "}
              </path>{" "}
            </svg>{" "}
          </div>
        )}{" "}
        <div
          className={`pot-lid transition-opacity duration-300 ${isBroken ? "opacity-0 -translate-y-20" : "opacity-100"}`}
        ></div>{" "}
        <div
          className={`pot-glass transition-all duration-300 ${isBroken ? "opacity-0 scale-125" : "opacity-100 scale-100"}`}
        >
          {" "}
          <div className="absolute inset-0 overflow-hidden rounded-t-[10px] rounded-b-[80px]">
            {" "}
            <div
              className="pot-liquid transition-all duration-1000"
              style={{ height: `${fillHeight}%`, opacity: isBroken ? 0 : 1 }}
            />{" "}
          </div>{" "}
        </div>{" "}
        <div
          className={`pot-label transition-opacity duration-300 ${isBroken ? "opacity-0" : "opacity-100"}`}
        >
          {" "}
          <div className="font-serif text-[42px] leading-none font-bold text-cookbook-primary tracking-tight">
            {" "}
            <AnimatedNumber value={totalSaved} />{" "}
          </div>{" "}
          <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-cookbook-primary/80 mt-2 font-bold bg-cookbook-primary/10 inline-block px-3 py-1 rounded-full">
            {" "}
            de {formatBRL(goalAmount)}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
