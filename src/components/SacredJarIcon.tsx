import React from "react";
export const SacredJarIcon = ({ className = "w-24 h-24 mx-auto" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 512 512"
      fill="none"
    >
      {" "}
      {/* Background circle */}{" "}
      <circle
        cx="256"
        cy="256"
        r="256"
        fill="var(--theme-primary)"
        opacity="0.05"
      />{" "}
      <circle
        cx="256"
        cy="256"
        r="240"
        fill="var(--theme-primary)"
        opacity="0.05"
        stroke="var(--theme-border)"
        strokeWidth="2"
      />{" "}
      {/* Pot body */}{" "}
      <path
        d="M160 240 C160 240 145 360 155 380 C165 400 200 420 256 420 C312 420 347 400 357 380 C367 360 352 240 352 240"
        fill="var(--theme-gold)"
        opacity="0.1"
        stroke="var(--theme-primary)"
        strokeWidth="8"
        strokeLinecap="round"
      />{" "}
      {/* Pot rim */}{" "}
      <ellipse
        cx="256"
        cy="240"
        rx="100"
        ry="20"
        fill="var(--theme-bg)"
        stroke="var(--theme-primary)"
        strokeWidth="6"
      />{" "}
      {/* Pot lid */}{" "}
      <path
        d="M170 240 C170 220 200 200 256 200 C312 200 342 220 342 240"
        fill="none"
        stroke="var(--theme-primary)"
        strokeWidth="6"
        strokeLinecap="round"
      />{" "}
      {/* Lid handle */}{" "}
      <circle
        cx="256"
        cy="195"
        r="12"
        fill="var(--theme-gold)"
        stroke="var(--theme-primary)"
        strokeWidth="4"
      />{" "}
      {/* Heart */}{" "}
      <path
        d="M236 300 C236 285 220 275 220 290 C220 305 236 318 236 318 C236 318 252 305 252 290 C252 275 236 285 236 300Z"
        fill="var(--theme-primary)"
        opacity="0.9"
      />{" "}
      <path
        d="M268 295 C268 280 252 270 252 285 C252 300 268 313 268 313 C268 313 284 300 284 285 C284 270 268 280 268 295Z"
        fill="var(--theme-gold)"
        opacity="0.8"
      />{" "}
      {/* Small Floating Hearts (replacing sparkles) */}{" "}
      <path
        d="M190 170 C190 162 182 157 182 165 C182 173 190 180 190 180 C190 180 198 173 198 165 C198 157 190 162 190 170Z"
        fill="var(--theme-primary)"
        opacity="0.7"
      />{" "}
      <path
        d="M320 180 C320 174 314 170 314 176 C314 182 320 188 320 188 C320 188 326 182 326 176 C326 170 320 174 320 180Z"
        fill="var(--theme-gold)"
        opacity="0.6"
      />{" "}
      <path
        d="M210 140 C210 134 204 130 204 136 C204 142 210 148 210 148 C210 148 216 142 216 136 C216 130 210 134 210 140Z"
        fill="var(--theme-primary)"
        opacity="0.8"
      />{" "}
      <path
        d="M300 145 C300 137 292 132 292 140 C292 148 300 155 300 155 C300 155 308 148 308 140 C308 132 300 137 300 145Z"
        fill="var(--theme-gold)"
        opacity="0.7"
      />{" "}
    </svg>
  );
};
