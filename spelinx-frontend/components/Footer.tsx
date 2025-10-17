'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Github, Twitter, Mail, Heart } from 'lucide-react'

const footerLinks = {
  games: [
    { name: 'Snake', href: '/games/snake' },
    { name: 'Tic Tac Toe', href: '/games/tictactoe' },
    { name: '2048', href: '/games/2048' },
    { name: 'Tetris', href: '/games/tetris' },
    { name: 'Crossword', href: '/games/crossword' },
    { name: 'Guess the Flag', href: '/games/guesstheflag' }
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Premium', href: '/premium' },
    { name: 'Store', href: '/store' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Settings', href: '/settings' },
    { name: 'Support', href: '/support' },
    { name: 'Privacy Policy', href: '/privacy' }
  ],
  social: [
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@spelinx.com' }
  ]
}

export default function Footer() {
  return (
    <footer className="bg-black/50 backdrop-blur-md border-t border-white/10">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-spelinx-primary to-spelinx-secondary bg-clip-text text-transparent mb-4">
              SPELINX
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Experience the ultimate gaming platform with premium features,
              stunning visuals, and endless entertainment.
            </p>
            <div className="flex space-x-4">
              {footerLinks.social.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-400 hover:text-spelinx-primary transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Games Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-semibold mb-4">Games</h3>
            <ul className="space-y-2">
              {footerLinks.games.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-spelinx-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-spelinx-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest news about new games and features.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white text-sm font-semibold transition-colors"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 SPELINX. All rights reserved.
          </div>
          <div className="flex items-center space-x-1 text-gray-400 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>for gamers worldwide</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}