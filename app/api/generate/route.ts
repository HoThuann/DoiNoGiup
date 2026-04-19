import { google } from '@ai-sdk/google';
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
    return new Response(
      JSON.stringify({ error: error.message || 'Lỗi khi gọi AI API' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
