import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app';

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!otpSent) {
          // Step 1: Sign up
          const { error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;
          setOtpSent(true);
          alert('Check your email (and spam folder) for the 6-digit OTP code!');
        } else {
          // Step 2: Verify OTP
          const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'signup'
          });
          if (error) throw error;
          navigate(from, { replace: true });
        }
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate(from, { replace: true });
      }
    } catch (error) {
      setError(error.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-6 selection:bg-accent selection:text-white">
      <div className="noise-overlay"></div>
      
      <div className="w-full max-w-md bg-white radius-sys border border-dark/10 p-8 shadow-xl relative z-10">
        <h2 className="font-heading font-bold text-3xl mb-2 text-dark text-center">
          {isSignUp ? 'Sign up' : 'Login'}
        </h2>
        <p className="font-sans text-dark/60 text-sm mb-8 text-center">
          {isSignUp ? 'Create an account to get started.' : 'Welcome back.'}
        </p>

        {error && (
          <div className="bg-accent/10 border border-accent text-accent px-4 py-3 radius-sys mb-6 font-sans text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block font-heading font-bold text-sm text-dark mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              disabled={otpSent}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-dark/20 radius-sys px-4 py-3 font-data text-sm focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>
          
          {(!isSignUp || !otpSent) && (
            <div>
              <label className="block font-heading font-bold text-sm text-dark mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-dark/20 radius-sys px-4 py-3 font-data text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}

          {isSignUp && otpSent && (
            <div>
              <label className="block font-heading font-bold text-sm text-dark mb-1">6-Digit OTP Code</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-background border border-dark/20 radius-sys px-4 py-3 font-data text-sm focus:outline-none focus:border-accent transition-colors tracking-widest"
                placeholder="123456"
                maxLength={6}
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full magnetic-btn group bg-dark text-white px-6 py-3 radius-sys font-heading font-bold disabled:opacity-50"
          >
            <span className="magnetic-btn-bg bg-accent"></span>
            <span className="magnetic-btn-content">
              {loading ? 'Processing...' : (isSignUp ? (otpSent ? 'Verify OTP' : 'Sign up') : 'Login')}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setOtpSent(false);
              setError(null);
            }}
            className="font-sans text-sm text-dark/60 hover:text-dark transition-colors"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
