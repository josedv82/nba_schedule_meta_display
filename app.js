const { useState, useEffect, useMemo } = React;

const S={bg:'#000',card:'rgba(20,28,44,.78)',border:'#36506e',text:'#f4f8ff',mid:'#b9cde3',accent:'#00d4ff'};
const sc=i=>i<25?'#2DBF82':i<50?'#F5B731':i<70?'#E07530':'#C8102E';
const sl=i=>i<25?'Low':i<50?'Moderate':i<70?'High':'Extreme';
const seasons=[2026,2025,2024,2023,2022];
const cacheGet=k=>{try{return localStorage.getItem(k);}catch{return null}};
const cacheSet=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};

const TEAMS={ATL:{name:'Atlanta Hawks',lat:33.7573,lon:-84.3963,tz:-5,espnId:1,conf:'E'},BOS:{name:'Boston Celtics',lat:42.3662,lon:-71.0621,tz:-5,espnId:2,conf:'E'},BKN:{name:'Brooklyn Nets',lat:40.6826,lon:-73.9754,tz:-5,espnId:17,conf:'E'},CHA:{name:'Charlotte Hornets',lat:35.2251,lon:-80.8392,tz:-5,espnId:30,conf:'E'},CHI:{name:'Chicago Bulls',lat:41.8807,lon:-87.6742,tz:-6,espnId:4,conf:'E'},CLE:{name:'Cleveland Cavaliers',lat:41.4964,lon:-81.6882,tz:-5,espnId:5,conf:'E'},DAL:{name:'Dallas Mavericks',lat:32.7905,lon:-96.8103,tz:-6,espnId:6,conf:'W'},DEN:{name:'Denver Nuggets',lat:39.7487,lon:-104.877,tz:-7,espnId:7,conf:'W'},DET:{name:'Detroit Pistons',lat:42.341,lon:-83.055,tz:-5,espnId:8,conf:'E'},GSW:{name:'Golden State Warriors',lat:37.768,lon:-122.388,tz:-8,espnId:9,conf:'W'},HOU:{name:'Houston Rockets',lat:29.7508,lon:-95.3621,tz:-6,espnId:10,conf:'W'},IND:{name:'Indiana Pacers',lat:39.764,lon:-86.1555,tz:-5,espnId:11,conf:'E'},LAC:{name:'LA Clippers',lat:34.043,lon:-118.267,tz:-8,espnId:12,conf:'W'},LAL:{name:'Los Angeles Lakers',lat:34.043,lon:-118.267,tz:-8,espnId:13,conf:'W'},MEM:{name:'Memphis Grizzlies',lat:35.1382,lon:-90.0505,tz:-6,espnId:29,conf:'W'},MIA:{name:'Miami Heat',lat:25.7814,lon:-80.187,tz:-5,espnId:14,conf:'E'},MIL:{name:'Milwaukee Bucks',lat:43.0436,lon:-87.917,tz:-6,espnId:15,conf:'E'},MIN:{name:'Minnesota Timberwolves',lat:44.9795,lon:-93.276,tz:-6,espnId:16,conf:'W'},NOP:{name:'New Orleans Pelicans',lat:29.949,lon:-90.0821,tz:-6,espnId:3,conf:'W'},NYK:{name:'New York Knicks',lat:40.7505,lon:-73.9934,tz:-5,espnId:18,conf:'E'},OKC:{name:'Oklahoma City Thunder',lat:35.4634,lon:-97.5151,tz:-6,espnId:25,conf:'W'},ORL:{name:'Orlando Magic',lat:28.5392,lon:-81.3839,tz:-5,espnId:19,conf:'E'},PHI:{name:'Philadelphia 76ers',lat:39.9012,lon:-75.172,tz:-5,espnId:20,conf:'E'},PHX:{name:'Phoenix Suns',lat:33.4457,lon:-112.071,tz:-7,espnId:21,conf:'W'},POR:{name:'Portland Trail Blazers',lat:45.5316,lon:-122.667,tz:-8,espnId:22,conf:'W'},SAC:{name:'Sacramento Kings',lat:38.5801,lon:-121.5,tz:-8,espnId:23,conf:'W'},SAS:{name:'San Antonio Spurs',lat:29.4271,lon:-98.4375,tz:-6,espnId:24,conf:'W'},TOR:{name:'Toronto Raptors',lat:43.6434,lon:-79.3791,tz:-5,espnId:28,conf:'E'},UTA:{name:'Utah Jazz',lat:40.7683,lon:-111.901,tz:-7,espnId:26,conf:'W'},WAS:{name:'Washington Wizards',lat:38.8981,lon:-77.0209,tz:-5,espnId:27,conf:'E'}};
const norm=x=>({GS:'GSW',NO:'NOP',NY:'NYK',SA:'SAS',UTAH:'UTA',WSH:'WAS'}[(x||'').toUpperCase()]||((x||'').toUpperCase()));
const fmt=d=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'});

function hav(a,b,c,d){const R=3958.8,r=Math.PI/180,dl=(c-a)*r,do2=(d-b)*r;const q=Math.sin(dl/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(do2/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));}
function days(a,b){const x=new Date(a),y=new Date(b);x.setHours(0,0,0,0);y.setHours(0,0,0,0);return Math.round((y-x)/864e5)}
function parse(events,abbr){const out=[];(events||[]).forEach((ev,i)=>{if(ev.seasonType?.type!==2)return;const comp=ev.competitions?.[0];if(!comp)return;const c=comp.competitors||[];const me=c.find(v=>norm(v.team?.abbreviation)===abbr);const op=c.find(v=>v!==me);if(!me||!op)return;const o=norm(op.team?.abbreviation);if(!TEAMS[o])return;const done=!!comp.status?.type?.completed;const ms=Number.parseInt(me.score,10),os=Number.parseInt(op.score,10),ok=Number.isFinite(ms)&&Number.isFinite(os);out.push({id:ev.id||(abbr+i),date:new Date(ev.date),isHome:me.homeAway==='home',opp:o,result:done&&ok?(ms>os?'W':'L'):null,tScore:done&&ok?ms:null,oScore:done&&ok?os:null});});return out.sort((a,b)=>a.date-b.date)}
function metrics(raw,abbr){const h=TEAMS[abbr],r=[];for(let i=0;i<raw.length;i++){const g=raw[i],v=g.isHome?h:(TEAMS[g.opp]||h);let rest=null,dist=0,tz=0; if(i){const p=r[i-1],gap=days(p.date,g.date);rest=Math.max(0,gap-1);const pv=p.isHome?h:(TEAMS[p.opp]||h);dist=hav(pv.lat,pv.lon,v.lat,v.lon);tz=v.tz-pv.tz;}else if(!g.isHome){dist=hav(h.lat,h.lon,v.lat,v.lon);tz=v.tz-h.tz;}const ri=(rest===null?3:rest)===0?10:(rest===1?6:(rest===2?3:0));const di=Math.min(10,dist/280);const ti=Math.min(10,Math.abs(tz)*3.3);const idx=Math.round((ri*.35+di*.35+ti*.3)*10);r.push({...g,rest,dist:Math.round(dist),tzShift:tz,idx});}return r;}
async function fetchSchedule(abbr,season){const url=`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${TEAMS[abbr].espnId}/schedule?season=${season}`;const res=await fetch(url);if(!res.ok) throw new Error('HTTP '+res.status);const data=await res.json();return metrics(parse(data.events||[],abbr),abbr)}

function App(){
  const [view,setView]=useState('teams');
  const [team,setTeam]=useState(null),[team2,setTeam2]=useState(null),[season,setSeason]=useState(2026);
  const [schedules,setSchedules]=useState({}),[openGame,setOpenGame]=useState(null),[cmpRange,setCmpRange]=useState('full'),[err,setErr]=useState('');
  const east=Object.keys(TEAMS).filter(k=>TEAMS[k].conf==='E'),west=Object.keys(TEAMS).filter(k=>TEAMS[k].conf==='W');
  const key=(t)=>`${t}-${season}`;
  const load=async(t)=>{const k=key(t);if(schedules[k])return;const c=cacheGet('sched-'+k);if(c){try{return setSchedules(p=>({...p,[k]:JSON.parse(c)}));}catch{}};try{const g=await fetchSchedule(t,season);setSchedules(p=>({...p,[k]:g}));cacheSet('sched-'+k,JSON.stringify(g));}catch(e){setErr(e.message)}};
  const selectTeam=async(t)=>{setTeam(t);setView('team');setOpenGame(null);await load(t)};
  const s1=schedules[key(team)]||[]; const s2=schedules[key(team2)]||[];
  const cmp=(arr)=>{if(cmpRange==='full')return arr; if(cmpRange==='next')return arr.filter(g=>new Date(g.date)>=new Date()).slice(0,1); const n=Number(cmpRange); return arr.slice(Math.max(0,arr.length-n));};
  const summary=(arr)=>{const a=cmp(arr);const avg=a.length?Math.round(a.reduce((x,g)=>x+g.idx,0)/a.length):0;const mi=a.reduce((x,g)=>x+g.dist,0);const b2b=a.filter(g=>g.rest===0).length;return {games:a.length,avg,mi,b2b}};

  return <div style={{width:600,height:600,overflow:'hidden',background:S.bg,color:S.text,padding:12}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
      <button className='focusable' onClick={()=>setView('teams')} style={{background:'transparent',border:'1px solid '+S.border,color:S.text,padding:'8px 10px',borderRadius:8}}>AIRBALL</button>
      <button className='focusable' onClick={()=>setSeason(seasons[(seasons.indexOf(season)+1)%seasons.length])} style={{background:S.card,border:'1px solid '+S.border,color:S.text,padding:'8px 10px',borderRadius:8}}>Season {season}-{String(season+1).slice(2)}</button>
      <button className='focusable' onClick={()=>setView(view==='compare'?'teams':'compare')} style={{background:S.card,border:'1px solid '+S.border,color:S.text,padding:'8px 10px',borderRadius:8}}>Compare</button>
    </div>
    {err&&<div style={{fontSize:14,color:'#ff8d8d',marginBottom:8}}>{err}</div>}

    {view==='teams'&&<div style={{height:530,overflow:'auto'}}>
      {[['East',east],['West',west]].map(([lab,arr])=><div key={lab} style={{marginBottom:10}}><div style={{fontSize:14,color:S.mid,marginBottom:6}}>{lab}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>{arr.map(t=><button key={t} className='focusable' onClick={()=>selectTeam(t)} style={{textAlign:'left',background:S.card,border:'1px solid '+S.border,borderRadius:10,padding:10,color:S.text}}><div style={{fontSize:18,fontWeight:700}}>{t}</div><div style={{fontSize:14,color:S.mid}}>{TEAMS[t].name}</div></button>)}</div></div>)}
    </div>}

    {view==='team'&&team&&<div style={{height:530,overflow:'auto'}}>
      <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>{team} — {TEAMS[team].name}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
        {s1.map(g=><button key={g.id} className='focusable' onClick={()=>setOpenGame(openGame?.id===g.id?null:g)} style={{background:S.card,border:'1px solid '+sc(g.idx),borderRadius:8,padding:6,minHeight:64,color:S.text}}>
          <div style={{fontSize:12}}>{fmt(g.date)}</div><div style={{fontSize:12,color:S.mid}}>{g.isHome?'vs':'@'} {g.opp}</div><div style={{fontSize:13,color:sc(g.idx),fontWeight:700}}>{g.idx}</div>
          <div style={{fontSize:11,color:S.mid}}>{g.result?`${g.result} ${g.tScore}-${g.oScore}`:'Not played'}</div>
        </button>)}
      </div>
      {openGame&&<div style={{position:'sticky',top:0,marginTop:8,background:'#02060ddd',backdropFilter:'blur(10px)',border:'1px solid '+S.border,borderRadius:10,padding:10}}>
        <div style={{fontSize:20,fontWeight:800}}>{fmt(openGame.date)} {openGame.isHome?'vs':'@'} {openGame.opp}</div>
        <div style={{fontSize:16,color:sc(openGame.idx)}}>Stress {openGame.idx} · {sl(openGame.idx)}</div>
        <div style={{fontSize:15,color:S.mid}}>Rest {openGame.rest===null?'—':openGame.rest+'d'} · Miles {openGame.dist} · TZ {openGame.tzShift===0?'—':(openGame.tzShift>0?'+':'')+openGame.tzShift+'h'}</div>
        <div style={{fontSize:15,color:S.mid}}>{openGame.result?`Final ${openGame.result} ${openGame.tScore}-${openGame.oScore}`:'Not played'}</div>
      </div>}
    </div>}

    {view==='compare'&&<div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <select value={team||''} onChange={e=>setTeam(e.target.value)}>{['',...Object.keys(TEAMS)].map(t=><option key={t} value={t}>{t||'Team 1'}</option>)}</select>
        <select value={team2||''} onChange={e=>setTeam2(e.target.value)}>{['',...Object.keys(TEAMS)].map(t=><option key={t} value={t}>{t||'Team 2'}</option>)}</select>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:8}}>{[['full','Full Season'],['20','Last 20'],['10','Last 10'],['5','Last 5'],['next','Next Game']].map(([k,l])=><button key={k} className='focusable' onClick={()=>setCmpRange(k)} style={{background:cmpRange===k?S.accent:S.card,border:'1px solid '+S.border,color:cmpRange===k?'#001018':S.text,padding:'6px 8px',borderRadius:8,fontSize:12}}>{l}</button>)}</div>
      <button className='focusable' onClick={()=>{team&&load(team);team2&&load(team2)}} style={{background:S.card,border:'1px solid '+S.border,color:S.text,padding:'6px 10px',borderRadius:8,marginBottom:8}}>Load Compare</button>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {[team,team2].map((t,i)=>{const x=summary(i? s2:s1);return <div key={i} style={{background:S.card,border:'1px solid '+S.border,borderRadius:10,padding:10}}><div style={{fontSize:18,fontWeight:700}}>{t||`Team ${i+1}`}</div><div style={{fontSize:14,color:S.mid}}>Games {x.games}</div><div style={{fontSize:14,color:S.mid}}>Avg Stress {x.avg}</div><div style={{fontSize:14,color:S.mid}}>Miles {x.mi}</div><div style={{fontSize:14,color:S.mid}}>B2B {x.b2b}</div></div>})}
      </div>
    </div>}
  </div>
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
