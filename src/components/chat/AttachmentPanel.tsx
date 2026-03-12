// src/components/chat/AttachmentPanel.tsx
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

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
  onClose: () => void;
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="9" stroke="#B8B8C0" strokeWidth="1.5" fill="#2D2D3F" />
      <path
        d="M6.5 6.5L13.5 13.5M13.5 6.5L6.5 13.5"
        stroke="#B8B8C0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AttachmentPanel({
  files,
  onRemove,
  onRemoveAll,
  onClose,
}: AttachmentPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // ← ДОБАВЛЕНО: Фильтрация "битых" файлов
  const validFiles = files.filter(f => f && f.id && f.name);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (panelRef.current?.contains(target)) return;
      if (target.closest('[data-attach-trigger]')) return;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'file') return;
      
      onClose();
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  // ← ИСПОЛЬЗУЕМ validFiles вместо files
  const imageFiles = validFiles.filter((f) => f.isImage);
  const otherFiles = validFiles.filter((f) => !f.isImage);

  return (
    <div ref={panelRef} className="relative w-full">
      <div className="w-full bg-[#3A3A4A] rounded-lg border border-[#6C5CE7]/40 overflow-hidden">
        <div className="relative p-3 pb-2">
          <button
            onClick={onRemoveAll}
            className="absolute top-2 right-2 px-3 py-1 rounded-full border border-[#8D8D99] text-[#B8B8C0] text-xs font-normal hover:border-white hover:text-white transition-colors"
          >
            Открепить всё
          </button>

          {imageFiles.length > 0 && (
            <div className="flex gap-2 mt-5 flex-wrap">
              {imageFiles.map((f) => {
                // ← Защита на всякий случай
                if (!f?.id) return null;
                
                return (
                  <div key={f.id} className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#2D2D3F]">
                      {f.previewUrl ? (
                        <img
                          src={f.previewUrl}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#2D2D3F]" />
                      )}
                    </div>
                    <button
                      onClick={() => onRemove(f.id)}
                      className="absolute -top-1.5 -right-1.5 hover:scale-110 transition-transform"
                      aria-label={`Remove ${f.name}`}
                    >
                      <XCircleIcon />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {otherFiles.length > 0 && (
          <div className="border-t border-[#2D2D3F]/60">
            {otherFiles.map((f, idx) => {
              // ← Защита на всякий случай
              if (!f?.id) return null;
              
              return (
                <div
                  key={f.id}
                  className={cn(
                    "flex items-center justify-between px-3 py-2",
                    idx < otherFiles.length - 1 && "border-b border-[#2D2D3F]/60"
                  )}
                >
                  <span className="text-white text-sm font-normal truncate pr-3">
                    {f.name}
                  </span>
                  <button
                    onClick={() => onRemove(f.id)}
                    className="flex-shrink-0 hover:scale-110 transition-transform"
                    aria-label={`Remove ${f.name}`}
                  >
                    <XCircleIcon />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="absolute -bottom-[9px] left-2">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <path d="M0 0L8 10L16 0H0Z" fill="#3A3A4A" />
        </svg>
      </div>
    </div>
  );
}