import { useState, useRef, useEffect } from "react";
import { type Chat } from "@/pages/Index";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

function groupChatsByDate(chats: Chat[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const lastWeek = new Date(today.getTime() - 7 * 86400000);

  const groups: { label: string; chats: Chat[] }[] = [];

  const todayChats = chats.filter((c) => new Date(c.createdAt) >= today);
  const yesterdayChats = chats.filter(
    (c) => new Date(c.createdAt) >= yesterday && new Date(c.createdAt) < today
  );
  const weekChats = chats.filter(
    (c) =>
      new Date(c.createdAt) >= lastWeek && new Date(c.createdAt) < yesterday
  );
  const olderChats = chats.filter((c) => new Date(c.createdAt) < lastWeek);

  if (todayChats.length) groups.push({ label: "Сегодня", chats: todayChats });
  if (yesterdayChats.length)
    groups.push({ label: "Вчера", chats: yesterdayChats });
  if (weekChats.length)
    groups.push({ label: "На этой неделе", chats: weekChats });
  if (olderChats.length) groups.push({ label: "Раньше", chats: olderChats });

  return groups;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onClose,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const groups = groupChatsByDate(filteredChats);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleRenameSubmit = (chatId: string) => {
    if (editValue.trim()) {
      onRenameChat(chatId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <aside
      className={cn(
        "flex-shrink-0 flex flex-col h-full transition-all duration-300 overflow-hidden",
        "bg-[#1E1E2E]",
        "md:w-[300px] md:relative md:translate-x-0 md:z-auto",
        isOpen
          ? "fixed left-0 top-0 z-20 w-[300px] translate-x-0"
          : "fixed left-0 top-0 z-20 w-[300px] -translate-x-full md:translate-x-0"
      )}
    >
      <div className="px-[30px] pt-10 pb-0 flex-shrink-0">
        <button
          onClick={onNewChat}
          className="w-full h-11 rounded-lg bg-[#6C5CE7] border border-black shadow-[0_4px_4px_rgba(0,0,0,0.25)] text-white text-sm font-bold hover:bg-[#7D6EF0] active:bg-[#5B4DD6] transition-colors"
        >
          + Новый чат
        </button>
      </div>

      <div className="px-[26px] pt-[14px] pb-0 flex-shrink-0">
        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z" fill="#79747E" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Поиск в чатах"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-10 pr-3 rounded-lg bg-[#3A3A4A] text-[#8D8D99] text-sm font-bold placeholder-[#8D8D99] outline-none border-none focus:ring-1 focus:ring-[#6C5CE7] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 px-[30px] pb-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="text-[#B8B8C0] text-xs font-semibold mb-2">{group.label}</p>
            <div className="w-full h-px bg-[#3A3A4A] mb-2" />
            
            <div className="flex flex-col gap-0.5">
              {group.chats.map((chat) => (
                <div key={chat.id} className="group relative flex items-center w-full hover:z-50">
                  
                  {editingId === chat.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleRenameSubmit(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit(chat.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full text-left px-4 py-[9px] rounded-lg text-sm font-normal text-white bg-[#2A2A3A] border border-[#6C5CE7] outline-none"
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => onSelectChat(chat.id)}
                        className={cn(
                          "w-full text-left px-4 py-[9px] pr-10 rounded-lg text-sm font-normal text-white transition-colors truncate",
                          chat.id === activeChatId
                            ? "bg-gradient-to-r from-[#3A3A4A] to-[#444453]"
                            : "hover:bg-[#3A3A4A]/60"
                        )}
                      >
                        {chat.title}
                      </button>
                      
                      {/* Контейнер меню (появляется при наведении на чат) */}
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="group/menu relative flex items-center h-full">
                          
                          <button className="p-1.5 text-[#8D8D99] hover:text-white rounded-md hover:bg-[#2A2A3A] transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="12" cy="5" r="1"></circle>
                              <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                          </button>
                          
                          {/* Выпадающее меню с невидимым мостиком (pt-1) для плавного наведения */}
                          <div className="absolute right-0 top-full pt-1 hidden group-hover/menu:block w-40 z-50">
                            <div className="bg-[#2A2A3A] border border-[#3A3A4A] rounded-lg shadow-xl overflow-hidden py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(chat.id);
                                  setEditValue(chat.title);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#3A3A4A] transition-colors"
                              >
                                {/* Иконка карандаша */}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 20h9"></path>
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                                Переименовать
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteChat(chat.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#FF6B6B] hover:bg-[#3A3A4A] transition-colors"
                              >
                                {/* Иконка корзины */}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Удалить
                              </button>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}