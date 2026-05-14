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

export type AppMode = "chat" | "generator";

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  mode: AppMode;
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
  const [activeMode, setActiveMode] = useState<AppMode>("chat");

  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "New chat",
      messages: [],
      createdAt: new Date(),
      mode: "chat",
    },
    {
      id: "2",
      title: "New statement",
      messages: [],
      createdAt: new Date(),
      mode: "generator",
    },
  ]);
  
  const [activeChatId, setActiveChatId] = useState("1");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentModeChats = chats.filter((c) => c.mode === activeMode);
  const activeChat = currentModeChats.find((c) => c.id === activeChatId) ?? currentModeChats[0];

  const handleModeChange = (newMode: AppMode) => {
    setActiveMode(newMode);
    const modeChats = chats.filter((c) => c.mode === newMode);
    if (modeChats.length > 0) {
      setActiveChatId(modeChats[0].id);
    } else {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: newMode === "chat" ? "New chat" : "New statement",
        messages: [],
        createdAt: new Date(),
        mode: newMode,
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: activeMode === "chat" ? "New chat" : "New statement",
      messages: [],
      createdAt: new Date(),
      mode: activeMode,
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const deleteChat = (idToDelete: string) => {
    setChats((prev) => {
      const filtered = prev.filter((chat) => chat.id !== idToDelete);
      const remainingInMode = filtered.filter((chat) => chat.mode === activeMode);
      
      if (remainingInMode.length === 0) {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: activeMode === "chat" ? "New chat" : "New statement",
          messages: [],
          createdAt: new Date(),
          mode: activeMode,
        };
        setActiveChatId(newChat.id);
        return [...filtered, newChat];
      }

      if (idToDelete === activeChatId) {
        setActiveChatId(remainingInMode[0].id);
      }
      
      return filtered;
    });
  };

  const renameChat = (id: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat))
    );
  };

  const sendMessage = async (content: string, files: AttachedFile[] = []) => {
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

    try {

      const webhookUrl = activeChat.mode === "generator" 
        ? import.meta.env.VITE_N8N_WEBHOOK_GENERATOR
        : import.meta.env.VITE_N8N_WEBHOOK_CHAT;

      // Защита от запуска приложения без настроенного .env
      if (!webhookUrl) {
        throw new Error(`CRITICAL: В файле .env не указана ссылка для режима: ${activeChat.mode}`);
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatId,
          mode: activeChat.mode,
          message: content.trim(),
          files: files.map(f => ({ name: f.name, type: f.type, size: f.size }))
        }),
      });

      if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

      const data = await response.json();
      const aiContent = data.output || data.text || data.response || data.message || JSON.stringify(data);
      const aiSources = data.sources || [];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
        createdAt: new Date(),
        sources: aiSources,
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChatId) {
            return { ...chat, messages: [...chat.messages, assistantMessage] };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error("Системная ошибка:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Произошла ошибка при обработке запроса. Пожалуйста, обратитесь к администратору или проверьте конфигурацию сервера.",
        createdAt: new Date(),
      };
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChatId) {
            return { ...chat, messages: [...chat.messages, errorMessage] };
          }
          return chat;
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const inputPlaceholder = activeMode === "generator" 
    ? "Напишите или загрузите заявление" 
    : "Что ты умеешь?";

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/40 backdrop-blur-sm md:hidden animate-bg"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        chats={currentModeChats}
        activeChatId={activeChatId}
        activeMode={activeMode}
        onModeChange={handleModeChange}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setSidebarOpen(false);
        }}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        isOpen={sidebarOpen}
      />

      <ChatArea
        chat={activeChat}
        onSendMessage={sendMessage}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        isGenerating={isGenerating}
        placeholder={inputPlaceholder}
      />
    </div>
  );
}