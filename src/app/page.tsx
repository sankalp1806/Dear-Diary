'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';

const greetings = [
  "What's on your Mind Today?",
  'How are you feeling Today?',
  "I'm all ears.. Tell me your today's secret.",
];

const characters = ['✍️', '🧘', '🤗', '🤔', '😌'];

export default function Landing() {
  const router = useRouter();
  const y = useMotionValue(0);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [dragConstraints, setDragConstraints] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    // This effect should only run on the client
    if (typeof window !== 'undefined') {
        setDragConstraints({ top: -window.innerHeight, bottom: 0 });
    }

    const greetingInterval = setInterval(() => {
      setGreetingIndex((prevIndex) => (prevIndex + 1) % greetings.length);
    }, 4000);

    const characterInterval = setInterval(() => {
      setCharacterIndex((prevIndex) => (prevIndex + 1) % characters.length);
    }, 3000);

    return () => {
      clearInterval(greetingInterval);
      clearInterval(characterInterval);
    };
  }, []);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y < -50) {
      router.push('/new-entry');
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-200 to-blue-200">
      <motion.div
        className="h-full w-full absolute top-0 left-0 cursor-grab flex flex-col items-center justify-center text-center"
        style={{ y }}
        drag="y"
        dragConstraints={dragConstraints}
        dragElastic={{ top: 0.1, bottom: 1 }}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {/* Animated Title */}
          <div className="h-24 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={greetingIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                className="text-3xl font-bold text-gray-800/80 px-4"
              >
                {greetings[greetingIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Animated Character */}
          <motion.div
            className="my-12"
            animate={{
              y: [0, -15, 0, 15, 0],
              scale: [1, 1.05, 1, 0.95, 1],
              rotate: [0, 3, -3, 3, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={characterIndex}
                className="text-8xl"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                {characters[characterIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Swipe Up Indicator */}
          <motion.div
            className="flex flex-col items-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-1 bg-gray-600/30 rounded-full animate-bounce h-5 mb-2"></div>
            <p className="text-gray-600/70 font-medium">
              Swipe up to Start Writing
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
