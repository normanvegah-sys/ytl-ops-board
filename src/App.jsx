import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";


// ── Supabase ────────────────────────────────────────────────────────────────
const SUPA_URL = "https://cylukbboxdltocolmzft.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bHVrYmJveGRsdG9jb2xtemZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTcxNjUsImV4cCI6MjA4ODM5MzE2NX0.RIqeun179pozW7ph4kPWk_oKk7GpuwEDjxKkqOYJoIo";
const supabase = createClient(SUPA_URL, SUPA_KEY);

async function dbLoad(key){ 
  const {data,error}=await supabase.from("board_state").select("value").eq("key",key).single();
  if(error||!data) return null;
  return data.value;
}
async function dbSave(key,value){
  await supabase.from("board_state").upsert({key,value,updated_at:new Date().toISOString()},{onConflict:"key"});
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKS = ["Week 1","Week 2","Week 3","Week 4"];
const DESIGNERS = ["Eddy","Claus"];

const STATUSES = [
  "New Request","Working on Brief","Working on Design",
  "Under Norman's Review","Under Gia's Review","Sent to Client",
  "Changes Needed","Pending Client's Approval","Approved",
  "Ready to Deploy","Pending Last Week's Deployment","Deployed",
];
const SC = {
  "New Request":                    {bg:"#EEF2FF",text:"#4338CA",dot:"#6366F1",border:"#C7D2FE",pie:"#6366F1"},
  "Working on Brief":               {bg:"#FFF7ED",text:"#C2410C",dot:"#F97316",border:"#FED7AA",pie:"#F97316"},
  "Working on Design":              {bg:"#FFFBEB",text:"#B45309",dot:"#F59E0B",border:"#FDE68A",pie:"#F59E0B"},
  "Under Norman's Review":          {bg:"#F0FDF4",text:"#166534",dot:"#22C55E",border:"#BBF7D0",pie:"#22C55E"},
  "Under Gia's Review":             {bg:"#F0FDFA",text:"#0F766E",dot:"#14B8A6",border:"#99F6E4",pie:"#14B8A6"},
  "Sent to Client":                 {bg:"#EFF6FF",text:"#1D4ED8",dot:"#3B82F6",border:"#BFDBFE",pie:"#3B82F6"},
  "Changes Needed":                 {bg:"#FFF1F2",text:"#BE123C",dot:"#F43F5E",border:"#FECDD3",pie:"#F43F5E"},
  "Pending Client's Approval":      {bg:"#FFF8F1",text:"#92400E",dot:"#D97706",border:"#FDE68A",pie:"#FBBF24"},
  "Approved":                       {bg:"#F0FDF4",text:"#15803D",dot:"#16A34A",border:"#86EFAC",pie:"#16A34A"},
  "Ready to Deploy":                {bg:"#ECFDF5",text:"#065F46",dot:"#10B981",border:"#6EE7B7",pie:"#10B981"},
  "Pending Last Week's Deployment": {bg:"#FFF8F1",text:"#92400E",dot:"#D97706",border:"#FCD34D",pie:"#D97706"},
  "Deployed":                       {bg:"#F5F3FF",text:"#7C3AED",dot:"#8B5CF6",border:"#DDD6FE",pie:"#8B5CF6"},
};

const SM_STATUSES = [
  "Drafted","In Design","Pending Norman's Review","Pending Gia's Review",
  "Pending Content / Missing Assets","Pending Client's Approval",
  "Approved","Scheduled","Posted",
];
const SSC = {
  "Drafted":                           {bg:"#FFFBEB",text:"#B45309",dot:"#F59E0B",border:"#FDE68A",pie:"#F59E0B"},
  "In Design":                         {bg:"#F5F3FF",text:"#7C3AED",dot:"#8B5CF6",border:"#DDD6FE",pie:"#8B5CF6"},
  "Pending Norman's Review":           {bg:"#F0FDF4",text:"#166534",dot:"#22C55E",border:"#BBF7D0",pie:"#22C55E"},
  "Pending Gia's Review":              {bg:"#F0FDFA",text:"#0F766E",dot:"#14B8A6",border:"#99F6E4",pie:"#14B8A6"},
  "Pending Content / Missing Assets":  {bg:"#FFF1F2",text:"#BE123C",dot:"#F43F5E",border:"#FECDD3",pie:"#F43F5E"},
  "Pending Client's Approval":         {bg:"#FFF8F1",text:"#92400E",dot:"#D97706",border:"#FDE68A",pie:"#FBBF24"},
  "Approved":                          {bg:"#F0FDF4",text:"#15803D",dot:"#16A34A",border:"#86EFAC",pie:"#16A34A"},
  "Scheduled":                         {bg:"#EFF6FF",text:"#1D4ED8",dot:"#3B82F6",border:"#BFDBFE",pie:"#3B82F6"},
  "Posted":                            {bg:"#F0FDF4",text:"#065F46",dot:"#059669",border:"#6EE7B7",pie:"#059669"},
};


const ASSET_TYPES = ["E-blast","Postcard","Invite","WhatsApp Piece","Flyer","Brochure","Deck"];
const ASSET_TYPE_C = {
  "E-blast":       {bg:"#EEF2FF",text:"#4338CA",border:"#C7D2FE"},
  "Postcard":      {bg:"#FFF7ED",text:"#C2410C",border:"#FED7AA"},
  "Invite":        {bg:"#FDF4FF",text:"#7E22CE",border:"#E9D5FF"},
  "WhatsApp Piece":{bg:"#F0FDF4",text:"#15803D",border:"#86EFAC"},
  "Flyer":         {bg:"#FFFBEB",text:"#B45309",border:"#FDE68A"},
  "Brochure":      {bg:"#EFF6FF",text:"#1D4ED8",border:"#BFDBFE"},
  "Deck":          {bg:"#FDF4FF",text:"#86198F",border:"#F0ABFC"},
};

const SCOPE_NUM = {"Per Request":null,"2 Eblasts/MO":2,"3 Eblasts/MO":3,"4 Eblasts/MO":4,"5 Eblasts/MO":5};
const SCOPE_C   = {
  "Per Request":  {bg:"#FFF7ED",text:"#C2410C"},
  "2 Eblasts/MO": {bg:"#EEF2FF",text:"#4338CA"},
  "3 Eblasts/MO": {bg:"#F0FDF4",text:"#15803D"},
  "4 Eblasts/MO": {bg:"#EFF6FF",text:"#1D4ED8"},
  "5 Eblasts/MO": {bg:"#F5F3FF",text:"#7C3AED"},
};


// ── Client Registry ────────────────────────────────────────────────────────
// Single source of truth for all clients across all tabs.
// Each client: { id, name, type, scope, services:{email,social},
//                postingType:"regular"|"per-request",
//                postingFlags:{noFriday,stories} }
const DEFAULT_REGISTRY = [
  {id:"r-susan",   name:"Susan Trevisa",       type:"agent",     scope:"4 Eblasts/MO", services:{email:true,  social:true},  postingType:"regular",     postingFlags:{noFriday:true,  stories:false}},
  {id:"r-madelyn", name:"Madelyn Mejia",        type:"agent",     scope:"3 Eblasts/MO", services:{email:true,  social:false}, postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-vis",     name:"Visconti",             type:"agent",     scope:"2 Eblasts/MO", services:{email:true,  social:true},  postingType:"per-request", postingFlags:{noFriday:false, stories:false}},
  {id:"r-tlg",     name:"The Light Group",      type:"agent",     scope:"4 Eblasts/MO", services:{email:true,  social:true},  postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-dean",    name:"Dean Bloch",           type:"agent",     scope:"4 Eblasts/MO", services:{email:true,  social:true},  postingType:"regular",     postingFlags:{noFriday:false, stories:true}},
  {id:"r-pietro",  name:"Pietro Belmonte",      type:"agent",     scope:"5 Eblasts/MO", services:{email:true,  social:true},  postingType:"regular",     postingFlags:{noFriday:true,  stories:false}},
  {id:"r-edge",    name:"Edge House Miami",     type:"developer", scope:"4 Eblasts/MO", services:{email:true,  social:false}, postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-chanel",  name:"Chanel Hunter Milian", type:"agent",     scope:"Per Request",  services:{email:true,  social:false}, postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-joe",     name:"Joe Schafer",          type:"agent",     scope:"4 Eblasts/MO", services:{email:true,  social:false}, postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-shawn",   name:"Shawn Clarke",         type:"agent",     scope:"4 Eblasts/MO", services:{email:true,  social:true},  postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-river",   name:"River District 14",    type:"developer", scope:"4 Eblasts/MO", services:{email:true,  social:false}, postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-vsg",     name:"Vecchi Stoka",         type:"agent",     scope:"2 Eblasts/MO", services:{email:true,  social:true},  postingType:"regular",     postingFlags:{noFriday:true,  stories:false}},
  {id:"r-paul",    name:"Paul Basile",          type:"agent",     scope:"3 Eblasts/MO", services:{email:true,  social:true},  postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-daniel",  name:"Daniel Novela",        type:"agent",     scope:"Per Request",  services:{email:true,  social:false}, postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-joseph",  name:"Joseph",               type:"agent",     scope:"Per Request",  services:{email:false, social:true},  postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-kane",    name:"Kane",                 type:"agent",     scope:"Per Request",  services:{email:false, social:true},  postingType:"per-request", postingFlags:{noFriday:false, stories:false}},
  {id:"r-trc",     name:"TRC",                  type:"agent",     scope:"Per Request",  services:{email:false, social:true},  postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-72c",     name:"72 Carlyle",           type:"developer", scope:"Per Request",  services:{email:false, social:true},  postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-rd14",    name:"RD14",                 type:"developer", scope:"Per Request",  services:{email:false, social:true},  postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
  {id:"r-ritz",    name:"Ritz Carlton SB",      type:"developer", scope:"Per Request",  services:{email:false, social:true},  postingType:"regular",     postingFlags:{noFriday:false, stories:false}},
];

const EB_DEFAULTS = [
  {id:"susan",   name:"Susan Trevisa",       scope:"4 Eblasts/MO"},
  {id:"madelyn", name:"Madelyn Mejia",        scope:"3 Eblasts/MO"},
  {id:"vis",     name:"Visconti",             scope:"2 Eblasts/MO"},
  {id:"tlg",     name:"The Light Group",      scope:"4 Eblasts/MO"},
  {id:"dean",    name:"Dean Bloch",           scope:"4 Eblasts/MO"},
  {id:"pietro",  name:"Pietro Belmonte",      scope:"5 Eblasts/MO"},
  {id:"edge",    name:"Edge House Miami",     scope:"4 Eblasts/MO"},
  {id:"chanel",  name:"Chanel Hunter Milian", scope:"Per Request"},
  {id:"joe",     name:"Joe Schafer",          scope:"4 Eblasts/MO"},
  {id:"shawn",   name:"Shawn Clarke",         scope:"4 Eblasts/MO"},
  {id:"river",   name:"River District 14",    scope:"4 Eblasts/MO"},
  {id:"vsg",     name:"Vecchi Stoka",         scope:"2 Eblasts/MO"},
  {id:"paul",    name:"Paul Basile",          scope:"3 Eblasts/MO"},
  {id:"daniel",  name:"Daniel Novela",        scope:"Per Request"},
];

const SM_AGENTS = [
  {id:"smd",  name:"Dean",         note:"3 posts + 2 stories/wk"},
  {id:"smj",  name:"Joseph",       note:"3 posts/wk"},
  {id:"smk",  name:"Kane",         note:""},
  {id:"smp",  name:"Paul",         note:""},
  {id:"smpi", name:"Pietro",       note:""},
  {id:"sms",  name:"Shawn Clarke", note:""},
  {id:"smsu", name:"Susan",        note:""},
  {id:"smtl", name:"TLG",          note:""},
  {id:"smtr", name:"TRC",          note:""},
  {id:"smv",  name:"Visconti",     note:""},
  {id:"smvg", name:"VSG",          note:""},
];
const SM_DEVS = [
  {id:"sm72", name:"72 Carlyle",      note:""},
  {id:"smrd", name:"RD14",            note:""},
  {id:"smrz", name:"Ritz Carlton SB", note:""},
];

let _id = 0;
function uid() { return "u"+(++_id)+Math.random().toString(36).slice(2,5); }
function newEblast(designers)  { return {id:uid(),name:"",assetType:"E-blast",status:"New Request",designer:(designers&&designers[0])||"Eddy",monStr:"",friStr:"",thuStr:"",deployDay:"",urgent:false,note:""}; }
function newSmPost()    { return {id:uid(),name:"",status:"Drafted",needsDesign:false,urgent:false}; }
function newSmBatch(w)  { return {id:uid(),week:w,status:"Drafted",startDate:"",endDate:"",posts:[]}; }

function buildEbData(registry) {
  const src = registry ? registry.filter(c=>c.services?.email) : EB_DEFAULTS;
  const d={};
  MONTHS.forEach((_,mi)=>{
    d[mi]=src.map(c=>({clientId:c.id+mi,clientName:c.name,scope:c.scope||"Per Request",expanded:false,eblasts:[newEblast()]}));
  });
  return d;
}
function buildSmData(registry) {
  const src = registry ? registry.filter(c=>c.services?.social) : [...SM_AGENTS.map(a=>({...a,smType:"agent"})),...SM_DEVS.map(d=>({...d,smType:"dev"}))];
  const d={};
  MONTHS.forEach((_,mi)=>{
    d[mi]=src.map(c=>({clientId:c.id+mi,clientName:c.name,note:c.note||"",type:c.type==="agent"||c.smType==="agent"?"agent":"dev",expanded:false,batches:WEEKS.map(w=>newSmBatch(w))}));
  });
  return d;
}

function fmtRange(s,e){
  if(s&&e) return `${s} – ${e}`;
  return s||e||null;
}



// Terminal state depends on asset type
function isAssetDone(status, assetType){
  if(assetType==="E-blast"||!assetType) return status==="Deployed";
  return status==="Approved"||status==="Deployed";
}
// Statuses available per asset type
function statusesForType(assetType){
  if(assetType==="E-blast"||!assetType) return STATUSES;
  return STATUSES.filter(s=>s!=="Ready to Deploy");
}

// ── Week helpers ────────────────────────────────────────────────────────────
// Get the 4 Mon-Fri production weeks for a given month index
function getMonthWeeks(monthIdx, year){
  const yr = year || new Date().getFullYear();
  const weeks = [];
  // Find the Monday of the week containing the 1st of the month
  // (may be in the previous month — e.g. Apr 1 is Wed, so week starts Mar 30)
  const first = new Date(yr, monthIdx, 1);
  const dow = first.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const daysBack = dow === 0 ? 6 : dow - 1; // how many days back to Monday
  let d = new Date(yr, monthIdx, 1 - daysBack);
  for(let w=0; w<4; w++){
    const mon = new Date(d);
    const fri = new Date(d.getFullYear(), d.getMonth(), d.getDate()+4);
    const thu = new Date(d.getFullYear(), d.getMonth(), d.getDate()+3);
    weeks.push({ mon, fri, thu });
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate()+7);
  }
  return weeks;
}
function fmtWeekLabel(mon, fri){
  if(!mon||!fri) return "Pick week";
  const mo = mon.toLocaleDateString("en-US",{month:"short"});
  const fm = fri.getMonth()!==mon.getMonth();
  return `${mo} ${mon.getDate()}–${fm?fri.toLocaleDateString("en-US",{month:"short"})+" ":""}${fri.getDate()}`;
}
function isSameDate(a,b){ return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function dateToStr(d){ if(!d) return ""; return d.toISOString().slice(0,10); }
function strToDate(s){ if(!s) return null; const p=s.split("-"); return p.length===3?new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2])):null; }

// ── Shared UI ──────────────────────────────────────────────────────────────
function ScopeBadge({scope}){
  if(!scope) return null;
  const c=SCOPE_C[scope]||{bg:"#F3F4F6",text:"#6B7280"};
  return <span style={{background:c.bg,color:c.text,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{scope}</span>;
}

function TTip({active,payload}){
  if(!active||!payload?.length) return null;
  const d=payload[0];
  return <div style={{background:"#1a1a2e",color:"#fff",padding:"8px 14px",borderRadius:8,fontSize:12,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 16px rgba(0,0,0,.2)"}}><div style={{fontWeight:700}}>{d.name}</div><div style={{color:"#C4BFBA",marginTop:2}}>{d.value} item{d.value!==1?"s":""}</div></div>;
}

function PieLabel({cx,cy,midAngle,innerRadius,outerRadius,percent}){
  if(percent<0.05) return null;
  const R=Math.PI/180,r=innerRadius+(outerRadius-innerRadius)*0.6;
  return <text x={cx+r*Math.cos(-midAngle*R)} y={cy+r*Math.sin(-midAngle*R)} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>{Math.round(percent*100)}%</text>;
}



function AssetTypeBadge({type}){
  const s = ASSET_TYPE_C[type]||{bg:"#F3F4F6",text:"#6B7280",border:"#E5E7EB"};
  return <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,border:`1px solid ${s.border}`,color:s.text,background:s.bg,whiteSpace:"nowrap"}}>{type||"E-blast"}</span>;
}

function SearchBar({value, onChange, placeholder}){
  return (
    <div style={{position:"relative",flex:"1 1 180px",maxWidth:280}}>
      <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none",color:"#9CA3AF"}}>🔍</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Search clients..."} style={{width:"100%",paddingLeft:32,paddingRight:value?28:10,paddingTop:7,paddingBottom:7,border:"1.5px solid #E5E2DC",borderRadius:8,fontSize:12.5,fontFamily:"'DM Sans',sans-serif",color:"#1a1a2e",background:"#fff",outline:"none",boxSizing:"border-box"}}/>
      {value&&<button onClick={()=>onChange("")} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",fontSize:13,lineHeight:1,padding:0}}>✕</button>}
    </div>
  );
}

function AZBtn({sorted,onToggle}){
  return <button onClick={onToggle} style={{background:sorted?"#1a1a2e":"#F0EEE9",color:sorted?"#fff":"#6B6860",border:"none",borderRadius:7,padding:"7px 13px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>A–Z {sorted?"✓":"↕"}</button>;
}

function SubTabs({options,active,onChange}){
  return <div style={{display:"flex",background:"#F0EEE9",borderRadius:10,padding:4,width:"fit-content"}}>{options.map((o,i)=><button key={o} onClick={()=>onChange(i)} style={{background:active===i?"#fff":"transparent",border:"none",borderRadius:7,padding:"7px 18px",cursor:"pointer",fontSize:12.5,fontFamily:"'DM Sans',sans-serif",fontWeight:active===i?700:500,color:active===i?"#1a1a2e":"#9CA3AF",boxShadow:active===i?"0 1px 4px rgba(0,0,0,.1)":"none",transition:"all .15s",whiteSpace:"nowrap"}}>{o}</button>)}</div>;
}

function MonthSidebar({months,active,setActive,getData}){
  return (
    <div style={{width:130,flexShrink:0,background:"#F8F7F4",borderRight:"1px solid #E5E2DC",overflowY:"auto",padding:"6px 0"}}>
      {months.map((m,i)=>{
        const {top,bot}=getData(i);
        return <button key={m} onClick={()=>setActive(i)} style={{width:"100%",textAlign:"left",padding:"8px 13px",background:active===i?"#fff":"transparent",borderLeft:active===i?"3px solid #1a1a2e":"3px solid transparent",border:"none",cursor:"pointer",fontSize:12.5,fontFamily:"'DM Sans',sans-serif",fontWeight:active===i?700:500,color:active===i?"#1a1a2e":"#6B6860"}}>{m}<span style={{display:"block",fontSize:10,color:"#9CA3AF",fontWeight:400,marginTop:1}}>{top}/{bot}</span></button>;
      })}
    </div>
  );
}

function EmptyMsg({msg,onAdd}){
  return <div style={{textAlign:"center",padding:"44px 20px",color:"#9CA3AF",fontFamily:"'DM Sans',sans-serif",fontSize:14,background:"#FAFAF9",borderRadius:12,border:"2px dashed #E5E2DC"}}><div style={{fontSize:30,marginBottom:8}}>📭</div>{msg}{onAdd&&<><br/><button onClick={onAdd} style={{marginTop:10,background:"none",border:"none",color:"#6366F1",fontWeight:700,cursor:"pointer",fontSize:13}}>+ Add first client</button></>}</div>;
}

function ComingSoon({label}){
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:12,color:"#9CA3AF",fontFamily:"'DM Sans',sans-serif"}}><div style={{fontSize:40}}>🚧</div><div style={{fontSize:18,fontWeight:700,color:"#374151",fontFamily:"'DM Serif Display',serif"}}>{label}</div><div style={{fontSize:13}}>Coming soon</div></div>;
}


function WeekPicker({monStr, friStr, deployDay, monthIdx, openId, pickerId, setOpenId, onChange}){
  const isOpen = openId === pickerId;
  const year = new Date().getFullYear();
  const weeks = getMonthWeeks(monthIdx, year);
  const mon = strToDate(monStr), fri = strToDate(friStr);
  const label = mon && fri ? fmtWeekLabel(mon, fri) : "Pick week";
  const hasWeek = !!monStr;

  // Calendar state for browsing
  const [calMonth, setCalMonth] = useState(()=>new Date(year, monthIdx, 1));
  const yr=calMonth.getFullYear(), mo=calMonth.getMonth();
  const firstDay=new Date(yr,mo,1).getDay(), daysInMonth=new Date(yr,mo+1,0).getDate();

  function pickDay(d){
    // Find which Mon-Fri week this day belongs to
    const dow = d.getDay();
    const dMon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (dow===0?6:dow-1));
    const dFri = new Date(dMon.getFullYear(), dMon.getMonth(), dMon.getDate()+4);
    const dThu = new Date(dMon.getFullYear(), dMon.getMonth(), dMon.getDate()+3);
    onChange({ monStr: dateToStr(dMon), friStr: dateToStr(dFri), thuStr: dateToStr(dThu) });
    setOpenId(null);
  }

  function isInSelectedWeek(d){
    if(!mon||!fri) return false;
    return d >= mon && d <= fri;
  }
  function isMonday(d){ return d.getDay()===1; }
  function isFriday(d){ return d.getDay()===5; }
  function isWeekend(d){ return d.getDay()===0||d.getDay()===6; }

  const days = [];
  for(let i=0;i<firstDay;i++) days.push(null);
  for(let i=1;i<=daysInMonth;i++) days.push(new Date(yr,mo,i));

  return (
    <div onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <button onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setCalMonth(new Date(year,monthIdx,1));setOpenId(isOpen?null:pickerId);}}
          style={{display:"flex",alignItems:"center",gap:5,border:`1.5px solid ${isOpen?"#6366F1":hasWeek?"#C4B5FD":"#E5E2DC"}`,borderRadius:7,padding:"4px 9px",background:isOpen?"#EEF2FF":hasWeek?"#F5F3FF":"#FAFAF9",cursor:"pointer",fontSize:11,fontWeight:hasWeek?700:400,color:hasWeek?"#6D28D9":"#9CA3AF",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
          📅 {label}
        </button>
        {hasWeek&&(
          <div style={{display:"flex",gap:3}}>
            {["Thu","Fri"].map(day=>(
              <button key={day} onClick={()=>onChange({monStr,friStr,thuStr:deployDay===day?"":deployDay,deployDay:deployDay===day?"":day})}
                style={{border:`1.5px solid ${deployDay===day?"#6D28D9":"#E5E2DC"}`,borderRadius:6,padding:"2px 7px",fontSize:10.5,fontWeight:700,cursor:"pointer",background:deployDay===day?"#6D28D9":"#FAFAF9",color:deployDay===day?"#fff":"#9CA3AF"}}>
                {day}
              </button>
            ))}
            <button onClick={()=>onChange({monStr:"",friStr:"",thuStr:"",deployDay:""})} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:11,padding:"1px 3px"}} onMouseEnter={e=>e.currentTarget.style.color="#F43F5E"} onMouseLeave={e=>e.currentTarget.style.color="#D1D5DB"}>✕</button>
          </div>
        )}
      </div>
      {isOpen&&(
        <div style={{position:"fixed",zIndex:9999,background:"#fff",borderRadius:12,border:"1px solid #E5E2DC",boxShadow:"0 8px 32px rgba(0,0,0,.15)",padding:"14px 16px",width:268,fontFamily:"'DM Sans',sans-serif"}}
          ref={el=>{if(el){const r=el.previousSibling?.getBoundingClientRect?.();if(r){
            const calH=el.offsetHeight||480;
            const spaceBelow=window.innerHeight-(r.bottom+6);
            if(spaceBelow<calH&&r.top>calH){
              el.style.top=(r.top-calH-6)+"px"; // flip above
            } else {
              el.style.top=(r.bottom+6)+"px"; // default below
            }
            // keep within horizontal bounds
            const calW=268;
            const leftPos=Math.min(r.left, window.innerWidth-calW-8);
            el.style.left=Math.max(8,leftPos)+"px";
          }}}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:"#6B7280",padding:"2px 6px"}}>‹</button>
            <span style={{fontSize:12.5,fontWeight:700,color:"#1a1a2e"}}>{calMonth.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</span>
            <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))} style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:"#6B7280",padding:"2px 6px"}}>›</button>
          </div>
          <div style={{fontSize:10,color:"#9CA3AF",textAlign:"center",marginBottom:8}}>Click any day to select its Mon–Fri week</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:4}}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:9.5,fontWeight:700,color:d==="Mo"||d==="Tu"||d==="We"?"#6366F1":d==="Th"||d==="Fr"?"#8B5CF6":"#D1D5DB",padding:"2px 0"}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1}}>
            {days.map((d,i)=>{
              if(!d) return <div key={"e"+i}/>;
              const inSel = isInSelectedWeek(d);
              const isWknd = isWeekend(d);
              const isMon2 = isMonday(d), isFri2 = isFriday(d);
              const isToday2 = isSameDate(d, new Date());
              return (
                <button key={i} onClick={()=>!isWknd&&pickDay(d)}
                  style={{textAlign:"center",padding:"5px 2px",border:"none",cursor:isWknd?"default":"pointer",fontSize:12,
                    fontWeight:inSel?700:400,
                    background:inSel?"#EEF2FF":"transparent",
                    color:inSel?(isMon2||isFri2?"#4338CA":"#6366F1"):isWknd?"#E5E2DC":isToday2?"#6366F1":"#374151",
                    borderRadius:isMon2?"6px 0 0 6px":isFri2?"0 6px 6px 0":inSel?"0":"6px",
                    outline:isToday2?"2px solid #C7D2FE":"none",outlineOffset:"-2px",
                    opacity:isWknd?0.4:1
                  }}>
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:4}}>
            <div style={{fontSize:10,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.06em"}}>This month's weeks</div>
            {weeks.map((wk,i)=>{
              const sel = monStr===dateToStr(wk.mon);
              return (
                <button key={i} onClick={()=>{onChange({monStr:dateToStr(wk.mon),friStr:dateToStr(wk.fri),thuStr:dateToStr(wk.thu),deployDay:""});setOpenId(null);}}
                  style={{textAlign:"left",padding:"5px 10px",borderRadius:7,border:`1px solid ${sel?"#6D28D9":"#E5E2DC"}`,background:sel?"#F5F3FF":"#FAFAF9",cursor:"pointer",fontSize:11.5,fontWeight:sel?700:500,color:sel?"#6D28D9":"#374151",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>Week {i+1} — {fmtWeekLabel(wk.mon,wk.fri)}</span>
                  {sel&&<span style={{fontSize:10,color:"#8B5CF6"}}>✓ selected</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


function DesignerManager({designers, onSave, onClose}){
  const [list, setList] = useState([...designers]);
  const [newName, setNewName] = useState("");
  function add(){ const n=newName.trim(); if(!n||list.includes(n)) return; setList(p=>[...p,n]); setNewName(""); }
  function remove(d){ if(list.length<=1) return; setList(p=>p.filter(x=>x!==d)); }
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,padding:"24px 28px",width:340,boxShadow:"0 20px 60px rgba(0,0,0,.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <h3 style={{margin:0,fontSize:16,fontFamily:"'DM Serif Display',serif",color:"#1a1a2e"}}>Manage Designers</h3>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#9CA3AF"}}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {list.map(d=>(
            <div key={d} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#FAFAF9",borderRadius:8,padding:"9px 12px",border:"1px solid #E5E2DC"}}>
              <span style={{fontSize:13.5,fontWeight:600,color:"#1a1a2e",fontFamily:"'DM Sans',sans-serif"}}>{d}</span>
              <button onClick={()=>remove(d)} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:14,lineHeight:1,padding:"2px 4px"}} onMouseEnter={e=>e.currentTarget.style.color="#F43F5E"} onMouseLeave={e=>e.currentTarget.style.color="#D1D5DB"}>✕</button>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add designer name..." style={{flex:1,border:"1.5px solid #E5E2DC",borderRadius:8,padding:"7px 10px",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:"#1a1a2e",outline:"none"}}/>
          <button onClick={add} style={{background:"#1a1a2e",color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:700}}>+</button>
        </div>
        <button onClick={()=>onSave(list)} style={{width:"100%",background:"#1a1a2e",color:"#fff",border:"none",borderRadius:10,padding:"10px",cursor:"pointer",fontSize:13.5,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Save</button>
      </div>
    </div>
  );
}


// ── Report Generator ────────────────────────────────────────────────────────
function generateReport(clients, month, designers, weekInfo){
  const today = new Date(); today.setHours(0,0,0,0);
  const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"][month];
  const generated = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

  const allAssets = [];
  clients.forEach(c=>c.eblasts.forEach(e=>allAssets.push({...e,clientName:c.clientName})));

  // Filter to week if provided
  let scopeAssets = allAssets;
  let reportPeriod = monthName + " — Monthly Report";
  if(weekInfo){
    const wkStr = dateToStr(weekInfo.mon);
    scopeAssets = allAssets.filter(e=>e.monStr===wkStr);
    reportPeriod = `Week ${weekInfo.idx+1} · ${fmtWeekLabel(weekInfo.mon, weekInfo.fri)}`;
  }

  const tot = scopeAssets.length;
  const dep = scopeAssets.filter(e=>isAssetDone(e.status,e.assetType)).length;
  const overdue = scopeAssets.filter(e=>{const f=strToDate(e.friStr);return f&&f<today&&e.deployDay&&!isAssetDone(e.status,e.assetType);});
  const urgent = scopeAssets.filter(e=>e.urgent);

  // Group by status
  const active = STATUSES.filter(s=>s!=="Deployed");
  const grouped = {};
  STATUSES.forEach(s=>{grouped[s]=[];});
  scopeAssets.forEach(e=>grouped[e.status].push(e));

  // Designer counts
  const dCounts = {};
  designers.forEach(d=>{dCounts[d]={total:0,deployed:0};});
  scopeAssets.forEach(e=>{if(dCounts[e.designer]){dCounts[e.designer].total++;if(isAssetDone(e.status,e.assetType))dCounts[e.designer].deployed++;}});

  const statusColors = {
    "New Request":"#6366F1","Working on Brief":"#F97316","Working on Design":"#F59E0B",
    "Under Norman's Review":"#22C55E","Under Gia's Review":"#14B8A6","Sent to Client":"#3B82F6",
    "Changes Needed":"#F43F5E","Pending Client's Approval":"#FBBF24","Approved":"#16A34A",
    "Ready to Deploy":"#10B981","Pending Last Week's Deployment":"#D97706","Deployed":"#8B5CF6",
  };

  function assetRow(e){
    const friD = strToDate(e.friStr);
    const isOvd = friD&&friD<today&&e.deployDay&&!isAssetDone(e.status,e.assetType);
    const weekLabel = e.monStr&&e.friStr ? fmtWeekLabel(strToDate(e.monStr),strToDate(e.friStr)) : "—";
    const deploy = e.deployDay ? ` · ${e.deployDay}` : "";
    return `<tr style="border-bottom:1px solid #f0ede8;${isOvd?"background:#fff5f5":""}">
      <td style="padding:7px 10px;font-size:12px;font-weight:600;color:#1a1a2e">${e.name||"<em style='color:#ccc'>Unnamed</em>"}</td>
      <td style="padding:7px 10px;font-size:11px;color:#6b7280">${e.clientName}</td>
      <td style="padding:7px 10px"><span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:#f5f3ff;color:#6d28d9">${weekLabel}${deploy}</span></td>
      <td style="padding:7px 10px;font-size:11px;color:#6b7280">${e.designer||"—"}</td>
      <td style="padding:7px 10px">${isOvd?'<span style="font-size:10px;font-weight:700;color:#dc2626;background:#fee2e2;padding:2px 8px;border-radius:20px">OVERDUE</span>':""}</td>
    </tr>`;
  }

  function statusSection(status){
    const items = grouped[status];
    if(!items||!items.length) return "";
    const color = statusColors[status]||"#9ca3af";
    const rows = items.map(assetRow).join("");
    return `
      <div style="margin-bottom:20px;border-radius:10px;overflow:hidden;border:1px solid #e5e2dc;break-inside:avoid">
        <div style="padding:10px 16px;background:${color}18;border-bottom:1px solid ${color}30;display:flex;align-items:center;gap:8px">
          <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block"></span>
          <span style="font-size:13px;font-weight:700;color:${color}">${status}</span>
          <span style="font-size:11px;font-weight:700;color:${color};background:rgba(255,255,255,.6);border-radius:20px;padding:1px 10px;margin-left:auto">${items.length}</span>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:#fafaf9">
            <th style="padding:6px 10px;font-size:9.5px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;text-align:left">Asset</th>
            <th style="padding:6px 10px;font-size:9.5px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;text-align:left">Client</th>
            <th style="padding:6px 10px;font-size:9.5px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;text-align:left">Week</th>
            <th style="padding:6px 10px;font-size:9.5px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;text-align:left">Designer</th>
            <th style="padding:6px 10px"></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  const overdueBlock = overdue.length ? `
    <div style="margin-bottom:24px;border-radius:10px;border:1.5px solid #fca5a5;overflow:hidden;break-inside:avoid">
      <div style="padding:10px 16px;background:#fff1f2;border-bottom:1px solid #fca5a5">
        <span style="font-size:13px;font-weight:800;color:#dc2626">⚠️ Overdue (${overdue.length})</span>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <tbody>${overdue.map(e=>{
          const daysOver=Math.floor((today-strToDate(e.friStr))/(1000*60*60*24));
          return `<tr style="border-bottom:1px solid #fee2e2;background:#fff5f5">
            <td style="padding:7px 10px;font-size:12px;font-weight:600;color:#dc2626">${e.name||"Unnamed"}</td>
            <td style="padding:7px 10px;font-size:11px;color:#6b7280">${e.clientName}</td>
            <td style="padding:7px 10px;font-size:11px;color:#dc2626;font-weight:700">${daysOver} day${daysOver!==1?"s":""} overdue</td>
            <td style="padding:7px 10px;font-size:11px;color:#9ca3af">${e.status}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>` : "";

  const designerBlock = `
    <div style="margin-bottom:24px;display:flex;gap:12px;flex-wrap:wrap">
      ${designers.map(d=>{
        const dc=dCounts[d]||{total:0,deployed:0};
        const pct=dc.total?Math.round((dc.deployed/dc.total)*100):0;
        return `<div style="flex:1;min-width:140px;border:1px solid #e5e2dc;border-radius:10px;padding:14px 16px">
          <div style="font-size:15px;font-weight:800;color:#1a1a2e;margin-bottom:4px">${d}</div>
          <div style="font-size:11px;color:#9ca3af;margin-bottom:8px">${dc.total} assets · ${dc.deployed} deployed</div>
          <div style="height:4px;background:#f0eee9;border-radius:2px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:#8b5cf6;border-radius:2px"></div>
          </div>
          <div style="font-size:10px;color:#9ca3af;margin-top:4px">${pct}% deployed</div>
        </div>`;
      }).join("")}
    </div>`;

  const activeStatuses = active.filter(s=>grouped[s]&&grouped[s].length>0);
  const deployedBlock = grouped["Deployed"]&&grouped["Deployed"].length ? statusSection("Deployed") : "";

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>YTL Creative — ${reportPeriod}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:#fff;color:#1a1a2e;padding:40px;max-width:900px;margin:0 auto;}
  @media print{body{padding:20px;}@page{margin:15mm;}}
</style>
</head><body>
  <!-- Header -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #1a1a2e">
    <div>
      <div style="font-family:'DM Serif Display',serif;font-size:26px;color:#1a1a2e;margin-bottom:2px">YTL CRE<em>ATIVE</em></div>
      <div style="font-size:12px;color:#9ca3af;letter-spacing:.04em">Marketing Operations Board</div>
    </div>
    <div style="text-align:right">
      <div style="font-family:'DM Serif Display',serif;font-size:22px;color:#1a1a2e">${reportPeriod}</div>
      <div style="font-size:11px;color:#9ca3af;margin-top:2px">Generated ${generated}</div>
    </div>
  </div>

  <!-- Summary stats -->
  <div style="display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap">
    ${[
      {l:"Total Assets",v:tot,c:"#1a1a2e"},
      {l:"Deployed",v:dep,c:"#8b5cf6"},
      {l:"In Progress",v:tot-dep,c:"#6366F1"},
      {l:"Overdue",v:overdue.length,c:overdue.length?"#dc2626":"#16a34a"},
      {l:"Urgent",v:urgent.length,c:urgent.length?"#be123c":"#9ca3af"},
    ].map(s=>`<div style="flex:1;min-width:100px;text-align:center;border:1px solid #e5e2dc;border-radius:10px;padding:12px 8px">
      <div style="font-size:24px;font-weight:800;color:${s.c};font-family:'DM Serif Display',serif">${s.v}</div>
      <div style="font-size:10px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-top:2px">${s.l}</div>
    </div>`).join("")}
  </div>

  <!-- Overdue -->
  ${overdueBlock}

  <!-- Designer workload -->
  <div style="font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Designer Workload</div>
  ${designerBlock}

  <!-- Active pipeline -->
  <div style="font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">Active Pipeline</div>
  ${activeStatuses.map(statusSection).join("")}

  <!-- Deployed -->
  ${grouped["Deployed"]&&grouped["Deployed"].length?`<div style="font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px;margin-top:8px">Deployed (${grouped["Deployed"].length})</div>${deployedBlock}`:""}

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e2dc;font-size:10px;color:#c4bfba;text-align:center">
    YTL Creative · Marketing Operations Board · ${generated}
  </div>
</body></html>`;

  const win = window.open("","_blank");
  win.document.write(html);
  win.document.close();
  setTimeout(()=>win.print(), 600);
}


const GIA_EMAIL = "Gianella@ytlcreative.com";
const NORMAN_EMAIL = "norman@ytlcreative.com";

function getWeekForDate(d, monthIdx){
  const year = d.getFullYear();
  const weeks = getMonthWeeks(monthIdx, year);
  const ds = dateToStr(d);
  for(let i=0;i<weeks.length;i++){
    const wk = weeks[i];
    const mon = dateToStr(wk.mon);
    const fri = dateToStr(wk.fri);
    if(ds >= mon && ds <= fri) return {wk, idx:i};
  }
  return {wk: weeks[weeks.length-1], idx: weeks.length-1};
}

function buildEmailBody(clients, reportType, weekInfo, monthName, designers){
  const today = new Date(); today.setHours(0,0,0,0);

  const allAssets = [];
  clients.forEach(c=>c.eblasts.forEach(e=>allAssets.push({...e,clientName:c.clientName})));

  // Filter assets for the relevant scope
  let scopeAssets = allAssets;
  let periodLabel = "";

  if(reportType === "weekly" && weekInfo){
    const wkStr = dateToStr(weekInfo.mon);
    scopeAssets = allAssets.filter(e=>e.monStr===wkStr);
    periodLabel = `Week ${weekInfo.idx+1} · ${fmtWeekLabel(weekInfo.mon, weekInfo.fri)}`;
  } else {
    periodLabel = `${monthName} — Monthly Summary`;
  }

  // Group by status
  const grouped = {};
  STATUSES.forEach(s=>{grouped[s]=[];});
  scopeAssets.forEach(e=>grouped[e.status].push(e));

  const tot = scopeAssets.length;
  const dep = scopeAssets.filter(e=>isAssetDone(e.status,e.assetType)).length;
  const overdueAssets = scopeAssets.filter(e=>{
    const f=strToDate(e.friStr);
    return f&&f<today&&e.deployDay&&!isAssetDone(e.status,e.assetType);
  });

  // Designer counts
  const dCounts = {};
  designers.forEach(d=>{dCounts[d]={total:0,deployed:0};});
  scopeAssets.forEach(e=>{
    if(dCounts[e.designer]){
      dCounts[e.designer].total++;
      if(isAssetDone(e.status,e.assetType)) dCounts[e.designer].deployed++;
    }
  });

  let body = `Dear Gia,

`;
  body += reportType==="weekly"
    ? `Here's this week's pipeline update for ${periodLabel}.

`
    : `Here's the end-of-month summary for ${periodLabel}.

`;

  body += `OVERVIEW
`;
  body += `────────────────────────────────
`;
  body += `Total assets: ${tot}
`;
  body += `Completed: ${dep}
`;
  body += `In progress: ${tot-dep}
`;
  if(overdueAssets.length) body += `⚠️ Overdue: ${overdueAssets.length}
`;
  body += `
`;

  // Overdue section first — most urgent
  if(overdueAssets.length){
    body += `⚠️ OVERDUE (${overdueAssets.length})
`;
    body += `────────────────────────────────
`;
    overdueAssets.forEach(e=>{
      const daysOver = Math.floor((today-strToDate(e.friStr))/(1000*60*60*24));
      body += `• ${e.clientName} — ${e.name||"Unnamed"} [${e.assetType||"E-blast"}] — ${daysOver} day${daysOver!==1?"s":""} overdue — Currently: ${e.status}
`;
    });
    body += `
`;
  }

  // Status sections — skip empty ones
  const activeSections = STATUSES.filter(s=>grouped[s]&&grouped[s].length>0);
  activeSections.forEach(status=>{
    const items = grouped[status];
    body += `${status.toUpperCase()} (${items.length})
`;
    body += `────────────────────────────────
`;
    items.forEach(e=>{
      const friD = strToDate(e.friStr);
      const isOvd = friD&&friD<today&&e.deployDay&&!isAssetDone(e.status,e.assetType);
      const weekLbl = e.monStr ? fmtWeekLabel(strToDate(e.monStr),strToDate(e.friStr)) : "No week set";
      const deploy = e.deployDay ? ` · Deploy ${e.deployDay}` : "";
      const urgFlag = e.urgent ? " 🚨 URGENT" : "";
      const ovdFlag = isOvd ? " ⚠️ OVERDUE" : "";
      body += `• ${e.clientName} — ${e.name||"Unnamed"} [${e.assetType||"E-blast"}] — ${weekLbl}${deploy} — ${e.designer}${urgFlag}${ovdFlag}
`;
    });
    body += `
`;
  });

  // Designer summary
  body += `DESIGNER WORKLOAD
`;
  body += `────────────────────────────────
`;
  designers.forEach(d=>{
    const dc = dCounts[d]||{total:0,deployed:0};
    body += `${d}: ${dc.total} assets · ${dc.deployed} completed
`;
  });
  body += `
`;

  body += `Best,
Norman
`;
  body += `
— Sent from YTL Creative Marketing Operations Board`;

  return {body, periodLabel};
}

function sendEmailReport(clients, reportType, weekInfo, monthIdx, designers){
  const monthName = MONTHS[monthIdx];
  const {body, periodLabel} = buildEmailBody(clients, reportType, weekInfo, monthIdx, monthName, designers);
  const subject = reportType==="weekly"
    ? `YTL Creative — Pipeline Update · ${periodLabel}`
    : `YTL Creative — ${monthName} Monthly Report`;
  // Trim body if too long — mailto silently fails above ~2000 chars on most clients
  const MAX = 1800;
  const finalBody = body.length > MAX
    ? body.substring(0, MAX) + "\n\n[Full report truncated. See attached PDF for complete details.]"
    : body;
  const mailto = `mailto:${GIA_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalBody)}`;
  // Hidden anchor click is the most reliable cross-browser mailto trigger
  const a = document.createElement("a");
  a.href = mailto;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>document.body.removeChild(a), 200);
}


function ReportModal({clients, month, designers, onClose}){
  const today = new Date();
  const monthWeeks = getMonthWeeks(month, today.getFullYear());
  const {wk: currentWk, idx: currentWkIdx} = getWeekForDate(today, month);
  const [reportType, setReportType] = useState("weekly");
  const [selectedWkIdx, setSelectedWkIdx] = useState(currentWkIdx);

  const weekInfo = reportType==="weekly" ? {...monthWeeks[selectedWkIdx], idx:selectedWkIdx} : null;

  function send(){
    sendEmailReport(clients, reportType, weekInfo, month, designers);
    onClose();
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,padding:"26px 30px",width:460,boxShadow:"0 20px 60px rgba(0,0,0,.2)",fontFamily:"'DM Sans',sans-serif"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <h3 style={{margin:0,fontSize:17,fontFamily:"'DM Serif Display',serif",color:"#1a1a2e"}}>Email Report to Gia</h3>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#9CA3AF"}}>✕</button>
        </div>

        {/* To field */}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:10,fontWeight:800,color:"#9CA3AF",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:5}}>To</label>
          <div style={{background:"#FAFAF9",border:"1px solid #E5E2DC",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#1a1a2e"}}>{GIA_EMAIL}</div>
        </div>

        {/* Report type */}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:10,fontWeight:800,color:"#9CA3AF",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8}}>Report Type</label>
          <div style={{display:"flex",background:"#F0EEE9",borderRadius:10,padding:4}}>
            {[["weekly","📋 Weekly Update"],["monthly","📊 Monthly Summary"]].map(([v,l])=>(
              <button key={v} onClick={()=>setReportType(v)}
                style={{flex:1,background:reportType===v?"#fff":"transparent",border:"none",borderRadius:7,padding:"8px 12px",cursor:"pointer",fontSize:12.5,fontWeight:reportType===v?700:500,color:reportType===v?"#1a1a2e":"#9CA3AF",boxShadow:reportType===v?"0 1px 4px rgba(0,0,0,.1)":"none",transition:"all .15s"}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Week selector (only for weekly) */}
        {reportType==="weekly"&&(
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:10,fontWeight:800,color:"#9CA3AF",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8}}>Week</label>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {monthWeeks.map((wk,i)=>{
                const isCurrent = i===currentWkIdx;
                const sel = i===selectedWkIdx;
                return (
                  <button key={i} onClick={()=>setSelectedWkIdx(i)}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:9,border:`1.5px solid ${sel?"#6366F1":"#E5E2DC"}`,background:sel?"#EEF2FF":"#FAFAF9",cursor:"pointer",textAlign:"left"}}>
                    <span style={{fontSize:13,fontWeight:sel?700:500,color:sel?"#4338CA":"#374151"}}>
                      Week {i+1} · {fmtWeekLabel(wk.mon, wk.fri)}
                    </span>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      {isCurrent&&<span style={{fontSize:10,fontWeight:700,background:"#6366F1",color:"#fff",borderRadius:20,padding:"1px 8px"}}>Current</span>}
                      {sel&&<span style={{fontSize:12,color:"#6366F1"}}>✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Preview subject */}
        <div style={{marginBottom:20,background:"#F8F7F4",borderRadius:8,padding:"10px 14px",border:"1px solid #E5E2DC"}}>
          <div style={{fontSize:9.5,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Subject Preview</div>
          <div style={{fontSize:12.5,color:"#1a1a2e",fontWeight:600}}>
            {reportType==="weekly"
              ? `YTL Creative — Pipeline Update · Week ${selectedWkIdx+1} · ${fmtWeekLabel(monthWeeks[selectedWkIdx].mon, monthWeeks[selectedWkIdx].fri)}`
              : `YTL Creative — ${MONTHS[month]} Monthly Report`}
          </div>
        </div>

        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>{
            const wkInfo = reportType==="weekly" ? {...monthWeeks[selectedWkIdx], idx:selectedWkIdx} : null;
            generateReport(clients, month, designers, wkInfo);
          }} style={{flex:1,background:"#F0EEE9",color:"#1a1a2e",border:"1px solid #E5E2DC",borderRadius:10,padding:"11px",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            <span style={{fontSize:15}}>📄</span> PDF Report
          </button>
          <button onClick={send} style={{flex:1,background:"#1a1a2e",color:"#E8E4DC",border:"none",borderRadius:10,padding:"11px",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            <span style={{fontSize:15}}>📧</span> Email Gia
          </button>
        </div>
        <div style={{marginTop:8,textAlign:"center",fontSize:11,color:"#C4BFBA"}}>PDF opens print dialog · Email opens your mail app</div>
      </div>
    </div>
  );
}

// ── Eblast Pipeline ────────────────────────────────────────────────────────
function EbRow({eblast,onChange,onRemove,canRemove,monthIdx,openPickerId,setOpenPickerId,designers}){
  const c=SC[eblast.status];
  // check overdue: deployDay selected, fri passed, not Deployed
  const today=new Date(); today.setHours(0,0,0,0);
  const friDate=strToDate(eblast.friStr);
  const isOverdue = friDate && friDate < today && eblast.deployDay && !isAssetDone(eblast.status, eblast.assetType);
  const borderColor = eblast.urgent?"#FECDD3":isOverdue?"#FCA5A5":"#EEEBE6";
  const bgColor = eblast.urgent?"#FFF1F2":isOverdue?"#FFF5F5":"#FAFAF9";
  return (
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",background:bgColor,borderRadius:8,padding:"9px 11px",border:`${eblast.urgent||isOverdue?"1.5px":"1px"} solid ${borderColor}`}}>
      <WeekPicker monStr={eblast.monStr||""} friStr={eblast.friStr||""} deployDay={eblast.deployDay||""} monthIdx={monthIdx} openId={openPickerId} pickerId={eblast.id} setOpenId={setOpenPickerId}
        onChange={obj=>onChange("_week",obj)}/>
      <input value={eblast.name} onChange={e=>onChange("name",e.target.value)} placeholder="Eblast name..." style={{flex:"1 1 140px",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"5px 9px",fontSize:12.5,fontFamily:"'DM Sans',sans-serif",color:"#1a1a2e",background:"#fff",outline:"none",boxSizing:"border-box"}}/>
      <div style={{flex:"0 0 188px",position:"relative"}}>
        <select value={eblast.status} onChange={e=>onChange("status",e.target.value)} style={{width:"100%",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"5px 24px 5px 9px",fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:c?.text,background:c?.bg,outline:"none",cursor:"pointer",appearance:"none",boxSizing:"border-box"}}>
          {STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        <span style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:8,color:"#9CA3AF"}}>▾</span>
      </div>
      <div style={{flex:"0 0 100px",position:"relative"}}>
        <select value={eblast.assetType||"E-blast"} onChange={e=>onChange("assetType",e.target.value)} style={{width:"100%",border:`1.5px solid ${ASSET_TYPE_C[eblast.assetType||"E-blast"]?.border||"#E5E2DC"}`,borderRadius:7,padding:"5px 20px 5px 8px",fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:ASSET_TYPE_C[eblast.assetType||"E-blast"]?.text||"#374151",background:ASSET_TYPE_C[eblast.assetType||"E-blast"]?.bg||"#F9FAFB",outline:"none",cursor:"pointer",appearance:"none",boxSizing:"border-box"}}>
          {ASSET_TYPES.map(t=><option key={t}>{t}</option>)}
        </select>
        <span style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:8,color:"#9CA3AF"}}>▾</span>
      </div>
      <div style={{flex:"0 0 88px",position:"relative"}}>
        <select value={eblast.designer} onChange={e=>onChange("designer",e.target.value)} style={{width:"100%",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"5px 20px 5px 9px",fontSize:12.5,fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#1a1a2e",background:"#fff",outline:"none",cursor:"pointer",appearance:"none",boxSizing:"border-box"}}>
          {designers.map(d=><option key={d}>{d}</option>)}
        </select>
        <span style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:8,color:"#9CA3AF"}}>▾</span>
      </div>
      {isOverdue&&<span style={{fontSize:10,fontWeight:700,color:"#DC2626",background:"#FEE2E2",borderRadius:20,padding:"1px 8px",whiteSpace:"nowrap"}}>OVERDUE</span>}
      <button onClick={()=>onChange("urgent",!eblast.urgent)} title={eblast.urgent?"Remove urgent flag":"Mark as urgent"} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:"2px 3px",lineHeight:1,opacity:eblast.urgent?1:0.35}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=eblast.urgent?"1":"0.35"}>🚨</button>
      {canRemove&&<button onClick={onRemove} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:14,padding:"2px 4px",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#F43F5E"} onMouseLeave={e=>e.currentTarget.style.color="#D1D5DB"}>✕</button>}
    </div>
  );
}

function EbClientCard({client,onUpdate,onRemove,monthIdx,designers,registry}){
  const [openPickerId,setOpenPickerId]=useState(null);
  function upd(eid,f,v){
    if(f==="_week"){
      // v is {monStr,friStr,thuStr,deployDay} object
      onUpdate({...client,eblasts:client.eblasts.map(e=>e.id===eid?{...e,...v}:e)});
    } else {
      onUpdate({...client,eblasts:client.eblasts.map(e=>e.id===eid?{...e,[f]:v}:e)});
    }
  }
  function add(){onUpdate({...client,eblasts:[...client.eblasts,newEblast()],expanded:true});}
  function rem(eid){const u=client.eblasts.filter(e=>e.id!==eid);onUpdate({...client,eblasts:u.length?u:[newEblast()]});}
  const dep=client.eblasts.filter(e=>e.status==="Deployed").length,tot=client.eblasts.length;
  const urgCnt=client.eblasts.filter(e=>e.urgent).length;
  return (
    <div style={{background:"#fff",borderRadius:12,border:"1px solid #E5E2DC",boxShadow:"0 1px 4px rgba(0,0,0,.04)",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 16px",cursor:"pointer",userSelect:"none"}} onClick={()=>onUpdate({...client,expanded:!client.expanded})}>
        <span style={{fontSize:10,color:"#9CA3AF",transform:client.expanded?"rotate(90deg)":"rotate(0)",transition:"transform .2s",flexShrink:0,width:12}}>▶</span>
        <div style={{flex:1,minWidth:0,fontSize:13.5,fontWeight:700,color:"#1a1a2e",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{client.clientName}</div>
        {(()=>{const rc=registry&&registry.find(r=>r.name===client.clientName);return rc?<ClientTypeBadge type={rc.type}/>:null;})()}
        {urgCnt>0&&<span style={{fontSize:10.5,fontWeight:700,color:"#BE123C",background:"#FFF1F2",border:"1px solid #FECDD3",borderRadius:20,padding:"1px 8px",whiteSpace:"nowrap"}}>🚨 {urgCnt}</span>}
        <div onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",gap:4}}>
          {client.editScope
            ? <input autoFocus value={client.scope||""} onChange={e=>onUpdate({...client,scope:e.target.value})} onBlur={()=>onUpdate({...client,editScope:false})} onKeyDown={e=>e.key==="Enter"&&onUpdate({...client,editScope:false})} placeholder="Scope..." style={{border:"1.5px solid #6366F1",borderRadius:6,padding:"2px 8px",fontSize:11,fontFamily:"'DM Sans',sans-serif",width:120,outline:"none",color:"#1a1a2e"}}/>
            : <span onClick={()=>onUpdate({...client,editScope:true})} title="Click to edit scope" style={{cursor:"text"}}><ScopeBadge scope={client.scope}/></span>
          }
        </div>
        <span style={{fontSize:11,color:"#9CA3AF",whiteSpace:"nowrap"}}>{dep}/{tot}</span>
        <div style={{width:56,height:4,background:"#F0EEE9",borderRadius:2,flexShrink:0}}><div style={{width:(tot?(dep/tot)*100:0)+"%",height:"100%",background:"#8B5CF6",borderRadius:2}}/></div>
        <button onClick={e=>{e.stopPropagation();add();}} style={{background:"#F0EEE9",border:"none",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,color:"#6B6860",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.background="#1a1a2e";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="#F0EEE9";e.currentTarget.style.color="#6B6860";}}>+ Asset</button>
        <button onClick={e=>{e.stopPropagation();onUpdate({...client,showNote:!client.showNote});}} title="Client note" style={{background:client.showNote||client.clientNote?"#FFFBEB":"none",border:client.clientNote?"1.5px solid #FDE68A":"none",borderRadius:6,padding:"3px 7px",fontSize:13,cursor:"pointer",opacity:client.showNote||client.clientNote?1:0.4}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=client.showNote||client.clientNote?"1":"0.4"}>📝</button>
        <button onClick={e=>{e.stopPropagation();onRemove();}} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:15,padding:"2px 3px",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#F43F5E"} onMouseLeave={e=>e.currentTarget.style.color="#D1D5DB"}>✕</button>
      </div>
      {(client.showNote||client.clientNote)&&<div style={{padding:"0 16px 8px"}}><textarea value={client.clientNote||""} onChange={e=>onUpdate({...client,clientNote:e.target.value})} placeholder="Add a note for this client... (e.g. on vacation March 10, new brand guidelines pending)" rows={2} style={{width:"100%",border:"1.5px solid #FDE68A",borderRadius:7,padding:"6px 10px",fontSize:12,fontFamily:"'DM Sans',sans-serif",color:"#92400E",background:"#FFFBEB",outline:"none",resize:"vertical",boxSizing:"border-box"}}/></div>}
      {client.expanded&&(
        <div style={{padding:"0 16px 13px",display:"flex",flexDirection:"column",gap:6}}>
          <div style={{display:"flex",gap:8,marginBottom:1}}>
            {[["Week / Deploy","0 0 auto"],["Type","0 0 100px"],["Asset Name","1 1 140px"],["Status","0 0 188px"],["Designer","0 0 88px"]].map(([l,f])=><div key={l} style={{fontSize:9.5,fontWeight:700,color:"#9CA3AF",letterSpacing:"0.07em",textTransform:"uppercase",flex:f}}>{l}</div>)}
            <div style={{width:22}}/>
          </div>
          {client.eblasts.map(e=><EbRow key={e.id} eblast={e} onChange={(f,v)=>upd(e.id,f,v)} onRemove={()=>rem(e.id)} canRemove={client.eblasts.length>1} monthIdx={monthIdx} openPickerId={openPickerId} setOpenPickerId={setOpenPickerId} designers={designers}/>)}
        </div>
      )}
    </div>
  );
}

function StatusGroupCard({status, items, today, onUpdateAsset}){
  const sc = SC[status];
  const PREVIEW = 5;
  const [expanded, setExpanded] = useState(status !== "Deployed");
  const [showAll, setShowAll] = useState(false);
  const visible = !expanded ? [] : showAll ? items : items.slice(0, PREVIEW);
  const hiddenCount = items.length - PREVIEW;
  return (
    <div style={{background:"#fff",borderRadius:12,border:`1px solid ${sc.border}`,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
      <div onClick={()=>setExpanded(v=>!v)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 18px",background:sc.bg,borderBottom:expanded?`1px solid ${sc.border}`:"none",cursor:"pointer",userSelect:"none"}}>
        <span style={{width:9,height:9,borderRadius:"50%",background:sc.dot,flexShrink:0}}/>
        <span style={{fontSize:13,fontWeight:700,color:sc.text,flex:1}}>{status}</span>
        <span style={{fontSize:11.5,fontWeight:700,color:sc.text,background:"rgba(255,255,255,.6)",borderRadius:20,padding:"1px 10px"}}>{items.length}</span>
        <span style={{fontSize:10,color:sc.text,opacity:0.6,marginLeft:2}}>{expanded?"▲":"▼"}</span>
      </div>
      {expanded&&(
        <div style={{padding:"10px 18px",display:"flex",flexDirection:"column",gap:6}}>
          {visible.map(item=>{
            const friD=strToDate(item.friStr);
            const overdue=friD&&friD<today&&item.deployDay&&!isAssetDone(item.status,item.assetType);
            return (
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:overdue?"#FFF5F5":"#FAFAF9",borderRadius:8,border:overdue?"1.5px solid #FCA5A5":"1px solid #EEEBE6",flexWrap:"wrap"}}>
                <AssetTypeBadge type={item.assetType||"E-blast"}/>
                {item.monStr
                  ?<span style={{fontSize:10,fontWeight:700,color:"#6D28D9",background:"#F5F3FF",borderRadius:5,padding:"2px 7px",whiteSpace:"nowrap"}}>{fmtWeekLabel(strToDate(item.monStr),strToDate(item.friStr))}{item.deployDay?" · "+item.deployDay:""}</span>
                  :<span style={{fontSize:10,color:"#C4BFBA",background:"#F8F7F4",borderRadius:5,padding:"2px 7px"}}>No week</span>}
                <div style={{flex:1,minWidth:80}} onClick={e=>e.stopPropagation()}>
                  {onUpdateAsset
                    ? <input
                        value={item.name||""}
                        onChange={e=>onUpdateAsset(item.id,item.clientId,"name",e.target.value)}
                        placeholder="Asset name..."
                        style={{width:"100%",border:"none",background:"transparent",fontSize:12.5,fontWeight:600,color:"#1a1a2e",fontFamily:"'DM Sans',sans-serif",outline:"none",padding:0,cursor:"text"}}
                        onFocus={e=>e.target.style.borderBottom="1.5px solid #6366F1"}
                        onBlur={e=>e.target.style.borderBottom="none"}
                      />
                    : <span style={{fontSize:12.5,fontWeight:600,color:"#1a1a2e"}}>{item.name||<span style={{color:"#C4BFBA",fontStyle:"italic"}}>Unnamed</span>}</span>
                  }
                </div>
                <span style={{fontSize:11,color:"#9CA3AF",whiteSpace:"nowrap"}}>{item.clientName}</span>
                <span style={{fontSize:10.5,fontWeight:600,color:"#9CA3AF",background:"#F0EEE9",borderRadius:5,padding:"2px 6px"}}>{item.designer}</span>
                {overdue&&<span style={{fontSize:10,fontWeight:700,color:"#DC2626",background:"#FEE2E2",borderRadius:20,padding:"1px 8px"}}>OVERDUE</span>}
                {item.urgent&&<span style={{fontSize:12}}>🚨</span>}
                {onUpdateAsset&&(()=>{const sc2=SC[item.status]||{};return(
                  <div style={{position:"relative",flexShrink:0}}>
                    <select value={item.status} onChange={e=>onUpdateAsset(item.id,item.clientId,"status",e.target.value)}
                      style={{border:`1.5px solid ${sc2.border||"#E5E2DC"}`,borderRadius:6,padding:"3px 22px 3px 8px",fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:sc2.text,background:sc2.bg,outline:"none",cursor:"pointer",appearance:"none"}}>
                      {statusesForType(item.assetType).map(s=><option key={s}>{s}</option>)}
                    </select>
                    <span style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:7,color:sc2.text}}>▾</span>
                  </div>
                );})()}
              </div>
            );
          })}
          {!showAll&&hiddenCount>0&&(
            <button onClick={e=>{e.stopPropagation();setShowAll(true);}} style={{background:"none",border:"1px dashed #E5E2DC",borderRadius:8,padding:"7px",cursor:"pointer",fontSize:12,color:"#9CA3AF",fontFamily:"'DM Sans',sans-serif",fontWeight:600,textAlign:"center"}}>
              Show {hiddenCount} more →
            </button>
          )}
          {showAll&&items.length>PREVIEW&&(
            <button onClick={e=>{e.stopPropagation();setShowAll(false);}} style={{background:"none",border:"1px dashed #E5E2DC",borderRadius:8,padding:"7px",cursor:"pointer",fontSize:12,color:"#9CA3AF",fontFamily:"'DM Sans',sans-serif",fontWeight:600,textAlign:"center"}}>
              Show less ↑
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EbStatusBreakdown({clients, monthIdx, onUpdateAsset}){
  const [weekFilter, setWeekFilter] = useState("All");
  const year = new Date().getFullYear();
  const monthWeeks = useMemo(()=>getMonthWeeks(monthIdx||new Date().getMonth(), year),[monthIdx]);
  const today = new Date(); today.setHours(0,0,0,0);

  const allEblasts = useMemo(()=>{
    const arr=[];
    clients.forEach(c=>c.eblasts.forEach(e=>arr.push({...e,clientName:c.clientName,clientId:c.clientId})));
    return arr;
  },[clients]);

  const filtered = useMemo(()=>{
    if(weekFilter==="All") return allEblasts;
    const wk = monthWeeks[parseInt(weekFilter)-1];
    if(!wk) return allEblasts;
    return allEblasts.filter(e=>e.monStr===dateToStr(wk.mon));
  },[allEblasts, weekFilter, monthWeeks]);

  const grouped = useMemo(()=>{
    const m={};STATUSES.forEach(s=>{m[s]=[];});
    filtered.forEach(e=>m[e.status].push(e));
    return m;
  },[filtered]);

  // Overdue: deploy date passed, not Deployed
  const overdueItems = useMemo(()=>
    allEblasts.filter(e=>{
      const f=strToDate(e.friStr);
      return f&&f<today&&e.deployDay&&!isAssetDone(e.status,e.assetType);
    }).sort((a,b)=>a.friStr.localeCompare(b.friStr))
  ,[allEblasts]);

  const pieData=STATUSES.map(s=>({name:s,value:grouped[s].length})).filter(d=>d.value>0);
  const {prod,allow}=useMemo(()=>{let p=0,a=0;clients.forEach(c=>{p+=c.eblasts.length;const n=SCOPE_NUM[c.scope];if(n!=null)a+=n;});return{prod:p,allow:a};},[clients]);
  const prodData=useMemo(()=>{const ov=Math.max(0,prod-allow),un=Math.max(0,allow-prod),mt=Math.min(prod,allow);return[{name:"Produced",value:mt,color:"#16A34A"},ov>0?{name:"Over Allowance",value:ov,color:"#F43F5E"}:null,un>0?{name:"Remaining",value:un,color:"#E5E2DC"}:null].filter(Boolean);},[prod,allow]);
  const active=STATUSES.filter(s=>grouped[s].length>0),empty=STATUSES.filter(s=>grouped[s].length===0);

  if(!clients.length) return <EmptyMsg msg="No data yet."/>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Week filter */}
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.06em"}}>Week:</span>
        {["All","1","2","3","4"].map(w=>{
          const wk=w==="All"?null:monthWeeks[parseInt(w)-1];
          const label=w==="All"?"All weeks":`Wk ${w}${wk?" · "+fmtWeekLabel(wk.mon,wk.fri):""}`;
          return <button key={w} onClick={()=>setWeekFilter(w)} style={{background:weekFilter===w?"#1a1a2e":"#F0EEE9",color:weekFilter===w?"#fff":"#6B6860",border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11.5,fontWeight:weekFilter===w?700:500,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{label}</button>;
        })}
      </div>

      {/* 3 charts row */}
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 280px",background:"#fff",borderRadius:14,border:"1px solid #E5E2DC",padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
          <div style={{fontSize:11,fontWeight:800,color:"#1a1a2e",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>Status Distribution</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginBottom:10}}>{filtered.length} assets{weekFilter!=="All"?` · week ${weekFilter}`:""}</div>
          <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={78} dataKey="value" labelLine={false} label={<PieLabel/>}>{pieData.map((d,i)=><Cell key={i} fill={SC[d.name]?.pie||"#9CA3AF"}/>)}</Pie><Tooltip content={<TTip/>}/><Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:10.5,color:"#374151"}}>{v}</span>} wrapperStyle={{paddingTop:8}}/></PieChart></ResponsiveContainer>
        </div>
        <div style={{flex:"1 1 220px",background:"#fff",borderRadius:14,border:"1px solid #E5E2DC",padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
          <div style={{fontSize:11,fontWeight:800,color:"#1a1a2e",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>Production vs Allowance</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginBottom:10}}>{prod} produced · {allow} contracted</div>
          <ResponsiveContainer width="100%" height={130}><PieChart><Pie data={prodData} cx="50%" cy="50%" outerRadius={55} dataKey="value" labelLine={false} label={<PieLabel/>}>{prodData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip content={<TTip/>}/><Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:10.5,color:"#374151"}}>{v}</span>} wrapperStyle={{paddingTop:6}}/></PieChart></ResponsiveContainer>
          <div style={{display:"flex",gap:6,marginTop:8}}>
            {[{l:"Produced",v:prod,c:"#16A34A"},{l:"Contracted",v:allow,c:"#3B82F6"},{l:prod>allow?"Over":"Left",v:Math.abs(prod-allow),c:prod>allow?"#F43F5E":"#9CA3AF"}].map(s=>(
              <div key={s.l} style={{flex:1,textAlign:"center",background:"#FAFAF9",borderRadius:8,padding:"6px 2px"}}>
                <div style={{fontSize:16,fontWeight:700,color:s.c,fontFamily:"'DM Serif Display',serif"}}>{s.v}</div>
                <div style={{fontSize:9.5,color:"#9CA3AF",fontWeight:600,marginTop:1}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Overdue panel */}
        <div style={{flex:"1 1 220px",background:overdueItems.length>0?"#FFF5F5":"#FAFAF9",borderRadius:14,border:`1px solid ${overdueItems.length>0?"#FCA5A5":"#E5E2DC"}`,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
          <div style={{fontSize:11,fontWeight:800,color:overdueItems.length>0?"#DC2626":"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>⚠️ Overdue</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginBottom:12}}>{overdueItems.length} past deploy date</div>
          {overdueItems.length===0
            ? <div style={{textAlign:"center",padding:"20px 0",color:"#C4BFBA",fontSize:13}}>✓ All clear</div>
            : <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:220,overflowY:"auto"}}>
                {overdueItems.map(item=>{
                  const daysOver = Math.floor((today-strToDate(item.friStr))/(1000*60*60*24));
                  return (
                    <div key={item.id} style={{background:"#fff",borderRadius:8,border:"1px solid #FECDD3",padding:"8px 10px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        <AssetTypeBadge type={item.assetType||"E-blast"}/>
                        <span style={{fontSize:11,fontWeight:700,color:"#DC2626"}}>{daysOver}d overdue</span>
                      </div>
                      <div style={{fontSize:12.5,fontWeight:600,color:"#1a1a2e",marginBottom:2}}>{item.name||<span style={{color:"#C4BFBA",fontStyle:"italic"}}>Unnamed</span>}</div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,color:"#9CA3AF"}}>{item.clientName}</span>
                        <span style={{fontSize:10,background:"#F0EEE9",color:"#6B6860",borderRadius:4,padding:"1px 6px",fontWeight:600}}>{item.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </div>

      {/* Status cards — collapsible + show more */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {active.map(status=>(
          <StatusGroupCard key={status} status={status} items={grouped[status].sort((a,b)=>(a.monStr||"").localeCompare(b.monStr||""))} today={today} onUpdateAsset={onUpdateAsset}/>
        ))}
      </div>
      {empty.length>0&&<div><div style={{fontSize:10,fontWeight:700,color:"#C4BFBA",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8}}>Empty stages</div><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{empty.map(s=><span key={s} style={{display:"inline-flex",alignItems:"center",gap:5,background:"#F8F7F4",color:"#B0ABA5",border:"1px solid #E5E2DC",padding:"4px 12px",borderRadius:20,fontSize:11.5,fontWeight:600}}><span style={{width:6,height:6,borderRadius:"50%",background:SC[s].dot,opacity:.35}}/>{s}</span>)}</div></div>}
    </div>
  );
}



function EbDesignerView({clients, designers}){
  const counts = useMemo(()=>{
    const m={};
    designers.forEach(d=>{ m[d]={total:0,urgent:0,done:0,inProgress:0,byStatus:{}}; STATUSES.forEach(s=>m[d].byStatus[s]=0); });
    clients.forEach(c=>c.eblasts.forEach(e=>{
      if(!m[e.designer]) return;
      m[e.designer].total++;
      if(e.urgent) m[e.designer].urgent++;
      if(isAssetDone(e.status,e.assetType)) m[e.designer].done++;
      else m[e.designer].inProgress++;
      m[e.designer].byStatus[e.status]++;
    }));
    return m;
  },[clients]);
  const total = Object.values(counts).reduce((a,d)=>a+d.total,0);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        {designers.map(d=>{
          const dc=counts[d]; const pct=total?Math.round((dc.total/total)*100):0;
          return (
            <div key={d} style={{flex:"1 1 260px",background:"#fff",borderRadius:14,border:"1px solid #E5E2DC",padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontSize:17,fontWeight:800,color:"#1a1a2e",fontFamily:"'DM Serif Display',serif"}}>{d}</div>
                <div style={{fontSize:24,fontWeight:800,color:"#6366F1",fontFamily:"'DM Serif Display',serif"}}>{dc.total}</div>
              </div>
              <div style={{height:6,background:"#F0EEE9",borderRadius:3,marginBottom:12,overflow:"hidden"}}>
                <div style={{width:pct+"%",height:"100%",background:"#6366F1",borderRadius:3,transition:"width .3s"}}/>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[{l:"Done",v:dc.done,c:"#16A34A"},{l:"In Progress",v:dc.inProgress,c:"#6366F1"},{l:"Urgent",v:dc.urgent,c:"#F43F5E"}].map(s=>(
                  <div key={s.l} style={{flex:1,textAlign:"center",background:"#FAFAF9",borderRadius:8,padding:"7px 4px"}}>
                    <div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:9.5,color:"#9CA3AF",fontWeight:600,marginTop:1,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:4}}>
                {STATUSES.filter(s=>dc.byStatus[s]>0).map(s=>{
                  const sc=SC[s];
                  return (
                    <div key={s} style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:sc.dot,flexShrink:0}}/>
                      <span style={{fontSize:11,color:"#6B7280",flex:1}}>{s}</span>
                      <span style={{fontSize:11,fontWeight:700,color:sc.text,background:sc.bg,borderRadius:20,padding:"1px 8px"}}>{dc.byStatus[s]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {total===0&&<div style={{textAlign:"center",padding:"40px",color:"#9CA3AF",fontFamily:"'DM Sans',sans-serif",fontSize:14}}>No assets yet this month.</div>}
    </div>
  );
}

// ── Undo Toast ─────────────────────────────────────────────────────────────
function UndoToast({item, onUndo, onDismiss}) {
  
  const [,forceUpdate]=useState(0);
  const startRef = useState(Date.now())[0];
  const dur = 7000;
  const elapsed = Date.now()-startRef;
  const prog = Math.max(0,100-(elapsed/dur)*100);
  useState(()=>{
    const tick=setInterval(()=>{
      forceUpdate(n=>n+1);
      if(Date.now()-startRef>=dur){clearInterval(tick);onDismiss();}
    },80);
    return ()=>clearInterval(tick);
  });
  return (
    <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:"#1a1a2e",color:"#fff",borderRadius:12,padding:"12px 18px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 8px 32px rgba(0,0,0,.25)",minWidth:300,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:600}}>{item.clientName} removed</div>
        <div style={{height:3,background:"rgba(255,255,255,.15)",borderRadius:2,marginTop:7,overflow:"hidden"}}>
          <div style={{height:"100%",width:Math.max(0,100-((Date.now()-startRef)/dur)*100)+"%",background:"#6366F1",borderRadius:2,transition:"width 50ms linear"}}/>
        </div>
      </div>
      <button onClick={onUndo} style={{background:"#6366F1",color:"#fff",border:"none",borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:12.5,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>↩ Undo</button>
      <button onClick={onDismiss} style={{background:"none",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:16,padding:"0 2px",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.5)"}>✕</button>
    </div>
  );
}

// ── Preset Picker ───────────────────────────────────────────────────────────
function PresetPicker({presets, onSelect, onClose}) {
  if (!presets.length) return null;
  return (
    <div style={{background:"#fff",border:"1.5px solid #6366F1",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
      <div style={{fontSize:10,fontWeight:800,color:"#6366F1",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Restore a default client</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {presets.map(p=>(
          <button key={p.id} onClick={()=>onSelect(p)}
            style={{background:"#F0EEE9",border:"1px solid #E5E2DC",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12.5,fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#1a1a2e",display:"flex",alignItems:"center",gap:7,transition:"all .12s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#1a1a2e";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#1a1a2e";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#F0EEE9";e.currentTarget.style.color="#1a1a2e";e.currentTarget.style.borderColor="#E5E2DC";}}>
            {p.name}{p.scope&&<span style={{fontSize:10,fontWeight:700,opacity:.6}}>{p.scope}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}


function YearOverview({data, onClose}){
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,padding:"24px 28px",width:"100%",maxWidth:700,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:18,fontFamily:"'DM Serif Display',serif",color:"#1a1a2e"}}>Year Overview</h2>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#9CA3AF"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
          {MONTHS.map((m,i)=>{
            const mc=data[i]||[];
            const tot=mc.reduce((a,c)=>a+c.eblasts.length,0);
            const dep=mc.reduce((a,c)=>a+c.eblasts.filter(e=>e.status==="Deployed").length,0);
            const urg=mc.reduce((a,c)=>a+c.eblasts.filter(e=>e.urgent).length,0);
            const pct=tot?Math.round((dep/tot)*100):0;
            const isCur=i===new Date().getMonth();
            return (
              <div key={m} style={{background:isCur?"#F5F3FF":"#FAFAF9",borderRadius:10,padding:"12px 14px",border:isCur?"1.5px solid #DDD6FE":"1px solid #E5E2DC"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <span style={{fontSize:12,fontWeight:800,color:isCur?"#7C3AED":"#1a1a2e"}}>{m}{isCur&&<span style={{marginLeft:5,fontSize:9,background:"#8B5CF6",color:"#fff",borderRadius:20,padding:"1px 6px"}}>NOW</span>}</span>
                  {urg>0&&<span style={{fontSize:10}}>🚨{urg}</span>}
                </div>
                <div style={{fontSize:22,fontWeight:800,color:"#1a1a2e",fontFamily:"'DM Serif Display',serif"}}>{dep}<span style={{fontSize:13,fontWeight:500,color:"#9CA3AF"}}>/{tot}</span></div>
                <div style={{fontSize:10,color:"#9CA3AF",marginBottom:6}}>deployed</div>
                <div style={{height:4,background:"#E5E2DC",borderRadius:2,overflow:"hidden"}}>
                  <div style={{width:pct+"%",height:"100%",background:pct===100?"#16A34A":"#8B5CF6",borderRadius:2}}/>
                </div>
                <div style={{fontSize:10,color:"#9CA3AF",marginTop:4}}>{pct}% complete</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EblastPipeline({data, setData, designers, setDesigners, registry}){
  const [month,setMonth]=useState(new Date().getMonth());
  const [view,setView]=useState(()=>{const v={};MONTHS.forEach((_,i)=>v[i]=1);return v;});
  const [sorted,setSorted]=useState(false);
  const [search,setSearch]=useState("");
  const [showAdd,setShowAdd]=useState(false);
  const [showYearOverview,setShowYearOverview]=useState(false);
  const [showDesignerMgr,setShowDesignerMgr]=useState(false);
  const [showEmailModal,setShowEmailModal]=useState(false);
  const [newName,setNewName]=useState("");
  const [newScope,setNewScope]=useState("");
  const [undoItem,setUndoItem]=useState(null);
  const raw=data[month]||[];
  const cur=view[month]??1;

  function upd(cid,d){setData({...data,[month]:data[month].map(c=>c.clientId===cid?d:c)});}
  // Called from Status Breakdown: update a single field on a single asset by id
  function updAsset(assetId,clientId,field,value){
    setData({...data,[month]:data[month].map(c=>{
      if(c.clientId!==clientId) return c;
      return {...c,eblasts:c.eblasts.map(e=>e.id===assetId?{...e,[field]:value}:e)};
    })});
  }
  function rem(cid){
    const client=raw.find(c=>c.clientId===cid);
    setData({...data,[month]:data[month].filter(c=>c.clientId!==cid)});
    setUndoItem({clientName:client.clientName, restoreFn:()=>setData({...data,[month]:[...data[month],client]})});
  }
  function add(){if(!newName.trim())return;setData({...data,[month]:[...data[month],{clientId:uid(),clientName:newName.trim(),scope:newScope.trim(),expanded:true,eblasts:[newEblast()]}]});setNewName("");setNewScope("");setShowAdd(false);}
  function addPreset(p){setData({...data,[month]:[...data[month],{clientId:uid(),clientName:p.name,scope:p.scope,expanded:true,eblasts:[newEblast()]}]});}

  const currentNames=new Set(raw.map(c=>c.clientName));
  const emailClients = registry ? registry.filter(c=>c.services?.email) : EB_DEFAULTS;
  const availablePresets=emailClients.filter(d=>!currentNames.has(d.name));
  const tot=raw.reduce((a,c)=>a+c.eblasts.length,0);
  const dep=raw.reduce((a,c)=>a+c.eblasts.filter(e=>e.status==="Deployed").length,0);
  const urgTotal=raw.reduce((a,c)=>a+c.eblasts.filter(e=>e.urgent).length,0);
  const today0=new Date(); today0.setHours(0,0,0,0);
  const overdueTotal=raw.reduce((a,c)=>a+c.eblasts.filter(e=>{const f=strToDate(e.friStr);return f&&f<today0&&e.deployDay&&!isAssetDone(e.status,e.assetType);}).length,0);

  // Sort: urgent clients first, then alpha if sorted
  let displayClients=[...raw];
  if(sorted) displayClients.sort((a,b)=>a.clientName.localeCompare(b.clientName));
  else displayClients.sort((a,b)=>(b.eblasts.some(e=>e.urgent)?1:0)-(a.eblasts.some(e=>e.urgent)?1:0));
  if(search.trim()) displayClients=displayClients.filter(c=>c.clientName.toLowerCase().includes(search.toLowerCase())||c.eblasts.some(e=>e.name.toLowerCase().includes(search.toLowerCase())||((e.assetType||"").toLowerCase().includes(search.toLowerCase()))));

  return (
    <div style={{display:"flex",height:"100%",minHeight:0,overflow:"hidden"}}>
      <MonthSidebar months={MONTHS} active={month} setActive={setMonth} getData={i=>{const mc=data[i]||[];return{top:mc.reduce((a,c)=>a+c.eblasts.filter(e=>e.status==="Deployed").length,0),bot:mc.reduce((a,c)=>a+c.eblasts.length,0)};}}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10}}>
          <div>
            <h2 style={{margin:0,fontSize:21,fontFamily:"'DM Serif Display',serif",color:"#1a1a2e"}}>{MONTHS[month]}</h2>
            <p style={{margin:"3px 0 0",fontSize:12,color:"#9CA3AF"}}>{raw.length} clients · {tot} assets · {dep} deployed{urgTotal>0&&<span style={{marginLeft:8,color:"#BE123C",fontWeight:600}}>· 🚨 {urgTotal} urgent</span>}{overdueTotal>0&&<span style={{marginLeft:8,color:"#DC2626",fontWeight:600}}>· ⚠️ {overdueTotal} overdue</span>}</p>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search clients, assets or types…"/>
            <AZBtn sorted={sorted} onToggle={()=>setSorted(v=>!v)}/>
            <button onClick={()=>setShowYearOverview(true)} style={{background:"#F0EEE9",border:"none",borderRadius:7,padding:"7px 13px",cursor:"pointer",fontSize:12,fontWeight:600,color:"#6B6860"}} onMouseEnter={e=>{e.currentTarget.style.background="#1a1a2e";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="#F0EEE9";e.currentTarget.style.color="#6B6860";}}>📊 Year</button>
            <button onClick={()=>setShowDesignerMgr(true)} style={{background:"#F0EEE9",border:"none",borderRadius:7,padding:"7px 13px",cursor:"pointer",fontSize:12,fontWeight:600,color:"#6B6860"}} onMouseEnter={e=>{e.currentTarget.style.background="#1a1a2e";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="#F0EEE9";e.currentTarget.style.color="#6B6860";}}>⚙️ Designers</button>
            <button onClick={()=>setShowEmailModal(true)} style={{background:"#6366F1",color:"#fff",border:"none",borderRadius:7,padding:"7px 13px",cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>📋 Reports</button>
            {cur===0&&<button onClick={()=>setShowAdd(v=>!v)} style={{background:"#1a1a2e",color:"#fff",border:"none",padding:"8px 15px",borderRadius:8,cursor:"pointer",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:14}}>+</span> Add Client</button>}
          </div>
        </div>
        <div style={{marginBottom:18}}><SubTabs options={["Client Breakdown","Status Breakdown","Designer View"]} active={cur} onChange={v=>setView(p=>({...p,[month]:v}))}/></div>
        {showAdd&&cur===0&&(
          <div style={{background:"#fff",border:"1.5px solid #6366F1",borderRadius:10,padding:"14px 16px",marginBottom:14}}>
            <PresetPicker presets={availablePresets} onSelect={p=>{addPreset(p);setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>
            <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
              <div style={{flex:"1 1 150px"}}><label style={{display:"block",fontSize:9.5,fontWeight:700,color:"#9CA3AF",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:4}}>New Client Name</label><input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="e.g. Jane Smith" style={{width:"100%",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"6px 10px",fontSize:13,color:"#1a1a2e",outline:"none",boxSizing:"border-box"}}/></div>
              <div style={{flex:"1 1 130px"}}><label style={{display:"block",fontSize:9.5,fontWeight:700,color:"#9CA3AF",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:4}}>Scope</label><input value={newScope} onChange={e=>setNewScope(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="e.g. 4 Eblasts/MO" style={{width:"100%",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"6px 10px",fontSize:13,color:"#1a1a2e",outline:"none",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",gap:7}}><button onClick={add} style={{background:"#1a1a2e",color:"#fff",border:"none",padding:"7px 15px",borderRadius:7,cursor:"pointer",fontSize:12.5,fontWeight:700}}>Add</button><button onClick={()=>setShowAdd(false)} style={{background:"#F3F4F6",color:"#6B7280",border:"none",padding:"7px 13px",borderRadius:7,cursor:"pointer",fontSize:12.5,fontWeight:600}}>Cancel</button></div>
            </div>
          </div>
        )}
        {cur===0&&<div style={{display:"flex",flexDirection:"column",gap:9}}>{displayClients.map(c=><EbClientCard key={c.clientId} client={c} onUpdate={d=>upd(c.clientId,d)} onRemove={()=>rem(c.clientId)} monthIdx={month} designers={designers} registry={registry}/>)}{displayClients.length===0&&<EmptyMsg msg={search?`No results for "${search}".`:`No clients for ${MONTHS[month]}.`} onAdd={search?undefined:()=>setShowAdd(true)}/>}</div>}
        {cur===1&&<EbStatusBreakdown clients={raw} monthIdx={month} onUpdateAsset={updAsset}/>}
        {cur===2&&<EbDesignerView clients={raw} designers={designers}/>}
      </div>
      {undoItem&&<UndoToast item={undoItem} onUndo={()=>{undoItem.restoreFn();setUndoItem(null);}} onDismiss={()=>setUndoItem(null)}/>}
      {showYearOverview&&<YearOverview data={data} onClose={()=>setShowYearOverview(false)}/>}
      {showDesignerMgr&&<DesignerManager designers={designers} onSave={list=>{setDesigners(list);setShowDesignerMgr(false);}} onClose={()=>setShowDesignerMgr(false)}/>}
      {showEmailModal&&<ReportModal clients={raw} month={month} designers={designers} onClose={()=>setShowEmailModal(false)}/>}
    </div>
  );
}

// ── Social Media ───────────────────────────────────────────────────────────
function DateRangePicker({startDate, endDate, onUpdate, openId, batchId, setOpenId}){
  const isOpen = openId === batchId;
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({top:0,left:0});
  const btnRef = useState(null);
  const [calMonth, setCalMonth] = useState(()=>{
    if(startDate){ const p=startDate.split("/"); if(p.length===2){ const m=parseInt(p[0])-1,d=parseInt(p[1]); if(!isNaN(m)&&!isNaN(d)) return new Date(2026,m,1); } }
    return new Date(2026, new Date().getMonth(), 1);
  });

  function parseDate(s){ if(!s) return null; const p=s.split("/"); if(p.length!==2) return null; const m=parseInt(p[0])-1,d=parseInt(p[1]); if(isNaN(m)||isNaN(d)) return null; return new Date(2026,m,d); }
  function fmtD(d){ if(!d) return null; return `${d.getMonth()+1}/${String(d.getDate()).padStart(2,"0")}`; }
  function sameDay(a,b){ return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
  function inRange(d,s,e){ return d&&s&&e&&d>s&&d<e; }

  const start = parseDate(startDate), end = parseDate(endDate);

  function openCal(e){
    const rect = e.currentTarget.getBoundingClientRect();
    const calH = 420; // approx calendar height
    const spaceBelow = window.innerHeight - (rect.bottom + 6);
    const top = spaceBelow < calH && rect.top > calH
      ? rect.top - calH - 6
      : rect.bottom + 6;
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - 280);
    setPos({top, left});
    setOpenId(isOpen ? null : batchId);
  }

  function pickDay(d){
    if(!start||(start&&end)){
      onUpdate({startDate:fmtD(d),endDate:""});
    } else {
      if(d<start){ onUpdate({startDate:fmtD(d),endDate:fmtD(start)}); }
      else { onUpdate({startDate:startDate,endDate:fmtD(d)}); }
      setOpenId(null);
    }
  }

  function calDays(){
    const yr=calMonth.getFullYear(),mo=calMonth.getMonth();
    const first=new Date(yr,mo,1).getDay(),last=new Date(yr,mo+1,0).getDate();
    const days=[];
    for(let i=0;i<first;i++) days.push(null);
    for(let i=1;i<=last;i++) days.push(new Date(yr,mo,i));
    return days;
  }

  const hoverEnd = hover && start && !end ? hover : end;
  const label = startDate && endDate ? `${startDate} – ${endDate}` : startDate ? `${startDate} → …` : "Select dates";
  const hasRange = startDate||endDate;

  return (
    <div onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <button onClick={openCal}
          style={{display:"flex",alignItems:"center",gap:6,border:`1.5px solid ${isOpen?"#6366F1":"#E5E2DC"}`,borderRadius:7,padding:"3px 9px",background:isOpen?"#EEF2FF":hasRange?"#F8F7FF":"#FAFAF9",cursor:"pointer",fontSize:11,fontWeight:hasRange?600:400,color:hasRange?"#4338CA":"#9CA3AF",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
          <span style={{fontSize:12}}>📅</span>{label}
        </button>
        {hasRange&&<button onClick={()=>onUpdate({startDate:"",endDate:""})} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:12,padding:"1px 3px",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#F43F5E"} onMouseLeave={e=>e.currentTarget.style.color="#D1D5DB"}>✕</button>}
      </div>
      {isOpen&&(
        <div onClick={e=>e.stopPropagation()} style={{position:"fixed",top:pos.top,left:pos.left,zIndex:9999,background:"#fff",borderRadius:12,border:"1px solid #E5E2DC",boxShadow:"0 8px 32px rgba(0,0,0,.18)",padding:"14px 16px",width:272,fontFamily:"'DM Sans',sans-serif"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:"#6B7280",padding:"2px 6px"}}>‹</button>
            <span style={{fontSize:12.5,fontWeight:700,color:"#1a1a2e"}}>{calMonth.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</span>
            <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))} style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:"#6B7280",padding:"2px 6px"}}>›</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:4}}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:9.5,fontWeight:700,color:"#9CA3AF",padding:"2px 0"}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1}}>
            {calDays().map((d,i)=>{
              if(!d) return <div key={"e"+i}/>;
              const isStart=sameDay(d,start), isEnd=sameDay(d,end||hoverEnd);
              const inR=inRange(d,start,end||hoverEnd);
              const isPost=[1,3,5].includes(d.getDay());
              return (
                <button key={i} onClick={()=>pickDay(d)} onMouseEnter={()=>setHover(d)} onMouseLeave={()=>setHover(null)}
                  style={{textAlign:"center",padding:"5px 2px",border:"none",cursor:"pointer",fontSize:12,fontWeight:isStart||isEnd?800:isPost?600:400,
                    background:isStart||isEnd?"#4338CA":inR?"#EEF2FF":"transparent",
                    color:isStart||isEnd?"#fff":inR?"#4338CA":isPost?"#6366F1":"#374151",
                    borderRadius:isStart?"6px 0 0 6px":isEnd?"0 6px 6px 0":inR?"0":"6px",
                  }}>
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          {start&&!end&&<div style={{marginTop:10,fontSize:10.5,color:"#9CA3AF",textAlign:"center"}}>Now pick an end date</div>}
          {start&&end&&<div style={{marginTop:10,fontSize:10.5,fontWeight:600,color:"#4338CA",textAlign:"center"}}>📅 {startDate} – {endDate}</div>}
        </div>
      )}
    </div>
  );
}

function SmPostRow({post,onUpdate,onRemove}){
  const c=SSC[post.status];
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,background:post.urgent?"#FFF1F2":"#fff",borderRadius:7,padding:"7px 10px",border:post.urgent?"1.5px solid #FECDD3":"1px solid #E5E2DC",flexWrap:"wrap"}}>
      <input value={post.name} onChange={e=>onUpdate(post.id,"name",e.target.value)} placeholder="Post caption / description..." style={{flex:"1 1 160px",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"4px 8px",fontSize:12,fontFamily:"'DM Sans',sans-serif",color:"#1a1a2e",background:"#FAFAF9",outline:"none",boxSizing:"border-box"}}/>
      <div style={{flex:"0 0 180px",position:"relative"}}>
        <select value={post.status} onChange={e=>onUpdate(post.id,"status",e.target.value)} style={{width:"100%",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"4px 22px 4px 8px",fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:c?.text,background:c?.bg,outline:"none",cursor:"pointer",appearance:"none",boxSizing:"border-box"}}>
          {SM_STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        <span style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:8,color:"#9CA3AF"}}>▾</span>
      </div>
      <button onClick={()=>onUpdate(post.id,"needsDesign",!post.needsDesign)} style={{border:post.needsDesign?"1.5px solid #8B5CF6":"1.5px solid #E5E2DC",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,cursor:"pointer",background:post.needsDesign?"#F5F3FF":"#FAFAF9",color:post.needsDesign?"#7C3AED":"#9CA3AF"}}>🎨</button>
      <button onClick={()=>onUpdate(post.id,"urgent",!post.urgent)} title={post.urgent?"Remove urgent":"Mark urgent"} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,padding:"2px 3px",lineHeight:1,opacity:post.urgent?1:0.3}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=post.urgent?"1":"0.3"}>🚨</button>
      <button onClick={()=>onRemove(post.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:13,padding:"2px 3px",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#F43F5E"} onMouseLeave={e=>e.currentTarget.style.color="#D1D5DB"}>✕</button>
    </div>
  );
}

function SmBatchRow({batch,onUpdate,openCalId,setOpenCalId}){
  const c=SSC[batch.status];
  function addPost(){onUpdate({...batch,posts:[...batch.posts,newSmPost()]});}
  function remPost(pid){onUpdate({...batch,posts:batch.posts.filter(p=>p.id!==pid)});}
  function updPost(pid,f,v){onUpdate({...batch,posts:batch.posts.map(p=>p.id===pid?{...p,[f]:v}:p)});}
  return (
    <div style={{background:"#FAFAF9",borderRadius:10,border:"1px solid #EEEBE6",overflow:"hidden",marginBottom:6}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:c?.bg||"#F8F7F4",borderBottom:batch.posts.length>0?`1px solid ${c?.border||"#E5E2DC"}`:"none",flexWrap:"wrap"}}>
        <span style={{fontSize:11,fontWeight:800,color:"#1a1a2e",minWidth:50}}>{batch.week}</span>
        <DateRangePicker startDate={batch.startDate} endDate={batch.endDate} onUpdate={obj=>onUpdate({...batch,...obj})} openId={openCalId} batchId={batch.id} setOpenId={setOpenCalId}/>
        <div style={{flex:"0 0 182px",position:"relative"}}>
          <select value={batch.status} onChange={e=>onUpdate({...batch,status:e.target.value})} style={{width:"100%",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"4px 22px 4px 8px",fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:c?.text,background:c?.bg,outline:"none",cursor:"pointer",appearance:"none",boxSizing:"border-box"}}>
            {SM_STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
          <span style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:8,color:"#9CA3AF"}}>▾</span>
        </div>
        <span style={{fontSize:11,color:"#9CA3AF",flex:1}}>{batch.posts.length} post{batch.posts.length!==1?"s":""}</span>
        <button onClick={addPost} style={{background:"rgba(255,255,255,.7)",border:"none",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,color:"#6B6860",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.background="#1a1a2e";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.7)";e.currentTarget.style.color="#6B6860";}}>+ Post</button>
      </div>
      {batch.posts.length>0&&<div style={{padding:"8px 14px",display:"flex",flexDirection:"column",gap:5}}>{batch.posts.map(p=><SmPostRow key={p.id} post={p} onUpdate={updPost} onRemove={remPost}/>)}</div>}
    </div>
  );
}

function SmClientCard({client,onUpdate,onRemove,openCalId,setOpenCalId}){
  function updBatch(bid,d){onUpdate({...client,batches:client.batches.map(b=>b.id===bid?d:b)});}
  function addWeek(){
    if(client.batches.length>=5) return;
    const nextNum=client.batches.length+1;
    const label="Week "+nextNum;
    onUpdate({...client,batches:[...client.batches,newSmBatch(label)],expanded:true});
  }
  function remWeek(){
    if(client.batches.length<=1) return;
    onUpdate({...client,batches:client.batches.slice(0,-1)});
  }
  const tot=client.batches.reduce((a,b)=>a+b.posts.length,0);
  const des=client.batches.reduce((a,b)=>a+b.posts.filter(p=>p.needsDesign).length,0);
  const canAdd=client.batches.length<5;
  const canRem=client.batches.length>1;
  return (
    <div style={{background:"#fff",borderRadius:12,border:"1px solid #E5E2DC",boxShadow:"0 1px 4px rgba(0,0,0,.04)",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 16px",cursor:"pointer",userSelect:"none"}} onClick={()=>onUpdate({...client,expanded:!client.expanded})}>
        <span style={{fontSize:10,color:"#9CA3AF",transform:client.expanded?"rotate(90deg)":"rotate(0)",transition:"transform .2s",flexShrink:0,width:12}}>▶</span>
        <div style={{flex:1,minWidth:0}}><span style={{fontSize:13.5,fontWeight:700,color:"#1a1a2e",fontFamily:"'DM Sans',sans-serif"}}>{client.clientName}</span>{client.note&&<span style={{marginLeft:8,fontSize:11,color:"#9CA3AF",fontStyle:"italic"}}>{client.note}</span>}</div>
        <span style={{fontSize:11,color:"#9CA3AF",whiteSpace:"nowrap"}}>{client.batches.length} wk · {tot} posts</span>
        {des>0&&<span style={{fontSize:10.5,fontWeight:700,color:"#7C3AED",background:"#F5F3FF",border:"1px solid #DDD6FE",borderRadius:20,padding:"1px 8px"}}>🎨 {des}</span>}
        <div style={{display:"flex",alignItems:"center",gap:4}} onClick={e=>e.stopPropagation()}>
          <button onClick={remWeek} disabled={!canRem} title="Remove last week"
            style={{width:24,height:24,borderRadius:6,border:"1.5px solid #E5E2DC",background:canRem?"#F0EEE9":"#F8F7F4",color:canRem?"#6B6860":"#D1D5DB",cursor:canRem?"pointer":"not-allowed",fontSize:14,fontWeight:700,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}
            onMouseEnter={e=>{if(canRem){e.currentTarget.style.background="#1a1a2e";e.currentTarget.style.color="#fff";}}}
            onMouseLeave={e=>{if(canRem){e.currentTarget.style.background="#F0EEE9";e.currentTarget.style.color="#6B6860";}}}>−</button>
          <span style={{fontSize:11,fontWeight:700,color:"#9CA3AF",minWidth:14,textAlign:"center"}}>{client.batches.length}</span>
          <button onClick={addWeek} disabled={!canAdd} title="Add week"
            style={{width:24,height:24,borderRadius:6,border:"1.5px solid #E5E2DC",background:canAdd?"#F0EEE9":"#F8F7F4",color:canAdd?"#6B6860":"#D1D5DB",cursor:canAdd?"pointer":"not-allowed",fontSize:14,fontWeight:700,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}
            onMouseEnter={e=>{if(canAdd){e.currentTarget.style.background="#1a1a2e";e.currentTarget.style.color="#fff";}}}
            onMouseLeave={e=>{if(canAdd){e.currentTarget.style.background="#F0EEE9";e.currentTarget.style.color="#6B6860";}}}>+</button>
        </div>
        <button onClick={e=>{e.stopPropagation();onRemove();}} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:15,padding:"2px 3px",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#F43F5E"} onMouseLeave={e=>e.currentTarget.style.color="#D1D5DB"}>✕</button>
      </div>
      {(client.showNote||client.clientNote)&&<div style={{padding:"0 16px 8px"}}><textarea value={client.clientNote||""} onChange={e=>onUpdate({...client,clientNote:e.target.value})} placeholder="Client note... (e.g. on vacation March 10)" rows={2} style={{width:"100%",border:"1.5px solid #FDE68A",borderRadius:7,padding:"6px 10px",fontSize:12,fontFamily:"'DM Sans',sans-serif",color:"#92400E",background:"#FFFBEB",outline:"none",resize:"vertical",boxSizing:"border-box"}}/></div>}
      {client.expanded&&<div style={{padding:"0 16px 14px"}}>{client.batches.map(b=><SmBatchRow key={b.id} batch={b} onUpdate={d=>updBatch(b.id,d)} openCalId={openCalId} setOpenCalId={setOpenCalId}/>)}</div>}
    </div>
  );
}

function SmSection({title,accent,list,onUpdate,onRemove,openCalId,setOpenCalId}){
  return (
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:3,height:20,borderRadius:2,background:accent}}/>
        <h3 style={{margin:0,fontSize:13,fontWeight:800,color:"#1a1a2e",letterSpacing:"0.08em",textTransform:"uppercase"}}>{title}</h3>
        <span style={{fontSize:11,fontWeight:700,color:accent,background:accent+"18",borderRadius:20,padding:"2px 10px"}}>{list.length}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>{list.map(c=><SmClientCard key={c.clientId} client={c} onUpdate={onUpdate} onRemove={()=>onRemove(c.clientId)} openCalId={openCalId} setOpenCalId={setOpenCalId}/>)}</div>
    </div>
  );
}

function SmClientTypes({clients,onUpdate,onRemove,sorted,openCalId,setOpenCalId}){
  const srt=arr=>sorted?[...arr].sort((a,b)=>a.clientName.localeCompare(b.clientName)):arr;
  return <div><SmSection title="Agents" accent="#6366F1" list={srt(clients.filter(c=>c.type==="agent"))} onUpdate={onUpdate} onRemove={onRemove} openCalId={openCalId} setOpenCalId={setOpenCalId}/><SmSection title="Developers" accent="#F97316" list={srt(clients.filter(c=>c.type==="dev"))} onUpdate={onUpdate} onRemove={onRemove} openCalId={openCalId} setOpenCalId={setOpenCalId}/></div>;
}

function SmBatchCard({item}){
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#FAFAF9",borderRadius:8,border:"1px solid #EEEBE6",flexWrap:"wrap"}}>
      <span style={{fontSize:10.5,fontWeight:700,color:"#B0ABA5",background:"#F0EEE9",borderRadius:5,padding:"2px 8px",whiteSpace:"nowrap"}}>{item.week}</span>
      {item.range&&<span style={{fontSize:10.5,color:"#9CA3AF",whiteSpace:"nowrap"}}>{item.range}</span>}
      {item.postCount>0&&<div style={{flex:1,minWidth:80}}><span style={{fontSize:12.5,fontWeight:600,color:"#1a1a2e"}}>{item.postCount} post{item.postCount!==1?"s":""}</span></div>}
      {item.postCount===0&&<div style={{flex:1}}/>}
      <span style={{fontSize:11,color:"#9CA3AF",whiteSpace:"nowrap"}}>{item.clientName}</span>
    </div>
  );
}

function SmPostCard({item}){
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#FAFAF9",borderRadius:8,border:"1px solid #EEEBE6",flexWrap:"wrap"}}>
      <span style={{fontSize:10.5,fontWeight:700,color:"#B0ABA5",background:"#F0EEE9",borderRadius:5,padding:"2px 8px",whiteSpace:"nowrap"}}>{item.week}</span>
      {item.range&&<span style={{fontSize:10.5,color:"#9CA3AF",whiteSpace:"nowrap"}}>{item.range}</span>}
      <div style={{flex:1,minWidth:80}}><span style={{fontSize:13,fontWeight:600,color:"#1a1a2e"}}>{item.name||<span style={{color:"#C4BFBA",fontStyle:"italic"}}>Unnamed post</span>}</span></div>
      <span style={{fontSize:11,color:"#9CA3AF",whiteSpace:"nowrap"}}>{item.clientName}</span>
      {item.needsDesign&&<span style={{fontSize:11}}>🎨</span>}
    </div>
  );
}

function SmStatusBreakdown({clients}){
  const {bByStatus,pByStatus,designPosts}=useMemo(()=>{
    const bs={},ps={};
    SM_STATUSES.forEach(s=>{bs[s]=[];ps[s]=[];});
    const des=[];
    clients.forEach(c=>{
      c.batches.forEach(b=>{
        const range=fmtRange(b.startDate,b.endDate);
        bs[b.status]?.push({id:b.id,week:b.week,range,clientName:c.clientName,postCount:b.posts.length,hasPosts:b.posts.length>0});
        b.posts.forEach(p=>{
          const item={id:p.id,name:p.name,status:p.status,clientName:c.clientName,week:b.week,range,needsDesign:p.needsDesign};
          ps[p.status]?.push(item);
          if(p.needsDesign) des.push(item);
        });
      });
    });
    return {bByStatus:bs,pByStatus:ps,designPosts:des};
  },[clients]);

  const totB=clients.reduce((a,c)=>a+c.batches.length,0);
  const totP=clients.reduce((a,c)=>a+c.batches.reduce((b,bt)=>b+bt.posts.length,0),0);
  const pieData=SM_STATUSES.map(s=>({name:s,value:bByStatus[s].length})).filter(d=>d.value>0);
  const actB=SM_STATUSES.filter(s=>bByStatus[s].length>0);
  const empB=SM_STATUSES.filter(s=>bByStatus[s].length===0);
  const actP=SM_STATUSES.filter(s=>pByStatus[s].length>0);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {pieData.length>0&&(
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E2DC",padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
          <div style={{fontSize:11,fontWeight:800,color:"#1a1a2e",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>Week Batch Status Distribution</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginBottom:10}}>{totB} batches · {totP} posts</div>
          <ResponsiveContainer width="100%" height={230}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={88} dataKey="value" labelLine={false} label={<PieLabel/>}>{pieData.map((d,i)=><Cell key={i} fill={SSC[d.name]?.pie||"#9CA3AF"}/>)}</Pie><Tooltip content={<TTip/>}/><Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:11,color:"#374151"}}>{v}</span>} wrapperStyle={{paddingTop:10}}/></PieChart></ResponsiveContainer>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {actB.map(s=>{const c=SSC[s],items=bByStatus[s];return(
        <div key={s} style={{background:"#fff",borderRadius:12,border:`1px solid ${c.border}`,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 18px",background:c.bg,borderBottom:`1px solid ${c.border}`}}>
            <span style={{width:9,height:9,borderRadius:"50%",background:c.dot,flexShrink:0}}/><span style={{fontSize:13,fontWeight:700,color:c.text,flex:1}}>{s}</span><span style={{fontSize:11.5,fontWeight:700,color:c.text,background:"rgba(255,255,255,.6)",borderRadius:20,padding:"1px 10px"}}>{items.length} week{items.length!==1?"s":""}</span>
          </div>
          <div style={{padding:"10px 18px",display:"flex",flexDirection:"column",gap:6}}>{items.map(item=><SmBatchCard key={item.id} item={item}/>)}</div>
        </div>
      );})}
      </div>
      {empB.length>0&&<div><div style={{fontSize:10,fontWeight:700,color:"#C4BFBA",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8}}>Empty stages</div><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{empB.map(s=><span key={s} style={{display:"inline-flex",alignItems:"center",gap:5,background:"#F8F7F4",color:"#B0ABA5",border:"1px solid #E5E2DC",padding:"4px 12px",borderRadius:20,fontSize:11.5,fontWeight:600}}><span style={{width:6,height:6,borderRadius:"50%",background:SSC[s].dot,opacity:.35}}/>{s}</span>)}</div></div>}
      {totP>0&&<div style={{display:"flex",alignItems:"center",gap:12,margin:"4px 0"}}><div style={{flex:1,height:1,background:"#E5E2DC"}}/><span style={{fontSize:11,fontWeight:700,color:"#9CA3AF",letterSpacing:"0.07em",textTransform:"uppercase",whiteSpace:"nowrap"}}>Individual Posts</span><div style={{flex:1,height:1,background:"#E5E2DC"}}/></div>}
      {designPosts.length>0&&(
        <div style={{background:"#fff",borderRadius:12,border:"1.5px solid #DDD6FE",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 18px",background:"#F5F3FF",borderBottom:"1px solid #DDD6FE"}}>
            <span style={{fontSize:15}}>🎨</span><span style={{fontSize:13,fontWeight:700,color:"#7C3AED",flex:1}}>Individual Design Requests</span><span style={{fontSize:11.5,fontWeight:700,color:"#7C3AED",background:"rgba(255,255,255,.6)",borderRadius:20,padding:"1px 10px"}}>{designPosts.length}</span>
          </div>
          <div style={{padding:"10px 18px",display:"flex",flexDirection:"column",gap:6}}>{designPosts.map(item=><SmPostCard key={item.id} item={item}/>)}</div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {actP.map(s=>{const c=SSC[s],items=pByStatus[s];return(
        <div key={"p"+s} style={{background:"#fff",borderRadius:12,border:`1px solid ${c.border}`,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 18px",background:c.bg,borderBottom:`1px solid ${c.border}`}}>
            <span style={{width:9,height:9,borderRadius:"50%",background:c.dot,flexShrink:0}}/><span style={{fontSize:13,fontWeight:700,color:c.text,flex:1}}>{s} <span style={{fontWeight:400,opacity:.6,fontSize:11}}>(posts)</span></span><span style={{fontSize:11.5,fontWeight:700,color:c.text,background:"rgba(255,255,255,.6)",borderRadius:20,padding:"1px 10px"}}>{items.length}</span>
          </div>
          <div style={{padding:"10px 18px",display:"flex",flexDirection:"column",gap:6}}>{items.map(item=><SmPostCard key={item.id} item={item}/>)}</div>
        </div>
      );})}
      </div>
    </div>
  );
}

function SmNewClientForm({onAdd, onCancel}){
  const [name,setName]=useState("");
  const [type,setType]=useState("agent");
  function submit(){if(!name.trim())return;onAdd(name.trim(),type);}
  return (
    <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap",borderTop:"1px solid #F0EEE9",paddingTop:12}}>
      <div style={{flex:"1 1 150px"}}><label style={{display:"block",fontSize:9.5,fontWeight:700,color:"#9CA3AF",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:4}}>New Client Name</label><input autoFocus value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="e.g. New Client" style={{width:"100%",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"6px 10px",fontSize:13,color:"#1a1a2e",outline:"none",boxSizing:"border-box"}}/></div>
      <div style={{flex:"0 0 120px"}}><label style={{display:"block",fontSize:9.5,fontWeight:700,color:"#9CA3AF",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:4}}>Type</label>
        <div style={{position:"relative"}}><select value={type} onChange={e=>setType(e.target.value)} style={{width:"100%",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"6px 22px 6px 10px",fontSize:13,color:"#1a1a2e",background:"#fff",outline:"none",cursor:"pointer",appearance:"none",boxSizing:"border-box"}}><option value="agent">Agent</option><option value="dev">Developer</option></select><span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:8,color:"#9CA3AF"}}>▾</span></div>
      </div>
      <div style={{display:"flex",gap:7}}><button onClick={submit} style={{background:"#1a1a2e",color:"#fff",border:"none",padding:"7px 15px",borderRadius:7,cursor:"pointer",fontSize:12.5,fontWeight:700}}>Add</button><button onClick={onCancel} style={{background:"#F3F4F6",color:"#6B7280",border:"none",padding:"7px 13px",borderRadius:7,cursor:"pointer",fontSize:12.5,fontWeight:600}}>Cancel</button></div>
    </div>
  );
}

function SocialMediaTab({data, setData, registry}){
  const [month,setMonth]=useState(new Date().getMonth());
  const [view,setView]=useState(1);
  const [sorted,setSorted]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [undoItem,setUndoItem]=useState(null);
  const [openCalId,setOpenCalId]=useState(null);
  const [search,setSearch]=useState("");
  const clients=data[month]||[];

  function upd(d){setData({...data,[month]:data[month].map(c=>c.clientId===d.clientId?d:c)});}
  function rem(cid){
    const client=clients.find(c=>c.clientId===cid);
    setData({...data,[month]:data[month].filter(c=>c.clientId!==cid)});
    setUndoItem({clientName:client.clientName, restoreFn:()=>setData({...data,[month]:[...data[month],client]})});
  }
  function addPreset(preset){
    setData({...data,[month]:[...data[month],{clientId:uid(),clientName:preset.name,note:preset.note||"",type:preset.type,expanded:true,batches:WEEKS.map(w=>newSmBatch(w))}]});
    setShowAdd(false);
  }

  const currentNames=new Set(clients.map(c=>c.clientName));
  const allPresets = registry ? registry.filter(c=>c.services?.social).map(c=>({...c,type:c.type,note:""})) : [...SM_AGENTS.map(a=>({...a,type:"agent"})),...SM_DEVS.map(d=>({...d,type:"dev"}))];
  const availablePresets=allPresets.filter(p=>!currentNames.has(p.name));

  const totP=clients.reduce((a,c)=>a+c.batches.reduce((b,bt)=>b+bt.posts.length,0),0);
  const urgSm=clients.reduce((a,c)=>a+c.batches.reduce((b,bt)=>b+bt.posts.filter(p=>p.urgent).length,0),0);
  const dispClients=search.trim()?clients.filter(c=>c.clientName.toLowerCase().includes(search.toLowerCase())):clients;
  return (
    <div style={{display:"flex",height:"100%",minHeight:0,overflow:"hidden"}}>
      <MonthSidebar months={MONTHS} active={month} setActive={setMonth} getData={i=>{const mc=data[i]||[];const tot=mc.reduce((a,c)=>a+c.batches.reduce((b,bt)=>b+bt.posts.length,0),0);const posted=mc.reduce((a,c)=>a+c.batches.reduce((b,bt)=>b+bt.posts.filter(p=>p.status==="Posted").length,0),0);return{top:posted,bot:tot};}}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10}}>
          <div><h2 style={{margin:0,fontSize:21,fontFamily:"'DM Serif Display',serif",color:"#1a1a2e"}}>Social Media — {MONTHS[month]}</h2><p style={{margin:"3px 0 0",fontSize:12,color:"#9CA3AF"}}>{clients.length} clients · {totP} posts{urgSm>0&&<span style={{marginLeft:8,color:"#BE123C",fontWeight:600}}>· 🚨 {urgSm} urgent</span>}</p></div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search clients…"/>
            <AZBtn sorted={sorted} onToggle={()=>setSorted(v=>!v)}/>
            {view===0&&<button onClick={()=>setShowAdd(v=>!v)} style={{background:"#1a1a2e",color:"#fff",border:"none",padding:"8px 15px",borderRadius:8,cursor:"pointer",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:14}}>+</span> Add Client</button>}
          </div>
        </div>
        {showAdd&&view===0&&(
          <div style={{background:"#fff",border:"1.5px solid #6366F1",borderRadius:10,padding:"14px 16px",marginBottom:14}}>
            {availablePresets.length>0&&<PresetPicker presets={availablePresets} onSelect={addPreset} onClose={()=>setShowAdd(false)}/>}
            <SmNewClientForm onAdd={(name,type)=>{setData({...data,[month]:[...data[month],{clientId:uid(),clientName:name,note:"",type,expanded:true,batches:WEEKS.map(w=>newSmBatch(w))}]});setShowAdd(false);}} onCancel={()=>setShowAdd(false)}/>
          </div>
        )}
        <div style={{marginBottom:18}}><SubTabs options={["Client Types","Status Breakdown"]} active={view} onChange={setView}/></div>
        {view===0&&<SmClientTypes clients={dispClients} onUpdate={upd} onRemove={rem} sorted={sorted} openCalId={openCalId} setOpenCalId={setOpenCalId}/>}
        {view===1&&<SmStatusBreakdown clients={clients}/>}
      </div>
      {undoItem&&<UndoToast item={undoItem} onUndo={()=>{undoItem.restoreFn();setUndoItem(null);}} onDismiss={()=>setUndoItem(null)}/>}
    </div>
  );
}


function PSTypeBadge({type}){
  const ag=type==="agent";
  return <span style={{fontSize:10.5,fontWeight:700,padding:"2px 9px",borderRadius:20,border:`1px solid ${ag?"#BFDBFE":"#BBF7D0"}`,color:ag?"#1D4ED8":"#15803D",background:ag?"#EFF6FF":"#F0FDF4",whiteSpace:"nowrap"}}>{ag?"Agent":"Developer"}</span>;
}

function PSCheckCell({clientId, day, disabled, checked, onToggle}){
  if(disabled) return <div style={{width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#D1D5DB",fontSize:16,fontWeight:300}}>—</span></div>;
  return (
    <div onClick={()=>onToggle(clientId,day)}
      style={{width:22,height:22,borderRadius:5,border:checked?"2px solid #16A34A":"2px solid #D1D5DB",background:checked?"#16A34A":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .12s",flexShrink:0}}>
      {checked&&<span style={{color:"#fff",fontSize:13,fontWeight:800,lineHeight:1}}>✓</span>}
    </div>
  );
}

function PSTableRow({client, dayChecks, onToggle}){
  const dean = !!(client.postingFlags?.stories || client.stories);
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 100px 1fr 1fr 1fr 1fr 1fr",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid #F3F4F6",gap:8}}
      onMouseEnter={e=>e.currentTarget.style.background="#FAFAF9"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div>
        <span style={{fontSize:13.5,fontWeight:600,color:"#1a1a2e",fontFamily:"'DM Sans',sans-serif"}}>{client.name}</span>
        {dean&&<span style={{marginLeft:7,fontSize:10,fontWeight:700,color:"#7C3AED",background:"#F5F3FF",border:"1px solid #DDD6FE",borderRadius:20,padding:"1px 7px"}}>+Stories</span>}
      </div>
      <PSTypeBadge type={client.type}/>
      <div style={{display:"flex",justifyContent:"center"}}><PSCheckCell clientId={client.id} day="mon" disabled={false} checked={dayChecks[client.id]?.mon||false} onToggle={onToggle}/></div>
      <div style={{display:"flex",justifyContent:"center"}}><PSCheckCell clientId={client.id} day="tue" disabled={!dean} checked={dean?(dayChecks[client.id]?.tue||false):false} onToggle={onToggle}/></div>
      <div style={{display:"flex",justifyContent:"center"}}><PSCheckCell clientId={client.id} day="wed" disabled={false} checked={dayChecks[client.id]?.wed||false} onToggle={onToggle}/></div>
      <div style={{display:"flex",justifyContent:"center"}}><PSCheckCell clientId={client.id} day="thu" disabled={!dean} checked={dean?(dayChecks[client.id]?.thu||false):false} onToggle={onToggle}/></div>
      <div style={{display:"flex",justifyContent:"center"}}><PSCheckCell clientId={client.id} day="fri" disabled={!!(client.postingFlags?.noFriday || client.noFriday)} checked={dayChecks[client.id]?.fri||false} onToggle={onToggle}/></div>
    </div>
  );
}

function PSSection({title, badge, badgeColor, borderColor, clients, sorted, dayChecks, onToggle}){
  const list = sorted ? [...clients].sort((a,b)=>a.name.localeCompare(b.name)) : clients;
  return (
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E2DC",borderLeft:`3px solid ${borderColor}`,boxShadow:"0 1px 4px rgba(0,0,0,.04)",overflow:"hidden",marginBottom:16}}>
      <div style={{padding:"16px 18px 12px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:15,fontWeight:800,color:"#1a1a2e",fontFamily:"'DM Serif Display',serif"}}>{title}</span>
        <span style={{fontSize:11,fontWeight:700,padding:"3px 11px",borderRadius:20,background:badgeColor.bg,color:badgeColor.text}}>{badge}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 100px 1fr 1fr 1fr 1fr 1fr",padding:"8px 16px 10px",borderBottom:"1px solid #F0EEE9",gap:8}}>
        {["Account","Type","Monday","Tuesday","Wednesday","Thursday","Friday"].map((h,i)=>(
          <div key={h} style={{fontSize:10,fontWeight:800,color:i===3||i===5?"#C4B5FD":"#9CA3AF",letterSpacing:"0.07em",textTransform:"uppercase",textAlign:i>=2?"center":"left"}}>{h}</div>
        ))}
      </div>
      {list.map(c=><PSTableRow key={c.id} client={c} dayChecks={dayChecks} onToggle={onToggle}/>)}
    </div>
  );
}

// ── Posting Schedule ────────────────────────────────────────────────────────

const PS_REGULAR = [
  {id:"ps-dean",   name:"Dean",         type:"agent", stories:true},
  {id:"ps-joseph", name:"Joseph",       type:"agent"},
  {id:"ps-paul",   name:"Paul",         type:"agent"},
  {id:"ps-pietro", name:"Pietro",       type:"agent",  noFriday:true},
  {id:"ps-shawn",  name:"Shawn Clarke", type:"agent"},
  {id:"ps-susan",  name:"Susan",        type:"agent",  noFriday:true},
  {id:"ps-tlg",    name:"TLG",          type:"agent"},
  {id:"ps-trc",    name:"TRC",          type:"agent"},
  {id:"ps-vsg",    name:"VSG",          type:"agent",  noFriday:true},
  {id:"ps-72c",    name:"72 Carlyle",   type:"developer"},
  {id:"ps-rd14",   name:"RD14",         type:"developer"},
  {id:"ps-ritz",   name:"Ritz Carlton SB", type:"developer"},
];
const PS_PER_REQUEST = [
  {id:"ps-kane",   name:"Kane",         type:"agent"},
  {id:"ps-vis",    name:"Visconti",     type:"agent"},
];

function buildChecks(dateStr){
  const all=[...PS_REGULAR,...PS_PER_REQUEST];
  const m={};
  all.forEach(c=>{m[c.id]={mon:false,tue:false,wed:false,thu:false,fri:false};});
  return m;
}

function fmtDateKey(d){ return d.toISOString().slice(0,10); }
// Returns the Monday of the week containing date d, as YYYY-MM-DD string
// This is the key for weekly checkbox storage
function getWeekKey(d){
  const dow = d.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const daysBack = dow===0 ? 6 : dow-1; // back to Monday
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate()-daysBack);
  return fmtDateKey(mon);
}

function PostingSchedule({checks, setChecks, registry}){
  const today = new Date();
  const [selDate, setSelDate] = useState(today);
  const [sorted, setSorted] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Derive posting lists from registry
  const psClients = registry ? registry.filter(c=>c.services?.social) : [...PS_REGULAR,...PS_PER_REQUEST];
  const psRegular = psClients.filter(c=>(c.postingType||"regular")==="regular");
  const psPerRequest = psClients.filter(c=>c.postingType==="per-request");

  const weekKey = getWeekKey(selDate);
  function buildDynamicChecks(){
    const m={};
    psClients.forEach(c=>{m[c.id]={mon:false,tue:false,wed:false,thu:false,fri:false};});
    return m;
  }
  const dayChecks = checks[weekKey] || buildDynamicChecks();

  function toggle(clientId, day){
    const cur = checks[weekKey] || buildDynamicChecks();
    const next = {...checks, [weekKey]: {...cur, [clientId]: {...(cur[clientId]||{mon:false,tue:false,wed:false,thu:false,fri:false}), [day]: !(cur[clientId]?.[day]||false)}}};
    setChecks(next);
  }

  const dow = selDate.getDay();
  const isPostingDay = dow===1||dow===3||dow===5;
  const dayName = selDate.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  // Week range label for the selected date's week
  const wkMonDate = new Date(selDate.getFullYear(),selDate.getMonth(),selDate.getDate()-(dow===0?6:dow-1));
  const wkFriDate = new Date(wkMonDate.getFullYear(),wkMonDate.getMonth(),wkMonDate.getDate()+4);
  const weekLabel = wkMonDate.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" – "+wkFriDate.toLocaleDateString("en-US",{month:"short",day:"numeric"});

  // Sort helpers
  // Calendar helpers
  function calDays(){
    const yr=calMonth.getFullYear(), mo=calMonth.getMonth();
    const first=new Date(yr,mo,1).getDay();
    const last=new Date(yr,mo+1,0).getDate();
    const days=[];
    for(let i=0;i<first;i++) days.push(null);
    for(let i=1;i<=last;i++) days.push(new Date(yr,mo,i));
    return days;
  }
  function isSameDay(a,b){ return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
  function isPostDay(d){ if(!d) return false; const dw=d.getDay(); return dw===1||dw===3||dw===5; }

  return (
    <div style={{overflowY:"auto",height:"100%",padding:"20px 28px"}}>
      {/* Header card */}
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E2DC",borderLeft:"3px solid #6366F1",padding:"18px 22px",marginBottom:20,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:40,height:40,borderRadius:10,background:"#EEF2FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📅</div>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:"#1a1a2e",fontFamily:"'DM Serif Display',serif"}}>Social Media Posting Schedule</div>
            <div style={{fontSize:12,color:"#9CA3AF",marginTop:2}}>Monday, Wednesday & Friday</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <AZBtn sorted={sorted} onToggle={()=>setSorted(v=>!v)}/>
          {/* Date picker button */}
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowCal(v=>!v)}
              style={{display:"flex",alignItems:"center",gap:8,border:"1.5px solid #E5E2DC",borderRadius:9,padding:"8px 14px",background:"#FAFAF9",cursor:"pointer",fontSize:13,fontWeight:600,color:"#1a1a2e",fontFamily:"'DM Sans',sans-serif"}}>
              <span style={{fontSize:15}}>📆</span>
              {selDate.toLocaleDateString("en-US",{month:"long",day:"2-digit",year:"numeric"})}
            </button>
            {showCal&&(
              <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",zIndex:100,background:"#fff",borderRadius:12,border:"1px solid #E5E2DC",boxShadow:"0 8px 32px rgba(0,0,0,.12)",padding:"14px 16px",width:280}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#6B7280",padding:"2px 6px"}}>‹</button>
                  <span style={{fontSize:13,fontWeight:700,color:"#1a1a2e"}}>{calMonth.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</span>
                  <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#6B7280",padding:"2px 6px"}}>›</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:6}}>
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:"#9CA3AF",padding:"2px 0"}}>{d}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
                  {calDays().map((d,i)=>{
                    if(!d) return <div key={"e"+i}/>;
                    const sel=isSameDay(d,selDate), todayD=isSameDay(d,today), post=isPostDay(d);
                    return (
                      <button key={i} onClick={()=>{setSelDate(d);setShowCal(false);}}
                        style={{textAlign:"center",padding:"6px 2px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:sel?800:post?600:400,
                          background:sel?"#1a1a2e":todayD?"#EEF2FF":"transparent",
                          color:sel?"#fff":post?"#4338CA":"#9CA3AF",
                          outline:todayD&&!sel?"2px solid #C7D2FE":"none",outlineOffset:"-2px"}}>
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day context banner */}
      <div style={{marginBottom:18,padding:"10px 16px",borderRadius:9,border:"1px solid #C7D2FE",background:"#EEF2FF",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:14}}>📅</span>
        <span style={{fontSize:12.5,fontFamily:"'DM Sans',sans-serif",color:"#4338CA"}}>
          <strong>Week of {weekLabel}</strong>{" — "}
          {isPostingDay
            ? <span>Viewing from <strong>{selDate.toLocaleDateString("en-US",{weekday:"long"})}</strong>. Checks apply to the whole week.</span>
            : <span style={{color:"#92400E"}}>No posting on {selDate.toLocaleDateString("en-US",{weekday:"long"})} — but you can still view and update this week's schedule.</span>}
        </span>
      </div>

      <PSSection title="Regular Posting Schedule" badge="Monday, Wednesday, Friday" badgeColor={{bg:"#EFF6FF",text:"#1D4ED8"}} borderColor="#3B82F6" clients={psRegular} sorted={sorted} dayChecks={dayChecks} onToggle={toggle}/>
      <PSSection title="Per Request" badge="As Needed" badgeColor={{bg:"#F5F3FF",text:"#7C3AED"}} borderColor="#8B5CF6" clients={psPerRequest} sorted={sorted} dayChecks={dayChecks} onToggle={toggle}/>

      {/* Posting History */}
      {Object.keys(checks).length>0&&(()=>{
        const allDays=["mon","tue","wed","thu","fri"];
        const DAY_LABELS={mon:"Mon",tue:"Tue",wed:"Wed",thu:"Thu",fri:"Fri"};
        const history=Object.entries(checks)
          .map(([dk,dc])=>({dk,anyChecked:Object.values(dc).some(d=>Object.values(d).some(Boolean)),dc}))
          .filter(({anyChecked,dk})=>anyChecked&&dk!==weekKey)
          .sort((a,b)=>b.dk.localeCompare(a.dk))
          .slice(0,30);
        if(!history.length) return null;
        return (
          <div style={{marginTop:8}}>
            <div style={{fontSize:11,fontWeight:800,color:"#9CA3AF",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:10}}>Posting History</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {history.map(({dk,dc})=>{
                const monD=new Date(dk+"T12:00:00");
                const friD=new Date(monD.getFullYear(),monD.getMonth(),monD.getDate()+4);
                const label="Week of "+monD.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" – "+friD.toLocaleDateString("en-US",{month:"short",day:"numeric"});
                const allClients=psClients;
                const checked=allClients.filter(cl=>allDays.some(day=>dc[cl.id]?.[day]));
                return (
                  <div key={dk} style={{background:"#fff",borderRadius:10,border:"1px solid #E5E2DC",padding:"10px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                    <span style={{fontSize:12,fontWeight:700,color:"#1a1a2e",minWidth:90,whiteSpace:"nowrap"}}>{label}</span>
                    <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:5}}>
                      {checked.map(cl=>{
                        const days=allDays.filter(day=>dc[cl.id]?.[day]);
                        return <span key={cl.id} style={{fontSize:11,background:"#F0FDF4",color:"#15803D",border:"1px solid #BBF7D0",borderRadius:20,padding:"2px 9px",whiteSpace:"nowrap"}}>{cl.name} <span style={{opacity:.7}}>{days.map(d=>DAY_LABELS[d]).join(" · ")}</span></span>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}


function ClientTypeBadge({type}){
  const ag = type==="agent";
  return <span style={{fontSize:10.5,fontWeight:700,padding:"2px 9px",borderRadius:20,border:`1px solid ${ag?"#BFDBFE":"#BBF7D0"}`,color:ag?"#1D4ED8":"#15803D",background:ag?"#EFF6FF":"#F0FDF4",whiteSpace:"nowrap"}}>{ag?"Agent":"Developer"}</span>;
}

function RegistryModal({registry, onSave, onClose}){
  const [list, setList] = useState(registry.map(c=>({...c, services:{...c.services}, postingFlags:{...c.postingFlags}})));
  const [editId, setEditId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState({name:"",type:"agent",scope:"Per Request",services:{email:true,social:false},postingType:"regular",postingFlags:{noFriday:false,stories:false}});
  const [confirmRemove, setConfirmRemove] = useState(null);
  const SCOPES = ["Per Request","2 Eblasts/MO","3 Eblasts/MO","4 Eblasts/MO","5 Eblasts/MO"];

  function updateClient(id, field, value){
    setList(p=>p.map(c=>c.id===id?{...c,[field]:value}:c));
  }
  function updateService(id, svc, val){
    setList(p=>p.map(c=>c.id===id?{...c,services:{...c.services,[svc]:val}}:c));
  }
  function updateFlag(id, flag, val){
    setList(p=>p.map(c=>c.id===id?{...c,postingFlags:{...c.postingFlags,[flag]:val}}:c));
  }
  function addClient(){
    if(!newClient.name.trim()) return;
    const nc = {...newClient, id:"r-"+uid(), postingFlags:{...newClient.postingFlags}, services:{...newClient.services}};
    setList(p=>[...p,nc]);
    setNewClient({name:"",type:"agent",scope:"Per Request",services:{email:true,social:false},postingType:"regular",postingFlags:{noFriday:false,stories:false}});
    setShowAdd(false);
  }
  function removeClient(id){
    setList(p=>p.filter(c=>c.id!==id));
    setConfirmRemove(null);
  }

  const editing = list.find(c=>c.id===editId);

  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:780,maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:"1px solid #E5E2DC",flexShrink:0}}>
          <div>
            <h2 style={{margin:0,fontSize:18,fontFamily:"'DM Serif Display',serif",color:"#1a1a2e"}}>Client Registry</h2>
            <p style={{margin:"3px 0 0",fontSize:12,color:"#9CA3AF"}}>{list.length} clients · single source of truth across all tabs</p>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowAdd(v=>!v)} style={{background:"#F0EEE9",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:12.5,fontWeight:700,color:"#1a1a2e"}}>+ Add Client</button>
            <button onClick={()=>onSave(list)} style={{background:"#1a1a2e",color:"#E8E4DC",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:12.5,fontWeight:700}}>Save Changes</button>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#9CA3AF",padding:"4px 8px"}}>✕</button>
          </div>
        </div>

        {/* Add client form */}
        {showAdd&&(
          <div style={{padding:"16px 24px",background:"#F8F7F4",borderBottom:"1px solid #E5E2DC",flexShrink:0}}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div style={{flex:"1 1 160px"}}>
                <label style={{display:"block",fontSize:9.5,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Name</label>
                <input value={newClient.name} onChange={e=>setNewClient(p=>({...p,name:e.target.value}))} placeholder="Client name..." style={{width:"100%",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{flex:"0 0 120px"}}>
                <label style={{display:"block",fontSize:9.5,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Type</label>
                <select value={newClient.type} onChange={e=>setNewClient(p=>({...p,type:e.target.value}))} style={{width:"100%",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"7px 10px",fontSize:13,outline:"none",background:"#fff"}}>
                  <option value="agent">Agent</option>
                  <option value="developer">Developer</option>
                </select>
              </div>
              <div style={{flex:"0 0 140px"}}>
                <label style={{display:"block",fontSize:9.5,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Scope</label>
                <select value={newClient.scope} onChange={e=>setNewClient(p=>({...p,scope:e.target.value}))} style={{width:"100%",border:"1.5px solid #E5E2DC",borderRadius:7,padding:"7px 10px",fontSize:13,outline:"none",background:"#fff"}}>
                  {SCOPES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block",fontSize:9.5,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Services</label>
                <div style={{display:"flex",gap:8}}>
                  {[["email","📧 Email"],["social","📱 Social"]].map(([k,l])=>(
                    <label key={k} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12,fontWeight:600,color:newClient.services[k]?"#4338CA":"#9CA3AF"}}>
                      <input type="checkbox" checked={newClient.services[k]} onChange={e=>setNewClient(p=>({...p,services:{...p.services,[k]:e.target.checked}}))} style={{accentColor:"#6366F1"}}/>
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={addClient} style={{background:"#1a1a2e",color:"#fff",border:"none",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12.5,fontWeight:700}}>Add</button>
                <button onClick={()=>setShowAdd(false)} style={{background:"#F3F4F6",color:"#6B7280",border:"none",borderRadius:7,padding:"7px 12px",cursor:"pointer",fontSize:12.5}}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Column headers */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 90px 130px 90px 90px 90px 80px 36px",gap:8,padding:"8px 24px",background:"#FAFAF9",borderBottom:"1px solid #E5E2DC",flexShrink:0}}>
          {["Client","Type","Scope","Email","Social","Posting","Schedule",""].map((h,i)=>(
            <div key={h+i} style={{fontSize:9.5,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".06em",textAlign:i>=3?"center":"left"}}>{h}</div>
          ))}
        </div>

        {/* Client rows */}
        <div style={{overflowY:"auto",flex:1}}>
          {list.map(client=>{
            const isEdit = editId===client.id;
            return (
              <div key={client.id} style={{display:"grid",gridTemplateColumns:"1fr 90px 130px 90px 90px 90px 80px 36px",gap:8,padding:"10px 24px",borderBottom:"1px solid #F3F4F6",alignItems:"center",background:isEdit?"#FAFAF9":"#fff"}}
                onMouseEnter={e=>e.currentTarget.style.background="#FAFAF9"} onMouseLeave={e=>e.currentTarget.style.background=isEdit?"#FAFAF9":"#fff"}>
                {/* Name */}
                {isEdit
                  ? <input value={client.name} onChange={e=>updateClient(client.id,"name",e.target.value)} style={{border:"1.5px solid #6366F1",borderRadius:6,padding:"4px 8px",fontSize:13,fontWeight:600,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
                  : <span style={{fontSize:13,fontWeight:600,color:"#1a1a2e",cursor:"pointer"}} onClick={()=>setEditId(client.id)}>{client.name}</span>
                }
                {/* Type */}
                {isEdit
                  ? <select value={client.type} onChange={e=>updateClient(client.id,"type",e.target.value)} style={{border:"1.5px solid #E5E2DC",borderRadius:6,padding:"4px 6px",fontSize:11,outline:"none",background:"#fff"}}>
                      <option value="agent">Agent</option>
                      <option value="developer">Developer</option>
                    </select>
                  : <ClientTypeBadge type={client.type}/>
                }
                {/* Scope */}
                {isEdit
                  ? <select value={client.scope||"Per Request"} onChange={e=>updateClient(client.id,"scope",e.target.value)} style={{border:"1.5px solid #E5E2DC",borderRadius:6,padding:"4px 6px",fontSize:11,outline:"none",background:"#fff"}}>
                      {SCOPES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  : <ScopeBadge scope={client.scope}/>
                }
                {/* Email service */}
                <div style={{textAlign:"center"}}>
                  <input type="checkbox" checked={!!client.services?.email} onChange={e=>updateService(client.id,"email",e.target.checked)} style={{width:16,height:16,accentColor:"#6366F1",cursor:"pointer"}}/>
                </div>
                {/* Social service */}
                <div style={{textAlign:"center"}}>
                  <input type="checkbox" checked={!!client.services?.social} onChange={e=>updateService(client.id,"social",e.target.checked)} style={{width:16,height:16,accentColor:"#6366F1",cursor:"pointer"}}/>
                </div>
                {/* Posting type — only relevant if social */}
                <div style={{textAlign:"center"}}>
                  {client.services?.social
                    ? <select value={client.postingType||"regular"} onChange={e=>updateClient(client.id,"postingType",e.target.value)} style={{border:"1px solid #E5E2DC",borderRadius:5,padding:"3px 4px",fontSize:10,outline:"none",background:"#fff",color:"#374151"}}>
                        <option value="regular">Regular</option>
                        <option value="per-request">Per Request</option>
                      </select>
                    : <span style={{color:"#E5E2DC",fontSize:12}}>—</span>
                  }
                </div>
                {/* Posting flags — stories + noFriday */}
                <div style={{display:"flex",flexDirection:"column",gap:2,alignItems:"center"}}>
                  {client.services?.social&&[["stories","📖"],["noFriday","No Fri"]].map(([flag,lbl])=>(
                    <label key={flag} style={{display:"flex",alignItems:"center",gap:3,cursor:"pointer",fontSize:10,color:client.postingFlags?.[flag]?"#7C3AED":"#C4BFBA",whiteSpace:"nowrap"}}>
                      <input type="checkbox" checked={!!client.postingFlags?.[flag]} onChange={e=>updateFlag(client.id,flag,e.target.checked)} style={{accentColor:"#8B5CF6",width:11,height:11}}/>
                      {lbl}
                    </label>
                  ))}
                </div>
                {/* Remove */}
                <div style={{textAlign:"center"}}>
                  {confirmRemove===client.id
                    ? <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>removeClient(client.id)} style={{background:"#F43F5E",color:"#fff",border:"none",borderRadius:4,padding:"2px 6px",fontSize:10,cursor:"pointer",fontWeight:700}}>Yes</button>
                        <button onClick={()=>setConfirmRemove(null)} style={{background:"#F3F4F6",color:"#6B7280",border:"none",borderRadius:4,padding:"2px 6px",fontSize:10,cursor:"pointer"}}>No</button>
                      </div>
                    : <button onClick={()=>setConfirmRemove(client.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:14,lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#F43F5E"} onMouseLeave={e=>e.currentTarget.style.color="#D1D5DB"}>✕</button>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm remove modal */}
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
const TABS = ["Digital Assets Pipeline","Social Media Content Production","Posting Schedule"];

export default function App(){
  const [tab,setTab]=useState(0);
  const [ebData,setEbData]=useState(()=>buildEbData(null));
  const [smData,setSmData]=useState(()=>buildSmData(null));
  const [psChecks,setPsChecks]=useState({});
  const [designers,setDesigners]=useState(["Eddy","Claus"]);
  const [registry,setRegistry]=useState(DEFAULT_REGISTRY);
  const [showRegistry,setShowRegistry]=useState(false);
  const [syncStatus,setSyncStatus]=useState("idle"); // idle | saving | saved | error
  const [liveStatus,setLiveStatus]=useState("connecting"); // connecting | live | offline
  const [loading,setLoading]=useState(true);
  const saveTimer=useRef(null);
  const isSaving=useRef(false);   // true while the actual HTTP save is in flight
  const pendingSave=useRef(false); // true from first keystroke until save completes

  // ── Load on mount ─────────────────────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      try{
        const [eb,sm,ps,ds,reg]=await Promise.all([dbLoad("eblast_data"),dbLoad("sm_data"),dbLoad("ps_checks"),dbLoad("designers"),dbLoad("client_registry")]);
        // JSON storage converts integer keys to strings — convert them back
        function fixKeys(obj){ if(!obj) return null; const r={}; Object.entries(obj).forEach(([k,v])=>{r[isNaN(k)?k:parseInt(k)]=v;}); return r; }
        // Deduplicate clients by clientId (guards against any double-save corruption)
        function dedupe(monthData){
          if(!monthData) return monthData;
          const result={};
          Object.entries(monthData).forEach(([k,clients])=>{
            const seen=new Set();
            result[k]=clients.filter(c=>{ if(seen.has(c.clientId)) return false; seen.add(c.clientId); return true; });
          });
          return result;
        }
        const fixedEb=dedupe(fixKeys(eb)); const fixedSm=dedupe(fixKeys(sm));
        if(fixedEb&&Object.keys(fixedEb).length) setEbData(fixedEb);
        if(fixedSm&&Object.keys(fixedSm).length) setSmData(fixedSm);
        if(ps&&Object.keys(ps).length) setPsChecks(ps);
        if(ds&&Array.isArray(ds)&&ds.length) setDesigners(ds);
        if(reg&&Array.isArray(reg)&&reg.length) setRegistry(reg);
      }catch(e){ console.error("Load error",e); }
      setLoading(false);
    })();
  },[]);

  // ── Real-time subscription ────────────────────────────────────────────────
  useEffect(()=>{
    const channel = supabase
      .channel("board_state_changes")
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"board_state"},
        (payload)=>{
          // Ignore echoes from our own saves
          if(isSaving.current||pendingSave.current) return;
          const {key, value} = payload.new;
          function fixKeys(obj){ if(!obj) return obj; const r={}; Object.entries(obj).forEach(([k,v])=>{r[isNaN(k)?k:parseInt(k)]=v;}); return r; }
          function dedupeRT(obj){ if(!obj) return obj; const r={}; Object.entries(obj).forEach(([k,clients])=>{ const seen=new Set(); r[k]=clients.filter(c=>{if(seen.has(c.clientId))return false;seen.add(c.clientId);return true;}); }); return r; }
          if(key==="eblast_data") setEbData(dedupeRT(fixKeys(value)));
          else if(key==="sm_data") setSmData(dedupeRT(fixKeys(value)));
          else if(key==="ps_checks") setPsChecks(value);
          else if(key==="designers") setDesigners(value);
          else if(key==="client_registry") setRegistry(value);
        }
      )
      .subscribe((status)=>{
        if(status==="SUBSCRIBED") setLiveStatus("live");
        else if(status==="CLOSED"||status==="CHANNEL_ERROR") setLiveStatus("offline");
        else setLiveStatus("connecting");
      });
    return ()=>{ supabase.removeChannel(channel); };
  },[]);

  // ── Debounced save (saves immediately for multi-user responsiveness) ──────
  const scheduleSave = useCallback((key,value)=>{
    setSyncStatus("saving");
    pendingSave.current=true; // block realtime from overwriting local edits
    if(saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      try{
        isSaving.current=true;
        await dbSave(key,value);
        isSaving.current=false;
        pendingSave.current=false; // safe to receive realtime again
        setSyncStatus("saved");
        setTimeout(()=>setSyncStatus("idle"),2000);
      }catch(e){
        isSaving.current=false;
        pendingSave.current=false;
        setSyncStatus("error");
        console.error("Save error",e);
      }
    },800);
  },[]);

  function updateEbData(d){ setEbData(d); scheduleSave("eblast_data",d); }
  function updateDesigners(d){ setDesigners(d); scheduleSave("designers",d); }
  function updateRegistry(reg){ setRegistry(reg); scheduleSave("client_registry",reg); }
  function updateSmData(d){ setSmData(d); scheduleSave("sm_data",d); }
  function updatePsChecks(d){ setPsChecks(d); scheduleSave("ps_checks",d); }

  const LiveDot = ()=>{
    const map={
      live:    {color:"#16A34A", pulse:true,  label:"Live"},
      offline: {color:"#F43F5E", pulse:false, label:"Offline"},
      connecting:{color:"#F59E0B",pulse:false,label:"Connecting…"},
    };
    const s=map[liveStatus]||map.connecting;
    return (
      <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:s.color}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:s.color,display:"inline-block",
          boxShadow:s.pulse?`0 0 0 2px ${s.color}40`:"none"}}/>
        {s.label}
      </div>
    );
  };

  const SyncDot = ()=>{
    if(syncStatus==="idle") return null;
    const map={saving:{color:"#F59E0B",label:"Saving…"},saved:{color:"#16A34A",label:"Saved ✓"},error:{color:"#F43F5E",label:"Save failed"}};
    const s=map[syncStatus];
    return <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:s.color,fontFamily:"'DM Sans',sans-serif"}}><span style={{width:6,height:6,borderRadius:"50%",background:s.color,display:"inline-block"}}/>{s.label}</div>;
  };

  if(loading) return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#1e1e1e",flexDirection:"column",gap:16}}>
      <span style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:"#E8E4DC"}}>YTL CRE<em>ATIVE</em></span>
      <div style={{fontSize:13,color:"#6B6860",fontFamily:"'DM Sans',sans-serif"}}>Loading your board…</div>
      <div style={{width:120,height:3,background:"#2a2a2a",borderRadius:2,overflow:"hidden"}}><div style={{width:"40%",height:"100%",background:"#6366F1",borderRadius:2,animation:"slide 1s infinite"}}/></div>
      <style>{`@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;}body{margin:0;background:#F0EEE9;}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#D1CECA;border-radius:3px;}`}</style>
      <div style={{fontFamily:"'DM Sans',sans-serif",height:"100vh",background:"#F0EEE9",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:"#1e1e1e",color:"#E8E4DC",padding:"0 26px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <span style={{fontFamily:"'DM Serif Display',serif",fontSize:19,letterSpacing:"0.03em",color:"#E8E4DC"}}>YTL CRE<em style={{fontStyle:"italic"}}>ATIVE</em></span>
            <span style={{width:1,height:20,background:"#3a3a3a"}}/>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,color:"#9a9a8a",letterSpacing:"0.04em"}}>Marketing Operations Board</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <button onClick={()=>setShowRegistry(true)} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:600,color:"#E8E4DC",display:"flex",alignItems:"center",gap:5}}>👥 Clients</button>
            <LiveDot/>
            <SyncDot/>
            <div style={{fontSize:11,color:"#6B6860"}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
          </div>
        </div>
        <div style={{background:"#fff",borderBottom:"1px solid #E5E2DC",padding:"0 26px",display:"flex",flexShrink:0}}>
          {TABS.map((t,i)=><button key={t} onClick={()=>setTab(i)} style={{background:"none",border:"none",borderBottom:tab===i?"2.5px solid #1a1a2e":"2.5px solid transparent",padding:"12px 16px",cursor:"pointer",fontSize:12.5,fontFamily:"'DM Sans',sans-serif",fontWeight:tab===i?700:500,color:tab===i?"#1a1a2e":"#6B6860",marginBottom:-1,whiteSpace:"nowrap"}}>{t}</button>)}
        </div>
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {tab===0&&<EblastPipeline data={ebData} setData={updateEbData} designers={designers} setDesigners={updateDesigners} registry={registry}/>}
          {tab===1&&<SocialMediaTab data={smData} setData={updateSmData} registry={registry}/>}
          {tab===2&&<PostingSchedule checks={psChecks} setChecks={updatePsChecks} registry={registry}/>}
        </div>
      </div>
      {showRegistry&&<RegistryModal registry={registry} onSave={reg=>{updateRegistry(reg);setShowRegistry(false);}} onClose={()=>setShowRegistry(false)}/>}
    </>
  );
}
