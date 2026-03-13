// src/components/chat/MessageBubble.tsx
import type { Message, Source } from "@/pages/Index";
import { IconBot, IconBook, IconFile } from "@/components/Icons";

interface MessageBubbleProps {
  message: Message;
  onOpenSources?: (sources: Source[]) => void;
}

export default function MessageBubble({ message, onOpenSources }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const MAX_VISIBLE_SOURCES = 3;
  const hasSources = !isUser && message.sources && message.sources.length > 0;
  const visibleSources = hasSources ? message.sources!.slice(0, MAX_VISIBLE_SOURCES) : [];
  const remainingSources = hasSources ? message.sources!.length - MAX_VISIBLE_SOURCES : 0;

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6 animate-message`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#6C5CE7]/20 flex items-center justify-center flex-shrink-0 mr-3 mt-1 shadow-sm border border-[#6C5CE7]/30 text-[#6C5CE7]">
          <IconBot size={16} />
        </div>
      )}

      <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {hasSources && (
          <div className="mb-3 ml-1">
            <button onClick={() => onOpenSources?.(message.sources!)} className="flex items-center gap-1.5 mb-2 group cursor-pointer text-[#8D8D99] hover:text-[#6C5CE7]">
              <IconBook size={14} className="transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wider transition-colors">Источники ({message.sources!.length})</span>
            </button>
            <div className="flex flex-wrap gap-2">
              {visibleSources.map((source, index) => (
                <button key={source.id} onClick={() => onOpenSources?.(message.sources!)} className="group flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-[#2A2A3A] hover:bg-[#3A3A4A] border border-[#3A3A4A] hover:border-[#6C5CE7]/60 rounded-full transition-all max-w-[220px] shadow-sm" title={source.title}>
                  <span className="w-5 h-5 rounded-full bg-[#1E1E2E] flex items-center justify-center text-[10px] text-[#6C5CE7] font-bold border border-[#3A3A4A]">{index + 1}</span>
                  <span className="text-[13px] text-[#E0E0E0] truncate font-medium">{source.title}</span>
                </button>
              ))}
              {remainingSources > 0 && (
                <button onClick={() => onOpenSources?.(message.sources!)} className="flex items-center px-3 py-1.5 bg-[#2D2D3F] hover:bg-[#3A3A4A] border border-[#3A3A4A] hover:border-[#6C5CE7]/60 rounded-full transition-all shadow-sm text-[12px] font-bold text-[#8D8D99] hover:text-[#E0E0E0]">+{remainingSources} ещё</button>
              )}
            </div>
          </div>
        )}

        <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${isUser ? "bg-[#6C5CE7] text-white rounded-br-sm" : "bg-[#2D2D3F] text-[#F7F7FF] rounded-tl-sm border border-[#3A3A4A]"}`}>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {message.attachments.map((file) => {
                if (!file?.id) return null;
                return (
                  <div key={file.id} className="relative">
                    {file.isImage && file.previewUrl ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/20 border border-white/10 shadow-sm">
                        <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    ) : (
                      <div className={`w-48 h-12 rounded-lg flex items-center px-3 gap-2 shadow-sm border ${isUser ? 'bg-black/10 border-white/10 text-white/90' : 'bg-[#1E1E2E] border-[#3A3A4A] text-[#8D8D99]'}`}>
                        <IconFile size={20} />
                        <span className={`text-xs truncate font-medium ${isUser ? 'text-white/90' : 'text-[#B8B8C0]'}`}>{file.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
          <div className={`text-[11px] mt-2 font-medium flex ${isUser ? "justify-end text-white/60" : "justify-start text-[#8D8D99]"}`}>
            {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}