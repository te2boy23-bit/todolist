import Link from "next/link";
import { HelpCircle, Shield, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded overflow-hidden relative border border-gray-200">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              Plan Wallet
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              旅行、同棲、趣味の資金。友人や恋人と一緒にお金を管理し、共通のTodoをこなして、夢を叶えるための共有アプリです。
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-4">コンテンツ</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  トップページ
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  使い方ガイド
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-4">法務情報</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Plan Wallet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
