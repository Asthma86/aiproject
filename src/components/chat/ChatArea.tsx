// src/components/chat/ChatArea.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { type Chat } from "@/pages/Index";
import MessageBubble from "./MessageBubble";
import AttachmentPanel, { type AttachedFile } from "./AttachmentPanel";

interface ChatAreaProps {
  chat: Chat;
  onSendMessage: (content: string, files?: AttachedFile[]) => void; 
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function ChatArea({
  chat,
  onSendMessage,
  onToggleSidebar,
  sidebarOpen,
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      attachments.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    
    onSendMessage(input, attachments); 
    
    setInput("");
    setAttachments([]);
    setPanelOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setInput(e.target.value);
  e.target.style.height = "auto";
  e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
};

  const handleAttachClick = () => {
    // Всегда открываем выбор файлов, независимо от количества прикреплённых
    fileInputRef.current?.click();
    
    // Если панель была закрыта — открываем её
    if (!panelOpen) {
      setPanelOpen(true);
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    const newFiles: AttachedFile[] = selected.map((file) => {
      const isImage = file.type.startsWith("image/");
      const previewUrl = isImage ? URL.createObjectURL(file) : null;
      
      return {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        previewUrl,
        isImage,
      };
    });

    setAttachments((prev) => [...prev, ...newFiles]);
    setPanelOpen(true);
    e.target.value = "";
  };

  const handleRemoveFile = useCallback((id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      const next = prev.filter((f) => f.id !== id);
      if (next.length === 0) setPanelOpen(false);
      return next;
    });
  }, []);

  const handleRemoveAll = useCallback(() => {
    setAttachments((prev) => {
      prev.forEach((f) => { 
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); 
      });
      return [];
    });
    setPanelOpen(false);
  }, []);

  const canSend = input.trim().length > 0 || attachments.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-[#1A1A2E]">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-center relative h-[79px] bg-[#1A1A2E] shadow-[2px_4px_4px_rgba(0,0,0,0.30)] z-10">
        <button
          onClick={onToggleSidebar}
          className="absolute left-4 p-2 rounded-lg text-white hover:bg-[#3A3A4A] transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="2" rx="1" fill="currentColor" />
            <rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor" />
            <rect x="3" y="16" width="18" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>

        <h1 className="text-white text-2xl font-normal">
          {chat.title === "New chat" ? "Новый чат" : chat.title}
        </h1>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-[#6C5CE7]/20 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"
                  fill="#6C5CE7"
                />
              </svg>
            </div>
            <p className="text-[#8D8D99] text-lg font-medium">
              Начните новый разговор
            </p>
            <p className="text-[#8D8D99]/60 text-sm mt-2 max-w-xs">
              Напишите сообщение, чтобы начать общение
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {chat.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 bg-[#2D2D3F] px-4 py-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Attachment panel (shown above input when files attached) */}
          {panelOpen && attachments.length > 0 && (
            <div className="mb-2">
              <AttachmentPanel
                files={attachments}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAll}
                onClose={() => setPanelOpen(false)}
              />
            </div>
          )}

          <div className="flex items-end gap-3">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />

            {/* Add file / toggle panel button */}
            <button
              onClick={handleAttachClick}
              data-attach-trigger
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-[#3A3A4A] text-white text-xl hover:bg-[#444453] active:bg-[#2A2A3A] transition-colors relative"
              aria-label="Attach file"
            >
              +
              {attachments.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#6C5CE7] text-white text-[9px] font-bold flex items-center justify-center">
                  {attachments.length}
                </span>
              )}
            </button>

            {/* Input */}
            <div className="flex-1 bg-[#3A3A4A] rounded-lg px-4 py-2 min-h-[40px] flex items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Что ты умеешь делать?"
                rows={1}
                className="w-full bg-transparent text-[#F7F7FF] text-base font-normal placeholder-[#8D8D99] resize-none outline-none border-none leading-6 max-h-40"
              />
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-[#6C5CE7] hover:bg-[#7D6EF0] active:bg-[#5B4DD6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4L11.2929 3.29289L12 2.58579L12.7071 3.29289L12 4ZM13 19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19L12 19L13 19ZM6 10L5.29289 9.29289L11.2929 3.29289L12 4L12.7071 4.70711L6.70711 10.7071L6 10ZM12 4L12.7071 3.29289L18.7071 9.29289L18 10L17.2929 10.7071L11.2929 4.70711L12 4ZM12 4L13 4L13 19L12 19L11 19L11 4L12 4Z"
                  fill="#33363F"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}