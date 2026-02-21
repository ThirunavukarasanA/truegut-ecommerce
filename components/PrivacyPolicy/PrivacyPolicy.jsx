"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Home/Navbar";
import MobileBottomNav from "@/components/Home/MobileBottomNav";
import Footer from "@/components/Home/Footer";
import {
  FaChevronDown,
  FaShieldAlt,
  FaLock,
  FaUserShield,
  FaCookieBite,
  FaEnvelope,
} from "react-icons/fa";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" },
  }),
};

const sections = [
  {
    icon: FaUserShield,
    title: "Information We Collect",
    content: [
      {
        subtitle: "Personal Information",
        text: "When you place an order or create an account, we collect information such as your name, email address, phone number, shipping address, and billing details. This information is essential to process your orders and provide you with a seamless shopping experience.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect certain information when you visit our website, including your IP address, browser type, pages visited, time spent on pages, and referring URLs. This data helps us understand how you use our site and improve your experience.",
      },
      {
        subtitle: "Device Information",
        text: "We may collect information about the device you use to access our website, including hardware model, operating system, unique device identifiers, and mobile network information.",
      },
    ],
  },
  {
    icon: FaLock,
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "Order Processing",
        text: "We use your personal information to process and fulfill your orders, send order confirmations, tracking updates, and handle returns or refunds. Your information is essential to deliver TrueGut products to your door.",
      },
      {
        subtitle: "Communication",
        text: "With your consent, we may send you newsletters, promotional offers, and updates about new fermented products, health tips, and special discounts. You can opt out of marketing communications at any time.",
      },
      {
        subtitle: "Service Improvement",
        text: "We analyze usage patterns to improve our website functionality, product offerings, and customer service. Your feedback and browsing behavior help us make TrueGut a better experience for everyone.",
      },
      {
        subtitle: "Legal Compliance",
        text: "We may use your information to comply with applicable laws, regulations, and legal processes, and to protect the rights, property, and safety of TrueGut, our customers, and others.",
      },
    ],
  },
  {
    icon: FaShieldAlt,
    title: "How We Protect Your Data",
    content: [
      {
        subtitle: "Security Measures",
        text: "We implement industry-standard security measures including SSL encryption, secure payment gateways, and regular security audits to protect your personal information from unauthorized access, disclosure, alteration, or destruction.",
      },
      {
        subtitle: "Payment Security",
        text: "All payment transactions are encrypted and processed through PCI-DSS compliant payment processors. We do not store your full credit card details on our servers.",
      },
      {
        subtitle: "Access Controls",
        text: "Access to your personal information is restricted to authorized employees who need it to provide services to you. We regularly review our data access policies and practices.",
      },
    ],
  },
  {
    icon: FaCookieBite,
    title: "Cookies & Tracking",
    content: [
      {
        subtitle: "What Are Cookies",
        text: "Cookies are small text files stored on your device when you visit our website. They help us remember your preferences, keep you signed in, and understand how you interact with our site.",
      },
      {
        subtitle: "Types of Cookies We Use",
        text: "We use essential cookies (for site functionality), analytics cookies (to understand traffic patterns), and marketing cookies (to deliver relevant advertisements). You can manage cookie preferences through your browser settings.",
      },
      {
        subtitle: "Third-Party Cookies",
        text: "Some third-party services we use, such as Google Analytics and social media plugins, may also set cookies on your device. These are governed by the respective third-party privacy policies.",
      },
    ],
  },
  {
    icon: FaUserShield,
    title: "Sharing Your Information",
    content: [
      {
        subtitle: "Service Providers",
        text: "We share your data with trusted third-party service providers who assist us in operating our website, conducting business, and serving you — such as payment processors, shipping partners, and email service providers. These parties are bound by confidentiality agreements.",
      },
      {
        subtitle: "No Sale of Data",
        text: "We will never sell, trade, or rent your personal information to third parties for their marketing purposes. Your data is used solely to provide and improve TrueGut services.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required by law, court order, or government authority, or when we believe disclosure is necessary to protect our rights or comply with a judicial proceeding.",
      },
    ],
  },
  {
    icon: FaShieldAlt,
    title: "Your Rights",
    content: [
      {
        subtitle: "Access & Correction",
        text: "You have the right to access, update, or correct your personal information at any time by logging into your account or contacting us directly.",
      },
      {
        subtitle: "Data Deletion",
        text: "You may request deletion of your personal data, subject to certain legal obligations. To request account deletion, contact our support team at privacy@truegut.in.",
      },
      {
        subtitle: "Data Portability",
        text: "You have the right to receive a copy of the personal data we hold about you in a structured, machine-readable format.",
      },
      {
        subtitle: "Opt-Out",
        text: "You can opt out of marketing emails at any time by clicking the unsubscribe link in any email or by updating your account notification preferences.",
      },
    ],
  },
];

function AccordionSection({ section, index }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = section.icon;

  return (
    <motion.div
      className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <Icon size={18} />
          </div>
          <h3 className="text-base md:text-lg font-bold text-font-title">
            {section.title}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-400 group-hover:text-primary transition-colors"
        >
          <FaChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-5 border-t border-gray-50">
              {section.content.map((item, i) => (
                <div key={i} className="pt-5">
                  <h4 className="font-semibold text-primary text-sm mb-2">
                    {item.subtitle}
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative py-24 md:py-36 flex items-center justify-center overflow-hidden bg-[#023120]">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <motion.div
              className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase px-5 py-2 rounded-full mb-6 border border-white/20"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <FaLock size={10} />
              Your Privacy Matters
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeIn}
            >
              Privacy <span className="text-secondary">Policy</span>
            </motion.h1>

            <motion.p
              className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl mx-auto"
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeIn}
            >
              At TrueGut, we are committed to protecting your personal
              information and being transparent about how we use it. This policy
              explains your rights and our responsibilities.
            </motion.p>

            <motion.p
              className="text-gray-400 text-sm mt-6"
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeIn}
            >
              Last updated: February 21, 2025
            </motion.p>
          </div>
        </section>

        {/* Intro Cards */}
        <section className="py-16 px-4 bg-bg-color">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FaShieldAlt,
                title: "Data Protection",
                desc: "Your data is encrypted and stored securely using industry-standard protocols.",
              },
              {
                icon: FaUserShield,
                title: "No Data Selling",
                desc: "We never sell your personal information to advertisers or third parties.",
              },
              {
                icon: FaLock,
                title: "Your Control",
                desc: "You have full rights to access, update, or delete your data anytime.",
              },
            ].map((card, idx) => {
              const CardIcon = card.icon;
              return (
                <motion.div
                  key={idx}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4 items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                    <CardIcon size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-font-title text-sm mb-1">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Accordion Sections */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-font-title mb-3">
                Policy Details
              </h2>
              <p className="text-gray-400 text-sm">
                Click on any section to expand it and learn more.
              </p>
            </motion.div>

            <div className="space-y-4">
              {sections.map((section, idx) => (
                <AccordionSection key={idx} section={section} index={idx} />
              ))}
            </div>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="py-12 px-4 bg-bg-color">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xl font-bold text-font-title mb-3">
                Children&apos;s Privacy
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Our website and services are not directed to individuals under
                the age of 13. We do not knowingly collect personal information
                from children. If you believe we have inadvertently collected
                such information, please contact us immediately and we will
                promptly delete it.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Policy Changes */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xl font-bold text-font-title mb-3">
                Changes to This Policy
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or for other operational, legal, or
                regulatory reasons. We will notify you of any significant
                changes by posting a notice on our website or sending an email.
                We encourage you to review this policy periodically.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 md:py-28 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#023120] z-0" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center text-white">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary mx-auto mb-6">
                <FaEnvelope size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Have Privacy Questions?
              </h2>
              <p className="text-gray-300 text-sm mb-8 leading-relaxed">
                If you have any questions, concerns, or requests regarding your
                privacy or this policy, our team is here to help.
              </p>
              <a
                href="mailto:privacy@truegut.in"
                className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-secondary transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
              >
                <FaEnvelope size={14} />
                Contact Us
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
