// src/components/chat/Sidebar.tsx
import { useState, useRef, useEffect } from "react";
import { type Chat } from "@/pages/Index";
import { cn } from "@/lib/utils";
import { IconSearch, IconMore, IconEdit, IconTrash } from "@/components/Icons";

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
  // (Код функции groupChatsByDate остается без изменений)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const lastWeek = new Date(today.getTime() - 7 * 86400000);
  const groups: { label: string; chats: Chat[] }[] = [];
  const todayChats = chats.filter((c) => new Date(c.createdAt) >= today);
  const yesterdayChats = chats.filter((c) => new Date(c.createdAt) >= yesterday && new Date(c.createdAt) < today);
  const weekChats = chats.filter((c) => new Date(c.createdAt) >= lastWeek && new Date(c.createdAt) < yesterday);
  const olderChats = chats.filter((c) => new Date(c.createdAt) < lastWeek);
  if (todayChats.length) groups.push({ label: "Сегодня", chats: todayChats });
  if (yesterdayChats.length) groups.push({ label: "Вчера", chats: yesterdayChats });
  if (weekChats.length) groups.push({ label: "На этой неделе", chats: weekChats });
  if (olderChats.length) groups.push({ label: "Раньше", chats: olderChats });
  return groups;
}

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat, isOpen, onClose }: SidebarProps) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredChats = chats.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
  const groups = groupChatsByDate(filteredChats);

  useEffect(() => {
    if (editingId && inputRef.current) inputRef.current.focus();
  }, [editingId]);

  const handleRenameSubmit = (chatId: string) => {
    if (editValue.trim()) onRenameChat(chatId, editValue.trim());
    setEditingId(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setDeletingId(chatId); 
    setTimeout(() => { onDeleteChat(chatId); setDeletingId(null); }, 300);
  };

  return (
    <aside className={cn("flex-shrink-0 flex flex-col h-full transition-transform duration-300 ease-in-out overflow-hidden bg-[#1E1E2E] md:w-[300px] md:relative md:translate-x-0 md:z-auto", isOpen ? "fixed left-0 top-0 z-20 w-[300px] translate-x-0" : "fixed left-0 top-0 z-20 w-[300px] -translate-x-full md:translate-x-0")}>
      <div className="px-6 pt-8 pb-3 flex-shrink-0">
        <button onClick={onNewChat} className="w-full h-11 rounded-full bg-[#6C5CE7] border border-black shadow-[0_4px_4px_rgba(0,0,0,0.25)] text-white text-sm font-bold hover:bg-[#7D6EF0] active:bg-[#5B4DD6] transition-all transform hover:scale-[1.02] active:scale-[0.98]">
          + Новый чат
        </button>
      </div>

      <div className="px-6 pt-3 pb-0 flex-shrink-0">
        <div className="relative flex items-center group">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#79747E] group-focus-within:text-[#6C5CE7] transition-colors">
            <IconSearch size={20} />
          </div>
          <input type="text" placeholder="Поиск в чатах" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-11 pr-3 rounded-lg bg-[#2A2A3A] border border-[#3A3A4A] text-[#F7F7FF] text-sm font-normal placeholder-[#8D8D99] outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] transition-all duration-200 shadow-inner" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 px-6 pb-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="text-[#8D8D99] text-xs font-bold uppercase tracking-wider mb-2.5 ml-1">{group.label}</p>
            <div className="w-full h-px bg-[#3A3A4A] mb-2" />
            
            <div className="flex flex-col gap-1">
              {group.chats.map((chat) => (
                <div key={chat.id} className={`group/item relative flex items-center w-full hover:z-50 ${deletingId === chat.id ? "animate-chat-exit" : "animate-chat-enter"}`}>
                  {editingId === chat.id ? (
                    <input ref={inputRef} type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleRenameSubmit(chat.id)} onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(chat.id); if (e.key === "Escape") setEditingId(null); }} className="w-full text-left px-4 py-2 rounded-lg text-sm font-normal text-white bg-[#1A1A2E] border-2 border-[#6C5CE7] outline-none shadow-inner" />
                  ) : (
                    <>
                      <button onClick={() => onSelectChat(chat.id)} className={cn("w-full text-left px-4 py-[9px] pr-10 rounded-lg text-sm font-normal transition-all duration-200 truncate shadow-sm", chat.id === activeChatId ? "bg-gradient-to-r from-[#3A3A4A] to-[#444453] text-[#F7F7FF]" : "text-[#B8B8C0] hover:bg-[#3A3A4A]/60 hover:text-white")}>
                        {chat.title}
                      </button>
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <div className="group/menu relative flex items-center h-full pt-1">
                          <button className="p-1.5 text-[#8D8D99] hover:text-white rounded-md hover:bg-[#2D2D3F] transition-colors">
                            <IconMore size={18} />
                          </button>
                          <div className="absolute right-0 top-full pt-1.5 hidden group-hover/menu:block w-44 z-50">
                            <div className="bg-[#2D2D3F] border border-[#3A3A4A] rounded-lg shadow-xl overflow-hidden py-1.5 animate-menu">
                              <button onClick={(e) => { e.stopPropagation(); setEditingId(chat.id); setEditValue(chat.title); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#E0E0E0] hover:bg-[#3A3A4A] transition-colors whitespace-nowrap">
                                <IconEdit size={14} /> Переименовать
                              </button>
                              <button onClick={(e) => handleDeleteClick(e, chat.id)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#FF6B6B] hover:bg-[#3A3A4A] transition-colors whitespace-nowrap">
                                <IconTrash size={14} /> Удалить
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