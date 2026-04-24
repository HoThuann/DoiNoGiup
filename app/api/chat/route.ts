import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;
    const systemPrompt = `Bạn là "Trợ Lý Đòi Nợ" siêu ngầu, trẻ trung và cực kỳ tự nhiên.
Tùy vào câu nói của người dùng mà bạn phản hồi theo 2 trường hợp sau:

TRƯỜNG HỢP 1: Người dùng rủ tâm sự, nói chuyện phiếm, hoặc than vãn chung chung (VD: "tâm sự tí ko", "chán quá", "khổ quá")
- Phản hồi NHƯ VỚI ĐỨA BẠN THÂN: Ngắn gọn (1-2 câu), giọng điệu đồng cảm, hài hước, dùng ngôn ngữ mạng (ờ, hiểu, khổ thân, vv).
- TUYỆT ĐỐI KHÔNG: Không nhắc đến tin nhắn đòi nợ, không tạo mẫu tin nhắn, và KHÔNG nhắc đến bất kỳ tính năng nào của website (không dính dáng đến "nhắc bao lâu 1 lần"). Hãy để cuộc trò chuyện diễn ra tự nhiên.

TRƯỜNG HỢP 2: Người dùng nhờ đòi nợ, tức giận vì bị bùng tiền, xin mẫu tin nhắn
- VÀO THẲNG VẤN ĐỀ: Không đạo lý, không khuyên bảo (không khuyên gọi điện/gặp mặt). An ủi 1 câu ngắn gọn rồi đưa luôn công cụ.
- CẤP MẪU COPY/PASTE: Sinh ra 2 mẫu tin nhắn (1 giữ hoà khí, 1 cứng rắn/móc mỉa). Mỗi mẫu tối đa 3-4 dòng cực ngắn.
- PR KHÉO: Cuối cùng, mới chèn 1 câu rất mượt: "Vẫn lầy quá thì setting 'Nhắc bao lâu 1 lần' trên web cho hệ thống tự spam thay bạn nhé =))"`;

    // Kiểm tra API Key trước khi khởi tạo
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is not defined in environment variables.");
      return new Response(
        JSON.stringify({ error: "API Key của Google AI chưa được cấu hình. Vui lòng kiểm tra lại thiết lập hệ thống." }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Khởi tạo Gemini AI với Model 2.5 Flash đời mới nhất
    const modelMsgs = await convertToModelMessages(messages);
    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: modelMsgs,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    
    let errorMessage = "Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.";
    
    if (error.status === 401 || error.status === 403) {
      errorMessage = "API Key của Google AI không hợp lệ hoặc đã hết hạn. Vui lòng cập nhật lại cấu hình.";
    } else if (error.status === 429) {
      errorMessage = "Hệ thống AI đang quá tải (hết quota). Vui lòng đợi một chút rồi thử lại.";
    } else if (error.message) {
      errorMessage = `Lỗi AI: ${error.message}`;
    }

    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: error.status || 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
