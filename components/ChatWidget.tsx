"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown } from "lucide-react"

// Simple inline markdown renderer: bold, italic, code, bullet lists, newlines
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  lines.forEach((line, lineIdx) => {
    const isBullet = /^[\-\*\•]\s+/.test(line)
    const content = isBullet ? line.replace(/^[\-\*\•]\s+/, '') : line

    const parts = parseInline(content)

    if (isBullet) {
      elements.push(
        <div key={lineIdx} className="flex gap-2 my-0.5">
          <span className="text-primary mt-0.5 shrink-0">•</span>
          <span>{parts}</span>
        </div>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={lineIdx} className="h-2" />)
    } else {
      elements.push(<p key={lineIdx} className="leading-relaxed">{parts}</p>)
    }
  })

  return elements
}

function parseInline(text: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|__[^_]+__|_[^_]+_)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const raw = match[0]
    if (raw.startsWith('**') || raw.startsWith('__')) {
      parts.push(<strong key={match.index} className="font-semibold">{raw.slice(2, -2)}</strong>)
    } else if (raw.startsWith('`')) {
      parts.push(<code key={match.index} className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs font-mono">{raw.slice(1, -1)}</code>)
    } else {
      parts.push(<em key={match.index} className="italic">{raw.slice(1, -1)}</em>)
    }
    lastIndex = match.index + raw.length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

const WELCOME_MESSAGE = "👋 Chào bạn! Mình là **Trợ Lý Đòi Nợ** — chuyên gia giúp bạn đòi nợ mà không mất lòng ai.\n\nBạn đang phân vân không biết mở lời thế nào? Cứ hỏi mình nhé! 😄"

const QUICK_QUESTIONS = [
  "Soạn tin nhắn cute cho bạn nợ tiền",
  "Làm sao nhắc nợ mà không mất lòng?",
  "Mẫu email đòi nợ chuyên nghiệp",
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const { messages, sendMessage, status, error } = useChat({
    api: "/api/chat",
    onFinish: () => {
      if (!isOpen) setHasUnread(true)
    },
  })

  const isLoading = status === "streaming" || status === "submitted"

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isNearBottom = useRef(true)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const distFromBottom = scrollHeight - scrollTop - clientHeight
    isNearBottom.current = distFromBottom < 80
    setShowScrollBtn(distFromBottom > 120)
  }

  useEffect(() => {
    if (isNearBottom.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => {
        inputRef.current?.focus()
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 350)
    }
  }, [isOpen])

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return
    sendMessage({ role: "user", parts: [{ type: "text", text: trimmed }] })
    setInputValue("")
  }

  const handleQuickQuestion = (q: string) => {
    sendMessage({ role: "user", parts: [{ type: "text", text: q }] })
  }

  // Extract text content from a message (v6 uses parts array)
  const getMessageText = (m: any): string => {
    if (typeof m.content === 'string') return m.content
    if (Array.isArray(m.parts)) {
      return m.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('')
    }
    return ''
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.88 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[520px] max-h-[80vh] bg-background border border-primary/20 shadow-[0_20px_60px_rgba(0,0,0,0.18)] rounded-2xl overflow-hidden flex flex-col z-[100]"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Trợ Lý Đòi Nợ</h3>
                  <span className="text-xs opacity-75 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Powered by Gemini AI
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Đóng chat"
                className="hover:bg-primary-foreground/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5"
            >
              {/* Static welcome message */}
              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[88%]">
                  <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mb-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-card border border-border/60 text-foreground rounded-2xl rounded-tl-sm p-3 text-sm shadow-sm">
                    <div className="space-y-1">{renderMarkdown(WELCOME_MESSAGE)}</div>
                  </div>
                </div>
              </div>

              {/* Quick question chips */}
              {messages.length === 0 && (
                <div className="pt-1 pb-2 flex flex-col gap-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickQuestion(q)}
                      disabled={isLoading}
                      className="text-left text-xs border border-primary/30 text-primary bg-primary/5 hover:bg-primary/15 rounded-xl px-3 py-2 transition-colors disabled:opacity-50"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Conversation messages */}
              {messages.map((m) => {
                const text = getMessageText(m)
                if (!text) return null
                return (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mb-0.5 mt-auto mr-2">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-card text-foreground border border-border/60 rounded-tl-sm'
                    }`}>
                      {m.role === 'user' ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                      ) : (
                        <div className="space-y-1">{renderMarkdown(text)}</div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mr-2">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="text-center text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  ⚠️ Có lỗi xảy ra. Kiểm tra lại API Key trong .env.local nhé!
                </div>
              )}
            </div>

            {/* Scroll to bottom button */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-[4.5rem] right-4 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg z-10"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Input */}
            <form
              id="chat-form"
              onSubmit={handleSubmit}
              className="p-3 border-t border-border/60 bg-background flex gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                id="chat-input"
                className="flex-1 bg-muted/50 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary/30 text-sm border border-transparent focus:bg-background transition-all placeholder:text-muted-foreground/60"
                value={inputValue}
                placeholder="Nhập câu hỏi của bạn..."
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                id="chat-send-btn"
                disabled={isLoading || !inputValue.trim()}
                className="bg-primary text-primary-foreground p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-all shrink-0 hover:scale-105 active:scale-95"
                aria-label="Gửi"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        id="chat-toggle-btn"
        aria-label={isOpen ? "Đóng chat" : "Mở trợ lý AI"}
        className="fixed bottom-6 right-4 sm:right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.2)] flex items-center justify-center z-[100] transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {hasUnread && !isOpen && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center"
            >
              1
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
