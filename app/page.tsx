"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Mail, User, DollarSign, Sparkles, Heart, Briefcase, Calendar, Send, Eye, RefreshCw, Copy, LogIn, LogOut, QrCode, X, Moon, Sun } from "lucide-react"
import Image from "next/image"
import confetti from "canvas-confetti"
import { useTheme } from "next-themes"
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
    (name, amount, currency) => `Ủa ${name || "bạn ơi"} ơi 👀\n\nTớ đang nhìn vào ví thì thấy thiếu mất ${amount || "xxx"} ${currency} kìa!\n\nChắc là nó đang nằm ở chỗ cậu đúng hông ta? Hehe, chuyển về nhà nó giúp tớ nhé! 🏠💸\n\nHết mình yêu cậu~ 🥰`,
    (name, amount, currency) => `Psst psst... ${name || "ê cậu"} ơi! 🤭\n\nTớ không muốn làm phiền đâu nhưng mà... cậu có nhớ hôm bữa tớ cho cậu mượn ${amount || "xxx"} ${currency} không?\n\nKhông sao hết, tớ just saying thôi á! Tiện thì trả nha cậu ơiiii 💌\n\nMãi thương cậu~`,
    (name, amount, currency) => `🌟 Tin nhắn đặc biệt dành cho ${name || "người bạn xinh đẹp của tui"}!\n\nNội dung: ${amount || "xxx"} ${currency} đang nhớ cậu lắm á và muốn về nhà (là ví của tớ) 😆\n\nBao giờ cậu rảnh thì cho nó về nha! Tớ đãi cậu trà sữa sau 🧋\n\nXOXO 💋`,
    (name, amount, currency) => `Cậu ơi cậu ơi cậu ơi! 🙈\n\nTớ vừa xem lại sổ nợ (có, tớ có sổ nợ thật đó!) thì ra là cậu đang nợ tớ ${amount || "xxx"} ${currency} nè.\n\nỪ thì cậu bận tớ hiểu, nhưng mà lúc nào đó nhớ gửi lại tớ nghen! Không cần gấp đâu... à mà gấp một chút cũng được 🤣\n\nBff forever~ 🌈`,
  ],
  humble: [
    (name, amount, currency) => `Chào ${name || "bạn"} ơi,\n\nMình viết mail này hơi ngại xíu... Nhưng mà mình muốn nhắc nhẹ về khoản ${amount || "xxx"} ${currency} nha.\n\nMình hiểu cậu cũng có lúc khó khăn, nhưng nếu được thì cậu sắp xếp giúp mình nghen. Mình cảm ơn cậu rất nhiều!\n\nChúc cậu một ngày tốt lành,\nNgười bạn của cậu`,
    (name, amount, currency) => `Gửi ${name || "bạn"},\n\nHiện tại mình đang cần xoay xở một chút việc nên mới nhắn bạn, bạn xem sắp xếp gửi lại mình khoản ${amount || "xxx"} ${currency} nghen.\n\nNếu chưa tiện thì nhắn cho mình một tiếng nha. Thông cảm giúp mình nha!\n\nThương mến,`,
    (name, amount, currency) => `Chào ${name || "bạn"},\n\nXin lỗi vì đã làm phiền nha. Mình có xem lại ghi chú thì thấy bạn còn đang gửi mình khoản ${amount || "xxx"} ${currency}.\n\nKhi nào thoải mái thì tranh thủ giải quyết giúp mình với nhé. Cảm ơn bạn rất nhiều vì sự thấu hiểu!\n\nTrân trọng,`,
    (name, amount, currency) => `${name || "Bạn"} ơi,\n\nMình biết cuộc sống đôi lúc có nhiều áp lực, và mình không muốn thêm gánh nặng cho bạn đâu.\n\nNhưng nếu bạn có thể sắp xếp hoàn trả khoản ${amount || "xxx"} ${currency} trong thời gian gần đây, mình sẽ rất biết ơn. Còn không thì mình và bạn nói chuyện thêm nhé.\n\nLuôn trân trọng tình bạn của chúng mình,`,
    (name, amount, currency) => `Xin chào ${name || "bạn"},\n\nMình nhắn tin này sau một hồi đắn đo, vì thực ra mình không muốn khoản tiền ${amount || "xxx"} ${currency} ảnh hưởng đến tình cảm giữa hai đứa.\n\nBạn cứ từ từ sắp xếp theo khả năng, mình không vội. Chỉ cần bạn nhớ và có kế hoạch là mình yên tâm rồi.\n\nCảm ơn bạn đã hiểu mình,`,
    (name, amount, currency) => `${name || "Bạn"} thân mến,\n\nDạo này bạn có khoẻ không? Mình hỏi thăm và cũng nhân tiện nhắc nhẹ về khoản ${amount || "xxx"} ${currency} mình đã hỗ trợ bạn trước đây.\n\nMình tin bạn không quên, chỉ là cuộc sống bận bịu thôi. Khi nào bạn sắp xếp được hãy báo mình nhé.\n\nVẫn luôn là bạn tốt của nhau,`,
    (name, amount, currency) => `Gửi đến ${name || "người bạn của mình"},\n\nMình gửi tin nhắn này với một chút ngại ngùng, nhưng tình bạn thật sự là phải thẳng thắn với nhau đúng không?\n\nKhoản ${amount || "xxx"} ${currency} đã được một thời gian rồi, mình cũng đang có chút cần dùng đến. Bạn thông cảm và hỗ trợ mình nhé.\n\nMãi yêu quý bạn,`,
  ],
  professional: [
    (name, amount, currency) => `Kính gửi ${name || "Anh/Chị"},\n\nTôi xin phép gửi email này để nhắc nhở về khoản thanh toán ${amount || "xxx"} ${currency} đến hạn.\n\nRất mong Anh/Chị sắp xếp thời gian thuận tiện để hoàn tất giao dịch. Nếu có thắc mắc, xin vui lòng liên hệ lại với tôi.\n\nTrân trọng,\n[Tên của bạn]`,
    (name, amount, currency) => `Kính gửi Anh/Chị ${name || "Khách hàng/Đối tác"},\n\nTheo hồ sơ công nợ của chúng tôi, khoản thanh toán trị giá ${amount || "xxx"} ${currency} hiện đã sắp đến kỳ hạn giải quyết.\n\nĐề nghị Anh/Chị ưu tiên xử lý trong thời gian tới. Kèm theo là thông tin thanh toán nếu cần. Xin cảm ơn sự hợp tác của Anh/Chị.\n\nTrân trọng,`,
    (name, amount, currency) => `Kính gửi ${name || "Anh/Chị"},\n\nEmail này là thông báo tự động về khoản còn nợ: ${amount || "xxx"} ${currency}.\n\nVui lòng kiểm tra đối soát và hoàn thành nghĩa vụ tài chính theo thỏa thuận. Chúc Anh/Chị nhiều sức khỏe và đạt hiệu quả công việc.\n\nTrân trọng báo tin,`,
    (name, amount, currency) => `Kính gửi ${name || "Quý khách"},\n\nChúng tôi xin trân trọng thông báo rằng khoản công nợ ${amount || "xxx"} ${currency} của Quý vị hiện chưa được thanh lý theo đúng thời hạn cam kết.\n\nKính đề nghị Quý vị xem xét và thực hiện thanh toán trong thời gian sớm nhất để tránh phát sinh các vấn đề không mong muốn.\n\nKính trân trọng,`,
    (name, amount, currency) => `Thông báo nhắc nợ\n\nKính gửi: ${name || "Anh/Chị"}\nSố tiền: ${amount || "xxx"} ${currency}\nTrạng thái: Chưa thanh toán\n\nChúng tôi ghi nhận rằng khoản thu kể trên vẫn chưa được xử lý. Đề nghị Anh/Chị kiểm tra và phản hồi trong vòng 3-5 ngày làm việc.\n\nMọi thắc mắc xin liên hệ trực tiếp để được hỗ trợ.\n\nTrân trọng,`,
    (name, amount, currency) => `Kính gửi ${name || "Anh/Chị"},\n\nNhân dịp rà soát định kỳ, chúng tôi nhận thấy khoản thanh toán ${amount || "xxx"} ${currency} vẫn đang ở trạng thái chưa hoàn tất.\n\nChúng tôi đánh giá cao mối quan hệ hợp tác lâu dài và tin tưởng đây chỉ là sơ sót nhỏ. Kính mong Anh/Chị sắp xếp thanh toán sớm để duy trì uy tín và quan hệ đôi bên.\n\nTrân trọng cảm ơn,`,
    (name, amount, currency) => `THÔNG BÁO NHẮC THANH TOÁN\n\nKính gửi: ${name || "Anh/Chị"}\n\nĐây là thông báo thứ [số lần] nhắc nhở về khoản thanh toán ${amount || "xxx"} ${currency} đã quá hạn.\n\nĐề nghị Anh/Chị thực hiện thanh toán ngay hoặc liên hệ để thỏa thuận phương án giải quyết phù hợp. Sự chậm trễ có thể ảnh hưởng đến uy tín hợp tác của hai bên.\n\nNghiêm túc trân trọng,`,
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

const BackgroundDecorations = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Icons */}
      <motion.div
        className="absolute top-32 left-[10%] text-primary/30"
        animate={{ y: [0, -20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <DollarSign className="w-16 h-16" />
      </motion.div>
      <motion.div
        className="absolute top-48 right-[15%] text-primary/30"
        animate={{ y: [0, 20, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Mail className="w-12 h-12" />
      </motion.div>
      <motion.div
        className="absolute bottom-64 left-[15%] text-primary/30"
        animate={{ scale: [1, 1.2, 1], y: [0, -15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Heart className="w-14 h-14" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 right-[20%] text-primary/30"
        animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <Sparkles className="w-20 h-20" />
      </motion.div>
    </div>
  )
}

export default function DebtlyPage() {
  const router = useRouter()
  const { user } = useAuth()

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [debtorName, setDebtorName] = useState("")
  const [debtorEmail, setDebtorEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<Currency>("VND")
  const [mood, setMood] = useState<Mood>("cute")
  const [schedule, setSchedule] = useState<Schedule>("every3days")

  const [messageIndex, setMessageIndex] = useState(0)
  const [editedMessage, setEditedMessage] = useState("")
  const [isManuallyEdited, setIsManuallyEdited] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const qrInputRef = useRef<HTMLInputElement>(null)

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
    setIsShuffling(true)
    setTimeout(() => {
      setMessageIndex((prev) => (prev + 1) % emailPreviews[mood].length)
      setIsManuallyEdited(false)
      setIsShuffling(false)
    }, 500)
  }

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(editedMessage)
    toast.success("Đã sao chép tin nhắn vào khay nhớ tạm!")
  }

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setQrImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#C2D8C4", "#ffffff", "#222222", "#a8c9aa", "#e8f0e9"],
      scalar: 1.1,
    })
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
          qrImage: qrImage || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gửi email thất bại")
      }

      toast.success(`🎉 Đã gửi lời nhắc thành công tới ${debtorEmail}!`)
      fireConfetti()
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi gửi email")
    } finally {
      setIsSending(false)
    }
  }


  const handleLogout = async () => {
    await signOut(auth)
    toast.success("Đã đăng xuất thành công! Hẹn gặp lại nhé 👋")
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundDecorations />
      
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b-2 border-primary bg-card/50 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Đòi nợ thân thiện logo" width={64} height={64} className="rounded-xl border-2 border-primary shadow-sm" />
            <h1 className="text-lg tracking-tight text-primary" style={{ fontFamily: 'var(--font-brand)', fontWeight: 600, letterSpacing: '-0.02em' }}>Đòi Nợ Thân Thiện</h1>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors mr-2 h-9 w-9"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
            {user ? (
              <>
                <div className="hidden sm:flex items-center bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full shadow-sm hover:bg-primary/20 transition-colors">
                  <User className="w-4 h-4 text-primary mr-2" />
                  <span className="text-sm font-bold text-primary">
                    Xin chào, {user.displayName?.split(' ').pop() || 'bạn'}!
                  </span>
                </div>
                <Button variant="outline" size="sm" className="relative overflow-hidden group border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" onClick={handleLogout}>
                  <span className="relative z-10 flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </span>
                  <motion.div
                    className="absolute inset-0 z-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] w-[200%]"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => router.push('/login')}>
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
        className="max-w-5xl mx-auto px-4 pt-12 pb-8 text-center relative z-10"
      >
        <motion.h2 
          className="text-4xl md:text-5xl text-primary mb-4 text-balance text-center drop-shadow-sm" 
          style={{ fontWeight: 700, fontFamily: 'var(--font-brand)' }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          Đòi nợ tinh tế, không hề mất lòng.
        </motion.h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Chill thôi~ "Để Đòi nợ thân thiện lo!" Tự động gửi tin nhắn nhắc nợ siêu cute, không awkward, bạn bè vẫn thân
        </p>
      </motion.section>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 pb-16 relative"
      >
        {!user && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="absolute inset-x-4 inset-y-0 z-40 bg-background/50 backdrop-blur-[6px] rounded-2xl flex flex-col items-center justify-center p-4 shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-primary/10"
          >
            <div className="text-center bg-card p-10 rounded-2xl border-2 border-primary shadow-[8px_8px_0px_0px_var(--color-primary)] max-w-lg mb-[20vh] relative overflow-hidden group">
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 5 }}>
                <LogIn className="w-16 h-16 text-primary mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-primary mb-3">Úi chà, bạn chưa đăng nhập!</h3>
              <p className="text-muted-foreground mb-8 text-lg font-medium">Đăng nhập ngay để mở khóa toàn bộ quyền năng và "tiếp cận" những con nợ đang lưu lạc nhé 💸</p>
              <Button size="lg" className="w-full font-bold text-lg py-6 relative overflow-hidden group/btn hover:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all" onClick={() => router.push('/login')}>
                <span className="relative z-10 flex items-center">
                  Đăng nhập ngay bây giờ
                </span>
                <motion.div
                  className="absolute inset-0 z-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] w-[200%]"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                />
              </Button>
            </div>
          </motion.div>
        )}
        <div className={`transition-all duration-300 ${!user ? 'pointer-events-none select-none blur-[6px] opacity-40 grayscale-[20%]' : ''}`}>
          <div className="grid md:grid-cols-2 gap-6">
          <motion.div variants={cardVariants} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <Card className="border-2 border-foreground shadow-[4px_4px_0px_0px_#222222] hover:shadow-[6px_6px_0px_0px_#222222] transition-shadow bg-card">
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
                    className="border-2 border-primary focus:ring-2 focus:ring-primary/20"
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
                    className="border-2 border-primary focus:ring-2 focus:ring-primary/20"
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
                      placeholder="Vd: 500,000"
                      value={amount ? Number(amount.replace(/,/g, "")).toLocaleString("vi-VN") : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\./g, "").replace(/,/g, "")
                        if (/^\d*$/.test(raw)) setAmount(raw)
                      }}
                      className="border-2 border-primary focus:ring-2 focus:ring-primary/20 flex-1"
                    />
                    <div className="flex border-2 border-primary rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCurrency("VND")}
                        className={`px-3 py-2 text-sm font-semibold transition-colors ${currency === "VND"
                          ? "bg-foreground text-primary-foreground"
                          : "bg-card hover:bg-muted"
                          }`}
                      >
                        VND
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrency("USD")}
                        className={`px-3 py-2 text-sm font-semibold transition-colors border-l-2 border-foreground ${currency === "USD"
                          ? "bg-foreground text-primary-foreground"
                          : "bg-card hover:bg-muted"
                          }`}
                      >
                        USD
                      </button>
                    </div>
                  </div>
                </div>

                {/* QR Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Mã QR thanh toán của bạn (tuỳ chọn)
                  </Label>
                  <input
                    ref={qrInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleQrUpload}
                  />
                  {qrImage ? (
                    <div className="relative inline-block">
                      <img src={qrImage} alt="QR thanh toán" className="w-32 h-32 rounded-lg border-2 border-primary object-cover" />
                      <button
                        type="button"
                        onClick={() => { setQrImage(null); if (qrInputRef.current) qrInputRef.current.value = "" }}
                        className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => qrInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-primary/40 rounded-lg p-4 text-sm text-foreground hover:border-primary hover:bg-muted/30 transition-all flex flex-col items-center gap-1"
                    >
                      <QrCode className="w-6 h-6" />
                      <span>Upload ảnh mã QR ngân hàng của bạn</span>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="border-2 border-primary shadow-[4px_4px_0px_0px_var(--color-primary)] bg-card">
              <CardHeader className="border-b-2 border-primary">
                <CardTitle className="text-xl font-bold text-primary">Chọn mood nha</CardTitle>
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
                        className={`flex items-center gap-4 p-4 border-2 border-primary rounded-md cursor-pointer transition-all ${mood === key
                          ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_var(--color-primary)]"
                          : "bg-card hover:bg-muted text-primary"
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
            <Card className="border-2 border-primary shadow-[4px_4px_0px_0px_var(--color-primary)] bg-card">
              <CardHeader className="border-b-2 border-primary">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
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
                        className={`flex items-center justify-center p-4 border-2 border-primary rounded-md cursor-pointer transition-all text-center font-semibold ${schedule === key
                          ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_var(--color-primary)]"
                          : "bg-card hover:bg-muted text-primary"
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

          <motion.div variants={cardVariants} ref={previewRef} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <Card className="border-2 border-primary shadow-[4px_4px_0px_0px_var(--color-primary)] hover:shadow-[6px_6px_0px_0px_var(--color-primary)] transition-shadow bg-card">
              <CardHeader className="border-b-2 border-primary">
                <CardTitle className="text-xl font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-primary">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Xem trước tin nhắn
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShufflePreview}
                        className="group relative overflow-hidden border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary/20 transition-all font-semibold h-8"
                      >
                        <span className="relative z-10 flex items-center">
                          <RefreshCw className={`w-3.5 h-3.5 mr-1 transition-transform duration-500 ${isShuffling ? "animate-spin" : "group-hover:rotate-180"}`} />
                          Đổi mẫu
                        </span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPreview}
                        className="group relative overflow-hidden border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary/20 transition-all font-semibold h-8"
                      >
                        <span className="relative z-10 flex items-center">
                          <Copy className="w-3.5 h-3.5 mr-1 transition-transform duration-300 group-hover:scale-y-110 group-hover:-translate-y-0.5" />
                          Sao chép
                        </span>
                      </Button>
                    </motion.div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <AnimatePresence mode="wait">
                  {isShuffling ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {["w-3/4", "w-full", "w-5/6", "w-full", "w-2/3", "w-4/5"].map((w, i) => (
                        <div
                          key={i}
                          className={`h-4 rounded-md animate-pulse ${w}`}
                          style={{ backgroundColor: "#C2D8C4" }}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={mood + messageIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Textarea
                        value={editedMessage}
                        onChange={(e) => {
                          setEditedMessage(e.target.value)
                          setIsManuallyEdited(true)
                        }}
                        className="min-h-[220px] bg-card border-2 border-dashed border-primary/50 rounded-md p-4 text-base font-sans leading-relaxed text-foreground resize-y focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
                        placeholder="Nhập nội dung nhắc nợ..."
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* QR Preview in message */}
                {qrImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-2 border-2 border-dashed border-primary/50 rounded-lg p-4 bg-muted/30"
                  >
                    <img src={qrImage} alt="QR thanh toán" className="w-36 h-36 rounded-lg object-cover border-2 border-primary/50" />
                    <p className="text-sm font-medium text-primary">Quét mã để chuyển khoản nhanh nhé! 📸</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          variants={cardVariants}
          className="mt-8 flex justify-center relative z-10"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            animate={!isSending ? { 
              boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 20px var(--color-primary)", "0px 0px 0px rgba(0,0,0,0)"] 
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="rounded-md"
          >
            <Button
              size="lg"
              onClick={handleActivate}
              disabled={isSending}
              className="relative overflow-hidden bg-primary text-primary-foreground border-2 border-primary shadow-[4px_4px_0px_0px_var(--color-primary)] hover:shadow-[2px_2px_0px_0px_var(--color-primary)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-lg px-8 py-6 font-bold disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_var(--color-primary)] group"
            >
              <span className="relative z-10 flex items-center">
                <Send className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                {isSending ? "Đang gửi email..." : "Gửi lời nhắc nhở"}
              </span>
              
              {/* Shimmer Effect overlay */}
              {!isSending && (
                <motion.div
                  className="absolute inset-0 z-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] w-[200%]"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                />
              )}
            </Button>
          </motion.div>
        </motion.div>
        </div>
      </motion.main>
    </div>
  )
}
