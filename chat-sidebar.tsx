"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Plus, BookOpen, Mic, Settings, Camera, Music, X } from "lucide-react"
import { useState, useRef } from "react"

interface Conversation {
  id: string
  title: string
  messages: any[]
  createdAt: number
}

interface ChatSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  onLearnLanguage?: () => void
  onVoiceChat?: () => void
  onDevSettings?: () => void
  onAICamera?: () => void
  onMusicSearch?: () => void
  isOpen?: boolean
  onClose?: () => void
}

export default function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onLearnLanguage,
  onVoiceChat,
  onDevSettings,
  onAICamera,
  onMusicSearch,
  isOpen = false,
  onClose,
}: ChatSidebarProps) {
  const [longPressId, setLongPressId] = useState<string | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const handleMouseDown = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressId(id)
    }, 500)
  }

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const sidebarContent = (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-sidebar-foreground">Obryn AI Chat</h1>
          <div className="flex items-center gap-2">
            {onDevSettings && (
              <button
                onClick={onDevSettings}
                className="p-1 hover:bg-sidebar-accent rounded-lg transition-colors"
                title="개발자 설정"
              >
                <Settings size={18} className="text-sidebar-foreground" />
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="md:hidden p-1 hover:bg-sidebar-accent rounded-lg transition-colors">
                <X size={18} className="text-sidebar-foreground" />
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Button
            onClick={onNewConversation}
            className="w-full gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Plus size={18} />
            New chat
          </Button>
          {onVoiceChat && (
            <Button
              onClick={onVoiceChat}
              className="w-full gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
            >
              <Mic size={18} />
              Voice Chat
            </Button>
          )}
          {onMusicSearch && (
            <Button
              onClick={onMusicSearch}
              className="w-full gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
            >
              <Music size={18} />
              Music Search
            </Button>
          )}
          {onAICamera && (
            <Button
              onClick={onAICamera}
              className="w-full gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
            >
              <Camera size={18} />
              AI Camera
            </Button>
          )}
          {onLearnLanguage && (
            <Button
              onClick={onLearnLanguage}
              className="w-full gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
            >
              <BookOpen size={18} />
              Learn Language
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onMouseDown={() => handleMouseDown(conversation.id)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={() => handleMouseDown(conversation.id)}
            onTouchEnd={handleMouseUp}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors select-none ${
              currentConversationId === conversation.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent text-sidebar-foreground"
            }`}
            onClick={() => {
              if (longPressId !== conversation.id) {
                onSelectConversation(conversation.id)
                onClose?.()
              }
              setLongPressId(null)
            }}
          >
            <span className="flex-1 truncate text-sm">{conversation.title}</span>
            {longPressId === conversation.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteConversation(conversation.id)
                  setLongPressId(null)
                }}
                className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* 모바일 모달 오버레이 */}
      {isOpen && onClose && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={onClose} />}

      {/* 사이드바 */}
      <div
        className={`fixed md:relative md:block z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  )
}
