import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    supabase,
    signUp: async (data) => {
      const { error } = await supabase.auth.signUp(data);
      if (error) throw error;
    },
    signIn: async (data) => {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    },
    updatePassword: async (newPassword) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
