"use client";

import React from "react";
import { motion } from "framer-motion";

type TextAnimationProps = {
  children: React.ReactNode;
  divideBy?: "word" | "character" | "line";
  delay?: number;
  className?: string;
};

export default function TextAnimation({
  children,
  divideBy = "word",
  delay = 0.1,
  className = "",
}: TextAnimationProps) {
  const text = String(children);

  const parts =
    divideBy === "character"
      ? Array.from(text)
      : divideBy === "line"
        ? text.split("\n")
        : text.split(/\s+/);

  return (
    <span
      className={`inline ${className}`}
      aria-label={text}
    >
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          <motion.span
            initial={{
              opacity: 0,
              y: 18,
              filter: "blur(6px)",
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.55,
              delay: index * delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {part}
          </motion.span>

          {divideBy === "word" && (
            <span
              className="inline-block"
              aria-hidden="true"
            >
              &nbsp;
            </span>
          )}

          {divideBy === "line" &&
            index < parts.length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  );
}