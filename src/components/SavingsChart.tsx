import React, { useRef, useEffect, useMemo, useState } from "react";
interface SavingsChartProps {
  deposits: any[];
  goalAmount: number;
}
export const SavingsChart: React.FC<SavingsChartProps> = ({
  deposits,
  goalAmount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
    date: string;
  } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  /* Build cumulative data points sorted by date */ const dataPoints =
    useMemo(() => {
      if (deposits.length === 0) return [];
      /* Sort deposits by date ascending */ const sorted = [...deposits]
        .filter((d) => d.createdAt?.toDate)
        .sort(
          (a, b) =>
            a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime(),
        );
      if (sorted.length === 0) return [];
      let cumulative = 0;
      const points: { date: Date; value: number; label: string }[] = [];
      /* Add starting zero point 1 day before first deposit */ const firstDate =
        sorted[0].createdAt.toDate();
      const startDate = new Date(firstDate);
      startDate.setDate(startDate.getDate() - 1);
      points.push({
        date: startDate,
        value: 0,
        label: startDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
      });
      sorted.forEach((d) => {
        if (d.type === "expense") {
          cumulative -= d.amount || 0;
        } else {
          cumulative += d.amount || 0;
        }
        const date = d.createdAt.toDate();
        points.push({
          date,
          value: cumulative,
          label: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
        });
      });
      return points;
    }, [deposits]);
  /* Resize observer */ useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  /* Draw chart */ useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dataPoints.length < 2 || dimensions.width === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = dimensions.width;
    const h = dimensions.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    /* Chart area with padding */ const padding = {
      top: 20,
      right: 16,
      bottom: 30,
      left: 50,
    };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    /* Get computed theme colors */ const styles = getComputedStyle(
      document.documentElement,
    );
    const primaryColor =
      styles.getPropertyValue("--theme-primary").trim() || "#8E7F6D";
    const textColor =
      styles.getPropertyValue("--theme-text").trim() || "#2C2A26";
    const borderColor =
      styles.getPropertyValue("--theme-border").trim() || "#E8E4D9";
    const goldColor =
      styles.getPropertyValue("--theme-gold").trim() || "#C5A059";
    /* Data ranges */ const values = dataPoints.map((p) => p.value);
    const maxVal = Math.max(...values, goalAmount || 0) * 1.1;
    const minVal = Math.min(0, ...values);
    const valRange = maxVal - minVal || 1;
    const timeStart = dataPoints[0].date.getTime();
    const timeEnd = dataPoints[dataPoints.length - 1].date.getTime();
    const timeRange = timeEnd - timeStart || 1;
    /* Map functions */ const mapX = (date: Date) =>
      padding.left + ((date.getTime() - timeStart) / timeRange) * chartW;
    const mapY = (val: number) =>
      padding.top + (1 - (val - minVal) / valRange) * chartH;
    /* Clear */ ctx.clearRect(0, 0, w, h);
    /* Grid lines */ ctx.strokeStyle = borderColor + "40";
    ctx.lineWidth = 0.5;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      /* Y axis label */ const val = maxVal - (i / gridLines) * valRange;
      ctx.fillStyle = textColor + "40";
      ctx.font = "9px Helvetica Neue, Arial, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      if (val >= 1000) {
        ctx.fillText(`${(val / 1000).toFixed(1)}k`, padding.left - 6, y);
      } else {
        ctx.fillText(val.toFixed(0), padding.left - 6, y);
      }
    }
    /* X axis labels (first and last) */ ctx.fillStyle = textColor + "40";
    ctx.font = "8px Helvetica Neue, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      dataPoints[0].label,
      mapX(dataPoints[0].date),
      h - padding.bottom + 8,
    );
    ctx.fillText(
      dataPoints[dataPoints.length - 1].label,
      mapX(dataPoints[dataPoints.length - 1].date),
      h - padding.bottom + 8,
    );
    /* Goal line */ if (goalAmount > 0) {
      const goalY = mapY(goalAmount);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = goldColor + "80";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, goalY);
      ctx.lineTo(w - padding.right, goalY);
      ctx.stroke();
      ctx.setLineDash([]);
      /* Goal label */ ctx.fillStyle = goldColor;
      ctx.font = "bold 8px Helvetica Neue, Arial, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText("META", w - padding.right, goalY - 4);
    }
    /* Area fill */ ctx.beginPath();
    ctx.moveTo(mapX(dataPoints[0].date), mapY(0));
    dataPoints.forEach((p) => {
      ctx.lineTo(mapX(p.date), mapY(p.value));
    });
    ctx.lineTo(mapX(dataPoints[dataPoints.length - 1].date), mapY(0));
    ctx.closePath();
    const gradient = ctx.createLinearGradient(
      0,
      padding.top,
      0,
      h - padding.bottom,
    );
    gradient.addColorStop(0, primaryColor + "30");
    gradient.addColorStop(1, primaryColor + "05");
    ctx.fillStyle = gradient;
    ctx.fill();
    /* Line */ ctx.beginPath();
    dataPoints.forEach((p, i) => {
      const x = mapX(p.date);
      const y = mapY(p.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    /* Data points (dots) */ dataPoints.forEach((p, i) => {
      if (i === 0) return;
      /* skip the zero anchor */ const x = mapX(p.date);
      const y = mapY(p.value);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    /* Last point highlighted */ if (dataPoints.length > 1) {
      const last = dataPoints[dataPoints.length - 1];
      const x = mapX(last.date);
      const y = mapY(last.value);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = primaryColor;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [dataPoints, goalAmount, dimensions]);
  /* Touch/mouse interaction for tooltip */ const handleInteraction = (
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    if (!canvasRef.current || dataPoints.length < 2) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const padding = { left: 50, right: 16 };
    const chartW = dimensions.width - padding.left - padding.right;
    const timeStart = dataPoints[0].date.getTime();
    const timeEnd = dataPoints[dataPoints.length - 1].date.getTime();
    const timeRange = timeEnd - timeStart || 1;
    const time = timeStart + ((x - padding.left) / chartW) * timeRange;
    /* Find closest point */ let closest = dataPoints[0];
    let closestDist = Infinity;
    dataPoints.forEach((p) => {
      const dist = Math.abs(p.date.getTime() - time);
      if (dist < closestDist) {
        closestDist = dist;
        closest = p;
      }
    });
    setTooltip({
      x: x,
      y: 20,
      value: closest.value,
      date: closest.date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      }),
    });
  };
  if (dataPoints.length < 2) {
    return (
      <div className="bg-cookbook-bg backdrop-blur-2xl border-2 border-dashed border-cookbook-border rounded-3xl p-6 text-center">
        {" "}
        <span className="text-3xl block mb-2 opacity-50">📊</span>{" "}
        <p className="font-serif italic text-sm text-cookbook-text/60">
          {" "}
          O gráfico aparecerá após 2+ movimentações{" "}
        </p>{" "}
      </div>
    );
  }
  const formatCurrency = (val: number) =>
    Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      val,
    );
  return (
    <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
      {" "}
      <div className="flex items-center justify-between">
        {" "}
        <div className="flex items-center gap-2">
          {" "}
          <div className="w-6 h-6 rounded-full bg-cookbook-primary/10 flex items-center justify-center">
            {" "}
            <span className="text-xs">📈</span>{" "}
          </div>{" "}
          <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/50 font-bold">
            {" "}
            Evolução{" "}
          </span>{" "}
        </div>{" "}
        <span className="font-serif text-xs text-cookbook-primary font-medium">
          {" "}
          {formatCurrency(dataPoints[dataPoints.length - 1]?.value || 0)}{" "}
        </span>{" "}
      </div>{" "}
      <div ref={containerRef} className="relative w-full h-40">
        {" "}
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          style={{ width: "100%", height: "100%" }}
          onMouseMove={handleInteraction}
          onTouchMove={handleInteraction}
          onMouseLeave={() => setTooltip(null)}
          onTouchEnd={() => setTooltip(null)}
        />{" "}
        {/* Tooltip */}{" "}
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-cookbook-text text-white px-2.5 py-1.5 rounded-lg shadow-lg text-center z-10 transition-transform"
            style={{
              left: `${Math.min(Math.max(tooltip.x, 40), dimensions.width - 60)}px`,
              top: `${tooltip.y}px`,
              transform: "translateX(-50%)",
            }}
          >
            {" "}
            <div className="font-serif text-xs font-medium">
              {" "}
              {formatCurrency(tooltip.value)}{" "}
            </div>{" "}
            <div className="font-sans text-[7px] uppercase tracking-widest opacity-60">
              {" "}
              {tooltip.date}{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};
