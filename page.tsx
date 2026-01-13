"use client"

import { useState } from "react"
import PasswordScreen from "@/components/password-screen"
import ChatInterface from "@/components/chat-interface"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <PasswordScreen onAuthenticate={() => setIsAuthenticated(true)} />
  }

  return <ChatInterface />
}
