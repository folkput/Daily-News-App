import { useState, useEffect, useCallback, useRef } from "react";

const THEMES = {
  default:  { name:"Default",   nameTH:"ค่าเริ่มต้น", bg:"#F8F7F4", card:"#FFFFFF", border:"#E8E5DE", text:"#1A1916", sub:"#6B6860", accent:"#534AB7", tabActive:"#EEF0FB", tabActiveText:"#3730A3", tabActiveBorder:"#A5B4FC" },
  sage:     { name:"Sage",      nameTH:"เขียวชา",     bg:"#F2F5F1", card:"#FFFFFF", border:"#D8E2D4", text:"#1C2218", sub:"#5A6957", accent:"#3A7D44", tabActive:"#E8F2E9", tabActiveText:"#2D6035", tabActiveBorder:"#86C98E" },
  rose:     { name:"Rose",      nameTH:"ชมพู",         bg:"#FDF5F5", card:"#FFFFFF", border:"#F0DDD9", text:"#1F1614", sub:"#7A5753", accent:"#A8514A", tabActive:"#FDECEA", tabActiveText:"#8C3D36", tabActiveBorder:"#E8A09A" },
  slate:    { name:"Slate",     nameTH:"สีเทา",        bg:"#F3F5F8", card:"#FFFFFF", border:"#D8DEE8", text:"#18202C", sub:"#566070", accent:"#3B5EA6", tabActive:"#E8EEFA", tabActiveText:"#2C4A8A", tabActiveBorder:"#94AEDD" },
  sand:     { name:"Sand",      nameTH:"ทราย",         bg:"#FAF7F0", card:"#FFFFFF", border:"#E8DEC8", text:"#1E1A12", sub:"#7A6E58", accent:"#8A6A2A", tabActive:"#F7F0DC", tabActiveText:"#6B5020", tabActiveBorder:"#D4B86A" },
  lavender: { name:"Lavender",  nameTH:"ลาเวนเดอร์",   bg:"#F6F4FB", card:"#FFFFFF", border:"#E0D8F2", text:"#1A1726", sub:"#6A5F82", accent:"#6B4FA8", tabActive:"#EDE8FA", tabActiveText:"#5438A0", tabActiveBorder:"#B8A4E8" },
};
const REGION_COLORS = {
  Thailand:{bg:"#FEF3E2",color:"#92400E"}, Global:{bg:"#EFF6FF",color:"#1D4ED8"},
  USA:{bg:"#F0FDF4",color:"#166534"}, Both:{bg:"#F3F0FF",color:"#4C1D95"},
  China:{bg:"#FFF1F2",color:"#9F1239"}, Asia:{bg:"#FDF4FF",color:"#86198F"}, Europe:{bg:"#F8F8F8",color:"#374151"},
};
const SOURCE_LINKS = {
  "Reuters":[{label:"Reuters",url:"https://www.reuters.com"}],
  "Bloomberg":[{label:"Bloomberg",url:"https://www.bloomberg.com/markets"}],
  "Bangkok Post":[{label:"Bangkok Post",url:"https://www.bangkokpost.com"},{label:"Business",url:"https://www.bangkokpost.com/business"}],
  "The Nation Thailand":[{label:"The Nation",url:"https://www.nationthailand.com"}],
  "AP News":[{label:"AP News",url:"https://apnews.com"}],
  "Al Jazeera":[{label:"Al Jazeera",url:"https://www.aljazeera.com"}],
  "CNBC":[{label:"CNBC",url:"https://www.cnbc.com/markets"}],
  "NPR":[{label:"NPR",url:"https://www.npr.org/sections/world"}],
  "BBC":[{label:"BBC News",url:"https://www.bbc.com/news"}],
  "IEA":[{label:"IEA",url:"https://www.iea.org/reports"}],
  "TMD":[{label:"Thai Met Dept",url:"https://www.tmd.go.th/en"}],
  "IQAir":[{label:"Bangkok AQI",url:"https://www.iqair.com/thailand/bangkok"}],
  "J.P. Morgan":[{label:"JP Morgan",url:"https://www.jpmorgan.com/insights/research"}],
  "Trading Economics":[{label:"Trading Economics",url:"https://tradingeconomics.com"}],
  "OilPrice.com":[{label:"OilPrice",url:"https://oilprice.com"}],
  "CBS Sports":[{label:"CBS Sports",url:"https://www.cbssports.com"}],
  "Thai Examiner":[{label:"Thai Examiner",url:"https://www.thaiexaminer.com"}],
  "The Nation Thailand / Thaiger":[{label:"The Nation",url:"https://www.nationthailand.com"},{label:"Thaiger",url:"https://thethaiger.com"}],
};
const AUTO_REFRESH_MS = 4 * 60 * 60 * 1000;

// ── 2 MEGA-PROMPTS ────────────────────────────────────────────────────────────
function buildMegaPrompt1(d) {
  return `You are a professional news analyst. Today is ${d}. Use web search to find today's latest real news. Return ONLY a single valid JSON object — no markdown, no backticks, no explanation — with exactly these keys:

{
  "briefing": "5-6 sentence morning briefing covering Thailand and global news: economics, Thai SET and US stocks equally, geopolitics, Thailand daily life alerts. End with Key theme of the day: ...",
  "top": [6 items: {"title","summary":"2-3 sentences","why":"1 sentence","source","region":"Thailand|USA|Global|Both","category","time","hot":bool,"urgent":false}],
  "stocks": [12 items covering 4 Thai SET, 4 US NYSE/NASDAQ, 2 China/Asia, 2 commodities/bonds: {"name","ticker","market":"SET|NYSE|NASDAQ|Bond|Commodities|HKEx","region":"Thailand|USA|China|Global","change","direction":"up|down|flat","note":"1-2 sentences","source","time","hot":bool}],
  "macro": [5 items macroeconomics Thailand+global: {"title","summary","why","source","region","indicator","time"}],
  "micro": [5 items microeconomics earnings/sectors: {"title","summary","why","source","region","indicator","time"}],
  "crucial": [8 items urgent for Thailand residents — weather/floods/transport/safety/scams/air quality + global critical: {"title","summary","why","action":"null or specific step","source","region":"Thailand|Global","category":"Weather|Transport|Safety|AirQuality|Geopolitics|Tech|Economics","time","urgent":bool}],
  "breaking": [4 breaking news items: {"title","summary","why","source","region","category":"Breaking","time","hot":true}],
  "politics": [4 political stories Thailand+global: {"title","summary","why","source","region","category":"Politics","time"}],
  "business": [4 business stories: {"title","summary","why","source","region","category":"Business","time","hot":bool}],
  "investigate": [3 investigative stories: {"title","summary","why","source","region","category":"Investigative","time"}],
  "crime": [4 crime & justice stories: {"title","summary","why","source","region","category":"Crime","time","urgent":bool}]
}`;
}

function buildMegaPrompt2(d) {
  return `You are a lifestyle and culture news analyst. Today is ${d}. Use web search to find today's real news. Return ONLY a single valid JSON object — no markdown, no backticks, no explanation — with exactly these keys:

{
  "lifestyle": [4 items food/travel/health/culture/exchange rates, Thailand focus: {"title","summary","why","source","region","category":"Lifestyle","time"}],
  "entertainment": [4 items Thai celebrities/music/film/pop culture: {"title","summary","why","source","region","category":"Entertainment","time"}],
  "sports": [4 items Thai sports + NBA/UEFA/FIFA: {"title","summary","why","source","region":"Thailand|USA|Global","category":"Sports","time"}],
  "humaninterest": [4 uplifting stories Thailand+global: {"title","summary","why","source","region","category":"Human Interest","time"}]
}`;
}

async function fetchMega(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const m = clean.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch { return null; }
}

// ── PERSIST ───────────────────────────────────────────────────────────────────
function usePersistedState(key, def) {
  const [val, setVal] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; } });
  const set = useCallback(v => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key]);
  return [val, set];
}

// ── TTS ───────────────────────────────────────────────────────────────────────
function useTTS(voiceGender) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const stop = useCallback(() => { window.speechSynthesis.cancel(); setSpeaking(false); setPaused(false); setActiveId(null); }, []);
  const getVoice = useCallback(() => {
    const v = window.speechSynthesis.getVoices();
    return voiceGender === "female"
      ? v.find(x => /samantha|karen|victoria|zira|moira|fiona/i.test(x.name)) || v.find(x => x.lang.startsWith("en"))
      : v.find(x => /daniel|alex|fred|arthur|thomas/i.test(x.name)) || v.find(x => x.lang.startsWith("en"));
  }, [voiceGender]);
  const speak = useCallback((text, id) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.88; utt.pitch = voiceGender === "female" ? 1.1 : 0.9; utt.lang = "en-US";
    const voice = getVoice(); if (voice) utt.voice = voice;
    utt.onstart = () => { setSpeaking(true); setPaused(false); setActiveId(id); };
    utt.onend = () => { setSpeaking(false); setPaused(false); setActiveId(null); };
    utt.onerror = () => { setSpeaking(false); setPaused(false); setActiveId(null); };
    window.speechSynthesis.speak(utt);
  }, [getVoice, voiceGender]);
  const toggle = useCallback((text, id) => {
    if (activeId === id) { if (paused) { window.speechSynthesis.resume(); setPaused(false); } else { window.speechSynthesis.pause(); setPaused(true); } }
    else speak(text, id);
  }, [activeId, paused, speak]);
  useEffect(() => () => window.speechSynthesis.cancel(), []);
  return { speaking, paused, activeId, speak, toggle, stop };
}

function buildText(item) {
  return [
    item.title && item.title.replace(/[\u{1F300}-\u{1FFFF}🔥🌧️🚦🚂💥⚠️💨🌍🤖🏀⚽🎬🍜🕵️🏛️📰🔴⚖️💼💛🏆🎙️]/gu, ""),
    item.summary, item.why && "Why this matters: " + item.why,
    item.action && "What to do: " + item.action,
    item.source && "Source: " + item.source + "."
  ].filter(Boolean).join(" ");
}
function buildSectionText(items, name) {
  if (!items?.length) return `No items in ${name}.`;
  return `${name}. ${items.map((it, i) => `Story ${i + 1} of ${items.length}. ${buildText(it)}`).join(" ... ")}`;
}

function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return remaining;
}
function fmtCountdown(ms) {
  if (ms <= 0) return "now";
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ── UI ────────────────────────────────────────────────────────────────────────
const Badge = ({ label, style }) => <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500, whiteSpace: "nowrap", ...style }}>{label}</span>;

function SpeakBtn({ text, id, tts, size = "sm", T }) {
  const isActive = tts.activeId === id, isPaused = isActive && tts.paused, isPlaying = isActive && !tts.paused;
  return (
    <button onClick={() => tts.toggle(text, id)} style={{ fontSize: size === "lg" ? 13 : 11, padding: size === "lg" ? "6px 14px" : "3px 9px", borderRadius: 20, cursor: "pointer", background: isActive ? T.tabActive : "transparent", color: isActive ? T.accent : T.sub, border: `1px solid ${isActive ? T.tabActiveBorder : T.border}`, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", transition: "all 0.2s" }}>
      {isPlaying ? "⏸" : isPaused ? "▶" : "🔊"}{size === "lg" && (isPlaying ? " Pause" : isPaused ? " Resume" : " Listen")}
    </button>
  );
}

function ReadAllBar({ tts, items, name, sid, T }) {
  const text = buildSectionText(items, name), id = "sec_" + sid, isActive = tts.activeId === id;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "9px 13px", background: isActive ? T.tabActive : T.bg, border: `1px solid ${isActive ? T.tabActiveBorder : T.border}`, borderRadius: 10, transition: "all 0.2s" }}>
      <span style={{ fontSize: 12, color: T.sub, flex: 1 }}>{isActive && !tts.paused ? "🔊 Reading…" : isActive && tts.paused ? "⏸ Paused" : `🔊 Read all ${items.length} stories`}</span>
      <SpeakBtn text={text} id={id} tts={tts} size="lg" T={T} />
      {tts.activeId && <button onClick={tts.stop} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, cursor: "pointer", background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5", fontFamily: "inherit" }}>■ Stop</button>}
    </div>
  );
}

function SourceDrop({ source, T }) {
  const [open, setOpen] = useState(false);
  const links = SOURCE_LINKS[source] || [];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: T.sub }}>Source: <strong style={{ color: T.text }}>{source}</strong></span>
        {links.length > 0 && <button onClick={() => setOpen(o => !o)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, cursor: "pointer", background: open ? T.tabActive : T.bg, color: open ? T.accent : T.sub, border: `1px solid ${open ? T.tabActiveBorder : T.border}`, fontFamily: "inherit" }}>{open ? "Close ▴" : "Sources ▾"}</button>}
      </div>
      {open && <div style={{ marginTop: 5, paddingLeft: 4, display: "flex", flexDirection: "column", gap: 4 }}>{links.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: T.accent, textDecoration: "none" }}>↗ {l.label}</a>)}</div>}
    </div>
  );
}

function NewsCard({ item, tts, T }) {
  const id = "c_" + (item.title || "").slice(0, 35).replace(/\W/g, "_");
  const rc = REGION_COLORS[item.region] || REGION_COLORS.Global, isActive = tts.activeId === id;
  return (
    <div style={{ background: item.urgent ? "#FFFAFA" : T.card, border: `1px solid ${item.urgent ? "#FECACA" : isActive ? T.tabActiveBorder : T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, transition: "border 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flex: 1 }}>
          <Badge label={item.region} style={{ background: rc.bg, color: rc.color }} />
          {item.urgent && <Badge label="🚨 Alert" style={{ background: "#FEF2F2", color: "#B91C1C" }} />}
          {item.hot && <Badge label="🔥 Breaking" style={{ background: "#FFFBEB", color: "#92400E" }} />}
          {(item.category || item.indicator) && <Badge label={item.category || item.indicator} style={{ background: T.bg, color: T.sub, border: `1px solid ${T.border}` }} />}
          {item.time && <Badge label={item.time} style={{ background: T.bg, color: T.sub, border: `1px solid ${T.border}` }} />}
        </div>
        <SpeakBtn text={buildText(item)} id={id} tts={tts} T={T} />
      </div>
      <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 5px", color: T.text, lineHeight: 1.45 }}>{item.title}</p>
      <p style={{ fontSize: 13, color: T.sub, margin: "0 0 8px", lineHeight: 1.7 }}>{item.summary}</p>
      {item.action && <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "7px 11px", fontSize: 12, marginBottom: 8 }}><span style={{ color: "#92400E", fontWeight: 600 }}>⚡ Action: </span><span style={{ color: "#78350F" }}>{item.action}</span></div>}
      {item.why && <div style={{ background: T.bg, borderRadius: 8, padding: "7px 11px", fontSize: 12, borderLeft: `3px solid ${T.accent}`, marginBottom: 4 }}><span style={{ color: T.accent, fontWeight: 600 }}>Why it matters: </span><span style={{ color: T.sub }}>{item.why}</span></div>}
      <SourceDrop source={item.source} T={T} />
    </div>
  );
}

function StockCard({ item, tts, T }) {
  const id = "s_" + (item.ticker || "").replace(/\W/g, "_");
  const up = item.direction === "up", dn = item.direction === "down";
  const rc = REGION_COLORS[item.region] || REGION_COLORS.Global, isActive = tts.activeId === id;
  return (
    <div style={{ background: T.card, border: `1px solid ${isActive ? T.tabActiveBorder : T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, transition: "border 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 5, flexWrap: "wrap" }}>
            <Badge label={item.region} style={{ background: rc.bg, color: rc.color }} />
            {item.hot && <Badge label="🔥" style={{ background: "#FFFBEB", color: "#92400E" }} />}
            <Badge label={item.market} style={{ background: T.bg, color: T.sub, border: `1px solid ${T.border}` }} />
            {item.time && <Badge label={item.time} style={{ background: T.bg, color: T.sub, border: `1px solid ${T.border}` }} />}
          </div>
          <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 2px", color: T.text }}>{item.name}</p>
          <p style={{ fontSize: 11, color: T.sub, margin: 0 }}>{item.ticker}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, padding: "4px 11px", borderRadius: 8, background: up ? "#F0FDF4" : dn ? "#FFF1F2" : "#F8F8F8", color: up ? "#14532D" : dn ? "#9F1239" : "#374151" }}>{up ? "▲" : dn ? "▼" : "—"} {item.change}</span>
          <SpeakBtn text={buildText(item)} id={id} tts={tts} T={T} />
        </div>
      </div>
      <p style={{ fontSize: 12, color: T.sub, margin: "8px 0 4px", lineHeight: 1.65 }}>{item.note}</p>
      <SourceDrop source={item.source} T={T} />
    </div>
  );
}

function Skeleton({ T }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
      {[["60%", "13px"], ["100%", "10px"], ["80%", "10px"], ["50%", "10px"]].map(([w, h], i) => (
        <div key={i} style={{ height: h, width: w, background: T.border, borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

function InfoDrop({ title, children, T }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 10, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", padding: "10px 14px", background: T.bg, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: T.sub, fontWeight: 500 }}>
        <span>{title}</span><span style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
      </button>
      {open && <div style={{ padding: "12px 14px", background: T.card, fontSize: 13, color: T.sub, lineHeight: 1.7, borderTop: `1px solid ${T.border}` }}>{children}</div>}
    </div>
  );
}

function SettingsPanel({ T, themeKey, setThemeKey, voiceGender, setVoiceGender, lang, setLang, onClose }) {
  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 280, background: T.card, borderLeft: `1px solid ${T.border}`, zIndex: 100, padding: "20px 18px", overflowY: "auto", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: T.text }}>⚙️ Settings</p>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: T.sub }}>✕</button>
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>🌐 Language / ภาษา</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {[["en", "🇬🇧 English"], ["th", "🇹🇭 ภาษาไทย"]].map(([l, label]) => (
          <button key={l} onClick={() => setLang(l)} style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${lang === l ? T.accent : T.border}`, background: lang === l ? T.tabActive : T.bg, cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: lang === l ? T.accent : T.sub, fontWeight: lang === l ? 700 : 400 }}>{label}</button>
        ))}
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Background Theme</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 22 }}>
        {Object.entries(THEMES).map(([k, th]) => (
          <button key={k} onClick={() => setThemeKey(k)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${themeKey === k ? T.accent : T.border}`, background: themeKey === k ? T.tabActive : th.bg, cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: th.bg, border: `2px solid ${th.border}`, display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: themeKey === k ? T.accent : T.sub, fontWeight: themeKey === k ? 600 : 400 }}>{lang === "th" ? th.nameTH : th.name}</span>
            {themeKey === k && <span style={{ marginLeft: "auto", color: T.accent }}>✓</span>}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Reader Voice</p>
      <div style={{ display: "flex", gap: 8 }}>
        {[["female", "👩 Female"], ["male", "👨 Male"]].map(([g, label]) => (
          <button key={g} onClick={() => setVoiceGender(g)} style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${voiceGender === g ? T.accent : T.border}`, background: voiceGender === g ? T.tabActive : T.bg, cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: voiceGender === g ? T.accent : T.sub, fontWeight: voiceGender === g ? 600 : 400 }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

const PR_SUBS = [
  { id: "breaking", label: "🔴 Breaking", type: "hard" }, { id: "politics", label: "🏛️ Politics", type: "hard" },
  { id: "business", label: "💼 Business", type: "hard" }, { id: "investigate", label: "🕵️ Investigative", type: "hard" },
  { id: "crime", label: "⚖️ Crime & Justice", type: "hard" }, { id: "lifestyle", label: "🍜 Lifestyle", type: "soft" },
  { id: "entertainment", label: "🎬 Entertainment", type: "soft" }, { id: "sports", label: "🏆 Sports", type: "soft" },
  { id: "humaninterest", label: "💛 Human Interest", type: "soft" },
];
const TABS = [
  { id: "briefing", en: "☀️ Briefing", th: "☀️ สรุปข่าว" },
  { id: "top", en: "📰 Top News", th: "📰 ข่าวเด่น" },
  { id: "stocks", en: "📈 Stocks", th: "📈 หุ้น" },
  { id: "economics", en: "🌐 Economics", th: "🌐 เศรษฐกิจ" },
  { id: "crucial", en: "⚡ Crucial", th: "⚡ ด่วน" },
  { id: "reporter", en: "🎙️ Reporter", th: "🎙️ นักข่าว" },
];
const REGIONS = { en: ["All", "Thailand", "USA", "Global"], th: ["ทั้งหมด", "ไทย", "สหรัฐฯ", "โลก"] };
const matches = (item, f) => {
  if (f === "All" || f === "ทั้งหมด") return true;
  const r = item.region;
  if (f === "Thailand" || f === "ไทย") return ["Thailand", "Both"].includes(r);
  if (f === "USA" || f === "สหรัฐฯ") return ["USA", "Both"].includes(r);
  return ["Global", "Both", "China", "Asia", "Europe"].includes(r);
};
const CAT_DESC = {
  en: {
    briefing: "AI-written morning summary covering economics, markets, politics, and Thailand daily life. Auto-refreshes every 4 hours.",
    top: "Top 6 most important stories today ranked by global and Thailand impact, with Why it matters analysis.",
    stocks: "Thai SET and US NYSE/NASDAQ at equal priority, plus China/Asia/bonds/commodities.",
    economics: "Macro (GDP, inflation, central banks, trade policy) and Micro (earnings, IPOs, industries, commodities).",
    crucial: "Urgent actionable news for Thailand residents: weather, transport, safety, air quality, and critical global events.",
    reporter: "Full-spectrum news: Hard News (Breaking, Politics, Business, Investigative, Crime) and Soft News (Lifestyle, Entertainment, Sports, Human Interest).",
  },
  th: {
    briefing: "สรุปข่าวเช้าโดย AI ครอบคลุมเศรษฐกิจ ตลาด การเมือง และชีวิตประจำวันในไทย รีเฟรชอัตโนมัติทุก 4 ชั่วโมง",
    top: "6 ข่าวสำคัญที่สุดของวัน พร้อมวิเคราะห์ว่าทำไมถึงสำคัญ",
    stocks: "ข้อมูลตลาดหุ้น SET ไทยและ NYSE/NASDAQ สหรัฐฯ ให้ความสำคัญเท่ากัน",
    economics: "มหภาค (GDP เงินเฟ้อ ธนาคารกลาง) และจุลภาค (กำไรบริษัท IPO อุตสาหกรรม)",
    crucial: "ข่าวเร่งด่วนสำหรับผู้อยู่อาศัยในไทย: สภาพอากาศ การจราจร ความปลอดภัย คุณภาพอากาศ",
    reporter: "ข่าวครบวงจร: ข่าวหนัก (ด่วน การเมือง ธุรกิจ สืบสวน อาชญากรรม) และข่าวเบา (ไลฟ์สไตล์ บันเทิง กีฬา แรงบันดาลใจ)",
  }
};

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("briefing");
  const [rf, setRf] = usePersistedState("dn_rf", "All");
  const [prSub, setPrSub] = useState("breaking");
  const [ecoSub, setEcoSub] = useState("macro");
  const [themeKey, setThemeKey] = usePersistedState("dn_theme", "default");
  const [voiceGender, setVoiceGender] = usePersistedState("dn_voice", "female");
  const [lang, setLang] = usePersistedState("dn_lang", "en");
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdated, setLastUpdated] = usePersistedState("dn_updated", Date.now());
  const [nextRefresh, setNextRefresh] = usePersistedState("dn_next_refresh", Date.now() + AUTO_REFRESH_MS);
  const T = THEMES[themeKey] || THEMES.default;
  const tts = useTTS(voiceGender);
  const countdown = useCountdown(nextRefresh);

  // All news stored in one flat object keyed by section name
  const [news, setNews] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCall, setLoadingCall] = useState({ call1: false, call2: false });

  const doRefresh = useCallback(async () => {
    tts.stop();
    setLoading(true);
    setNews({});
    setLoadingCall({ call1: true, call2: true });
    const d = new Date().toDateString();

    // Fire both mega-calls in parallel
    const [r1, r2] = await Promise.all([
      fetchMega(buildMegaPrompt1(d)).then(r => { setLoadingCall(c => ({ ...c, call1: false })); return r; }),
      fetchMega(buildMegaPrompt2(d)).then(r => { setLoadingCall(c => ({ ...c, call2: false })); return r; }),
    ]);

    const merged = { ...(r1 || {}), ...(r2 || {}) };
    setNews(merged);
    const now = Date.now();
    setLastUpdated(now);
    setNextRefresh(now + AUTO_REFRESH_MS);
    setLoading(false);
  }, [tts]);

  // Load on mount
  useEffect(() => { doRefresh(); }, []);

  // Auto-refresh check every minute
  useEffect(() => {
    const id = setInterval(() => { if (Date.now() >= nextRefresh) doRefresh(); }, 60000);
    return () => clearInterval(id);
  }, [nextRefresh, doRefresh]);

  const getFiltered = key => {
    const items = news[key];
    if (!Array.isArray(items)) return null;
    return items.filter(i => matches(i, rf));
  };

  const tabBtn = id => ({
    whiteSpace: "nowrap", fontSize: 13, padding: "7px 15px", cursor: "pointer", fontFamily: "inherit",
    background: tab === id ? T.tabActive : "transparent", color: tab === id ? T.tabActiveText : T.sub,
    border: `1px solid ${tab === id ? T.tabActiveBorder : "transparent"}`,
    borderRadius: 20, fontWeight: tab === id ? 600 : 400, transition: "all 0.2s",
  });
  const rfBtn = r => ({
    fontSize: 12, padding: "5px 13px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit",
    background: rf === r ? T.tabActive : "transparent", color: rf === r ? T.tabActiveText : T.sub,
    border: `1px solid ${rf === r ? T.tabActiveBorder : T.border}`,
    fontWeight: rf === r ? 600 : 400, transition: "all 0.2s",
  });

  const Skels = () => <>{[1, 2, 3].map(i => <Skeleton key={i} T={T} />)}</>;
  const Empty = () => <p style={{ color: T.sub, padding: "1rem 0", fontSize: 13 }}>{lang === "th" ? "ไม่มีรายการที่ตรงกับตัวกรองนี้" : "No items match this filter."}</p>;

  const renderSection = (key, CardComp, name) => {
    if (loading) return <Skels />;
    const items = getFiltered(key);
    if (!items) return <p style={{ color: T.sub, fontSize: 13, padding: "1rem 0" }}>{lang === "th" ? "กำลังโหลด…" : "Loading…"}</p>;
    if (!items.length) return <Empty />;
    return (
      <>
        <ReadAllBar tts={tts} items={items} name={name} sid={key} T={T} />
        {items.map((s, i) => <CardComp key={i} item={s} tts={tts} T={T} />)}
      </>
    );
  };

  const renderContent = () => {
    if (tab === "briefing") {
      const raw = news["briefing"], id = "sec_briefing", isActive = tts.activeId === id;
      return (
        <div>
          <InfoDrop title={`ℹ️ About: ${lang === "th" ? "สรุปข่าวเช้า" : "Morning Briefing"}`} T={T}>
            <p style={{ margin: 0 }}>{CAT_DESC[lang].briefing}</p>
          </InfoDrop>
          {loading ? (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "24px 20px", textAlign: "center" }}>
              <p style={{ color: T.sub, fontSize: 13, margin: "0 0 16px" }}>
                {lang === "th" ? "🔄 กำลังดึงข่าวล่าสุด…" : "🔄 Fetching all news in parallel…"}
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
                {[["📰 Hard news", !loadingCall.call1], ["🌟 Soft news", !loadingCall.call2]].map(([label, done]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: done ? "#22C55E" : T.sub }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: done ? "#22C55E" : T.accent, display: "inline-block", animation: done ? "none" : "pulse 1s ease-in-out infinite" }} />
                    {label} {done ? "✓" : "…"}
                  </div>
                ))}
              </div>
              {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 12, background: T.border, borderRadius: 6, marginBottom: 10, width: ["70%", "100%", "85%", "60%"][i - 1], animation: "pulse 1.5s ease-in-out infinite" }} />)}
            </div>
          ) : !raw ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: T.sub, fontSize: 13, marginBottom: 12 }}>{lang === "th" ? "กดเพื่อโหลดข่าว" : "Press to load news"}</p>
              <button onClick={doRefresh} style={{ padding: "8px 20px", borderRadius: 20, cursor: "pointer", background: T.tabActive, color: T.tabActiveText, border: `1px solid ${T.tabActiveBorder}`, fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>Load now</button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "9px 13px", background: isActive ? T.tabActive : T.bg, border: `1px solid ${isActive ? T.tabActiveBorder : T.border}`, borderRadius: 10 }}>
                <span style={{ fontSize: 12, color: T.sub, flex: 1 }}>{isActive && !tts.paused ? "🔊 Reading…" : isActive && tts.paused ? "⏸ Paused" : "🔊 Listen to full briefing"}</span>
                <SpeakBtn text={raw} id={id} tts={tts} size="lg" T={T} />
                {tts.activeId && <button onClick={tts.stop} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, cursor: "pointer", background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5", fontFamily: "inherit" }}>■ Stop</button>}
              </div>
              <div style={{ background: T.card, border: `1px solid ${isActive ? T.tabActiveBorder : T.border}`, borderRadius: 12, padding: "18px 20px", fontSize: 14, lineHeight: 1.9, color: T.text, marginBottom: 10 }}>
                {raw.split(". ").slice(0, -1).join(". ") + "."}
              </div>
              {raw.toLowerCase().includes("key theme") && (
                <div style={{ background: T.tabActive, borderRadius: 12, padding: "13px 16px", borderLeft: `4px solid ${T.accent}` }}>
                  <p style={{ margin: 0, fontWeight: 500, color: T.tabActiveText, fontSize: 13 }}>
                    {raw.split(/\. /).find(s => s.toLowerCase().includes("key theme")) || ""}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    if (tab === "top") return <div><InfoDrop title={`ℹ️ About: ${lang === "th" ? "ข่าวเด่น" : "Top News"}`} T={T}><p style={{ margin: 0 }}>{CAT_DESC[lang].top}</p></InfoDrop>{renderSection("top", NewsCard, "Top News")}</div>;

    if (tab === "stocks") return (
      <div>
        <InfoDrop title={`ℹ️ About: ${lang === "th" ? "หุ้น" : "Stocks"}`} T={T}><p style={{ margin: 0 }}>{CAT_DESC[lang].stocks}</p></InfoDrop>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {[["🇹🇭 Thailand (SET)", "#FEF3E2", "#92400E"], ["🇺🇸 USA (NYSE/NASDAQ)", "#F0FDF4", "#166534"], ["🌏 China/Asia/Bonds", "#FFF1F2", "#9F1239"]].map(([l, bg, c]) => (
            <div key={l} style={{ background: bg, borderRadius: 10, padding: "7px 12px", flex: 1, minWidth: 90, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 11, color: c, fontWeight: 600 }}>{l}</p>
              <p style={{ margin: "1px 0 0", fontSize: 10, color: c, opacity: 0.8 }}>Equal Priority</p>
            </div>
          ))}
        </div>
        {renderSection("stocks", StockCard, "Stocks and Markets")}
      </div>
    );

    if (tab === "economics") {
      const key = ecoSub === "macro" ? "macro" : "micro";
      return (
        <div>
          <InfoDrop title={`ℹ️ About: ${lang === "th" ? "เศรษฐกิจ" : "Economics"}`} T={T}><p style={{ margin: 0 }}>{CAT_DESC[lang].economics}</p></InfoDrop>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[["macro", lang === "th" ? "📊 เศรษฐกิจมหภาค" : "📊 Macroeconomics"], ["micro", lang === "th" ? "🏭 เศรษฐกิจจุลภาค" : "🏭 Microeconomics"]].map(([k, l]) => (
              <button key={k} onClick={() => setEcoSub(k)} style={{ flex: 1, padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: ecoSub === k ? 600 : 400, background: ecoSub === k ? T.tabActive : T.bg, color: ecoSub === k ? T.tabActiveText : T.sub, border: `1px solid ${ecoSub === k ? T.tabActiveBorder : T.border}`, transition: "all 0.2s" }}>{l}</button>
            ))}
          </div>
          <div style={{ padding: "8px 12px", background: T.bg, borderRadius: 8, marginBottom: 12, fontSize: 12, color: T.sub }}>
            {ecoSub === "macro" ? (lang === "th" ? "ภาพรวมเศรษฐกิจ — GDP เงินเฟ้อ ธนาคารกลาง นโยบายการค้า" : "Big-picture forces — GDP, inflation, central banks, trade policy.") : (lang === "th" ? "ระดับภาคธุรกิจ — กำไรบริษัท สินค้าโภคภัณฑ์ อุตสาหกรรม" : "Sector & company-level — earnings, commodities, industries.")}
          </div>
          {renderSection(key, NewsCard, ecoSub === "macro" ? "Macroeconomics" : "Microeconomics")}
        </div>
      );
    }

    if (tab === "crucial") {
      const items = getFiltered("crucial");
      return (
        <div>
          <InfoDrop title={`ℹ️ About: ${lang === "th" ? "ข่าวด่วน" : "Crucial & Daily Life"}`} T={T}><p style={{ margin: 0 }}>{CAT_DESC[lang].crucial}</p></InfoDrop>
          {loading ? <Skels /> : !items ? <Empty /> : (
            <>
              <ReadAllBar tts={tts} items={items} name="Crucial News" sid="crucial" T={T} />
              {items.filter(i => i.urgent).length > 0 && <div style={{ marginBottom: 8, padding: "6px 12px", background: "#FEF2F2", borderRadius: 8, fontSize: 12, color: "#B91C1C", fontWeight: 600 }}>🚨 {items.filter(i => i.urgent).length} {lang === "th" ? "การแจ้งเตือนที่มีผลต่อชีวิตประจำวัน" : "active alerts affecting daily life in Thailand"}</div>}
              {items.filter(i => i.urgent).map((s, i) => <NewsCard key={"u" + i} item={s} tts={tts} T={T} />)}
              {items.filter(i => !i.urgent).length > 0 && <div style={{ margin: "6px 0 8px", padding: "6px 12px", background: T.bg, borderRadius: 8, fontSize: 12, color: T.sub }}>{lang === "th" ? "ข่าวโลกและข่าวสำคัญอื่นๆ" : "Global & other crucial news"}</div>}
              {items.filter(i => !i.urgent).map((s, i) => <NewsCard key={"n" + i} item={s} tts={tts} T={T} />)}
            </>
          )}
        </div>
      );
    }

    if (tab === "reporter") {
      return (
        <div>
          <InfoDrop title={`ℹ️ About: ${lang === "th" ? "นักข่าวส่วนตัว" : "Personal Reporter"}`} T={T}><p style={{ margin: 0 }}>{CAT_DESC[lang].reporter}</p></InfoDrop>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#B91C1C", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>📰 {lang === "th" ? "ข่าวหนัก" : "Hard News"}</p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {PR_SUBS.filter(s => s.type === "hard").map(s => (
                <button key={s.id} onClick={() => setPrSub(s.id)} style={{ fontSize: 12, padding: "5px 11px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", background: prSub === s.id ? "#FEF2F2" : T.bg, color: prSub === s.id ? "#B91C1C" : T.sub, border: `1px solid ${prSub === s.id ? "#FECACA" : T.border}`, fontWeight: prSub === s.id ? 600 : 400, transition: "all 0.2s" }}>{s.label}</button>
              ))}
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>🌟 {lang === "th" ? "ข่าวเบา" : "Soft News"}</p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {PR_SUBS.filter(s => s.type === "soft").map(s => (
                <button key={s.id} onClick={() => setPrSub(s.id)} style={{ fontSize: 12, padding: "5px 11px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", background: prSub === s.id ? T.tabActive : T.bg, color: prSub === s.id ? T.tabActiveText : T.sub, border: `1px solid ${prSub === s.id ? T.tabActiveBorder : T.border}`, fontWeight: prSub === s.id ? 600 : 400, transition: "all 0.2s" }}>{s.label}</button>
              ))}
            </div>
          </div>
          {renderSection(prSub, NewsCard, PR_SUBS.find(s => s.id === prSub)?.label || prSub)}
        </div>
      );
    }
  };

  const lastUpdatedStr = lastUpdated ? new Date(lastUpdated).toLocaleTimeString(lang === "th" ? "th-TH" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter',-apple-system,sans-serif", padding: "0 0 40px" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      {showSettings && <div onClick={() => setShowSettings(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.15)", zIndex: 99 }} />}
      {showSettings && <SettingsPanel T={T} themeKey={themeKey} setThemeKey={setThemeKey} voiceGender={voiceGender} setVoiceGender={setVoiceGender} lang={lang} setLang={setLang} onClose={() => setShowSettings(false)} />}

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>
        {/* Header */}
        <div style={{ padding: "18px 0 14px", borderBottom: `1px solid ${T.border}`, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>{lang === "th" ? "ข่าวประจำวัน" : "Daily News"}</h1>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: T.sub }}>{new Date().toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                {lastUpdatedStr && <span style={{ fontSize: 11, color: T.sub }}>{lang === "th" ? "อัปเดตเมื่อ" : "Updated"} {lastUpdatedStr}</span>}
                <span style={{ fontSize: 11, color: T.sub, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: countdown < 300000 ? "#EF4444" : countdown < 900000 ? "#F59E0B" : "#22C55E", display: "inline-block" }} />
                  {lang === "th" ? "รีเฟรชอัตโนมัติใน" : "Auto-refresh in"} <strong style={{ color: T.text }}>{fmtCountdown(countdown)}</strong>
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button onClick={doRefresh} disabled={loading} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 20, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", background: loading ? T.tabActive : T.card, color: loading ? T.accent : T.sub, border: `1px solid ${loading ? T.tabActiveBorder : T.border}`, fontWeight: 500, display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}>
                {loading ? <><span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span> {lang === "th" ? "กำลังโหลด…" : "Loading…"}</> : <>↻ {lang === "th" ? "รีเฟรช" : "Refresh"}</>}
              </button>
              <button onClick={() => tts.toggle(news["briefing"] || "No content loaded.", "ALL")} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", background: tts.activeId === "ALL" ? T.tabActive : T.card, color: tts.activeId === "ALL" ? T.tabActiveText : T.sub, border: `1px solid ${tts.activeId === "ALL" ? T.tabActiveBorder : T.border}`, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                {tts.activeId === "ALL" && !tts.paused ? "⏸ Pause" : tts.activeId === "ALL" && tts.paused ? "▶ Resume" : "🔊 Read All"}
              </button>
              {tts.speaking && <button onClick={tts.stop} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 20, cursor: "pointer", background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA", fontFamily: "inherit" }}>■</button>}
              <button onClick={() => setShowSettings(s => !s)} style={{ fontSize: 15, padding: "5px 8px", borderRadius: 10, cursor: "pointer", background: showSettings ? T.tabActive : "transparent", border: `1px solid ${showSettings ? T.tabActiveBorder : T.border}`, color: T.sub }}>⚙️</button>
            </div>
          </div>
          {/* Loading status bar */}
          {loading && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {[["📰 " + (lang === "th" ? "ข่าวหนัก + หุ้น + สรุป" : "Hard news + stocks + briefing"), !loadingCall.call1], ["🌟 " + (lang === "th" ? "ข่าวบันเทิง + กีฬา + ไลฟ์สไตล์" : "Soft news + lifestyle + sports"), !loadingCall.call2]].map(([label, done]) => (
                  <div key={label} style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: done ? "#22C55E" : T.sub, padding: "5px 10px", background: done ? "#F0FDF4" : T.bg, border: `1px solid ${done ? "#86EFAC" : T.border}`, borderRadius: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: done ? "#22C55E" : T.accent, display: "inline-block", flexShrink: 0, animation: done ? "none" : "pulse 1s ease-in-out infinite" }} />
                    {label} {done ? "✓" : "…"}
                  </div>
                ))}
              </div>
              <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", background: T.accent, borderRadius: 2, transition: "width 1s ease", width: (!loadingCall.call1 && !loadingCall.call2) ? "100%" : (!loadingCall.call1 || !loadingCall.call2) ? "55%" : "10%" }} />
              </div>
            </div>
          )}
        </div>

        {/* Filter + Nav */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>{lang === "th" ? "กรองตามภูมิภาค" : "Region Filter"}</p>
          <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
            {REGIONS[lang].map(r => (
              <button key={r} onClick={() => setRf(r)} style={rfBtn(r)}>
                {r === "Thailand" || r === "ไทย" ? "🇹🇭 " : r === "USA" || r === "สหรัฐฯ" ? "🇺🇸 " : r === "Global" || r === "โลก" ? "🌐 " : ""}{r}
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: T.border, margin: "0 0 12px" }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>{lang === "th" ? "หมวดหมู่" : "Section"}</p>
          <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 2 }}>
            {TABS.map(t2 => (
              <button key={t2.id} onClick={() => setTab(t2.id)} style={tabBtn(t2.id)}>
                {lang === "th" ? t2.th : t2.en}
              </button>
            ))}
          </div>
        </div>

        <div>{renderContent()}</div>

        <div style={{ marginTop: 20, padding: "10px 14px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10 }}>
          <p style={{ margin: 0, fontSize: 11, color: T.sub, lineHeight: 1.7 }}>
            ⚡ 2 parallel API calls fetch all sections simultaneously · 🔄 Auto-refreshes every 4 hours · 🔊 Tap cards to listen · ⚙️ settings<br />
            {lang === "th" ? "ความน่าเชื่อถือ: ✓ สูง = Reuters, BBC, Bangkok Post, IEA · ~ ปานกลาง-สูง = น่าเชื่อถือโดยทั่วไป" : "Reliability: ✓ High = Reuters, BBC, Bangkok Post, IEA, TMD · ~ Med-High = generally reliable."}
          </p>
        </div>
      </div>
    </div>
  );
}
