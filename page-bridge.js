
(() => {
  if (window.__lumenaPositionBridgeInstalled) return;
  window.__lumenaPositionBridgeInstalled = true;
  const ids = new WeakMap(), history = new Map();
  let nextId = 1, lastKeyAt = 0, lastPublished = '', lastGood = null;
  const finite = n => Number.isFinite(Number(n));
  const posOf = o => {
    const p=o?.position;
    return p&&finite(p.x)&&finite(p.z)?{x:+p.x,y:finite(p.y)?+p.y:null,z:+p.z}:null;
  };
  const idOf = o => (ids.has(o)?ids.get(o):(ids.set(o,nextId),nextId++));
  const labelOf = o => {
    try{return [o?.name,o?.type,o?.userData?.name,o?.userData?.id,o?.userData?.type,o?.userData?.role].filter(Boolean).join(' ').toLowerCase()}catch{return''}
  };
  addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD'].includes(e.code))lastKeyAt=performance.now()},true);

  function roots(){
    const out=[];
    for(const el of [document.documentElement,document.body,...document.querySelectorAll('canvas,#root,[id*="root"]')]){
      if(!el)continue;
      for(const k of Object.getOwnPropertyNames(el)){
        if(k.startsWith('__reactFiber$')||k.startsWith('__reactContainer$')){
          const v=el[k]; if(v)out.push(v.current||v);
        }
      }
    }
    return [...new Set(out)];
  }

  function inspect(v,path,depth,cands,states,battles,encounters,seen){
    if(!v||(typeof v!=='object'&&typeof v!=='function')||depth>3||seen.has(v))return;
    seen.add(v);
    try{
      if(typeof v.currentZoneId==='string'&&(typeof v.phase==='string'||typeof v.currentScene==='string'))states.push(v);
      const encounter=v.encounter||v.wildEncounter||v.lastEncounter||v.pendingEncounter||v.encounterResult||null;
      const encounterObj=(encounter&&typeof encounter==='object')?encounter:
        (
          typeof v.speciesId==='string' &&
          ('shiny' in v || 'isShiny' in v) &&
          (
            typeof v.zoneId==='string' ||
            typeof v.method==='string' ||
            typeof v.requestId==='string'
          )
        ? v : null);
      if(encounterObj){
        encounters.push({
          path,
          at:Date.now(),
          speciesId:encounterObj.speciesId||encounterObj.species?.id||null,
          name:encounterObj.name||encounterObj.species?.name||encounterObj.displayName||null,
          level:Number.isFinite(+encounterObj.level)?+encounterObj.level:null,
          gender:encounterObj.gender||null,
          form:encounterObj.form||encounterObj.formId||encounterObj.variant||encounterObj.variantId||null,
          zoneId:encounterObj.zoneId||v.zoneId||null,
          method:encounterObj.method||v.method||null,
          requestId:encounterObj.requestId||v.requestId||null,
          shiny:encounterObj.shiny===true||encounterObj.isShiny===true,
          shinyRaw:encounterObj.shiny,
          isShinyRaw:encounterObj.isShiny
        });
      }

      const enemy=v.enemy||v.opponent||v.wildEnemy||v.activeEnemy||null;
      if(enemy&&typeof enemy==='object'){
        const shinyFlag=enemy.shiny===true||enemy.isShiny===true;
        const hasBattleShape=
          typeof enemy.speciesId==='string'||
          typeof enemy.name==='string'||
          Number.isFinite(+enemy.level)||
          typeof v.battleId==='string'||
          typeof v.turn==='number';
        if(hasBattleShape){
          battles.push({
            path,
            enemy:{
              shiny:shinyFlag,
              shinyRaw:enemy.shiny,
              isShinyRaw:enemy.isShiny,
              speciesId:enemy.speciesId||enemy.species?.id||enemy.id||null,
              name:enemy.name||enemy.species?.name||enemy.displayName||null,
              level:Number.isFinite(+enemy.level)?+enemy.level:null,
              gender:enemy.gender||null,
              form:enemy.form||enemy.formId||enemy.variant||enemy.variantId||null
            },
            battleId:v.battleId||v.id||null,
            active:v.active!==false&&v.ended!==true&&v.complete!==true
          });
        }
      }
    }catch{}
    const p=posOf(v);
    if(p&&(v.isObject3D||v.type||v.children)){
      const label=`${path} ${labelOf(v)}`.toLowerCase();
      let score=0;
      if(/player|avatar|trainer|character|hero/.test(label))score+=120;
      if(/playerref|player_ref|player ref/.test(label))score+=90;
      if(v.isCamera||/camera/.test(String(v.type||'').toLowerCase()))score-=300;
      if(v.isLight||/light/.test(String(v.type||'').toLowerCase()))score-=250;
      if(v.isScene||String(v.type||'').toLowerCase()==='scene')score-=220;
      if(String(v.type||'').toLowerCase()==='group')score+=18;
      if(Array.isArray(v.children)&&v.children.length>0&&v.children.length<80)score+=12;
      if(p.y==null||(p.y>-2&&p.y<8))score+=12;
      const id=idOf(v),old=history.get(id),moved=old?Math.hypot(p.x-old.x,p.z-old.z):0,now=performance.now();
      if(moved>.002&&moved<5){score+=40;if(now-lastKeyAt<900)score+=100}
      history.set(id,{x:p.x,z:p.z,at:now});
      cands.push({p,score,id,label:label.slice(0,240),moved});
    }
    if(depth>=3)return;
    for(const k of ['current','memoizedState','memoizedProps','stateNode','ref','playerRef','player','avatar','store','api','value']){
      let x;try{x=v[k]}catch{continue}
      if(x&&x!==v)inspect(x,`${path}.${k}`,depth+1,cands,states,battles,encounters,seen);
    }
    if(Array.isArray(v))for(let i=0;i<Math.min(v.length,12);i++)inspect(v[i],`${path}[${i}]`,depth+1,cands,states,battles,encounters,seen);
  }

  function scan(){
    const cands=[],states=[],battles=[],encounters=[],seen=new WeakSet(),rs=roots(),q=[...rs],fiberSeen=new Set();
    let visited=0;
    while(q.length&&visited<6500){
      const f=q.shift();if(!f||fiberSeen.has(f))continue;fiberSeen.add(f);visited++;
      inspect(f.memoizedProps,'fiber.memoizedProps',0,cands,states,battles,encounters,seen);
      inspect(f.memoizedState,'fiber.memoizedState',0,cands,states,battles,encounters,seen);
      inspect(f.stateNode,'fiber.stateNode',0,cands,states,battles,encounters,seen);
      inspect(f.ref,'fiber.ref',0,cands,states,battles,encounters,seen);
      if(f.child)q.push(f.child);if(f.sibling)q.push(f.sibling);if(f.return&&visited<30)q.push(f.return);
    }
    cands.sort((a,b)=>b.score-a.score);
    const best=cands.find(c=>c.score>=35)||null;
    const state=states.find(s=>typeof s.currentZoneId==='string')||null;
    const battleCandidates=battles.filter(b=>b?.enemy);
    battleCandidates.sort((a,b)=>{
      const sa=(a.enemy.shiny?1000:0)+(a.active?100:0)+(a.enemy.speciesId?20:0)+(a.enemy.name?10:0);
      const sb=(b.enemy.shiny?1000:0)+(b.active?100:0)+(b.enemy.speciesId?20:0)+(b.enemy.name?10:0);
      return sb-sa;
    });
    const officialBattle=battleCandidates[0]||null;
    const encounterCandidates=encounters.filter(e=>e?.speciesId||e?.requestId);
    encounterCandidates.sort((a,b)=>{
      const sa=(a.shiny?1000:0)+(a.requestId?100:0)+(a.zoneId?30:0)+(a.method==='grass'?20:0)+(a.speciesId?10:0);
      const sb=(b.shiny?1000:0)+(b.requestId?100:0)+(b.zoneId?30:0)+(b.method==='grass'?20:0)+(b.speciesId?10:0);
      return sb-sa;
    });
    const officialEncounter=encounterCandidates[0]||null;
    const payload={
      source:'lumena-page-bridge',version:'1.2',at:Date.now(),ok:!!best,
      position:best?best.p:null,zoneId:state?.currentZoneId||null,phase:state?.phase||null,
      currentScene:state?.currentScene||null,transition:state?.transition||null,
      activeInteriorId:state?.activeInteriorId||null,
      encounter:officialEncounter?{
        ...officialEncounter,
        source:'wild-encounter-state'
      }:null,
      battle:officialBattle?{
        active:officialBattle.active,
        battleId:officialBattle.battleId,
        enemy:officialBattle.enemy,
        source:'react-state'
      }:null,
      confidence:best?Math.max(0,Math.min(1,best.score/180)):0,
      candidate:best?{id:best.id,score:best.score,label:best.label,moved:best.moved}:null,
      diagnostics:{roots:rs.length,fibers:visited,candidates:cands.length,states:states.length,battles:battleCandidates.length,encounters:encounterCandidates.length}
    };
    if(payload.ok)lastGood=payload;
    else if(lastGood&&Date.now()-lastGood.at<1500){
      payload.position=lastGood.position;payload.zoneId=payload.zoneId||lastGood.zoneId;
      payload.confidence=Math.min(lastGood.confidence,.55);payload.stale=true;
    }
    const sig=JSON.stringify([payload.position?.x,payload.position?.z,payload.zoneId,payload.phase,payload.ok,payload.candidate?.id,payload.encounter?.shiny,payload.encounter?.speciesId,payload.encounter?.requestId,payload.battle?.enemy?.shiny,payload.battle?.enemy?.speciesId,payload.battle?.battleId]);
    if(sig!==lastPublished||Date.now()%1000<220){lastPublished=sig;postMessage(payload,'*')}
  }
  setInterval(scan,180);
  addEventListener('DOMContentLoaded',scan,{once:true});
  scan();
})();
