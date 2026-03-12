// src/pages/Index.tsx
import { useState } from "react"; 
import type { Chat, Message } from "@/types/chat"; 
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

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      createdAt: new Date(),
    };

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
          const isFirst = chat.messages.length === 0;
          return {
            ...chat,
            title: isFirst
              ? content.trim().slice(0, 40) + (content.length > 40 ? "…" : "")
              : chat.title,
            messages: [...chat.messages, userMessage, assistantMessage],
          };
        }
        return chat;
      })
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#1A1A2E]">
      {/* Mobile overlay */}
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
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatArea
        chat={activeChat}
        onSendMessage={sendMessage}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />
    </div>
  );
}
