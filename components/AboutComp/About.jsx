"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaHandHoldingHeart,
  FaSeedling,
  FaFlask,
} from "react-icons/fa";
import Navbar from "@/components/Home/Navbar";
import MobileBottomNav from "@/components/Home/MobileBottomNav";
import Footer from "@/components/Home/Footer";

const fadeInValues = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

export default function About() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* Placeholder for Hero Image - replacing with a nice gradient/color if no image */}
            <div className="w-full h-full bg-[#023120] relative opacity-90">
              <Image
                src="/images/about-hero.jpg" // Ensure this exists or use a fallback
                alt="Fermentaa Roots"
                fill
                className="object-cover opacity-40 mix-blend-overlay"
                priority
              />
            </div>
          </div>
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <motion.span
              className="block text-secondary font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInValues}
            >
              Est. 2024
            </motion.span>
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeInValues}
            >
              Rooted in Nature, <br />
              <span className="text-secondary">Crafted for Gut.</span>
            </motion.h1>
            <motion.p
              className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              variants={fadeInValues}
            >
              We bring the ancient art of fermentation to your modern table,
              ensuring every bite is packed with life and flavor.
            </motion.p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              className="relative aspect-4/5 rounded-[3rem] overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src="/images/blog-nuts.png" // Placeholder
                alt="Our Story"
                fill
                className="object-cover"
              />
              {/* Floating Badge */}
              <div className="absolute bottom-8 right-8 bg-white p-6 rounded-3xl shadow-xl max-w-[200px]">
                <p className="text-font-title font-bold text-lg mb-1">
                  100% Organic
                </p>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Sourced directly from certified organic farms.
                </p>
              </div>
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInValues}
              >
                <h4 className="text-secondary font-bold tracking-widest uppercase text-sm mb-3">
                  The Story
                </h4>
                <h2 className="text-4xl md:text-5xl font-bold text-font-title mb-6">
                  A Journey to <br />
                  Better Health
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  Fermentaa began with a simple question: Why have we forgotten
                  the foods that healed our ancestors? In a world of processed
                  alternatives, we set out to revive the traditional craft of
                  fermentation.
                </p>
                <p className="text-gray-600 leading-relaxed text-lg mb-8">
                  From crunchy, probiotic-rich Kimchi to soothing Kefir, every
                  product is handmade in small batches. We believe that food
                  should not just fill you up, but fuel your body's ecosystem.
                </p>
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-primary">5k+</span>
                    <span className="text-sm text-gray-400">Happy Guts</span>
                  </div>
                  <div className="w-px bg-gray-200 h-12 mx-4"></div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-primary">50+</span>
                    <span className="text-sm text-gray-400">Products</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-font-title mb-4">
                Our Core Values
              </h2>
              <p className="text-gray-500">
                What guides us in every jar we seal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: FaLeaf,
                  title: "100% Organic",
                  desc: "No pesticides, no shortcuts. Just pure nature.",
                  color: "text-green-600",
                  bg: "bg-green-50",
                },
                {
                  icon: FaFlask,
                  title: "Science Backed",
                  desc: "Recipes optimized for maximum probiotic benefit.",
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  icon: FaHandHoldingHeart,
                  title: "Handcrafted",
                  desc: "Made in small batches with personal care.",
                  color: "text-red-500",
                  bg: "bg-red-50",
                },
                {
                  icon: FaSeedling,
                  title: "Sustainable",
                  desc: "Eco-friendly packaging and zero-waste practices.",
                  color: "text-teal-600",
                  bg: "bg-teal-50",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all border border-gray-100 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <item.icon />
                  </div>
                  <h3 className="text-xl font-bold text-font-title mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#023120] z-0"></div>
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Ready to Transform <br /> Your Gut Health?
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of happy customers who have discovered the power of
              real, live fermented foods.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 bg-secondary text-white px-10 py-5 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-secondary transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Shop Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
