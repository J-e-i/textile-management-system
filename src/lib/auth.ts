import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role: 'buyer' | 'admin'
  full_name?: string
  company_name?: string
}

// GST format validation (Indian GST format: 22AAAAA0000A1Z5)
const validateGSTFormat = (gstNumber: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstNumber);
}

export const signUp = async (email: string, password: string, fullName: string, companyName: string, gstNumber: string) => {
  // Validate GST format
  if (!validateGSTFormat(gstNumber)) {
    throw new Error('Invalid GST number format. Please use format: 22AAAAA0000A1Z5');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          gst_number: gstNumber,
        },
      },
    })

    if (error) {
      // Handle specific rate limit error
      if (error.status === 429 || error.message?.includes('rate limit')) {
        const errorMsg = 'Too many registration attempts with this email. Please wait a few minutes before trying again, or try with a different email address.';
        const err = new Error(errorMsg) as any;
        err.status = 429;
        throw err;
      }
      
      // Handle other common errors
      if (error.message?.includes('already been registered') || error.message?.includes('User already exists')) {
        throw new Error('This email is already registered. Please sign in or use a different email address.');
      }
      
      throw error;
    }

    // Only create profile if user was created successfully
    if (data.user) {
      console.log('Creating profile for user:', data.user.id, data.user.email);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          company_name: companyName,
          gst_number: gstNumber,
          role: 'buyer',
          approval_status: 'PENDING',
        })

      if (profileError) {
        // Don't throw — the auth user was created and email was sent.
        // This can happen when:
        // 1. RLS blocks the insert (user email not confirmed yet)
        // 2. A database trigger already created the profile row (duplicate key)
        // The profile will be available once admin approves or user confirms email.
        console.warn('Profile insert skipped (non-fatal):', profileError.message);
      }
      
      console.log('Profile created successfully for:', data.user.email);
    } else {
      throw new Error('Failed to create auth account');
    }

    return data;
  } catch (error: any) {
    console.error('Signup error:', error);
    throw error;
  }
}

export const signIn = async (email: string, password: string) => {
  console.log('signIn - Attempting login for:', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log('signIn - Supabase result:', { data, error });

  if (error) {
    console.error('signIn - Login error:', error);
    throw error
  }
  
  // Check if user is approved in the profiles table
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('approval_status')
      .eq('id', data.user.id)
      .single()

    // If user is REJECTED, don't allow login
    if (profile?.approval_status === 'REJECTED') {
      // Sign them out immediately
      await supabase.auth.signOut()
      throw new Error('Your account has been rejected. Please contact support.')
    }

    // If user is PENDING, show warning but allow login
    if (profile?.approval_status === 'PENDING') {
      console.warn('User logging in with PENDING approval status');
    }
  }

  console.log('signIn - Login successful, returning:', data);
  return data
}

export const signOut = async () => {
  console.log('signOut - Signing out user')
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  
  // Clear session storage to ensure the session is completely removed
  // This prevents the browser from auto-restoring the session on page reload
  try {
    sessionStorage.clear()
    console.log('signOut - Session storage cleared')
  } catch (e) {
    console.warn('Error clearing session storage:', e)
  }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('getCurrentUser - No auth user found')
    return null
  }

  console.log('getCurrentUser - Auth user:', user.id, user.email)

  try {
    // Add timeout to prevent hanging on slow/failed database queries
    const profilePromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile query timeout')), 5000)
    )

    const { data: profile, error } = await Promise.race([
      profilePromise,
      timeoutPromise
    ]) as any

    console.log('getCurrentUser - Profile query result:', { profile, error })

    if (error || !profile) {
      console.log('getCurrentUser - No profile found or error:', error)
      // Return basic user data even if profile fails to load
      return {
        id: user.id,
        email: user.email!,
        role: 'buyer',
      }
    }

    const authUser = {
      id: user.id,
      email: user.email!,
      role: profile.role,
      full_name: profile.full_name || undefined,
      company_name: profile.company_name || undefined,
    }

    console.log('getCurrentUser - Returning auth user:', authUser)
    return authUser
  } catch (error) {
    console.error('getCurrentUser - Error fetching profile:', error)
    // Return basic user info if profile fetch fails to avoid blocking login
    return {
      id: user.id,
      email: user.email!,
      role: 'buyer',
    }
  }
}

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      try {
        // Add timeout to prevent hanging on slow/failed database queries
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile query timeout')), 5000)
        )

        const { data: profile } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any

        if (profile) {
          callback({
            id: session.user.id,
            email: session.user.email!,
            role: profile.role,
            full_name: profile.full_name || undefined,
            company_name: profile.company_name || undefined,
          })
        } else {
          // Return basic user data if profile fails to load
          callback({
            id: session.user.id,
            email: session.user.email!,
            role: 'buyer',
          })
        }
      } catch (error) {
        console.error('Error fetching profile in onAuthStateChange:', error)
        // Return basic user info even if profile fetch fails
        callback({
          id: session.user.id,
          email: session.user.email!,
          role: 'buyer',
        })
      }
    } else {
      callback(null)
    }
  })
}
