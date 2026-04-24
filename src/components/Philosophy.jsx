import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Philosophy() {
  const container = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Parallax background
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      // Simple SplitText simulation for word-by-word reveal
      const animateWords = (element, delay = 0) => {
        const words = element.querySelectorAll('.word');
        gsap.from(words, {
          y: 30,
          opacity: 0,
          duration: 1,
          stagger: 0.05,
          ease: "power3.out",
          delay: delay,
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
          }
        });
      };

      if (text1Ref.current) animateWords(text1Ref.current, 0);
      if (text2Ref.current) animateWords(text2Ref.current, 0.2);

    }, container);
    return () => ctx.revert();
  }, []);

  const splitText = (text, highlight = null) => {
    return text.split(' ').map((word, i) => (
      <span 
        key={i} 
        className={`word inline-block mr-[0.25em] ${word.replace(/[.,]/g, '') === highlight ? 'text-accent' : ''}`}
      >
        {word}
      </span>
    ));
  };

  return (
    <section id="philosophy" ref={container} className="relative w-full py-40 bg-dark text-primary overflow-hidden">
      {/* Parallax Background */}
      <div 
        ref={bgRef}
        className="absolute -top-[20%] left-0 w-full h-[140%] opacity-10 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80")' }}
      ></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        <div ref={text1Ref} className="font-sans text-xl md:text-2xl text-primary/60 mb-10 max-w-3xl leading-relaxed">
          {splitText("Most productivity systems focus on: constant optimization and relentless daily tracking.")}
        </div>
        
        <div ref={text2Ref} className="font-drama italic text-5xl md:text-7xl leading-tight max-w-4xl">
          {splitText("We focus on: resumability.", "resumability")}
        </div>
      </div>
    </section>
  );
}
