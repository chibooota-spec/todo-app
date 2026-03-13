import { useState, useEffect, useRef, useCallback } from "react";

// viewportメタタグをより厳格に設定
if (typeof document !== "undefined") {
  let vp = document.querySelector("meta[name=viewport]");
  if (!vp) { vp = document.createElement("meta"); vp.name = "viewport"; document.head.appendChild(vp); }
  vp.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover";
}

// ===== CONFIG =====
const GAS_URL ="https://script.google.com/macros/s/AKfycbxR7Su8KWIlzSY62RKC5_wVni0wcbWtJxrC-n3-07o2j86c5Gfwa4totm5Jd92yMQAPEA/exec";
const GOOGLE_CLIENT_ID = "331300779334-m2ih2g0hg2epa9rpiu6sa1f7buje20v5.apps.googleusercontent.com";

// ===== STYLES =====
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
  
  /* 全要素のサイズ計算を内側基準に固定 */
  *, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0;
  }

  html, body { 
    width: 100%;
    /* 横方向のはみ出しを物理的にカット */
    overflow-x: hidden; 
    overflow-x: clip; 
    margin: 0;
    padding: 0;
    -webkit-text-size-adjust: 100%; 
    background: var(--bg); 
    color: var(--text); 
    font-family: 'Noto Sans JP', sans-serif; 
    min-height: 100vh;
    min-height: 100dvh;
    position: relative;
  }

  :root {
    --bg:#0f0f13; --surface:#1a1a22; --surface2:#22222e; --border:#2e2e3e;
    --accent:#7c6af7; --accent2:#f76ab0; --accent3:#6af7c8;
    --text:#e8e8f0; --text2:#9090a8; --text3:#5a5a72;
    --danger:#f76a6a; --warn:#f7c06a; --radius:12px; --radius-sm:8px;
  }

  /* アプリ全体のコンテナ：ここが画面を突き破らないようにガード */
  .app { 
    width: 100%;
    max-width: 100vw;
    max-width: 100dvw;
    margin: 0 auto; 
    padding: 0 0 80px; 
    min-height: 100vh;
    min-height: 100dvh;
    overflow-x: hidden;
    overflow-x: clip;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* 各セクションが横に膨らまないように固定 */
  .header, .tabs, .task-list, .login-screen {
    width: 100%;
    max-width: 100%;
    flex-shrink: 0;
  }

  .login-screen { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; gap:32px; }
  .login-logo { font-family:'DM Mono',monospace; font-size:32px; font-weight:500; color:var(--accent); letter-spacing:-1px; }
  .login-logo span { color:var(--accent2); }
  .login-card { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:36px 32px; width:100%; max-width:340px; text-align:center; }
  #google-signin-btn { display:flex; justify-content:center; margin-bottom:12px; min-height:44px; width:100%; max-width:280px; overflow:hidden; }
  
  .header { position:sticky; top:0; z-index:100; background:rgba(15,15,19,0.92); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); padding:16px 16px 0; }
  .header-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .logo { font-family:'DM Mono',monospace; font-size:18px; font-weight:500; color:var(--accent); letter-spacing:-0.5px; flex-shrink:0; }
  .logo span { color:var(--accent2); }
  .header-actions { display:flex; gap:8px; align-items:center; flex-shrink:1; min-width:0; }
  
  .user-badge { display:flex; align-items:center; gap:6px; background:var(--surface2); border:1px solid var(--border); border-radius:20px; padding:4px 8px 4px 4px; min-width:0; }
  .user-avatar { width:22px; height:22px; border-radius:50%; background:var(--accent); flex-shrink:0; overflow:hidden; }
  .user-avatar img { width:100%; height:100%; object-fit:cover; }
  .user-name { font-size:11px; color:var(--text2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  .month-strip { display:flex; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; gap:4px; padding-bottom:2px; }
  .month-strip::-webkit-scrollbar { display:none; }
  .month-tab { flex-shrink:0; padding:8px 12px; font-size:13px; font-weight:500; color:var(--text3); cursor:pointer; border-bottom:2px solid transparent; background:none; border-top:none; border-left:none; border-right:none; font-family:'Noto Sans JP',sans-serif; }
  .month-tab.active { color:var(--accent); border-bottom-color:var(--accent); }

  .tabs { display:flex; padding:0 16px; border-bottom:1px solid var(--border); background:var(--bg); }
  .tab { padding:12px 16px; font-size:14px; font-weight:500; color:var(--text3); cursor:pointer; border-bottom:2px solid transparent; background:none; border-top:none; border-left:none; border-right:none; font-family:'Noto Sans JP',sans-serif; display:flex; align-items:center; gap:6px; }
  .tab.active { color:var(--text); border-bottom-color:var(--accent2); }
  .tab .badge { background:var(--surface2); color:var(--text2); font-family:'DM Mono',monospace; font-size:10px; padding:1px 6px; border-radius:10px; }

  .task-list { padding:12px 16px; width:100%; }
  .task-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:12px; margin-bottom:10px; display:flex; gap:10px; align-items:flex-start; position:relative; overflow:hidden; width:100%; }
  .task-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--border); }
  .task-card.urgent::before  { background:var(--danger); }
  .task-card.warning::before { background:var(--warn); }
  .task-card.completed::before { background:var(--accent3); }

  .checkbox-wrap { display:flex; flex-direction:column; align-items:center; flex-shrink:0; width:36px; }
  .cb-label { font-size:8px; font-family:'DM Mono',monospace; color:var(--text3); margin-bottom:2px; }
  .cb { width:22px; height:22px; border:2px solid var(--border); border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; background:transparent; }
  .cb.done { background:var(--accent3); border-color:var(--accent3); }
  .cb.done::after { content:'✓'; color:#0f0f13; font-size:12px; font-weight:bold; }
  .cb.half { background:rgba(124,106,247,0.2); border-color:var(--accent); }
  .cb.half::after { content:'✓'; color:var(--accent); font-size:12px; }

  .task-body { flex:1; min-width:0; padding-right:4px; }
  .task-name { font-size:15px; font-weight:500; color:var(--text); margin-bottom:6px; word-break:break-all; line-height:1.4; }
  .task-meta { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:6px; }
  .deadline { font-family:'DM Mono',monospace; font-size:10px; padding:2px 6px; border-radius:4px; white-space:nowrap; }
  .dl-1-todo { background:rgba(124,106,247,0.1); color:var(--accent); }
  .dl-2-active { background:rgba(247,192,106,0.1); color:var(--warn); }
  
  .task-actions { display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
  .btn-sm { width:32px; height:32px; border:1px solid var(--border); background:var(--surface2); border-radius:8px; color:var(--text3); display:flex; align-items:center; justify-content:center; font-size:14px; }

  .fab { position:fixed; bottom:24px; right:20px; width:56px; height:56px; background:linear-gradient(135deg,var(--accent),var(--accent2)); border:none; border-radius:18px; color:#fff; font-size:24px; box-shadow:0 8px 24px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; z-index:200; }

  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(4px); z-index:300; display:flex; align-items:flex-end; justify-content:center; }
  .modal { background:var(--surface); width:100%; max-width:500px; border-radius:20px 20px 0 0; padding:24px 20px 40px; max-height:92vh; overflow-y:auto; }
  @media(min-width:600px){ .modal { border-radius:20px; margin:20px; } }
  
  .form-group { margin-bottom:16px; width:100%; }
  .form-input { width:100%; background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:12px; color:var(--text); font-size:16px; font-family:inherit; appearance:none; }
  .form-row { display:flex; gap:10px; width:100%; }
  .form-row > .form-group { flex:1; }

  .toast { position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:var(--surface2); border:1px solid var(--border); border-radius:20px; padding:8px 20px; font-size:13px; color:var(--text); z-index:400; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.5); }
  
  /* ローディング */
  .loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; color:var(--text2); gap:12px; }
  .spinner { width:24px; height:24px; border:3px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
`;

// ===== UTILS =====
const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const getMonthKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const formatDate = str => { if(!str)return null; const d=new Date(str); return isNaN(d)?str:`${d.getMonth()+1}/${d.getDate()}`; };

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

async function apiCall(action, payload={}, idToken=null) {
  const body = {action, ...payload};
  if(idToken) body.idToken = idToken;
  const res = await fetch("/api/gas", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  return res.json();
}

// ===== APP =====
export default function App() {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todo");
  const [activeMonth, setActiveMonth] = useState(getMonthKey(new Date()));
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [toast, setToast] = useState("");

  const monthList = buildMonthList();

  // 初期化
  useEffect(()=>{
    const saved = localStorage.getItem("todo_user");
    const savedToken = localStorage.getItem("todo_token");
    if(saved && savedToken) {
      setUser(JSON.parse(saved));
      setIdToken(savedToken);
    }
    setAuthLoading(false);
  },[]);

  // ログイン設定
  useEffect(()=>{
    if(authLoading || user) return;
    const initGoogle = () => {
      if(window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res) => {
            const payload = JSON.parse(atob(res.credential.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
            const userInfo = { email: payload.email, name: payload.name, picture: payload.picture };
            setUser(userInfo);
            setIdToken(res.credential);
            localStorage.setItem("todo_user", JSON.stringify(userInfo));
            localStorage.setItem("todo_token", res.credential);
          }
        });
      }
    };
    initGoogle();
  },[authLoading, user]);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""), 2500); };

  const loadTasks = useCallback(async(m)=>{
    if(!idToken) return;
    setLoading(true);
    try {
      const res = await apiCall("getTasks", {month:m}, idToken);
      if(res.tasks) setTasks(res.tasks);
    } catch { showToast("読込エラー"); }
    finally { setLoading(false); }
  },[idToken]);

  useEffect(()=>{ loadTasks(activeMonth); },[activeMonth, loadTasks]);

  const handleLogout = () => {
    setUser(null); setIdToken(null);
    localStorage.clear();
    showToast("ログアウトしました");
  };

  const filteredTasks = tasks.filter(t => t.month === activeMonth);
  const todoTasks = filteredTasks.filter(t => t.status !== "完了");
  const doneTasks = filteredTasks.filter(t => t.status === "完了");

  if(authLoading) return <div className="loading"><style>{style}</style><div className="spinner"/></div>;

  if(!user) return (
    <div className="login-screen">
      <style>{style}</style>
      <div className="login-logo">do<span>.</span>list</div>
      <div className="login-card">
        <button className="form-input" style={{background:"#fff", color:"#000", fontWeight:"bold"}} onClick={()=>{
          if(window.google) window.google.accounts.id.prompt();
        }}>Googleでログイン</button>
      </div>
    </div>
  );

  return (
    <div className="app">
      <style>{style}</style>
      
      <div className="header">
        <div className="header-top">
          <div className="logo">do<span>.</span>list</div>
          <div className="header-actions">
            <div className="user-badge">
              <div className="user-avatar">{user.picture && <img src={user.picture} alt=""/>}</div>
              <span className="user-name">{user.name}</span>
            </div>
            <button className="btn-icon logout" onClick={handleLogout} style={{background:"none", border:"none", color:"var(--text3)", fontSize:"18px"}}>⏻</button>
          </div>
        </div>
        <div className="month-strip">
          {monthList.map(m => (
            <button key={m.key} className={`month-tab ${activeMonth===m.key?"active":""}`} onClick={()=>setActiveMonth(m.key)}>{m.short}</button>
          ))}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab==="todo"?"active":""}`} onClick={()=>setActiveTab("todo")}>未完了 <span className="badge">{todoTasks.length}</span></button>
        <button className={`tab ${activeTab==="done"?"active":""}`} onClick={()=>setActiveTab("done")}>完了済 <span className="badge">{doneTasks.length}</span></button>
      </div>

      <div className="task-list">
        {loading ? (
          <div className="loading" style={{height:"30vh"}}><div className="spinner"/></div>
        ) : (
          (activeTab==="todo" ? todoTasks : doneTasks).map(t => (
            <TaskCard key={t.id} task={t} onEdit={()=>{setEditTask(t); setShowModal(true);}} onStatusChange={async(newStatus)=>{
              const updated = {...t, status:newStatus, completedAt:newStatus==="完了"?new Date().toISOString():""};
              setTasks(prev => prev.map(item => item.id === t.id ? updated : item));
              await apiCall("updateTask", {task:updated}, idToken);
            }}/>
          ))
        )}
      </div>

      <button className="fab" onClick={()=>{setEditTask(null); setShowModal(true);}}>＋</button>

      {showModal && <TaskModal task={editTask} onClose={()=>setShowModal(false)} onSave={async(data)=>{
        const isNew = !data.id;
        const task = isNew ? {...data, id:Date.now().toString(), status:"未対応", month:activeMonth} : data;
        setTasks(prev => isNew ? [...prev, task] : prev.map(item => item.id === task.id ? task : item));
        setShowModal(false);
        await apiCall(isNew?"addTask":"updateTask", {task}, idToken);
        showToast("保存しました");
      }}/>}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function TaskCard({task, onEdit, onStatusChange}) {
  const isOne = task.status === "一次完了";
  const isDone = task.status === "完了";
  
  return (
    <div className={`task-card ${isDone?"completed":""}`}>
      <div className="checkbox-wrap">
        <div className="cb-label">一次</div>
        <div className={`cb ${isDone||isOne?"done":""}`} onClick={()=>onStatusChange(isOne?"未対応":"一次完了")}/>
        <div style={{width:"1px", height:"4px", background:"var(--border)", margin:"2px 0"}}/>
        <div className="cb-label">二次</div>
        <div className={`cb ${isDone?"done":""} ${!isOne&&!isDone?"disabled":""}`} onClick={()=>isOne && onStatusChange("完了")}/>
      </div>
      <div className="task-body" onClick={onEdit}>
        <div className="task-name">{task.name}</div>
        <div className="task-meta">
          {task.deadline1 && <span className="deadline dl-1-todo">① {formatDate(task.deadline1)}</span>}
          {task.deadline2 && <span className="deadline dl-2-active">② {formatDate(task.deadline2)}</span>}
        </div>
      </div>
      <div className="task-actions">
        <button className="btn-sm" onClick={onEdit}>✏️</button>
      </div>
    </div>
  );
}

function TaskModal({task, onClose, onSave}) {
  const [name, setName] = useState(task?.name || "");
  const [d1, setD1] = useState(task?.deadline1 || "");
  const [d2, setD2] = useState(task?.deadline2 || "");
  const [note, setNote] = useState(task?.note || "");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="form-group">
          <label style={{fontSize:"12px", color:"var(--text3)"}}>タスク名</label>
          <input className="form-input" value={name} onChange={e=>setName(e.target.value)} autoFocus/>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label style={{fontSize:"12px", color:"var(--text3)"}}>一次期限</label>
            <input type="date" className="form-input" value={d1} onChange={e=>setD1(e.target.value)}/>
          </div>
          <div className="form-group">
            <label style={{fontSize:"12px", color:"var(--text3)"}}>二次期限</label>
            <input type="date" className="form-input" value={d2} onChange={e=>setD2(e.target.value)}/>
          </div>
        </div>
        <div className="form-group">
          <label style={{fontSize:"12px", color:"var(--text3)"}}>メモ</label>
          <textarea className="form-input" value={note} onChange={e=>setNote(e.target.value)} rows="3"/>
        </div>
        <button className="form-input" style={{background:"var(--accent)", color:"#fff", border:"none", marginTop:"10px"}} onClick={()=>onSave({...task, name, deadline1:d1, deadline2:d2, note})}>保存</button>
      </div>
    </div>
  );
}