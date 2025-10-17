'use client'

import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark flex items-center justify-center z-50"
    >
      <div className="text-center">
        {/* SPELINX Logo Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
          className="mb-8"
        >
          <div className="relative">
            <motion.h1
              className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-spelinx-primary via-spelinx-secondary to-spelinx-accent bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ backgroundSize: "200% 200%" }}
            >
              SPELINX
            </motion.h1>

            {/* Animated rings around logo */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-spelinx-primary/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-spelinx-secondary/40"
              animate={{ scale: [1.1, 1.3, 1.1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-xl text-gray-300 mb-8"
        >
          Loading Premium Gaming Experience...
        </motion.p>

        {/* Loading Bar */}
        <div className="w-80 mx-auto">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center space-x-2 mt-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-spelinx-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-center"
        >
          <div className="glass rounded-xl p-6 max-w-md mx-auto">
            <motion.p
              key={Math.floor(Date.now() / 5000)} // Change every 5 seconds
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gray-300 text-sm"
            >
              {[
                "🎮 Did you know? SPELINX has 6 core games!",
                "👑 Premium members earn 2x more rewards!",
                "🏆 Weekly leaderboards reset every Monday!",
                "🎯 Daily spinning wheel available for premium users!",
                "🎨 Custom skins and themes for premium members!",
                "💰 Refer friends and earn commission on their purchases!"
              ][Math.floor(Date.now() / 5000) % 6]}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}