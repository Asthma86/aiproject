// src/components/chat/ChatArea.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { type Chat, type Source } from "@/pages/Index";
import MessageBubble from "./MessageBubble";
import AttachmentPanel, { type AttachedFile } from "./AttachmentPanel";
import { IconMenu, IconBot, IconSend, IconCheck, IconBook, IconClose, IconExternalLink } from "@/components/Icons";

interface ChatAreaProps {
  chat: Chat;
  onSendMessage: (content: string, files?: AttachedFile[]) => void; 
  onToggleSidebar: () => void;
  isGenerating?: boolean;
  placeholder?: string;
}

export default function ChatArea({ 
  chat, 
  onSendMessage, 
  onToggleSidebar,  
  isGenerating = false,
  placeholder = "Что ты умеешь делать?" 
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [activeSources, setActiveSources] = useState<Source[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat.messages, isGenerating]);
  useEffect(() => { 
    return () => { attachments.forEach((f) => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); }); }; 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    if (isGenerating) return; 
    onSendMessage(input, attachments); 
    setInput(""); setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    const newFiles: AttachedFile[] = selected.map((file) => {
      const isImage = file.type.startsWith("image/");
      return { id: `${Date.now()}-${Math.random()}`, name: file.name, type: file.type, size: file.size, previewUrl: isImage ? URL.createObjectURL(file) : null, isImage };
    });
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleRemoveFile = useCallback((id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleRemoveAll = useCallback(() => {
    setAttachments((prev) => { prev.forEach((f) => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); }); return []; });
  }, []);

  const canSend = input.trim().length > 0 || attachments.length > 0;

  // Функция для отображения названия пустого чата
  const getChatTitle = () => {
    if (chat.title === "New chat") return "Новый чат";
    if (chat.title === "New statement") return "Новое заявление";
    return chat.title;
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-background relative">
      <div className="flex-shrink-0 flex items-center justify-center relative h-[79px] bg-background shadow-[2px_4px_4px_rgba(0,0,0,0.30)] z-10">
        <button onClick={onToggleSidebar} className="absolute left-4 p-2 rounded-lg text-white hover:bg-divider transition-colors md:hidden">
          <IconMenu size={20} />
        </button>
        {}
        <h1 className="text-white text-2xl font-normal truncate px-12 max-w-[70vw] md:max-w-[600px] text-center">
          {getChatTitle()}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary"><IconBot size={32} /></div>
            <p className="text-content-muted text-lg font-medium">Начните новый разговор</p>
            <p className="text-content-muted/60 text-sm mt-2 max-w-xs">
              {placeholder === "Напишите или загрузите заявление" ? "Отправьте вводные данные для генерации" : "Напишите сообщение, чтобы начать общение"}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {chat.messages.map((message) => (
              <div key={message.id} className="animate-fade-slide">
                <MessageBubble message={message} onOpenSources={(sources) => setActiveSources(sources)} />
              </div>
            ))}
            {isGenerating && (
              <div className="flex w-full mt-2 gap-3 max-w-3xl mx-auto animate-fade-slide">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary"><IconBot size={16} /></div>
                <div className="flex items-center gap-1.5 bg-panel px-4 py-3 rounded-2xl rounded-tl-sm w-fit shadow-sm">
                  <div className="w-2 h-2 bg-[#8D8D99] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#8D8D99] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#8D8D99] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 bg-panel px-4 py-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {attachments.length > 0 && (
            <div className="mb-2 animate-panel origin-bottom">
              <AttachmentPanel files={attachments} onRemove={handleRemoveFile} onRemoveAll={handleRemoveAll} />
            </div>
          )}
          <div className="flex items-end gap-3">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesSelected} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" />
            <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-divider text-white text-xl hover:bg-divider-hover active:bg-input transition-colors relative">
              +
              {attachments.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center animate-icon">{attachments.length}</span>}
            </button>
            <div className="flex-1 bg-divider rounded-lg px-4 py-2 min-h-[40px] flex items-end">
              {}
              <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown} placeholder={placeholder} rows={1} className="w-full bg-transparent text-content text-base font-normal placeholder-[#8D8D99] resize-none outline-none border-none leading-6 max-h-40" />
            </div>
            <button onClick={handleSend} disabled={!canSend && !isGenerating} className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${isGenerating ? "bg-primary cursor-default opacity-100" : "bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"}`}>
              {isGenerating ? <IconCheck size={20} className="animate-icon stroke-content-dark" /> : <IconSend size={24} className="animate-icon text-content-dark" />}
            </button>
          </div>
        </div>
      </div>

      {activeSources && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 animate-bg" onClick={() => setActiveSources(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-surface shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col border-l border-divider animate-drawer">
            <div className="flex items-center justify-between px-6 py-5 border-b border-divider">
              <div className="flex items-center gap-2 text-primary">
                <IconBook size={18} />
                <h2 className="text-white font-semibold text-lg">Источники</h2>
                <span className="ml-2 bg-divider text-content-secondary px-2 py-0.5 rounded-full text-xs font-bold">{activeSources.length}</span>
              </div>
              <button onClick={() => setActiveSources(null)} className="p-2 -mr-2 text-content-muted hover:text-white hover:bg-input rounded-lg transition-colors">
                <IconClose size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {activeSources.map((src, idx) => (
                <a key={src.id} href={src.url || "#"} target={src.url ? "_blank" : "_self"} rel="noopener noreferrer" className="flex items-start gap-3 p-4 bg-panel border border-divider hover:border-primary hover:bg-divider/50 rounded-xl transition-all group">
                  <div className="w-7 h-7 rounded border border-divider bg-background group-hover:bg-surface group-hover:border-primary/50 text-content-muted group-hover:text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors mt-0.5">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-content group-hover:text-primary transition-colors line-clamp-2">{src.title}</h3>
                    <p className="text-xs text-content-muted mt-1.5 truncate">{src.url ? src.url.replace(/^https?:\/\/(www\.)?/, '') : "Внутренний документ базы"}</p>
                  </div>
                  {src.url && <IconExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-content-muted" />}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}