// api/send-sms.js
export const config = { runtime: "nodejs" };

import { createHmac, randomBytes } from "crypto";

function buildAuthHeader(apiKey, apiSecret) {
  const dateTime = new Date().toISOString();
  const salt = randomBytes(8).toString("hex");
  const signature = createHmac("sha256", apiSecret).update(dateTime + salt).digest("hex");
  return `HMAC-SHA256 apiKey=${apiKey}, date=${dateTime}, salt=${salt}, signature=${signature}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { to, text, type = "sms", templateId, variables } = req.body;
  if (!to || !text) return res.status(400).json({ error: "to, text 파라미터가 필요합니다." });

  const apiKey    = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const from      = process.env.SOLAPI_FROM_NUMBER;
  const kakaoPfId = process.env.SOLAPI_KAKAO_PFID;
  const kakaoTmpl = templateId || process.env.SOLAPI_KAKAO_TEMPLATE_ID;
  const coachingTmpl = process.env.SOLAPI_KAKAO_COACHING_TEMPLATE_ID || kakaoTmpl;

  if (!apiKey || !apiSecret || !from) {
    return res.status(500).json({ error: "서버 환경변수가 설정되지 않았습니다." });
  }

  try {
    const authorization = buildAuthHeader(apiKey, apiSecret);
    let message;

    if (type === "friendtalk" && kakaoPfId) {
      // 카카오 친구톡 — pfId + text만으로 발송 (자유 텍스트)
      message = {
        to,
        from,
        text,
        kakaoOptions: {
          pfId: kakaoPfId,
        },
      };
    } else if (type === "kakao" && kakaoPfId) {
      // 카카오 알림톡 — 템플릿 ID 필요
      const isCoaching = variables && Object.keys(variables).some(k => k.includes("학습유형"));
      message = {
        to, from, text,
        kakaoOptions: {
          pfId: kakaoPfId,
          templateId: isCoaching ? coachingTmpl : kakaoTmpl,
          variables: variables || {},
        },
      };
    } else {
      // 일반 SMS/LMS
      message = { to, from, text };
    }

    const solapiRes = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authorization },
      body: JSON.stringify({ message }),
    });

    const data = await solapiRes.json();
    if (data.errorCode) return res.status(400).json({ error: data.errorMessage || data.errorCode });
    return res.status(200).json({ success: true, messageId: data.messageId, type });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
