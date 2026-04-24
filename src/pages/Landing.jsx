import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Philosophy from '../components/Philosophy';
import Protocol from '../components/Protocol';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  return (
    <div className="bg-background min-h-screen selection:bg-accent selection:text-white">
      <div className="noise-overlay"></div>
      <Navbar />
      <Hero />
      <Features />
      <Philosophy />
      <Protocol />
      <Footer />
    </div>
  );
}
