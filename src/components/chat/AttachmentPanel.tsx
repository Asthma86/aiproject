// src/components/chat/AttachmentPanel.tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconXCircle } from "@/components/Icons";

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl: string | null;
  isImage: boolean;
}

interface AttachmentPanelProps {
  files: AttachedFile[];
  onRemove: (id: string) => void;
  onRemoveAll: () => void;
}

export default function AttachmentPanel({ files, onRemove, onRemoveAll }: AttachmentPanelProps) {
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [isClosing, setIsClosing] = useState(false);

  // Отсекаем битые файлы, если вдруг стейт криво обновился
  const safeFiles = files.filter(file => Boolean(file?.id && file?.name));
  
  const images = safeFiles.filter(file => file.isImage);
  const docs = safeFiles.filter(file => !file.isImage);

  const handleClearAll = () => {
    setIsClosing(true);
    // Ждем окончания анимации перед реальным удалением
    setTimeout(() => onRemoveAll(), 300);
  };

  const handleRemoveFile = (id: string) => {
    // Если удаляем последний файл, лучше снести всю панель целиком
    if (safeFiles.length === 1) {
      handleClearAll();
      return;
    }
    
    setDeletingIds(prev => [...prev, id]);
    
    setTimeout(() => {
      onRemove(id);
      setDeletingIds(prev => prev.filter(itemId => itemId !== id));
    }, 300);
  };

  return (
    <div className={cn("relative w-full", isClosing ? "animate-panel-exit" : "")}>
      <div className="w-full bg-divider rounded-lg border border-primary/40 overflow-hidden shadow-lg">
        <div className="p-3 pb-2">
          
          <div className="flex justify-end mb-3">
            <button
              onClick={handleClearAll}
              className="px-3 py-1 rounded-full border border-[#8D8D99] text-content-tertiary text-xs font-normal hover:border-white hover:text-white transition-colors"
            >
              Открепить всё
            </button>
          </div>

          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {images.map(img => {
                if (!img?.id) return null;
                
                const isDeleting = deletingIds.includes(img.id);
                
                return (
                  <div 
                    key={img.id} 
                    className={cn(
                      "relative flex-shrink-0 origin-center transition-all", 
                      isDeleting ? "animate-img-exit" : "animate-in zoom-in-95 duration-200"
                    )}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-panel">
                      {img.previewUrl ? (
                        <img src={img.previewUrl} alt={img.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-panel" /> // Заглушка, если урл не успел создаться
                      )}
                    </div>
                    <button 
                      onClick={() => handleRemoveFile(img.id)} 
                      className="absolute -top-1.5 -right-1.5 hover:scale-110 transition-transform z-10"
                    >
                      <IconXCircle />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {docs.length > 0 && (
          <div className="border-t border-[#2D2D3F]/60">
            {docs.map((doc, idx) => {
              if (!doc?.id) return null;
              
              const isLastItem = idx === docs.length - 1;
              const isDeleting = deletingIds.includes(doc.id);

              return (
                <div 
                  key={doc.id} 
                  className={cn(
                    "flex items-center justify-between px-3 py-2 transition-all", 
                    !isLastItem && "border-b border-[#2D2D3F]/60", 
                    isDeleting ? "animate-file-exit" : "animate-in slide-in-from-left-2 duration-200"
                  )}
                >
                  <span className="text-white text-sm font-normal truncate pr-3" title={doc.name}>
                    {doc.name}
                  </span>
                  <button onClick={() => handleRemoveFile(doc.id)} className="flex-shrink-0 hover:scale-110 transition-transform">
                    <IconXCircle />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Декоративный хвостик от бабла */}
      <div className="absolute -bottom-[9px] left-2">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <path d="M0 0L8 10L16 0H0Z" fill="#3A3A4A" />
        </svg>
      </div>
    </div>
  );
}