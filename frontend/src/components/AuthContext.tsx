"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "Business" | "Worker" | "Admin";
  skills?: string[];
  location?: string;
  rating?: number;
  experience?: string;
  hourlyPrice?: number;
  avatar?: string;
  portfolio?: string[];
  availability?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  csrfToken: string;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    username: string,
    email: string,
    password: string,
    role: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState("");

  const router = useRouter();

  const initializeAuth = async () => {
    try {
      // Get CSRF Token
      const csrfRes = await fetch(`${API_URL}/api/auth/csrf`, {
        credentials: "include",
      });

      if (csrfRes.ok) {
        const data = await csrfRes.json();
        setCsrfToken(data.csrfToken);
      }

      // Check logged in user
      const meRes = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (meRes.ok) {
        const data = await meRes.json();
        setUser(data.user);
      } else {
        setUser(null);
      }

    } catch (err) {
      console.error("Auth initialization error:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    initializeAuth();
  }, []);


  const refreshUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }

    } catch (err) {
      console.error("Refresh user error:", err);
    }
  };


  const login = async (email: string, password: string) => {
    try {

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });


      const data = await res.json();


      if (res.ok) {

        setUser(data.user);


        if (data.user.role === "Admin") {
          router.push("/dashboard/admin");
        } 
        else if (data.user.role === "Business") {
          router.push("/dashboard/business");
        } 
        else {
          router.push("/dashboard/worker");
        }


        return { success: true };

      } else {

        return {
          success: false,
          error: data.error || "Invalid credentials",
        };

      }


    } catch (err) {

      console.error("Login error:", err);

      return {
        success: false,
        error: "Network error. Please try again.",
      };

    }
  };



  const signup = async (
    username: string,
    email: string,
    password: string,
    role: string
  ) => {

    try {

      const res = await fetch(`${API_URL}/api/auth/signup`, {

        method: "POST",

        credentials: "include",

        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },

        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),

      });


      const data = await res.json();


      if (res.ok) {

        return await login(email, password);

      } 
      else {

        return {
          success:false,
          error:data.error || "Signup failed",
        };

      }


    } catch(err){

      console.error("Signup error:",err);

      return {
        success:false,
        error:"Network error. Please try again.",
      };

    }

  };



  const logout = async () => {

    try {

      await fetch(`${API_URL}/api/auth/logout`, {

        method:"POST",

        credentials:"include",

        headers:{
          "X-CSRF-Token":csrfToken,
        },

      });


    } catch(err){

      console.error("Logout error:",err);

    } finally {

      setUser(null);
      window.location.href="/";

    }

  };



  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        csrfToken,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}



export function useAuth(){

  const context = useContext(AuthContext);

  if(!context){

    throw new Error(
      "useAuth must be used within AuthProvider"
    );

  }

  return context;

}