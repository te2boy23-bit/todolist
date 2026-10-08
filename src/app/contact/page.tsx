import { Footer } from "@/components/layout/Footer";
import { Mail } from "lucide-react";

export const metadata = {
  title: "お問い合わせ - Plan Wallet",
  description: "Plan Walletに関するお問い合わせはこちらからどうぞ。",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 py-16 px-4 text-center border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
          <Mail className="w-8 h-8 text-blue-600" />
          お問い合わせ
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          Plan Walletをご利用いただきありがとうございます。<br />
          ご意見、ご要望、不具合のご報告などはこちらからお願いいたします。
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">メールでのお問い合わせ</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            現在、お問い合わせはメールにて受け付けております。<br />
            以下のボタンからメールソフトを起動してご連絡ください。
          </p>
          <a
            href="mailto:support@plan-wallet.com?subject=【Plan Wallet】お問い合わせ"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Mail className="w-5 h-5" />
            メールを作成する
          </a>
          <p className="text-xs text-gray-400 mt-6">
            ※ ご返信には数営業日いただく場合がございます。<br />
            ※ 宛先（support@plan-wallet.com）をご確認の上ご送信ください。
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
