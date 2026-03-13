// src/pages/Index.tsx
import type { AttachedFile } from "@/components/chat/AttachmentPanel";
import { useState } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";

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
  
  // ДОБАВИЛИ СОСТОЯНИЕ: ждем ли мы ответ от нейросети
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

  // ЛОГИКА УДАЛЕНИЯ ЧАТА
  const deleteChat = (idToDelete: string) => {
    setChats((prev) => {
      const filtered = prev.filter((chat) => chat.id !== idToDelete);
      
      // Если удалили все чаты, создаем новый пустой, чтобы интерфейс не сломался
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

      // Если удалили активный чат, переключаемся на соседний
      if (idToDelete === activeChatId) {
        setActiveChatId(filtered[0].id);
      }
      
      return filtered;
    });
  };

  // ЛОГИКА ПЕРЕИМЕНОВАНИЯ ЧАТА
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

    // 1. Сначала добавляем в чат ТОЛЬКО сообщение пользователя
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          const isFirst = chat.messages.length === 0;
          return {
            ...chat,
            title: isFirst
              ? content.trim().slice(0, 40) + (content.length > 40 ? "…" : "")
              : chat.title,
            messages: [...chat.messages, userMessage],
          };
        }
        return chat;
      })
    );

    // 2. Включаем режим ожидания (показываем галочку на кнопке)
    setIsGenerating(true);

    // 3. Имитируем задержку (раздумья нейросети) - 1.5 секунды
    setTimeout(() => {
      const mockResponses = [
        "Я — языковая модель на основе искусственного интеллекта. Могу отвечать на вопросы, помогать с текстами, кодом, анализом данных и многим другим.",
        "Отличный вопрос! Я могу помочь вам с широким спектром задач — от написания текстов до решения сложных технических задач.",
        "Я готов помочь вам! Расскажите подробнее, что именно вас интересует?",
        "Понял вас. Давайте разберём это вместе. Что именно вы хотите узнать или сделать?",
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        createdAt: new Date(),
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

      // 4. Отключаем режим ожидания (возвращаем стрелочку)
      setIsGenerating(false);
    }, 1500); // 1500 миллисекунд = 1.5 секунды
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#1A1A2E]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
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
        isGenerating={isGenerating} // Передаем пропс в ChatArea
      />
    </div>
  );
}