"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

export function LoginButton() {
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
    router.refresh();
  };

  if (session) {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        ログアウト
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md transition-colors"
    >
      <LogIn className="w-4 h-4" />
      Googleでログイン
    </button>
  );
}
