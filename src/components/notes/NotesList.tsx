"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Calendar, FileText } from "lucide-react";
import { addNote, deleteNote } from "@/app/actions/note";
import { format } from "date-fns";

interface Note {
  id: string;
  title: string;
  text: string;
  userId: string;
  timestamp: string;
  created_at: string;
}

export function NotesList({
  initialNotes,
  currentUserId,
}: {
  initialNotes: Note[];
  currentUserId: string | undefined;
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAddNote = () => {
    if (!title.trim() || !text.trim()) return;

    startTransition(async () => {
      await addNote(title, text);
      setIsAdding(false);
      setTitle("");
      setText("");
      // 注: サーバーアクション内でrevalidatePathしているため、画面が更新されますが、
      // クライアント側でもオプティミスティックに更新できればなお良し。今回はリロードに任せます。
      window.location.reload();
      try {
        await addNote(title, text);
        setIsAdding(false);
        setTitle("");
        setText("");
      } catch (error) {
        console.error("Failed to add note:", error);
        alert("メモの追加に失敗しました。");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("本当に削除しますか？")) return;

    startTransition(async () => {
      await deleteNote(id);
      window.location.reload();
      try {
        await deleteNote(id);
      } catch (error) {
        console.error("Failed to delete note:", error);
        alert("メモの削除に失敗しました。");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          メモ帳
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          新しいメモ
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-4 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <textarea
            placeholder="メモの内容を自由に入力してください..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full mb-4 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
            >
              キャンセル
            </button>
            <button
              onClick={handleAddNote}
              disabled={isPending || !title.trim() || !text.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              保存する
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialNotes.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            メモがありません
          </div>
        )}
        {initialNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900">{note.title}</h3>
              {currentUserId === note.userId && (
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={isPending}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-wrap mb-4">
              {note.text}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {format(new Date(note.timestamp), "yyyy/MM/dd HH:mm")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
