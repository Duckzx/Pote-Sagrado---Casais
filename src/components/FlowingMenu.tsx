import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import "./FlowingMenu.css";
interface FlowingMenuProps {
  items?: { link: string; text: string; image: string }[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
}
function FlowingMenu({
  items = [],
  speed = 15,
  textColor = "#8E7F6D",
  bgColor = "transparent",
  marqueeBgColor = "#8E7F6D",
  marqueeTextColor = "#FFF",
  borderColor = "#E8E4D9",
}: FlowingMenuProps) {
  return (
    <div className="menu-wrap" style={{ backgroundColor: bgColor }}>
      {" "}
      <nav className="menu">
        {" "}
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
          />
        ))}{" "}
      </nav>{" "}
    </div>
  );
}
function MenuItem({
  link,
  text,
  image,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
}: any) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);
  const [repetitions, setRepetitions] = useState(4);
  const animationDefaults = { duration: 0.6, ease: "expo" };
  const findClosestEdge = (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number,
  ) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };
  const distMetric = (x: number, y: number, x2: number, y2: number) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };
  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector(
        ".marquee__part",
      ) as HTMLElement;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };
    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [text, image]);
  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector(
        ".marquee__part",
      ) as HTMLElement;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;
      if (animationRef.current) {
        animationRef.current.kill();
      }
      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };
    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, image, repetitions, speed]);
  const handleMouseEnter = (ev: React.MouseEvent) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);
    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };
  const handleMouseLeave = (ev: React.MouseEvent) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);
    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };
  return (
    <div className="menu__item bg-white" ref={itemRef} style={{ borderColor }}>
      {" "}
      <a
        className="menu__item-link font-serif"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ color: textColor }}
      >
        {" "}
        <span
          style={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
          }}
        >
          {" "}
          {text}{" "}
        </span>{" "}
      </a>{" "}
      <div
        className="marquee"
        ref={marqueeRef}
        style={{ backgroundColor: marqueeBgColor }}
      >
        {" "}
        <div className="marquee__inner-wrap">
          {" "}
          <div
            className="marquee__inner"
            ref={marqueeInnerRef}
            aria-hidden="true"
          >
            {" "}
            {[...Array(repetitions)].map((_, idx) => (
              <div
                className="marquee__part"
                key={idx}
                style={{ color: marqueeTextColor }}
              >
                {" "}
                <span className="font-serif">{text}</span>{" "}
                <div
                  className="marquee__img"
                  style={{ backgroundImage: `url(${image})` }}
                />{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
export default FlowingMenu;
