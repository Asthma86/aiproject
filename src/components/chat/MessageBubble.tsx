// src/components/chat/MessageBubble.tsx
import type { Message } from "@/pages/Index";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isUser
            ? "bg-[#6C5CE7] text-white"
            : "bg-[#3A3A4A] text-gray-100"
        }`}
      >
        {/* Блок для отображения файлов */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.attachments.map((file) => {
              
              if (!file?.id) {
                return null;
              }

              return (
                <div key={file.id} className="relative">
                  {file.isImage && file.previewUrl ? (
                    // Картинка
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#2D2D3F]">
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    // Файл (не картинка)
                    <div className="w-48 h-12 rounded-lg bg-[#2D2D3F] flex items-center px-3 gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"
                          fill="#8D8D99"
                        />
                      </svg>
                      <span className="text-xs text-[#B8B8C0] truncate">
                        {file.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Текст сообщения */}
        {message.content && (
          <p className="text-sm">{message.content}</p>
        )}

        {/* Время */}
        <span className="text-xs opacity-70 mt-1 block">
          {message.createdAt.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}