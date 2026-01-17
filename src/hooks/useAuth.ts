import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/runtimeClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOrgMember, setIsOrgMember] = useState(false);
  const [role, setRole] = useState<'admin' | 'staff' | null>(null);

  // Helper to check if error is a recoverable AbortError
  const isAbortError = (err: unknown): boolean => {
    if (!err) return false;
    const error = err as { name?: string; message?: string };
    return error.name === 'AbortError' || 
           (typeof error.message === 'string' && error.message.includes('signal is aborted'));
  };

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 2;

    // Get initial session with retry logic for AbortError
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkOrgMembership(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        if (!isMounted) return;
        
        // AbortError is recoverable - retry a couple times
        if (isAbortError(error) && retryCount < MAX_RETRIES) {
          retryCount++;
          console.warn(`[auth] AbortError on init, retry ${retryCount}/${MAX_RETRIES} in 1s...`);
          setTimeout(() => {
            if (isMounted) initializeAuth();
          }, 1000);
          return;
        }
        
        console.warn('[auth] Error initializing auth (non-fatal):', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkOrgMembership(session.user.id);
        } else {
          setIsOrgMember(false);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkOrgMembership = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Check if it's an AbortError - treat as transient
        if (isAbortError(error)) {
          console.warn('[auth] AbortError checking membership, continuing without role');
        } else {
          console.warn('[auth] Error checking org membership:', error);
        }
        setIsOrgMember(false);
        setRole(null);
      } else {
        setIsOrgMember(!!data);
        setRole(data?.role as 'admin' | 'staff' | null);
      }
    } catch (error) {
      if (isAbortError(error)) {
        console.warn('[auth] AbortError exception in membership check, continuing');
      } else {
        console.warn('[auth] Exception checking org membership:', error);
      }
      setIsOrgMember(false);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 30000): Promise<T> => {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Login is taking longer than usual. Please check your internet connection and try again.')), timeoutMs)
      ),
    ]);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        })
      );
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    try {
      const { error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        })
      );
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    isOrgMember,
    role,
    signIn,
    signUp,
    signOut,
  };
};
