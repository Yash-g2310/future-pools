"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        fill="none"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_17_60)">
          <g filter="url(#filter0_f_17_60)">
            <path
              d="M128.6 0C128.6 0 199.6 0 199.6 102.5C199.6 205 128.6 205 128.6 205"
              stroke="url(#paint0_linear_17_60)"
              strokeWidth="2"
            />
            <motion.path
              d="M0 312.5C0 312.5 0 241.5 102.5 241.5C205 241.5 205 312.5 205 312.5"
              stroke="url(#paint1_linear_17_60)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
            />
            <motion.path
              d="M312.5 400C312.5 400 312.5 329 410 329C507.5 329 507.5 400 507.5 400"
              stroke="url(#paint2_linear_17_60)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_f_17_60"
            x="-50"
            y="-50"
            width="600"
            height="500"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="25"
              result="effect1_foregroundBlur_17_60"
            />
          </filter>
          <linearGradient
            id="paint0_linear_17_60"
            x1="128.6"
            y1="0"
            x2="128.6"
            y2="205"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#18CCFC" stopOpacity="0" />
            <stop offset="1" stopColor="#18CCFC" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_17_60"
            x1="0"
            y1="312.5"
            x2="205"
            y2="312.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#18CCFC" stopOpacity="0" />
            <stop offset="1" stopColor="#18CCFC" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_17_60"
            x1="312.5"
            y1="400"
            x2="507.5"
            y2="400"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#18CCFC" stopOpacity="0" />
            <stop offset="1" stopColor="#18CCFC" />
          </linearGradient>
          <clipPath id="clip0_17_60">
            <rect width="400" height="400" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};