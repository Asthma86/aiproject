// src/pages/Index.tsx
import type { AttachedFile } from "@/components/chat/AttachmentPanel";
import { useState } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";

export interface Source {
  id: string;
  title: string;
  url?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  attachments?: AttachedFile[];
  sources?: Source[];
}

export default function Index() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "New chat",
      messages: [],
      createdAt: new Date(),
    },
  ]);
  const [activeChatId, setActiveChatId] = useState("1");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? chats[0];

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New chat",
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const deleteChat = (idToDelete: string) => {
    setChats((prev) => {
      const filtered = prev.filter((chat) => chat.id !== idToDelete);
      
      if (filtered.length === 0) {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: "New chat",
          messages: [],
          createdAt: new Date(),
        };
        setActiveChatId(newChat.id);
        return [newChat];
      }

      if (idToDelete === activeChatId) {
        setActiveChatId(filtered[0].id);
      }
      
      return filtered;
    });
  };

  const renameChat = (id: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat))
    );
  };

  const sendMessage = (content: string, files: AttachedFile[] = []) => {
    if (!content.trim() && files.length === 0) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      createdAt: new Date(),
      attachments: files.length > 0 ? files : undefined, 
    };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          const isFirst = chat.messages.length === 0;
          
          let newTitle = chat.title;
          if (isFirst) {
            if (content.trim()) {
              newTitle = content.trim().slice(0, 40) + (content.length > 40 ? "…" : "");
            } else if (files.length > 0) {
              newTitle = files[0].name.slice(0, 40) + (files[0].name.length > 40 ? "…" : "");
            }
          }

          return {
            ...chat,
            title: newTitle,
            messages: [...chat.messages, userMessage],
          };
        }
        return chat;
      })
    );

    setIsGenerating(true);

    setTimeout(() => {
      const mockResponses = [
        "Я проанализировал отправленные вами данные. Чем еще могу помочь?",
        "Отличный материал! Давайте разберем его подробнее.",
        "Готово. Я ознакомился с документом, задавайте вопросы.",
      ];

      // ВОТ ТУТ Я ВЕРНУЛ 6 ИСТОЧНИКОВ:
      const mockSources: Source[] = [
        { id: "s1", title: "API_Documentation_v2.pdf" },
        { id: "s2", title: "wiki.confluence.com/rag-setup", url: "https://example.com" },
        { id: "s3", title: "user_guide_final_draft.docx" },
        { id: "s4", title: "Архитектура_БД_v3.pdf" },
        { id: "s5", title: "github.com/backend/auth", url: "https://github.com" },
        { id: "s6", title: "Инструкция по деплою.txt" },
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        createdAt: new Date(),
        sources: mockSources, // Передаем все 6, чтобы появилась кнопка "+3 еще"
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, assistantMessage],
            };
          }
          return chat;
        })
      );

      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#1A1A2E]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/40 backdrop-blur-sm md:hidden animate-bg"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setSidebarOpen(false);
        }}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatArea
        chat={activeChat}
        onSendMessage={sendMessage}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
        isGenerating={isGenerating}
      />
    </div>
  );
}