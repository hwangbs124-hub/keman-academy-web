import { useState, useEffect } from "react";

const C = {
  bg:"#F4F6FB", card:"#FFFFFF", border:"#E2E8F0",
  accent:"#3B7EF6", accentSoft:"#EBF2FF",
  green:"#16A34A", greenSoft:"#DCFCE7",
  yellow:"#D97706", yellowSoft:"#FEF3C7",
  red:"#DC2626", redSoft:"#FEE2E2",
  text:"#1A202C", muted:"#64748B", dim:"#94A3B8",
};

// ── localStorage 기반 데이터 저장소 ──
function useStore(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = (v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    localStorage.setItem(key, JSON.stringify(next));
  };
  return [val, set];
}

const INIT_CLASSES = [
  { id:1, name:"수학 심화반", teacher:"김민준", time:"월·수 16:00", room:"A101", days:["월","수"] },
  { id:2, name:"영어 회화반", teacher:"이소연", time:"화·목 17:30", room:"B203", days:["화","목"] },
  { id:3, name:"과학 탐구반", teacher:"박도현", time:"수·금 15:00", room:"A102", days:["수","금"] },
  { id:4, name:"국어 논술반", teacher:"최지원", time:"월·목 18:00", room:"C301", days:["월","목"] },
  { id:5, name:"코딩 기초반", teacher:"정하은", time:"토 10:00",   room:"D401", days:["토"] },
];
const INIT_STUDENTS = [
  { id:1, name:"강서준", classId:1, avgScore:92, homework:"완료", trend:"up",   parentPhone:"010-1234-5678" },
  { id:2, name:"윤아린", classId:2, avgScore:88, homework:"완료", trend:"up",   parentPhone:"010-2345-6789" },
  { id:3, name:"임재현", classId:3, avgScore:74, homework:"미제출", trend:"down", parentPhone:"010-3456-7890" },
  { id:4, name:"한도연", classId:1, avgScore:95, homework:"완료", trend:"up",   parentPhone:"010-4567-8901" },
  { id:5, name:"오수민", classId:4, avgScore:81, homework:"완료", trend:"same", parentPhone:"010-5678-9012" },
  { id:6, name:"배지호", classId:5, avgScore:67, homework:"미제출", trend:"down", parentPhone:"010-6789-0123" },
  { id:7, name:"신예은", classId:2, avgScore:90, homework:"완료", trend:"up",   parentPhone:"010-7890-1234" },
];
const INIT_NOTICES = [
  { id:1, type:"공지", title:"6월 모의고사 일정 안내",    date:"2026.05.30", author:"키맨학원", read:true,  important:true },
  { id:2, type:"공지", title:"여름 특강 수강신청 안내",   date:"2026.05.28", author:"키맨학원", read:false, important:true },
  { id:3, type:"메시지", title:"5월 성적표 배부",         date:"2026.05.27", author:"이소연",  read:false, important:false },
];
const INIT_TEMPLATES = [
  { id:1, label:"결석 안내",      text:"[키맨학원] 안녕하세요, {이름} 학부모님. 오늘 {이름} 학생이 수업에 결석하였습니다. 확인 부탁드립니다." },
  { id:2, label:"성적 통보",      text:"[키맨학원] {이름} 학생의 이번 테스트 성적이 나왔습니다. 원내 방문 또는 문의 전화 주시기 바랍니다." },
  { id:3, label:"수업 일정 변경", text:"[키맨학원] 안녕하세요. 수업 일정이 변경되었습니다. 자세한 내용은 원으로 문의 바랍니다." },
  { id:4, label:"공지 전달",      text:"[키맨학원] 학부모님께 안내드립니다. 원에서 중요한 공지사항이 있으니 확인 부탁드립니다." },
];

const DAYS = ["월","화","수","목","금","토","일"];
const COLORS_LIST = [C.accent, C.green, C.red, C.yellow, "#A78BFA", "#EC4899", "#F97316"];

// ── 템플릿 기반 보고서 자동 생성 (무료, API 불필요) ──
function generateAIReport() {} // 더 이상 사용 안 함

function generateReportLocally({ student, cls, topic, attendCount, absentCount, absentNames, memo }) {
  const score = student ? student.avgScore : 80;
  const trend = student ? student.trend : "same";
  const homework = student ? student.homework : "완료";
  const name = cls?.name || "수업";

  // 점수 구간별 분석
  const scoreLevel = score >= 90 ? "우수" : score >= 80 ? "양호" : score >= 70 ? "보통" : "주의";
  const scorePhrases = {
    우수: { summary:"전반적으로 높은 이해도를 보이며 수업 참여도가 매우 우수합니다.", achievement:"핵심 개념을 빠르게 습득하고 심화 문제에서도 탁월한 성과를 보였습니다.", concern:"보다 도전적인 심화 학습 기회 제공이 필요합니다." },
    양호: { summary:"수업 내용을 안정적으로 이해하고 있으며 꾸준한 성취를 보이고 있습니다.", achievement:"기본 개념 이해도가 높고 수업 태도가 성실합니다.", concern:"일부 응용 문제에서 추가 연습이 필요합니다." },
    보통: { summary:"기본 개념 이해는 되나 심화 내용에서 보충이 필요한 상태입니다.", achievement:"수업에 성실히 참여하고 있으며 기초 실력을 갖추고 있습니다.", concern:"반복 학습과 추가 문제 풀이를 통한 실력 향상이 필요합니다." },
    주의: { summary:"기본 개념 이해에 어려움이 있어 집중적인 보충 지도가 필요합니다.", achievement:"수업 참여 의지가 있으며 개인 맞춤 지도 시 발전 가능성이 있습니다.", concern:"기초부터 체계적인 복습과 집중 보충 지도가 시급합니다." },
  };

  const trendPhrases = {
    up: "성적이 꾸준히 상승하는 긍정적인 흐름입니다.",
    down: "최근 성적이 하락 추세로 원인 파악과 대책이 필요합니다.",
    same: "성적이 안정적으로 유지되고 있습니다.",
  };

  const homeworkPhrase = homework === "완료"
    ? "과제 이행률이 우수하여 자기 주도 학습 습관이 잘 형성되어 있습니다."
    : "과제 미제출이 확인되어 학습 습관 개선이 필요합니다.";

  const absentPhrase = absentCount > 0
    ? `결석 ${absentCount}명(${absentNames.join(", ")})이 있어 개별 확인이 필요합니다.`
    : "전원 출석하여 수업 참여도가 높습니다.";

  return {
    title: `${name} ${topic} 수업 보고서`,
    summary: `${topic} 수업에서 ${scorePhrases[scoreLevel].summary} ${trendPhrases[trend]} ${absentPhrase}`,
    achievements: [
      scorePhrases[scoreLevel].achievement,
      homeworkPhrase,
      `출석 ${attendCount}명으로 ${attendCount === (attendCount + absentCount) ? "전원 참석하여" : "대부분 참석하여"} 수업 집중도가 높았습니다.`,
    ],
    concerns: [
      scorePhrases[scoreLevel].concern,
      absentCount > 0 ? `결석 학생(${absentNames.join(", ")})의 보충 수업 및 개별 연락이 필요합니다.` : "지속적인 동기 부여와 학습 흥미 유지가 중요합니다.",
    ],
    nextPlan: `다음 수업에서는 ${topic} 심화 내용을 다루며, ${scoreLevel === "주의" || scoreLevel === "보통" ? "기초 개념 복습을 병행하여 이해도를 높일 계획입니다." : "응용 문제와 실전 연습을 통해 실력을 강화할 계획입니다."}`,
    parentMessage: `[키맨학원] 오늘 ${topic} 수업이 진행되었습니다. ${scorePhrases[scoreLevel].summary} 가정에서도 복습을 격려해 주시면 감사하겠습니다.`,
  };
}

function generateCoachingLocally({ student, cls, extraInfo }) {
  const score = student.avgScore;
  const trend = student.trend;
  const homework = student.homework;
  const scoreLevel = score >= 90 ? "우수" : score >= 80 ? "양호" : score >= 70 ? "보통" : "주의";

  const typeMap = {
    우수: { type:"성취형", desc:"목표 의식이 뚜렷하고 자기 주도 학습 능력이 뛰어납니다. 높은 성취 동기와 집중력으로 꾸준한 성과를 내고 있습니다.", dist:{"성취형":35,"집중형":28,"반복형":20,"탐구형":12,"기타":5} },
    양호: { type:"성실형", desc:"꾸준하고 성실한 학습 태도가 돋보입니다. 안정적인 학습 패턴을 유지하며 지속적으로 성장하고 있습니다.", dist:{"성실형":30,"반복형":25,"집중형":22,"탐구형":15,"기타":8} },
    보통: { type:"잠재형", desc:"기초 실력을 갖추고 있으나 학습 방법 개선이 필요합니다. 올바른 학습 습관을 형성하면 빠른 성장이 기대됩니다.", dist:{"반복형":32,"분산형":25,"잠재형":20,"집중형":15,"기타":8} },
    주의: { type:"집중지원형", desc:"학습에 어려움을 겪고 있어 체계적인 지원이 필요합니다. 개인 맞춤 지도를 통해 기초를 다지면 성장 가능성이 충분합니다.", dist:{"분산형":35,"집중지원형":28,"반복형":20,"잠재형":12,"기타":5} },
  };

  const profile = typeMap[scoreLevel];

  return {
    studyProfile: { type: profile.type, description: profile.desc, traits: ["자기 주도 학습", "규칙적인 학습 패턴", "목표 지향적 사고", "집중력 유지"], distribution: profile.dist },
    strengths: [
      score >= 80 ? "평균 이상의 학업 성취도를 보이고 있습니다." : "수업 참여 의지와 향상 가능성이 있습니다.",
      homework === "완료" ? "과제 이행률이 우수하여 자기 주도 학습이 잘 되어 있습니다." : "수업 내 집중도는 유지되고 있습니다.",
      trend === "up" ? "성적이 지속적으로 상승하는 긍정적 흐름을 보이고 있습니다." : "학습 루틴이 어느 정도 형성되어 있습니다.",
    ],
    weaknesses: [
      score < 80 ? "기초 개념 이해도 강화가 필요합니다." : "심화 문제 적용력을 더 키울 필요가 있습니다.",
      homework !== "완료" ? "과제 미제출이 반복되어 자기 관리 능력 향상이 필요합니다." : "장기적인 학습 지속성 유지가 중요합니다.",
      trend === "down" ? "최근 성적 하락 원인을 파악하고 즉각적인 대처가 필요합니다." : "학습 동기 유지와 꾸준한 노력이 필요합니다.",
    ],
    expertAnalysis: `${student.name} 학생은 현재 평균 ${score}점으로 ${scoreLevel} 수준에 해당합니다. ${profile.desc} ${trend === "up" ? "최근 성적 상승 추세는 매우 고무적이며 이 흐름을 유지하는 것이 중요합니다." : trend === "down" ? "성적 하락 추세가 확인되어 즉각적인 원인 분석과 학습 전략 수정이 필요합니다." : "안정적인 성적을 유지하고 있으나 한 단계 도약을 위한 새로운 자극이 필요합니다."} ${extraInfo.teacherNote ? "담당 교사 관찰에 따르면 " + extraInfo.teacherNote + " 이 점을 고려한 개별 지도가 효과적입니다." : "지속적인 관심과 격려로 학습 동기를 높여주는 것이 중요합니다."}`,
    riskFactors: [
      trend === "down" ? "성적 하락 추세 지속 시 자신감 저하 우려" : "현 수준에서 정체될 경우 학습 의욕 저하 가능성",
      homework !== "완료" ? "과제 미이행 습관 지속 시 학습 결손 심화" : "과도한 목표 설정으로 인한 번아웃 주의",
    ],
    solutions: {
      reviewMethod: ["수업 후 당일 15분 복습 습관화", "핵심 내용 노트 정리 후 주 1회 재검토", "오답 노트 작성으로 취약점 집중 보완"],
      memoryMethod: ["반복 학습법: 1일·3일·7일 간격 복습", "연상 기억법으로 핵심 개념 연결하여 암기"],
      studyRoutine: ["매일 정해진 시간에 30~60분 집중 학습", "학습 전 목표 설정, 후 달성 여부 체크", score < 75 ? "주 2회 보충 학습 시간 확보" : "주 1회 심화 문제 풀이 시간 배정"],
      focusTips: ["학습 시작 전 휴대폰 차단 및 조용한 환경 조성", "포모도로 기법(25분 집중 + 5분 휴식) 활용"],
    },
    parentGuide: [
      "규칙적인 학습 시간을 함께 설정하고 지켜나갈 수 있도록 격려해 주세요.",
      homework !== "완료" ? "매일 과제 완료 여부를 확인하고 완료 시 긍정적인 피드백을 주세요." : "잘하고 있음을 자주 칭찬하여 학습 자신감을 키워주세요.",
      "학습 결과보다 노력 과정에 초점을 맞춘 대화로 내적 동기를 키워주세요.",
      "주 1회 이상 학원과 소통하여 학습 상황을 공유하시면 더욱 효과적입니다.",
    ],
    nextGoals: [
      `단기 목표 (1개월): ${score < 80 ? "평균 " + (score + 5) + "점 달성 및 과제 100% 이행" : "현 수준 유지 및 취약 단원 집중 보완"}`,
      `중기 목표 (3개월): ${score < 90 ? "평균 " + Math.min(score + 10, 95) + "점 달성 및 자기 주도 학습 습관 완성" : "심화 과정 완료 및 상위권 유지"}`,
    ],
    teacherMessage: `${student.name} 학생은 ${profile.type} 유형으로 ${scoreLevel === "우수" || scoreLevel === "양호" ? "강점을 살린 심화 학습 기회를 제공하면 더욱 빠르게 성장할 수 있습니다." : "기초 개념 반복 학습과 성공 경험을 통한 자신감 회복이 우선입니다."} 개별 면담을 통해 학습 목표를 함께 설정하고 작은 성취에도 적극적으로 칭찬해 주시기 바랍니다.`,
  };
}

async function sendSolapiSMS({ to, text, type="sms", variables }) {
  const res = await fetch("/api/send-sms", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ to, text, type, variables }),
  });
  return res.json();
}

const NAV = [
  { id:"dashboard", icon:"⊞", label:"대시보드" },
  { id:"students",  icon:"◎", label:"학생 관리" },
  { id:"classes",   icon:"◫", label:"수업 관리" },
  { id:"schedule",  icon:"▦", label:"시간표" },
  { id:"grades",    icon:"◈", label:"성적/과제" },
  { id:"notice",    icon:"◉", label:"공지/메시지" },
  { id:"sms",       icon:"✉", label:"문자 발송" },
  { id:"consult",   icon:"💬", label:"상담 문자" },
  { id:"coaching",  icon:"★", label:"코칭 리포트" },
  { id:"settings",  icon:"⚙", label:"설정" },
];

export default function App() {
  const [nav, setNav] = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [classes,   setClasses]   = useStore("km_classes",   INIT_CLASSES);
  const [students,  setStudents]  = useStore("km_students",  INIT_STUDENTS);
  const [notices,   setNotices]   = useStore("km_notices",   INIT_NOTICES);
  const [templates, setTemplates] = useStore("km_templates", INIT_TEMPLATES);
  const [settings,  setSettings]  = useStore("km_settings",  { academyName:"키맨학원", directorName:"원장", fromNumber:"" });

  const unread = notices.filter(n => !n.read).length;
  const store = { classes, setClasses, students, setStudents, notices, setNotices, templates, setTemplates, settings, setSettings };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Noto Sans KR',sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Space+Grotesk:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button{cursor:pointer;border:none;background:none;font-family:inherit}
        input,textarea,select{font-family:inherit;outline:none}
        .ni{transition:all 0.15s}.ni:hover{background:rgba(59,126,246,0.07)!important}.ni.on{background:rgba(59,126,246,0.12)!important}
        .rh:hover{background:rgba(59,126,246,0.03)!important}
        .bt{transition:all 0.15s}.bt:hover{opacity:0.85;transform:translateY(-1px)}
        .fade{animation:fi 0.3s ease}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .spin{animation:sp 0.8s linear infinite}@keyframes sp{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:2px}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
        .modal{background:#fff;border-radius:16px;padding:24px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto}

        .drawer-overlay{display:none;position:fixed;inset:0;background:rgba(15,23,42,0.4);z-index:40;backdrop-filter:blur(2px)}
        .drawer-overlay.open{display:block}
        .mobile-drawer{position:fixed;top:0;left:0;bottom:0;width:260px;background:#fff;z-index:50;box-shadow:4px 0 32px rgba(0,0,0,0.15);border-radius:0 24px 24px 0;display:flex;flex-direction:column;transform:translateX(-100%);transition:transform 0.28s cubic-bezier(0.4,0,0.2,1)}
        .mobile-drawer.open{transform:translateX(0)}

        .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .grid-7{display:grid;grid-template-columns:repeat(7,1fr);gap:10px}
        .grid-report{display:grid;grid-template-columns:1fr 1.4fr;gap:18px}
        .grid-sms{display:grid;grid-template-columns:1fr 1.3fr;gap:18px}
        .grid-coaching{display:grid;grid-template-columns:300px 1fr;gap:18px}
        .grid-5col{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
        .table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}

        .mobile-topbar{display:none}
        .desktop-sidebar{display:flex}

        @media(max-width:768px){
          .desktop-sidebar{display:none!important}
          .mobile-topbar{display:flex;background:#fff;border-bottom:1px solid #E2E8F0;padding:12px 16px;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:30;flex-shrink:0}
          .main-content{padding:16px 14px 24px!important}
          .grid-4{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
          .grid-2{grid-template-columns:1fr!important;gap:12px!important}
          .grid-3{grid-template-columns:1fr!important;gap:10px!important}
          .grid-7{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}
          .grid-report{grid-template-columns:1fr!important;gap:12px!important}
          .grid-sms{grid-template-columns:1fr!important;gap:12px!important}
          .grid-coaching{grid-template-columns:1fr!important;gap:12px!important}
          .grid-5col{grid-template-columns:1fr 1fr!important;gap:8px!important}
          .hide-mobile{display:none!important}
        }
        @media(max-width:480px){
          .grid-4{grid-template-columns:repeat(2,1fr)!important}
          .grid-5col{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* 모바일 상단 바 */}
      <div className="mobile-topbar">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:C.accent, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#fff" }}>K</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{NAV.find(n=>n.id===nav)?.label || "키맨학원"}</div>
            <div style={{ fontSize:10, color:C.muted }}>{settings.academyName}</div>
          </div>
        </div>
        <button onClick={()=>setDrawerOpen(true)} style={{ display:"flex", flexDirection:"column", gap:5, padding:"6px", background:"none", border:"none", cursor:"pointer" }}>
          <span style={{ display:"block", width:22, height:2, borderRadius:2, background:C.accent }}></span>
          <span style={{ display:"block", width:16, height:2, borderRadius:2, background:C.accent }}></span>
          <span style={{ display:"block", width:20, height:2, borderRadius:2, background:C.accent }}></span>
        </button>
      </div>

      {/* 사이드바 + 메인 가로 배치 */}
      <div style={{ display:"flex", flex:1, minHeight:0 }}>

        {/* 데스크탑 사이드바 */}
        <aside className="desktop-sidebar" style={{ width:72, background:C.card, borderRight:`1px solid ${C.border}`, flexDirection:"column", alignItems:"center", padding:"18px 0", position:"sticky", top:0, height:"100vh", zIndex:10, boxShadow:"2px 0 8px rgba(0,0,0,0.04)", flexShrink:0 }}>
          <div style={{ width:36, height:36, background:C.accent, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"#fff", marginBottom:4, boxShadow:`0 4px 12px rgba(59,126,246,0.3)` }}>K</div>
          <div style={{ fontSize:8, color:C.accent, fontWeight:700, marginBottom:20 }}>{settings.academyName.slice(0,3)}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4, width:"100%", overflowY:"auto" }}>
            {NAV.map(item => (
              <button key={item.id} className={`ni${nav===item.id?" on":""}`} onClick={() => setNav(item.id)}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"9px 4px", borderRadius:8, margin:"0 6px", position:"relative" }} title={item.label}>
                <span style={{ fontSize:16, color:nav===item.id?C.accent:C.dim }}>{item.icon}</span>
                <span style={{ fontSize:8, color:nav===item.id?C.accent:C.dim }}>{item.label}</span>
                {item.id==="notice"&&unread>0&&(
                  <span style={{ position:"absolute", top:4, right:8, width:13, height:13, background:C.red, borderRadius:"50%", fontSize:7, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#fff" }}>{unread}</span>
                )}
              </button>
            ))}
          </div>
          <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#3B7EF6,#6366F1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff" }}>{settings.directorName[0]}</div>
            <span style={{ fontSize:8, color:C.dim }}>{settings.directorName}</span>
          </div>
        </aside>

        <main className="main-content" style={{ flex:1, overflow:"auto", padding:"28px 32px", minWidth:0 }}>
          {nav==="dashboard" && <Dashboard store={store} setNav={setNav} />}
          {nav==="students"  && <StudentsPanel store={store} />}
          {nav==="classes"   && <ClassesPanel store={store} />}
          {nav==="schedule"  && <SchedulePanel store={store} />}
          {nav==="grades"    && <GradesPanel store={store} />}
          {nav==="notice"    && <NoticePanel store={store} />}
          {nav==="sms"       && <SMSPanel store={store} />}
          {nav==="consult"   && <ConsultPanel store={store} />}
          {nav==="coaching"  && <CoachingPanel store={store} />}
          {nav==="settings"  && <SettingsPanel store={store} />}
        </main>
      </div>

      {/* 모바일 드로어 오버레이 */}
      <div className={`drawer-overlay${drawerOpen?" open":""}`} onClick={()=>setDrawerOpen(false)} />

      {/* 모바일 사이드 드로어 */}
      <nav className={`mobile-drawer${drawerOpen?" open":""}`}>
        <div style={{ padding:"20px 16px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, background:C.accent, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"#fff", flexShrink:0 }}>K</div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:C.text }}>{settings.academyName}</div>
            <div style={{ fontSize:11, color:C.muted }}>{settings.directorName}</div>
          </div>
          <button onClick={()=>setDrawerOpen(false)} style={{ marginLeft:"auto", fontSize:20, color:C.dim, background:"none", border:"none", cursor:"pointer", padding:"4px" }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"10px" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={()=>{setNav(item.id);setDrawerOpen(false);}}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"13px 14px", borderRadius:12, marginBottom:3, background:nav===item.id?C.accentSoft:"transparent", border:"none", cursor:"pointer", textAlign:"left", position:"relative" }}>
              <span style={{ fontSize:20, width:26, textAlign:"center", flexShrink:0, color:nav===item.id?C.accent:C.dim }}>{item.icon}</span>
              <span style={{ fontSize:14, fontWeight:nav===item.id?700:500, color:nav===item.id?C.accent:C.text }}>{item.label}</span>
              {item.id==="notice"&&unread>0&&(
                <span style={{ marginLeft:"auto", background:C.red, color:"#fff", fontSize:10, fontWeight:700, width:18, height:18, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{unread}</span>
              )}
              {nav===item.id && <div style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", width:3, height:24, background:C.accent, borderRadius:2 }} />}
            </button>
          ))}
        </div>
        <div style={{ padding:"14px 16px", borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#3B7EF6,#6366F1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff" }}>{settings.directorName[0]}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{settings.directorName}</div>
              <div style={{ fontSize:11, color:C.muted }}>원장</div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

// ── 공통 컴포넌트 ──
function Hdr({ title, sub }) {
  return <div style={{ marginBottom:24 }}>
    <h1 style={{ fontSize:22, fontWeight:900, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:"-0.02em" }}>{title}</h1>
    {sub && <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>{sub}</div>}
  </div>;
}
function Card({ children, style: s }) {
  return <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:22, ...s }}>{children}</div>;
}
function Btn({ children, onClick, color=C.accent, small, outline, style: s }) {
  return <button className="bt" onClick={onClick} style={{
    padding: small?"5px 12px":"9px 18px", borderRadius:8, fontSize:small?11:13, fontWeight:600,
    background: outline?"transparent":color, color: outline?color:"#fff",
    border: outline?`1.5px solid ${color}`:"none", ...s
  }}>{children}</button>;
}
function Input({ label, value, onChange, placeholder, type="text", style: s }) {
  return <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5, fontWeight:500 }}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:C.text, background:"#fff", ...s }} />
  </div>;
}
function Select({ label, value, onChange, options }) {
  return <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5, fontWeight:500 }}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:C.text, background:"#fff" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>;
}
function Modal({ title, onClose, children }) {
  return <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal fade">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:16, fontWeight:700 }}>{title}</div>
        <button onClick={onClose} style={{ fontSize:20, color:C.muted }}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}
function Badge({ children, color=C.accent }) {
  return <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:color+"18", color, fontWeight:700 }}>{children}</span>;
}

// ── 대시보드 ──
function Dashboard({ store, setNav }) {
  const { classes, students, notices } = store;
  const unread = notices.filter(n=>!n.read).length;
  const today = new Date().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
  return <div className="fade">
    <Hdr title="대시보드" sub={today} />
    <div className="grid-4" style={{ marginBottom:24 }}>
      {[
        { label:"전체 학생", value:students.length+"명", color:C.accent, icon:"◎", nav:"students" },
        { label:"진행 수업", value:classes.length+"개 반", color:C.green, icon:"◫", nav:"classes" },
        { label:"미제출 과제", value:students.filter(s=>s.homework==="미제출").length+"명", color:C.yellow, icon:"◈", nav:"grades" },
        { label:"미확인 메시지", value:unread+"건", color:C.red, icon:"◉", nav:"notice" },
      ].map((s,i) => (
        <div key={i} onClick={()=>setNav(s.nav)} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px", cursor:"pointer", transition:"all 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="none"}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:11, color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>{s.label}</div>
              <div style={{ fontSize:28, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", color:s.color }}>{s.value}</div>
            </div>
            <div style={{ width:34, height:34, background:s.color+"15", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:s.color }}>{s.icon}</div>
          </div>
        </div>
      ))}
    </div>
    <div className="grid-2">
      <Card>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>반 현황</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {classes.map((c,i) => (
            <div key={c.id} className="rh" style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 10px", borderRadius:8 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:COLORS_LIST[i%COLORS_LIST.length], flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
                <div style={{ fontSize:11, color:C.muted }}>{c.teacher} · {c.time} · {c.room}</div>
              </div>
              <Badge color={COLORS_LIST[i%COLORS_LIST.length]}>{students.filter(s=>s.classId===c.id).length}명</Badge>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>최근 공지</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {notices.slice(0,5).map(n => (
            <div key={n.id} className="rh" style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:8, borderLeft:`2px solid ${n.important?C.accent:"transparent"}` }}>
              <Badge color={n.type==="공지"?C.accent:C.green}>{n.type}</Badge>
              <div style={{ flex:1, fontSize:12, fontWeight:n.read?400:600, color:n.read?C.muted:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.title}</div>
              {!n.read && <div style={{ width:6, height:6, borderRadius:"50%", background:C.red, flexShrink:0 }} />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>;
}

// ── 학생 관리 ──
function StudentsPanel({ store }) {
  const { classes, students, setStudents } = store;
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [xlsxModal, setXlsxModal] = useState(false);
  const [xlsxPreview, setXlsxPreview] = useState([]);
  const [xlsxMode, setXlsxMode] = useState("add"); // "add" | "replace"
  const [xlsxError, setXlsxError] = useState("");

  const open = (s) => { setForm(s ? {...s} : { name:"", classId:classes[0]?.id||1, avgScore:80, homework:"완료", trend:"same", parentPhone:"" }); setModal(s||"add"); };
  const save = () => {
    if (!form.name) return alert("이름을 입력하세요");
    if (modal==="add") setStudents(p=>[...p,{...form,id:Date.now(),avgScore:Number(form.avgScore||80)}]);
    else setStudents(p=>p.map(s=>s.id===form.id?{...form,avgScore:Number(form.avgScore)}:s));
    setModal(null);
  };
  const del = (id) => { if(confirm("삭제하시겠습니까?")) setStudents(p=>p.filter(s=>s.id!==id)); };

  // 엑셀 다운로드 (양식)
  const downloadTemplate = () => {
    const rows = [
      ["이름","반이름","학부모연락처","평균점수","과제상태","성적추세"],
      ["홍길동","수학 심화반","010-1234-5678","85","완료","up"],
      ["김영희","영어 회화반","010-9876-5432","92","완료","up"],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF"+csv], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="학생목록_양식.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // CSV/엑셀 파일 파싱
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setXlsxError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        const headers = lines[0].split(",").map(h => h.trim().replace(/"/g,""));
        const dataRows = lines.slice(1);
        const parsed = dataRows.map((line, i) => {
          const cols = line.split(",").map(c => c.trim().replace(/"/g,""));
          const name = cols[0] || "";
          const className = cols[1] || "";
          const parentPhone = cols[2] || "";
          const avgScore = Number(cols[3]) || 80;
          const homework = cols[4] === "미제출" ? "미제출" : "완료";
          const trend = ["up","down","same"].includes(cols[5]) ? cols[5] : "same";
          const cls = classes.find(c => c.name === className);
          return { id: Date.now()+i, name, classId: cls?.id || classes[0]?.id, className: className||"미지정", parentPhone, avgScore, homework, trend };
        }).filter(r => r.name);
        if (parsed.length === 0) { setXlsxError("학생 데이터가 없습니다. 양식을 확인해주세요."); return; }
        setXlsxPreview(parsed);
      } catch(err) { setXlsxError("파일 파싱 오류: " + err.message); }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const applyXlsx = () => {
    const toAdd = xlsxPreview.map(({className, ...s}) => s);
    if (xlsxMode === "replace") setStudents(toAdd);
    else setStudents(p => [...p, ...toAdd]);
    setXlsxModal(false); setXlsxPreview([]);
  };

  const filtered = students.filter(s => {
    const cls = classes.find(c=>c.id===s.classId);
    return (filterClass==="all"||s.classId===Number(filterClass)) &&
      (s.name.includes(search) || (cls?.name||"").includes(search));
  });

  return <div className="fade">
    <Hdr title="학생 관리" sub={`전체 ${students.length}명`} />
    <Card style={{ marginBottom:16 }}>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 학생 이름 검색"
          style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:13 }} />
        <select value={filterClass} onChange={e=>setFilterClass(e.target.value)}
          style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:13, color:C.text }}>
          <option value="all">전체 반</option>
          {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Btn outline color={C.green} onClick={downloadTemplate}>📥 양식 다운로드</Btn>
        <Btn outline color={C.accent} onClick={()=>{setXlsxModal(true);setXlsxPreview([]);setXlsxError("");}}>📤 엑셀 업로드</Btn>
        <Btn onClick={()=>open(null)}>+ 학생 추가</Btn>
      </div>
    </Card>
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {filtered.map(s => {
        const cls = classes.find(c=>c.id===s.classId);
        return (
          <Card key={s.id} style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <div style={{ fontSize:14, fontWeight:700 }}>{s.name}</div>
                  <Badge color={s.homework==="완료"?C.green:C.red}>{s.homework}</Badge>
                </div>
                <div style={{ fontSize:11, color:C.muted }}>{cls?.name||"미지정"}</div>
                <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{s.parentPhone||"연락처 없음"}</div>
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <Btn small outline onClick={()=>open(s)}>수정</Btn>
                <Btn small outline color={C.red} onClick={()=>del(s.id)}>삭제</Btn>
              </div>
            </div>
          </Card>
        );
      })}
      {filtered.length===0 && <Card style={{ textAlign:"center", padding:"32px", color:C.dim }}>학생이 없습니다</Card>}
    </div>

    {/* 엑셀 업로드 모달 */}
    {xlsxModal && <Modal title="📤 엑셀/CSV 업로드" onClose={()=>setXlsxModal(false)}>
      {/* 안내 */}
      <div style={{ background:C.accentSoft, borderRadius:10, padding:"12px 14px", marginBottom:16, fontSize:12, color:C.accent, lineHeight:1.8 }}>
        <b>양식 안내</b><br/>
        열 순서: 이름 / 반이름 / 학부모연락처 / 평균점수 / 과제상태 / 성적추세<br/>
        과제상태: <b>완료</b> 또는 <b>미제출</b><br/>
        성적추세: <b>up</b>(상승) / <b>down</b>(하락) / <b>same</b>(유지)<br/>
        반이름은 앱에 등록된 반 이름과 정확히 일치해야 합니다.
      </div>

      {/* 파일 업로드 */}
      {xlsxPreview.length === 0 && <>
        <label style={{ display:"block", border:`2px dashed ${C.border}`, borderRadius:12, padding:"28px", textAlign:"center", cursor:"pointer", marginBottom:14, background:C.bg }}>
          <div style={{ fontSize:28, marginBottom:8 }}>📂</div>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>CSV 파일을 클릭하여 선택</div>
          <div style={{ fontSize:11, color:C.muted }}>엑셀에서 CSV로 저장 후 업로드 (.csv)</div>
          <input type="file" accept=".csv,.txt" onChange={handleFile} style={{ display:"none" }} />
        </label>
        {xlsxError && <div style={{ color:C.red, fontSize:12, marginBottom:12, padding:"8px 12px", background:C.redSoft, borderRadius:8 }}>⚠ {xlsxError}</div>}
        <div style={{ textAlign:"center" }}>
          <button onClick={downloadTemplate} style={{ fontSize:12, color:C.accent, textDecoration:"underline", background:"none", border:"none", cursor:"pointer" }}>
            📥 양식 CSV 다운로드
          </button>
        </div>
      </>}

      {/* 미리보기 */}
      {xlsxPreview.length > 0 && <>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:C.green }}>✓ {xlsxPreview.length}명 인식됨 — 미리보기</div>
        <div style={{ maxHeight:240, overflowY:"auto", border:`1px solid ${C.border}`, borderRadius:10, marginBottom:14 }}>
          <div className="table-scroll"><table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
            <thead><tr style={{ background:C.bg, borderBottom:`1px solid ${C.border}` }}>
              {["이름","반","연락처","점수","과제","추세"].map(h=><th key={h} style={{ padding:"7px 10px", fontSize:11, color:C.muted, textAlign:"left", fontWeight:500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {xlsxPreview.map((s,i)=>(
                <tr key={i} style={{ borderBottom:`1px solid ${C.border}22` }}>
                  <td style={{ padding:"7px 10px", fontSize:12, fontWeight:600 }}>{s.name}</td>
                  <td style={{ padding:"7px 10px", fontSize:11, color:C.muted }}>{s.className}</td>
                  <td style={{ padding:"7px 10px", fontSize:11, color:C.muted }}>{s.parentPhone||"-"}</td>
                  <td style={{ padding:"7px 10px", fontSize:12, fontWeight:700, color:s.avgScore>=90?C.green:s.avgScore>=75?C.accent:C.yellow }}>{s.avgScore}</td>
                  <td style={{ padding:"7px 10px" }}><Badge color={s.homework==="완료"?C.green:C.red}>{s.homework}</Badge></td>
                  <td style={{ padding:"7px 10px", fontSize:13 }}>{s.trend==="up"?"↑":s.trend==="down"?"↓":"→"}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>

        {/* 추가 방식 선택 */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:8 }}>업로드 방식</div>
          <div style={{ display:"flex", gap:10 }}>
            {[{id:"add",label:"➕ 기존 학생에 추가"},{id:"replace",label:"🔄 전체 교체"}].map(opt=>(
              <label key={opt.id} style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${xlsxMode===opt.id?C.accent:C.border}`, background:xlsxMode===opt.id?C.accentSoft:"#fff" }}>
                <input type="radio" checked={xlsxMode===opt.id} onChange={()=>setXlsxMode(opt.id)} style={{accentColor:C.accent}} />
                <span style={{ fontSize:12, fontWeight:600, color:xlsxMode===opt.id?C.accent:C.text }}>{opt.label}</span>
              </label>
            ))}
          </div>
          {xlsxMode==="replace" && <div style={{ fontSize:11, color:C.red, marginTop:6 }}>⚠ 기존 학생 데이터가 모두 삭제되고 업로드 데이터로 교체됩니다.</div>}
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"space-between" }}>
          <button onClick={()=>setXlsxPreview([])} style={{ fontSize:12, color:C.muted, background:"none", border:"none", cursor:"pointer" }}>← 다시 선택</button>
          <div style={{ display:"flex", gap:10 }}>
            <Btn outline color={C.muted} onClick={()=>setXlsxModal(false)}>취소</Btn>
            <Btn onClick={applyXlsx}>{xlsxMode==="replace"?"전체 교체하기":`${xlsxPreview.length}명 추가하기`}</Btn>
          </div>
        </div>
      </>}
    </Modal>}

    {modal && <Modal title={modal==="add"?"학생 추가":"학생 수정"} onClose={()=>setModal(null)}>
      <Input label="이름" value={form.name||""} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="학생 이름" />
      <Select label="수강반" value={form.classId||""} onChange={v=>setForm(p=>({...p,classId:Number(v)}))}
        options={classes.map(c=>({value:c.id,label:c.name}))} />
      <Input label="학부모 연락처" value={form.parentPhone||""} onChange={v=>setForm(p=>({...p,parentPhone:v}))} placeholder="010-0000-0000" />
      <Select label="과제 상태" value={form.homework||"완료"} onChange={v=>setForm(p=>({...p,homework:v}))}
        options={[{value:"완료",label:"완료"},{value:"미제출",label:"미제출"}]} />
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <Btn outline color={C.muted} onClick={()=>setModal(null)}>취소</Btn>
        <Btn onClick={save}>저장</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── 수업 관리 ──
function ClassesPanel({ store }) {
  const { classes, setClasses, students } = store;
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const open = (c) => { setForm(c?{...c}:{name:"",teacher:"",time:"",room:"",days:[]}); setModal(c||"add"); };
  const save = () => {
    if(!form.name) return alert("반 이름을 입력하세요");
    if(modal==="add") setClasses(p=>[...p,{...form,id:Date.now()}]);
    else setClasses(p=>p.map(c=>c.id===form.id?{...form}:c));
    setModal(null);
  };
  const del = (id) => { if(confirm("삭제하시겠습니까?")) setClasses(p=>p.filter(c=>c.id!==id)); };
  const toggleDay = (d) => setForm(p=>({...p,days:p.days?.includes(d)?p.days.filter(x=>x!==d):[...(p.days||[]),d]}));

  return <div className="fade">
    <Hdr title="수업 관리" sub={`전체 ${classes.length}개 반`} />
    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
      <Btn onClick={()=>open(null)}>+ 수업 추가</Btn>
    </div>
    <div className="grid-3">
      {classes.map((c,i) => {
        const cnt = students.filter(s=>s.classId===c.id).length;
        return <Card key={c.id} style={{ borderLeft:`3px solid ${COLORS_LIST[i%COLORS_LIST.length]}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div style={{ fontSize:15, fontWeight:700, color:COLORS_LIST[i%COLORS_LIST.length] }}>{c.name}</div>
            <div style={{ display:"flex", gap:6 }}>
              <Btn small outline onClick={()=>open(c)}>수정</Btn>
              <Btn small outline color={C.red} onClick={()=>del(c.id)}>삭제</Btn>
            </div>
          </div>
          {[["담당 선생님", c.teacher],["수업 시간", c.time],["강의실", c.room],["수강생", cnt+"명"]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
              <span style={{ color:C.muted }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
            </div>
          ))}
          {c.days?.length>0 && <div style={{ display:"flex", gap:4, marginTop:10 }}>
            {c.days.map(d=><Badge key={d} color={COLORS_LIST[i%COLORS_LIST.length]}>{d}</Badge>)}
          </div>}
        </Card>;
      })}
    </div>

    {modal && <Modal title={modal==="add"?"수업 추가":"수업 수정"} onClose={()=>setModal(null)}>
      <Input label="반 이름" value={form.name||""} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="예: 수학 심화반" />
      <Input label="담당 선생님" value={form.teacher||""} onChange={v=>setForm(p=>({...p,teacher:v}))} placeholder="선생님 이름" />
      <Input label="수업 시간" value={form.time||""} onChange={v=>setForm(p=>({...p,time:v}))} placeholder="예: 월·수 16:00" />
      <Input label="강의실" value={form.room||""} onChange={v=>setForm(p=>({...p,room:v}))} placeholder="예: A101" />
      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:8, fontWeight:500 }}>수업 요일</label>
        <div style={{ display:"flex", gap:6 }}>
          {DAYS.map(d=>(
            <button key={d} onClick={()=>toggleDay(d)} style={{ width:34, height:34, borderRadius:8, fontSize:13, fontWeight:600, border:`1.5px solid ${form.days?.includes(d)?C.accent:C.border}`, background:form.days?.includes(d)?C.accentSoft:"#fff", color:form.days?.includes(d)?C.accent:C.muted }}>{d}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <Btn outline color={C.muted} onClick={()=>setModal(null)}>취소</Btn>
        <Btn onClick={save}>저장</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── 시간표 ──
function SchedulePanel({ store }) {
  const { classes, setClasses } = store;
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [viewMode, setViewMode] = useState("week");

  const open = (c) => { setForm({...c}); setModal(c); };
  const save = () => { setClasses(p => p.map(c => c.id === form.id ? {...form} : c)); setModal(null); };
  const toggleDay = (d) => setForm(p => ({...p, days: p.days?.includes(d) ? p.days.filter(x=>x!==d) : [...(p.days||[]), d]}));

  return <div className="fade">
    <Hdr title="시간표" sub="수업 카드를 클릭하면 수정할 수 있어요" />

    <div style={{ display:"flex", gap:4, marginBottom:16, background:C.card, borderRadius:10, padding:4, width:"fit-content", border:`1px solid ${C.border}` }}>
      {[{id:"week",label:"📅 주간"},{id:"list",label:"📋 목록"}].map(m=>(
        <button key={m.id} onClick={()=>setViewMode(m.id)} style={{ padding:"7px 16px", borderRadius:7, fontSize:13, fontWeight:600, border:"none", cursor:"pointer", background:viewMode===m.id?C.accent:"transparent", color:viewMode===m.id?"#fff":C.muted }}>{m.label}</button>
      ))}
    </div>

    {viewMode==="week" && <div className="grid-7" style={{ marginBottom:16 }}>
      {DAYS.map((day, di) => {
        const dayClasses = classes.filter(c => c.days?.includes(day));
        const isWE = di>=5;
        return <Card key={day} style={{ minHeight:100, padding:10, background:isWE?"#F8FAFF":C.card, border:`1px solid ${isWE?"#DBEAFE":C.border}` }}>
          <div style={{ fontSize:12, fontWeight:800, color:isWE?C.accent:C.text, marginBottom:8, textAlign:"center", background:isWE?C.accentSoft:"transparent", borderRadius:5, padding:"2px 0" }}>{day}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {dayClasses.length===0
              ? <div style={{ fontSize:9, color:C.dim, textAlign:"center", paddingTop:6 }}>없음</div>
              : dayClasses.map(c => {
                  const idx = classes.findIndex(cl=>cl.id===c.id);
                  const col = COLORS_LIST[idx%COLORS_LIST.length];
                  return <div key={c.id} onClick={()=>open(c)}
                    style={{ background:col+"15", borderLeft:`3px solid ${col}`, borderRadius:7, padding:"7px 7px", cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.opacity="0.75"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    <div style={{ fontSize:9, color:col, fontWeight:700, marginBottom:2 }}>{c.time?.split(" ").pop()}</div>
                    <div style={{ fontSize:10, fontWeight:700, lineHeight:1.3 }}>{c.name}</div>
                    <div style={{ fontSize:9, color:C.muted }}>{c.room}</div>
                  </div>;
                })
            }
          </div>
        </Card>;
      })}
    </div>}

    {viewMode==="list" && <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
      {DAYS.map((day, di) => {
        const dayClasses = classes.filter(c => c.days?.includes(day));
        if(!dayClasses.length) return null;
        return <div key={day}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:di>=5?C.accentSoft:C.border+"40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:di>=5?C.accent:C.muted, flexShrink:0 }}>{day}</div>
            <div style={{ flex:1, height:1, background:C.border }} />
          </div>
          {dayClasses.map(c => {
            const idx = classes.findIndex(cl=>cl.id===c.id);
            const col = COLORS_LIST[idx%COLORS_LIST.length];
            return <div key={c.id} onClick={()=>open(c)}
              style={{ display:"flex", alignItems:"center", gap:12, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"13px 16px", cursor:"pointer", borderLeft:`4px solid ${col}`, marginBottom:7 }}
              onMouseEnter={e=>e.currentTarget.style.background=C.bg}
              onMouseLeave={e=>e.currentTarget.style.background=C.card}>
              <div style={{ width:42, height:42, borderRadius:10, background:col+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>📚</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{c.name}</div>
                <div style={{ fontSize:12, color:C.muted }}>{c.teacher} 선생님 · {c.room}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:col }}>{c.time?.split(" ").pop()}</div>
                <div style={{ fontSize:10, color:C.dim, marginTop:2 }}>✏ 수정</div>
              </div>
            </div>;
          })}
        </div>;
      })}
    </div>}

    {modal && <Modal title={`"${form.name}" 수정`} onClose={() => setModal(null)}>
      <Input label="반 이름" value={form.name||""} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="예: 수학 심화반" />
      <Input label="담당 선생님" value={form.teacher||""} onChange={v=>setForm(p=>({...p,teacher:v}))} placeholder="선생님 이름" />
      <Input label="수업 시간" value={form.time||""} onChange={v=>setForm(p=>({...p,time:v}))} placeholder="예: 월·수 16:00" />
      <Input label="강의실" value={form.room||""} onChange={v=>setForm(p=>({...p,room:v}))} placeholder="예: A101" />
      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:8, fontWeight:500 }}>수업 요일</label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {DAYS.map(d => (
            <button key={d} onClick={() => toggleDay(d)} style={{ width:38, height:38, borderRadius:8, fontSize:13, fontWeight:600, border:`1.5px solid ${form.days?.includes(d)?C.accent:C.border}`, background:form.days?.includes(d)?C.accentSoft:"#fff", color:form.days?.includes(d)?C.accent:C.muted, cursor:"pointer" }}>{d}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <Btn outline color={C.muted} onClick={() => setModal(null)}>취소</Btn>
        <Btn onClick={save}>저장</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── 성적/과제 관리 ──
function GradesPanel({ store }) {
  const { classes, students, setStudents } = store;
  const [editing, setEditing] = useState(null);
  const [filterClass, setFilterClass] = useState("all");

  const filtered = students.filter(s=>filterClass==="all"||s.classId===Number(filterClass));

  const update = (id, field, val) => setStudents(p=>p.map(s=>s.id===id?{...s,[field]:field==="avgScore"?Number(val):val}:s));

  return <div className="fade">
    <Hdr title="성적 / 과제 관리" sub="클릭하여 바로 수정 가능" />
    <Card style={{ marginBottom:14 }}>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <select value={filterClass} onChange={e=>setFilterClass(e.target.value)}
          style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:13, color:C.text }}>
          <option value="all">전체 반</option>
          {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span style={{ fontSize:12, color:C.muted, flexShrink:0 }}>총 {filtered.length}명</span>
      </div>
    </Card>

    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {filtered.map(s => {
        const cls = classes.find(c=>c.id===s.classId);
        return (
          <Card key={s.id} style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700 }}>{s.name}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{cls?.name||"-"} · {s.parentPhone||"연락처 없음"}</div>
              </div>
              <select value={s.homework} onChange={e=>update(s.id,"homework",e.target.value)}
                style={{ border:`1px solid ${s.homework==="완료"?C.green:C.red}`, borderRadius:8, padding:"5px 10px", fontSize:12, color:s.homework==="완료"?C.green:C.red, background:s.homework==="완료"?C.greenSoft:C.redSoft, fontWeight:600, cursor:"pointer" }}>
                <option value="완료">✓ 완료</option>
                <option value="미제출">✗ 미제출</option>
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:11, color:C.muted, flexShrink:0 }}>평균 점수</div>
              <div style={{ flex:1, height:6, background:C.border, borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${s.avgScore}%`, background:s.avgScore>=90?C.green:s.avgScore>=75?C.accent:C.yellow, borderRadius:3, transition:"width 0.4s" }} />
              </div>
              {editing===s.id+"score"
                ? <input type="number" defaultValue={s.avgScore} autoFocus
                    onBlur={e=>{update(s.id,"avgScore",e.target.value);setEditing(null);}}
                    style={{ width:56, border:`1px solid ${C.accent}`, borderRadius:6, padding:"3px 6px", fontSize:13, fontWeight:700, textAlign:"center" }} />
                : <span onClick={()=>setEditing(s.id+"score")}
                    style={{ fontSize:14, fontWeight:800, color:s.avgScore>=90?C.green:s.avgScore>=75?C.accent:C.yellow, cursor:"pointer", minWidth:32, textAlign:"right", borderBottom:`1.5px dashed ${C.border}` }}>
                    {s.avgScore}
                  </span>
              }
            </div>
          </Card>
        );
      })}
      {filtered.length===0 && <Card style={{ textAlign:"center", padding:"32px", color:C.dim }}>학생이 없습니다</Card>}
    </div>
  </div>;
}

// ── 공지/메시지 ──
function NoticePanel({ store }) {
  const { notices, setNotices } = store;
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type:"공지", title:"", important:false });

  const add = () => {
    if(!form.title) return alert("제목을 입력하세요");
    const today = new Date().toLocaleDateString("ko-KR").replace(/\. /g,".").replace(".","").slice(0,-1);
    setNotices(p=>[{...form,id:Date.now(),date:today,author:"키맨학원",read:true},...p]);
    setModal(false); setForm({type:"공지",title:"",important:false});
  };
  const del = (id) => { if(confirm("삭제하시겠습니까?")) setNotices(p=>p.filter(n=>n.id!==id)); };
  const read = (id) => setNotices(p=>p.map(n=>n.id===id?{...n,read:true}:n));

  return <div className="fade">
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
      <Hdr title="공지 / 메시지" sub={`전체 ${notices.length}건`} />
      <Btn onClick={()=>setModal(true)}>+ 공지 작성</Btn>
    </div>
    <Card>
      {notices.map((n,i) => (
        <div key={n.id} className="rh" onClick={()=>read(n.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderBottom:i<notices.length-1?`1px solid ${C.border}22`:"none", cursor:"pointer", background:n.read?"transparent":"rgba(59,126,246,0.02)" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:n.read?"transparent":C.accent, flexShrink:0 }} />
          <Badge color={n.type==="공지"?C.accent:C.green}>{n.type}</Badge>
          {n.important && <span style={{ color:C.yellow, fontSize:13 }}>★</span>}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:n.read?400:600 }}>{n.title}</div>
          </div>
          <span style={{ fontSize:11, color:C.dim }}>{n.author}</span>
          <span style={{ fontSize:11, color:C.dim }}>{n.date}</span>
          <button onClick={e=>{e.stopPropagation();del(n.id);}} style={{ fontSize:13, color:C.dim }}>✕</button>
        </div>
      ))}
      {notices.length===0 && <div style={{ textAlign:"center", padding:"32px", color:C.dim }}>공지가 없습니다</div>}
    </Card>

    {modal && <Modal title="공지 작성" onClose={()=>setModal(false)}>
      <Select label="유형" value={form.type} onChange={v=>setForm(p=>({...p,type:v}))}
        options={[{value:"공지",label:"공지"},{value:"메시지",label:"메시지"}]} />
      <Input label="제목" value={form.title} onChange={v=>setForm(p=>({...p,title:v}))} placeholder="공지 제목" />
      <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, marginBottom:16, cursor:"pointer" }}>
        <input type="checkbox" checked={form.important} onChange={e=>setForm(p=>({...p,important:e.target.checked}))} />
        중요 공지
      </label>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <Btn outline color={C.muted} onClick={()=>setModal(false)}>취소</Btn>
        <Btn onClick={add}>등록</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── 문자 발송 ──
function SMSPanel({ store }) {
  const { classes, students, templates, setTemplates } = store;
  const [selected, setSelected] = useState([]);
  const [tmplId, setTmplId] = useState(templates[0]?.id||1);
  const [custom, setCustom] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);
  const [sendType, setSendType] = useState("sms");
  const [filterClass, setFilterClass] = useState("all");
  const [editTmpl, setEditTmpl] = useState(null);
  const [tmplForm, setTmplForm] = useState({});

  const tmpl = templates.find(t=>t.id===tmplId);
  const msgText = tmplId==="custom" ? custom : (tmpl?.text||"");
  const filtered = students.filter(s=>filterClass==="all"||s.classId===Number(filterClass));

  const send = async () => {
    if(!selected.length) return alert("수신자를 선택하세요");
    if(!msgText.trim()) return alert("메시지를 입력하세요");
    setSending(true); setResults([]);
    const targets = students.filter(s=>selected.includes(s.id));
    const res2 = [];
    for(const s of targets) {
      const text = msgText.replace(/\{이름\}/g,s.name);
      const to = s.parentPhone.replace(/-/g,"");
      try {
        const r = await sendSolapiSMS({to,text,type:sendType,variables:{"#{이름}":s.name}});
        res2.push({name:s.name,phone:s.parentPhone,status:r.error?"실패":"성공",reason:r.error,type:sendType});
      } catch(e) { res2.push({name:s.name,phone:s.parentPhone,status:"실패",reason:e.message}); }
    }
    setResults(res2); setSending(false);
  };

  const saveTmpl = () => {
    if(!tmplForm.label||!tmplForm.text) return alert("제목과 내용을 입력하세요");
    if(editTmpl==="add") setTemplates(p=>[...p,{...tmplForm,id:Date.now()}]);
    else setTemplates(p=>p.map(t=>t.id===tmplForm.id?{...tmplForm}:t));
    setEditTmpl(null);
  };
  const delTmpl = (id) => { if(confirm("삭제하시겠습니까?")) setTemplates(p=>p.filter(t=>t.id!==id)); };

  return <div className="fade">
    <Hdr title="메시지 발송" sub="카카오 알림톡 / SMS" />
    <div style={{ display:"flex", gap:12, marginBottom:18 }}>
      {[{id:"kakao",icon:"💬",label:"카카오 알림톡"},{id:"sms",icon:"✉",label:"SMS 문자"}].map(t=>(
        <button key={t.id} onClick={()=>setSendType(t.id)} style={{ flex:1, padding:"13px 18px", borderRadius:12, textAlign:"left", cursor:"pointer", border:`2px solid ${sendType===t.id?(t.id==="kakao"?"#FEE500":C.accent):C.border}`, background:sendType===t.id?(t.id==="kakao"?"#FFFDE7":C.accentSoft):"#fff" }}>
          <span style={{ fontSize:18 }}>{t.icon}</span>
          <span style={{ fontSize:13, fontWeight:700, marginLeft:8, color:sendType===t.id?(t.id==="kakao"?"#7A5C00":C.accent):C.text }}>{t.label}</span>
        </button>
      ))}
    </div>

    <div className="grid-sms">
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:14, fontWeight:700 }}>수신자 선택</div>
            <div style={{ display:"flex", gap:6 }}>
              <Btn small outline onClick={()=>setSelected(filtered.map(s=>s.id))}>전체</Btn>
              <Btn small outline color={C.muted} onClick={()=>setSelected([])}>해제</Btn>
            </div>
          </div>
          <select value={filterClass} onChange={e=>{setFilterClass(e.target.value);setSelected([]);}}
            style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 10px", fontSize:12, marginBottom:10 }}>
            <option value="all">전체 반</option>
            {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {filtered.map(s=>(
              <label key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, cursor:"pointer", background:selected.includes(s.id)?C.accentSoft:"transparent" }}>
                <input type="checkbox" checked={selected.includes(s.id)} onChange={()=>setSelected(p=>p.includes(s.id)?p.filter(x=>x!==s.id):[...p,s.id])} style={{ accentColor:C.accent }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{s.parentPhone}</div>
                </div>
                {s.homework==="미제출" && <Badge color={C.red}>미제출</Badge>}
              </label>
            ))}
          </div>
          <div style={{ marginTop:10, fontSize:12, color:C.muted }}>선택: <b style={{color:C.accent}}>{selected.length}</b>명</div>
        </Card>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:14, fontWeight:700 }}>메시지 템플릿</div>
            <Btn small onClick={()=>{setTmplForm({label:"",text:""});setEditTmpl("add");}}>+ 추가</Btn>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {templates.map(t=>(
              <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:8, cursor:"pointer", background:tmplId===t.id?C.accentSoft:"transparent", border:`1px solid ${tmplId===t.id?C.accent:C.border}` }}>
                <input type="radio" checked={tmplId===t.id} onChange={()=>setTmplId(t.id)} style={{accentColor:C.accent}} />
                <span style={{ flex:1, fontSize:13, color:tmplId===t.id?C.accent:C.text }}>{t.label}</span>
                <button onClick={()=>{setTmplForm({...t});setEditTmpl(t);}} style={{ fontSize:11, color:C.muted }}>✏</button>
                <button onClick={()=>delTmpl(t.id)} style={{ fontSize:11, color:C.red }}>✕</button>
              </div>
            ))}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:8, cursor:"pointer", background:tmplId==="custom"?C.accentSoft:"transparent", border:`1px solid ${tmplId==="custom"?C.accent:C.border}` }}>
              <input type="radio" checked={tmplId==="custom"} onChange={()=>setTmplId("custom")} style={{accentColor:C.accent}} />
              <span style={{ fontSize:13, color:tmplId==="custom"?C.accent:C.text }}>직접 입력</span>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:10 }}>메시지 내용</div>
          {tmplId==="custom"
            ? <textarea value={custom} onChange={e=>setCustom(e.target.value)} rows={4} placeholder={"내용 입력\n{이름} → 학생 이름 자동 치환"}
                style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", fontSize:13, resize:"vertical" }} />
            : <div style={{ background:C.bg, borderRadius:8, padding:"12px", fontSize:13, color:C.muted, lineHeight:1.7 }}>{msgText}</div>
          }
          <div style={{ fontSize:11, color:C.dim, marginTop:6 }}>💬 {"{이름}"} → 학생 이름 자동 치환</div>
          <button className="bt" onClick={send} disabled={sending} style={{ width:"100%", marginTop:14, padding:"13px", borderRadius:10, fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:"none", cursor:"pointer", background:sending?C.border:sendType==="kakao"?"#FEE500":C.accent, color:sending?C.muted:sendType==="kakao"?"#3A1F00":"#fff" }}>
            {sending?<><span className="spin" style={{display:"inline-block"}}>⟳</span> 발송 중...</>:sendType==="kakao"?`💬 ${selected.length}명 알림톡 발송`:`✉ ${selected.length}명 SMS 발송`}
          </button>
        </Card>
      </div>
    </div>

    {results.length>0 && <Card style={{ marginTop:18 }}>
      <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>발송 결과</div>
      <div style={{ display:"flex", gap:12, marginBottom:12 }}>
        {[["전체",results.length,C.accent],["성공",results.filter(r=>r.status==="성공").length,C.green],["실패",results.filter(r=>r.status==="실패").length,C.red]].map(([l,v,col])=>(
          <div key={l} style={{ flex:1, background:C.bg, borderRadius:10, padding:"12px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:700, color:col }}>{v}</div>
            <div style={{ fontSize:11, color:C.muted }}>{l}</div>
          </div>
        ))}
      </div>
      {results.map((r,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, marginBottom:5, background:r.status==="성공"?C.greenSoft:C.redSoft }}>
          <span style={{ color:r.status==="성공"?C.green:C.red }}>{r.status==="성공"?"✓":"✗"}</span>
          <span style={{ fontWeight:600, fontSize:13 }}>{r.name}</span>
          <span style={{ fontSize:12, color:C.muted }}>{r.phone}</span>
          <Badge color={r.type==="kakao"?"#D97706":C.accent}>{r.type==="kakao"?"알림톡":"SMS"}</Badge>
          {r.reason && <span style={{ fontSize:11, color:C.red }}>({r.reason})</span>}
          <span style={{ marginLeft:"auto", fontSize:12, fontWeight:600, color:r.status==="성공"?C.green:C.red }}>{r.status}</span>
        </div>
      ))}
    </Card>}

    {editTmpl && <Modal title={editTmpl==="add"?"템플릿 추가":"템플릿 수정"} onClose={()=>setEditTmpl(null)}>
      <Input label="템플릿 이름" value={tmplForm.label||""} onChange={v=>setTmplForm(p=>({...p,label:v}))} placeholder="예: 결석 안내" />
      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>내용</label>
        <textarea value={tmplForm.text||""} onChange={e=>setTmplForm(p=>({...p,text:e.target.value}))} rows={4}
          style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", fontSize:13, resize:"vertical" }} />
        <div style={{ fontSize:11, color:C.dim, marginTop:4 }}>{"{이름}"} 입력 시 학생 이름으로 자동 치환</div>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <Btn outline color={C.muted} onClick={()=>setEditTmpl(null)}>취소</Btn>
        <Btn onClick={saveTmpl}>저장</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── 수업 보고서 ──
function ReportPanel({ store }) {
  const { classes, students } = store;
  const [selClass, setSelClass] = useState("");
  const [selStudent, setSelStudent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [topic, setTopic] = useState("");
  const [memo, setMemo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [saved, setSaved] = useStore("km_reports",[]);
  const [tab, setTab] = useState("create");
  const [copied, setCopied] = useState(false);

  const classStudents = students.filter(s=>s.classId===Number(selClass));
  const student = classStudents.find(s=>s.id===Number(selStudent));
  const cls = classes.find(c=>c.id===Number(selClass));

  const generate = async () => {
    if(!selClass) return alert("반을 선택하세요");
    if(!selStudent) return alert("학생을 선택하세요");
    if(!topic.trim()) return alert("수업 주제를 입력하세요");
    setGenerating(true); setReport(null);
    await new Promise(r=>setTimeout(r,800));
    try {
      const result = generateReportLocally({ student, cls, topic, attendCount:1, absentCount:0, absentNames:[], memo });
      setReport({id:Date.now(), class:cls?.name, studentName:student.name, date, topic, ...result});
    } catch(e) { alert("생성 오류: "+e.message); }
    setGenerating(false);
  };

  const save = () => { if(report){setSaved(p=>[report,...p]);alert("저장됐습니다!");} };
  const copy = () => {
    if(!report) return;
    navigator.clipboard.writeText(`[${report.class}] ${report.studentName} - ${report.title}\n날짜: ${report.date}\n\n요약\n${report.summary}\n\n성과\n${report.achievements.join("\n")}\n\n개선점\n${report.concerns.join("\n")}\n\n다음 계획\n${report.nextPlan}\n\n학부모 메시지\n${report.parentMessage}`);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  return <div className="fade">
    <Hdr title="수업 보고서" sub="학생별 수업 보고서 자동 작성" />
    <div style={{ display:"flex", gap:4, marginBottom:18, background:C.card, borderRadius:10, padding:4, width:"fit-content", border:`1px solid ${C.border}` }}>
      {[{id:"create",label:"✦ 보고서 작성"},{id:"history",label:"◧ 저장된 보고서"}].map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"7px 18px", borderRadius:7, fontSize:13, fontWeight:600, background:tab===t.id?C.accent:"transparent", color:tab===t.id?"#fff":C.muted, border:"none", cursor:"pointer" }}>{t.label}</button>
      ))}
    </div>

    {tab==="create" && <div className="grid-report">
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>수업 정보</div>

          {/* 반 선택 */}
          <Select label="① 반 선택" value={selClass} onChange={v=>{setSelClass(v);setSelStudent("");setReport(null);}}
            options={[{value:"",label:"반을 선택하세요"},...classes.map(c=>({value:c.id,label:c.name+" ("+c.teacher+")"}))]} />

          {/* 학생 선택 - 반 선택 후 표시 */}
          {selClass && (
            <div className="fade">
              <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5, fontWeight:500 }}>② 학생 선택</label>
              <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:14 }}>
                {classStudents.map(s=>(
                  <button key={s.id} onClick={()=>setSelStudent(String(s.id))}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, border:`1.5px solid ${selStudent===String(s.id)?C.accent:C.border}`, background:selStudent===String(s.id)?C.accentSoft:"#fff", cursor:"pointer", textAlign:"left" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:selStudent===String(s.id)?C.accent:C.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:selStudent===String(s.id)?"#fff":C.muted, flexShrink:0 }}>
                      {s.name[0]}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:selStudent===String(s.id)?C.accent:C.text }}>{s.name}</div>
                      <div style={{ fontSize:10, color:C.dim }}>평균 {s.avgScore}점 · {s.homework}</div>
                    </div>
                    {selStudent===String(s.id) && <span style={{ color:C.accent, fontSize:16 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Input label="③ 수업 날짜" type="date" value={date} onChange={setDate} />
          <Input label="④ 수업 주제" value={topic} onChange={setTopic} placeholder="예: 이차방정식 풀이" />
          <div>
            <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>⑤ 교사 메모 (선택)</label>
            <textarea value={memo} onChange={e=>setMemo(e.target.value)} rows={3} placeholder="특이사항, 학생 반응 등"
              style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, resize:"vertical" }} />
          </div>
        </Card>

        {/* 선택된 학생 요약 */}
        {student && (
          <Card className="fade" style={{ borderLeft:`3px solid ${C.accent}`, padding:"14px 16px" }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>선택된 학생</div>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{student.name}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {[
                ["평균 점수", student.avgScore+"점", student.avgScore>=90?C.green:student.avgScore>=75?C.accent:C.yellow],
                ["성적 추세", student.trend==="up"?"↑ 상승":student.trend==="down"?"↓ 하락":"→ 유지", student.trend==="up"?C.green:student.trend==="down"?C.red:C.muted],
                ["과제", student.homework, student.homework==="완료"?C.green:C.red],
                ["연락처", student.parentPhone||"-", C.muted],
              ].map(([k,v,col])=>(
                <div key={k} style={{ background:C.bg, borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontSize:10, color:C.dim, marginBottom:2 }}>{k}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:col }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <button className="bt" onClick={generate} disabled={generating||!selStudent} style={{ padding:"14px", borderRadius:12, fontSize:14, fontWeight:700, border:"none", cursor:selStudent?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:generating||!selStudent?C.border:"linear-gradient(135deg,#3B7EF6,#6366F1)", color:generating||!selStudent?C.muted:"#fff", boxShadow:generating||!selStudent?"none":"0 4px 16px rgba(59,126,246,0.3)" }}>
          {generating?<><span className="spin" style={{display:"inline-block"}}>⟳</span> 작성 중...</>:selStudent?"✦ 보고서 자동 생성":"학생을 먼저 선택하세요"}
        </button>
      </div>

      <div>
        {!report&&!generating && <Card style={{ minHeight:400, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:36, opacity:0.2 }}>◧</div>
          <div style={{ fontSize:13, color:C.dim, textAlign:"center", lineHeight:1.9 }}>
            반 → 학생 → 수업 주제 선택 후<br/><b style={{color:C.muted}}>보고서 자동 생성</b> 버튼을 누르세요
          </div>
        </Card>}
        {generating && <Card style={{ minHeight:400, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
          <div style={{ position:"relative", width:50, height:50 }}>
            <div className="spin" style={{ position:"absolute", inset:0, border:`3px solid ${C.accent}`, borderTopColor:"transparent", borderRadius:"50%" }} />
          </div>
          <div style={{ fontSize:13, color:C.muted }}>보고서를 작성하고 있습니다...</div>
        </Card>}
        {report&&!generating && <Card className="fade" style={{ border:`1px solid ${C.accent}30` }}>
          <ReportResult report={report} setReport={setReport} onSave={save} onCopy={copy} copied={copied} student={student} />
        </Card>}
      </div>
    </div>}

    {tab==="history" && <div className="fade">
      {saved.length===0
        ? <Card style={{ textAlign:"center", padding:"48px", color:C.dim }}>저장된 보고서가 없습니다</Card>
        : saved.map(r=>(
          <Card key={r.id} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700 }}>{r.title||r.class+" 수업 보고서"}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>{r.date} · {r.class} · {r.studentName||""} · {r.topic}</div>
              </div>
              <Badge>{r.studentName||"전체"}</Badge>
            </div>
            <p style={{ fontSize:13, color:C.muted, lineHeight:1.7 }}>{r.summary}</p>
          </Card>
        ))
      }
    </div>}
    <style>{`@keyframes sp{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
  </div>;
}

// ── 설정 ──
function SettingsPanel({ store }) {
  const { settings, setSettings } = store;
  const [form, setForm] = useState({...settings});
  const [saved, setSaved] = useState(false);


// ── 수업 보고서 결과 카드 (수정 + SMS 발송) ──
function ReportResult({ report, setReport, onSave, onCopy, copied, student }) {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(report);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const fields = [
    { key:"summary",       icon:"📋", title:"수업 요약",     color:C.accent,   multiline:true },
    { key:"achievements",  icon:"✅", title:"주요 성과",     color:C.green,    list:true },
    { key:"concerns",      icon:"⚠️", title:"개선점",        color:C.yellow,   list:true },
    { key:"nextPlan",      icon:"📅", title:"다음 수업",     color:"#A78BFA",  multiline:true },
    { key:"parentMessage", icon:"💬", title:"학부모 메시지", color:C.red,      multiline:true },
  ];

  const saveEdit = () => { setReport(draft); setEditMode(false); };

  const sendSMS = async () => {
    if (!student?.parentPhone) return alert("학부모 연락처가 없습니다. 학생 관리에서 연락처를 추가해주세요.");
    setSending(true); setSendResult(null);
    const to = student.parentPhone.replace(/-/g,"");
    try {
      const res = await sendSolapiSMS({ to, text: draft.parentMessage || report.parentMessage, type:"sms" });
      setSendResult(res.error ? { ok:false, msg:res.error } : { ok:true, msg:"발송 성공!" });
    } catch(e) { setSendResult({ ok:false, msg:e.message }); }
    setSending(false);
  };

  return <>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
      <div>
        <div style={{ fontSize:16, fontWeight:800 }}>{draft.title}</div>
        <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{draft.date} · {draft.class} · {draft.studentName}</div>
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"flex-end" }}>
        {!editMode ? <>
          <Btn small outline onClick={()=>{setDraft(report);setEditMode(true);}}>✏ 수정</Btn>
          <Btn small outline onClick={onCopy}>{copied?"✓ 복사됨":"복사"}</Btn>
          <Btn small onClick={onSave}>저장</Btn>
        </> : <>
          <Btn small outline color={C.muted} onClick={()=>setEditMode(false)}>취소</Btn>
          <Btn small onClick={saveEdit}>✓ 수정 완료</Btn>
        </>}
      </div>
    </div>

    {fields.map(f => (
      <div key={f.key} style={{ background:C.bg, borderRadius:10, padding:"13px 15px", marginBottom:10, borderLeft:`3px solid ${f.color}` }}>
        <div style={{ fontSize:12, fontWeight:700, color:f.color, marginBottom:8 }}>{f.icon} {f.title}</div>
        {editMode ? (
          f.list ? (
            <div>
              {(draft[f.key]||[]).map((item,i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                  <input value={item} onChange={e=>{const arr=[...(draft[f.key]||[])];arr[i]=e.target.value;setDraft(p=>({...p,[f.key]:arr}));}}
                    style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 10px", fontSize:12 }} />
                  <button onClick={()=>setDraft(p=>({...p,[f.key]:p[f.key].filter((_,j)=>j!==i)}))} style={{ color:C.red, fontSize:16 }}>✕</button>
                </div>
              ))}
              <button onClick={()=>setDraft(p=>({...p,[f.key]:[...(p[f.key]||[]),""]}))}
                style={{ fontSize:11, color:C.accent, background:C.accentSoft, border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>+ 항목 추가</button>
            </div>
          ) : (
            <textarea value={draft[f.key]||""} onChange={e=>setDraft(p=>({...p,[f.key]:e.target.value}))} rows={3}
              style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13, resize:"vertical" }} />
          )
        ) : (
          f.list
            ? (draft[f.key]||[]).map((a,i)=><div key={i} style={{fontSize:13,color:C.muted,marginBottom:5}}>• {a}</div>)
            : f.key==="parentMessage"
              ? <div style={{background:C.card,borderRadius:8,padding:"10px 12px",fontSize:13,lineHeight:1.8}}>{draft[f.key]}</div>
              : <p style={{fontSize:13,color:C.muted,lineHeight:1.8}}>{draft[f.key]}</p>
        )}
      </div>
    ))}

    {/* SMS 발송 버튼 */}
    {!editMode && (
      <div style={{ marginTop:4, padding:"14px 16px", background:C.bg, borderRadius:10, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, marginBottom:2 }}>📱 학부모 문자 발송</div>
          <div style={{ fontSize:11, color:C.muted }}>{student?.parentPhone || "연락처 없음"} · 학부모 메시지 내용으로 발송</div>
        </div>
        <button className="bt" onClick={sendSMS} disabled={sending||!student?.parentPhone}
          style={{ padding:"9px 18px", borderRadius:8, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", background:sending?C.border:C.accent, color:sending?C.muted:"#fff" }}>
          {sending?<><span className="spin" style={{display:"inline-block",marginRight:6}}>⟳</span>발송 중...</>:"✉ SMS 발송"}
        </button>
      </div>
    )}
    {sendResult && (
      <div style={{ marginTop:8, padding:"10px 14px", borderRadius:8, background:sendResult.ok?C.greenSoft:C.redSoft, fontSize:12, color:sendResult.ok?C.green:C.red, fontWeight:600 }}>
        {sendResult.ok?"✓":"✗"} {sendResult.msg}
      </div>
    )}
  </>;
}

  const save = () => { setSettings(form); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  return <div className="fade">
    <Hdr title="설정" sub="학원 정보 및 환경 설정" />
    <div className="grid-2">
      <Card>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>학원 기본 정보</div>
        <Input label="학원 이름" value={form.academyName||""} onChange={v=>setForm(p=>({...p,academyName:v}))} placeholder="키맨학원" />
        <Input label="원장 이름" value={form.directorName||""} onChange={v=>setForm(p=>({...p,directorName:v}))} placeholder="원장" />
        <Input label="발신번호 (SMS용)" value={form.fromNumber||""} onChange={v=>setForm(p=>({...p,fromNumber:v}))} placeholder="010-0000-0000" />
        <Btn onClick={save} style={{ marginTop:4 }}>{saved?"✓ 저장됨":"저장"}</Btn>
      </Card>
      <Card>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Vercel 환경변수 안내</div>
        <div style={{ fontSize:12, color:C.muted, lineHeight:2 }}>
          SMS/알림톡 발송을 위해 아래 환경변수를<br/>Vercel → Settings → Environment Variables 에 등록하세요.<br/><br/>
          {[["SOLAPI_API_KEY","솔라피 API Key"],["SOLAPI_API_SECRET","솔라피 API Secret"],["SOLAPI_FROM_NUMBER","발신번호 (숫자만)"],["SOLAPI_KAKAO_PFID","카카오 채널 ID (알림톡용)"],["SOLAPI_KAKAO_TEMPLATE_ID","일반 알림톡 템플릿 ID"],["SOLAPI_KAKAO_COACHING_TEMPLATE_ID","코칭 리포트 알림톡 템플릿 ID"]].map(([k,v])=>(
            <div key={k} style={{ marginBottom:8 }}>
              <code style={{ background:C.bg, padding:"2px 7px", borderRadius:4, fontSize:11, color:C.accent }}>{k}</code>
              <span style={{ fontSize:11, color:C.dim, marginLeft:8 }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>데이터 관리</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:16, lineHeight:1.7 }}>
          모든 데이터는 브라우저 로컬 저장소에 저장됩니다.<br/>
          데이터 초기화 시 모든 학생·수업·공지 정보가 삭제됩니다.
        </div>
        <Btn color={C.red} outline onClick={()=>{if(confirm("정말 초기화하시겠습니까? 모든 데이터가 삭제됩니다.")){localStorage.clear();window.location.reload();}}}>전체 데이터 초기화</Btn>
      </Card>
    </div>
  </div>;
}

// ── AI 학습 성향 코칭 리포트 ──
function CoachingPanel({ store }) {
  const { classes, students } = store;
  const [selClass, setSelClass] = useState("");
  const [selStudent, setSelStudent] = useState("");
  const [extraInfo, setExtraInfo] = useState({ studyTime:"", focusLevel:"보통", weakSubject:"", teacherNote:"" });
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [saved, setSaved] = useStore("km_coaching", []);
  const [tab, setTab] = useState("create");
  const [copied, setCopied] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  const classStudents = students.filter(s => s.classId === Number(selClass));
  const student = classStudents.find(s => s.id === Number(selStudent));
  const cls = classes.find(c => c.id === Number(selClass));

  const generate = async () => {
    if (!student) return alert("학생을 선택하세요");
    setGenerating(true); setReport(null);
    await new Promise(r => setTimeout(r, 1000));
    try {
      const result = generateCoachingLocally({ student, cls, extraInfo });
      const newReport = { id: Date.now(), studentName: student.name, studentId: student.id, class: cls?.name, date: new Date().toLocaleDateString("ko-KR"), score: student.avgScore, ...result };
      setReport(newReport);
    } catch (e) { alert("생성 오류: " + e.message); }
    setGenerating(false);
  };

  const save = () => { if (report) { setSaved(p => [report, ...p]); alert("저장됐습니다!"); } };

  const copy = () => {
    if (!report) return;
    const text = `[AI 학습 성향 코칭 리포트]
학생: ${report.studentName} | 반: ${report.class} | 날짜: ${report.date}

▶ 학습 유형: ${report.studyProfile?.type}
${report.studyProfile?.description}

▶ 강점
${report.strengths?.join("\n")}

▶ 보완점
${report.weaknesses?.join("\n")}

▶ 전문가 분석
${report.expertAnalysis}

▶ 맞춤 학습 솔루션
복습: ${report.solutions?.reviewMethod?.join(", ")}
암기: ${report.solutions?.memoryMethod?.join(", ")}
루틴: ${report.solutions?.studyRoutine?.join(", ")}

▶ 학부모 코칭 가이드
${report.parentGuide?.join("\n")}

▶ 교사 메시지
${report.teacherMessage}`;
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // 도넛 차트 SVG
  const DonutChart = ({ data }) => {
    const entries = Object.entries(data || {});
    const total = entries.reduce((s, [, v]) => s + v, 0);
    const colors = [C.accent, C.green, C.yellow, C.red, "#A78BFA"];
    let cumulative = 0;
    const r = 60, cx = 80, cy = 80, stroke = 28;
    const circumference = 2 * Math.PI * r;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width={160} height={160}>
          {entries.map(([label, val], i) => {
            const pct = val / total;
            const offset = circumference * (1 - cumulative);
            cumulative += pct;
            return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={colors[i % colors.length]}
              strokeWidth={stroke} strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
              strokeDashoffset={offset} style={{ transition: "all 0.5s" }} transform={`rotate(-90 ${cx} ${cy})`} />;
          })}
          <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 11, fill: C.muted }}>학습유형</text>
          <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 10, fill: C.dim }}>분포</text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {entries.map(([label, val], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i % colors.length], flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.text, marginLeft: "auto" }}>{val}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fade">
      <Hdr title="AI 학습 성향 코칭 리포트" sub="학생별 맞춤 학습 분석 및 코칭" />

      <div style={{ display: "flex", gap: 4, marginBottom: 18, background: C.card, borderRadius: 10, padding: 4, width: "fit-content", border: `1px solid ${C.border}` }}>
        {[{ id: "create", label: "★ 리포트 생성" }, { id: "history", label: "◧ 저장된 리포트" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 18px", borderRadius: 7, fontSize: 13, fontWeight: 600, background: tab === t.id ? C.accent : "transparent", color: tab === t.id ? "#fff" : C.muted, border: "none", cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>

      {tab === "create" && (
        <div className="grid-coaching">
          {/* 입력 폼 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>학생 선택</div>

              {/* 반 선택 */}
              <Select label="① 반 선택" value={selClass} onChange={v=>{setSelClass(v);setSelStudent("");setReport(null);}}
                options={[{value:"",label:"반을 선택하세요"},...classes.map(c=>({value:c.id,label:c.name+" ("+c.teacher+")"}))]} />

              {/* 학생 선택 */}
              {selClass && (
                <div className="fade">
                  <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:6, fontWeight:500 }}>② 학생 선택</label>
                  <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:14 }}>
                    {classStudents.map(s=>(
                      <button key={s.id} onClick={()=>setSelStudent(String(s.id))}
                        style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, border:`1.5px solid ${selStudent===String(s.id)?C.accent:C.border}`, background:selStudent===String(s.id)?C.accentSoft:"#fff", cursor:"pointer", textAlign:"left" }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:selStudent===String(s.id)?C.accent:C.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:selStudent===String(s.id)?"#fff":C.muted, flexShrink:0 }}>
                          {s.name[0]}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:selStudent===String(s.id)?C.accent:C.text }}>{s.name}</div>
                          <div style={{ fontSize:10, color:C.dim }}>평균 {s.avgScore}점 · {s.trend==="up"?"↑상승":s.trend==="down"?"↓하락":"→유지"} · {s.homework}</div>
                        </div>
                        {selStudent===String(s.id) && <span style={{ color:C.accent }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {student && (
                <div className="fade" style={{ background: C.bg, borderRadius: 10, padding: "12px 14px" }}>
                  {[
                    ["평균 점수", student.avgScore + "점", student.avgScore >= 90 ? C.green : student.avgScore >= 75 ? C.accent : C.yellow],
                    ["성적 추세", student.trend === "up" ? "↑ 상승" : student.trend === "down" ? "↓ 하락" : "→ 유지", student.trend === "up" ? C.green : student.trend === "down" ? C.red : C.muted],
                    ["과제 이행", student.homework, student.homework === "완료" ? C.green : C.red],
                  ].map(([k, v, col]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: C.muted }}>{k}</span>
                      <span style={{ fontWeight: 700, color: col }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>추가 정보 (선택)</div>
              <Input label="하루 학습 시간" value={extraInfo.studyTime} onChange={v => setExtraInfo(p => ({ ...p, studyTime: v }))} placeholder="예: 2시간" />
              <Select label="수업 집중도" value={extraInfo.focusLevel} onChange={v => setExtraInfo(p => ({ ...p, focusLevel: v }))}
                options={[{ value: "매우 높음", label: "매우 높음" }, { value: "높음", label: "높음" }, { value: "보통", label: "보통" }, { value: "낮음", label: "낮음" }, { value: "매우 낮음", label: "매우 낮음" }]} />
              <Input label="취약 과목/분야" value={extraInfo.weakSubject} onChange={v => setExtraInfo(p => ({ ...p, weakSubject: v }))} placeholder="예: 서술형 문제, 단어 암기" />
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>교사 관찰 메모</label>
                <textarea value={extraInfo.teacherNote} onChange={e => setExtraInfo(p => ({ ...p, teacherNote: e.target.value }))} rows={3}
                  placeholder="학생의 수업 태도, 특이사항 등"
                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, resize: "vertical" }} />
              </div>
            </Card>
            <button className="bt" onClick={generate} disabled={generating||!student}
              style={{ padding: "14px", borderRadius: 12, fontSize: 14, fontWeight: 700, border: "none", cursor: student?"pointer":"not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: generating||!student ? C.border : "linear-gradient(135deg,#3B7EF6,#A78BFA)", color: generating||!student ? C.muted : "#fff", boxShadow: generating||!student ? "none" : "0 4px 16px rgba(59,126,246,0.3)" }}>
              {generating ? <><span className="spin" style={{ display: "inline-block" }}>⟳</span> 분석 중...</> : student ? "★ AI 코칭 리포트 생성" : "학생을 먼저 선택하세요"}
            </button>
          </div>

          {/* 리포트 결과 */}
          <div>
            {!report && !generating && (
              <Card style={{ minHeight: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, border: `1px dashed ${C.border}` }}>
                <div style={{ fontSize: 48, opacity: 0.15 }}>★</div>
                <div style={{ fontSize: 14, color: C.dim, textAlign: "center", lineHeight: 1.9 }}>
                  반 → 학생 선택 후<br /><b style={{ color: C.muted }}>AI 코칭 리포트 생성</b> 버튼을 누르세요<br />
                  <span style={{ fontSize: 12 }}>학습 유형 · 강점 · 보완점 · 맞춤 솔루션<br />학부모 가이드까지 자동 생성됩니다</span>
                </div>
              </Card>
            )}
            {generating && (
              <Card style={{ minHeight: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
                <div style={{ position: "relative", width: 60, height: 60 }}>
                  <div className="spin" style={{ position: "absolute", inset: 0, border: `3px solid ${C.accent}`, borderTopColor: "transparent", borderRadius: "50%" }} />
                  <div className="spin" style={{ position: "absolute", inset: 10, border: `2px solid #A78BFA`, borderBottomColor: "transparent", borderRadius: "50%", animationDirection: "reverse" }} />
                </div>
                <div style={{ fontSize: 14, color: C.muted, textAlign: "center", lineHeight: 1.8 }}>AI가 학습 데이터를 분석하고 있습니다...<br /><span style={{ fontSize: 12, color: C.dim }}>맞춤 코칭 리포트를 작성 중입니다</span></div>
              </Card>
            )}

            {report && !generating && (
              <div className="fade" id="coaching-print-area">
                {/* 리포트 헤더 */}
                <div style={{ background: "linear-gradient(135deg,#3B7EF6,#A78BFA)", borderRadius: 14, padding: "22px 26px", marginBottom: 16, color: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 6, letterSpacing: "0.05em" }}>AI 학습 성향 코칭 리포트 · AI Coach System</div>
                      <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif" }}>{report.studentName} 학생</div>
                      <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{report.class} · {report.date} · 평균 {report.score}점</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap:"wrap" }}>
                      <button onClick={copy} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>{copied ? "✓ 복사됨" : "복사"}</button>
                      <button onClick={save} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>저장</button>
                      <button onClick={()=>{
                        const el = document.getElementById("coaching-print-area");
                        if(!el) return;
                        const w = window.open("","_blank");
                        w.document.write(`<html><head><title>코칭 리포트 - ${report.studentName}</title><style>body{font-family:'Noto Sans KR',sans-serif;margin:20px;color:#1A202C}@media print{button{display:none}}</style></head><body>${el.innerHTML}</body></html>`);
                        w.document.close(); w.focus(); setTimeout(()=>{w.print();},500);
                      }} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>📄 PDF 저장</button>
                    </div>
                  </div>
                </div>

                {/* 5열 그리드 */}
                <div className="grid-5col" style={{ marginBottom:14 }}>
                  {/* 학습 성향 프로파일 */}
                  <Card style={{ gridColumn: "span 1", padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 12, padding: "3px 8px", background: C.accentSoft, borderRadius: 4, display: "inline-block" }}>학습 성향 프로파일</div>
                    <DonutChart data={report.studyProfile?.distribution} />
                    <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: C.text }}>{report.studyProfile?.type}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>{report.studyProfile?.description}</div>
                  </Card>

                  {/* 강점 및 보완점 */}
                  <Card style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 12, padding: "3px 8px", background: C.greenSoft, borderRadius: 4, display: "inline-block" }}>강점 및 보완점</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 6 }}>학습 강점</div>
                    {report.strengths?.map((s, i) => (
                      <div key={i} style={{ fontSize: 11, color: C.muted, marginBottom: 5, display: "flex", gap: 6 }}>
                        <span style={{ color: C.green, flexShrink: 0 }}>•</span>{s}
                      </div>
                    ))}
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.yellow, margin: "12px 0 6px" }}>보완점</div>
                    {report.weaknesses?.map((w, i) => (
                      <div key={i} style={{ fontSize: 11, color: C.muted, marginBottom: 5, display: "flex", gap: 6 }}>
                        <span style={{ color: C.yellow, flexShrink: 0 }}>•</span>{w}
                      </div>
                    ))}
                  </Card>

                  {/* 전문가 종합 분석 */}
                  <Card style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", marginBottom: 12, padding: "3px 8px", background: "#F3F0FF", borderRadius: 4, display: "inline-block" }}>전문가 종합 분석</div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.8 }}>{report.expertAnalysis}</div>
                    {report.riskFactors?.length > 0 && <>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.red, margin: "12px 0 6px" }}>⚠ 주의/위험 요소</div>
                      {report.riskFactors.map((r, i) => (
                        <div key={i} style={{ fontSize: 11, color: C.muted, marginBottom: 5, display: "flex", gap: 6 }}>
                          <span style={{ color: C.red, flexShrink: 0 }}>•</span>{r}
                        </div>
                      ))}
                    </>}
                  </Card>

                  {/* 맞춤 학습 솔루션 */}
                  <Card style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.yellow, marginBottom: 12, padding: "3px 8px", background: C.yellowSoft, borderRadius: 4, display: "inline-block" }}>맞춤 학습 솔루션</div>
                    {[["복습방법", report.solutions?.reviewMethod, C.accent], ["암기방법", report.solutions?.memoryMethod, C.green], ["학습루틴", report.solutions?.studyRoutine, "#A78BFA"], ["집중력향상", report.solutions?.focusTips, C.red]].map(([title, items, color]) => (
                      <div key={title} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 4 }}>{title}</div>
                        {items?.map((item, i) => (
                          <div key={i} style={{ fontSize: 10, color: C.muted, marginBottom: 3, display: "flex", gap: 5 }}>
                            <span style={{ color, flexShrink: 0 }}>›</span>{item}
                          </div>
                        ))}
                      </div>
                    ))}
                  </Card>

                  {/* 학부모 코칭 가이드 */}
                  <Card style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.red, marginBottom: 12, padding: "3px 8px", background: C.redSoft, borderRadius: 4, display: "inline-block" }}>학부모 코칭 가이드</div>
                    {report.parentGuide?.map((g, i) => (
                      <div key={i} style={{ fontSize: 11, color: C.muted, marginBottom: 8, padding: "8px 10px", background: C.bg, borderRadius: 8, lineHeight: 1.6, borderLeft: `2px solid ${C.red}` }}>
                        <span style={{ fontWeight: 700, color: C.red }}>①②③④⑤⑥⑦⑧⑨⑩"[i + 1]"</span>{g}
                      </div>
                    ))}
                  </Card>
                </div>

                {/* 하단: 목표 + 교사 메시지 */}
                <div className="grid-2" style={{ marginBottom:12 }}>
                  <Card style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 12 }}>🎯 학습 목표</div>
                    {report.nextGoals?.map((g, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: C.accent, borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{g}</span>
                      </div>
                    ))}
                  </Card>
                  <Card style={{ padding: 16, borderLeft: `3px solid ${C.accent}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 10 }}>📝 담당 교사 코칭 방향</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.8 }}>{report.teacherMessage}</div>
                  </Card>
                </div>

                {/* 수정 버튼 */}
                <CoachingEditSection report={report} setReport={setReport} student={student} />
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="fade">
          {saved.length === 0
            ? <Card style={{ textAlign: "center", padding: "48px", color: C.dim }}>저장된 리포트가 없습니다</Card>
            : saved.map(r => (
              <Card key={r.id} style={{ marginBottom: 12, cursor: "pointer" }} onClick={() => { setReport(r); setTab("create"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{r.studentName} 학생 코칭 리포트</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{r.class} · {r.date} · 평균 {r.score}점</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Badge color={C.accent}>{r.studyProfile?.type}</Badge>
                    <span style={{ fontSize: 11, color: C.dim }}>클릭하여 보기</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>{r.expertAnalysis?.slice(0, 100)}...</div>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── 코칭 리포트 수정 섹션 ──
function CoachingEditSection({ report, setReport, student }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(report);

  const save = () => { setReport(draft); setOpen(false); };

  const editableFields = [
    { key:"expertAnalysis", label:"전문가 종합 분석", multiline:true },
    { key:"teacherMessage",  label:"교사 코칭 방향",  multiline:true },
  ];

  return (
    <div style={{ marginTop:4 }}>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginBottom:8 }}>
        <button onClick={()=>{setDraft(report);setOpen(o=>!o);}}
          style={{ padding:"7px 16px", borderRadius:8, fontSize:12, fontWeight:600, border:`1px solid ${C.border}`, background:"#fff", cursor:"pointer", color:C.text }}>
          {open ? "✕ 닫기" : "✏ 리포트 수정"}
        </button>
      </div>

      {open && (
        <Card className="fade" style={{ border:`1px solid ${C.accent}40` }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16, color:C.accent }}>✏ 코칭 리포트 수정</div>

          {/* 강점 수정 */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.green, marginBottom:8 }}>✅ 강점</div>
            {(draft.strengths||[]).map((s,i)=>(
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                <input value={s} onChange={e=>{const a=[...(draft.strengths||[])];a[i]=e.target.value;setDraft(p=>({...p,strengths:a}));}}
                  style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 10px", fontSize:12 }} />
                <button onClick={()=>setDraft(p=>({...p,strengths:p.strengths.filter((_,j)=>j!==i)}))} style={{color:C.red}}>✕</button>
              </div>
            ))}
            <button onClick={()=>setDraft(p=>({...p,strengths:[...(p.strengths||[]),""]}))} style={{ fontSize:11, color:C.green, background:C.greenSoft, border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>+ 추가</button>
          </div>

          {/* 보완점 수정 */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.yellow, marginBottom:8 }}>⚠️ 보완점</div>
            {(draft.weaknesses||[]).map((w,i)=>(
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                <input value={w} onChange={e=>{const a=[...(draft.weaknesses||[])];a[i]=e.target.value;setDraft(p=>({...p,weaknesses:a}));}}
                  style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 10px", fontSize:12 }} />
                <button onClick={()=>setDraft(p=>({...p,weaknesses:p.weaknesses.filter((_,j)=>j!==i)}))} style={{color:C.red}}>✕</button>
              </div>
            ))}
            <button onClick={()=>setDraft(p=>({...p,weaknesses:[...(p.weaknesses||[]),""]}))} style={{ fontSize:11, color:C.yellow, background:C.yellowSoft, border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>+ 추가</button>
          </div>

          {/* 학부모 가이드 수정 */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.red, marginBottom:8 }}>👨‍👩‍👧 학부모 코칭 가이드</div>
            {(draft.parentGuide||[]).map((g,i)=>(
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                <textarea value={g} onChange={e=>{const a=[...(draft.parentGuide||[])];a[i]=e.target.value;setDraft(p=>({...p,parentGuide:a}));}} rows={2}
                  style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 10px", fontSize:12, resize:"vertical" }} />
                <button onClick={()=>setDraft(p=>({...p,parentGuide:p.parentGuide.filter((_,j)=>j!==i)}))} style={{color:C.red}}>✕</button>
              </div>
            ))}
            <button onClick={()=>setDraft(p=>({...p,parentGuide:[...(p.parentGuide||[]),""]}))} style={{ fontSize:11, color:C.red, background:C.redSoft, border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>+ 추가</button>
          </div>

          {editableFields.map(f=>(
            <div key={f.key} style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:700, color:C.text, display:"block", marginBottom:6 }}>{f.label}</label>
              <textarea value={draft[f.key]||""} onChange={e=>setDraft(p=>({...p,[f.key]:e.target.value}))} rows={3}
                style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13, resize:"vertical" }} />
            </div>
          ))}

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn outline color={C.muted} onClick={()=>setOpen(false)}>취소</Btn>
            <Btn onClick={save}>✓ 수정 완료</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── 상담 문자 자동완성 ──
const CONSULT_TYPES = [
  { id:"new_inquiry",   icon:"🌱", label:"초기 문의 응대",    desc:"처음 문의하신 학부모님께 보내는 첫 인상 문자" },
  { id:"new_consult",   icon:"📋", label:"초기 상담 안내",    desc:"상담 예약 후 상담 전 안내 문자" },
  { id:"after_consult", icon:"✅", label:"상담 후 감사 문자", desc:"상담 완료 후 입학 권유 및 감사 인사" },
  { id:"progress",      icon:"📈", label:"학습 진도 보고",    desc:"기존 학생 학습 진행 상황 공유" },
  { id:"concern",       icon:"💛", label:"학습 우려 상담",    desc:"성적 하락 또는 집중도 저하 시 공감 문자" },
  { id:"absent",        icon:"📞", label:"결석 확인 문자",    desc:"결석 시 걱정과 안부를 담은 문자" },
  { id:"event",         icon:"🎉", label:"특강/이벤트 안내",  desc:"특강, 모의고사, 이벤트 안내 문자" },
  { id:"renewal",       icon:"🔄", label:"재등록 권유",       desc:"수강 종료 전 재등록 안내 문자" },
  { id:"kakao_invite",  icon:"💬", label:"카카오 채널 초대",  desc:"학부모 카카오 채널 친구 추가 안내 (친구톡 발송을 위한 필수 단계)" },
];

const CONSULT_TONE = [
  { id:"warm",       label:"🤝 따뜻하고 공감적" },
  { id:"pro",        label:"💼 전문적이고 신뢰감 있는" },
  { id:"friendly",   label:"😊 친근하고 편안한" },
  { id:"concise",    label:"⚡ 간결하고 핵심적인" },
];

function generateConsultMsg({ type, tone, studentName, className, teacherName, academyName, extraNote }) {
  const acad = academyName || "키맨학원";
  const s = studentName || "자녀";
  const cls = className || "";
  const t = teacherName || "선생님";

  const toneDesc = {
    warm:     "따뜻하고 공감적인",
    pro:      "전문적이고 신뢰감 있는",
    friendly: "친근하고 편안한",
    concise:  "간결하고 핵심적인",
  }[tone] || "따뜻한";

  const templates = {
    new_inquiry: [
      `안녕하세요, ${acad}입니다 😊\n${s} 학생 관련하여 문의해 주셔서 감사합니다!\n저희 ${acad}은 ${cls ? cls + " 과정을 포함해 " : ""}학생 개인에 맞춘 맞춤형 교육을 제공하고 있습니다.\n\n궁금하신 점은 언제든지 편하게 연락 주세요.\n빠르고 친절하게 안내해 드리겠습니다 🙏\n${extraNote ? "\n" + extraNote : ""}`,
      `안녕하세요! ${acad} 입니다.\n${s} 학생의 학습에 관심 가져주셔서 감사합니다 🌱\n\n저희는 학생 한 명 한 명의 성장에 진심으로 집중합니다.\n${cls ? cls + " 과정에 대해 " : ""}더 자세한 안내를 드리고 싶습니다.\n\n편하신 시간에 상담 예약 부탁드립니다! 📞`,
    ],
    new_consult: [
      `안녕하세요, ${acad} ${t}입니다 😊\n${s} 학생 상담 예약 확인해 드립니다!\n\n📅 상담 시 준비해 오시면 좋은 것들:\n• 현재 학습 고민이나 목표\n• 학교 성적표 또는 최근 시험지 (선택)\n• 궁금하신 점 미리 메모\n\n편안한 분위기에서 솔직하게 이야기 나눠요 🙏\n오시는 길 안내가 필요하시면 말씀해 주세요!`,
      `${acad}입니다. 상담 예약해 주셔서 감사합니다!\n\n${s} 학생을 위한 최선의 학습 방향을 함께 찾아드리겠습니다.\n상담 시 편하게 어떤 고민이든 말씀해 주세요 📋\n\n궁금하신 점이 있으시면 언제든 연락 주세요!`,
    ],
    after_consult: [
      `안녕하세요! ${acad} ${t}입니다 😊\n오늘 귀한 시간 내어 상담해 주셔서 진심으로 감사드립니다!\n\n${s} 학생의 가능성을 함께 발견할 수 있어서 정말 뜻깊었습니다 ✨\n저희 ${acad}에서 ${s} 학생이 목표를 이룰 수 있도록 최선을 다해 지도하겠습니다.\n\n추가로 궁금하신 점이 생기시면 편하게 연락 주세요!\n좋은 하루 보내세요 🙏${extraNote ? "\n\n" + extraNote : ""}`,
      `${acad}입니다. 오늘 상담 감사드립니다! 🌟\n\n${s} 학생에 대해 더 잘 알게 되어 기쁩니다.\n말씀해 주신 내용 바탕으로 최적의 학습 계획을 준비하겠습니다.\n\n입학 관련 추가 문의는 언제든 연락 주세요 😊`,
    ],
    progress: [
      `안녕하세요, ${acad} ${t}입니다 😊\n${s} 학생 최근 학습 현황 안내드립니다 📈\n\n수업 태도가 매우 성실하고, 꾸준히 발전하고 있습니다!\n${extraNote ? extraNote + "\n\n" : ""}앞으로도 지속적인 관심과 격려 부탁드립니다 🙏\n궁금하신 점은 언제든지 연락 주세요!`,
      `${acad}입니다. ${s} 학생 학습 진도 공유드립니다 📊\n\n${cls ? "[" + cls + "] " : ""}수업에서 ${s} 학생이 꾸준히 좋은 모습을 보여주고 있습니다!\n${extraNote ? "\n" + extraNote + "\n" : ""}\n가정에서도 응원 부탁드립니다 💪`,
    ],
    concern: [
      `안녕하세요, ${acad} ${t}입니다.\n다름이 아니라 ${s} 학생 학습 관련해 말씀드리고 싶어 연락드렸습니다 💛\n\n요즘 ${s} 학생이 평소보다 조금 힘들어 보여서 걱정이 됩니다.\n${extraNote ? extraNote + "\n\n" : ""}학교나 개인적인 어려움이 있는지 파악해보고 싶습니다.\n\n편하신 시간에 짧게라도 통화 가능하실까요? 함께 해결책을 찾아보겠습니다 🙏`,
      `${acad}입니다. ${s} 학생 관련해 안내 드립니다.\n\n최근 수업 집중도와 성적에 변화가 있어 말씀드립니다 💛\n${extraNote ? extraNote + "\n" : ""}저희도 최선을 다해 지원하겠습니다.\n함께 이야기 나눠보면 좋을 것 같습니다. 연락 주세요!`,
    ],
    absent: [
      `안녕하세요, ${acad} ${t}입니다 😊\n오늘 ${s} 학생이 수업에 참석하지 못해서 연락드렸습니다.\n\n혹시 몸이 불편하거나 어려운 일이 있는 건 아닌지 걱정이 됩니다 📞\n괜찮으시다면 간단히 알려주시면 감사하겠습니다.\n\n결석한 수업 내용은 다음 시간에 보충해 드리겠습니다!\n${s} 학생 잘 부탁드립니다 🙏`,
      `${acad}입니다. 오늘 ${s} 학생 수업 결석 확인 연락드립니다.\n\n별 일 없으신지요? 건강하게 잘 지내고 있길 바랍니다 💛\n사정이 있으시면 편하게 알려주세요.\n결석분은 꼭 보충 도와드리겠습니다!`,
    ],
    event: [
      `안녕하세요, ${acad}입니다 🎉\n${s} 학부모님께 특별한 소식을 전해드립니다!\n\n${extraNote ? extraNote + "\n\n" : "📌 곧 특강/이벤트가 진행될 예정입니다!\n\n"}관심 있으시면 빠르게 신청 부탁드립니다.\n자리가 한정되어 있어 서두르시는 게 좋을 것 같습니다 😊\n\n자세한 내용은 언제든지 문의 주세요!`,
      `${acad}에서 안내드립니다 🌟\n\n${s} 학부모님, 좋은 기회를 놓치지 마세요!\n${extraNote ? extraNote + "\n" : ""}\n빠른 신청으로 혜택 받아가세요 🎊\n문의: 언제든 환영합니다!`,
    ],
    renewal: [
      `안녕하세요, ${acad} ${t}입니다 😊\n${s} 학생과 함께한 시간이 참 뜻깊었습니다!\n\n곧 수강 기간이 종료될 예정이라 안내드립니다 🔄\n${s} 학생이 꾸준히 성장하고 있어, 계속 함께하면 더 좋은 결과가 있을 것 같습니다.\n\n재등록 관련 문의는 편하게 연락 주세요!\n항상 응원합니다 🙏${extraNote ? "\n\n" + extraNote : ""}`,
      `${acad}입니다. ${s} 학생 수강 종료 안내드립니다.\n\n${s} 학생과 함께한 시간 정말 감사했습니다 🌟\n재등록 시 특별 혜택도 있으니 관심 가져주세요!\n언제든 연락 주세요 😊`,
    ],
    kakao_invite: [
      `안녕하세요, ${acad}입니다 😊\n\n학부모님께 더 빠르고 편리하게 소식을 전달드리기 위해\n카카오톡 채널 친구 추가를 안내드립니다 💬\n\n📱 카카오톡 채널 추가 방법\n카카오톡 → 검색 → "${acad}" 검색 → 채널 추가\n\n채널을 추가하시면:\n✅ 수업 알림 및 공지 카카오톡으로 수신\n✅ 학습 현황 및 상담 내용 빠르게 전달\n✅ 중요 안내 문자 대신 카카오톡으로 편리하게\n\n${extraNote ? extraNote + "\n\n" : ""}채널 추가 후 더욱 편리한 소통으로 함께하겠습니다 🙏\n감사합니다!`,
      `${acad}입니다.\n\n카카오톡으로 더 빠르게 소통하고 싶어 안내드려요 📱\n\n👇 아래 방법으로 채널을 추가해 주세요\n카카오톡 검색창에서 "${acad}" 검색 후 채널 추가\n\n추가하시면 수업 공지, 학습 알림을 카카오톡으로 바로 받으실 수 있습니다!\n${extraNote ? "\n" + extraNote + "\n" : ""}\n감사합니다 😊`,
    ],
  };

  const msgs = templates[type] || templates["new_inquiry"];
  // 톤에 따라 선택 (warm/friendly → 0번, pro/concise → 1번)
  const idx = (tone === "pro" || tone === "concise") ? 1 : 0;
  return msgs[Math.min(idx, msgs.length - 1)];
}

function ConsultPanel({ store }) {
  const { students, classes, settings } = store;
  const [consultType, setConsultType] = useState("new_inquiry");
  const [tone, setTone] = useState("warm");
  const [mode, setMode] = useState("new");
  const [selStudent, setSelStudent] = useState("");
  const [parentName, setParentName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [className, setClassName] = useState("");
  const [extraNote, setExtraNote] = useState("");
  const [generated, setGenerated] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [toPhone, setToPhone] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useStore("km_consult_history", []);
  const [sendChannel, setSendChannel] = useState("sms"); // "sms" | "friendtalk"
  const [editMsg, setEditMsg] = useState(false);

  const selectedStudent = students.find(s => s.id === Number(selStudent));
  const selectedClass = selectedStudent ? classes.find(c => c.id === selectedStudent.classId) : null;

  const handleStudentSelect = (id) => {
    setSelStudent(id);
    const s = students.find(st => st.id === Number(id));
    if (s) {
      setStudentName(s.name);
      const cls = classes.find(c => c.id === s.classId);
      setClassName(cls?.name || "");
      setToPhone(s.parentPhone || "");
    }
  };

  const generate = () => {
    const name = mode === "existing" ? (selectedStudent?.name || studentName) : studentName;
    const cls = mode === "existing" ? (selectedClass?.name || className) : className;
    const msg = generateConsultMsg({
      type: consultType, tone, studentName: name, className: cls,
      teacherName: settings.directorName || "선생님",
      academyName: settings.academyName || "키맨학원",
      extraNote,
    });
    setGenerated(msg);
    setSendResult(null);
    setEditMsg(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const send = async () => {
    const phone = mode === "existing" ? (selectedStudent?.parentPhone || toPhone) : toPhone;
    if (!phone) return alert("연락처를 입력해주세요.");
    if (!generated) return alert("먼저 문자를 생성해주세요.");
    setSending(true); setSendResult(null);
    const to = phone.replace(/-/g, "");
    try {
      const res = await sendSolapiSMS({
        to,
        text: generated,
        type: sendChannel === "friendtalk" ? "friendtalk" : "sms",
      });
      const result = res.error ? { ok: false, msg: res.error } : { ok: true, msg: sendChannel === "friendtalk" ? "친구톡 발송 완료!" : "SMS 발송 완료!" };
      setSendResult(result);
      if (result.ok) {
        const name = mode === "existing" ? (selectedStudent?.name || studentName) : studentName;
        setHistory(p => [{ id: Date.now(), type: consultType, tone, name, phone, text: generated, channel: sendChannel, date: new Date().toLocaleDateString("ko-KR") }, ...p.slice(0, 49)]);
      }
    } catch (e) { setSendResult({ ok: false, msg: e.message }); }
    setSending(false);
  };

  const typeInfo = CONSULT_TYPES.find(t => t.id === consultType);

  return (
    <div className="fade">
      <Hdr title="상담 문자 자동완성" sub="일관되고 전문적인 학부모 상담 문자를 자동으로 생성합니다" />

      <div className="grid-sms">
        {/* 왼쪽: 설정 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* 상담 유형 */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>① 상담 유형 선택</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {CONSULT_TYPES.map(t => (
                <button key={t.id} onClick={() => setConsultType(t.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    border: `1.5px solid ${consultType === t.id ? C.accent : C.border}`,
                    background: consultType === t.id ? C.accentSoft : "#fff" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: consultType === t.id ? C.accent : C.text }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{t.desc}</div>
                  </div>
                  {consultType === t.id && <span style={{ marginLeft: "auto", color: C.accent, fontSize: 16, flexShrink: 0 }}>✓</span>}
                </button>
              ))}
            </div>
          </Card>

          {/* 톤 선택 */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>② 문자 톤 선택</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {CONSULT_TONE.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)}
                  style={{ padding: "10px 12px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${tone === t.id ? C.accent : C.border}`,
                    background: tone === t.id ? C.accentSoft : "#fff",
                    color: tone === t.id ? C.accent : C.text }}>
                  {t.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* 오른쪽: 학생 정보 + 미리보기 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* 대상 선택 */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>③ 대상 정보 입력</div>

            {/* 신규/기존 토글 */}
            <div style={{ display: "flex", gap: 4, marginBottom: 14, background: C.bg, borderRadius: 9, padding: 4 }}>
              {[{ id: "new", label: "🌱 신규 문의" }, { id: "existing", label: "👤 기존 학생" }].map(m => (
                <button key={m.id} onClick={() => { setMode(m.id); setSelStudent(""); setStudentName(""); setClassName(""); setToPhone(""); }}
                  style={{ flex: 1, padding: "8px", borderRadius: 7, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                    background: mode === m.id ? C.accent : "transparent",
                    color: mode === m.id ? "#fff" : C.muted }}>
                  {m.label}
                </button>
              ))}
            </div>

            {mode === "existing" ? (
              <div className="fade">
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                  {students.length === 0
                    ? <div style={{ fontSize: 12, color: C.dim, textAlign: "center", padding: "16px" }}>등록된 학생이 없습니다</div>
                    : students.map(s => {
                        const cls = classes.find(c => c.id === s.classId);
                        return (
                          <button key={s.id} onClick={() => handleStudentSelect(String(s.id))}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                              border: `1.5px solid ${selStudent === String(s.id) ? C.accent : C.border}`,
                              background: selStudent === String(s.id) ? C.accentSoft : "#fff" }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: selStudent === String(s.id) ? C.accent : C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: selStudent === String(s.id) ? "#fff" : C.muted, flexShrink: 0 }}>
                              {s.name[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: selStudent === String(s.id) ? C.accent : C.text }}>{s.name}</div>
                              <div style={{ fontSize: 11, color: C.dim }}>{cls?.name || "반 없음"} · {s.parentPhone || "연락처 없음"}</div>
                            </div>
                            {selStudent === String(s.id) && <span style={{ color: C.accent }}>✓</span>}
                          </button>
                        );
                      })}
                </div>
              </div>
            ) : (
              <div className="fade">
                <Input label="학생 이름" value={studentName} onChange={setStudentName} placeholder="예: 홍길동" />
                <Input label="수강 과목/반 (선택)" value={className} onChange={setClassName} placeholder="예: 수학 심화반" />
                <Input label="학부모 연락처" value={toPhone} onChange={setToPhone} placeholder="010-0000-0000" />
              </div>
            )}

            {mode === "existing" && selStudent && (
              <Input label="발송 번호 확인" value={toPhone} onChange={setToPhone} placeholder="010-0000-0000" />
            )}

            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5, fontWeight: 500 }}>추가 메모 (선택)</label>
              <textarea value={extraNote} onChange={e => setExtraNote(e.target.value)} rows={2}
                placeholder="예: 이번 달 성적이 올랐어요 / 특강 일정: 6월 10일 / 재등록 10% 할인 중"
                style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, resize: "vertical" }} />
            </div>

            <button className="bt" onClick={generate}
              style={{ width: "100%", marginTop: 14, padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#3B7EF6,#6366F1)", color: "#fff",
                boxShadow: "0 4px 16px rgba(59,126,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              💬 상담 문자 자동 생성
            </button>

            {/* 채널 초대 선택 시 안내 */}
            {consultType === "kakao_invite" && (
              <div className="fade" style={{ background:"#FFFDE7", border:"1px solid #FEE500", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#7A5C00", lineHeight:1.8 }}>
                <b>💬 채널 초대 문자 안내</b><br/>
                이 문자는 <b>SMS로 먼저 발송</b>하세요.<br/>
                학부모가 채널 추가 후엔 이후 메시지를 <b>친구톡</b>으로 발송할 수 있어요!<br/>
                <span style={{color:"#9A7A00"}}>순서: SMS 채널 초대 → 학부모 채널 추가 → 이후 친구톡 발송</span>
              </div>
            )}
          </Card>

          {/* 생성된 문자 미리보기 */}
          {generated && (
            <Card className="fade" style={{ border: `1px solid ${C.accent}30` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{typeInfo?.icon} {typeInfo?.label}</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
                    {CONSULT_TONE.find(t => t.id === tone)?.label}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditMsg(e => !e)}
                    style={{ fontSize: 12, padding: "5px 12px", borderRadius: 7, border: `1px solid ${editMsg ? C.accent : C.border}`, background: editMsg ? C.accentSoft : "#fff", color: editMsg ? C.accent : C.muted, cursor: "pointer", fontWeight: 600 }}>
                    {editMsg ? "✓ 완료" : "✏ 수정"}
                  </button>
                  <button onClick={copy}
                    style={{ fontSize: 12, padding: "5px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: copied ? C.greenSoft : "#fff", color: copied ? C.green : C.muted, cursor: "pointer", fontWeight: 600 }}>
                    {copied ? "✓ 복사됨" : "복사"}
                  </button>
                </div>
              </div>

              {/* 문자 내용 */}
              {editMsg ? (
                <textarea value={generated} onChange={e => setGenerated(e.target.value)} rows={10} autoFocus
                  style={{ width: "100%", border: `1.5px solid ${C.accent}`, borderRadius: 10, padding: "14px", fontSize: 13, lineHeight: 1.8, resize: "vertical", background: "#fff", color: C.text }} />
              ) : (
                <div style={{ background: C.bg, borderRadius: 10, padding: "14px", fontSize: 13, lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap", cursor: "pointer", border: `1px solid ${C.border}` }}
                  onClick={() => setEditMsg(true)}>
                  {generated}
                </div>
              )}

              <div style={{ fontSize: 11, color: editMsg ? C.accent : C.dim, marginTop: 6, marginBottom: 14 }}>
                {editMsg ? "✏ 수정 중 · 완료 버튼을 누르거나 아래에서 발송하세요" : "💡 수정 버튼 또는 내용을 클릭하면 편집할 수 있어요"} · {generated.length}자
              </div>

              {/* 발송 채널 선택 */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[
                  { id: "sms", label: "✉ SMS 문자", color: C.accent, bg: C.accentSoft },
                  { id: "friendtalk", label: "💬 카카오 친구톡", color: "#3A1F00", bg: "#FEE500" },
                ].map(ch => (
                  <button key={ch.id} onClick={() => setSendChannel(ch.id)}
                    style={{ flex: 1, padding: "9px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: `1.5px solid ${sendChannel === ch.id ? (ch.id === "friendtalk" ? "#F0D000" : C.accent) : C.border}`, cursor: "pointer",
                      background: sendChannel === ch.id ? ch.bg : "#fff",
                      color: sendChannel === ch.id ? ch.color : C.muted }}>
                    {ch.label}
                  </button>
                ))}
              </div>

              {/* 친구톡 안내 */}
              {sendChannel === "friendtalk" && (
                <div className="fade" style={{ fontSize: 11, color: "#9A7A00", background: "#FFFDE7", border: "1px solid #FEE500", borderRadius: 8, padding: "8px 12px", marginBottom: 10, lineHeight: 1.7 }}>
                  💬 <b>카카오 친구톡</b>은 학부모가 키맨학원 카카오 채널을 <b>친구 추가</b>한 경우에만 발송돼요.<br/>
                  미추가 시 SMS로 자동 대체됩니다. Vercel 환경변수에 <b>SOLAPI_KAKAO_PFID</b> 등록 필요.
                </div>
              )}

              {/* 발송 */}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input value={toPhone} onChange={e => setToPhone(e.target.value)} placeholder="010-0000-0000"
                  style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13 }} />
                <button className="bt" onClick={send} disabled={sending}
                  style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", flexShrink: 0,
                    background: sending ? C.border : sendChannel === "friendtalk" ? "#FEE500" : C.accent,
                    color: sending ? C.muted : sendChannel === "friendtalk" ? "#3A1F00" : "#fff" }}>
                  {sending ? <><span className="spin" style={{ display: "inline-block", marginRight: 4 }}>⟳</span>발송 중</> : sendChannel === "friendtalk" ? "💬 친구톡 발송" : "✉ SMS 발송"}
                </button>
              </div>

              {sendResult && (
                <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: sendResult.ok ? C.greenSoft : C.redSoft, fontSize: 12, color: sendResult.ok ? C.green : C.red, fontWeight: 600 }}>
                  {sendResult.ok ? "✓ " : "✗ "}{sendResult.msg}
                </div>
              )}
            </Card>
          )}

          {/* 발송 이력 */}
          {history.length > 0 && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>최근 발송 이력</div>
                <button onClick={() => setHistory([])} style={{ fontSize: 11, color: C.dim, background: "none", border: "none", cursor: "pointer" }}>전체 삭제</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                {history.slice(0, 10).map(h => {
                  const t = CONSULT_TYPES.find(ct => ct.id === h.type);
                  return (
                    <div key={h.id} style={{ padding: "10px 12px", borderRadius: 8, background: C.bg, cursor: "pointer" }}
                      onClick={() => setGenerated(h.text)}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{t?.icon} {h.name || "신규"} · {t?.label}</span>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: h.channel === "friendtalk" ? "#FEE500" : C.accentSoft, color: h.channel === "friendtalk" ? "#7A5C00" : C.accent, fontWeight: 700 }}>
                            {h.channel === "friendtalk" ? "친구톡" : "SMS"}
                          </span>
                          <span style={{ fontSize: 11, color: C.dim }}>{h.date}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.text}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
