"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Smartphone } from "lucide-react"

interface AICameraProps {
  isOpen: boolean
  onClose: () => void
}

export default function AICamera({ isOpen, onClose }: AICameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [description, setDescription] = useState("카메라를 시작하면 물체를 인식합니다...")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsRunning(true)
        }
      } catch (error) {
        console.error("[v0] 카메라 접근 오류:", error)
        setDescription("카메라를 사용할 수 없습니다")
      }
    }

    startCamera()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current)
      }
    }
  }, [isOpen, facingMode])

  const toggleCamera = async () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(newFacingMode)
  }

  const analyzeFrame = async () => {
    if (!canvasRef.current || !videoRef.current || isAnalyzing) return

    setIsAnalyzing(true)
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      ctx.drawImage(videoRef.current, 0, 0)

      const imageData = canvas.toDataURL("image/jpeg", 0.8)
      console.log("[v0] 이미지 데이터 생성됨, 크기:", imageData.length)

      console.log("[v0] Vision API 호출 시작")
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      })

      console.log("[v0] Vision API 응답 상태:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Vision API 오류 상태:", response.status, errorText)
        throw new Error(`Vision API 오류: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Vision 분석 결과:", data.description?.substring(0, 50))
      setDescription(data.description || "분석 중...")

      try {
        const utterance = new SpeechSynthesisUtterance(data.description)
        utterance.lang = "ko-KR"
        utterance.rate = 1
        utterance.pitch = 1
        utterance.volume = 1
        speechSynthesis.cancel()
        speechSynthesis.speak(utterance)
      } catch (e) {
        console.log("[v0] 음성 재생 오류:", e)
      }
    } catch (error) {
      console.error("[v0] 프레임 분석 오류:", error)
      setDescription("분석 중 오류가 발생했습니다")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
      analysisIntervalRef.current = null
      setDescription("분석 중지됨")
    } else {
      analyzeFrame()
      analysisIntervalRef.current = setInterval(analyzeFrame, 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-lg backdrop-animation flex items-center justify-center p-4">
      <div className="bg-black rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-800 modal-animation">
        <div className="bg-black/80 border-b border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">AI 카메라</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video border border-gray-800">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="text-white text-sm font-semibold">분석 중...</div>
              </div>
            )}
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 min-h-24 flex items-center justify-center">
            <p className="text-center text-gray-200 text-sm leading-relaxed font-sans">{description}</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={toggleAnalysis}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-full transition-all"
            >
              {analysisIntervalRef.current ? "분석 중지" : "분석 시작"}
            </Button>
            <Button
              onClick={toggleCamera}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 rounded-full transition-all flex items-center justify-center gap-2"
            >
              <Smartphone size={16} />
              {facingMode === "user" ? "후면" : "전면"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 py-2 rounded-full bg-gray-900 border-gray-800 text-white hover:bg-gray-800"
            >
              종료
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
