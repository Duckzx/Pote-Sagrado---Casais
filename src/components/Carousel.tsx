import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import "./Carousel.css";
const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };
interface CarouselItemProps {
  item: any;
  index: number;
  itemWidth: number;
  round: boolean;
  trackItemOffset: number;
  x: any;
  transition: any;
}
function CarouselItem({
  item,
  index,
  itemWidth,
  round,
  transition,
}: CarouselItemProps) {
  return (
    <motion.div
      key={`${item?.id ?? index}-${index}`}
      className={`carousel-item ${round ? "round" : ""} relative`}
      style={{
        width: itemWidth,
        height: round ? itemWidth : "100%",
        ...(round && { borderRadius: "50%" }),
      }}
      transition={transition}
    >
      {" "}
      <div
        className="absolute inset-0 bg-gradient-to-tr from-black/[0.03] to-transparent pointer-events-none z-0"
      />{" "}
      {item.image && (
        <div className="absolute inset-0 z-0">
          {" "}
          <img
            src={item.image}
            alt="deposit"
            className="w-full h-full object-cover"
          />{" "}
          <div className="absolute inset-0 bg-gradient-to-t from-cookbook-bg/20 via-transparent to-transparent"></div>{" "}
        </div>
      )}{" "}
      {item.actionNode && (
        <div className="absolute top-2 right-2 z-20"> {item.actionNode} </div>
      )}{" "}
      <div
        className={`carousel-item-header z-10 w-full ${round ? "round" : ""}`}
      >
        {" "}
        <span
          className="carousel-icon-container inline-flex shadow-sm"
        >
          {" "}
          {item.icon}{" "}
        </span>{" "}
      </div>{" "}
      <div className="carousel-item-content z-10 w-full overflow-hidden">
        {" "}
        <div>
          {" "}
          <div className="carousel-item-title">{item.title}</div>{" "}
          <p className="carousel-item-description">{item.description}</p>{" "}
        </div>{" "}
      </div>{" "}
    </motion.div>
  );
}
interface CarouselProps {
  items: any[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
}
export default function Carousel({
  items = [],
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}: CarouselProps) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;
  const itemsForRender = useMemo(() => {
    if (!loop) return items;
    if (items.length === 0) return [];
    return [items[items.length - 1], ...items, items[0]];
  }, [items, loop]);
  const [position, setPosition] = useState(loop ? 1 : 0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);
  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1) return undefined;
    if (pauseOnHover && isHovered) return undefined;
    const timer = setInterval(() => {
      setPosition((prev) => Math.min(prev + 1, itemsForRender.length - 1));
    }, autoplayDelay);
    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length]);
  useEffect(() => {
    const startingPosition = loop ? 1 : 0;
    setPosition(startingPosition);
    x.set(-startingPosition * trackItemOffset);
  }, [items.length, loop, trackItemOffset, x]);
  useEffect(() => {
    if (!loop && position > itemsForRender.length - 1) {
      setPosition(Math.max(0, itemsForRender.length - 1));
    }
  }, [itemsForRender.length, loop, position]);
  const effectiveTransition: any = isJumping ? { duration: 0 } : SPRING_OPTIONS;
  const handleAnimationStart = () => {
    setIsAnimating(true);
  };
  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false);
      return;
    }
    const lastCloneIndex = itemsForRender.length - 1;
    if (position === lastCloneIndex) {
      setIsJumping(true);
      const target = 1;
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }
    if (position === 0) {
      setIsJumping(true);
      const target = items.length;
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }
    setIsAnimating(false);
  };
  const handleDragEnd = (_: any, info: any) => {
    const { offset, velocity } = info;
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0;
    if (direction === 0) return;
    setPosition((prev) => {
      const next = prev + direction;
      const max = itemsForRender.length - 1;
      return Math.max(0, Math.min(next, max));
    });
  };
  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0),
          right: 0,
        },
      };
  const activeIndex =
    items.length === 0
      ? 0
      : loop
        ? (position - 1 + items.length) % items.length
        : Math.min(position, items.length - 1);
  return (
    <div
      ref={containerRef}
      className={`carousel-container ${round ? "round" : ""}`}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px`, borderRadius: "50%" }),
      }}
    >
      {" "}
      <motion.div
        className="carousel-track"
        drag={isAnimating ? false : "x"}
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(position * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={handleAnimationStart}
        onAnimationComplete={handleAnimationComplete}
      >
        {" "}
        {itemsForRender.map((item, index) => (
          <CarouselItem
            key={`${item?.id ?? index}-${index}`}
            item={item}
            index={index}
            itemWidth={itemWidth}
            round={round}
            transition={effectiveTransition}
          />
        ))}{" "}
      </motion.div>{" "}
      <div className={`carousel-indicators-container ${round ? "round" : ""}`}>
        {" "}
        <div className="carousel-indicators">
          {" "}
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`carousel-indicator ${activeIndex === index ? "active" : "inactive"}`}
              animate={{ scale: activeIndex === index ? 1.2 : 1 }}
              onClick={() => setPosition(loop ? index + 1 : index)}
              transition={{ duration: 0.15 }}
            />
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
