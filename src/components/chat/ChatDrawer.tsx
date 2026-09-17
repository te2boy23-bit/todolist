"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { addMessage, getMessages } from "@/app/actions/chat";
import { createClient } from "@/lib/supabase/client";

interface ChatDrawerProps {
  projectId: string;
  currentUserId: string;
  myProfile: { name: string; avatar_url: string | null };
  partnerProfile?: { name: string; avatar_url: string | null };
}

export function ChatDrawer({
  projectId,
  currentUserId,
  myProfile,
  partnerProfile,
}: ChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初期ロードとリアルタイム購読
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchMessages = async () => {
      const data = await getMessages();
      if (isMounted) setMessages(data);
    };

    fetchMessages();

    // 簡易的なポーリング（リアルタイム更新の代わり）
    // SupabaseのrealtimeがRLSでブロックされる可能性があるため
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const textToSend = newMessage;
    setNewMessage(""); // 先にクリアしてUIをスッキリさせる

    // オプティミスティックUI（即時反映）
    const tempId = Date.now().toString();
    const tempMsg = {
      id: tempId,
      text: textToSend,
      userId: currentUserId,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    setIsLoading(true);
    try {
      await addMessage(textToSend);
      // 再取得
      const updatedMessages = await getMessages();
      setMessages(updatedMessages);
    } catch (error: any) {
      console.error("Failed to send message", error);
      alert(`メッセージの送信に失敗しました: ${error.message}`);
      // エラー時は追加したメッセージを戻すなどの処理も可能だが今回は簡易的に
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = (userId: string) => {
    if (userId === currentUserId) return myProfile;
    return partnerProfile || { name: "パートナー", avatar_url: null };
  };

  const availableDates = Array.from(
    new Set(
      messages.map((msg) =>
        new Date(msg.timestamp || msg.created_at).toLocaleDateString()
      )
    )
  );

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* ドロワー */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full sm:w-96 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* ヘッダー */}
            <div className="flex flex-col border-b border-gray-100 bg-white shadow-sm z-10">
              <div className="flex items-center justify-between px-4 py-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  プロジェクトチャット
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* 日付ナビゲーションバー */}
              {availableDates.length > 0 && (
                <div className="flex overflow-x-auto gap-2 px-4 pb-3 scrollbar-hide">
                  {availableDates.map(dateStr => (
                    <button
                      key={dateStr}
                      onClick={() => {
                        document.getElementById(`date-${dateStr}`)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] sm:text-xs rounded-full transition-colors border border-gray-200"
                    >
                      {dateStr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* メッセージ一覧 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-10">
                  まだメッセージがありません。
                  <br />
                  最初のメッセージを送りましょう！
                </div>
              )}
              {messages.map((msg, index) => {
                const isMe = msg.userId === currentUserId;
                const profile = getProfile(msg.userId);
                
                const msgDate = new Date(msg.timestamp || msg.created_at).toLocaleDateString();
                const prevMsgDate = index > 0 
                  ? new Date(messages[index - 1].timestamp || messages[index - 1].created_at).toLocaleDateString() 
                  : null;
                const showDateHeader = msgDate !== prevMsgDate;

                return (
                  <div key={msg.id} className="flex flex-col">
                    {showDateHeader && (
                      <div id={`date-${msgDate}`} className="flex justify-center my-4">
                        <span className="bg-gray-200/50 text-gray-500 text-[10px] px-3 py-1 rounded-full font-medium">
                          {msgDate}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
                    >
                    <div
                      className={`flex gap-2 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* アバター */}
                      <div className="flex-shrink-0">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.name}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {profile.name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>

                      {/* 吹き出し */}
                      <div
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[10px] text-gray-400 mb-1 px-1">
                          {profile.name}
                        </span>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-sm"
                              : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {new Date(
                            msg.timestamp || msg.created_at,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                   </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* 送信フォーム */}
            <form
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-gray-100 flex gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="メッセージを入力..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-5 h-5 -ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
