"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

interface LoginButtonProps {
  className?: string;
  text?: string;
  iconSize?: number;
}

export function LoginButton({
  className,
  text,
  iconSize = 4,
}: LoginButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (session) {
    return (
      <button
        onClick={handleLogout}
        className={
          className ||
          "flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap shrink-0"
        }
      >
        <LogOut className={`w-${iconSize} h-${iconSize} shrink-0`} />
        ログアウト
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className={
        className ||
        "flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md transition-colors whitespace-nowrap shrink-0"
      }
    >
      <LogIn className={`w-${iconSize} h-${iconSize} shrink-0`} />
      {text || "Googleでログイン"}
    </button>
  );
}
