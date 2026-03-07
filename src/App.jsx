import { useState, useEffect, useRef, useCallback } from "react";

// ===== CONFIG =====
const GAS_URL ="https://script.google.com/macros/s/AKfycbzhULQPrWnp1VS-Wv4HabZ-z6qIbDMl7XV2Ynzt1zPG5cfWG_lH5WKNhfMd4j1aKWinJA/exec";
const GOOGLE_CLIENT_ID = "331300779334-m2ih2g0hg2epa9rpiu6sa1f7buje20v5.apps.googleusercontent.com";

// ===== STYLES =====
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --bg:#0f0f13; --surface:#1a1a22; --surface2:#22222e; --border:#2e2e3e;
    --accent:#7c6af7; --accent2:#f76ab0; --accent3:#6af7c8;
    --text:#e8e8f0; --text2:#9090a8; --text3:#5a5a72;
    --danger:#f76a6a; --warn:#f7c06a; --radius:12px; --radius-sm:8px;
  }
  html, body { width:100%; background:var(--bg); color:var(--text); font-family:'Noto Sans JP',sans-serif; font-weight:400; min-height:100vh; overflow-x:hidden; }
  body { display:flex; justify-content:center; }
  .app { width:100%; max-width:780px; padding:0 0 80px; min-height:100vh; }

  .login-screen { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; gap:32px; }
  .login-logo { font-family:'DM Mono',monospace; font-size:32px; font-weight:500; color:var(--accent); letter-spacing:-1px; }
  .login-logo span { color:var(--accent2); }
  .login-card { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:36px 32px; width:100%; max-width:360px; text-align:center; }
  .login-title { font-size:18px; font-weight:700; color:var(--text); margin-bottom:8px; }
  .login-desc { font-size:13px; color:var(--text2); margin-bottom:28px; line-height:1.6; }
  #google-signin-btn { display:flex; justify-content:center; margin-bottom:12px; min-height:44px; min-width:280px; overflow:visible; }
  .login-note { font-size:11px; color:var(--text3); margin-top:16px; line-height:1.5; }
  .google-btn { display:flex; align-items:center; justify-content:center; gap:10px; width:100%; padding:12px 20px; background:#fff; border:1px solid #dadce0; border-radius:8px; font-size:15px; font-weight:500; color:#3c4043; cursor:pointer; transition:box-shadow 0.2s; font-family:'Noto Sans JP',sans-serif; }
  .google-btn:hover { box-shadow:0 2px 8px rgba(0,0,0,0.2); }
  .google-btn svg { flex-shrink:0; }

  .header { position:sticky; top:0; z-index:100; background:rgba(15,15,19,0.92); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); padding:16px 20px 0; }
  .header-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .logo { font-family:'DM Mono',monospace; font-size:18px; font-weight:500; color:var(--accent); letter-spacing:-0.5px; }
  .logo span { color:var(--accent2); }
  .header-actions { display:flex; gap:8px; align-items:center; }
  .user-badge { display:flex; align-items:center; gap:6px; background:var(--surface2); border:1px solid var(--border); border-radius:20px; padding:4px 10px 4px 4px; }
  .user-avatar { width:24px; height:24px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; flex-shrink:0; overflow:hidden; }
  .user-avatar img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
  .user-name { font-size:12px; color:var(--text2); max-width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .btn-icon { width:36px; height:36px; border:1px solid var(--border); background:var(--surface); border-radius:var(--radius-sm); color:var(--text2); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; transition:all 0.15s; }
  .btn-icon:hover { border-color:var(--accent); color:var(--accent); }
  .btn-icon.logout:hover { border-color:var(--danger); color:var(--danger); }

  .month-strip { display:flex; overflow-x:auto; scrollbar-width:none; touch-action:pan-x; cursor:grab; }
  .month-strip::-webkit-scrollbar { display:none; }
  .month-strip.grabbing { cursor:grabbing; }
  .month-tab { flex-shrink:0; padding:8px 14px; font-size:13px; font-weight:500; color:var(--text3); cursor:pointer; border-bottom:2px solid transparent; transition:all 0.15s; white-space:nowrap; background:none; border-top:none; border-left:none; border-right:none; font-family:'Noto Sans JP',sans-serif; }
  .month-tab:hover { color:var(--text2); }
  .month-tab.active { color:var(--accent); border-bottom-color:var(--accent); }

  .tabs { display:flex; padding:16px 20px 0; border-bottom:1px solid var(--border); background:var(--bg); }
  .tab { padding:10px 20px; font-size:14px; font-weight:500; color:var(--text3); cursor:pointer; border-bottom:2px solid transparent; transition:all 0.15s; background:none; border-top:none; border-left:none; border-right:none; font-family:'Noto Sans JP',sans-serif; display:flex; align-items:center; gap:6px; }
  .tab.active { color:var(--text); border-bottom-color:var(--accent2); }
  .tab .badge { background:var(--surface2); color:var(--text2); font-family:'DM Mono',monospace; font-size:11px; padding:1px 6px; border-radius:10px; min-width:20px; text-align:center; }
  .tab.active .badge { background:var(--accent2); color:#fff; }

  .task-list { padding:12px 16px; }
  .section-label { font-size:11px; font-weight:500; color:var(--text3); letter-spacing:1px; text-transform:uppercase; font-family:'DM Mono',monospace; padding:8px 4px 6px; }

  .task-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:14px 14px 14px 12px; margin-bottom:8px; display:flex; gap:12px; align-items:flex-start; transition:border-color 0.2s,box-shadow 0.2s; position:relative; overflow:hidden; }
  .task-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--border); transition:background 0.2s; }
  .task-card.urgent::before  { background:var(--danger); }
  .task-card.warning::before { background:var(--warn); }
  .task-card.completed::before { background:var(--accent3); }
  .task-card:hover { border-color:var(--accent); box-shadow:0 0 0 1px var(--accent); }
  .task-card.dimmed { opacity:0.75; }

  .checkbox-wrap { display:flex; flex-direction:column; align-items:center; gap:0; flex-shrink:0; padding-top:2px; }
  .cb-label { font-size:9px; font-family:'DM Mono',monospace; color:var(--text3); line-height:1; letter-spacing:0.3px; margin-bottom:3px; user-select:none; }
  .cb { width:20px; height:20px; border:2px solid var(--border); border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; background:transparent; user-select:none; }
  .cb.cb1:hover { border-color:var(--accent); }
  .cb.cb1.half { background:rgba(124,106,247,0.2); border-color:var(--accent); }
  .cb.cb1.half::after { content:'✓'; color:var(--accent); font-size:11px; font-weight:700; }
  .cb.cb1.done,.cb.cb2.done { background:var(--accent3); border-color:var(--accent3); }
  .cb.cb1.done::after,.cb.cb2.done::after { content:'✓'; color:#0f0f13; font-size:11px; font-weight:700; }
  .cb.cb2.enabled:hover { border-color:var(--accent3); }
  .cb.cb2.disabled { opacity:0.25; cursor:default; }
  .cb-connector { width:1px; height:8px; background:var(--border); margin:3px 0; }

  .task-body { flex:1; min-width:0; }
  .task-name { font-size:15px; font-weight:500; color:var(--text); margin-bottom:6px; word-break:break-word; }
  .task-card.dimmed .task-name { color:var(--text2); }
  .task-card.completed .task-name { text-decoration:line-through; color:var(--text3); }
  .task-meta { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:6px; }
  .deadline { display:inline-flex; align-items:center; gap:3px; font-family:'DM Mono',monospace; font-size:11px; padding:2px 7px; border-radius:4px; font-weight:500; }
  .dl-1-todo    { background:rgba(124,106,247,0.15); color:var(--accent); }
  .dl-1-done    { background:rgba(60,60,80,0.3); color:var(--text3); text-decoration:line-through; }
  .dl-1-overdue { background:rgba(247,106,106,0.15); color:var(--danger); }
  .dl-2-base    { background:rgba(90,90,114,0.25); color:var(--text2); }
  .dl-2-active  { background:rgba(247,192,106,0.15); color:var(--warn); }
  .dl-2-warn    { background:rgba(247,160,106,0.2); color:#f7a06a; }
  .dl-2-overdue { background:rgba(247,106,106,0.15); color:var(--danger); }
  .active-mark { font-size:9px; animation:blink 1.4s ease infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
  .task-note { font-size:12px; color:var(--text2); word-break:break-all; }
  .task-note a { color:var(--accent); text-decoration:none; }
  .task-note a:hover { text-decoration:underline; }
  .task-done-at { font-size:11px; color:var(--text3); font-family:'DM Mono',monospace; margin-top:4px; }
  .task-actions { display:flex; flex-direction:column; gap:4px; }
  .btn-sm { width:28px; height:28px; border:1px solid var(--border); background:transparent; border-radius:var(--radius-sm); color:var(--text3); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; transition:all 0.15s; }
  .btn-sm:hover { border-color:var(--accent); color:var(--accent); }
  .btn-sm.del:hover { border-color:var(--danger); color:var(--danger); }

  .fab { position:fixed; bottom:28px; right:20px; width:56px; height:56px; background:linear-gradient(135deg,var(--accent),var(--accent2)); border:none; border-radius:18px; color:#fff; font-size:24px; cursor:pointer; box-shadow:0 8px 24px rgba(124,106,247,0.4); display:flex; align-items:center; justify-content:center; transition:all 0.2s; z-index:200; }
  .fab:hover { transform:scale(1.08); }
  .fab:active { transform:scale(0.96); }

  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); z-index:300; display:flex; align-items:flex-end; justify-content:center; padding:20px; }
  @media(min-width:600px){.modal-overlay{align-items:center;}}
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:20px 20px 16px 16px; padding:24px; width:100%; max-width:540px; max-height:90vh; overflow-y:auto; animation:slideUp 0.25s ease; }
  @media(min-width:600px){.modal{border-radius:20px;animation:fadeIn 0.2s ease;}}
  @keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes fadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
  .modal-title { font-size:17px; font-weight:700; color:var(--text); margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; }
  .form-group { margin-bottom:16px; }
  .form-label { display:block; font-size:12px; font-weight:500; color:var(--text2); margin-bottom:6px; letter-spacing:0.5px; }
  .form-input { width:100%; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px 12px; color:var(--text); font-size:14px; font-family:'Noto Sans JP',sans-serif; outline:none; transition:border-color 0.15s; }
  .form-input:focus { border-color:var(--accent); }
  .form-input::placeholder { color:var(--text3); }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .form-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
  .btn { padding:10px 20px; border-radius:var(--radius-sm); font-size:14px; font-weight:500; cursor:pointer; border:none; transition:all 0.15s; font-family:'Noto Sans JP',sans-serif; }
  .btn-primary { background:var(--accent); color:#fff; }
  .btn-primary:hover { background:#9080ff; }
  .btn-cancel { background:var(--surface2); color:var(--text2); border:1px solid var(--border); }
  .btn-cancel:hover { color:var(--text); }

  .empty { text-align:center; padding:60px 20px; color:var(--text3); }
  .empty-icon { font-size:48px; margin-bottom:12px; opacity:0.5; }
  .empty-text { font-size:14px; }
  .loading { display:flex; align-items:center; justify-content:center; padding:60px 20px; gap:10px; color:var(--text2); font-size:14px; }
  .spinner { width:20px; height:20px; border:2px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}
  .toast { position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius); padding:10px 20px; font-size:13px; color:var(--text); z-index:400; animation:toastIn 0.2s ease; white-space:nowrap; box-shadow:0 8px 24px rgba(0,0,0,0.5); }
  @keyframes toastIn{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
  .swipe-container { touch-action:pan-y; }
  @media(max-width:480px){.task-name{font-size:14px}.form-row{grid-template-columns:1fr}}
`;

// ===== UTILS =====
const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const getMonthKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const formatDate = str => { if(!str)return null; const d=new Date(str); return isNaN(d)?str:`${d.getMonth()+1}/${d.getDate()}`; };
const isURL = str => { try{return /^https?:\/\//.test(str.trim())}catch{return false} };

function daysDiff(str) {
  if(!str) return null;
  const d=new Date(str); d.setHours(0,0,0,0);
  if(isNaN(d)) return null;
  const t=new Date(); t.setHours(0,0,0,0);
  return Math.floor((d-t)/86400000);
}

function buildMonthList() {
  const now=new Date();
  return Array.from({length:9},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-2+i,1);
    return {key:getMonthKey(d), short:MONTHS[d.getMonth()]};
  });
}

function getActiveDue(task) {
  return task.status==="一次完了" ? (task.deadline2||null) : (task.deadline1||null);
}

function getSortScore(task) {
  const diff=daysDiff(getActiveDue(task));
  const penalty=task.status==="一次完了"?0.5:0;
  const tb=diff!==null?diff/100000:0;
  if(diff===null) return 3+penalty;
  if(diff<0)      return 0+penalty+tb;
  if(diff<=3)     return 1+penalty+tb;
  return               2+penalty+tb;
}

function getSectionId(score) {
  if(score<1) return "overdue";
  if(score<2) return "warning";
  if(score<3) return "normal";
  return "none";
}

// ===== GAS API =====
async function apiCall(action, payload={}, idToken=null) {
  const body = {action, ...payload};
  if(idToken) body.idToken = idToken;
  const res = await fetch(GAS_URL, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  if(!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

// ===== APP =====
export default function App() {
  const [user, setUser]               = useState(null);
  const [idToken, setIdToken]         = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [activeTab, setActiveTab]     = useState("todo");
  const [editTask, setEditTask]       = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [toast, setToast]             = useState("");
  const monthList = buildMonthList();
  const now = new Date();
  const [activeMonth, setActiveMonth] = useState(getMonthKey(now));
  const monthRef = useRef(null);
  const swipeRef = useRef(null);
  const swipeX   = useRef(null);
  const isDrag   = useRef(false);
  const dragX    = useRef(0);
  const scrollX  = useRef(0);

  // ---- 起動時にlocalStorageからユーザー情報を復元 ----
  useEffect(()=>{
    const saved = localStorage.getItem("todo_user");
    const savedToken = localStorage.getItem("todo_token");
    if(saved && savedToken) {
      try {
        setUser(JSON.parse(saved));
        setIdToken(savedToken);
      } catch(e) {}
    }
    setAuthLoading(false);
  },[]);

  // ---- Google Sign-Inボタンを描画 ----
  useEffect(()=>{
    if(authLoading || user) return;
    const interval = setInterval(()=>{
      if(window.google) {
        clearInterval(interval);
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });
      }
    }, 200);
    return () => clearInterval(interval);
  },[authLoading, user]);

  function handleGoogleLogin() {
    if(window.google) {
      window.google.accounts.id.prompt();
    }
  }

  // ---- ログイン成功コールバック ----
  function handleCredentialResponse(response) {
    const token = response.credential;
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
      const userInfo = {
        email:   payload.email,
        name:    payload.email,
        picture: payload.picture || null,
      };
      setUser(userInfo);
      setIdToken(token);
      localStorage.setItem("todo_user", JSON.stringify(userInfo));
      localStorage.setItem("todo_token", token);
    } catch(e) {
      console.error("ログインエラー", e);
    }
  }

  function handleLogout() {
    setUser(null);
    setIdToken(null);
    setTasks([]);
    localStorage.removeItem("todo_user");
    localStorage.removeItem("todo_token");
    if(window.google) window.google.accounts.id.disableAutoSelect();
    showToast("ログアウトしました");
  }

  const showToast = msg=>{ setToast(msg); setTimeout(()=>setToast(""),2500); };

  // ---- タスク読み込み ----
  const loadTasks = useCallback(async(month)=>{
    if(!user || !idToken) return;
    setLoading(true);
    try{
      const d = await apiCall("getTasks", {month}, idToken);
      if(d.tasks) setTasks(d.tasks);
    }catch{ showToast("読み込みエラー"); }
    finally{ setLoading(false); }
  },[user, idToken]);

  useEffect(()=>{ loadTasks(activeMonth); },[activeMonth, loadTasks]);

  // ---- フィルタ & ソート ----
  const activeTasks = tasks
    .filter(t=>t.month===activeMonth && t.status!=="完了")
    .map(t=>({...t,_score:getSortScore(t)}))
    .sort((a,b)=>a._score-b._score);

  const doneTasks = tasks
    .filter(t=>t.month===activeMonth && t.status==="完了")
    .sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt));

  // ---- チェック操作 ----
  async function handleCheck1(task) {
    // 二次期限がない場合はそのまま完了済みへ
    if(!task.deadline2) {
      const completedAt=new Date().toISOString();
      const updated={...task,status:"完了",completedAt};
      setTasks(p=>p.map(t=>t.id===task.id?updated:t));
      try{ await apiCall("completeTask",{id:task.id,completedAt},idToken); }catch{ showToast("保存エラー"); }
      showToast("🎉 完了済みに移動しました");
      return;
    }
    const updated={...task,status:"一次完了"};
    setTasks(p=>p.map(t=>t.id===task.id?updated:t));
    try{ await apiCall("updateTask",{task:updated},idToken); }catch{ showToast("保存エラー"); }
    showToast("✓ 一次完了 — 二次期限で管理します");
  }

  async function handleUndo1(task) {
    const updated={...task,status:"未対応"};
    setTasks(p=>p.map(t=>t.id===task.id?updated:t));
    try{ await apiCall("updateTask",{task:updated},idToken); }catch{ showToast("保存エラー"); }
    showToast("↩ 未対応に戻しました");
  }

  async function handleCheck2(task) {
    const completedAt=new Date().toISOString();
    const updated={...task,status:"完了",completedAt};
    setTasks(p=>p.map(t=>t.id===task.id?updated:t));
    try{ await apiCall("completeTask",{id:task.id,completedAt},idToken); }catch{ showToast("保存エラー"); }
    showToast("🎉 完了済みに移動しました");
  }

  async function reopenTask(id) {
    const t=tasks.find(t=>t.id===id);
    const updated={...t,status:"未対応",completedAt:""};
    setTasks(p=>p.map(t=>t.id===id?updated:t));
    try{ await apiCall("reopenTask",{id},idToken); }catch{ showToast("保存エラー"); }
    showToast("↩ 未完了に戻しました");
  }

  async function deleteTask(id) {
    if(!window.confirm("このタスクを削除しますか？")) return;
    setTasks(p=>p.filter(t=>t.id!==id));
    try{ await apiCall("deleteTask",{id},idToken); }catch{ showToast("削除エラー"); }
    showToast("🗑 削除しました");
  }

  async function saveTask(data) {
    const isNew=!data.id;
    const task=isNew
      ? {...data,id:Date.now().toString(),status:"未対応",completedAt:"",month:activeMonth}
      : {...data};
    setTasks(p=>isNew?[...p,task]:p.map(t=>t.id===task.id?task:t));
    try{ await apiCall(isNew?"addTask":"updateTask",{task},idToken); }catch{ showToast("保存エラー"); }
    setShowModal(false);
    showToast(isNew?"✨ タスクを追加しました":"✏️ 更新しました");
  }

  // ---- スワイプ ----
  const onTS=e=>{swipeX.current=e.touches[0].clientX;};
  const onTE=e=>{
    if(swipeX.current===null) return;
    const dx=e.changedTouches[0].clientX-swipeX.current;
    if(Math.abs(dx)<50) return;
    const idx=monthList.findIndex(m=>m.key===activeMonth);
    if(dx<0&&idx<monthList.length-1) setActiveMonth(monthList[idx+1].key);
    if(dx>0&&idx>0) setActiveMonth(monthList[idx-1].key);
    swipeX.current=null;
  };

  const onMD=e=>{isDrag.current=true;dragX.current=e.clientX;scrollX.current=monthRef.current.scrollLeft;monthRef.current.classList.add("grabbing");};
  const onMM=e=>{if(!isDrag.current)return;monthRef.current.scrollLeft=scrollX.current-(e.clientX-dragX.current);};
  const onMU=()=>{isDrag.current=false;monthRef.current?.classList.remove("grabbing");};

  const sec=id=>activeTasks.filter(t=>getSectionId(t._score)===id);

  if(authLoading) {
    return (
      <>
        <style>{style}</style>
        <div className="loading" style={{minHeight:"100vh"}}>
          <div className="spinner"/> 読み込み中...
        </div>
      </>
    );
  }

  if(!user) {
    return (
      <>
        <style>{style}</style>
        <div className="login-screen">
          <div className="login-logo">do<span>.</span>list</div>
          <div className="login-card">
            <div className="login-title">ログインして始める</div>
            <div className="login-desc">
              Googleアカウントでログインすると、<br/>
              どの端末からでも自分のタスクにアクセスできます。
            </div>
            <div id="google-signin-btn" style={{marginBottom:"8px"}}></div>
            <button className="google-btn" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/></svg>
              Googleでログイン
            </button>
            <div className="login-note">
              タスクデータはあなた専用のスプレッドシートに保存されます。
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{style}</style>
      <div className="app">
        <div className="header">
          <div className="header-top">
            <div className="logo">do<span>.</span>list</div>
            <div className="header-actions">
              <div className="user-badge" title={user.email}>
                <div className="user-avatar">
                  {user.picture
                    ? <img src={user.picture} alt={user.name} referrerPolicy="no-referrer"/>
                    : (user.name||user.email||"?")[0].toUpperCase()
                  }
                </div>
                <span className="user-name">{user.name||user.email}</span>
              </div>
              <button className="btn-icon logout" onClick={handleLogout} title="ログアウト">⏻</button>
              <button className="btn-icon" onClick={()=>{setEditTask(null);setShowModal(true);}}>＋</button>
            </div>
          </div>
          <div className="month-strip" ref={monthRef} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>
            {monthList.map(m=>(
              <button key={m.key} className={`month-tab${activeMonth===m.key?" active":""}`} onClick={()=>setActiveMonth(m.key)}>{m.short}</button>
            ))}
          </div>
        </div>

        <div className="tabs">
          <button className={`tab${activeTab==="todo"?" active":""}`} onClick={()=>setActiveTab("todo")}>
            未完了 <span className="badge">{activeTasks.length}</span>
          </button>
          <button className={`tab${activeTab==="done"?" active":""}`} onClick={()=>setActiveTab("done")}>
            完了済み <span className="badge">{doneTasks.length}</span>
          </button>
        </div>

        <div className="swipe-container" ref={swipeRef} onTouchStart={onTS} onTouchEnd={onTE}>
          {loading
            ? <div className="loading"><div className="spinner"/>読み込み中...</div>
            : <div className="task-list">
                {activeTab==="todo" ? (
                  activeTasks.length===0
                    ? <div className="empty"><div className="empty-icon">🎉</div><div className="empty-text">この月のタスクはありません</div></div>
                    : <>
                        {sec("overdue").length>0 && <div className="section-label">⚠ 期限超過</div>}
                        {sec("overdue").map(t=><TaskCard key={t.id} task={t} onCheck1={()=>handleCheck1(t)} onUndo1={()=>handleUndo1(t)} onCheck2={()=>handleCheck2(t)} onEdit={()=>{setEditTask(t);setShowModal(true);}} onDelete={()=>deleteTask(t.id)}/>)}
                        {sec("warning").length>0 && <div className="section-label">⏰ 期限間近（3日以内）</div>}
                        {sec("warning").map(t=><TaskCard key={t.id} task={t} onCheck1={()=>handleCheck1(t)} onUndo1={()=>handleUndo1(t)} onCheck2={()=>handleCheck2(t)} onEdit={()=>{setEditTask(t);setShowModal(true);}} onDelete={()=>deleteTask(t.id)}/>)}
                        {sec("normal").length>0 && <div className="section-label">📋 タスク</div>}
                        {sec("normal").map(t=><TaskCard key={t.id} task={t} onCheck1={()=>handleCheck1(t)} onUndo1={()=>handleUndo1(t)} onCheck2={()=>handleCheck2(t)} onEdit={()=>{setEditTask(t);setShowModal(true);}} onDelete={()=>deleteTask(t.id)}/>)}
                        {sec("none").length>0 && <div className="section-label">📌 期限なし</div>}
                        {sec("none").map(t=><TaskCard key={t.id} task={t} onCheck1={()=>handleCheck1(t)} onUndo1={()=>handleUndo1(t)} onCheck2={()=>handleCheck2(t)} onEdit={()=>{setEditTask(t);setShowModal(true);}} onDelete={()=>deleteTask(t.id)}/>)}
                      </>
                ) : (
                  doneTasks.length===0
                    ? <div className="empty"><div className="empty-icon">📭</div><div className="empty-text">完了済みタスクはありません</div></div>
                    : <>
                        <div className="section-label">✅ 完了済み</div>
                        {doneTasks.map(t=><TaskCard key={t.id} task={t} isDone onCheck1={()=>reopenTask(t.id)} onEdit={()=>{setEditTask(t);setShowModal(true);}} onDelete={()=>deleteTask(t.id)}/>)}
                      </>
                )}
              </div>
          }
        </div>

        <button className="fab" onClick={()=>{setEditTask(null);setShowModal(true);}}>＋</button>
        {showModal && <TaskModal task={editTask} onSave={saveTask} onClose={()=>setShowModal(false)}/>}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

function TaskCard({task, onCheck1, onUndo1, onCheck2, onEdit, onDelete, isDone}) {
  const {status,deadline1,deadline2,note,completedAt} = task;
  const isFirstDone = status==="一次完了";
  const isCompleted = status==="完了"||isDone;
  const activeDiff  = isDone?null:daysDiff(getActiveDue(task));
  let cardCls="";
  if(isCompleted) cardCls="completed";
  else if(activeDiff!==null&&activeDiff<0) cardCls="urgent";
  else if(activeDiff!==null&&activeDiff<=3) cardCls="warning";
  if(isFirstDone) cardCls+=" dimmed";
  const d1diff=daysDiff(deadline1);
  const d1cls=isFirstDone||isCompleted?"dl-1-done":d1diff!==null&&d1diff<0?"dl-1-overdue":"dl-1-todo";
  const d2diff=daysDiff(deadline2);
  let d2cls="dl-2-base";
  if(isFirstDone&&!isCompleted){
    if(d2diff!==null&&d2diff<0) d2cls="dl-2-overdue";
    else if(d2diff!==null&&d2diff<=3) d2cls="dl-2-warn";
    else d2cls="dl-2-active";
  }
  return (
    <div className={`task-card ${cardCls}`}>
      <div className="checkbox-wrap">
        <div className="cb-label">一次</div>
        <div className={`cb cb1${isCompleted?" done":isFirstDone?" half":""}`}
          onClick={isCompleted?undefined:isFirstDone?onUndo1:onCheck1}
          style={{cursor:isCompleted?"default":"pointer"}}
          title={isCompleted?"":isFirstDone?"クリックで取り消す":"一次完了にする"}/>
        <div className="cb-connector"/>
        <div className={`cb cb2${isCompleted?" done":isFirstDone?" enabled":" disabled"}`}
          onClick={isFirstDone?onCheck2:undefined}
          title={isFirstDone?"二次完了にする":""}/>
        <div className="cb-label" style={{opacity:isFirstDone||isCompleted?1:0.3}}>二次</div>
      </div>
      <div className="task-body">
        <div className="task-name">{task.name}</div>
        <div className="task-meta">
          {deadline1&&<span className={`deadline ${d1cls}`}>一次 {formatDate(deadline1)}</span>}
          {deadline2&&(
            <span className={`deadline ${d2cls}`}>
              {isFirstDone&&!isCompleted&&<span className="active-mark">▶ </span>}
              二次 {formatDate(deadline2)}
            </span>
          )}
        </div>
        {note&&<div className="task-note">{isURL(note)?<a href={note} target="_blank" rel="noopener noreferrer">🔗 {note}</a>:note}</div>}
        {isCompleted&&completedAt&&(
          <div className="task-done-at">完了: {new Date(completedAt).toLocaleDateString("ja-JP")} {new Date(completedAt).toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})}</div>
        )}
      </div>
      <div className="task-actions">
        <button className="btn-sm" onClick={onEdit} title="編集">✏️</button>
        <button className="btn-sm del" onClick={onDelete} title="削除">🗑</button>
      </div>
    </div>
  );
}

function TaskModal({task, onSave, onClose}) {
  const [name,setName]=useState(task?.name||"");
  const [d1,setD1]=useState(task?.deadline1||"");
  const [d2,setD2]=useState(task?.deadline2||"");
  const [note,setNote]=useState(task?.note||"");
  function handleSave(){
    if(!name.trim()){alert("タスク名を入力してください");return;}
    onSave({...(task||{}),name:name.trim(),deadline1:d1,deadline2:d2,note:note.trim()});
  }
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">
          <span>{task?"タスクを編集":"新規タスク"}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-group">
          <label className="form-label">タスク名 *</label>
          <input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="タスク名を入力..." autoFocus/>
        </div>
        <div className="form-group">
          <div className="form-row">
            <div><label className="form-label">一次期限</label><input type="date" className="form-input" value={d1} onChange={e=>setD1(e.target.value)}/></div>
            <div><label className="form-label">二次期限</label><input type="date" className="form-input" value={d2} onChange={e=>setD2(e.target.value)}/></div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">備考（URLも入力可）</label>
          <input className="form-input" value={note} onChange={e=>setNote(e.target.value)} placeholder="メモやURLを入力..."/>
        </div>
        <div className="form-actions">
          <button className="btn btn-cancel" onClick={onClose}>キャンセル</button>
          <button className="btn btn-primary" onClick={handleSave}>{task?"更新":"追加"}</button>
        </div>
      </div>
    </div>
  );
}
