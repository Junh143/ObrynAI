"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PasswordScreenProps {
  onAuthenticate: () => void
}

const CORRECT_PASSWORD = "1234"

export default function PasswordScreen({ onAuthenticate }: PasswordScreenProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === CORRECT_PASSWORD) {
      onAuthenticate()
      setPassword("")
      setError("")
    } else {
      setError("Incorrect password")
      setPassword("")
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-lg z-50">
      <div className="bg-card border border-border rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Obryn AI Chat</h1>
            <p className="text-sm text-muted-foreground">Enter password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground text-center text-lg tracking-widest"
              autoFocus
            />

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Enter
            </Button>

            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">인증키를 얻는 곳:</span>
              <a
                href="https://discord.com/invite/gJWbvUNV"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center transition-transform hover:scale-110"
                aria-label="Discord invitation"
              >
                <svg
                  className="w-5 h-5 text-[#5865F2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.3671a19.8 19.8 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.445.864-.608 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.397-.875-.61-1.25a.077.077 0 00-.079-.037A19.816 19.816 0 003.677 4.3671a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.774-1.362 1.226-1.994a.076.076 0 00-.042-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.294.075.075 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 01.079.009c.5-4.506.545-8.933-.002-13.332a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-.968-2.157-2.156 0-1.193.968-2.157 2.157-2.157 1.193 0 2.156.964 2.157 2.157 0 1.188-.964 2.156-2.157 2.156zm7.975 0c-1.183 0-2.157-.968-2.157-2.156 0-1.193.968-2.157 2.157-2.157 1.193 0 2.157.964 2.157 2.157 0 1.188-.964 2.156-2.157 2.156z" />
                </svg>
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
