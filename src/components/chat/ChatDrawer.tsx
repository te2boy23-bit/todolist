"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Trash2 } from "lucide-react";
import {
  addMessage,
  getMessages,
  markMessagesAsRead,
  deleteMessage,
} from "@/app/actions/chat";
import { createClient } from "@/lib/supabase/client";

interface ChatDrawerProps {
  projectId: string;
  currentUserId: string;
  myProfile: { name: string; avatar_url: string | null };
  partnerProfile?: { name: string; avatar_url: string | null };
}

import { useSearchParams } from "next/navigation";

export function ChatDrawer({
  projectId,
  currentUserId,
  myProfile,
  partnerProfile,
}: ChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("chat") === "open") {
      setIsOpen(true);
    }
  }, [searchParams]);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // iOS Safari のキーボード高さを正しく取得するための対応
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      if (window.visualViewport && drawerRef.current && containerRef.current) {
        // キーボード表示時に画面が上に押し上げられる分（offsetTop）を相殺する
        containerRef.current.style.top = `${window.visualViewport.offsetTop}px`;
        containerRef.current.style.height = `${window.visualViewport.height}px`;
        drawerRef.current.style.height = `${window.visualViewport.height}px`;

        // Android等で scrollToBottom を呼ぶための保険
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
      handleResize();
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
    };
  }, [isOpen]);

  // 初期ロードとリアルタイム購読
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchMessages = async () => {
      const data = await getMessages();
      if (isMounted) setMessages(data);
      // 開いたときに既読にする
      await markMessagesAsRead();
    };

    fetchMessages();

    // Supabase Realtime Channel
    const channel = supabase.channel(`chat:${projectId}`);

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          fetchMessages();
        },
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.userId !== currentUserId) {
          setPartnerTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setPartnerTyping(false);
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [isOpen, projectId, currentUserId, supabase]);

  // メッセージが追加されたら一番下までスクロールする
  useEffect(() => {
    if (isOpen) {
      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };
      // 即時と、キーボードが開くなどレイアウトが変わったあとの保険
      scrollToBottom();
      const timeoutId = setTimeout(scrollToBottom, 100);
      const timeoutId2 = setTimeout(scrollToBottom, 500);
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(timeoutId2);
      };
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const textToSend = newMessage.trim();
    setNewMessage(""); // 先にクリアしてUIをスッキリさせる

    setIsLoading(true);
    try {
      await addMessage(textToSend);
      const updatedMessages = await getMessages();
      setMessages(updatedMessages);
    } catch (error: any) {
      console.error("Failed to send message", error);
      alert(`メッセージの送信に失敗しました: ${error.message}`);
      setNewMessage(textToSend);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    supabase.channel(`chat:${projectId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId },
    });
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("送信を取り消しますか？")) return;
    try {
      await deleteMessage(messageId);
      const updatedMessages = await getMessages();
      setMessages(updatedMessages);
    } catch (error) {
      console.error(error);
      alert("取り消しに失敗しました");
    }
  };

  const getProfile = (userId: string) => {
    if (userId === currentUserId) return myProfile;
    return partnerProfile || { name: "パートナー", avatar_url: null };
  };

  const availableDates = Array.from(
    new Set(
      messages.map((msg) =>
        new Date(msg.timestamp || msg.created_at).toLocaleDateString(),
      ),
    ),
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
        <div
          ref={containerRef}
          className="fixed inset-0 z-50 flex justify-end h-[100dvh]"
        >
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsOpen(false)}
          />

          <div
            ref={drawerRef}
            className="relative w-full sm:w-96 bg-white h-[100dvh] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
          >
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
                  {availableDates.map((dateStr) => (
                    <button
                      key={dateStr}
                      onClick={() => {
                        document
                          .getElementById(`date-${dateStr}`)
                          ?.scrollIntoView({ behavior: "smooth" });
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

                const msgDate = new Date(
                  msg.timestamp || msg.created_at,
                ).toLocaleDateString();
                const prevMsgDate =
                  index > 0
                    ? new Date(
                        messages[index - 1].timestamp ||
                          messages[index - 1].created_at,
                      ).toLocaleDateString()
                    : null;
                const showDateHeader = msgDate !== prevMsgDate;

                return (
                  <div key={msg.id} className="flex flex-col">
                    {showDateHeader && (
                      <div
                        id={`date-${msgDate}`}
                        className="flex justify-center my-4"
                      >
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

                          <div
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"} mt-1 px-1`}
                          >
                            {isMe && msg.isRead && (
                              <span className="text-[10px] text-blue-500 font-bold mb-0.5">
                                既読
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">
                              {new Date(
                                msg.timestamp || msg.created_at,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        {/* 削除ボタン */}
                        {isMe && (
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="text-gray-300 hover:text-red-500 p-1 self-end transition-colors"
                            title="送信を取り消す"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 入力中インジケーター */}
              {partnerTyping && (
                <div className="flex justify-start mb-2 animate-in fade-in duration-200">
                  <div className="flex gap-2 max-w-[80%] flex-row">
                    <div className="flex-shrink-0">
                      {partnerProfile?.avatar_url ? (
                        <img
                          src={partnerProfile.avatar_url}
                          alt="Typing"
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                          {partnerProfile?.name?.charAt(0) || "P"}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="px-4 py-3 bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center">
                        <span
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 送信フォーム */}
            <form
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-gray-100 flex gap-2 items-end"
            >
              <textarea
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    // textarea の場合は form event を模倣して送信
                    handleSend(e as unknown as React.FormEvent);
                  }
                }}
                onFocus={() => {
                  setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }, 300);
                }}
                onBlur={() => {
                  // iOSでキーボードが閉じたときに画面が上にずれたままになるのを防ぐ
                  window.scrollTo(0, 0);
                }}
                placeholder="メッセージを入力..."
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none overflow-y-auto max-h-32 min-h-[44px]"
                rows={1}
                style={{ fontSize: "16px" }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center flex-shrink-0 h-[44px] w-[44px]"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
