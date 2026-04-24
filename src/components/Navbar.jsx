import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500 pointer-events-none">
      <nav 
        className={`pointer-events-auto flex items-center justify-between px-6 py-3 radius-sys-lg transition-all duration-500 ${
          scrolled 
            ? 'bg-background/80 backdrop-blur-xl border border-primary/20 shadow-lg text-dark w-full max-w-5xl' 
            : 'bg-transparent text-background w-full max-w-7xl'
        }`}
      >
        <div className="font-heading font-bold text-xl tracking-tight">
          Life System
        </div>
        
        <div className="hidden md:flex items-center space-x-8 font-sans font-medium text-sm">
          <a href="#features" className="hover-lift">Features</a>
          <a href="#philosophy" className="hover-lift">Philosophy</a>
          <a href="#protocol" className="hover-lift">Protocol</a>
        </div>

        <Link to="/app">
          <button className="magnetic-btn group bg-accent text-background px-6 py-2 radius-sys-lg font-sans font-medium text-sm hover:text-white transition-colors">
            <span className="magnetic-btn-bg bg-dark"></span>
            <span className="magnetic-btn-content flex items-center space-x-2">
              <span>Initialize</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </Link>
      </nav>
    </div>
  );
}
