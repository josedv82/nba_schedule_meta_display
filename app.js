const { useState, useMemo } = React;

const S={bg:'#000',card:'rgba(19,29,46,.85)',border:'#3b5677',text:'#f4f8ff',mid:'#b8cce1',ok:'#38d997',warn:'#f5b731',hi:'#ff8f4d',bad:'#ff5c72'};
const sc=i=>i<25?S.ok:i<50?S.warn:i<70?S.hi:S.bad;
const TEAMS={ATL:{n:'Atlanta Hawks',lat:33.7573,lon:-84.3963,tz:-5,id:1,c:'E'},BOS:{n:'Boston Celtics',lat:42.3662,lon:-71.0621,tz:-5,id:2,c:'E'},BKN:{n:'Brooklyn Nets',lat:40.6826,lon:-73.9754,tz:-5,id:17,c:'E'},CHA:{n:'Charlotte Hornets',lat:35.2251,lon:-80.8392,tz:-5,id:30,c:'E'},CHI:{n:'Chicago Bulls',lat:41.8807,lon:-87.6742,tz:-6,id:4,c:'E'},CLE:{n:'Cleveland Cavaliers',lat:41.4964,lon:-81.6882,tz:-5,id:5,c:'E'},DAL:{n:'Dallas Mavericks',lat:32.7905,lon:-96.8103,tz:-6,id:6,c:'W'},DEN:{n:'Denver Nuggets',lat:39.7487,lon:-104.877,tz:-7,id:7,c:'W'},DET:{n:'Detroit Pistons',lat:42.341,lon:-83.055,tz:-5,id:8,c:'E'},GSW:{n:'Golden State Warriors',lat:37.768,lon:-122.388,tz:-8,id:9,c:'W'},HOU:{n:'Houston Rockets',lat:29.7508,lon:-95.3621,tz:-6,id:10,c:'W'},IND:{n:'Indiana Pacers',lat:39.764,lon:-86.1555,tz:-5,id:11,c:'E'},LAC:{n:'LA Clippers',lat:34.043,lon:-118.267,tz:-8,id:12,c:'W'},LAL:{n:'Los Angeles Lakers',lat:34.043,lon:-118.267,tz:-8,id:13,c:'W'},MEM:{n:'Memphis Grizzlies',lat:35.1382,lon:-90.0505,tz:-6,id:29,c:'W'},MIA:{n:'Miami Heat',lat:25.7814,lon:-80.187,tz:-5,id:14,c:'E'},MIL:{n:'Milwaukee Bucks',lat:43.0436,lon:-87.917,tz:-6,id:15,c:'E'},MIN:{n:'Minnesota Timberwolves',lat:44.9795,lon:-93.276,tz:-6,id:16,c:'W'},NOP:{n:'New Orleans Pelicans',lat:29.949,lon:-90.0821,tz:-6,id:3,c:'W'},NYK:{n:'New York Knicks',lat:40.7505,lon:-73.9934,tz:-5,id:18,c:'E'},OKC:{n:'Oklahoma City Thunder',lat:35.4634,lon:-97.5151,tz:-6,id:25,c:'W'},ORL:{n:'Orlando Magic',lat:28.5392,lon:-81.3839,tz:-5,id:19,c:'E'},PHI:{n:'Philadelphia 76ers',lat:39.9012,lon:-75.172,tz:-5,id:20,c:'E'},PHX:{n:'Phoenix Suns',lat:33.4457,lon:-112.071,tz:-7,id:21,c:'W'},POR:{n:'Portland Trail Blazers',lat:45.5316,lon:-122.667,tz:-8,id:22,c:'W'},SAC:{n:'Sacramento Kings',lat:38.5801,lon:-121.5,tz:-8,id:23,c:'W'},SAS:{n:'San Antonio Spurs',lat:29.4271,lon:-98.4375,tz:-6,id:24,c:'W'},TOR:{n:'Toronto Raptors',lat:43.6434,lon:-79.3791,tz:-5,id:28,c:'E'},UTA:{n:'Utah Jazz',lat:40.7683,lon:-111.901,tz:-7,id:26,c:'W'},WAS:{n:'Washington Wizards',lat:38.8981,lon:-77.0209,tz:-5,id:27,c:'E'}};
const map={GS:'GSW',NO:'NOP',NY:'NYK',SA:'SAS',UTAH:'UTA',WSH:'WAS'};
const norm=x=>map[(x||'').toUpperCase()]||((x||'').toUpperCase());
const fmt=d=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'});
const seasons=[2026,2025,2024,2023,2022];
const cacheGet=k=>{try{return localStorage.getItem(k)}catch{return null}}; const cacheSet=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
function hav(a,b,c,d){const R=3958.8,r=Math.PI/180,dl=(c-a)*r,do2=(d-b)*r;const q=Math.sin(dl/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(do2/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));}
function dDays(a,b){const x=new Date(a),y=new Date(b);x.setHours(0,0,0,0);y.setHours(0,0,0,0);return Math.round((y-x)/864e5)}
function parse(events,abbr){const out=[];(events||[]).forEach((ev,i)=>{if(ev.seasonType?.type!==2) return;const comp=ev.competitions?.[0];if(!comp)return;const c=comp.competitors||[];const me=c.find(v=>norm(v.team?.abbreviation)===abbr),op=c.find(v=>v!==me);if(!me||!op)return;const opp=norm(op.team?.abbreviation);if(!TEAMS[opp])return;const done=!!comp.status?.type?.completed;const ms=Number.parseInt(me.score,10),os=Number.parseInt(op.score,10),ok=Number.isFinite(ms)&&Number.isFinite(os);out.push({id:ev.id||(abbr+i),date:new Date(ev.date),isHome:me.homeAway==='home',opp,result:done&&ok?(ms>os?'W':'L'):null,tScore:done&&ok?ms:null,oScore:done&&ok?os:null});});return out.sort((a,b)=>a.date-b.date)}
function withMetrics(raw,abbr){const h=TEAMS[abbr],r=[];for(let i=0;i<raw.length;i++){const g=raw[i],v=g.isHome?h:(TEAMS[g.opp]||h);let rest=null,dist=0,tz=0;if(i){const p=r[i-1],pv=p.isHome?h:(TEAMS[p.opp]||h);rest=Math.max(0,dDays(p.date,g.date)-1);dist=hav(pv.lat,pv.lon,v.lat,v.lon);tz=v.tz-pv.tz;}else if(!g.isHome){dist=hav(h.lat,h.lon,v.lat,v.lon);tz=v.tz-h.tz;}const idx=Math.round((((rest===0?10:rest===1?6:rest===2?3:0)*.35)+Math.min(10,dist/280)*.35+Math.min(10,Math.abs(tz)*3.3)*.3)*10);r.push({...g,rest,dist:Math.round(dist),tzShift:tz,idx});}return r;}
async function fetchSchedule(abbr,season){const url=`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${TEAMS[abbr].id}/schedule?season=${season}`;const res=await fetch(url);if(!res.ok) throw new Error('Network error');const data=await res.json();const g=withMetrics(parse(data.events||[],abbr),abbr);if(g.length<3) throw new Error('SCHEDULE_NOT_RELEASED');return g;}

function App(){
  const [season,setSeason]=useState(2026),[team,setTeam]=useState(null),[teamB,setTeamB]=useState(null),[month,setMonth]=useState('all'),[game,setGame]=useState(null),[view,setView]=useState('flow'),[range,setRange]=useState('full');
  const [data,setData]=useState({}),[msg,setMsg]=useState('Select season');
  const load=async(t)=>{const k=`${t}-${season}`;if(data[k])return;const c=cacheGet('sched-'+k);if(c){try{return setData(p=>({...p,[k]:JSON.parse(c)}));}catch{}};try{const g=await fetchSchedule(t,season);setData(p=>({...p,[k]:g}));cacheSet('sched-'+k,JSON.stringify(g));setMsg('');}catch(e){setMsg(e.message==='SCHEDULE_NOT_RELEASED'?`Season ${season}-${String(season+1).slice(2)} is not released yet. Try an earlier season.`:'Unable to load schedule right now.');}};
  const sched=useMemo(()=>data[`${team}-${season}`]||[],[data,team,season]);
  const months=useMemo(()=>['all',...Array.from(new Set(sched.map(g=>new Date(g.date).toLocaleDateString('en-US',{month:'short'}))))],[sched]);
  const list=useMemo(()=>month==='all'?sched:sched.filter(g=>new Date(g.date).toLocaleDateString('en-US',{month:'short'})===month),[sched,month]);
  const sA=data[`${team}-${season}`]||[], sB=data[`${teamB}-${season}`]||[];
  const slice=(arr)=>range==='full'?arr:range==='next'?arr.filter(g=>new Date(g.date)>=new Date()).slice(0,1):arr.slice(Math.max(0,arr.length-Number(range)));
  const sum=a=>{const x=slice(a);return{g:x.length,idx:x.length?Math.round(x.reduce((s,v)=>s+v.idx,0)/x.length):0,mi:x.reduce((s,v)=>s+v.dist,0),b:x.filter(v=>v.rest===0).length}};

  return <div style={{width:600,height:600,overflow:'hidden',padding:12,background:S.bg,color:S.text}}>
    <div style={{display:'flex',gap:8,marginBottom:8}}>
      <button className='focusable' onClick={()=>{setView('flow');setGame(null)}} style={btn}>Flow</button>
      <button className='focusable' onClick={()=>setView('compare')} style={btn}>Compare</button>
      <button className='focusable' onClick={()=>{setSeason(seasons[(seasons.indexOf(season)+1)%seasons.length]);setTeam(null);setMonth('all');setGame(null)}} style={btn}>Season {season}-{String(season+1).slice(2)}</button>
    </div>
    {msg&&<div style={{fontSize:15,color:S.warn,marginBottom:8}}>{msg}</div>}

    {view==='flow'&&<div style={{height:530,overflow:'auto'}}>
      {!team&&<div><div style={h}>1) Select Team</div><div style={grid}>{Object.keys(TEAMS).map(t=><button key={t} className='focusable' onClick={async()=>{setTeam(t);setMsg('Loading...');await load(t);setMsg('')}} style={card}><div style={{fontSize:18,fontWeight:700}}>{t}</div><div style={{fontSize:13,color:S.mid}}>{TEAMS[t].n}</div></button>)}</div></div>}
      {team&&<>
        <div style={h}>2) Select Month</div><div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>{months.map(m=><button key={m} className='focusable' onClick={()=>{setMonth(m);setGame(null)}} style={{...btn,background:m===month?S.accent:S.card,color:m===month?'#001018':S.text}}>{m.toUpperCase()}</button>)}</div>
        <div style={h}>3) Select Game ({list.length})</div>
        <div style={grid}>{list.map(g=><button key={g.id} className='focusable' onClick={()=>setGame(g)} style={{...card,border:'1px solid '+sc(g.idx)}}><div style={{fontSize:14}}>{fmt(g.date)}</div><div style={{fontSize:13,color:S.mid}}>{g.isHome?'vs':'@'} {g.opp}</div><div style={{fontSize:13,color:sc(g.idx),fontWeight:700}}>IDX {g.idx}</div><div style={{fontSize:12,color:S.mid}}>{g.result?`${g.result} ${g.tScore}-${g.oScore}`:'Not played'}</div></button>)}</div>
      </>}
    </div>}

    {view==='flow'&&game&&<div style={{position:'absolute',left:12,right:12,top:108,bottom:12,background:'#030a14ee',backdropFilter:'blur(10px)',border:'1px solid '+S.border,borderRadius:12,padding:12,overflow:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontSize:22,fontWeight:800}}>{fmt(game.date)} {game.isHome?'vs':'@'} {game.opp}</div><button className='focusable' onClick={()=>setGame(null)} style={btn}>Close</button></div>
      <div style={{fontSize:18,color:sc(game.idx),marginTop:6}}>Stress {game.idx}</div>
      <Row l='Status' v={game.result?`Final ${game.result} ${game.tScore}-${game.oScore}`:'Not played'} />
      <Row l='Rest' v={game.rest===null?'—':game.rest+' days'} /><Row l='Miles' v={String(game.dist)} /><Row l='TZ shift' v={game.tzShift===0?'—':(game.tzShift>0?'+':'')+game.tzShift+'h'} />
      <Row l='Level' v={sc(game.idx)===S.bad?'Extreme':sc(game.idx)===S.hi?'High':sc(game.idx)===S.warn?'Moderate':'Low'} />
    </div>}

    {view==='compare'&&<div style={{height:530,overflow:'auto'}}>
      <div style={h}>Compare Teams</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <Pick title='Team A' value={team} onPick={async t=>{setTeam(t);await load(t)}} />
        <Pick title='Team B' value={teamB} onPick={async t=>{setTeamB(t);await load(t)}} />
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>{[['full','Full'],['20','Last20'],['10','Last10'],['5','Last5'],['next','Next']].map(([k,l])=><button key={k} className='focusable' onClick={()=>setRange(k)} style={{...btn,background:range===k?S.accent:S.card,color:range===k?'#001018':S.text}}>{l}</button>)}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>{[sum(sA),sum(sB)].map((x,i)=><div key={i} style={{...card,minHeight:170}}><div style={{fontSize:20,fontWeight:700}}>{i===0?(team||'Team A'):(teamB||'Team B')}</div><Row l='Games' v={String(x.g)}/><Row l='Avg IDX' v={String(x.idx)}/><Row l='Miles' v={String(x.mi)}/><Row l='B2B' v={String(x.b)}/></div>)}</div>
    </div>}
  </div>;
}
function Row({l,v}){return <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #2f4766'}}><span style={{color:S.mid,fontSize:15}}>{l}</span><span style={{fontSize:16}}>{v}</span></div>}
function Pick({title,value,onPick}){return <div style={{...card,padding:8}}><div style={{fontSize:14,color:S.mid,marginBottom:4}}>{title}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,maxHeight:150,overflow:'auto'}}>{Object.keys(TEAMS).map(t=><button key={t} className='focusable' onClick={()=>onPick(t)} style={{...btn,padding:'6px 4px',fontSize:12,background:value===t?S.accent:S.card,color:value===t?'#001018':S.text}}>{t}</button>)}</div></div>}
const btn={background:S.card,border:'1px solid '+S.border,color:S.text,padding:'8px 10px',borderRadius:8,fontSize:14};
const card={background:S.card,border:'1px solid '+S.border,color:S.text,padding:10,borderRadius:10,textAlign:'left'};
const h={fontSize:16,color:S.mid,margin:'8px 0 6px'};
const grid={display:'grid',gridTemplateColumns:'1fr 1fr',gap:6};
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
