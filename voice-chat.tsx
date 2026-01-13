"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"

interface VoiceChatProps {
  isOpen: boolean
  onClose: () => void
  onTranscript: (text: string) => void
  onAIResponse?: (text: string) => void
}

export default function VoiceChat({ isOpen, onClose, onTranscript, onAIResponse }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const speakAIResponse = (text: string) => {
    if (!("speechSynthesis" in window)) {
      console.error("[v0] 음성 합성을 지원하지 않습니다")
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "ko-KR"
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error("[v0] 음성 합성 오류:", event.error)
      setIsSpeaking(false)
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setErrorMessage("음성 인식을 지원하지 않는 브라우저입니다")
      return
    }

    try {
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = "ko-KR"
      recognition.maxAlternatives = 1

      recognitionRef.current = recognition

      recognition.onstart = () => {
        console.log("[v0] 음성 인식 시작됨")
        setIsListening(true)
        setTranscript("")
        setErrorMessage("")
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript

          if (event.results[i].isFinal) {
            finalTranscript += transcriptSegment + " "
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript)
          if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
          silenceTimeoutRef.current = setTimeout(() => {
            console.log("[v0] 무음 감지로 인식 종료")
            recognition.stop()
          }, 1500)
        }
      }

      recognition.onend = () => {
        console.log("[v0] 음성 인식 종료됨")
        setIsListening(false)
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)

        const finalTranscript = transcript.trim()
        if (finalTranscript) {
          onTranscript(finalTranscript)
          if (onAIResponse) {
            // Simulate AI response after a delay
            setTimeout(() => {
              onAIResponse("안녕하세요! 무엇을 도와드릴까요?")
              speakAIResponse("안녕하세요! 무엇을 도와드릴까요?")
            }, 1000)
          }
        }
      }

      recognition.onerror = (event: any) => {
        console.error("[v0] 음성 인식 오류:", event.error)

        if (event.error === "aborted") {
          console.log("[v0] 음성 인식이 중단되었습니다")
          setIsListening(false)
          return
        }

        if (event.error === "no-speech") {
          setErrorMessage("음성이 감지되지 않았습니다. 다시 시도해주세요")
        } else {
          setErrorMessage(`오류: ${event.error}`)
        }

        setIsListening(false)
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
      }

      console.log("[v0] 음성 인식 start() 호출")
      recognition.start()
    } catch (err) {
      console.error("[v0] 음성 인식 초기화 오류:", err)
      setErrorMessage("음성 인식을 시작할 수 없습니다")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)

      const finalTranscript = transcript.trim()
      if (finalTranscript) {
        onTranscript(finalTranscript)
        setTranscript("")
        onClose()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-lg backdrop-animation flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-sm w-full mx-4 p-8 modal-animation">
        <h2 className="text-xl font-bold text-foreground mb-6 text-center">음성 채팅</h2>

        <div className="flex justify-center mb-6">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening ? "bg-primary animate-pulse" : isSpeaking ? "bg-accent animate-pulse" : "bg-muted"}`}
          >
            <Mic size={32} className={`text-foreground ${isListening ? "smooth-spin" : ""}`} />
          </div>
        </div>

        <p className="text-center text-muted-foreground mb-6">
          {isListening
            ? "말씀해주세요..."
            : isSpeaking
              ? "AI가 답변 중입니다..."
              : errorMessage || "시작하려면 버튼을 누르세요"}
        </p>

        <div className="bg-muted rounded-lg p-4 mb-6 min-h-12">
          <p className="text-foreground text-sm break-words">{transcript || "인식된 텍스트가 여기 표시됩니다"}</p>
        </div>

        <div className="flex gap-2">
          {!isListening && !isSpeaking ? (
            <Button onClick={startListening} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              <Mic size={18} className="mr-2" />
              시작
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSpeaking}
            >
              <Square size={18} className="mr-2" />
              중지
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
}
