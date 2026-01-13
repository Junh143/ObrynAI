"use client"

import { forwardRef, useEffect, useRef, useState } from "react"
import { Trash2, Edit2, Check, X } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
}

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  onAIResponse?: () => void
  onDeleteMessage?: (messageId: string) => void
  onEditMessage?: (messageId: string, newContent: string) => void
}

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, isLoading, onAIResponse, onDeleteMessage, onEditMessage }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState("")
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
    const longPressDurationRef = useRef(500) // 500ms to trigger

    useEffect(() => {
      if (containerRef.current) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
        }, 100)
      }
    }, [messages, isLoading])

    const handleEditStart = (message: Message) => {
      if (message.type === "assistant") {
        setEditingId(message.id)
        setEditContent(message.content)
      }
    }

    const handleEditSave = (messageId: string) => {
      if (onEditMessage && editContent.trim()) {
        onEditMessage(messageId, editContent)
        setEditingId(null)
      }
    }

    const handleEditCancel = () => {
      setEditingId(null)
      setEditContent("")
    }

    const handleDeleteMessage = (messageId: string) => {
      if (onDeleteMessage) {
        onDeleteMessage(messageId)
      }
    }

    const handleLongPressStart = (messageId: string) => {
      longPressTimerRef.current = setTimeout(() => {
        setHoveredMessageId(messageId)
      }, longPressDurationRef.current)
    }

    const handleLongPressEnd = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }

    return (
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-background" style={{ scrollBehavior: "smooth" }}>
        <div className="flex flex-col p-6 space-y-4 max-w-4xl mx-auto min-h-full">
          {messages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-base">How can I help you today?</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex message-animation ${message.type === "user" ? "justify-end" : "justify-start gap-3"}`}
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {message.type === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  AI
                </div>
              )}
              <div className="relative max-w-2xl">
                {editingId === message.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="bg-gray-700 text-gray-100 px-6 py-3 rounded-3xl border-2 border-blue-500 focus:outline-none resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(message.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                      >
                        <Check size={16} />
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      className={`max-w-2xl px-6 py-3 transition-all duration-200 ${
                        message.type === "user"
                          ? "bg-blue-600 text-white rounded-3xl"
                          : "bg-gray-700 text-gray-100 rounded-3xl cursor-pointer hover:bg-gray-600"
                      }`}
                      onMouseDown={() => message.type === "assistant" && handleLongPressStart(message.id)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                      onTouchStart={() => message.type === "assistant" && handleLongPressStart(message.id)}
                      onTouchEnd={handleLongPressEnd}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{message.content}</p>
                    </div>
                    {message.type === "assistant" && hoveredMessageId === message.id && (
                      <div className="absolute right-0 top-0 -translate-y-10 flex gap-2 bg-gray-800 rounded-lg p-2 transition-opacity">
                        <button
                          onClick={() => handleEditStart(message)}
                          className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
                          title="Edit message"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-red-400 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start gap-3 message-animation">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-white border-r-white animate-spin"></div>
                <div className="text-white text-xs font-bold z-10">AI</div>
              </div>
              <div className="bg-gray-700 text-gray-100 px-6 py-3 rounded-3xl">
                <p className="text-sm leading-relaxed font-sans">Generating response...</p>
              </div>
            </div>
          )}

          {messages.length > 0 &&
            messages[messages.length - 1]?.type === "assistant" &&
            !isLoading &&
            (() => {
              if (onAIResponse) onAIResponse()
              return null
            })()}
        </div>
      </div>
    )
  },
)

ChatMessages.displayName = "ChatMessages"

export default ChatMessages
