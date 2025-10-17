'use client'

import { motion } from 'framer-motion'
import { Users, Target, Award, Heart, Zap, Shield } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const stats = [
  { icon: Users, value: '10K+', label: 'Active Players', color: 'text-blue-400' },
  { icon: Target, value: '50+', label: 'Games Available', color: 'text-green-400' },
  { icon: Award, value: '4.9', label: 'Average Rating', color: 'text-yellow-400' },
  { icon: Zap, value: '99.9%', label: 'Uptime', color: 'text-purple-400' }
]

const values = [
  {
    icon: Heart,
    title: 'Passion for Gaming',
    description: 'We believe gaming should be fun, accessible, and rewarding for everyone.'
  },
  {
    icon: Shield,
    title: 'Fair & Secure',
    description: 'Your privacy and fair play are our top priorities with enterprise-grade security.'
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Building a welcoming community where players can connect and compete.'
  },
  {
    icon: Target,
    title: 'Innovation',
    description: 'Constantly pushing boundaries with new games, features, and technologies.'
  }
]

const team = [
  {
    name: 'Alex Chen',
    role: 'CEO & Founder',
    avatar: '👨‍💼',
    bio: 'Former game developer with 10+ years of experience in the gaming industry.'
  },
  {
    name: 'Sarah Johnson',
    role: 'Head of Design',
    avatar: '👩‍🎨',
    bio: 'Award-winning UI/UX designer passionate about creating immersive experiences.'
  },
  {
    name: 'Mike Rodriguez',
    role: 'Lead Developer',
    avatar: '👨‍💻',
    bio: 'Full-stack developer specializing in real-time gaming applications.'
  },
  {
    name: 'Emma Davis',
    role: 'Community Manager',
    avatar: '👩‍💼',
    bio: 'Ensuring our community has the best experience and feedback is heard.'
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark">
      <Header isDarkMode={true} setIsDarkMode={() => {}} />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-spelinx-primary via-spelinx-secondary to-spelinx-accent bg-clip-text text-transparent">
                About SPELINX
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to create the ultimate gaming platform that combines
              cutting-edge technology with unparalleled user experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 text-center"
              >
                <stat.icon className={`w-8 h-8 mx-auto mb-4 ${stat.color}`} />
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  SPELINX was born from a simple idea: gaming should be more than just entertainment.
                  It should be an experience that brings people together, challenges their minds,
                  and rewards their dedication.
                </p>
                <p>
                  Founded in 2024, we've grown from a small team of passionate gamers to a
                  leading gaming platform serving thousands of players worldwide. Our commitment
                  to quality, fairness, and innovation drives everything we do.
                </p>
                <p>
                  Today, SPELINX offers a diverse collection of premium games, from classic
                  puzzles to modern challenges, all enhanced with cutting-edge features like
                  premium memberships, daily rewards, and competitive leaderboards.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-gray-300 leading-relaxed">
                  To create the most engaging and rewarding gaming platform that celebrates
                  skill, strategy, and community. We believe in fair play, continuous improvement,
                  and putting our players first.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The principles that guide our decisions and shape our platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="glass rounded-xl p-6 text-center group hover:glow-effect transition-all duration-300"
              >
                <value.icon className="w-8 h-8 text-spelinx-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-spelinx-primary transition-colors">
                  {value.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The passionate individuals behind SPELINX
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">{member.avatar}</div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <div className="text-spelinx-primary font-semibold mb-4">{member.role}</div>
                <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-12 max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Join the SPELINX Community</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Ready to experience gaming like never before? Join thousands of players
              who have already discovered the joy of SPELINX.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="gradient-border group"
            >
              <div className="px-8 py-4 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-[10px] flex items-center justify-center space-x-2">
                <span className="text-white font-semibold">Get Started Today</span>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
