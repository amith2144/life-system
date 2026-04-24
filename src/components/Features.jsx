import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, MousePointer2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// 1. Diagnostic Shuffler
function DiagnosticShuffler() {
  const [cards, setCards] = useState([
    { id: 1, text: "System Downshifted" },
    { id: 2, text: "Exam Mode Active" },
    { id: 3, text: "Habit Minimums Engaged" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        const last = newCards.pop();
        newCards.unshift(last);
        return newCards;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-48 w-full flex items-center justify-center perspective-1000">
      {cards.map((card, i) => {
        const isTop = i === 0;
        return (
          <div
            key={card.id}
            className={`absolute w-64 p-4 radius-sys border border-dark/10 bg-background shadow-lg transition-all duration-700 font-sans text-sm flex items-center justify-between
            `}
            style={{
              transform: `translateY(${i * 12}px) scale(${1 - i * 0.05})`,
              opacity: 1 - i * 0.2,
              zIndex: 10 - i,
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <span className="font-bold text-dark">{card.text}</span>
            <div className={`w-2 h-2 rounded-full ${isTop ? 'bg-accent' : 'bg-dark/20'}`}></div>
          </div>
        );
      })}
    </div>
  );
}

// 2. Telemetry Typewriter
function TelemetryTypewriter() {
  const messages = [
    "Scanning Body metrics...",
    "Optimizing Mind routines...",
    "Tracking Money flows...",
    "Syncing Connect data..."
  ];
  const [text, setText] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    let currentText = "";
    const msg = messages[msgIdx];
    let i = 0;
    
    const typeInterval = setInterval(() => {
      if (i < msg.length) {
        currentText += msg.charAt(i);
        setText(currentText);
        i++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setMsgIdx((prev) => (prev + 1) % messages.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [msgIdx]);

  return (
    <div className="w-full h-48 bg-dark radius-sys p-5 flex flex-col font-data text-sm">
      <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-white/10">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
        <span className="text-white/50 text-xs tracking-widest uppercase">Live Feed</span>
      </div>
      <div className="flex-1 flex items-end">
        <div className="text-primary">
          <span className="text-accentmr-2">]</span> {text}
          <span className="inline-block w-2 h-4 bg-accent ml-1 animate-pulse"></span>
        </div>
      </div>
    </div>
  );
}

// 3. Cursor Protocol Scheduler
function CursorProtocolScheduler() {
  const container = useRef(null);
  const cursor = useRef(null);
  const [activeDay, setActiveDay] = useState(null);
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      
      // Initial state
      gsap.set(cursor.current, { x: 0, y: 100, opacity: 0 });
      
      // Enter
      tl.to(cursor.current, { x: 50, y: 20, opacity: 1, duration: 0.6, ease: "power2.out" })
      // Move to a day (e.g. Wednesday index 3)
        .to(cursor.current, { x: 120, y: 35, duration: 0.8, ease: "power2.inOut" })
      // Click
        .to(cursor.current, { scale: 0.8, duration: 0.1 })
        .call(() => setActiveDay(3))
        .to(cursor.current, { scale: 1, duration: 0.1 })
      // Move to Save
        .to(cursor.current, { x: 220, y: 120, duration: 0.8, ease: "power2.inOut", delay: 0.4 })
      // Click Save
        .to(cursor.current, { scale: 0.8, duration: 0.1 })
        .to(cursor.current, { scale: 1, duration: 0.1 })
      // Fade out and reset
        .to(cursor.current, { y: 150, opacity: 0, duration: 0.4, delay: 0.2 })
        .call(() => setActiveDay(null));
        
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={container} className="relative w-full h-48 bg-primary/20 radius-sys p-5 flex flex-col items-center justify-between overflow-hidden">
      <div className="flex space-x-2 mt-4">
        {days.map((d, i) => (
          <div key={i} className={`w-8 h-8 flex items-center justify-center radius-sys text-xs font-heading font-bold transition-colors ${activeDay === i ? 'bg-accent text-white' : 'bg-background border border-dark/10'}`}>
            {d}
          </div>
        ))}
      </div>
      
      <button className="self-end px-4 py-1.5 radius-sys bg-dark text-background text-xs font-sans font-medium">
        Set Focus
      </button>

      <div ref={cursor} className="absolute z-20" style={{ pointerEvents: 'none' }}>
        <MousePointer2 className="w-6 h-6 text-dark fill-dark" />
      </div>
    </div>
  );
}

export default function Features() {
  const container = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".feature-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 70%",
        }
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={container} className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="font-heading font-bold text-4xl mb-4 text-dark">Functional Artifacts</h2>
        <p className="font-sans text-dark/70 max-w-lg text-lg">
          Not static marketing cards. These are the active mechanisms that keep the system alive when you step away.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="feature-card bg-white p-6 radius-sys border border-dark/5 flex flex-col justify-between">
          <div className="mb-8">
            <DiagnosticShuffler />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl mb-2">Resumability First</h3>
            <p className="font-sans text-dark/60 text-sm">
              Never breaks, just downshifts. Exam mode automatically triggers your minimum viable habits across all areas.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="feature-card bg-white p-6 radius-sys border border-dark/5 flex flex-col justify-between">
          <div className="mb-8">
            <TelemetryTypewriter />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl mb-2">6 Core Domains</h3>
            <p className="font-sans text-dark/60 text-sm">
              Organizes your entire identity into Body, Mind, Money, Create, Connect, and Future. Nothing falls through the cracks.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="feature-card bg-white p-6 radius-sys border border-dark/5 flex flex-col justify-between">
          <div className="mb-8">
            <CursorProtocolScheduler />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl mb-2">Daily Focus Rhythms</h3>
            <p className="font-sans text-dark/60 text-sm">
              One single focus per day. A weekly grid reset. Simple enough to survive on 20% effort when life gets loud.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
