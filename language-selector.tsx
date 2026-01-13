"use client"
import { X } from "lucide-react"

const LANGUAGES = [
  { id: "english", name: "English", flag: "🇺🇸" },
  { id: "korean", name: "한국어", flag: "🇰🇷" },
  { id: "chinese", name: "中文", flag: "🇨🇳" },
  { id: "spanish", name: "Español", flag: "🇪🇸" },
  { id: "french", name: "Français", flag: "🇫🇷" },
  { id: "japanese", name: "日本語", flag: "🇯🇵" },
  { id: "german", name: "Deutsch", flag: "🇩🇪" },
]

interface LanguageSelectorProps {
  onSelect: (languageId: string) => void
  onClose: () => void
}

export default function LanguageSelector({ onSelect, onClose }: LanguageSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">언어 배우기</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">배우고 싶은 언어를 선택하세요</p>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => onSelect(lang.id)}
              className="p-3 rounded-lg border border-border hover:bg-accent hover:border-accent transition-colors text-foreground text-sm font-medium flex items-center gap-2"
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
