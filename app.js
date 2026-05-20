const { useState, useCallback, useMemo } = React;

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const S = {
  bg:"#07090F", surface:"#0D1220", card:"#111827", border:"#1C2A3E",
  text:"#DDE6F2", mid:"#7A94B0", dim:"#3A5068", accent:"#C8102E",
  mono:'"IBM Plex Mono",monospace', sans:'"DM Sans",sans-serif', disp:'"Syne",sans-serif',
};
const sc = i => i<25?"#2DBF82":i<50?"#F5B731":i<70?"#E07530":"#C8102E";
const sl = i => i<25?"Low":i<50?"Moderate":i<70?"High":"Extreme";

// ─── TEAM DATA ────────────────────────────────────────────────────────────────
const TEAMS = {
  ATL:{name:"Atlanta Hawks",         city:"Atlanta",        lat:33.7573,lon:-84.3963,tz:-5,espnId:1, conf:"E",color:"#E03A3E",logo:"atl"},
  BOS:{name:"Boston Celtics",        city:"Boston",         lat:42.3662,lon:-71.0621,tz:-5,espnId:2, conf:"E",color:"#007A33",logo:"bos"},
  BKN:{name:"Brooklyn Nets",         city:"Brooklyn",       lat:40.6826,lon:-73.9754,tz:-5,espnId:17,conf:"E",color:"#555555",logo:"bkn"},
  CHA:{name:"Charlotte Hornets",     city:"Charlotte",      lat:35.2251,lon:-80.8392,tz:-5,espnId:30,conf:"E",color:"#1D1160",logo:"cha"},
  CHI:{name:"Chicago Bulls",         city:"Chicago",        lat:41.8807,lon:-87.6742,tz:-6,espnId:4, conf:"E",color:"#CE1141",logo:"chi"},
  CLE:{name:"Cleveland Cavaliers",   city:"Cleveland",      lat:41.4964,lon:-81.6882,tz:-5,espnId:5, conf:"E",color:"#860038",logo:"cle"},
  DAL:{name:"Dallas Mavericks",      city:"Dallas",         lat:32.7905,lon:-96.8103,tz:-6,espnId:6, conf:"W",color:"#00538C",logo:"dal"},
  DEN:{name:"Denver Nuggets",        city:"Denver",         lat:39.7487,lon:-104.877,tz:-7,espnId:7, conf:"W",color:"#0E2240",logo:"den"},
  DET:{name:"Detroit Pistons",       city:"Detroit",        lat:42.3410,lon:-83.055, tz:-5,espnId:8, conf:"E",color:"#C8102E",logo:"det"},
  GSW:{name:"Golden State Warriors", city:"San Francisco",  lat:37.7680,lon:-122.388,tz:-8,espnId:9, conf:"W",color:"#1D428A",logo:"gs"},
  HOU:{name:"Houston Rockets",       city:"Houston",        lat:29.7508,lon:-95.3621,tz:-6,espnId:10,conf:"W",color:"#CE1141",logo:"hou"},
  IND:{name:"Indiana Pacers",        city:"Indianapolis",   lat:39.764, lon:-86.1555,tz:-5,espnId:11,conf:"E",color:"#002D62",logo:"ind"},
  LAC:{name:"LA Clippers",           city:"Los Angeles",    lat:34.043, lon:-118.267,tz:-8,espnId:12,conf:"W",color:"#C8102E",logo:"lac"},
  LAL:{name:"Los Angeles Lakers",    city:"Los Angeles",    lat:34.043, lon:-118.267,tz:-8,espnId:13,conf:"W",color:"#552583",logo:"lal"},
  MEM:{name:"Memphis Grizzlies",     city:"Memphis",        lat:35.1382,lon:-90.0505,tz:-6,espnId:29,conf:"W",color:"#5D76A9",logo:"mem"},
  MIA:{name:"Miami Heat",            city:"Miami",          lat:25.7814,lon:-80.187, tz:-5,espnId:14,conf:"E",color:"#98002E",logo:"mia"},
  MIL:{name:"Milwaukee Bucks",       city:"Milwaukee",      lat:43.0436,lon:-87.917, tz:-6,espnId:15,conf:"E",color:"#00471B",logo:"mil"},
  MIN:{name:"Minnesota Timberwolves",city:"Minneapolis",    lat:44.9795,lon:-93.276, tz:-6,espnId:16,conf:"W",color:"#0C2340",logo:"min"},
  NOP:{name:"New Orleans Pelicans",  city:"New Orleans",    lat:29.949, lon:-90.0821,tz:-6,espnId:3, conf:"W",color:"#0C2340",logo:"no"},
  NYK:{name:"New York Knicks",       city:"New York",       lat:40.7505,lon:-73.9934,tz:-5,espnId:18,conf:"E",color:"#006BB6",logo:"ny"},
  OKC:{name:"Oklahoma City Thunder", city:"Oklahoma City",  lat:35.4634,lon:-97.5151,tz:-6,espnId:25,conf:"W",color:"#007AC1",logo:"okc"},
  ORL:{name:"Orlando Magic",         city:"Orlando",        lat:28.5392,lon:-81.3839,tz:-5,espnId:19,conf:"E",color:"#0077C0",logo:"orl"},
  PHI:{name:"Philadelphia 76ers",    city:"Philadelphia",   lat:39.9012,lon:-75.172, tz:-5,espnId:20,conf:"E",color:"#006BB6",logo:"phi"},
  PHX:{name:"Phoenix Suns",          city:"Phoenix",        lat:33.4457,lon:-112.071,tz:-7,espnId:21,conf:"W",color:"#1D1160",logo:"phx"},
  POR:{name:"Portland Trail Blazers",city:"Portland",       lat:45.5316,lon:-122.667,tz:-8,espnId:22,conf:"W",color:"#E03A3E",logo:"por"},
  SAC:{name:"Sacramento Kings",      city:"Sacramento",     lat:38.5801,lon:-121.5,  tz:-8,espnId:23,conf:"W",color:"#5A2D81",logo:"sac"},
  SAS:{name:"San Antonio Spurs",     city:"San Antonio",    lat:29.4271,lon:-98.4375,tz:-6,espnId:24,conf:"W",color:"#8A8D8F",logo:"sa"},
  TOR:{name:"Toronto Raptors",       city:"Toronto",        lat:43.6434,lon:-79.3791,tz:-5,espnId:28,conf:"E",color:"#CE1141",logo:"tor"},
  UTA:{name:"Utah Jazz",             city:"Salt Lake City", lat:40.7683,lon:-111.901,tz:-7,espnId:26,conf:"W",color:"#002B5C",logo:"utah"},
  WAS:{name:"Washington Wizards",    city:"Washington DC",  lat:38.8981,lon:-77.0209,tz:-5,espnId:27,conf:"E",color:"#002B5C",logo:"was"},
};
const normAbbr = raw => {
  if (!raw) return null;
  const up = raw.toUpperCase();
  const m = {GS:"GSW",NO:"NOP",NY:"NYK",SA:"SAS",UTAH:"UTA",WSH:"WAS"};
  return m[up] || (TEAMS[up] ? up : null);
};

// ─── AIRBALL METRIC LOGIC ─────────────────────────────────────────────────────
function haversine(la1,lo1,la2,lo2){
  const R=3958.8,r=Math.PI/180,dLa=(la2-la1)*r,dLo=(lo2-lo1)*r;
  const a=Math.sin(dLa/2)**2+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin(dLo/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function calDiff(d1,d2){
  const a=new Date(d1);a.setHours(0,0,0,0);
  const b=new Date(d2);b.setHours(0,0,0,0);
  return Math.round((b-a)/86400000);
}
const ld = d=>{const x=new Date(d);x.setHours(0,0,0,0);return x;};

function calcMetrics(raw,abbr,rh=20){
  const home=TEAMS[abbr];
  if(!home||!raw.length) return raw;
  const res=[];
  for(let i=0;i<raw.length;i++){
    const g=raw[i];
    const venue=g.isHome?home:(TEAMS[g.opp]||home);
    let rest=null,dist=0,tz=0,dir="No Travel";
    if(i===0){
      if(!g.isHome){dist=haversine(home.lat,home.lon,venue.lat,venue.lon);tz=venue.tz-home.tz;dir=tz<0?"West":tz>0?"East":"No Travel";}
    } else {
      const prev=res[i-1],gap=calDiff(prev.date,g.date);
      rest=Math.max(0,gap-1);
      const pV=gap>rh?home:(prev.isHome?home:(TEAMS[prev.opp]||home));
      const same=Math.abs(venue.lat-pV.lat)<0.01&&Math.abs(venue.lon-pV.lon)<0.01;
      if(same){dist=0;tz=0;dir="No Travel";}
      else{dist=haversine(pV.lat,pV.lon,venue.lat,venue.lon);tz=venue.tz-pV.tz;dir=dist<50?"No Travel":tz<0?"West":tz>0?"East":"No Travel";}
    }
    const today=ld(g.date);
    const win=n=>raw.filter(x=>{const xd=ld(x.date),lo=new Date(today);lo.setDate(lo.getDate()-(n-1));return xd>=lo&&xd<=today;}).length;
    const isB2B2=rest===0,isB2B1=i<raw.length-1&&calDiff(g.date,raw[i+1].date)===1,isB2B=isB2B1||isB2B2;
    const is3in4=win(4)>=3,is4in5=win(5)>=4,is5in7=win(7)>=5;
    const roll=(days,key)=>{const lo=new Date(today);lo.setDate(lo.getDate()-days);return res.filter(x=>{const xd=ld(x.date);return xd>lo&&xd<today;}).reduce((s,x)=>s+(key==="g"?1:key==="tz"?Math.abs(x.tzShift):x.dist),0);};
    const r2=rest===null?3:rest,ri=r2===0?10:r2===1?6:r2===2?3:0;
    const di=Math.min(10,(dist/2800)*10),ti=Math.min(10,Math.abs(tz)*3.33);
    const den=is3in4?8:isB2B?6:0,li=g.isHome?0:5,dri=dir==="West"?3:dir==="East"?1:0;
    const idx=Math.round((ri*0.30+di*0.25+ti*0.15+den*0.15+li*0.10+dri*0.05)*10);
    res.push({...g,venue,rest,dist:Math.round(dist),tzShift:tz,dir,flight:dist>0?+(dist/550).toFixed(1):0,isB2B,isB2B1,isB2B2,is3in4,is4in5,is5in7,d3:Math.round(roll(3,"d")),d5:Math.round(roll(5,"d")),d7:Math.round(roll(7,"d")),d9:Math.round(roll(9,"d")),g3:roll(3,"g"),g5:roll(5,"g"),g7:roll(7,"g"),g9:roll(9,"g"),tz3:roll(3,"tz"),tz5:roll(5,"tz"),tz7:roll(7,"tz"),tz9:roll(9,"tz"),idx});
  }
  return res;
}

// ─── ESPN FETCH ───────────────────────────────────────────────────────────────
function parseESPN(events,abbr){
  const games=[];
  (events||[]).forEach((ev,i)=>{
    if(ev.seasonType&&ev.seasonType.type!==2) return; // regular season only
    const comp=ev.competitions&&ev.competitions[0];if(!comp) return;
    const comps=comp.competitors||[];
    const mine=comps.find(c=>normAbbr(c.team&&c.team.abbreviation)===abbr);if(!mine) return;
    const theirs=comps.find(c=>c!==mine);if(!theirs) return;
    const opp=normAbbr(theirs.team&&theirs.team.abbreviation);if(!opp||!TEAMS[opp]) return;
    const done=!!(comp.status&&comp.status.type&&comp.status.type.completed);
    const myS=parseInt(mine.score)||0,thS=parseInt(theirs.score)||0;
    games.push({id:ev.id||(abbr+i),date:new Date(ev.date),isHome:mine.homeAway==="home",opp,result:done?(myS>thS?"W":"L"):null,tScore:done?myS:null,oScore:done?thS:null,done});
  });
  return games.sort((a,b)=>a.date-b.date);
}

async function fetchSchedule(abbr,onStatus){
  const t=TEAMS[abbr];
  const base="https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/"+t.espnId+"/schedule";
  for(const season of[2026,2025]){
    onStatus("Loading "+season+" schedule from ESPN…");
    try{
      const res=await fetch(base+"?season="+season);
      if(!res.ok) continue;
      const data=await res.json();
      const games=parseESPN(data.events||[],abbr);
      if(games.length>=20) return calcMetrics(games,abbr);
    }catch(e){console.warn("ESPN",season,e.message);}
  }
  throw new Error("ESPN fetch failed. If you opened this file directly (file://), try serving it via a local server instead:\n\n  python -m http.server 8080\n\nthen open http://localhost:8080/nba-stress.html");
}

// ─── INLINE SVG CHARTS (no Recharts dependency) ───────────────────────────────
function BarChart({data,valueKey,colorFn,height=70,labelKey}){
  const vals=data.map(d=>d[valueKey]||0);
  const max=Math.max(...vals,1);
  const bw=100/data.length;
  return (
    <svg viewBox={"0 0 100 "+height} preserveAspectRatio="none" style={{width:"100%",height}}>
      {data.map((d,i)=>{
        const v=d[valueKey]||0;
        const bh=(v/max)*(height-14);
        const x=i*bw+bw*0.1;
        const w=bw*0.8;
        const fill=colorFn?colorFn(v):"#1D428A";
        return <g key={i}>
          <rect x={x} y={height-14-bh} width={w} height={bh} fill={fill} rx="0.5"/>
          {labelKey&&<text x={x+w/2} y={height-2} textAnchor="middle" fontSize="4" fill={S.dim} fontFamily="IBM Plex Mono">{d[labelKey]}</text>}
        </g>;
      })}
    </svg>
  );
}

function LineChart({data,lines,height=140}){
  if(!data.length) return null;
  const W=200,H=height-20;
  const allV=lines.flatMap(l=>data.map(d=>typeof d[l.key]==="number"?d[l.key]:0));
  const max=Math.max(...allV,1);
  const pt=(key,i)=>{
    const x=(i/(data.length-1||1))*W;
    const y=H-(data[i][key]||0)/max*H;
    return x+","+y;
  };
  return (
    <svg viewBox={"0 0 "+W+" "+height} preserveAspectRatio="none" style={{width:"100%",height}}>
      {lines.map(l=>(
        <polyline key={l.key}
          points={data.map((_,i)=>pt(l.key,i)).join(" ")}
          fill="none" stroke={l.color} strokeWidth="1.5" strokeLinejoin="round"/>
      ))}
      {/* Y axis labels */}
      {[0,50,100].map(v=>(
        <text key={v} x="0" y={H-v/max*H+1} fontSize="4" fill={S.dim} fontFamily="IBM Plex Mono">{v}</text>
      ))}
      {/* Legend */}
      {lines.map((l,i)=>(
        <g key={l.key} transform={"translate("+(W-60)+","+(5+i*8)+")"}>
          <line x1="0" y1="0" x2="10" y2="0" stroke={l.color} strokeWidth="1.5"/>
          <text x="13" y="1" fontSize="4" fill={S.mid} fontFamily="IBM Plex Mono">{l.label||l.key}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const tLogo = id=>"https://a.espncdn.com/i/teamlogos/nba/500/"+id+".png";
const fmtD  = d=>new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
const fmtDL = d=>new Date(d).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
function Pill({label,on,color}){
  const c=color||"#E07530";
  return <span style={{padding:"2px 7px",borderRadius:4,fontSize:9,letterSpacing:"0.08em",fontFamily:S.mono,border:"1px solid "+(on?c:S.border),background:on?c+"25":"transparent",color:on?c:S.dim}}>{label}</span>;
}
function SBar({v,w}){
  return <div style={{width:w||40,height:3,background:S.border,borderRadius:2}}><div style={{width:Math.min(100,v)+"%",height:"100%",background:sc(v),borderRadius:2}}/></div>;
}
function MRow({label,value,color}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid "+S.border}}>
    <span style={{fontFamily:S.mono,fontSize:10,color:S.dim,textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</span>
    <span style={{fontFamily:S.mono,fontSize:12,fontWeight:600,color:color||S.text}}>{value}</span>
  </div>;
}

function TeamCard({abbr,selected,onClick}){
  const t=TEAMS[abbr],[hov,setHov]=useState(false);
  return <div onClick={()=>onClick(abbr)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
    style={{background:selected?t.color+"20":hov?S.surface:S.card,border:"1px solid "+(selected?t.color:hov?S.border:"#131f2e"),borderRadius:8,padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all 0.12s"}}>
    <img src={tLogo(t.logo)} alt={abbr} width={32} height={32} style={{objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>
    <div>
      <div style={{fontFamily:S.sans,fontSize:11,fontWeight:700,color:S.text}}>{abbr}</div>
      <div style={{fontFamily:S.sans,fontSize:9,color:S.mid}}>{t.city}</div>
    </div>
  </div>;
}

function GameRow({game,selected,onCheck,onClick}){
  const [hov,setHov]=useState(false),opp=TEAMS[game.opp],c=sc(game.idx);
  return <div onClick={()=>onClick(game)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
    style={{display:"grid",gridTemplateColumns:"18px 62px 1fr 38px 68px 44px 76px 58px",alignItems:"center",gap:8,padding:"7px 14px",borderBottom:"1px solid "+S.border,background:selected?c+"12":hov?"#ffffff06":"transparent",cursor:"pointer",transition:"background 0.1s"}}>
    <div onClick={e=>{e.stopPropagation();onCheck(game.id);}}
      style={{width:13,height:13,borderRadius:3,border:"1px solid "+(selected?c:S.dim),background:selected?c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
      {selected&&<span style={{color:"#fff",fontSize:8,lineHeight:1}}>✓</span>}
    </div>
    <span style={{fontFamily:S.mono,fontSize:10,color:S.mid}}>{fmtD(game.date)}</span>
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <span style={{fontFamily:S.mono,fontSize:9,color:S.dim}}>{game.isHome?"vs":"@"}</span>
      <img src={tLogo(opp?opp.logo:game.opp.toLowerCase())} alt={game.opp} width={18} height={18} style={{objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>
      <span style={{fontFamily:S.sans,fontSize:11,fontWeight:600,color:S.text}}>{game.opp}</span>
      {game.result&&<span style={{fontFamily:S.mono,fontSize:10,fontWeight:700,marginLeft:4,color:game.result==="W"?"#2DBF82":"#E03A3E"}}>{game.result} {game.tScore}–{game.oScore}</span>}
    </div>
    <span style={{fontFamily:S.mono,fontSize:11,textAlign:"right",color:game.rest===0?"#E07530":game.rest===1?"#F5B731":S.mid}}>{game.rest===null?"—":game.rest+"d"}</span>
    <span style={{fontFamily:S.mono,fontSize:10,color:S.mid,textAlign:"right"}}>{game.dist>0?game.dist.toLocaleString():"—"}</span>
    <span style={{fontFamily:S.mono,fontSize:10,textAlign:"right",color:Math.abs(game.tzShift)>=2?"#F5B731":S.mid}}>{game.tzShift===0?"—":(game.tzShift>0?"+":"")+game.tzShift+"h"}</span>
    <div style={{display:"flex",gap:3,alignItems:"center"}}>
      {game.isB2B2&&<span style={{width:7,height:7,borderRadius:"50%",background:"#E07530",display:"block"}} title="B2B"/>}
      {game.is3in4&&<span style={{width:7,height:7,borderRadius:"50%",background:"#C8102E",display:"block"}} title="3in4"/>}
      {game.is4in5&&<span style={{width:7,height:7,borderRadius:"50%",background:"#8B00D0",display:"block"}} title="4in5"/>}
      {game.is5in7&&<span style={{width:7,height:7,borderRadius:"50%",background:"#FF00AA",display:"block"}} title="5in7"/>}
      {!game.isB2B&&!game.is3in4&&!game.is4in5&&!game.is5in7&&<span style={{width:7,height:7,borderRadius:"50%",background:S.border,display:"block"}}/>}
    </div>
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <SBar v={game.idx}/><span style={{fontFamily:S.mono,fontSize:11,fontWeight:700,color:c,minWidth:22}}>{game.idx}</span>
    </div>
  </div>;
}

function GameDetail({game,abbr,onClose}){
  if(!game) return null;
  const t=TEAMS[abbr],opp=TEAMS[game.opp],c=sc(game.idx);
  const rd=[{w:"3d",dist:game.d3,g:game.g3,tz:game.tz3},{w:"5d",dist:game.d5,g:game.g5,tz:game.tz5},{w:"7d",dist:game.d7,g:game.g7,tz:game.tz7},{w:"9d",dist:game.d9,g:game.g9,tz:game.tz9}];
  return <div style={{background:S.surface,border:"1px solid "+S.border,borderRadius:12,padding:22,marginTop:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
      <div>
        <div style={{fontFamily:S.disp,fontSize:16,fontWeight:800,color:S.text}}>{fmtDL(game.date)}</div>
        <div style={{fontFamily:S.sans,fontSize:13,color:S.mid,marginTop:4}}>
          {t&&t.name} <span style={{color:S.dim}}>{game.isHome?"vs":"at"}</span> {opp?opp.name:game.opp}
          {game.result&&<span style={{marginLeft:10,fontWeight:700,color:game.result==="W"?"#2DBF82":"#E03A3E"}}>{game.result} {game.tScore}–{game.oScore}</span>}
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontFamily:S.mono,fontSize:36,fontWeight:900,color:c,lineHeight:1}}>{game.idx}</div>
        <div style={{fontFamily:S.mono,fontSize:10,color:c,textTransform:"uppercase",letterSpacing:"0.1em",marginTop:2}}>{sl(game.idx)} Stress</div>
        <div style={{marginTop:6}}><SBar v={game.idx} w={90}/></div>
      </div>
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
      <Pill label="B2B" on={game.isB2B}/><Pill label="B2B-1st" on={game.isB2B1} color="#F5B731"/>
      <Pill label="B2B-2nd" on={game.isB2B2} color="#E07530"/><Pill label="3-in-4" on={game.is3in4} color="#E07530"/>
      <Pill label="4-in-5" on={game.is4in5} color="#C8102E"/><Pill label="5-in-7" on={game.is5in7} color="#8B00D0"/>
    </div>
    <div style={{marginBottom:18}}>
      <div style={{fontFamily:S.mono,fontSize:9,color:S.dim,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:6}}>Travel Metrics</div>
      <MRow label="Location" value={game.isHome?"Home":"Away"} color={game.isHome?"#2DBF82":"#F5B731"}/>
      <MRow label="Rest Days" value={game.rest===null?"—":game.rest+" days"} color={game.rest===0?"#C8102E":game.rest===1?"#E07530":S.text}/>
      <MRow label="Distance" value={game.dist>0?game.dist.toLocaleString()+" mi":"—"}/>
      <MRow label="Direction" value={game.dir} color={game.dir==="West"?"#F5B731":game.dir==="East"?"#6BB5FF":S.dim}/>
      <MRow label="TZ Shift" value={game.tzShift===0?"—":(game.tzShift>0?"+":"")+game.tzShift+" hrs"} color={Math.abs(game.tzShift)>=2?"#F5B731":S.text}/>
      <MRow label="Est. Flight" value={game.flight>0?game.flight+" hrs":"—"}/>
    </div>
    <div>
      <div style={{fontFamily:S.mono,fontSize:9,color:S.dim,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:10}}>Cumulative Load — Prior Day Windows</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
        {rd.map(r=><div key={r.w} style={{background:S.card,border:"1px solid "+S.border,borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontFamily:S.mono,fontSize:9,color:S.dim,marginBottom:6}}>{r.w}</div>
          <div style={{fontFamily:S.mono,fontSize:13,fontWeight:700,color:r.dist>0?S.text:S.dim}}>{r.dist>0?r.dist.toLocaleString()+"mi":"—"}</div>
          <div style={{fontFamily:S.sans,fontSize:10,color:S.mid,marginTop:2}}>{r.g}g · {r.tz}h tz</div>
        </div>)}
      </div>
      <BarChart data={rd} valueKey="dist" colorFn={()=>"#1D428A"} height={60} labelKey="w"/>
    </div>
    <button onClick={onClose} style={{marginTop:16,padding:"5px 14px",background:"transparent",border:"1px solid "+S.border,borderRadius:6,color:S.mid,fontFamily:S.mono,fontSize:10,cursor:"pointer"}}>Close</button>
  </div>;
}

function MultiSummary({games}){
  if(games.length<2) return null;
  const td=games.reduce((s,g)=>s+g.dist,0),rg=games.filter(g=>g.rest!==null);
  const ar=rg.length?(rg.reduce((s,g)=>s+g.rest,0)/rg.length).toFixed(1):"—";
  const ai=Math.round(games.reduce((s,g)=>s+g.idx,0)/games.length);
  const cd=games.map(g=>({date:fmtD(g.date),idx:g.idx,dist:g.dist}));
  return <div style={{background:S.surface,border:"1px solid "+S.border,borderRadius:12,padding:20,marginTop:12}}>
    <div style={{fontFamily:S.disp,fontSize:14,fontWeight:800,color:S.text,marginBottom:16}}>{games.length} Games Selected</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:16}}>
      {[{label:"Total Miles",val:td.toLocaleString()},{label:"Avg Rest",val:ar+"d"},{label:"TZ Hours",val:Math.abs(games.reduce((s,g)=>s+g.tzShift,0))||"—"},{label:"B2B Count",val:games.filter(g=>g.isB2B2).length},{label:"Avg Index",val:ai,color:sc(ai)}]
        .map(m=><div key={m.label} style={{background:S.card,border:"1px solid "+S.border,borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontFamily:S.mono,fontSize:9,color:S.dim,marginBottom:4}}>{m.label}</div>
          <div style={{fontFamily:S.mono,fontSize:16,fontWeight:700,color:m.color||S.text}}>{m.val}</div>
        </div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div>
        <div style={{fontFamily:S.mono,fontSize:9,color:S.dim,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Stress Index</div>
        <BarChart data={cd} valueKey="idx" colorFn={v=>sc(v)} height={80} labelKey="date"/>
      </div>
      <div>
        <div style={{fontFamily:S.mono,fontSize:9,color:S.dim,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Miles Traveled</div>
        <BarChart data={cd} valueKey="dist" colorFn={()=>"#1D428A"} height={80} labelKey="date"/>
      </div>
    </div>
  </div>;
}

function TeamPanel({abbr,sched}){
  const t=TEAMS[abbr],avg=sched.length?Math.round(sched.reduce((s,g)=>s+g.idx,0)/sched.length):0;
  return <div style={{background:S.card,border:"1px solid "+S.border,borderRadius:12,padding:18,borderTop:"3px solid "+t.color}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      <img src={tLogo(t.logo)} alt={abbr} width={44} height={44} style={{objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>
      <div><div style={{fontFamily:S.disp,fontSize:15,fontWeight:800,color:S.text}}>{t.name}</div><div style={{fontFamily:S.mono,fontSize:10,color:S.mid}}>{sched.length} games</div></div>
    </div>
    {[{label:"Avg Stress",val:avg,color:sc(avg)},{label:"Total Miles",val:Math.round(sched.reduce((s,g)=>s+g.dist,0)).toLocaleString()},{label:"B2B Games",val:sched.filter(g=>g.isB2B2).length},{label:"3-in-4",val:sched.filter(g=>g.is3in4).length},{label:"TZ Hours",val:Math.round(sched.reduce((s,g)=>s+Math.abs(g.tzShift),0))}]
      .map(m=><div key={m.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid "+S.border}}>
        <span style={{fontFamily:S.mono,fontSize:10,color:S.dim}}>{m.label}</span>
        <span style={{fontFamily:S.mono,fontSize:13,fontWeight:700,color:m.color||S.text}}>{m.val}</span>
      </div>)}
    <div style={{marginTop:14}}>
      <div style={{fontFamily:S.mono,fontSize:9,color:S.dim,marginBottom:6}}>Season Map</div>
      <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
        {sched.map((g,i)=><div key={i} title={fmtD(g.date)+" — "+g.idx} style={{width:8,height:8,borderRadius:2,background:sc(g.idx),opacity:0.8}}/>)}
      </div>
    </div>
  </div>;
}

function CompareView({a1,a2,s1,s2,onBack}){
  const n=Math.min(s1.length,s2.length,82);
  const cd=Array.from({length:n},(_,i)=>({game:i+1,[a1]:s1[i]?s1[i].idx:0,[a2]:s2[i]?s2[i].idx:0}));
  return <div>
    <button onClick={onBack} style={{background:"none",border:"none",color:S.mid,cursor:"pointer",fontFamily:S.mono,fontSize:11,marginBottom:20,padding:0}}>← Back</button>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      <TeamPanel abbr={a1} sched={s1}/><TeamPanel abbr={a2} sched={s2}/>
    </div>
    {cd.length>0&&<div style={{background:S.card,border:"1px solid "+S.border,borderRadius:12,padding:20}}>
      <div style={{fontFamily:S.disp,fontSize:14,fontWeight:800,color:S.text,marginBottom:16}}>Stress Index — Game by Game</div>
      <LineChart data={cd} lines={[{key:a1,color:TEAMS[a1].color,label:a1},{key:a2,color:TEAMS[a2].color,label:a2}]} height={160}/>
    </div>}
  </div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App(){
  const [view,setView]=useState("teams"),[team,setTeam]=useState(null),[compare,setCompare]=useState(null);
  const [picking,setPicking]=useState(false),[schedules,setSchedules]=useState({});
  const [loading,setLoading]=useState(false),[loadMsg,setLoadMsg]=useState(""),[error,setError]=useState(null);
  const [checkedIds,setCheckedIds]=useState([]),[focused,setFocused]=useState(null),[search,setSearch]=useState("");

  const load=useCallback(async abbr=>{
    if(schedules[abbr]) return;
    setLoading(true);setError(null);
    try{const games=await fetchSchedule(abbr,m=>setLoadMsg(m));setSchedules(p=>({...p,[abbr]:games}));setLoadMsg("");}
    catch(e){setError(e.message);}
    setLoading(false);
  },[schedules]);

  const handleTeam=async abbr=>{
    if(picking){setCompare(abbr);setPicking(false);await load(abbr);setView("compare");return;}
    setTeam(abbr);setCheckedIds([]);setFocused(null);setView("team");await load(abbr);
  };
  const hCheck=id=>setCheckedIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const hFocus=game=>setFocused(p=>p&&p.id===game.id?null:game);
  const goHome=()=>{setView("teams");setTeam(null);setCompare(null);setPicking(false);};
  const sched=team?(schedules[team]||[]):[];
  const checked=sched.filter(g=>checkedIds.includes(g.id));
  const avg=sched.length?Math.round(sched.reduce((s,g)=>s+g.idx,0)/sched.length):0;
  const east=Object.keys(TEAMS).filter(k=>TEAMS[k].conf==="E");
  const west=Object.keys(TEAMS).filter(k=>TEAMS[k].conf==="W");
  const fil=arr=>search?arr.filter(k=>TEAMS[k].name.toLowerCase().includes(search.toLowerCase())||k.includes(search.toUpperCase())):arr;
  const COL="18px 62px 1fr 38px 68px 44px 76px 58px";

  return <div style={{background:S.bg,minHeight:"100vh",color:S.text}}>

    {/* HEADER */}
    <div style={{borderBottom:"1px solid "+S.border,padding:"13px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:S.bg+"ee",backdropFilter:"blur(8px)",zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <button onClick={goHome} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
          <span style={{fontFamily:S.disp,fontSize:21,fontWeight:900,color:S.accent,letterSpacing:"-0.04em"}}>AIR<span style={{color:S.text}}>BALL</span></span>
        </button>
        <span style={{fontFamily:S.mono,fontSize:9,color:S.dim,textTransform:"uppercase",letterSpacing:"0.18em"}}>NBA Schedule Stress</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {picking&&<span style={{fontFamily:S.mono,fontSize:11,color:"#F5B731",animation:"pulse 1.2s infinite"}}>Select team to compare →</span>}
        {view==="team"&&team&&!picking&&<button onClick={()=>{setPicking(true);setView("teams");}} style={{padding:"5px 14px",background:"transparent",border:"1px solid "+S.border,borderRadius:6,color:S.mid,fontFamily:S.mono,fontSize:10,cursor:"pointer"}}>Compare Team</button>}
        {view==="compare"&&<button onClick={()=>{setView("team");setCompare(null);}} style={{padding:"5px 14px",background:"transparent",border:"1px solid "+S.border,borderRadius:6,color:S.mid,fontFamily:S.mono,fontSize:10,cursor:"pointer"}}>← Back</button>}
      </div>
    </div>

    <div style={{maxWidth:1060,margin:"0 auto",padding:"24px 24px 60px"}}>

      {/* TEAMS */}
      {view==="teams"&&<div>
        {picking&&<div style={{background:"#F5B73115",border:"1px solid #F5B73145",borderRadius:8,padding:"10px 16px",marginBottom:20,fontFamily:S.mono,fontSize:11,color:"#F5B731",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span>Pick a team to compare with <strong>{TEAMS[team]&&TEAMS[team].name}</strong></span>
          <button onClick={()=>{setPicking(false);setView("team");}} style={{background:"none",border:"none",color:S.mid,cursor:"pointer",fontFamily:S.mono,fontSize:10}}>Cancel</button>
        </div>}
        <div style={{marginBottom:24}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search teams…"
            style={{background:S.surface,border:"1px solid "+S.border,borderRadius:8,padding:"7px 14px",color:S.text,fontFamily:S.mono,fontSize:11,width:220,outline:"none"}}/>
        </div>
        {[{label:"Eastern Conference",teams:fil(east)},{label:"Western Conference",teams:fil(west)}].map(({label,teams})=><div key={label} style={{marginBottom:30}}>
          <div style={{fontFamily:S.mono,fontSize:9,color:S.dim,textTransform:"uppercase",letterSpacing:"0.18em",marginBottom:10}}>{label}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:8}}>
            {teams.map(abbr=><TeamCard key={abbr} abbr={abbr} selected={abbr===team||abbr===compare} onClick={handleTeam}/>)}
          </div>
        </div>)}
      </div>}

      {/* TEAM SCHEDULE */}
      {view==="team"&&team&&<div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:22}}>
          <button onClick={()=>{setView("teams");setTeam(null);}} style={{background:"none",border:"none",color:S.mid,cursor:"pointer",fontFamily:S.mono,fontSize:13,padding:0}}>←</button>
          <img src={tLogo(TEAMS[team]&&TEAMS[team].logo)} alt={team} width={52} height={52} style={{objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>
          <div>
            <div style={{fontFamily:S.disp,fontSize:24,fontWeight:900,color:S.text}}>{TEAMS[team]&&TEAMS[team].name}</div>
            {sched.length>0&&<div style={{fontFamily:S.mono,fontSize:10,color:S.mid,marginTop:3}}>{sched.length} games · {sched.filter(g=>g.isB2B2).length} B2B · {sched.filter(g=>g.is3in4).length} 3-in-4</div>}
          </div>
          {sched.length>0&&<div style={{marginLeft:"auto",textAlign:"right"}}>
            <div style={{fontFamily:S.mono,fontSize:9,color:S.dim,textTransform:"uppercase",letterSpacing:"0.1em"}}>Season Avg</div>
            <div style={{fontFamily:S.mono,fontSize:32,fontWeight:900,color:sc(avg),lineHeight:1.1}}>{avg}</div>
            <div style={{fontFamily:S.mono,fontSize:9,color:sc(avg),textTransform:"uppercase"}}>{sl(avg)}</div>
          </div>}
        </div>

        {sched.length>0&&<div style={{background:S.surface,border:"1px solid "+S.border,borderRadius:10,padding:"12px 16px",marginBottom:14}}>
          <div style={{fontFamily:S.mono,fontSize:9,color:S.dim,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:8}}>Season Stress Timeline</div>
          <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
            {sched.map((g,i)=><div key={i} onClick={()=>{hFocus(g);setCheckedIds([g.id]);}} title={fmtD(g.date)+" vs "+g.opp+" — "+sl(g.idx)+" ("+g.idx+")"}
              style={{width:9,height:9,borderRadius:2,background:sc(g.idx),opacity:checkedIds.includes(g.id)?1:0.65,cursor:"pointer",outline:checkedIds.includes(g.id)?"1px solid #fff":"none"}}/>)}
          </div>
        </div>}

        {loading&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:40,color:S.mid,fontFamily:S.mono,fontSize:11}}>
          <div style={{width:16,height:16,border:"2px solid "+S.border,borderTop:"2px solid "+S.accent,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
          {loadMsg||"Loading…"}
        </div>}

        {error&&<div style={{background:"#C8102E18",border:"1px solid #C8102E44",borderRadius:8,padding:"14px 16px",marginBottom:14,fontFamily:S.mono,fontSize:11,color:"#E87070",whiteSpace:"pre-line"}}>{error}</div>}

        {sched.length>0&&<div style={{background:S.surface,border:"1px solid "+S.border,borderRadius:10,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:COL,gap:8,padding:"7px 14px",borderBottom:"1px solid "+S.border,background:S.card}}>
            {["","Date","Opponent","Rest","Miles","TZ","Density","IDX"].map((h,i)=><span key={i} style={{fontFamily:S.mono,fontSize:8,color:S.dim,textTransform:"uppercase",letterSpacing:"0.14em",textAlign:i>=3?"right":"left"}}>{h}</span>)}
          </div>
          {sched.map(game=><GameRow key={game.id} game={game} selected={checkedIds.includes(game.id)} onCheck={hCheck} onClick={hFocus}/>)}
        </div>}

        {focused&&<GameDetail game={focused} abbr={team} onClose={()=>{setFocused(null);setCheckedIds([]);}}/>}
        {checked.length>1&&!focused&&<MultiSummary games={checked}/>}
      </div>}

      {/* COMPARE */}
      {view==="compare"&&team&&compare&&<CompareView a1={team} a2={compare} s1={schedules[team]||[]} s2={schedules[compare]||[]} onBack={()=>{setView("team");setCompare(null);}}/>}

    </div>

    {/* LEGEND */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,borderTop:"1px solid "+S.border,background:S.bg+"f0",backdropFilter:"blur(8px)",padding:"8px 28px",display:"flex",alignItems:"center",gap:24}}>
      <span style={{fontFamily:S.mono,fontSize:9,color:S.dim,textTransform:"uppercase",letterSpacing:"0.1em"}}>Stress Index</span>
      {[["Low","#2DBF82","<25"],["Moderate","#F5B731","25–49"],["High","#E07530","50–69"],["Extreme","#C8102E","70+"]].map(([label,color,range])=><div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
        <div style={{width:8,height:8,borderRadius:2,background:color}}/><span style={{fontFamily:S.mono,fontSize:9,color:S.mid}}>{label}</span><span style={{fontFamily:S.mono,fontSize:8,color:S.dim}}>{range}</span>
      </div>)}
      <span style={{marginLeft:"auto",fontFamily:S.mono,fontSize:8,color:S.dim}}>airball (Fernández, 2020) · ESPN live · Index arbitrary/unvalidated</span>
    </div>
  </div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
