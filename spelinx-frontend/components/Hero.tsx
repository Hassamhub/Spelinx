'use client'

import { motion } from 'framer-motion'
import { Play, Star, Users, Trophy, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-24">
      {/* Enhanced Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-spelinx-dark via-spelinx-gray/50 to-spelinx-dark">
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        {/* Animated floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-spelinx-primary/30 to-spelinx-secondary/30 rounded-full blur-3xl animate-float particle-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-spelinx-accent/25 to-spelinx-primary/25 rounded-full blur-3xl animate-float particle-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-gradient-to-r from-spelinx-secondary/30 to-spelinx-accent/30 rounded-full blur-3xl animate-float particle-float" style={{ animationDelay: '2s' }}></div>

        {/* Additional floating particles */}
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-spelinx-primary/20 rounded-full blur-xl bounce-gentle"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-spelinx-accent/25 rounded-full blur-xl bounce-gentle" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="container mx-auto text-center relative z-10 max-w-6xl">
        {/* SPELINX Logo */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-black mb-6 text-center">
            <span className="bg-gradient-to-r from-spelinx-primary via-spelinx-secondary to-spelinx-accent bg-clip-text text-transparent">
              SPELINX
            </span>
          </h1>
        </div>

        {/* Tagline */}
        <div className="mb-12">
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">Play. Progress. Prevail.</span>
          </h2>

          {/* Subtitle */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-spelinx-primary/20 to-spelinx-secondary/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <div className="w-2 h-2 bg-spelinx-accent rounded-full"></div>
              <span className="text-spelinx-accent font-semibold tracking-wider">PREMIUM GAMING PLATFORM</span>
              <div className="w-2 h-2 bg-spelinx-primary rounded-full"></div>
            </div>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed text-center">
            Dive into the most <span className="text-gradient font-bold">immersive gaming experience</span> ever created.
            With cutting-edge visuals, premium features, and endless entertainment.
            Join <span className="text-spelinx-accent font-bold">millions of players</span> worldwide in the ultimate gaming revolution.
          </p>

          {/* Premium Badge */}
          <div className="flex justify-center mt-8">
            <div className="glass-premium rounded-full px-8 py-4 border-2 border-spelinx-primary/50">
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-spelinx-accent" />
                <span className="text-white font-bold text-lg">SPELINX PLUS EXCLUSIVE</span>
                <Crown className="w-6 h-6 text-spelinx-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center space-x-8 mb-12">
          <div className="glass rounded-lg px-6 py-4">
            <Users className="w-8 h-8 text-spelinx-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">10K+</div>
            <div className="text-sm text-gray-400">Active Players</div>
          </div>
          <div className="glass rounded-lg px-6 py-4">
            <Trophy className="w-8 h-8 text-spelinx-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-sm text-gray-400">Games</div>
          </div>
          <div className="glass rounded-lg px-6 py-4">
            <Star className="w-8 h-8 text-spelinx-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">4.9</div>
            <div className="text-sm text-gray-400">Rating</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button
            variant="gradient"
            size="xl"
            className="glow-premium"
            onClick={() => window.location.href = '/games'}
          >
            <Play className="w-6 h-6 mr-3" />
            Play Now
          </Button>

          <Button
            variant="glass"
            size="xl"
            className="hover:glow-effect transition-all duration-300"
            onClick={() => window.location.href = '/about'}
          >
            Learn More
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </section>
  )
}