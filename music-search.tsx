"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Mic, Upload } from "lucide-react"

interface MusicSearchProps {
  isOpen: boolean
  onClose: () => void
}

export default function MusicSearch({ isOpen, onClose }: MusicSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/music-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      const data = await response.json()
      setResults(data.result)
    } catch (error) {
      setResults("음악 검색 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceSearch = async () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setResults("브라우저가 음성 인식을 지원하지 않습니다.")
      return
    }

    const SpeechRecognition = window.webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = "ko-KR"
    recognition.continuous = false
    recognition.interimResults = false

    setIsListening(true)

    recognition.onstart = () => {
      console.log("[v0] 음성 인식 시작")
    }

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("")
      setQuery(transcript)
    }

    recognition.onerror = (event: any) => {
      console.log("[v0] 음성 인식 오류:", event.error)
      setResults("음성 인식 중 오류가 발생했습니다.")
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    setResults("음악을 분석 중입니다...")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/music-search", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      setResults(data.result)
      setQuery(file.name)
    } catch (error) {
      setResults("음악 분석 중 오류가 발생했습니다.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg backdrop-animation transition-all duration-300">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 border border-border animate-in fade-in scale-95 duration-300 modal-animation">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">음악 검색</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X size={20} className="text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">노래 제목 또는 아티스트 검색</label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: Bohemian Rhapsody, Taylor Swift..."
              className="bg-background border border-border text-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-2 font-medium transition-all"
            >
              {isLoading ? "검색 중..." : "검색"}
            </Button>
            <Button
              type="button"
              onClick={handleVoiceSearch}
              disabled={isLoading || isListening}
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg py-2 font-medium transition-all flex items-center justify-center gap-2"
            >
              <Mic size={16} />
              {isListening ? "듣는 중..." : "음성"}
            </Button>
          </div>

          <div className="relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioFileUpload}
              disabled={isAnalyzing}
              className="hidden"
              id="audio-file-input"
            />
            <label htmlFor="audio-file-input" asChild>
              <Button
                type="button"
                disabled={isAnalyzing}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg py-2 font-medium transition-all flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById("audio-file-input")?.click()
                }}
              >
                <Upload size={16} />
                {isAnalyzing ? "분석 중..." : "음악 파일"}
              </Button>
            </label>
          </div>
        </form>

        {results && (
          <div className="mt-4 p-4 bg-background rounded-lg border border-border max-h-64 overflow-y-auto">
            <p className="text-sm text-foreground whitespace-pre-wrap">{results}</p>
          </div>
        )}
      </div>
    </div>
  )
}
