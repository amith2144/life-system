import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-dark text-primary radius-sys-lg rounded-b-none pt-24 pb-12 px-6 mt-[-4rem] relative z-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <div className="font-heading font-bold text-3xl mb-4 text-white">Life System</div>
          <p className="font-sans text-white/50 max-w-sm mb-8">
            A resumable personal productivity system designed around your weekly rhythms.
          </p>
          
          {/* Status Indicator */}
          <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 radius-sys px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-data text-xs text-white/80 uppercase tracking-widest">System Operational</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 font-sans text-sm">
          <div className="flex flex-col space-y-4">
            <div className="font-heading font-bold text-white mb-2">Protocol</div>
            <a href="#" className="text-primary/60 hover:text-white hover-lift">Features</a>
            <a href="#" className="text-primary/60 hover:text-white hover-lift">Philosophy</a>
            <a href="#" className="text-primary/60 hover:text-white hover-lift">Methodology</a>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="font-heading font-bold text-white mb-2">Initialize</div>
            <a href="#" className="text-primary/60 hover:text-white hover-lift">Get Started</a>
            <a href="#" className="text-primary/60 hover:text-white hover-lift">Documentation</a>
            <a href="#" className="text-primary/60 hover:text-white hover-lift">Support</a>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="font-heading font-bold text-white mb-2">Legal</div>
            <a href="#" className="text-primary/60 hover:text-white hover-lift">Privacy Policy</a>
            <a href="#" className="text-primary/60 hover:text-white hover-lift">Terms of Service</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center font-sans text-sm text-white/30">
        <div>© 2026 Life System. All rights reserved.</div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <span>Designed with precision</span>
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>
    </footer>
  );
}
