import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';

export default function Hero() {
  const container = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".hero-anim", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
      });
    }, container);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="relative w-full h-[100dvh] overflow-hidden flex items-end">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80")' }}
      ></div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-dark via-dark/40 to-transparent"></div>
      
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 pb-24 md:pb-32 flex flex-col items-start justify-end h-full text-background">
        <div className="md:w-2/3 lg:w-1/2">
          <h1 className="flex flex-col mb-6">
            <span className="hero-anim font-heading font-bold text-3xl md:text-5xl uppercase tracking-tighter mb-2 text-primary">
              Initialize the
            </span>
            <span className="hero-anim font-drama italic text-7xl md:text-[8rem] leading-none text-background">
              System.
            </span>
          </h1>
          
          <p className="hero-anim font-sans text-lg md:text-xl mb-10 text-primary/80 max-w-md">
            A control room for your future. No decoration, pure information density. Downshift when you need to, but never break the chain.
          </p>
          
          <Link to="/app">
            <button className="hero-anim magnetic-btn group bg-accent text-background px-8 py-4 radius-sys-lg font-heading font-bold text-base hover:text-white transition-colors">
              <span className="magnetic-btn-bg bg-white/10"></span>
              <span className="magnetic-btn-content">Build Your System</span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
