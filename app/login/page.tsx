"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { auth } from "@/lib/firebase"
import Link from "next/link"
import Image from "next/image"

// Custom Google SVG Icon
const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      toast.success("Đăng nhập Google thành công!")
      router.push("/")
    } catch (error: any) {
      console.error(error)
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Bạn đã đóng cửa sổ đăng nhập, hãy thử lại nhé!")
      } else {
        toast.error(error.message || "Đăng nhập Google thất bại")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8">
        <Button variant="ghost" className="font-semibold hover:bg-muted">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại trang chủ
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-foreground shadow-[6px_6px_0px_0px_#222222] bg-card">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-3"
            >
              <Image src="/logo.jpg" alt="Đòi Nợ Thân Thiện" width={96} height={96} className="rounded-2xl shadow-md" />
            </motion.div>
            <CardTitle className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>Đòi Nợ Thân Thiện</CardTitle>
            <CardDescription className="text-base font-medium mt-2">
              Đăng nhập để bắt đầu hành trình đòi nợ tinh tế
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 text-base font-semibold border-2 border-foreground hover:bg-muted transition-all relative shadow-[2px_2px_0px_0px_#222222] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <GoogleIcon className="w-5 h-5 absolute left-4" />
                {loading ? "Đang xử lý..." : "Tiếp tục với Google"}
              </Button>
            </motion.div>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Đăng nhập nhanh, an toàn qua tài khoản Google của bạn.
            </p>
          </CardContent>
          <CardFooter className="justify-center border-t-2 border-dashed border-muted-foreground/20 pt-4 pb-6 px-6">
            <p className="text-sm text-muted-foreground text-center">
              Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
