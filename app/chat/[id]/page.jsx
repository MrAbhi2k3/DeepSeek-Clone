"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Markdown from "react-markdown";

export default function SharedChatPage({ params }) {
  const [chat, setChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSharedChat = async () => {
      try {
        const { data } = await axios.get(`/api/chat/shared/${params.id}`);

        if (!data?.success) {
          throw new Error(data?.message || "Unable to load shared chat");
        }

        setChat(data.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load shared chat");
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) {
      loadSharedChat();
    }
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d10] text-white flex items-center justify-center">
        <p className="text-gray-300">Loading shared chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d10] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <h1 className="text-lg font-semibold">Unable to open shared chat</h1>
          <p className="mt-2 text-sm text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold">{chat?.name || "Shared Chat"}</h1>
        <p className="mt-1 text-sm text-gray-400">Read-only shared conversation</p>

        <div className="mt-6 space-y-4">
          {(chat?.messages || []).map((message, idx) => (
            <div
              key={`${message.timestamp || idx}-${idx}`}
              className={`rounded-xl border p-4 ${
                message.role === "user"
                  ? "border-blue-400/30 bg-blue-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">{message.role}</p>
              {message.role === "assistant" ? (
                <div className="prose prose-invert max-w-none text-sm">
                  <Markdown>{message.content || ""}</Markdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
