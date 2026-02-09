import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import BestSellers from "./BestSellers";
import Testimonials from "./Testimonials";
import BlogSection from "./BlogSection";
import Newsletter from "./Newsletter";
import Footer from "./Footer";
import TrueGutProtocol from "./TrueGutProtocol";
import ProbioticIntelligence from "./ProbioticIntelligence";
import RevealOnScroll from "../Common/RevealOnScroll";

export default function HomeComponent() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      <main>
        <RevealOnScroll>
          <Hero />
        </RevealOnScroll>
        <RevealOnScroll delay={0.3}>
          <BestSellers />
        </RevealOnScroll>
        <RevealOnScroll delay={0.3}>
          <TrueGutProtocol />
        </RevealOnScroll>
        <RevealOnScroll delay={0.3}>
          <ProbioticIntelligence />
        </RevealOnScroll>

        <RevealOnScroll delay={0.3}>
          <Testimonials />
        </RevealOnScroll>
        <RevealOnScroll delay={0.3}>
          <BlogSection />
        </RevealOnScroll>
        <RevealOnScroll delay={0.3}>
          <Newsletter />
        </RevealOnScroll>
      </main>
      <Footer />
    </div>
  );
}
