import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const scheduleText: Record<string, string> = {
  daily: "mỗi ngày",
  every3days: "mỗi 3 ngày",
  weekly: "mỗi tuần",
}

export async function POST(req: NextRequest) {
  try {
    const { debtorName, debtorEmail, amount, currency, schedule, message, senderName } = await req.json()

    const { data, error } = await resend.emails.send({
      from: "Debt-ly <onboarding@resend.dev>",
      to: [debtorEmail],
      subject: `💸 ${senderName || "Một người bạn"} đang nhắc bạn về khoản nợ ${amount} ${currency}`,
      html: `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nhắc nợ từ Debt-ly</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #222;border-radius:12px;box-shadow:4px 4px 0 #222;overflow:hidden;max-width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:#18181b;padding:28px 40px;text-align:center;">
              <span style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;">💸 Debt-ly</span>
              <p style="color:#a1a1aa;margin:6px 0 0;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Đòi nợ tinh tế · không hề mất lòng</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 24px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;">
                Xin chào ${debtorName} 👋
              </h2>
              <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.7;">
                Bạn nhận được tin nhắn này vì <strong>${senderName || "một người bạn"}</strong> muốn nhắc nhở bạn về một khoản tiền chưa được thanh toán.
              </p>

              <!-- Amount box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#f4f4f5;border:2px dashed #d4d4d8;border-radius:8px;padding:20px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Số tiền cần thanh toán</p>
                    <p style="margin:0;font-size:36px;font-weight:900;color:#18181b;">${amount} <span style="font-size:20px;">${currency}</span></p>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div style="background:#fafafa;border-left:4px solid #18181b;border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:28px;">
                <p style="margin:0 0 6px;font-size:12px;color:#71717a;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Lời nhắn</p>
                <p style="margin:0;font-size:15px;color:#18181b;line-height:1.8;white-space:pre-wrap;">${message}</p>
              </div>

              <p style="margin:0 0 28px;font-size:14px;color:#71717a;line-height:1.6;">
                📅 Lịch nhắc: <strong>${scheduleText[schedule] || schedule}</strong>
              </p>

              <p style="margin:0;font-size:14px;color:#52525b;line-height:1.7;">
                Nếu bạn đã thanh toán rồi, vui lòng xác nhận với <strong>${senderName}</strong> để không nhận thêm email này. Cảm ơn bạn! 🙏
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f4f5;border-top:2px solid #e4e4e7;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                Email được gửi từ <strong>Debt-ly</strong> theo yêu cầu của ${senderName || "người dùng"}.<br/>
                Đây là email tự động, vui lòng không reply trực tiếp.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim()
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err: any) {
    console.error("API error:", err)
    return NextResponse.json({ error: err.message || "Lỗi server" }, { status: 500 })
  }
}
