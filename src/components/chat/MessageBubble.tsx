// src/components/chat/MessageBubble.tsx
import type { Message, Source } from "@/pages/Index";
import { IconBot, IconBook, IconFile, IconCopy, IconCheck } from "@/components/Icons";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  message: Message;
  onOpenSources?: (sources: Source[]) => void;
}

const MAX_SOURCES_TO_SHOW = 3;

export default function MessageBubble({ message, onOpenSources }: MessageBubbleProps) {
  const isUser = message.role === "user";
  
  // Локальный стейт для управления визуальным фидбеком копирования
  const [isCopied, setIsCopied] = useState(false);
  
  const sources = message.sources || [];
  const attachments = message.attachments || [];
  
  const hasSources = !isUser && sources.length > 0;
  const visibleSources = hasSources ? sources.slice(0, MAX_SOURCES_TO_SHOW) : [];
  const remainingSourcesCount = hasSources ? sources.length - MAX_SOURCES_TO_SHOW : 0;

  const timeString = message.createdAt.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Best practice: асинхронная функция копирования с обработкой ошибок и таймером
  const handleCopy = async () => {
    if (!message.content) return;
    
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      
      // Возвращаем кнопку в исходное состояние через 2 секунды
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Не удалось скопировать текст: ", err);
    }
  };

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6 animate-message`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mr-3 mt-1 shadow-sm border border-primary/30 text-primary">
          <IconBot size={16} />
        </div>
      )}

      <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {hasSources && (
          <div className="mb-3 ml-1">
            <button 
              onClick={() => onOpenSources?.(sources)} 
              className="flex items-center gap-1.5 mb-2 group cursor-pointer text-content-muted hover:text-primary"
            >
              <IconBook size={14} className="transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wider transition-colors">
                Источники ({sources.length})
              </span>
            </button>
            <div className="flex flex-wrap gap-2">
              {visibleSources.map((source, index) => (
                <button 
                  key={source.id} 
                  onClick={() => onOpenSources?.(sources)} 
                  className="group flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-input hover:bg-divider border border-divider hover:border-primary/60 rounded-full transition-all max-w-[220px] shadow-sm" 
                  title={source.title}
                >
                  <span className="w-5 h-5 rounded-full bg-surface flex items-center justify-center text-[10px] text-primary font-bold border border-divider">
                    {index + 1}
                  </span>
                  <span className="text-[13px] text-content-secondary truncate font-medium">
                    {source.title}
                  </span>
                </button>
              ))}
              {remainingSourcesCount > 0 && (
                <button 
                  onClick={() => onOpenSources?.(sources)} 
                  className="flex items-center px-3 py-1.5 bg-panel hover:bg-divider border border-divider hover:border-primary/60 rounded-full transition-all shadow-sm text-[12px] font-bold text-content-muted hover:text-content-secondary"
                >
                  +{remainingSourcesCount} ещё
                </button>
              )}
            </div>
          </div>
        )}

        <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${isUser ? "bg-primary text-white rounded-br-sm min-w-[160px]" : "bg-panel text-content rounded-tl-sm border border-divider w-full"}`}>
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((file) => {
                if (!file?.id) return null;
                return (
                  <div key={file.id} className="relative">
                    {file.isImage && file.previewUrl ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/20 border border-white/10 shadow-sm">
                        <img 
                          src={file.previewUrl} 
                          alt={file.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                        />
                      </div>
                    ) : (
                      <div className={`w-48 h-12 rounded-lg flex items-center px-3 gap-2 shadow-sm border ${isUser ? 'bg-black/10 border-white/10 text-white/90' : 'bg-surface border-divider text-content-muted'}`}>
                        <IconFile size={20} />
                        <span className={`text-xs truncate font-medium ${isUser ? 'text-white/90' : 'text-content-tertiary'}`} title={file.name}>
                          {file.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {message.content && (
            isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="markdown-body space-y-4">
                {/* Отключаем правило линтера локально, чтобы он не ругался на node */}
                {/* eslint-disable @typescript-eslint/no-unused-vars */}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => <p className="leading-relaxed" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-3 text-content" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-5 mb-2 text-content" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-4 mb-2 text-content" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-sm font-bold mt-3 mb-1 text-content-secondary" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 mb-3" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 mb-3" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-content" {...props} />,
                    a: ({ node, ...props }) => <a className="text-primary hover:underline hover:text-primary-hover transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-4 rounded-lg border border-divider">
                        <table className="min-w-full text-sm divide-y divide-divider" {...props} />
                      </div>
                    ),
                    th: ({ node, ...props }) => <th className="px-4 py-2 bg-surface text-left font-semibold text-content-secondary" {...props} />,
                    td: ({ node, ...props }) => <td className="px-4 py-2 border-t border-divider" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {/* Включаем правило обратно */}
                {/* eslint-enable @typescript-eslint/no-unused-vars */}
              </div>
            )
          )}
          
          {/* Нижняя панель сообщения: gap-3 для отступа */}
          <div className="mt-2 flex items-center justify-between gap-3 w-full">
            <div className={`text-[11px] font-medium flex-shrink-0 ${isUser ? "text-white/60" : "text-content-muted"}`}>
              {timeString}
            </div>
            
            {message.content && (
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-1.5 px-2 py-1 -mr-2 rounded text-[11px] font-semibold transition-all ${
                  isUser 
                    ? "text-white/70 hover:text-white hover:bg-white/10" 
                    : "text-content-muted hover:text-content hover:bg-surface"
                }`}
                title="Скопировать сообщение"
                aria-label="Скопировать сообщение"
              >
                {isCopied ? (
                  <>
                    <IconCheck size={14} className="text-green-500" />
                    <span className="text-green-500">Скопировано</span>
                  </>
                ) : (
                  <>
                    <IconCopy size={14} />
                    <span>Копировать</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}