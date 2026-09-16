"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function EmailAuthForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = createClient();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // ログイン処理
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/dashboard");
        router.refresh();
      } else {
        // 新規登録処理
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;

        // Supabaseの設定で「Confirm email」がオフならそのままログインされる
        setMessage("登録が完了しました！ダッシュボードに移動します。");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.message.includes("Invalid login credentials")) {
        setError("メールアドレスかパスワードが間違っています。");
      } else if (err.message.includes("User already registered")) {
        setError("このメールアドレスは既に登録されています。");
      } else if (err.message.includes("Password should be at least")) {
        setError("パスワードは6文字以上で入力してください。");
      } else {
        setError(err.message || "エラーが発生しました。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
      
      {/* タブ切り替え部分 */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            setIsLogin(false);
            setError(null);
            setMessage(null);
          }}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
            !isLogin 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          新規登録
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setError(null);
            setMessage(null);
          }}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
            isLogin 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ログイン
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1 text-left">
            メールアドレス
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@docomo.ne.jp"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1 text-left">
            パスワード <span className="text-xs text-gray-400 font-normal">(6文字以上)</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white"
              disabled={isLoading}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg text-left font-medium border border-red-100">
            {error}
          </p>
        )}
        
        {message && (
          <p className="text-sm text-emerald-500 bg-emerald-50 p-3 rounded-lg text-left font-medium border border-emerald-100">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || !email || password.length < 6}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isLogin ? "ログインして始める" : "登録して始める"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
