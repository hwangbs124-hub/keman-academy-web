// api/send-sms.js
// Vercel Serverless Function — SMS + 카카오 알림톡 발송

export const config = { runtime: "nodejs" };

import { createHmac, randomBytes } from "crypto";

function generateSignature(apiSecret, dateTime, salt) {
  return createHmac("sha256", apiSecret)
    .update(dateTime + salt)
    .digest("hex");
}

function buildAuthHeader(apiKey, apiSecret) {
  const dateTime = new Date().toISOString();
  const salt = randomBytes(8).toString("hex");
  const signature = generateSignature(apiSecret, dateTime, salt);
  return `HMAC-SHA256 apiKey=${apiKey}, date=${dateTime}, salt=${salt}, signature=${signature}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { to, text, type = "sms", pfId, templateId, variables } = req.body;

  if (!to || !text) {
    return res.status(400).json({ error: "to, text 파라미터가 필요합니다." });
  }

  const apiKey    = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const from      = process.env.SOLAPI_FROM_NUMBER;
  const kakaoPfId = pfId || process.env.SOLAPI_KAKAO_PFID; // 카카오 채널 ID

  if (!apiKey || !apiSecret || !from) {
    return res.status(500).json({ error: "서버 환경변수(SOLAPI_API_KEY 등)가 설정되지 않았습니다." });
  }

  try {
    const authorization = buildAuthHeader(apiKey, apiSecret);

    let message;

    if (type === "kakao" && kakaoPfId) {
      // ── 카카오 알림톡 발송 ──
      // 알림톡 실패 시 SMS로 자동 대체(fallback)
      message = {
        to,
        from,
        kakaoOptions: {
          pfId: kakaoPfId,
          templateId: templateId || process.env.SOLAPI_KAKAO_TEMPLATE_ID,
          variables: variables || {},   // 템플릿 변수 (예: { "#{이름}": "홍길동" })
        },
        // fallback: 알림톡 실패 시 SMS로 대체
        text,
      };
    } else {
      // ── 일반 SMS/LMS 발송 ──
      message = { to, from, text };
    }

    const solapiRes = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authorization },
      body: JSON.stringify({ message }),
    });

    const data = await solapiRes.json();

    if (data.errorCode) {
      return res.status(400).json({ error: data.errorMessage || data.errorCode });
    }

    return res.status(200).json({ success: true, messageId: data.messageId, type });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
