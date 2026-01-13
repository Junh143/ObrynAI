"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import ChatSidebar from "@/components/chat-sidebar"
import ChatMessages from "@/components/chat-messages"
import { generateAIResponse } from "@/lib/ai"
import { Menu, Plus, Mic } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  type?: "chat" | "learn"
  language?: string
  detectedLanguage?: string
}

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [showVoiceChat, setShowVoiceChat] = useState(false)
  const [showDevSettings, setShowDevSettings] = useState(false)
  const [showAICamera, setShowAICamera] = useState(false)
  const [showMusicSearch, setShowMusicSearch] = useState(false)
  const [customSystemPrompt, setCustomSystemPrompt] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = audioContext.currentTime

      const osc1 = audioContext.createOscillator()
      const osc2 = audioContext.createOscillator()
      const gain = audioContext.createGain()

      osc1.frequency.value = 528
      osc2.frequency.value = 624
      osc1.type = "sine"
      osc2.type = "sine"

      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(audioContext.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.6)
      osc2.stop(now + 0.6)
    } catch (e) {
      console.log("오디오 컨텍스트 오류")
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("conversations")
    const lastConversationId = localStorage.getItem("lastConversationId")

    if (saved) {
      const parsedConversations = JSON.parse(saved)
      setConversations(parsedConversations)

      if (lastConversationId) {
        setCurrentConversationId(lastConversationId)
      } else if (parsedConversations.length > 0) {
        setCurrentConversationId(parsedConversations[0].id)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem("lastConversationId", currentConversationId)
    }
  }, [currentConversationId])

  useEffect(() => {
    if (currentConversationId) {
      const conversation = conversations.find((c) => c.id === currentConversationId)
      if (conversation) {
        setMessages(conversation.messages)
      }
    } else {
      setMessages([])
    }
  }, [currentConversationId, conversations])

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 100)
    return () => clearTimeout(timer)
  }, [messages, isLoading])

  useEffect(() => {
    if (conversations.length === 0 && currentConversationId === null) {
      const newId = Date.now().toString()
      const newConversation: Conversation = {
        id: newId,
        title: "New Conversation",
        messages: [],
        createdAt: Date.now(),
        type: "chat",
        detectedLanguage: "auto",
      }
      setConversations([newConversation])
      setCurrentConversationId(newId)
    }
  }, [conversations.length, currentConversationId])

  const createNewConversation = () => {
    const newId = Date.now().toString()
    const newConversation: Conversation = {
      id: newId,
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
      type: "chat",
      detectedLanguage: "auto",
    }
    setConversations([newConversation, ...conversations])
    setCurrentConversationId(newId)
    setMessages([])
  }

  const createLanguageLearningConversation = (languageId: string) => {
    const languageNames: Record<string, string> = {
      english: "English",
      korean: "한국어",
      chinese: "中文",
      spanish: "Español",
      french: "Français",
      japanese: "日本語",
      german: "Deutsch",
    }

    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `${languageNames[languageId]} 배우기`,
      messages: [],
      createdAt: Date.now(),
      type: "learn",
      language: languageId,
    }
    setConversations([newConversation, ...conversations])
    setCurrentConversationId(newConversation.id)
    setMessages([])
    setShowLanguageSelector(false)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversationId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const conversation = conversations.find((c) => c.id === currentConversationId)
      const isLearning = conversation?.type === "learn"
      const language = conversation?.type === "learn" ? conversation?.language : "auto"

      const conversationHistory = messages.map((msg) => ({
        role: msg.type as "user" | "assistant",
        content: msg.content,
      }))

      const aiResponse = await generateAIResponse(input, isLearning, language, conversationHistory)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: aiResponse,
      }
      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)

      playNotificationSound()

      setConversations(
        conversations.map((c) =>
          c.id === currentConversationId
            ? {
                ...c,
                messages: updatedMessages,
                title: c.messages.length === 0 ? input.slice(0, 30) : c.title,
              }
            : c,
        ),
      )
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !currentConversationId) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Handle image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()

        reader.onload = (e) => {
          const imageData = e.target?.result as string
          const imageMessage = `[Image: ${file.name}]\n${imageData.substring(0, 200)}...`
          setInput((prev) => prev + (prev ? "\n" : "") + imageMessage)
        }

        reader.readAsDataURL(file)
      } else {
        // Handle text files
        const reader = new FileReader()

        reader.onload = (e) => {
          const fileContent = e.target?.result as string
          const fileMessage = `[File: ${file.name}]\n${fileContent.substring(0, 500)}...`
          setInput((prev) => prev + (prev ? "\n" : "") + fileMessage)
        }

        reader.onerror = () => {
          console.error("파일 읽기 오류:", file.name)
        }

        reader.readAsText(file)
      }
    }

    // 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const deleteConversation = (id: string) => {
    const filtered = conversations.filter((c) => c.id !== id)
    setConversations(filtered)
    if (currentConversationId === id) {
      setCurrentConversationId(filtered[0]?.id || null)
    }
  }

  const deleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter((msg) => msg.id !== messageId)
    setMessages(updatedMessages)

    setConversations(
      conversations.map((c) =>
        c.id === currentConversationId
          ? {
              ...c,
              messages: updatedMessages,
            }
          : c,
      ),
    )
  }

  const editMessage = (messageId: string, newContent: string) => {
    const updatedMessages = messages.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg))
    setMessages(updatedMessages)

    setConversations(
      conversations.map((c) =>
        c.id === currentConversationId
          ? {
              ...c,
              messages: updatedMessages,
            }
          : c,
      ),
    )
  }

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript)
    setSidebarOpen(false)
    setShowVoiceChat(false)
  }

  const handleDevSettingsSave = (prompt: string) => {
    setCustomSystemPrompt(prompt)
  }

  const handleVoiceRecording = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        const chunks: Blob[] = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" })

          const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)()
          recognition.continuous = false
          recognition.interimResults = false

          // Create audio from blob for recognition
          const audioUrl = URL.createObjectURL(blob)

          // Use Web Speech API for transcription
          recognition.onresult = async (event) => {
            let transcript = ""
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript
              }
            }

            if (!transcript.trim()) {
              console.log("음성 인식 실패")
              setIsRecording(false)
              return
            }

            // Auto-send voice message with actual transcription
            const userMessage: Message = {
              id: Date.now().toString(),
              type: "user",
              content: transcript,
            }

            const newMessages = [...messages, userMessage]
            setMessages(newMessages)
            setInput("")
            setIsLoading(true)

            try {
              const conversation = conversations.find((c) => c.id === currentConversationId)
              const isLearning = conversation?.type === "learn"
              const language = conversation?.type === "learn" ? conversation?.language : "auto"

              const conversationHistory = messages.map((msg) => ({
                role: msg.type as "user" | "assistant",
                content: msg.content,
              }))

              const aiResponse = await generateAIResponse(transcript, isLearning, language, conversationHistory)
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: "assistant",
                content: aiResponse,
              }
              const updatedMessages = [...newMessages, assistantMessage]
              setMessages(updatedMessages)

              playNotificationSound()

              setConversations(
                conversations.map((c) =>
                  c.id === currentConversationId
                    ? {
                        ...c,
                        messages: updatedMessages,
                        title: c.messages.length === 0 ? transcript.slice(0, 30) : c.title,
                      }
                    : c,
                ),
              )
            } catch (error) {
              console.error("Error:", error)
            } finally {
              setIsLoading(false)
              URL.revokeObjectURL(audioUrl)
            }
          }

          recognition.onerror = (event) => {
            console.error("음성 인식 오류:", event.error)
            setIsRecording(false)
          }

          stream.getTracks().forEach((track) => track.stop())
        }

        mediaRecorder.start()
        setIsRecording(true)
      } catch (error) {
        console.error("마이크 접근 오류:", error)
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={(id) => {
          setCurrentConversationId(id)
          setSidebarOpen(false)
        }}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onLearnLanguage={() => {
          setShowLanguageSelector(true)
          setSidebarOpen(false)
        }}
        onVoiceChat={() => {
          setShowVoiceChat(true)
          setSidebarOpen(false)
        }}
        onAICamera={() => {
          setShowAICamera(true)
          setSidebarOpen(false)
        }}
        onMusicSearch={() => {
          setShowMusicSearch(true)
          setSidebarOpen(false)
        }}
        onDevSettings={() => {
          setShowDevSettings(true)
          setSidebarOpen(false)
        }}
      />

      <div className="flex flex-col w-full h-screen overflow-hidden">
        <div className="md:hidden sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-background border-b border-gray-700">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Menu size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Obryn AI</h1>
          <div className="w-8" />
        </div>

        <div className="hidden md:flex sticky top-0 z-40 items-center justify-center h-16 px-4 bg-background border-b border-gray-700">
          <h1 className="text-lg font-bold text-white">Obryn AI</h1>
        </div>

        {/* Messages container with proper flex layout */}
        <div className="flex-1 flex flex-col min-h-0">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center text-gray-400">
                <h2 className="text-2xl font-bold text-white mb-2">Obryn AI</h2>
              </div>
            </div>
          ) : (
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              onDeleteMessage={deleteMessage}
              onEditMessage={editMessage}
            />
          )}
        </div>

        <div className="px-4 py-4 bg-background">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center"
            >
              <Plus size={20} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.txt,.pdf,.md,.json,.csv,.doc,.docx"
            />

            <textarea
              className="flex-1 bg-gray-700 text-white rounded-3xl px-4 resize-none border-0 focus:outline-none focus:ring-0 h-10"
              style={{
                height: "40px",
                padding: "8px 16px",
                lineHeight: "24px",
                fontFamily: "inherit",
              }}
              placeholder=""
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              rows={1}
            />

            <button
              onClick={() => setIsRecording(!isRecording)}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center"
            >
              <Mic size={20} className="text-white" />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16585267 C3.50612381,-0.1 2.40999006,-0.0429026384 1.77946707,0.41212249 C0.994623095,1.04788281 0.837654326,2.1372503 1.15159189,2.92274725 L3.03521743,9.36373722 C3.03521743,9.52083453 3.19218622,9.67793185 3.50612381,9.67793185 L16.6915026,10.4634188 C16.6915026,10.4634188 17.1624089,10.4634188 17.1624089,9.99211654 L17.1624089,11.0814840 C17.1624089,11.5527762 16.6915026,11.4744748 16.6915026,12.4744748 Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
