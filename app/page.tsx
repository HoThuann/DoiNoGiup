"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { History, Mail, User, DollarSign, Sparkles, Heart, Briefcase, Calendar, Send, Eye, RefreshCw, Copy, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useAuth } from "@/components/AuthContext"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"

type Mood = "cute" | "humble" | "professional"
type Schedule = "daily" | "every3days" | "weekly"
type Currency = "VND" | "USD"

const moodLabels: Record<Mood, { label: string; icon: React.ReactNode; desc: string }> = {
  cute: { label: "Cute/Vui vẻ", icon: <Sparkles className="w-4 h-4" />, desc: "Dễ thương, hài hước" },
  humble: { label: "Humble/Tình cảm", icon: <Heart className="w-4 h-4" />, desc: "Nhẹ nhàng, tha thiết" },
  professional: { label: "Pro/Chuyên nghiệp", icon: <Briefcase className="w-4 h-4" />, desc: "Nghiêm túc, lịch sự" },
}

const scheduleLabels: Record<Schedule, string> = {
  daily: "Mỗi ngày",
  every3days: "3 ngày/lần",
  weekly: "Mỗi tuần",
}

const emailPreviews: Record<Mood, Array<(name: string, amount: string, currency: Currency) => string>> = {
  cute: [
    (name, amount, currency) => `Hiii ${name || "bạn ơi"} ~\n\nMình ghé qua inbox của cậu nè! Không biết cậu có nhớ chuyển khoản tiền ${amount || "xxx"} ${currency} hông?\n\nTớ biết cậu bận rồi, nhưng mà... nếu tiện thì cậu chuyển giúp tớ nha~ Tớ cảm ơn cậu trước luôn ạ!\n\nLove youuu ~\nBạn thân của cậu`,
    (name, amount, currency) => `Éc éc 🐷 Chào ${name || "cậu"} nè,\n\nNhắc nhẹ là hình như cậu đang quên cái bill ${amount || "xxx"} ${currency} khum nè? 🤫\n\nRảnh rỗi thì ting ting liền cho tui nhớ, iu xỉu! ✨\n\nNè tim nè ❤️`,
    (name, amount, currency) => `Hế lô ${name || "đằng ấy"}, dạo này khoẻ chớ?\n\nChuyện là số tiền ${amount || "xxx"} ${currency} bữa trước nó đang gọi tên cậu đó nhaaa.\n\nNhớ kiểm tra và gửi lại cho tớ nha nha. Cảm ơn nhiều lắmmm! 🌷`,
  ],
  humble: [
    (name, amount, currency) => `Chào ${name || "bạn"} ơi,\n\nMình viết mail này hơi ngại xíu... Nhưng mà mình muốn nhắc nhẹ về khoản ${amount || "xxx"} ${currency} nha.\n\nMình hiểu cậu cũng có lúc khó khăn, nhưng nếu được thì cậu sắp xếp giúp mình nghen. Mình cảm ơn cậu rất nhiều!\n\nChúc cậu một ngày tốt lành,\nNgười bạn của cậu`,
    (name, amount, currency) => `Gửi ${name || "bạn"},\n\nHiện tại mình đang cần xoay xở một chút việc nên mới nhắn bạn, bạn xem sắp xếp gửi lại mình khoản ${amount || "xxx"} ${currency} nghen.\n\nNếu chưa tiện thì nhắn cho mình một tiếng nha. Thông cảm giúp mình nha!\n\nThương mến,`,
    (name, amount, currency) => `Chào ${name || "bạn"},\n\nXin lỗi vì đã làm phiền nha. Mình có xem lại ghi chú thì thấy bạn còn đang gửi mình khoản ${amount || "xxx"} ${currency}.\n\nKhi nào thoải mái thì tranh thủ giải quyết giúp mình với nhé. Cảm ơn bạn rất nhiều vì sự thấu hiểu!\n\nTrân trọng,`,
  ],
  professional: [
    (name, amount, currency) => `Kính gửi ${name || "Anh/Chị"},\n\nTôi xin phép gửi email này để nhắc nhở về khoản thanh toán ${amount || "xxx"} ${currency} đến hạn.\n\nRất mong Anh/Chị sắp xếp thời gian thuận tiện để hoàn tất giao dịch. Nếu có thắc mắc, xin vui lòng liên hệ lại với tôi.\n\nTrân trọng,\n[Tên của bạn]`,
    (name, amount, currency) => `Kính gửi Anh/Chị ${name || "Khách hàng/Đối tác"},\n\nTheo hồ sơ công nợ của chúng tôi, khoản thanh toán trị giá ${amount || "xxx"} ${currency} hiện đã sắp đến kỳ hạn giải quyết.\n\nĐề nghị Anh/Chị ưu tiên xử lý trong thời gian tới. Kèm theo là thông tin thanh toán nếu cần. Xin cảm ơn sự hợp tác của Anh/Chị.\n\nTrân trọng,`,
    (name, amount, currency) => `Kính gửi ${name || "Anh/Chị"},\n\nEmail này là thông báo tự động về khoản còn nợ: ${amount || "xxx"} ${currency}.\n\nVui lòng kiểm tra đối soát và hoàn thành nghĩa vụ tài chính theo thỏa thuận. Chúc Anh/Chị nhiều sức khỏe và đạt hiệu quả công việc.\n\nTrân trọng báo tin,`,
  ],
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

const heroVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

export default function DebtlyPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [debtorName, setDebtorName] = useState("")
  const [debtorEmail, setDebtorEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<Currency>("VND")
  const [mood, setMood] = useState<Mood>("cute")
  const [schedule, setSchedule] = useState<Schedule>("every3days")

  const [messageIndex, setMessageIndex] = useState(0)
  const [editedMessage, setEditedMessage] = useState("")
  const [isManuallyEdited, setIsManuallyEdited] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isManuallyEdited) {
      const template = emailPreviews[mood][messageIndex]
      setEditedMessage(template(debtorName, amount, currency))
    }
  }, [debtorName, amount, currency, mood, messageIndex, isManuallyEdited])

  const handleMoodSelect = (selectedMood: Mood) => {
    setMood(selectedMood)
    setMessageIndex(0)
    setIsManuallyEdited(false)
    // Delay scroll slightly to allow React state batching and layout shift to complete
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }

  const handleShufflePreview = () => {
    setMessageIndex((prev) => (prev + 1) % emailPreviews[mood].length)
    setIsManuallyEdited(false)
  }

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(editedMessage)
    toast.success("Đã sao chép tin nhắn vào khay nhớ tạm!")
  }

  const [isSending, setIsSending] = useState(false)

  const handleActivate = async () => {
    if (!user) {
      toast.error("Để kích hoạt nhắc nhở, bạn cần đăng nhập trước!")
      router.push("/login")
      return
    }
    if (!debtorName || !debtorEmail || !amount) {
      toast.warning("Vui lòng điền đầy đủ thông tin người nợ trước nha!")
      return
    }

    setIsSending(true)
    try {
      const res = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debtorName,
          debtorEmail,
          amount,
          currency,
          schedule,
          message: editedMessage,
          senderName: user.displayName || "Bạn của bạn",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gửi email thất bại")
      }

      toast.success(`✅ Đã gửi email nhắc nợ tới ${debtorEmail} thành công!`)
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi gửi email")
    } finally {
      setIsSending(false)
    }
  }


  const handleLogout = async () => {
    await signOut(auth)
    toast.success("Đã đăng xuất thành công!")
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b-2 border-foreground bg-card/50 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Debt-ly</h1>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                  Xin chào, {user.displayName?.split(' ').pop() || 'bạn'}!
                </span>
                <Button variant="outline" size="sm" className="border-2 border-foreground hover:bg-foreground hover:text-primary-foreground transition-colors" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="border-2 border-foreground hover:bg-foreground hover:text-primary-foreground transition-colors" onClick={() => router.push('/login')}>
                <LogIn className="w-4 h-4 mr-2" />
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 pt-12 pb-8 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
          Đòi nợ tinh tế, không hề mất lòng.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Chill thôi~ Để Debt-ly lo! Tự động gửi tin nhắn nhắc nợ siêu cute, không awkward, bạn bè vẫn thân
        </p>
      </motion.section>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 pb-16"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div variants={cardVariants}>
            <Card className="border-2 border-foreground shadow-[4px_4px_0px_0px_#222222] bg-card">
              <CardHeader className="border-b-2 border-foreground">
                <CardTitle className="text-xl font-bold">Thông tin người nợ</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Tên bạn ấy là gì nè?
                  </Label>
                  <Input
                    id="name"
                    placeholder="Vd: Minh béo, Hùng gấu..."
                    value={debtorName}
                    onChange={(e) => setDebtorName(e.target.value)}
                    className="border-2 border-foreground focus:ring-2 focus:ring-foreground/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email của bạn ấy
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Vd: minhbeo@gmail.com"
                    value={debtorEmail}
                    onChange={(e) => setDebtorEmail(e.target.value)}
                    className="border-2 border-foreground focus:ring-2 focus:ring-foreground/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Số tiền bao nhiêu?
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="amount"
                      type="text"
                      placeholder="Vd: 500000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="border-2 border-foreground focus:ring-2 focus:ring-foreground/20 flex-1"
                    />
                    <div className="flex border-2 border-foreground rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCurrency("VND")}
                        className={`px-3 py-2 text-sm font-semibold transition-colors ${
                          currency === "VND"
                            ? "bg-foreground text-primary-foreground"
                            : "bg-card hover:bg-muted"
                        }`}
                      >
                        VND
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrency("USD")}
                        className={`px-3 py-2 text-sm font-semibold transition-colors border-l-2 border-foreground ${
                          currency === "USD"
                            ? "bg-foreground text-primary-foreground"
                            : "bg-card hover:bg-muted"
                        }`}
                      >
                        USD
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="border-2 border-foreground shadow-[4px_4px_0px_0px_#222222] bg-card">
              <CardHeader className="border-b-2 border-foreground">
                <CardTitle className="text-xl font-bold">Chọn mood nha</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <RadioGroup
                  value={mood}
                  onValueChange={(value) => handleMoodSelect(value as Mood)}
                  className="space-y-3"
                >
                  {(Object.keys(moodLabels) as Mood[]).map((key) => (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Label
                        htmlFor={key}
                        className={`flex items-center gap-4 p-4 border-2 border-foreground rounded-md cursor-pointer transition-all ${
                          mood === key
                            ? "bg-foreground text-primary-foreground shadow-[2px_2px_0px_0px_#222222]"
                            : "bg-card hover:bg-muted"
                        }`}
                      >
                        <RadioGroupItem value={key} id={key} className="sr-only" />
                        <span className={`p-2 rounded-md ${mood === key ? "bg-primary-foreground/20" : "bg-muted"}`}>
                          {moodLabels[key].icon}
                        </span>
                        <div>
                          <p className="font-semibold">{moodLabels[key].label}</p>
                          <p className={`text-sm ${mood === key ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {moodLabels[key].desc}
                          </p>
                        </div>
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="border-2 border-foreground shadow-[4px_4px_0px_0px_#222222] bg-card">
              <CardHeader className="border-b-2 border-foreground">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Nhắc bao lâu 1 lần?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <RadioGroup
                  value={schedule}
                  onValueChange={(value) => setSchedule(value as Schedule)}
                  className="grid grid-cols-3 gap-3"
                >
                  {(Object.keys(scheduleLabels) as Schedule[]).map((key) => (
                    <motion.div key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Label
                        htmlFor={`schedule-${key}`}
                        className={`flex items-center justify-center p-4 border-2 border-foreground rounded-md cursor-pointer transition-all text-center font-semibold ${
                          schedule === key
                            ? "bg-foreground text-primary-foreground"
                            : "bg-card hover:bg-muted"
                        }`}
                      >
                        <RadioGroupItem value={key} id={`schedule-${key}`} className="sr-only" />
                        {scheduleLabels[key]}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} ref={previewRef}>
            <Card className="border-2 border-foreground shadow-[4px_4px_0px_0px_#222222] bg-card">
              <CardHeader className="border-b-2 border-foreground">
                <CardTitle className="text-xl font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Xem trước tin nhắn
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleShufflePreview}
                      className="border-2 border-foreground hover:bg-muted font-semibold h-8"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Đổi mẫu
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopyPreview}
                      className="border-2 border-foreground hover:bg-muted font-semibold h-8"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Sao chép
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <motion.div
                  key={mood + messageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Textarea
                    value={editedMessage}
                    onChange={(e) => {
                      setEditedMessage(e.target.value)
                      setIsManuallyEdited(true)
                    }}
                    className="min-h-[220px] bg-muted/50 border-2 border-dashed border-foreground/30 rounded-md p-4 text-base font-sans leading-relaxed text-foreground resize-y focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:border-foreground"
                    placeholder="Nhập nội dung nhắc nợ..."
                  />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          variants={cardVariants}
          className="mt-8 flex justify-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              onClick={handleActivate}
              disabled={isSending}
              className="bg-foreground text-primary-foreground border-2 border-foreground shadow-[4px_4px_0px_0px_#222222] hover:shadow-[2px_2px_0px_0px_#222222] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-lg px-8 py-6 font-bold disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_#222222]"
            >
              <Send className="w-5 h-5 mr-2" />
              {isSending ? "Đang gửi email..." : "Kích hoạt nhắc nhở"}
            </Button>
          </motion.div>
        </motion.div>
      </motion.main>
    </div>
  )
}
