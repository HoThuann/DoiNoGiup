import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { debtorName, amount, currency, mood } = await req.json();

    if (!debtorName || !amount) {
      return new Response(
        JSON.stringify({ error: 'Thiếu thông tin tên hoặc số tiền' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Kiểm tra API Key trước khi khởi tạo
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is not defined in environment variables.");
      return new Response(
        JSON.stringify({ error: "API Key của Google AI chưa được cấu hình. Vui lòng kiểm tra lại thiết lập hệ thống." }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    const prompt = `Hãy viết một tin nhắn đòi nợ cho người tên "${debtorName}" với số tiền ${amount} ${currency || 'VND'}. 
Phong cách: ${mood || 'Cute/Vui vẻ'}.

Yêu cầu:
- Độ dài thật NGẮN GỌN (chỉ từ 3-6 dòng, không lan man)
- Có emoji phù hợp với phong cách
- Tự nhiên, không cứng nhắc
- Chỉ trả về NỘI DUNG tin nhắn, không cần giải thích hay tiêu đề thêm
- Ký tên cuối tin nhắn là "Bạn của bạn" hoặc tương tự

Chỉ trả về nội dung tin nhắn, không thêm bình luận nào khác.`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
    });

    return new Response(
      JSON.stringify({ text }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('AI Generate Error:', error);
    
    let errorMessage = "Đã xảy ra lỗi khi tạo tin nhắn. Vui lòng thử lại sau.";
    
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
