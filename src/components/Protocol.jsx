import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function Graphic1() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-48 h-48 animate-[spin_20s_linear_infinite]">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" className="text-dark/20" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 5" className="text-accent" />
        <circle cx="50" cy="50" r="10" fill="currentColor" className="text-dark/10" />
      </svg>
    </div>
  );
}

function Graphic2() {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-dark/5 radius-sys">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px', color: 'rgba(0,0,0,0.1)' }}></div>
      <div className="absolute top-0 left-0 w-full h-[2px] bg-accent shadow-[0_0_10px_rgba(230,59,46,0.8)] animate-[scan_3s_ease-in-out_infinite_alternate]" style={{ animationName: 'scan' }}></div>
      <style>{`@keyframes scan { from { transform: translateY(0); } to { transform: translateY(200px); } }`}</style>
    </div>
  );
}

function Graphic3() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 200 100" className="w-full h-32">
        <path 
          d="M 0 50 L 50 50 L 60 20 L 70 80 L 80 50 L 130 50 L 140 30 L 150 70 L 160 50 L 200 50" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          className="text-accent"
          strokeDasharray="400"
          strokeDashoffset="400"
          style={{ animation: 'dash 3s linear infinite' }}
        />
        <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
      </svg>
    </div>
  );
}

export default function Protocol() {
  const container = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const cards = cardsRef.current;
      
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return; // Last card doesn't pin/scale
        
        gsap.to(card, {
          scale: 0.9,
          opacity: 0.5,
          filter: "blur(20px)",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top top",
            endTrigger: cards[i + 1],
            end: "top top",
            scrub: true,
            pin: true,
            pinSpacing: false
          }
        });
      });
    }, container);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: "01",
      title: "Define the Identity",
      desc: "Who you're becoming. Your goals list. This sits at Layer 1 — permanent, rarely changed, reviewed occasionally.",
      Graphic: Graphic1
    },
    {
      num: "02",
      title: "Establish the Rhythms",
      desc: "Not a schedule, a rhythm. What happens every morning, every evening. Layer 2 survives exam season on 20% effort.",
      Graphic: Graphic2
    },
    {
      num: "03",
      title: "Execute the Focus",
      desc: "One or two things getting real attention this season. Layer 3 pauses during chaos, but the system never breaks.",
      Graphic: Graphic3
    }
  ];

  return (
    <section id="protocol" ref={container} className="relative w-full bg-background pt-24 pb-48">
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <h2 className="font-heading font-bold text-4xl mb-4 text-dark text-center">System Protocol</h2>
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        {steps.map((step, i) => (
          <div 
            key={i} 
            ref={el => cardsRef.current[i] = el}
            className="w-full min-h-[70vh] mb-24 flex items-center justify-center origin-top"
          >
            <div className="w-full bg-white radius-sys border border-dark/10 p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <div className="font-data text-accent font-bold text-lg mb-6 tracking-widest">{step.num} //</div>
                <h3 className="font-heading font-bold text-3xl md:text-5xl mb-6 text-dark">{step.title}</h3>
                <p className="font-sans text-dark/70 text-lg md:text-xl leading-relaxed max-w-md">
                  {step.desc}
                </p>
              </div>
              <div className="w-full md:w-1/2 h-64 md:h-96 bg-background radius-sys p-6 order-1 md:order-2 flex items-center justify-center border border-dark/5">
                <step.Graphic />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
