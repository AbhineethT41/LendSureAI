import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../layout/Navbar';

const PrivateRoute = ({ supabase }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check current auth status
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser({
            ...session.user,
            access_token: session.access_token
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          ...session.user,
          access_token: session.access_token
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Navbar user={user} supabase={supabase} />
      <main className="container mx-auto px-4 py-8">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};

export default PrivateRoute;
