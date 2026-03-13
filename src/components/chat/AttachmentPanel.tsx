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

  const validFiles = files.filter((f) => f && f.id && f.name);
  const imageFiles = validFiles.filter((f) => f.isImage);
  const otherFiles = validFiles.filter((f) => !f.isImage);

  const handleClearAll = () => {
    setIsClosing(true);
    setTimeout(() => onRemoveAll(), 300);
  };

  const handleRemoveFile = (id: string) => {
    if (validFiles.length === 1) {
      handleClearAll();
      return;
    }
    setDeletingIds((prev) => [...prev, id]);
    setTimeout(() => {
      onRemove(id);
      setDeletingIds((prev) => prev.filter((i) => i !== id));
    }, 300);
  };

  return (
    <div className={cn("relative w-full", isClosing ? "animate-panel-exit" : "")}>
      <div className="w-full bg-[#3A3A4A] rounded-lg border border-[#6C5CE7]/40 overflow-hidden shadow-lg">
        <div className="relative p-3 pb-2">
          <button
            onClick={handleClearAll}
            className="absolute top-2 right-2 px-3 py-1 rounded-full border border-[#8D8D99] text-[#B8B8C0] text-xs font-normal hover:border-white hover:text-white transition-colors z-10"
          >
            Открепить всё
          </button>

          {imageFiles.length > 0 && (
            <div className="flex gap-2 mt-5 flex-wrap">
              {imageFiles.map((f) => {
                if (!f?.id) return null;
                return (
                  <div key={f.id} className={cn("relative flex-shrink-0 origin-center transition-all", deletingIds.includes(f.id) ? "animate-img-exit" : "animate-in zoom-in-95 duration-200")}>
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#2D2D3F]">
                      {f.previewUrl ? <img src={f.previewUrl} alt={f.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#2D2D3F]" />}
                    </div>
                    <button onClick={() => handleRemoveFile(f.id)} className="absolute -top-1.5 -right-1.5 hover:scale-110 transition-transform">
                      <IconXCircle />
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
              if (!f?.id) return null;
              return (
                <div key={f.id} className={cn("flex items-center justify-between px-3 py-2 transition-all", idx < otherFiles.length - 1 && "border-b border-[#2D2D3F]/60", deletingIds.includes(f.id) ? "animate-file-exit" : "animate-in slide-in-from-left-2 duration-200")}>
                  <span className="text-white text-sm font-normal truncate pr-3">{f.name}</span>
                  <button onClick={() => handleRemoveFile(f.id)} className="flex-shrink-0 hover:scale-110 transition-transform">
                    <IconXCircle />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="absolute -bottom-[9px] left-2">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M0 0L8 10L16 0H0Z" fill="#3A3A4A" /></svg>
      </div>
    </div>
  );
}