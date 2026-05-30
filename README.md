# 🏫 키맨학원 관리 웹앱

대시보드, 수업 일정, 성적 관리, 공지, 솔라피 SMS 발송, AI 수업 보고서 기능을 갖춘 키맨키맨학원 관리 시스템입니다.

---

## 🚀 배포 방법 (Vercel)

### 1단계 — 준비물 설치

```bash
# Node.js 설치 확인 (없으면 https://nodejs.org 에서 LTS 다운로드)
node -v

# 패키지 설치
npm install
```

### 2단계 — 로컬에서 테스트

```bash
npm run dev
# → http://localhost:5173 에서 확인
```

### 3단계 — GitHub에 올리기

```bash
git init
git add .
git commit -m "키맨학원 관리 앱 초기 버전"

# GitHub에서 새 저장소 만든 후:
git remote add origin https://github.com/본인아이디/academy-web.git
git push -u origin main
```

### 4단계 — Vercel 배포

1. [vercel.com](https://vercel.com) → GitHub으로 로그인
2. **"Add New Project"** 클릭
3. 방금 만든 GitHub 저장소 선택
4. Framework: **Vite** 선택 (자동 감지됨)
5. **"Deploy"** 클릭 → 1~2분 후 배포 완료

배포 후 주소: `https://academy-web-본인이름.vercel.app`

---

## 🔐 환경변수 설정 (솔라피 SMS)

Vercel 대시보드에서 설정해야 문자 발송이 작동합니다.

1. Vercel 프로젝트 → **Settings → Environment Variables**
2. 아래 3개 변수 추가:

| 변수명 | 값 |
|---|---|
| `SOLAPI_API_KEY` | 솔라피 API Key |
| `SOLAPI_API_SECRET` | 솔라피 API Secret |
| `SOLAPI_FROM_NUMBER` | 발신번호 (예: 01012345678) |

3. **Redeploy** 클릭

### 솔라피 API Key 발급 방법
1. [solapi.com](https://solapi.com) 회원가입
2. 로그인 → 개발 → **API Key 관리**
3. **새 API Key 생성** → IP 허용: 모든 IP

---

## 📁 프로젝트 구조

```
academy-web/
├── api/
│   └── send-sms.js       ← Vercel Serverless Function (SMS 발송)
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx          ← React 진입점
│   └── App.jsx           ← 전체 앱 코드
├── index.html
├── vercel.json           ← Vercel 설정
├── vite.config.js
└── package.json
```

---

## 📱 PWA (홈화면에 앱처럼 추가)

배포 후 스마트폰 브라우저에서:
- **iOS Safari**: 공유 버튼 → "홈 화면에 추가"
- **Android Chrome**: 메뉴 → "앱 설치" 또는 "홈 화면에 추가"

→ 앱 아이콘이 생기고 앱처럼 전체화면으로 실행됩니다.

---

## 🛠 로컬 개발 팁

```bash
# SMS 로컬 테스트용 .env 파일 생성
cp .env.example .env
# .env 파일에 실제 솔라피 키 입력 후 저장

npm run dev
```
