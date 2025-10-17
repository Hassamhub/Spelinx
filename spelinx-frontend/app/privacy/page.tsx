'use client'

import { motion } from 'framer-motion'
import { Shield, Eye, Lock, FileText, Users } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function PrivacyPage() {
  const sections = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your username, email address, and payment information."
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Information Sharing",
      content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with trusted service providers who assist us in operating our website and conducting our business."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Data Retention",
      content: "We retain personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information. You may also request that we stop processing your information in certain circumstances. To exercise these rights, please contact us."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark">
      <Header isDarkMode={true} setIsDarkMode={() => {}} />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-16 h-16 bg-spelinx-primary rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Privacy Policy
              </h1>

              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
              </p>

              <div className="text-sm text-gray-400 mt-4">
                Last updated: October 15, 2025
              </div>
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="glass rounded-2xl p-8"
                >
                  <div className="flex items-center mb-4">
                    <div className="text-spelinx-primary mr-4">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {section.title}
                    </h2>
                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="glass rounded-2xl p-8 mt-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Contact Us
              </h2>

              <p className="text-gray-300 mb-6">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>

              <div className="space-y-2 text-gray-300">
                <p><strong>Email:</strong> privacy@spelinx.com</p>
                <p><strong>Support:</strong> support@spelinx.com</p>
                <p><strong>Address:</strong> SPELINX Gaming Platform, Privacy Department</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-center mt-12"
            >
              <div className="inline-flex items-center space-x-2 bg-spelinx-primary/20 backdrop-blur-sm rounded-full px-6 py-3 border border-spelinx-primary/30">
                <Shield className="w-5 h-5 text-spelinx-primary" />
                <span className="text-spelinx-primary font-semibold">Your privacy is our priority</span>
                <Shield className="w-5 h-5 text-spelinx-primary" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}