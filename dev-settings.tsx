"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Lock, Unlock } from "lucide-react"

interface DevSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSave: (systemPrompt: string) => void
}

export default function DevSettings({ isOpen, onClose, onSave }: DevSettingsProps) {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState("")
  const [authError, setAuthError] = useState("")
  const [sitePassword, setSitePassword] = useState("ZHZHDK12!")
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [responseLength, setResponseLength] = useState<"short" | "medium" | "long">("medium")
  const [noRestrictions, setNoRestrictions] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [activeUsers, setActiveUsers] = useState(0)

  useEffect(() => {
    const savedSitePassword = localStorage.getItem("sitePassword")
    if (savedSitePassword) {
      setSitePassword(savedSitePassword)
    } else {
      localStorage.setItem("sitePassword", "ZHZHDK12!")
    }
  }, [])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const currentPassword = localStorage.getItem("sitePassword")
    const passwordToCheck = currentPassword || "ZHZHDK12!"

    console.log("[v0] Password check - entered:", password, "expected:", passwordToCheck)

    if (password.trim() === passwordToCheck) {
      setIsAuthenticated(true)
      setAuthError("")
      setPassword("")

      const saved = localStorage.getItem("customSystemPrompt")
      setSystemPrompt(
        saved ||
          "You are Obryn AI, a helpful and intelligent assistant. Respond naturally and helpfully to all questions.",
      )
    } else {
      setAuthError("비밀번호가 올바르지 않습니다")
      setPassword("")
    }
  }

  const handleSavePrompt = () => {
    localStorage.setItem("customSystemPrompt", systemPrompt)
    localStorage.setItem("responseLength", responseLength)
    localStorage.setItem("noRestrictions", JSON.stringify(noRestrictions))
    onSave(systemPrompt)
    setIsAuthenticated(false)
    onClose()
  }

  const handleSaveSitePassword = () => {
    if (sitePassword.trim().length === 0) {
      alert("비밀번호를 입력해주세요")
      return
    }
    localStorage.setItem("sitePassword", sitePassword)
    alert("사이트 비밀번호가 변경되었습니다")
    setShowPasswordChange(false)
  }

  useEffect(() => {
    if (isAuthenticated) {
      const updateUserCount = () => {
        const sessionId = localStorage.getItem("sessionId") || `session_${Date.now()}_${Math.random()}`
        localStorage.setItem("sessionId", sessionId)

        const currentTime = Date.now()
        let userCount = 0
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith("session_")) {
            const value = localStorage.getItem(key)
            if (value) {
              const sessionTime = Number.parseInt(value)
              if (currentTime - sessionTime < 5 * 60 * 1000) {
                userCount++
              } else {
                localStorage.removeItem(key)
              }
            }
          }
        }
        setActiveUsers(userCount)
      }

      updateUserCount()
      const interval = setInterval(updateUserCount, 5000)

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  if (!isOpen) return null

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4">
          <h2 className="text-xl font-bold text-white mb-6">개발자 설정 인증</h2>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShowPasswordChange(true)}
              className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors bg-blue-600 text-white"
            >
              비밀번호
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handlePasswordSubmit(e)
              }
            }}
            placeholder="비밀번호를 입력하세요"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
          />
          <button
            onClick={handlePasswordSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            인증
          </button>

          {authError && <p className="text-red-500 text-sm mt-4">{authError}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md backdrop-animation flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-animation">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            <h2 className="text-xl font-bold text-foreground">개발자 설정</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X size={20} className="text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            <div className="bg-muted border-l-4 border-primary px-4 py-3 rounded">
              <p className="text-xs font-semibold text-muted-foreground mb-1">현재 활성 사용자</p>
              <p className="text-2xl font-bold text-primary">{activeUsers}명</p>
            </div>

            {/* AI 시스템 프롬프트 섹션 */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">AI 시스템 프롬프트</label>
              <p className="text-xs text-muted-foreground mb-3">
                AI의 행동 방식을 제어하는 시스템 프롬프트를 입력하세요.
              </p>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="시스템 프롬프트 입력..."
                className="w-full h-48 px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
              />
            </div>

            {/* 응답 길이 조절 */}
            <div className="border-t border-border pt-6">
              <label className="block text-sm font-semibold text-foreground mb-3">응답 길이</label>
              <div className="flex gap-3">
                {(["short", "medium", "long"] as const).map((length) => (
                  <button
                    key={length}
                    onClick={() => setResponseLength(length)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      responseLength === length
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {length === "short" ? "짧게" : length === "medium" ? "중간" : "길게"}
                  </button>
                ))}
              </div>
            </div>

            {/* 제한 없는 모드 토글 */}
            <div className="border-t border-border pt-6">
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Unlock size={16} className="text-yellow-500" />
                제한 없는 모드
              </label>
              <p className="text-xs text-muted-foreground mb-3">활성화하면 AI가 모든 제한 없이 답변합니다.</p>
              <button
                onClick={() => setNoRestrictions(!noRestrictions)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  noRestrictions ? "bg-green-500" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    noRestrictions ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* 사이트 비밀번호 */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
                  <Lock size={16} className="text-primary" />
                  사이트 비밀번호
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                >
                  {showPasswordChange ? "취소" : "변경"}
                </Button>
              </div>
              {showPasswordChange ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={sitePassword}
                    onChange={(e) => setSitePassword(e.target.value)}
                    placeholder="새로운 비밀번호"
                    className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-muted-foreground">
                    새로운 비밀번호를 입력하면 사용자가 처음 접속할 때 이 비밀번호를 입력해야 합니다.
                  </p>
                  <Button
                    type="button"
                    onClick={handleSaveSitePassword}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    비밀번호 저장
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-2 rounded">
                  현재 비밀번호: {sitePassword}
                </p>
              )}
            </div>

            <div className="flex gap-2 border-t border-border pt-6">
              <Button
                onClick={handleSavePrompt}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3"
              >
                설정 저장
              </Button>
              <Button onClick={() => setIsAuthenticated(false)} variant="outline" className="flex-1 py-3">
                취소
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
