"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const steps = [
  {
    id: 1,
    title: "食事の写真を送る",
    description:
      "専用のカスタムGeminiに食事の写真を送ると、AIが自動で栄養情報を分析します。",
    image: "/images/1-photo-analysis.webp",
  },
  {
    id: 2,
    title: "JSONをコピー",
    description:
      "Geminiが出力した栄養情報（JSON形式）をクリップボードにコピーします。",
    image: "/images/2-json-copy.webp",
  },
  {
    id: 3,
    title: "貼り付けて記録",
    description:
      "このサイトの記録ページにJSONを貼り付け、ボタンを押すだけでFitbitに記録が完了します。",
    image: "/images/3-fitbit-log.webp",
  },
];

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function HowItWorksCarousel() {
  const [[page, direction], setPage] = useState([0, 0]);

  // We only have 3 steps, so we mod the page to get the index
  const imageIndex = ((page % steps.length) + steps.length) % steps.length;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [page]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-10 text-white">
        How It Works
      </h2>

      <div className="relative h-[600px] md:h-[450px] w-full overflow-hidden flex flex-col items-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute w-full h-full flex flex-col md:flex-row items-center justify-center bg-gray-800 rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
          >
            {/* Image Section */}
            <div className="relative w-full md:w-1/2 h-1/2 md:h-full bg-gray-900">
              <Image
                src={steps[imageIndex].image}
                alt={steps[imageIndex].title}
                fill
                className="object-contain p-4"
                draggable={false}
              />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-center text-left bg-gray-800 z-10">
              <div className="text-5xl font-bold text-gray-700 mb-4 select-none">
                0{steps[imageIndex].id}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {steps[imageIndex].title}
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {steps[imageIndex].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Indicators */}
      <div className="flex justify-center mt-8 gap-3">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => {
              const diff = index - imageIndex;
              if (diff !== 0) {
                 setPage([page + (index - imageIndex), index > imageIndex ? 1 : -1]);
              }
            }}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === imageIndex
                ? "w-8 bg-blue-500"
                : "w-3 bg-gray-600 hover:bg-gray-500"
            }`}
            aria-label={`Go to step ${step.id}`}
          />
        ))}
      </div>
    </div>
  );
}
