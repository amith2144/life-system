import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    // Security 3.3: getUser() vs getSession() - Using getUser for secure identity
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        // Fetch secure user data from server, don't just trust local session
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) await fetchProfile(user.id);
      }
      
      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) await fetchProfile(user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const toggleLiteMode = async () => {
    if (!profile) return;
    const newMode = !profile.lite_mode;
    setProfile({ ...profile, lite_mode: newMode }); // Optimistic UI
    await supabase.from('profiles').update({ lite_mode: newMode }).eq('id', user.id);
  };

  const value = {
    session,
    user,
    profile,
    liteMode: profile?.lite_mode || false,
    toggleLiteMode,
    loading,
    signOut: () => supabase.auth.signOut()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
