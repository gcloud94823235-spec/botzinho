// FILE: background.js
// (conteúdo completo do background.js modificado — substitua seu background.js por este)
importScripts('world-catalog.js','nav-catalog.js','route-fix.js','zone-catalog.js','tier-catalog.js','trainer-catalog.js');
const VERSION='7.7.2';
const DIAGNOSTIC_EDITION='complete-static-catalog-diagnostic';
const MAX_FRAME_TEXT=24000, MAX_POST_DATA=12000, MAX_CONSOLE_TEXT=12000;
function mergeBundledMapCatalog(){
 self.LUMENA_NAV_CATALOG=self.LUMENA_NAV_CATALOG||{};
 const bundled=self.LUMENA_MAP_CATALOG||{};
 const zoneTypes=new Map((self.LUMENA_ZONE_CATALOG||[]).map(z=>[z.id,z.type]));
 let added=0,upgraded=0;
 for(const [id,raw] of Object.entries(bundled)){
  if(!raw||!id)continue;
  const clone=JSON.parse(JSON.stringify(raw));
  const existing=self.LUMENA_NAV_CATALOG[id];
  const isWild=zoneTypes.get(id)==='wild'||/(route|path|trail|climb|woods|pass|road|flats|rise|wilds)/i.test(id);
  clone.catalogSource='bundled-world';
  clone.autoLearned=!!clone.autoLearned||(isWild&&!(clone.highGrass||[]).length);
  if(!existing){self.LUMENA_NAV_CATALOG[id]=clone;added++;continue}
  const existingWalk=(existing.walkable||[]).length, bundledWalk=(clone.walkable||[]).length;
  const existingGrass=(existing.highGrass||[]).length, bundledGrass=(clone.highGrass||[]).length;
  if(bundledWalk>existingWalk||bundledGrass>existingGrass){
   self.LUMENA_NAV_CATALOG[id]={...clone,...existing,
    walkable:bundledWalk>existingWalk?clone.walkable:existing.walkable,
    blocking:(clone.blocking||[]).length>(existing.blocking||[]).length?clone.blocking:existing.blocking,
    highGrass:bundledGrass>existingGrass?clone.highGrass:existing.highGrass,
    exits:(clone.exits||[]).length>(existing.exits||[]).length?clone.exits:existing.exits,
    spawns:Object.keys(clone.spawns||{}).length>Object.keys(existing.spawns||{}).length?clone.spawns:existing.spawns,
    catalogSource:'bundled-world'
   };upgraded++;
  }
 }
 return{added,upgraded,total:Object.keys(self.LUMENA_NAV_CATALOG).length};
}
const BUNDLED_MAP_MERGE=mergeBundledMapCatalog();
const COMPLETE_MAP_CATALOG_INFO={
 total:Object.keys(self.LUMENA_MAP_CATALOG||{}).length,
 ids:Object.keys(self.LUMENA_MAP_CATALOG||{}),
 wild:Object.values(self.LUMENA_MAP_CATALOG||{}).filter(m=>(m.highGrass||[]).length>0).map(m=>m.id),
 generatedFrom:'bundled-world-data-and-scene-world-js'
};

const ST={running:false,tabId:null,attached:false,phase:'idle',lastError:null,events:[],timer:null,exportTimer:null,startedAt:0,lastMoveAt:0,officialMoves:0,encounters:0,battles:0,wins:0,captureAttempts:0,captures:0,actions:0,failedMoves:0,dirIndex:0,lastActionSig:'',lastActionAt:0,probe:null,position:null,zoneId:null,lastEncounterMove:0,navGoal:null,interactionMode:null,transitionUntil:0,transitionAttempts:0,samePosFailures:0,lastFailedPos:null,blockedEdges:{},lastZoneId:null,entryPortalId:null,entryPortalUntil:0,domBattleActive:false,lastBattleSeenAt:0,lastBattleEndedAt:0,lastBattleOutcome:null,teamWipes:0,respawns:0,checks:{worker:'ok',tab:'pending',content:'pending',debugger:'pending',input:'pending',websocket:'pending',battleDom:'pending'},sessionId:null,eventSeq:0,totalEvents:0,chunkIndex:0,lastExportAt:0,lastSnapshotSig:'',lastMilestoneSig:'',milestoneSigs:{},requestMeta:{},network:{requests:0,responses:0,failures:0,wsSent:0,wsReceived:0},milestones:{account:0,tutorial:0,trainer:0,evolution:0,capture:0,quest:0,zone:0},config:{autoEnterPlay:true,movement:true,battle:true,smoothMovement:true,pauseTierS:false,pauseTierA:false,pauseTierB:true,pauseShiny:true,tutorial:false,followQuests:false,localFarmMode:true,moveToFarmMap:false,stayOnFarmMap:false,returnAfterWipe:true,dailyTrainers:false,trainersBeforeFarm:false,autoGacha:false,autoIncubator:false,autoSlots:false,slotBet:1,slotMaxSpins:100,slotMinChips:0,autoCaptureWild:true,captureOnlyShiny:true,captureHpPercent:30,lanternPreference:'auto',captureRetries:3,farmMap:'softglade-path',diagnosticMinutes:3,fullDiagnostic:true,networkMetadata:true,domSnapshots:true,screenshotMilestones:false,recordVideo:false,videoSegmentMinutes:8,videoMaxMB:180,videoQuality:'720p',videoAudio:false},video:{enabled:false,recording:false,partIndex:0,segmentStartedAt:0,totalStartedAt:0,segmentBytes:0,partsSaved:0,lastFilename:null,error:null,mimeType:null},pendingFarmMap:null,farmMapChangeAt:0,trainerMode:'idle',gacha:{holding:false,lastPullAt:0,lastResult:null},casino:{active:false,spins:0,maxSpins:0,chips:null,lastSpinAt:0,lastResult:null,stopReason:null,lastStatus:null},capture:{stage:'idle',attemptsThisBattle:0,lastAttemptAt:0,lastResult:null,noLanternThisBattle:false},battleServerActive:false,lastBattleRewardAt:0,actionInFlight:false,actionUnlockAt:0,currentTrainer:null,trainerCompleted:{},trainerSkipped:{},trainerTargetSince:0,trainerInteractAt:0,trainerDialogSince:0,recovering:false,recoverAttempts:0,lastRecoveryAt:0,desiredRunning:false,movementInFlight:false,lastWorldResumeAt:0,lastDialogAt:0,interiorId:null,bootstrapAttempts:0,tidemarshRecoveryDir:0,lastFarmZone:null,respawnReturnActive:false,respawnReturnTarget:null,specialPause:null,nextStraightSteps:1,lastSmoothDir:null,lastTrainerCheckAt:0,userPaused:false,lastTickAt:0,lastTickCompletedAt:0,lastHeartbeatAt:0,watchdogRecoveries:0,consecutiveLoopErrors:0,dynamicAnchor:null,dynamicPreferredDir:null,dynamicTurnIndex:0,recentWorldTiles:[],learnedMapsLoaded:false,inputMode:'debugger',debuggerUnavailable:false,domPatrolDir:0,domPatrolStep:0,domPatrolLastAt:0,domPatrolCycles:0,spotByZone:{},selectedSpot:null,spotReturnActive:false,spotReturnIndex:0,spotReturnStartedAt:0,spotReturnReason:null,anchorNeighbor:null,anchorNeighborIndex:0,positionSource:null,lastBridgeAt:0,battleOriginZone:null,battleOriginPosition:null,wipePendingAt:0,wipeReturnSpotZone:null,crystalByZone:{}}; // <-- added crystalByZone init
const DIR={up:['KeyW','w'],right:['KeyD','d'],down:['KeyS','s'],left:['KeyA','a']};
const NAME_TO_ZONE=Object.fromEntries((self.LUMENA_ZONE_CATALOG||[]).flatMap(z=>[[z.name,z.id],[String(z.name||'').toLowerCase(),z.id]]));Object.assign(NAME_TO_ZONE,{'Firstlight':'firstlight','Firstlight Village':'firstlight','firstlight':'firstlight','firstlight village':'firstlight'});
const resolveZoneId=name=>NAME_TO_ZONE[name]||NAME_TO_ZONE[String(name||'').toLowerCase()]||null;
const LEARNED_MAPS_KEY='lumenaLearnedMapsV1';let learnedSaveTimer=null;
// Tidemarsh is recognized in the route graph. Movement inside the city uses a conservative return-to-coast recovery until a full collision catalog is available.
if(self.LUMENA_NAV_CATALOG&&!self.LUMENA_NAV_CATALOG.tidemarsh){self.LUMENA_NAV_CATALOG.tidemarsh={id:'tidemarsh',name:'Tidemarsh City',width:60,height:60,tileSize:1,walkable:[],blocking:[],highGrass:[],exits:[{id:'west',to:'coast-route',facing:'left',tiles:[]}],spawns:{fromCoast:{facing:'right',tile:'1:33'}}};}
const redactSensitive=v=>String(v??'')
 .replace(/(\"?(?:accessToken|access_token|refreshToken|refresh_token|authorization|cookie|set-cookie|password|private[_ -]?key|mnemonic|secret|apikey)\"?\s*[:=]\s*\"?)([^\",}\s;]+)/ig,'$1[REDACTED]')
 .replace(/(Bearer\s+)[A-Za-z0-9._~+\/-]+/ig,'$1[REDACTED]');
const safeText=(v,n=MAX_CONSOLE_TEXT)=>redactSensitive(v).slice(0,n);
const sanitizeHeaders=(h={})=>Object.fromEntries(Object.entries(h||{}).map(([k,v])=>[/authorization|cookie|token|secret|key/i.test(k)?k:k,/authorization|cookie|token|secret|key/i.test(k)?'[REDACTED]':safeText(v,1000)]));
const log=(kind,data={})=>{const ev={seq:++ST.eventSeq,ts:Date.now(),iso:new Date().toISOString(),kind,data};ST.events.push(ev);ST.totalEvents++;if(ST.events.length>50000){ST.events.splice(0,5000);ST.lastError='Buffer de diagnóstico excedeu 50.000 eventos antes da exportação';}return ev};
const rawCmd=(m,p={})=>chrome.debugger.sendCommand({tabId:ST.tabId},m,p),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const cmd=async(m,p={})=>{if(ST.inputMode==='dom')throw Error('debugger-unavailable-dom-fallback');return rawCmd(m,p)};
const RUNTIME_KEY='lumenaAutoplayRuntimeV720';
async function persistRuntime(){
  try{await chrome.storage.local.set({[RUNTIME_KEY]:{desiredRunning:!!ST.desiredRunning,userPaused:!!ST.userPaused,tabId:ST.tabId,config:ST.config,startedAt:ST.startedAt,sessionId:ST.sessionId,lastTickAt:ST.lastTickAt,lastTickCompletedAt:ST.lastTickCompletedAt,updatedAt:Date.now()}})}catch(e){log('runtime-persist-error',{message:e.message})}
}
async function clearRuntime(){try{await chrome.storage.local.remove(RUNTIME_KEY)}catch{}}
async function findLumenaTab(preferredId=null){
  if(preferredId){try{const t=await chrome.tabs.get(preferredId);if(t?.id&&/lumena\.gg/i.test(t.url||''))return t}catch{}}
  const tabs=await chrome.tabs.query({url:['https://lumena.gg/*','https://*.lumena.gg/*']});
  return tabs.find(t=>t.active)||tabs[0]||null;
}
async function ensureAttached(reason='watchdog'){
  if(!ST.desiredRunning&&!ST.running)return false;
  if(ST.recovering)return ST.attached;
  ST.recovering=true;
  try{
    const tab=await findLumenaTab(ST.tabId);
    if(!tab?.id)throw Error('Aba do Lumena não encontrada para recuperação.');
    ST.tabId=tab.id;
    if(!ST.attached&&ST.inputMode!=='dom')await attach();
    await ensureContentScript();
    ST.checks.tab='ok';ST.checks.content='ok';ST.checks.debugger=ST.inputMode==='dom'?'fallback':'ok';ST.lastError=null;ST.recoverAttempts=0;ST.lastRecoveryAt=Date.now();
    if(ST.desiredRunning&&!ST.running&&!ST.userPaused&&!ST.specialPause){ST.running=true;ST.phase=ST.phase==='idle'?'world':ST.phase;clearTimeout(ST.timer);tick();}
    log('runtime-recovered',{reason,tabId:ST.tabId});
    await persistRuntime();
    return true;
  }catch(e){
    ST.recoverAttempts++;ST.lastError=`Recuperação automática: ${e.message}`;ST.checks.debugger=ST.attached?'ok':'pending';
    log('runtime-recovery-failed',{reason,attempt:ST.recoverAttempts,message:e.message});
    return false;
  }finally{ST.recovering=false}
}
async function restoreRuntime(reason='service-worker-start'){
  try{
    const saved=(await chrome.storage.local.get(RUNTIME_KEY))[RUNTIME_KEY];
    if(!saved?.desiredRunning)return false;
    Object.assign(ST.config,saved.config||{});ST.desiredRunning=true;ST.userPaused=!!saved.userPaused;ST.running=false;ST.tabId=saved.tabId||null;ST.startedAt=saved.startedAt||Date.now();ST.sessionId=saved.sessionId||new Date().toISOString().replace(/[:.]/g,'-');ST.phase='world';
    log('runtime-restore-requested',{reason,tabId:ST.tabId});
    return await ensureAttached(reason);
  }catch(e){ST.lastError=e.message;log('runtime-restore-error',{reason,message:e.message});return false}
}
async function autoDownload(options){const opts={saveAs:false,conflictAction:'uniquify',...options};return await chrome.downloads.download(opts)}
async function runtimeWatchdog(reason='runtime-watchdog'){
  if(!ST.desiredRunning||ST.userPaused||ST.specialPause)return false;
  const now=Date.now(),stale=!ST.lastTickAt||now-ST.lastTickAt>6000||(!ST.timer&&ST.running);
  if(!stale&&ST.running&&ST.attached)return false;
  ST.watchdogRecoveries++;ST.lastRecoveryAt=now;
  log('runtime-watchdog-triggered',{reason,running:ST.running,attached:ST.attached,lastTickAt:ST.lastTickAt,lastTickCompletedAt:ST.lastTickCompletedAt,timerPresent:!!ST.timer,recovery:ST.watchdogRecoveries});
  clearTimeout(ST.timer);ST.timer=null;ST.running=false;ST.actionInFlight=false;ST.movementInFlight=false;
  await release().catch(()=>{});
  const ok=await ensureAttached(reason);
  if(ok&&!ST.userPaused&&!ST.specialPause){ST.running=true;ST.lastTickAt=Date.now();clearTimeout(ST.timer);ST.timer=setTimeout(tick,20);log('runtime-watchdog-restarted',{reason,recovery:ST.watchdogRecoveries})}
  await persistRuntime();return ok;
}
let attachPromise=null;
async function debuggerCommandWorks(){
  try{await rawCmd('Runtime.enable');return true}catch{return false}
}
async function attach(){
  if(ST.attached&&await debuggerCommandWorks()){ST.checks.debugger='ok';return true}
  if(attachPromise)return attachPromise;
  attachPromise=(async()=>{
    ST.attached=false;ST.checks.debugger='pending';
    // MV3 can restart the service worker while Chrome still keeps this extension attached.
    // Reuse that session before attempting a new attach.
    if(await debuggerCommandWorks()){
      ST.attached=true;ST.checks.debugger='ok';log('debugger-session-reused');return true;
    }
    let firstError=null;
    try{await chrome.debugger.attach({tabId:ST.tabId},'1.3')}
    catch(e){firstError=e}
    if(firstError){
      const msg=String(firstError.message||'');
      if(/another debugger|devtools/i.test(msg)){
        ST.lastError='Outro debugger/DevTools está ligado à aba. Feche-o e tente novamente.';
        throw firstError;
      }
      // Chrome can reject debugger attachment permanently (for example when another debugger owns the tab).
      // Do not keep the bot stopped: switch to the content-script input fallback.
      ST.inputMode='dom';ST.debuggerUnavailable=true;ST.attached=false;ST.checks.debugger='fallback';
      log('debugger-fallback-enabled',{firstError:msg});return true;
    }
    ST.attached=true;ST.checks.debugger='ok';
    for(const d of ['Runtime.enable','Network.enable','Log.enable','Page.enable','DOM.enable']){
      try{await cmd(d)}catch(e){ST.attached=false;ST.checks.debugger='pending';throw e}
    }
    ST.recoverAttempts=0;log('debugger-attached');return true;
  })().finally(()=>{attachPromise=null});
  return attachPromise;
}
async function key(code,keyValue,down){
  if(ST.inputMode==='dom'){
    const r=await chrome.tabs.sendMessage(ST.tabId,{type:'input-key',code,key:keyValue,down});
    if(!r?.ok)throw Error(r?.error||'Falha no input DOM');ST.checks.input='fallback';log('key-dom',{code,key:keyValue,down});return;
  }
  const v=code==='Space'?32:keyValue.toUpperCase().charCodeAt(0),type=down?'keyDown':'keyUp',p={type,code,key:keyValue,windowsVirtualKeyCode:v,nativeVirtualKeyCode:v};if(down&&keyValue.length===1)p.text=keyValue;await cmd('Input.dispatchKeyEvent',p);ST.checks.input='ok';log('key',p)
}
async function release(){for(const [c,k] of Object.values(DIR))await key(c,k,false).catch(()=>{})}
async function cdpClick(t){
  if(!t?.rect)return false;
  if(ST.inputMode==='dom'){
    const r=await chrome.tabs.sendMessage(ST.tabId,{type:'input-click',target:t});
    if(!r?.ok)throw Error(r?.error||'Falha no clique DOM');ST.actions++;log('dom-click',{text:t.text,rect:t.rect});return true;
  }
  const x=t.rect.cx,y=t.rect.cy;for(const type of ['mouseMoved','mousePressed','mouseReleased'])await cmd('Input.dispatchMouseEvent',{type,x,y,button:type==='mouseMoved'?'none':'left',clickCount:type==='mouseMoved'?0:1});ST.actions++;log('cdp-click',{text:t.text,rect:t.rect});return true
}
async function cdpHold(t,maxMs=4200){if(!t?.rect)return false;const x=t.rect.cx,y=t.rect.cy;log('gacha-hold-start',{text:t.text,rect:t.rect,maxMs});await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'none'});await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});ST.gacha.holding=true;const started=Date.now();while(Date.now()-started<maxMs){await sleep(250);const r=await ensureContentScript().catch(()=>null),g=r?.snapshot?.gacha;if(g?.ready||g?.result)break}await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1}).catch(()=>{});ST.gacha.holding=false;ST.gacha.lastPullAt=Date.now();ST.actions++;log('gacha-hold-released',{elapsedMs:Date.now()-started});return true}
async function ensureContentScript(){
  if(!ST.tabId)throw Error('Aba do Lumena não definida.');
  try{
    const pong=await chrome.tabs.sendMessage(ST.tabId,{type:'probe'});
    if(pong?.ok){ST.checks.content='ok';return pong;}
  }catch(e){
    log('content-missing',{message:e.message,tabId:ST.tabId});
  }
  ST.checks.content='pending';
  try{
    await chrome.scripting.executeScript({target:{tabId:ST.tabId},files:['move-catalog.js','world-catalog.js','content.js']});
    log('content-injected',{tabId:ST.tabId,files:['move-catalog.js','world-catalog.js','content.js']});
  }catch(e){
    ST.checks.content='error';
    throw Error(`Não foi possível injetar o diagnóstico na aba do Lumena: ${e.message}`);
  }
  await sleep(250);
  try{
    const pong=await chrome.tabs.sendMessage(ST.tabId,{type:'probe'});
    if(!pong?.ok)throw Error('resposta inválida');
    ST.checks.content='ok';
    return pong;
  }catch(e){
    ST.checks.content='error';
    throw Error(`Content script não respondeu após reinjeção: ${e.message}. Recarregue a aba do Lumena uma vez.`);
  }
}

async function loadSelectedSpots(){
  try{
    const saved=await chrome.storage.local.get('lumenaSelectedSpots');
    ST.spotByZone=saved.lumenaSelectedSpots&&typeof saved.lumenaSelectedSpots==='object'?saved.lumenaSelectedSpots:{};
  }catch{ST.spotByZone={}}
}
async function saveSelectedSpots(){
  await chrome.storage.local.set({lumenaSelectedSpots:ST.spotByZone||{}});
}

// New: crystal spots load/save
async function loadCrystalSpots(){
  try{
    const saved=await chrome.storage.local.get('lumenaCrystalSpots');
    ST.crystalByZone=saved.lumenaCrystalSpots&&typeof saved.lumenaCrystalSpots==='object'?saved.lumenaCrystalSpots:{};
  }catch{ST.crystalByZone={}}
}
async function saveCrystalSpots(){
  await chrome.storage.local.set({lumenaCrystalSpots:ST.crystalByZone||{}});
}

function activateSpotForZone(zoneId){
  ST.selectedSpot=zoneId?(ST.spotByZone?.[zoneId]||null):null;
  ST.domPatrolDir=0;
  ST.domPatrolStep=0;
}
function activateCrystalForZone(zoneId){
  ST.selectedSpot=zoneId?(ST.crystalByZone?.[zoneId]||null):null;
  ST.domPatrolDir=0;
  ST.domPatrolStep=0;
}
async function selectCurrentTile(){
  if(!ST.zoneId)throw Error('Mapa ainda não identificado.');
  if(!ST.position||ST.positionSource!=='page-bridge')throw Error('A posição real ainda não foi detectada. Aguarde alguns segundos.');
  const map=ensureAutoMap(ST.zoneId,ST.probe?.location);
  if(!map)throw Error('Catálogo do mapa ainda não foi carregado.');
  const currentKey=tileKey(map,ST.position);
  const walk=new Set(map.walkable||[]);
  const grass=grassSet(map);
  let selectedKey=currentKey;

  // Select the actual grid tile under the player. If the bridge reports a
  // fractional point on an edge, prefer the nearest valid walkable/grass tile.
  if(!walk.has(selectedKey)||(grass.size&& !grass.has(selectedKey))){
    const [cx,cy]=parseKey(currentKey);
    const candidates=[];
    for(let radius=0;radius<=2;radius++){
      for(let dx=-radius;dx<=radius;dx++)for(let dy=-radius;dy<=radius;dy++){
        if(Math.abs(dx)+Math.abs(dy)!==radius)continue;
        const k=`${cx+dx}:${cy+dy}`;
        if(walk.has(k)&&(!grass.size||grass.has(k)))candidates.push(k);
      }
      if(candidates.length)break;
    }
    if(candidates.length)selectedKey=candidates[0];
  }

  if(!walk.has(selectedKey))throw Error('O tile atual não é caminhável.');
  if(grass.size&&!grass.has(selectedKey))throw Error('Posicione o personagem sobre um tile de grass antes de selecionar.');

  const snapped=gridToWorld(map,selectedKey)||{x:ST.position.x,z:ST.position.z};
  const spot={
    zoneId:ST.zoneId,
    location:ST.probe?.location||ST.zoneId,
    selectedAt:Date.now(),
    tile:selectedKey,
    position:{x:snapped.x,z:snapped.z},
    sampledPosition:{x:ST.position.x,z:ST.position.z},
    inputMode:ST.inputMode,
    source:'page-bridge-grid'
  };
  ST.spotByZone[ST.zoneId]=spot;
  ST.selectedSpot=spot;
  ST.anchorNeighbor=null;
  ST.anchorNeighborIndex=0;
  ST.spotReturnActive=false;
  ST.spotReturnIndex=0;
  ST.navGoal=null;
  ST.localGrassRegion=null;
  await saveSelectedSpots();
  log('manual-tile-selected',{
    zoneId:spot.zoneId,tile:spot.tile,position:spot.position,
    sampledPosition:spot.sampledPosition,source:spot.source,inputMode:spot.inputMode
  });
  return spot;
}

// New: select current tile as a crystal (no grass check, saves into crystalByZone)
async function selectCurrentCrystal(){
  if(!ST.zoneId)throw Error('Mapa ainda não identificado.');
  if(!ST.position||ST.positionSource!=='page-bridge')throw Error('A posição real ainda não foi detectada. Aguarde alguns segundos.');
  const map=ensureAutoMap(ST.zoneId,ST.probe?.location);
  if(!map)throw Error('Catálogo do mapa ainda não foi carregado.');
  const currentKey=tileKey(map,ST.position);
  const snapped=gridToWorld(map,currentKey)||{x:ST.position.x,z:ST.position.z};
  const spot={
    zoneId:ST.zoneId,
    location:ST.probe?.location||ST.zoneId,
    selectedAt:Date.now(),
    tile:currentKey,
    position:{x:snapped.x,z:snapped.z},
    sampledPosition:{x:ST.position.x,z:ST.position.z},
    inputMode:ST.inputMode,
    source:'manual-crystal'
  };
  ST.crystalByZone[ST.zoneId]=spot;
  // Keep ST.selectedSpot as farm spot; do not overwrite unless explicit.
  await saveCrystalSpots();
  log('manual-crystal-selected',{zoneId:spot.zoneId,tile:spot.tile,position:spot.position,source:spot.source});
  return spot;
}

function armSpotReturn(reason='map-return'){
  const spot=ST.spotByZone?.[ST.zoneId];if(!spot?.position)return false;
  ST.selectedSpot=spot;ST.spotReturnIndex=0;ST.spotReturnStartedAt=Date.now();ST.spotReturnReason=reason;
  ST.spotReturnActive=true;ST.anchorNeighbor=null;
  log('selected-tile-return-armed',{zoneId:ST.zoneId,reason,target:spot.position,position:ST.position,active:true});
  return true;
}
async function selectedSpotReturnStep(){
  const spot=ST.selectedSpot;
  if(!spot?.position||spot.zoneId!==ST.zoneId||!ST.spotReturnActive)return false;
  if(ST.domBattleActive||ST.phase==='battle'){await release();return true}
  if(!ST.position){await release();log('selected-tile-return-waiting-position',{zoneId:ST.zoneId,target:spot.position});await sleep(180);return true}
  const dx=spot.position.x-ST.position.x,dz=spot.position.z-ST.position.z;
  if(Math.hypot(dx,dz)<.36){ST.spotReturnActive=false;ST.spotReturnIndex=0;ST.anchorNeighbor=null;log('selected-tile-return-complete',{zoneId:ST.zoneId,mode:'absolute-position',position:ST.position,target:spot.position});
    // If this return was armed specifically to use a respawn crystal, attempt to interact.
    if(ST.spotReturnReason==='crystal-respawn'){
      ST.spotReturnReason=null;
      try{
        await sleep(220);
        // Press Space to interact with the crystal (same approach used for trainer interactions).
        await key('Space',' ',true);await sleep(80);await key('Space',' ',false);
        await sleep(220);
        // Press Space again to ensure the interaction (some UIs need a second)
        await key('Space',' ',true);await sleep(80);await key('Space',' ',false);
        await sleep(650);
        log('crystal-interact-attempted',{zoneId:ST.zoneId,target:spot.position});
      }catch(e){log('crystal-interact-failed',{message:e.message})}
      // Clear the selected spot after usage so farm routing can continue.
      ST.selectedSpot=null;
      ST.spotReturnActive=false;
      ST.spotReturnIndex=0;
      ST.anchorNeighbor=null;
      // Allow existing respawnReturnActive flow to continue to route back to farm.
    }
    return true}
  const name=Math.abs(dx)>=Math.abs(dz)?(dx>0?'right':'left'):(dz>0?'down':'up'),[code,keyName]=DIR[name];
  await release();await key(code,keyName,true);await sleep(Math.hypot(dx,dz)>2?105:62);await key(code,keyName,false);await sleep(105);
  log('selected-tile-return-step',{zoneId:ST.zoneId,mode:'absolute-position',name,position:ST.position,target:spot.position});return true;
}
function armSpotReturn(reason='map-return'){
  const spot=ST.spotByZone?.[ST.zoneId];if(!spot?.position)return false;
  ST.selectedSpot=spot;ST.spotReturnIndex=0;ST.spotReturnStartedAt=Date.now();ST.spotReturnReason=reason;
  ST.spotReturnActive=true;ST.anchorNeighbor=null;
  log('selected-tile-return-armed',{zoneId:ST.zoneId,reason,target:spot.position,position:ST.position,active:true});
  return true;
}
async function probe(){const r=await ensureContentScript();ST.checks.content=r?.ok?'ok':'error';ST.probe=r?.snapshot||null;recordSnapshotMilestones(ST.probe);const bridge=ST.probe?.bridge||null;const z=(bridge?.zoneId&&LUMENA_NAV_CATALOG?.[bridge.zoneId]?bridge.zoneId:resolveZoneId(ST.probe?.location));if(z)ensureAutoMap(z,ST.probe?.location);if(z&&z!==ST.zoneId){const from=ST.zoneId,now=Date.now(),wasPortal=ST.interactionMode==='portal',recentBattle=ST.domBattleActive||ST.phase==='battle'||now-ST.lastBattleSeenAt<15000;log('zone-change',{from,to:z,location:ST.probe.location});const fromIsWild=!!(COMPLETE_MAP_CATALOG_INFO.wild||[]).includes(from);
const toIsWild=!!(COMPLETE_MAP_CATALOG_INFO.wild||[]).includes(z);
const pendingWipe=ST.lastBattleOutcome==='team-wipe-pending'||(ST.wipePendingAt&&now-ST.wipePendingAt<20000);
const origin=ST.battleOriginZone||from||ST.lastFarmZone;
const isWipe=!!(
  from&&from!==z&&!wasPortal&&recentBattle&&
  (pendingWipe||(fromIsWild&&!toIsWild))
);
if(isWipe){
  ST.teamWipes++;
  ST.respawns++;
  ST.lastBattleOutcome='team-wipe';
  ST.lastBattleEndedAt=now;
  ST.domBattleActive=false;
  ST.phase='world';
  ST.lastActionSig='';
  ST.wipePendingAt=0;
  const target=(origin&&origin!==z)?origin:((ST.lastFarmZone&&ST.lastFarmZone!==z)?ST.lastFarmZone:null);
  if(ST.config.returnAfterWipe&&target){
    ST.respawnReturnActive=true;
    ST.respawnReturnTarget=target;
    ST.wipeReturnSpotZone=target;
    ST.farmArrived=false;
    ST.selectedSpot=null;
    ST.spotReturnActive=false;
    ST.anchorNeighbor=null;
    ST.entryPortalId=null;
    ST.entryPortalUntil=0;
    ST.farmRoute=null;
    ST.farmRouteStep=null;
    log('respawn-return-armed',{from,to:z,target,origin,fromIsWild,toIsWild,pendingWipe,route:zoneRoute(z,target),mode:'catalog-pathfinder'});
  }
  log('team-wipe',{from,to:z,position:ST.position,reason:'battle-to-safe-zone-without-portal',origin,target});
  log('respawn-detected',{zoneId:z,from,returnTarget:ST.respawnReturnTarget,randomRespawn:true});
}else if(ST.running){
  const reachingReturn=ST.respawnReturnActive&&ST.respawnReturnTarget===z;
  if(!ST.respawnReturnActive||reachingReturn)ST.lastFarmZone=z;
  if(reachingReturn){
    ST.respawnReturnActive=false;
    ST.respawnReturnTarget=null;
    log('wipe-return-map-arrived',{zoneId:z});
  }else if(!ST.respawnReturnActive){
    log('local-farm-zone-updated',{zoneId:z,reason:'manual-zone-change'});
  }
}ST.lastZoneId=from;ST.zoneId=z;activateSpotForZone(z);if(z!=='tidemarsh')ST.interiorId=null;ST.navGoal=null;ST.position=null;ST.interactionMode=null;ST.bootstrapAttempts=0;ST.tidemarshRecoveryDir=0;ST.dynamicAnchor=null;ST.dynamicPreferredDir=null;ST.dynamicTurnIndex=0;ST.recentWorldTiles=[];ST.transitionUntil=0;ST.transitionAttempts=0;ST.samePosFailures=0;ST.lastFailedPos=null;ST.blockedEdges={};const map=LUMENA_NAV_CATALOG[z];const entry=(map?.exits||[]).find(e=>e.to===from);ST.entryPortalId=entry?.id||null;ST.entryPortalUntil=Date.now()+8000;if(ST.entryPortalId)log('entry-portal-suppressed',{zoneId:z,portal:ST.entryPortalId,from,until:ST.entryPortalUntil});
if(ST.selectedSpot&&from&&from!==z&&!ST.respawnReturnActive)setTimeout(()=>armSpotReturn('zone-entry'),500);
if(ST.respawnReturnActive&&ST.respawnReturnTarget===z){
  setTimeout(()=>{
    // If there's a crystal saved in this zone, prefer returning to it first.
    if(ST.crystalByZone?.[z]){
      ST.selectedSpot = ST.crystalByZone[z];
      ST.selectedSpot.inputMode = ST.inputMode;
      ST.spotReturnIndex=0;ST.spotReturnStartedAt=Date.now();ST.spotReturnReason='crystal-respawn';
      ST.spotReturnActive=true;ST.anchorNeighbor=null;
      log('respawn-crystal-return-armed',{zoneId:z,reason:'wipe-return-arrival-crystal',target:ST.selectedSpot.position});
    }else{
      activateSpotForZone(z);
      armSpotReturn('wipe-return-arrival');
    }
  },650);
}
}
if(bridge?.position&&Number.isFinite(+bridge.position.x)&&Number.isFinite(+bridge.position.z)){
  const next={x:+bridge.position.x,z:+bridge.position.z,facing:null},prev=ST.position;
  const changed=!prev||Math.hypot(next.x-prev.x,next.z-prev.z)>.002;
  ST.position=next;ST.positionSource='page-bridge';ST.lastBridgeAt=Date.now();ST.checks.websocket='bridge';
  if(changed&&prev){ST.officialMoves++;ST.lastMoveAt=Date.now();ensureAutoMap(ST.zoneId,ST.probe?.location);learnCurrentTile('page-bridge');log('official-position-bridge',{...ST.position,zoneId:ST.zoneId,confidence:bridge.confidence,candidate:bridge.candidate||null})}
  // NEW: If we are returning after a wipe and the page-bridge has detected a candidate object labeled like a crystal,
  // arm a selected-spot return to that crystal so we can interact with it before continuing the farm return.
  try{
    if(ST.respawnReturnActive && ST.zoneId && !ST.spotReturnActive && bridge?.candidate && /crystal|healer|healing|heal/i.test(String(bridge.candidate.label||''))){
      const cand=bridge.candidate;
      const map=ensureAutoMap(ST.zoneId,ST.probe?.location);
      const pos=cand.p||bridge.position;
      if(pos && map){
        const tile=tileKey(map,pos);
        const snapped=gridToWorld(map,tile)||{x:pos.x,z:pos.z};
        const spot={
          zoneId:ST.zoneId,
          location:ST.probe?.location||ST.zoneId,
          selectedAt:Date.now(),
          tile:tile||null,
          position:{x:snapped.x,z:snapped.z},
          sampledPosition:{x:pos.x,z:pos.z},
          inputMode:ST.inputMode,
          source:'crystal-detected'
        };
        ST.spotByZone[ST.zoneId]=spot;
        ST.selectedSpot=spot;
        ST.spotReturnIndex=0;ST.spotReturnStartedAt=Date.now();ST.spotReturnReason='crystal-respawn';
        ST.spotReturnActive=true;ST.anchorNeighbor=null;
        log('crystal-detected-and-armed',{zoneId:ST.zoneId,label:cand.label,tile:spot.tile,position:spot.position});
      }
    }
  }catch(e){log('crystal-detect-error',{message:e.message})}
}
return r}

function frameText(payload,opcode){try{if(opcode===1)return safeText(payload,MAX_FRAME_TEXT);const raw=Uint8Array.from(atob(payload||''),c=>c.charCodeAt(0));const txt=new TextDecoder().decode(raw);return safeText(txt,MAX_FRAME_TEXT)}catch{return '[binary-unreadable]'}}
function frameEventNames(text){const names=String(text||'').match(/[a-z][a-z0-9_-]*(?::[a-zA-Z0-9_.-]+)+/g)||[];return [...new Set(names)].slice(0,80)}
function milestone(kind,data){ST.milestones[kind]=(ST.milestones[kind]||0)+1;log(`milestone-${kind}`,data);if(ST.config.screenshotMilestones)captureScreenshot(`${kind}-${ST.milestones[kind]}`).catch(()=>{})}
function recordSnapshotMilestones(snap){if(!snap)return;const text=safeText(snap.bodyText||'',5000);const ui=snap.ui||{};const sig=JSON.stringify({url:snap.url,location:snap.location,dialogs:ui.dialogs?.map(x=>x.text?.slice(0,120)),headings:ui.headings?.slice(0,12),battle:!!snap.battle?.active,evolution:!!snap.evolution?.active,moveChoice:!!snap.battle?.moveChoice?.active});if(sig!==ST.lastSnapshotSig){ST.lastSnapshotSig=sig;log('dom-snapshot-change',{url:snap.url,title:snap.title,location:snap.location,ui,battle:snap.battle,evolution:snap.evolution,bodyText:text})}
 const tests=[['account',/create account|sign up|register|username|email/i],['tutorial',/tutorial|firstlight|choose your starter|starter|codex/i],['trainer',/trainer|challeng|rival|champion/i],['evolution',/evolv|evolution/i],['capture',/capture|lantern|caught|codex/i],['quest',/active quest|quest complete|objective/i]];
 for(const[k,re]of tests){if(k==='tutorial'&&!ST.config.tutorial)continue;if(re.test(text)){const normalized=text.replace(/\s+/g,' ').slice(0,900);const ms=`${k}|${snap.location||''}|${normalized}`;if(ST.milestoneSigs[k]!==ms){ST.milestoneSigs[k]=ms;milestone(k,{url:snap.url,location:snap.location,text:text.slice(0,1200)})}}}
}
async function captureScreenshot(label='manual'){if(!ST.attached||!ST.tabId)return false;const r=await cmd('Page.captureScreenshot',{format:'jpeg',quality:70,fromSurface:true});if(!r?.data)return false;const name=`Lumena-Diagnostic/session-${ST.sessionId}/screenshots/${String(++ST.chunkIndex).padStart(4,'0')}-${label}-${new Date().toISOString().replace(/[:.]/g,'-')}.jpg`;await autoDownload({url:`data:image/jpeg;base64,${r.data}`,filename:name});log('screenshot-saved',{label,filename:name});return true}
function reportBase(reason,events){return{generatedAt:new Date().toISOString(),version:VERSION,edition:DIAGNOSTIC_EDITION,sessionId:ST.sessionId,reason,chunkIndex:ST.chunkIndex,sessionStartedAt:new Date(ST.startedAt).toISOString(),elapsedMs:Date.now()-ST.startedAt,state:status(),config:ST.config,probe:ST.probe,network:ST.network,milestones:ST.milestones,events}}
function readMsgpack(buf){let i=0;const u8=new Uint8Array(buf),dv=new DataView(buf);const read=()=>{const b=u8[i++];if(b<=0x7f)return b;if(b>=0xe0)return b-256;if((b&0xe0)===0xa0){const n=b&31,s=new TextDecoder().decode(u8.slice(i,i+n));i+=n;return s}if((b&0xf0)===0x90){const n=b&15,a=[];for(let j=0;j<n;j++)a.push(read());return a}if((b&0xf0)===0x80){const n=b&15,o={};for(let j=0;j<n;j++)o[read()]=read();return o}switch(b){case 0xc0:return null;case 0xc2:return false;case 0xc3:return true;case 0xca:{const v=dv.getFloat32(i);i+=4;return v}case 0xcb:{const v=dv.getFloat64(i);i+=8;return v}case 0xcc:return u8[i++];case 0xcd:{const v=dv.getUint16(i);i+=2;return v}case 0xce:{const v=dv.getUint32(i);i+=4;return v}case 0xd0:return dv.getInt8(i++);case 0xd1:{const v=dv.getInt16(i);i+=2;return v}case 0xd2:{const v=dv.getInt32(i);i+=4;return v}case 0xd9:{const n=u8[i++],s=new TextDecoder().decode(u8.slice(i,i+n));i+=n;return s}case 0xda:{const n=dv.getUint16(i);i+=2;const s=new TextDecoder().decode(u8.slice(i,i+n));i+=n;return s}case 0xdc:{const n=dv.getUint16(i);i+=2;const a=[];for(let j=0;j<n;j++)a.push(read());return a}case 0xde:{const n=dv.getUint16(i);i+=2;const o={};for(let j=0;j<n;j++)o[read()]=read();return o}case 0xd4:i+=2;return null;case 0xd5:i+=3;return null;case 0xd6:i+=5;return null;case 0xd7:i+=9;return null;case 0xd8:i+=17;return null;default:return null}};const out=[];while(i<u8.length)out.push(read());return out}

function ensureAutoMap(zoneId,location=null){
 if(!zoneId)return null;
 if(self.LUMENA_NAV_CATALOG?.[zoneId])return self.LUMENA_NAV_CATALOG[zoneId];
 self.LUMENA_NAV_CATALOG=self.LUMENA_NAV_CATALOG||{};
 const meta=(self.LUMENA_ZONE_CATALOG||[]).find(z=>z.id===zoneId)||{};
 const map={id:zoneId,name:location||meta.name||zoneId,width:201,height:201,tileSize:1,walkable:[],blocking:[],highGrass:[],exits:[],spawns:{},autoLearned:true};
 self.LUMENA_NAV_CATALOG[zoneId]=map;
 log('map-auto-catalog-created',{zoneId,name:map.name,type:meta.type||null});
 scheduleLearnedMapsSave();return map;
}
function mapTileFromPosition(map,p){return map&&p?tileKey(map,p):null}
function learnCurrentTile(reason='move'){
 const map=ensureAutoMap(ST.zoneId,ST.probe?.location);if(!map||!ST.position)return;
 const k=mapTileFromPosition(map,ST.position);if(!k)return;
 if(!map.walkable.includes(k))map.walkable.push(k);
 ST.recentWorldTiles=[k,...(ST.recentWorldTiles||[]).filter(x=>x!==k)].slice(0,8);
 if(reason==='encounter'||reason==='wild-battle')for(const t of ST.recentWorldTiles.slice(0,5))if(!map.highGrass.includes(t))map.highGrass.push(t);
 if(reason!=='move'||map.autoLearned)scheduleLearnedMapsSave();
}
function scheduleLearnedMapsSave(){clearTimeout(learnedSaveTimer);learnedSaveTimer=setTimeout(async()=>{try{const out={};for(const [id,m] of Object.entries(self.LUMENA_NAV_CATALOG||{})){if(!m.autoLearned)continue;out[id]={id:m.id,name:m.name,width:m.width,height:m.height,tileSize:m.tileSize||1,walkable:(m.walkable||[]).slice(-2500),blocking:(m.blocking||[]).slice(-1000),highGrass:(m.highGrass||[]).slice(-1000),exits:m.exits||[],spawns:m.spawns||{},autoLearned:true}}await chrome.storage.local.set({[LEARNED_MAPS_KEY]:out})}catch(e){log('map-auto-catalog-save-error',{message:e.message})}},700)}
async function loadLearnedMaps(){if(ST.learnedMapsLoaded)return;ST.learnedMapsLoaded=true;try{const saved=(await chrome.storage.local.get(LEARNED_MAPS_KEY))[LEARNED_MAPS_KEY]||{};self.LUMENA_NAV_CATALOG=self.LUMENA_NAV_CATALOG||{};for(const [id,m] of Object.entries(saved)){const base=self.LUMENA_NAV_CATALOG[id];if(!base){self.LUMENA_NAV_CATALOG[id]=m;continue}base.walkable=[...new Set([...(base.walkable||[]),...(m.walkable||[])])];base.blocking=[...new Set([...(base.blocking||[]),...(m.blocking||[])])];base.highGrass=[...new Set([...(base.highGrass||[]),...(m.highGrass||[])])];base.autoLearned=!!base.autoLearned||!!m.autoLearned;}log('map-auto-catalog-loaded',{maps:Object.keys(saved),bundledMerge:BUNDLED_MAP_MERGE})}catch(e){log('map-auto-catalog-load-error',{message:e.message})}}
function dynamicExploreDir(map){
 if(!map?.autoLearned||!ST.position)return null;
 if(!ST.dynamicAnchor)ST.dynamicAnchor={x:ST.position.x,z:ST.position.z};
 const dx=ST.position.x-ST.dynamicAnchor.x,dz=ST.position.z-ST.dynamicAnchor.z,limit=10;
 const dirs=['up','right','down','left'];
 let preferred=ST.dynamicPreferredDir||dirs[ST.dynamicTurnIndex%4];
 if(Math.abs(dx)>=limit||Math.abs(dz)>=limit){preferred=Math.abs(dx)>Math.abs(dz)?(dx>0?'left':'right'):(dz>0?'up':'down')}
 const cur=tileKey(map,ST.position),[cx,cy]=parseKey(cur);
 const candidates=[preferred,...dirs.filter(d=>d!==preferred)];
 for(const d of candidates){const n=d==='right'?`${cx+1}:${cy}`:d==='left'?`${cx-1}:${cy}`:d==='down'?`${cx}:${cy+1}`:`${cx}:${cy-1}`;const hasGrid=(map.walkable||[]).length>0;const safe=(!hasGrid||(map.walkable||[]).includes(n))&&!(map.blocking||[]).includes(n);if(safe&&!ST.blockedEdges[edgeKey(cur,n)]){ST.dynamicPreferredDir=d;return d}}
 ST.dynamicTurnIndex++;ST.dynamicPreferredDir=dirs[ST.dynamicTurnIndex%4];return ST.dynamicPreferredDir;
}
function parseMove(payload){try{const raw=Uint8Array.from(atob(payload||''),c=>c.charCodeAt(0)),v=readMsgpack(raw.buffer);const k=v.indexOf('move');if(k<0)return null;const arr=v.find(x=>Array.isArray(x)&&x.includes('x')&&x.includes('z'));if(!arr)return null;const ai=v.indexOf(arr),vals=v.slice(ai+1,ai+1+arr.length),o={};arr.forEach((x,j)=>o[x]=vals[j]);return Number.isFinite(o.x)&&Number.isFinite(o.z)?o:null}catch{return null}}
function worldToGrid(map,p){
  if(!map||!p||!Number.isFinite(+p.x)||!Number.isFinite(+p.z))return null;
  const ts=Math.max(0.0001,+map.tileSize||1),fx=+p.x/ts+map.width/2,fz=+p.z/ts+map.height/2;
  const candidates=[[Math.floor(fx),Math.floor(fz)],[Math.round(fx-.5),Math.round(fz-.5)],[Math.round(fx),Math.round(fz)]];
  const known=new Set([...(map.walkable||[]),...(map.highGrass||[]),...(map.blocking||[])]);
  for(const [x,y] of candidates){const k=`${x}:${y}`;if(known.has(k))return k}
  return `${Math.floor(fx)}:${Math.floor(fz)}`;
}
const tileKey=(m,p)=>worldToGrid(m,p);
function gridToWorld(map,key){
  if(!map||!key)return null;
  const [x,y]=parseKey(key),ts=Math.max(.0001,+map.tileSize||1);
  if(!Number.isFinite(x)||!Number.isFinite(y))return null;
  return {x:(x+.5-map.width/2)*ts,z:(y+.5-map.height/2)*ts};
}

const parseKey=k=>k.split(':').map(Number),neighbors=k=>{const[x,y]=parseKey(k);return[[x+1,y],[x-1,y],[x,y+1],[x,y-1]].map(v=>v.join(':'))};
const edgeKey=(a,b)=>`${a}>${b}`;
function cleanBlocked(){const now=Date.now();for(const[k,t]of Object.entries(ST.blockedEdges))if(t<=now)delete ST.blockedEdges[k]}
function normalizeGoal(map,k){const [a,b]=String(k).split(':').map(Number);if(!Number.isFinite(a)||!Number.isFinite(b))return null;if(String(k).includes('.')||a<0||b<0)return `${Math.floor(a+map.width/2)}:${Math.floor(b+map.height/2)}`;return `${a}:${b}`}
function normalizeGoals(map,list){return [...new Set((list||[]).map(k=>normalizeGoal(map,k)).filter(Boolean))]}
function grassSet(map){return new Set(normalizeGoals(map,map.highGrass||[]))}
function grassComponents(map){
  const grass=grassSet(map),seen=new Set(),out=[];
  for(const seed of grass){if(seen.has(seed))continue;const q=[seed],tiles=[];seen.add(seed);for(let i=0;i<q.length;i++){const cur=q[i];tiles.push(cur);for(const n of neighbors(cur))if(grass.has(n)&&!seen.has(n)){seen.add(n);q.push(n)}}
    const set=new Set(tiles),interior=tiles.filter(k=>neighbors(k).every(n=>set.has(n)));
    out.push({tiles,set,interior:interior.length?interior:tiles});
  }
  return out;
}
function weightedPath(map,start,goals,{preferGrass=false,strictGrass=false,grassRegion=null}={}){
  cleanBlocked();const blocked=new Set(map.blocking||[]),walk=new Set((map.walkable||[]).filter(k=>!blocked.has(k))),goal=new Set(goals),grass=grassSet(map),region=grassRegion?.set||null;
  if(goal.has(start))return[start];if(!walk.has(start))walk.add(start);
  const dist=new Map([[start,0]]),prev=new Map([[start,null]]),open=[[0,start]];
  while(open.length){open.sort((a,b)=>a[0]-b[0]);const [cost,cur]=open.shift();if(cost!==dist.get(cur))continue;if(goal.has(cur)){const path=[];let x=cur;while(x){path.push(x);x=prev.get(x)}return path.reverse()}
    for(const n of neighbors(cur)){if(!walk.has(n)||ST.blockedEdges[edgeKey(cur,n)])continue;if(strictGrass&&region&&!region.has(n))continue;
      let step=1;if(preferGrass){if(region)step=region.has(n)?1:(grass.has(n)?4:9);else step=grass.has(n)?1:7}
      const nd=cost+step;if(nd<(dist.get(n)??Infinity)){dist.set(n,nd);prev.set(n,cur);open.push([nd,n])}
    }
  }return null;
}
function bfs(map,start,goals){return weightedPath(map,start,goals)}
function exitTiles(map,exit){if(!map||!exit)return[];const explicit=normalizeGoals(map,exit.tiles||[]);if(explicit.length)return explicit;const span=Array.isArray(exit.span)?exit.span:[];if(exit.edge&&span.length>=2){const a=Math.min(+span[0],+span[1]),b=Math.max(+span[0],+span[1]),out=[];for(let n=a;n<=b;n++){if(exit.edge==='left')out.push(`0:${n}`);else if(exit.edge==='right')out.push(`${map.width-1}:${n}`);else if(exit.edge==='top')out.push(`${n}:0`);else if(exit.edge==='bottom')out.push(`${n}:${map.height-1}`)}return normalizeGoals(map,out)}return[]}
function portalFor(map,cur){return (map.exits||[]).find(e=>exitTiles(map,e).includes(cur))||null}
function shouldUsePortal(map,cur,portal){if(!portal)return false;
const target=farmTarget();
const route=target&&ST.zoneId!==target?zoneRoute(ST.zoneId,target):null;
const requiredNext=route?.[1]||null;
const requiredPortal=!!(requiredNext&&portal.to===requiredNext);
if(!requiredPortal&&ST.entryPortalId===portal.id&&Date.now()<ST.entryPortalUntil){log('portal-ignored-after-entry',{zoneId:ST.zoneId,portal:portal.id,tile:cur,until:ST.entryPortalUntil});return false}
const goals=chooseGoal(map,cur),tiles=exitTiles(map,portal);return goals.includes(cur)||(ST.navGoal&&tiles.includes(ST.navGoal));}
function zoneRoute(from,to){if(!from||!to||from===to)return[from].filter(Boolean);const q=[from],prev=new Map([[from,null]]);for(let i=0;i<q.length;i++){const z=q[i],m=LUMENA_NAV_CATALOG[z];for(const e of m?.exits||[]){const n=e.to;if(!n||prev.has(n)||!LUMENA_NAV_CATALOG[n])continue;prev.set(n,z);if(n===to){const path=[n];let x=z;while(x){path.push(x);x=prev.get(x)}return path.reverse()}q.push(n)}}return null}
function trainerList(){return Array.isArray(self.LUMENA_TRAINER_CATALOG)?self.LUMENA_TRAINER_CATALOG:[]}
function tierCatalog(){return self.LUMENA_TIER_CATALOG||{}}
function lumenTier(name){const n=String(name||'').trim().toLowerCase();if(!n)return null;for(const tier of ['S','A','B'])if((tierCatalog()[tier]||[]).some(x=>String(x).toLowerCase()===n))return tier;return null}
function shouldPauseTier(tier){return tier==='S'&&ST.config.pauseTierS||tier==='A'&&ST.config.pauseTierA||tier==='B'&&ST.config.pauseTierB}

function trainerGoals(map,t){if(!map||!t?.tile)return[];const c=t.tile.column,r=t.tile.row,n=Math.max(1,+t.sightRange||1),out=[];for(let i=1;i<=n;i++){if(t.facing==='left')out.push(`${c-i}:${r}`);else if(t.facing==='right')out.push(`${c+i}:${r}`);else if(t.facing==='up')out.push(`${c}:${r-i}`);else out.push(`${c}:${r+i}`)}if(!t.sightRange){out.push(`${c-1}:${r}`,`${c+1}:${r}`,`${c}:${r-1}`,`${c}:${r+1}`)}return normalizeGoals(map,out).filter(k=>(map.walkable||[]).includes(k))}
function availableTrainerCandidates(){return trainerList().filter(t=>t.zoneId===ST.zoneId&&LUMENA_NAV_CATALOG[t.zoneId]&&!ST.trainerCompleted[t.id]&&!ST.trainerSkipped[t.id])}
function selectTrainer(){if(!ST.config.dailyTrainers)return null;if(ST.currentTrainer&&!ST.trainerCompleted[ST.currentTrainer.id]&&!ST.trainerSkipped[ST.currentTrainer.id])return ST.currentTrainer;const all=availableTrainerCandidates();if(!all.length){ST.trainerMode='complete';return null}let t=all.find(x=>x.zoneId===ST.zoneId);if(!t)return null;ST.currentTrainer=t;ST.trainerMode='routing';ST.trainerTargetSince=Date.now();ST.trainerDialogSince=0;log('trainer-selected',{id:t.id,name:t.name,title:t.title,zoneId:t.zoneId,tile:t.tile,sightRange:t.sightRange});return t}
function skipCurrentTrainer(reason,data={}){const t=ST.currentTrainer;if(!t)return;ST.trainerSkipped[t.id]={at:Date.now(),reason};log('trainer-skipped',{id:t.id,name:t.name,reason,...data});ST.currentTrainer=null;ST.trainerMode='routing';ST.trainerTargetSince=0;ST.trainerDialogSince=0;ST.navGoal=null}
function completeCurrentTrainer(reason='victory'){const t=ST.currentTrainer;if(!t)return;ST.trainerCompleted[t.id]={at:Date.now(),reason};log('trainer-daily-completed',{id:t.id,name:t.name,reason});ST.currentTrainer=null;ST.trainerMode='routing';ST.trainerTargetSince=0;ST.trainerDialogSince=0;ST.navGoal=null}
function farmTarget(){return ST.respawnReturnActive&&ST.config.returnAfterWipe?ST.respawnReturnTarget:null}
function nearestRegion(map,cur,components){
  let best=null,bestPath=null;for(const c of components){const p=weightedPath(map,cur,c.interior,{preferGrass:true,grassRegion:c});if(p&&(!bestPath||p.length<bestPath.length)){best=c;bestPath=p}}return {region:best,path:bestPath};
}
function chooseGrassGoal(map,cur){
  const comps=grassComponents(map);if(!comps.length)return[];
  let region=comps.find(c=>c.set.has(cur));
  if(!region){const nearest=nearestRegion(map,cur,comps);ST.localGrassRegion=nearest.region||null;ST.localGrassReturning=!!nearest.region;return nearest.region?nearest.region.interior:[]}
  ST.localGrassRegion=region;ST.localGrassReturning=false;
  const [cx,cy]=parseKey(cur),candidates=region.interior.filter(k=>{const[x,y]=parseKey(k),d=Math.abs(x-cx)+Math.abs(y-cy);return d>=3&&d<=8});
  const pool=candidates.length?candidates:region.interior.filter(k=>k!==cur);if(!pool.length)return[cur];
  const idx=(ST.officialMoves*7+ST.actions*3+Date.now())%pool.length;return[pool[idx]];
}
function selectedAnchorGoals(map,cur){
  // Select Tile is a local anchor only. Cross-map/wipe routing always has priority.
  if(ST.respawnReturnActive||farmTarget())return null;
  const spot=ST.selectedSpot;
  if(!spot?.position||spot.zoneId!==ST.zoneId)return null;

  const walk=new Set(map.walkable||[]);
  const block=new Set(map.blocking||[]);
  const grass=grassSet(map);
  const anchor=spot.tile||tileKey(map,spot.position);

  // Old or incorrectly sampled anchors must not stop the bot.
  if(!anchor||!walk.has(anchor)||block.has(anchor)||(grass.size&&!grass.has(anchor))){
    log('selected-tile-invalid-ignored',{zoneId:ST.zoneId,anchor,position:spot.position,reason:'not-valid-grass-tile'});
    ST.selectedSpot=null;
    ST.anchorNeighbor=null;
    return null;
  }

  if(cur!==anchor){
    ST.anchorNeighbor=null;
    const test=weightedPath(map,cur,[anchor],{preferGrass:true,strictGrass:false,grassRegion:null});
    if(!test||test.length<2){
      log('selected-tile-unreachable-ignored',{zoneId:ST.zoneId,from:cur,anchor,position:ST.position});
      // Keep the saved tile in storage for future map entries, but ignore it in
      // this runtime so normal grass farming continues immediately.
      ST.selectedSpot=null;
      ST.navGoal=null;
      return null;
    }
    return[anchor];
  }

  if(!ST.anchorNeighbor){
    const[x,y]=parseKey(anchor);
    const candidates=[`${x+1}:${y}`,`${x}:${y+1}`,`${x-1}:${y}`,`${x}:${y-1}`]
      .filter(k=>walk.has(k)&&!block.has(k)&&(grass.size===0||grass.has(k)));
    if(!candidates.length){
      log('selected-tile-no-neighbor',{zoneId:ST.zoneId,anchor});
      return[anchor];
    }
    ST.anchorNeighbor=candidates[ST.anchorNeighborIndex%candidates.length];
  }
  return[ST.anchorNeighbor];
}
function chooseGoal(map,cur){
const target=farmTarget();
if(!target){
  const ag=selectedAnchorGoals(map,cur);
  if(ag){
    const anchor=tileKey(map,ST.selectedSpot.position);
    if(cur===anchor&&ST.anchorNeighbor)return ag;
    if(cur!==anchor){
      if(ST.anchorNeighbor){ST.anchorNeighbor=null;ST.anchorNeighborIndex++}
      return[anchor]
    }
  }
}if(ST.zoneId==='firstlight'&&target==='softglade-path'){const [cx,cy]=parseKey(cur);if(cx<43||cy!==30)return['43:30'];if(cy>15)return['43:15'];return normalizeGoals(map,(map.exits||[]).find(e=>e.to==='softglade-path')?.tiles||['30:15']);}if(target&&ST.zoneId!==target){const route=zoneRoute(ST.zoneId,target);const next=route?.[1];if(next){const exit=(map.exits||[]).find(e=>e.to===next);if(exit){ST.farmRoute=route;ST.farmRouteStep=`${ST.zoneId}->${next}`;const goals=exitTiles(map,exit).filter(k=>(map.walkable||[]).includes(k)&&!(map.blocking||[]).includes(k));if(goals.length){if(ST.lastPortalGoalSig!==`${ST.zoneId}>${next}|${goals.join(',')}`){ST.lastPortalGoalSig=`${ST.zoneId}>${next}|${goals.join(',')}`;log('portal-goal-created',{from:ST.zoneId,to:next,exitId:exit.id,goals,position:ST.position})}return goals}log('portal-goal-missing',{from:ST.zoneId,to:next,exitId:exit.id,edge:exit.edge||null,span:exit.span||null,tiles:exit.tiles||[]})}}if(ST.lastFarmRouteFailure!==`${ST.zoneId}>${target}`){ST.lastFarmRouteFailure=`${ST.zoneId}>${target}`;log('farm-route-not-found',{from:ST.zoneId,to:target})}}
if(target&&ST.zoneId===target){
  if(!ST.farmArrived)log('wipe-return-arrival',{zoneId:ST.zoneId,target,position:ST.position});
  ST.farmArrived=true;
  ST.pendingFarmMap=null;
  ST.respawnReturnActive=false;
  ST.respawnReturnTarget=null;
  ST.farmRoute=null;
  ST.farmRouteStep=null;
  activateSpotForZone(ST.zoneId);
  if(ST.selectedSpot?.position)armSpotReturn('wipe-return-arrival');
  ST.battleOriginZone=null;
  ST.battleOriginPosition=null;
  ST.wipeReturnSpotZone=null;
}
if(ST.config.dailyTrainers){const t=selectTrainer();if(t&&t.zoneId===ST.zoneId){const tg=trainerGoals(map,t);if(tg.length){ST.trainerMode=ST.trainerMode==='battle'?'battle':'routing';return tg}else skipCurrentTrainer('no-local-goal',{zoneId:ST.zoneId})}}
return chooseGrassGoal(map,cur)}
function nextDir(){const map=ensureAutoMap(ST.zoneId,ST.probe?.location);if(!map||!ST.position)return null;const cur=tileKey(map,ST.position),goals=chooseGoal(map,cur);ST.navGoal=goals[0]||null;if(map.autoLearned&&!goals.length)return dynamicExploreDir(map);const returning=!!farmTarget();const anchorActive=!!(ST.selectedSpot?.position&&ST.selectedSpot.zoneId===ST.zoneId);const inGrass=grassSet(map).has(cur),region=ST.localGrassRegion;const path=weightedPath(map,cur,goals,returning?{preferGrass:false,strictGrass:false,grassRegion:null}:anchorActive?{preferGrass:true,strictGrass:false,grassRegion:null}:{preferGrass:true,strictGrass:inGrass&&!!region,grassRegion:region});if(!path||path.length<2){if(map.autoLearned)return dynamicExploreDir(map);return null;}const dirOf=(a,b)=>{const[ax,ay]=parseKey(a),[bx,by]=parseKey(b);return bx>ax?'right':bx<ax?'left':by>ay?'down':'up'};const dir=dirOf(path[0],path[1]);let straight=1;for(let i=1;i<Math.min(path.length-1,4);i++){if(dirOf(path[i],path[i+1])!==dir)break;straight++}ST.nextStraightSteps=straight;return dir}
async function portalStep(map,cur,portal){const now=Date.now();if(ST.interactionMode!=='portal'){ST.interactionMode='portal';ST.transitionUntil=now+2600;ST.transitionAttempts=0;await release();log('portal-wait-start',{zoneId:ST.zoneId,tile:cur,portal:portal.id,to:portal.to,position:ST.position});return}
if(now<ST.transitionUntil){await sleep(220);return}
if(ST.transitionAttempts<2){ST.transitionAttempts++;const face=portal.facing||'down',[code,k]=DIR[face]||DIR.down;await key(code,k,true);await sleep(120);await key(code,k,false);ST.transitionUntil=Date.now()+2600;log('portal-nudge',{attempt:ST.transitionAttempts,face,zoneId:ST.zoneId,tile:cur});return}
ST.interactionMode=null;ST.transitionUntil=0;ST.transitionAttempts=0;ST.blockedEdges[edgeKey(cur,neighbors(cur)[0])]=Date.now()+5000;log('portal-timeout-repath',{zoneId:ST.zoneId,tile:cur,portal:portal.id})}
async function localRecovery(){const seq=ST.zoneId==='firstlight'?['right','down','right','up']:['left','right','up','down'];log('local-recovery-start',{position:ST.position,zoneId:ST.zoneId,failed:ST.samePosFailures});for(const name of seq){const[code,k]=DIR[name];const before=ST.officialMoves;await release();await key(code,k,true);await sleep(110);await key(code,k,false);await sleep(160);if(ST.officialMoves>before){log('local-recovery-success',{name,position:ST.position});break}}ST.samePosFailures=0;ST.lastFailedPos=null}

async function bootstrapOfficialPosition(){
  if(ST.position||!ST.zoneId||ST.bootstrapAttempts>=4)return !!ST.position;
  ST.bootstrapAttempts++;
  const seq=ST.interiorId==='tide-sigil-hall'?['down','left','right','up']:ST.zoneId==='tidemarsh'?['left','down','up','right']:['down','right','left','up'];
  const name=seq[(ST.bootstrapAttempts-1)%seq.length],[code,k]=DIR[name];
  const before=ST.officialMoves;
  await release();await key(code,k,true);await sleep(90);await key(code,k,false);await sleep(180);
  log('position-bootstrap-attempt',{attempt:ST.bootstrapAttempts,name,zoneId:ST.zoneId,interiorId:ST.interiorId,confirmed:ST.officialMoves>before,position:ST.position});
  return !!ST.position;
}

async function positionlessDomPatrolStep(){
  await release();log('movement-waiting-page-position',{zoneId:ST.zoneId,location:ST.probe?.location||null,bridge:ST.probe?.bridge||null});await sleep(220);return true;
}

async function tidemarshReturnStep(){
  const target=farmTarget();if(!ST.respawnReturnActive||ST.zoneId!=='tidemarsh'||!target||target==='tidemarsh')return false;
  // When inside the arena, first seek the south exit. In the city, prefer west toward Coast Route.
  const interior=ST.interiorId==='tide-sigil-hall';
  const seq=interior?['down','down','left','right','up']:['left','left','down','up','right'];
  const name=seq[ST.tidemarshRecoveryDir++%seq.length],[code,k]=DIR[name];
  const before=ST.officialMoves,beforePos=ST.position?`${ST.position.x}:${ST.position.z}`:null;
  await release();await key(code,k,true);await sleep(145);await key(code,k,false);await sleep(170);
  const moved=ST.officialMoves>before;
  log('tidemarsh-return-step',{target,interiorId:ST.interiorId,name,moved,beforePos,position:ST.position,attempt:ST.tidemarshRecoveryDir});
  if(!moved&&ST.tidemarshRecoveryDir%10===0){await release();await sleep(500)}
  return true;
}
async function moveStep(){if(ST.movementInFlight)return;ST.movementInFlight=true;try{const now=Date.now();if(ST.spotReturnActive){await selectedSpotReturnStep();return;}if(ST.battleServerActive||now-ST.lastBattleRewardAt<350){await release();return}const text=String(ST.probe?.bodyText||'');if(/\bCONNECTING\b/i.test(text)){await release();ST.interactionMode='connecting';log('connecting-pause',{zoneId:ST.zoneId,position:ST.position});await sleep(300);return}if(ST.interactionMode==='connecting')ST.interactionMode=null;
if(!ST.zoneId){await release();log('movement-waiting-zone',{location:ST.probe?.location||null,target:farmTarget()});await sleep(250);return}
if(!ST.position){
  const ready=await bootstrapOfficialPosition();
  if(!ready){
    if(ST.inputMode==='dom'){
      await positionlessDomPatrolStep();
      return;
    }
    await release();
    log('movement-waiting-position',{zoneId:ST.zoneId,location:ST.probe?.location||null,target:farmTarget(),attempts:ST.bootstrapAttempts});
    return;
  }
}
// Return after wipe must use the same catalog/pathfinder that worked before Select Tile.
 // Do not hijack Tidemarsh movement with blind WASD guesses.
const map=LUMENA_NAV_CATALOG[ST.zoneId];if(map&&ST.position){const cur=tileKey(map,ST.position),portal=portalFor(map,cur);if(portal&&shouldUsePortal(map,cur,portal)){await portalStep(map,cur,portal);return}if(portal&&ST.interactionMode==='portal'){ST.interactionMode=null;ST.transitionUntil=0;ST.transitionAttempts=0;log('portal-mode-cleared',{zoneId:ST.zoneId,portal:portal.id,tile:cur})}}
if(ST.config.dailyTrainers&&ST.currentTrainer&&ST.currentTrainer.zoneId===ST.zoneId){const mapT=LUMENA_NAV_CATALOG[ST.zoneId],curT=mapT&&ST.position?tileKey(mapT,ST.position):null,goalsT=mapT?trainerGoals(mapT,ST.currentTrainer):[];if(curT&&goalsT.includes(curT)){await release();ST.trainerMode='interacting';const nowT=Date.now();if(nowT-ST.trainerInteractAt>900){ST.trainerInteractAt=nowT;await key('Space',' ',true);await sleep(70);await key('Space',' ',false);log('trainer-local-interact',{trainer:ST.currentTrainer,position:ST.position,tile:curT})}await sleep(260);return}}
const name=nextDir();if(!name){await release();log('movement-paused-no-safe-path',{zoneId:ST.zoneId,position:ST.position,goal:ST.navGoal});await sleep(300);return}const[code,k]=DIR[name],before=ST.officialMoves,beforePos=ST.position?`${ST.position.x}:${ST.position.z}`:null;await release();await key(code,k,true);const smooth=!!ST.config.smoothMovement;const hold=smooth?130+Math.floor(Math.random()*91):(ST.position?120:220);await sleep(hold);await key(code,k,false);const waitUntil=Date.now()+420;while(ST.officialMoves===before&&Date.now()<waitUntil)await sleep(45);await sleep(smooth?55+Math.floor(Math.random()*45):110);ST.lastSmoothDir=name;if(ST.officialMoves>before){ST.failedMoves=0;ST.samePosFailures=0;ST.lastFailedPos=null;learnCurrentTile('move');log('move-confirmed',{name,delta:ST.officialMoves-before,position:ST.position,zoneId:ST.zoneId,goal:ST.navGoal})}else{ST.failedMoves++;const map2=LUMENA_NAV_CATALOG[ST.zoneId],cur=map2&&ST.position?tileKey(map2,ST.position):null;if(beforePos&&beforePos===ST.lastFailedPos)ST.samePosFailures++;else{ST.samePosFailures=1;ST.lastFailedPos=beforePos}if(cur&&name){const[x,y]=parseKey(cur),n=name==='right'?`${x+1}:${y}`:name==='left'?`${x-1}:${y}`:name==='down'?`${x}:${y+1}`:`${x}:${y-1}`;if(ST.samePosFailures>=2){ST.blockedEdges[edgeKey(cur,n)]=Date.now()+9000;log('edge-temporarily-blocked',{from:cur,to:n,name,until:ST.blockedEdges[edgeKey(cur,n)]})}}if(map2?.autoLearned){ST.dynamicTurnIndex=(ST.dynamicTurnIndex+1)%4;ST.dynamicPreferredDir=['up','right','down','left'][ST.dynamicTurnIndex]}log('move-not-confirmed',{name,failed:ST.failedMoves,samePosFailures:ST.samePosFailures,position:ST.position,zoneId:ST.zoneId});if(ST.samePosFailures>=4)await localRecovery()}}finally{ST.movementInFlight=false}}
async function actionStep(a,label){if(!a?.target)return;const now=Date.now();if(ST.actionInFlight||now<ST.actionUnlockAt)return;ST.actionInFlight=true;try{if(a.kind?.startsWith('move-choice')){try{const vis=await chrome.tabs.sendMessage(ST.tabId,{type:'ensure-action-visible',kind:a.kind,targetText:a.target.text});if(vis?.ok&&vis.target){a={...a,target:vis.target};log('move-choice-scroll',{kind:a.kind,inView:vis.inView,viewport:vis.viewport,target:a.target})}else log('move-choice-scroll-failed',{kind:a.kind,error:vis?.error||'no-response'})}catch(e){log('move-choice-scroll-error',{kind:a.kind,message:e.message})}}const sig=`${a.kind}|${a.target.text}|${Math.round(a.target.rect?.cx||0)}|${Math.round(a.target.rect?.cy||0)}`;if(sig===ST.lastActionSig&&now-ST.lastActionAt<1100)return;await release();await cdpClick(a.target);ST.lastActionSig=sig;ST.lastActionAt=Date.now();ST.actionUnlockAt=Date.now()+(a.kind==='advance'?700:450);log(label,{kind:a.kind,target:a.target});await sleep(a.kind==='evolution'?1100:a.kind.startsWith('forced-switch')?850:a.kind.startsWith('move-choice')?900:a.kind.startsWith('capture')?650:550)}finally{ST.actionInFlight=false}}
function recoverStaleBattleServerFlag(b){const now=Date.now();if(!ST.battleServerActive||b?.active)return false;const domEnded=ST.lastBattleEndedAt>0&&now-ST.lastBattleEndedAt>650;const captureEnded=ST.capture.lastResult==='success'&&ST.capture.lastAttemptAt>0&&now-ST.capture.lastAttemptAt>650;const staleSeen=ST.lastBattleSeenAt>0&&now-ST.lastBattleSeenAt>5000;if(!(domEnded||captureEnded||staleSeen))return false;ST.battleServerActive=false;ST.phase='world';ST.lastBattleRewardAt=now-350;ST.lastWorldResumeAt=now;ST.lastActionSig='';log('battle-server-stale-cleared',{domEnded,captureEnded,staleSeen,lastBattleSeenAt:ST.lastBattleSeenAt,lastBattleEndedAt:ST.lastBattleEndedAt,lastCaptureResult:ST.capture.lastResult});return true}
function updateBattleLifecycle(b){const now=Date.now(),active=!!b?.active;if(active){ST.lastBattleSeenAt=now;if(!ST.domBattleActive){
  ST.domBattleActive=true;
  ST.phase='battle';
  ST.battles++;
  ST.lastBattleOutcome=null;
  ST.battleOriginZone=ST.zoneId;
  ST.battleOriginPosition=ST.position?{x:ST.position.x,z:ST.position.z}:null;
  ST.capture={stage:'weaken',attemptsThisBattle:0,lastAttemptAt:0,lastResult:null,noLanternThisBattle:false};
  ST.domPatrolStep=0;
  log('battle-start-dom',{position:ST.position,zoneId:ST.zoneId,text:String(b?.text||'').slice(0,500)})
}
if(b?.allFainted&&ST.lastBattleOutcome!=='team-wipe-pending'){
  ST.lastBattleOutcome='team-wipe-pending';
  ST.wipePendingAt=now;
  log('team-wipe-pending',{zoneId:ST.zoneId,position:ST.position,candidates:b?.forcedSwitch?.candidates||[]})
}}else if(ST.domBattleActive){ST.domBattleActive=false;ST.phase='world';ST.lastBattleEndedAt=now;ST.lastActionSig='';ST.capture.stage='idle';if(ST.lastBattleOutcome!=='team-wipe-pending'){
  ST.lastBattleOutcome='ended';
  ST.lastWorldResumeAt=now;
  ST.domPatrolStep=0;
  ST.domPatrolDir=(ST.domPatrolDir+1)%4;
  ST.battleOriginZone=null;
  ST.battleOriginPosition=null;
  log('battle-end-dom',{zoneId:ST.zoneId,position:ST.position,resumeEligibleAt:now+350})
}else{
  ST.wipePendingAt=ST.wipePendingAt||now;
  log('battle-ended-awaiting-respawn',{originZone:ST.battleOriginZone,position:ST.battleOriginPosition})
}}}
async function tick(){if(!ST.running||ST.userPaused)return;ST.lastTickAt=Date.now();ST.lastHeartbeatAt=ST.lastTickAt;try{if(!ST.attached&&ST.inputMode!=='dom')await ensureAttached('tick-detached');if(!ST.running)return;const r=await probe(),snap=r?.snapshot,b=snap?.battle,e=snap?.evolution,p=snap?.play,d=snap?.dialog,t=snap?.trainer,caz=snap?.casino;updateBattleLifecycle(b);recoverStaleBattleServerFlag(b);if(!caz?.active&&ST.casino.active){ST.casino.active=false;log('casino-closed',{spins:ST.casino.spins,lastResult:ST.casino.lastResult,stopReason:ST.casino.stopReason})}ST.checks.battleDom=b?.active?'ok':ST.checks.battleDom;const tier=b?.active&&!b?.trainerBattle?lumenTier(b?.enemyName):null;
const shiny=!!(b?.active&&!b?.trainerBattle&&b?.shiny);
const autoCapturingThisShiny=!!(
  shiny &&
  ST.config.autoCaptureWild &&
  ST.config.captureOnlyShiny!==false
);
if(shiny&&ST.config.pauseShiny!==false&&!autoCapturingThisShiny&&!ST.specialPause){
  ST.specialPause={
    name:b.enemyName||b.enemyNameRaw||'Desconhecido',
    speciesId:b.enemySpeciesId||null,
    form:b.enemyForm??null,
    gender:b.enemyGender||null,
    tier:'SHINY',
    shiny:true,
    source:b.shinySource||'unknown',
    fromEncounter:!!b.shinyFromEncounter,
    fromState:!!b.shinyFromState,
    fromStar:!!b.shinyFromStar,
    encounterRequestId:b.encounterRequestId||null,
    encounterMethod:b.encounterMethod||null,
    encounterZoneId:b.encounterZoneId||null,
    at:Date.now(),
    zoneId:ST.zoneId
  };
  ST.config.movement=false;
  ST.config.battle=false;
  await release().catch(()=>{});
  log('wild-shiny-pause',ST.specialPause);
}else if(tier&&shouldPauseTier(tier)&&!ST.specialPause){
  ST.specialPause={name:b.enemyName,tier,at:Date.now(),zoneId:ST.zoneId};
  ST.config.movement=false;
  ST.config.battle=false;
  await release().catch(()=>{});
  log('wild-tier-pause',ST.specialPause);
}if(ST.specialPause){await release().catch(()=>{});await sleep(300)}else if(ST.config.autoEnterPlay&&p?.active&&p.action){await release().catch(()=>{});await actionStep(p.action,'enter-play-action');log('enter-play-clicked',{text:p.text,target:p.action.target});await sleep(900)}else if(caz?.active){await release().catch(()=>{});ST.casino.active=true;ST.casino.chips=caz.chips;ST.casino.lastStatus=caz.statusText||null;ST.casino.maxSpins=Math.max(1,+ST.config.slotMaxSpins||100);if(ST.config.autoSlots&&caz.game==='slots'){const bet=Math.max(1,Math.min(3,+ST.config.slotBet||1)),min=Math.max(0,+ST.config.slotMinChips||0),max=ST.casino.maxSpins;if(ST.casino.spins>=max){ST.config.autoSlots=false;ST.casino.stopReason='max-spins';log('casino-auto-spin-stopped',{reason:'max-spins',spins:ST.casino.spins,max})}else if(Number.isFinite(caz.chips)&&caz.chips-bet<min){ST.config.autoSlots=false;ST.casino.stopReason='minimum-balance';log('casino-auto-spin-stopped',{reason:'minimum-balance',chips:caz.chips,bet,min})}else if(caz.spinning){await sleep(300)}else if(caz.bet!==bet){const target=(caz.betButtons||[]).find(x=>x.value===bet&&!x.disabled);if(target){await actionStep({kind:'casino-select-bet',target},'casino-select-bet');log('casino-bet-selected',{bet})}else{ST.config.autoSlots=false;ST.casino.stopReason='bet-unavailable';log('casino-auto-spin-stopped',{reason:'bet-unavailable',bet,buttons:caz.betButtons})}}else if(caz.spin&&!caz.spin.target?.disabled&&Date.now()-ST.casino.lastSpinAt>650){await actionStep(caz.spin,'casino-spin');ST.casino.spins++;ST.casino.lastSpinAt=Date.now();ST.casino.lastResult=caz.statusText||'spin-started';ST.casino.stopReason=null;log('casino-spin',{spin:ST.casino.spins,max,bet,chipsBefore:caz.chips})}else await sleep(250)}else await sleep(300)}else if(e?.active&&e.action)await actionStep(e.action,'evolution-action');else if(ST.config.dailyTrainers&&t?.active&&t?.action){ST.trainerMode='dialog';await actionStep(t.action,'trainer-local-dialog-action')}else if(ST.config.dailyTrainers&&t?.active&&/already defeated|come back tomorrow|already battled|not available today/i.test(String(t.text||''))){completeCurrentTrainer('already-done')}else if(d?.active&&d?.action){ST.lastDialogAt=Date.now();await actionStep(d.action,'npc-dialog-action')}else if(b?.moveChoice?.active&&b?.moveChoice?.action)await actionStep(b.moveChoice.action,'move-choice-action');else if((b?.active||ST.phase==='battle')&&ST.config.autoCaptureWild&&b?.capture){
  const c=b.capture;
  const onlyShiny=ST.config.captureOnlyShiny!==false;
  const captureEligible=!onlyShiny||b?.shiny===true;
  const unlimitedShiny=onlyShiny&&b?.shiny===true;
  const limit=unlimitedShiny?Number.MAX_SAFE_INTEGER:Math.max(1,+ST.config.captureRetries||3);
  const hpLimit=Math.max(1,Math.min(100,+ST.config.captureHpPercent||30))/100;
  let a=null;

  if(!captureEligible){
    if(ST.capture.stage!=='ignored-non-shiny'){
      ST.capture.stage='ignored-non-shiny';
      log('wild-capture-ignored-non-shiny',{
        enemyName:b?.enemyName||null,
        speciesId:b?.enemySpeciesId||null,
        shiny:!!b?.shiny,
        source:b?.shinySource||null
      });
    }
    if(ST.config.battle)await actionStep(b?.action,'battle-action');
  }else{
    if(c.blockedTrainer){
      if(ST.capture.stage!=='blocked'){
        ST.capture.stage='blocked';
        log('wild-capture-blocked-trainer',{text:c.text})
      }
    }else if(c.stage==='no-lantern'){
      if(!ST.capture.noLanternThisBattle){
        ST.capture.noLanternThisBattle=true;
        ST.capture.stage='no-lantern';
        log('wild-capture-no-lantern',{
          overlayText:c.overlayText||c.text,
          attemptsThisBattle:ST.capture.attemptsThisBattle,
          shiny:!!b?.shiny
        })
      }
      if(unlimitedShiny){
        ST.specialPause={
          name:b.enemyName||b.enemyNameRaw||'Desconhecido',
          speciesId:b.enemySpeciesId||null,
          tier:'SHINY',
          shiny:true,
          reason:'no-lantern',
          source:b.shinySource||'unknown',
          at:Date.now(),
          zoneId:ST.zoneId
        };
        ST.config.movement=false;
        ST.config.battle=false;
        await release().catch(()=>{});
        log('wild-shiny-capture-paused-no-lantern',ST.specialPause);
      }else if(c.backButton){
        a={kind:'capture-back-no-lantern',target:c.backButton};
      }
    }else if(c.stage==='select-lantern'){
      if(unlimitedShiny){
        // For shiny encounters, rarity preference is ignored. Use every
        // available Lantern presented by the game until success or inventory exhaustion.
        a=c.recommended||c.wisp||c.aurora||null;
      }else{
        const pref=ST.config.lanternPreference||'auto';
        a=(pref==='aurora'?c.aurora:pref==='wisp'?c.wisp:null)||c.recommended||c.wisp||c.aurora;
      }
      if(a)a={kind:'capture-select-lantern',target:a};
    }else if(
      c.stage==='open-bag' &&
      !ST.capture.noLanternThisBattle &&
      c.bagButton &&
      (
        unlimitedShiny ||
        (
          c.enemyHpRatio!=null &&
          c.enemyHpRatio<=hpLimit
        )
      ) &&
      ST.capture.attemptsThisBattle<limit
    ){
      // Shiny: open the bag immediately, even at 100% HP.
      a={kind:'capture-open-bag',target:c.bagButton};
    }else if(c.stage==='throw'&&c.throwButton&&ST.capture.attemptsThisBattle<limit){
      a={kind:'capture-throw',target:c.throwButton};
    }

    if(a){
      if(a.kind==='capture-select-lantern'||a.kind==='capture-throw'){
        ST.capture.attemptsThisBattle++;
        ST.captureAttempts++;
        ST.capture.lastAttemptAt=Date.now();
        log('wild-capture-attempt',{
          attempt:ST.capture.attemptsThisBattle,
          limit:unlimitedShiny?'until-success-or-no-lantern':limit,
          enemyHpRatio:c.enemyHpRatio,
          shiny:!!b?.shiny,
          onlyShiny
        })
      }
      await actionStep(a,'wild-capture-action');
    }else if(unlimitedShiny){
      // Never attack an eligible shiny. During UI transitions, wait for the
      // bag/Lantern/throw controls to become available.
      await release().catch(()=>{});
      log('wild-shiny-capture-wait',{
        enemyName:b?.enemyName||null,
        speciesId:b?.enemySpeciesId||null,
        stage:c.stage||null,
        enemyHpRatio:c.enemyHpRatio,
        attempts:ST.capture.attemptsThisBattle
      });
      await sleep(180);
    }else if(!ST.specialPause&&ST.config.battle){
      await actionStep(b?.action,'battle-action');
    }
  }
}else if((b?.active||ST.phase==='battle')&&ST.config.battle)await actionStep(b?.action,'battle-action');else if(ST.config.movement)await moveStep();ST.consecutiveLoopErrors=0;ST.lastTickCompletedAt=Date.now()}catch(e){ST.consecutiveLoopErrors++;ST.lastError=e.message;log('loop-error',{message:e.message,stack:e.stack,consecutive:ST.consecutiveLoopErrors});if(/debugger|detached|target closed|No tab/i.test(e.message||'')){ST.attached=false;ST.inputMode='dom';ST.debuggerUnavailable=true;ST.checks.debugger='fallback';ST.lastError=null;log('debugger-fallback-enabled',{reason:'tick-error',message:e.message})}}if(ST.running&&!ST.userPaused){ST.lastTickCompletedAt=Date.now();ST.timer=setTimeout(tick,220)}}
async function hasOffscreen(){if(chrome.runtime.getContexts){const c=await chrome.runtime.getContexts({contextTypes:['OFFSCREEN_DOCUMENT'],documentUrls:[chrome.runtime.getURL('offscreen.html')]});return c.length>0}return false}
async function ensureOffscreen(){if(await hasOffscreen())return;await chrome.offscreen.createDocument({url:'offscreen.html',reasons:['USER_MEDIA','BLOBS'],justification:'Gravar a aba do Lumena e segmentar o vídeo do diagnóstico.'})}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function capturedTabState(){try{const tabs=await chrome.tabCapture.getCapturedTabs();return tabs.find(x=>x.tabId===ST.tabId)||null}catch{return null}}
async function releaseExistingTabCapture(){const before=await capturedTabState();if(!before||before.status==='stopped'||before.status==='error')return true;log('video-existing-capture-detected',{tabId:ST.tabId,status:before.status,fullscreen:before.fullscreen});try{if(await hasOffscreen()){await chrome.runtime.sendMessage({target:'offscreen',type:'record-stop',reason:'preflight-recovery'}).catch(()=>{});await wait(350)}}catch{}let after=await capturedTabState();if(!after||after.status==='stopped'||after.status==='error'){log('video-existing-capture-released',{tabId:ST.tabId});return true}try{if(await hasOffscreen()){await chrome.offscreen.closeDocument();await wait(500)}}catch{}after=await capturedTabState();if(!after||after.status==='stopped'||after.status==='error'){log('video-existing-capture-released',{tabId:ST.tabId,method:'close-offscreen'});return true}return false}
async function startVideo(){ST.video={enabled:!!ST.config.recordVideo,recording:false,partIndex:0,segmentStartedAt:0,totalStartedAt:0,segmentBytes:0,partsSaved:0,lastFilename:null,error:null,mimeType:null};if(!ST.config.recordVideo)return;const released=await releaseExistingTabCapture();if(!released)throw Error('A aba já está sendo gravada por uma captura ativa. Pare a gravação anterior ou recarregue a aba do Lumena e tente novamente.');await ensureOffscreen();let streamId;try{streamId=await chrome.tabCapture.getMediaStreamId({targetTabId:ST.tabId})}catch(e){if(/active stream/i.test(e?.message||'')){await releaseExistingTabCapture();await wait(300);streamId=await chrome.tabCapture.getMediaStreamId({targetTabId:ST.tabId})}else throw e}const r=await chrome.runtime.sendMessage({target:'offscreen',type:'record-start',streamId,sessionId:ST.sessionId,segmentMinutes:ST.config.videoSegmentMinutes,maxMB:ST.config.videoMaxMB,quality:ST.config.videoQuality,audio:!!ST.config.videoAudio});if(!r?.ok)throw Error(r?.error||'Não foi possível iniciar a gravação da aba.');ST.video.enabled=true;ST.video.recording=true;ST.video.totalStartedAt=Date.now();log('video-recording-start',{segmentMinutes:ST.config.videoSegmentMinutes,maxMB:ST.config.videoMaxMB,quality:ST.config.videoQuality,audio:!!ST.config.videoAudio})}
async function stopVideo(){if(!ST.video?.enabled)return;try{const r=await chrome.runtime.sendMessage({target:'offscreen',type:'record-stop'});if(!r?.ok)throw Error(r?.error||'Falha ao encerrar vídeo');log('video-recording-stop',{partsSaved:ST.video.partsSaved})}catch(e){ST.video.error=e.message;log('video-stop-error',{message:e.message})}ST.video.recording=false}
async function start(config={}){const[tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!tab?.id||!/lumena\.gg/i.test(tab.url||''))throw Error('Abra a aba do Lumena antes de iniciar.');Object.assign(ST.config,config);Object.assign(ST,{running:false,desiredRunning:true,userPaused:false,tabId:tab.id,phase:'world',lastError:null,events:[],startedAt:Date.now(),sessionId:new Date().toISOString().replace(/[:.]/g,'-'),eventSeq:0,totalEvents:0,chunkIndex:0,lastExportAt:0,lastSnapshotSig:'',lastMilestoneSig:'',milestoneSigs:{},requestMeta:{},network:{requests:0,responses:0,failures:0,wsSent:0,wsReceived:0},milestones:{account:0,tutorial:0,trainer:0,evolution:0,capture:0,quest:0,zone:0},lastMoveAt:0,officialMoves:0,encounters:0,battles:0,wins:0,captureAttempts:0,captures:0,actions:0,failedMoves:0,dirIndex:0,lastActionSig:'',lastActionAt:0,position:null,zoneId:null,lastEncounterMove:0,navGoal:null,interactionMode:null,transitionUntil:0,transitionAttempts:0,samePosFailures:0,lastFailedPos:null,blockedEdges:{},lastZoneId:null,entryPortalId:null,entryPortalUntil:0,domBattleActive:false,lastBattleSeenAt:0,lastBattleEndedAt:0,lastBattleOutcome:null,teamWipes:0,respawns:0,video:{enabled:false,recording:false,partIndex:0,segmentStartedAt:0,totalStartedAt:0,segmentBytes:0,partsSaved:0,lastFilename:null,error:null,mimeType:null},farmRoute:null,farmRouteStep:null,farmArrived:false,lastFarmRouteFailure:null,lastPortalGoalSig:null,pendingFarmMap:null,farmMapChangeAt:0,trainerMode:'idle',gacha:{holding:false,lastPullAt:0,lastResult:null},casino:{active:false,spins:0,maxSpins:Math.max(1,+ST.config.slotMaxSpins||100),chips:null,lastSpinAt:0,lastResult:null,stopReason:null,lastStatus:null},capture:{stage:'idle',attemptsThisBattle:0,lastAttemptAt:0,lastResult:null,noLanternThisBattle:false},battleServerActive:false,lastBattleRewardAt:0,actionInFlight:false,actionUnlockAt:0,currentTrainer:null,trainerCompleted:{},trainerSkipped:{},trainerTargetSince:0,trainerInteractAt:0,trainerDialogSince:0,movementInFlight:false,lastWorldResumeAt:0,lastDialogAt:0,interiorId:null,bootstrapAttempts:0,tidemarshRecoveryDir:0,lastFarmZone:null,respawnReturnActive:false,respawnReturnTarget:null,specialPause:null,nextStraightSteps:1,lastSmoothDir:null,lastTrainerCheckAt:0,lastTickAt:Date.now(),lastTickCompletedAt:0,lastHeartbeatAt:Date.now(),watchdogRecoveries:0,consecutiveLoopErrors:0,recoverAttempts:0,recovering:false,domPatrolDir:0,domPatrolStep:0,domPatrolLastAt:0,domPatrolCycles:0,selectedSpot:null,spotReturnActive:false,spotReturnIndex:0,spotReturnStartedAt:0,spotReturnReason:null,anchorNeighbor:null,anchorNeighborIndex:0,positionSource:null,lastBridgeAt:0,battleOriginZone:null,battleOriginPosition:null,wipePendingAt:0,wipeReturnSpotZone:null,crystalByZone:{}});ST.dynamicAnchor=null;ST.dynamicPreferredDir=null;ST.dynamicTurnIndex=0;ST.recentWorldTiles=[];ST.learnedMapsLoaded=false;ST.checks={worker:'ok',tab:'ok',content:'pending',debugger:'pending',input:'pending',websocket:'pending',battleDom:'pending'};await loadLearnedMaps();await loadSelectedSpots();await loadCrystalSpots();await loadSelectedSpots();await loadCrystalSpots();await loadSelectedSpots();await loadCrystalSpots();await loadSelectedSpots();await loadCrystalSpots();await loadSelectedSpots();await loadCrystalSpots(); // ensure loaded
  await loadSelectedSpots();await loadCrystalSpots();
  await loadSelectedSpots();await loadCrystalSpots();
  await attach();const r=await probe();activateSpotForZone(ST.zoneId);if(!r?.ok)throw Error('Content script não respondeu. Recarregue a aba do jogo.');if(ST.zoneId)ST.lastFarmZone=ST.zoneId;ST.config.localFarmMode=true;ST.config.moveToFarmMap=false;ST.config.stayOnFarmMap=false;log('start',{version:VERSION,edition:DIAGNOSTIC_EDITION,sessionId:ST.sessionId,config:ST.config,catalogs:r.catalogs,bundledMapMerge:BUNDLED_MAP_MERGE,completeMapCatalog:COMPLETE_MAP_CATALOG_INFO,userAgent:navigator?.userAgent||null});ST.running=true;await persistRuntime();if(ST.config.fullDiagnostic)schedule();tick();return status()}
async function stop(download=true){ST.desiredRunning=false;ST.userPaused=false;ST.running=false;clearTimeout(ST.timer);clearTimeout(ST.exportTimer);ST.timer=null;ST.exportTimer=null;await release().catch(()=>{});log('stop');if(ST.attached)try{await chrome.debugger.detach({tabId:ST.tabId})}catch{}ST.attached=false;ST.phase='idle';await clearRuntime()}
function status(){return{running:ST.running,desiredRunning:ST.desiredRunning,userPaused:ST.userPaused,recovering:ST.recovering,attached:ST.attached,phase:ST.phase,lastError:ST.lastError,checks:ST.checks,inputMode:ST.inputMode,officialMoves:ST.officialMoves,encounters:ST.encounters,battles:ST.battles,wins:ST.wins,captureAttempts:ST.captureAttempts,captures:ST.captures,actions:ST.actions,failedMoves:ST.failedMoves,location:ST.probe?.location||null,zoneId:ST.zoneId,position:ST.position,positionSource:ST.positionSource,lastBridgeAt:ST.lastBridgeAt,bridge:ST.probe?.bridge||null,navGoal:ST.navGoal,interactionMode:ST.interactionMode,interiorId:ST.interiorId,samePosFailures:ST.samePosFailures,blockedEdges:Object.keys(ST.blockedEdges).length,lastZoneId:ST.lastZoneId,entryPortalId:ST.entryPortalId,entryPortalUntil:ST.entryPortalUntil,domBattleActive:ST.domBattleActive,lastBattleSeenAt:ST.lastBattleSeenAt,lastBattleEndedAt:ST.lastBattleEndedAt,lastBattleOutcome:ST.lastBattleOutcome,battleOriginZone:ST.battleOriginZone,battleOriginPosition:ST.battleOriginPosition,wipePendingAt:ST.wipePendingAt,wipeReturnSpotZone:ST.wipeReturnSpotZone,teamWipes:ST.teamWipes,respawns:ST.respawns,evolution:ST.probe?.evolution||null,battle:ST.probe?.battle||null,eventCount:ST.events.length,totalEvents:ST.totalEvents,sessionId:ST.sessionId,chunkIndex:ST.chunkIndex,network:ST.network,milestones:ST.milestones,elapsedMs:ST.startedAt?Date.now()-ST.startedAt:0,selectedFarmMap:null,currentFarmMap:ST.zoneId||null,lastFarmZone:ST.lastFarmZone,respawnReturnActive:ST.respawnReturnActive,respawnReturnTarget:ST.respawnReturnTarget,farmRoute:ST.farmRoute||null,farmRouteStep:ST.farmRouteStep||null,farmArrived:!!ST.farmArrived,pendingFarmMap:ST.pendingFarmMap,trainerMode:ST.trainerMode,currentTrainer:ST.currentTrainer,trainerCompleted:Object.keys(ST.trainerCompleted||{}),trainerSkipped:Object.keys(ST.trainerSkipped||{}),gacha:{...ST.gacha},casino:{...ST.casino,chips:ST.probe?.casino?.chips??ST.casino.chips,statusText:ST.probe?.casino?.statusText||ST.casino.lastStatus,maxSpins:Math.max(1,+ST.config.slotMaxSpins||100)},capture:{...ST.capture},battleServerActive:ST.battleServerActive,lastBattleRewardAt:ST.lastBattleRewardAt,specialPause:ST.specialPause,lastTickAt:ST.lastTickAt,lastTickCompletedAt:ST.lastTickCompletedAt,watchdogRecoveries:ST.watchdogRecoveries,consecutiveLoopErrors:ST.consecutiveLoopErrors,domPatrol:{dir:ST.domPatrolDir,step:ST.domPatrolStep,lastAt:ST.domPatrolLastAt,cycles:ST.domPatrolCycles},selectedSpot:ST.selectedSpot?{zoneId:ST.selectedSpot.zoneId,selectedAt:ST.selectedSpot.selectedAt,tile:ST.selectedSpot.tile||null,position:ST.selectedSpot.position,source:ST.selectedSpot.source||null}:null,spotReturn:{active:ST.spotReturnActive,index:ST.spotReturnIndex,reason:ST.spotReturnReason},catalog:{...COMPLETE_MAP_CATALOG_INFO,merge:BUNDLED_MAP_MERGE},autoCatalog:{active:!!LUMENA_NAV_CATALOG?.[ST.zoneId]?.autoLearned,walkable:LUMENA_NAV_CATALOG?.[ST.zoneId]?.walkable?.length||0,encounterTiles:LUMENA_NAV_CATALOG?.[ST.zoneId]?.highGrass?.length||0},video:{...ST.video,segmentElapsedMs:ST.video?.segmentStartedAt?Date.now()-ST.video.segmentStartedAt:0,totalElapsedMs:ST.video?.totalStartedAt?Date.now()-ST.video.totalStartedAt:0}}}
async function exportDiag(reason){const events=[...ST.events];const report=reportBase(reason,events);const json=JSON.stringify(report,null,2);const url='data:application/json;charset=utf-8,'+encodeURIComponent(json);const idx=String(++ST.chunkIndex).padStart(4,'0');const filename=`Lumena-Diagnostic/session-${ST.sessionId}/${idx}-lumena-full-v${VERSION}-${reason}-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;await autoDownload({url,filename});ST.lastExportAt=Date.now();if(events.length&&ST.events[0]?.seq===events[0]?.seq)ST.events.splice(0,events.length);return filename}
function schedule(){clearTimeout(ST.exportTimer);ST.exportTimer=setTimeout(async()=>{if(!ST.running)return;await exportDiag('periodic-chunk');schedule()},Math.max(1,+ST.config.diagnosticMinutes||3)*60000)}
function forceMoveNow(target,reason='move-now'){
  const next=target||ST.config.farmMap||null;
  if(!next)throw Error('Selecione um mapa antes de usar Mover agora.');
  ST.config.farmMap=next;ST.config.moveToFarmMap=true;ST.config.movement=true;
  ST.pendingFarmMap=next;ST.farmMapChangeAt=Date.now();ST.farmArrived=ST.zoneId===next;
  ST.farmRoute=null;ST.farmRouteStep=null;ST.lastFarmRouteFailure=null;ST.navGoal=null;
  ST.interactionMode=null;ST.transitionUntil=0;ST.transitionAttempts=0;ST.blockedEdges={};
  ST.entryPortalId=null;ST.entryPortalUntil=0;ST.lastActionSig='';
  const route=zoneRoute(ST.zoneId,next);
  log('farm-move-now',{fromZone:ST.zoneId,to:next,route,reason,running:ST.running,battleActive:ST.domBattleActive||ST.phase==='battle'});
  if(!route&&ST.zoneId!==next)log('farm-route-not-found',{from:ST.zoneId,to:next,reason:'move-now'});
  return route;
}
chrome.runtime.onMessage.addListener((m,_s,reply)=>{if(m?.target==='offscreen')return false;(async()=>{if(m?.type==='video-status'){Object.assign(ST.video,m.status||{});reply({ok:true});return}if(m?.type==='video-segment-ready'){const id=await autoDownload({url:m.url,filename:m.filename});ST.video.partsSaved=(ST.video.partsSaved||0)+1;ST.video.lastFilename=m.filename;ST.video.partIndex=m.partIndex;ST.video.segmentBytes=0;log('video-segment-saved',{downloadId:id,filename:m.filename,bytes:m.bytes,partIndex:m.partIndex,startedAt:m.startedAt,endedAt:m.endedAt,reason:m.reason,mimeType:m.mimeType});reply({ok:true,downloadId:id});return}if(m?.type==='start'){reply({ok:true,status:await start(m.config||{})});return}if(m?.type==='move-now'){const route=forceMoveNow(m.farmMap,m.reason||'popup-button');reply({ok:true,route,status:status()});return}
if(m?.type==='select-tile'){const spot=await selectCurrentTile();reply({ok:true,spot,status:status()});return}
if(m?.type==='select-crystal'){try{const spot=await selectCurrentCrystal();reply({ok:true,spot,status:status()});}catch(e){reply({ok:false,error:e.message,status:status()})}return}
if(m?.type==='clear-crystal'){
  if(ST.zoneId&&ST.crystalByZone?.[ST.zoneId])delete ST.crystalByZone[ST.zoneId];
  await saveCrystalSpots();log('manual-crystal-cleared',{zoneId:ST.zoneId});
  reply({ok:true,status:status()});return
}
if(m?.type==='clear-selected-tile'){
  if(ST.zoneId&&ST.spotByZone?.[ST.zoneId])delete ST.spotByZone[ST.zoneId];
  ST.selectedSpot=null;ST.spotReturnActive=false;ST.spotReturnIndex=0;
  await saveSelectedSpots();log('manual-tile-cleared',{zoneId:ST.zoneId});
  reply({ok:true,status:status()});return
}if(m?.type==='update-config'){const prevFarm=ST.config.farmMap;const nextConfig=m.config||{};Object.assign(ST.config,nextConfig);ST.config.localFarmMode=true;ST.config.moveToFarmMap=false;ST.config.stayOnFarmMap=false;if(ST.running){clearTimeout(ST.exportTimer);if(ST.config.fullDiagnostic)schedule()}const nextFarm=ST.config.farmMap||null;if(prevFarm!==nextFarm){ST.pendingFarmMap=nextFarm;ST.farmMapChangeAt=Date.now();ST.farmArrived=ST.zoneId===nextFarm;ST.farmRoute=null;ST.farmRouteStep=null;ST.lastFarmRouteFailure=null;ST.navGoal=null;ST.interactionMode=null;ST.transitionUntil=0;ST.transitionAttempts=0;ST.blockedEdges={};ST.entryPortalId=null;ST.entryPortalUntil=0;log('farm-map-change-requested',{from:prevFarm,to:nextFarm,zoneId:ST.zoneId,reason:m.reason||'update-config'});if(ST.running&&nextFarm&&ST.zoneId!==nextFarm)log('farm-map-change-start',{fromZone:ST.zoneId,to:nextFarm});}else{log('config-updated-live',{reason:m.reason||'update-config',config:nextConfig})}await persistRuntime();reply({ok:true,status:status()});return}if(m?.type==='stop'){await stop(false);reply({ok:true,status:status()});return}if(m?.type==='pause'){ST.userPaused=true;ST.running=false;clearTimeout(ST.timer);ST.timer=null;ST.config.movement=false;ST.config.battle=false;await release().catch(()=>{});await persistRuntime();reply({ok:true,status:status()});return}if(m?.type==='resume'){ST.userPaused=false;ST.specialPause=null;ST.config.movement=true;ST.config.battle=true;ST.desiredRunning=true;if(!ST.running){ST.running=true;ST.lastTickAt=Date.now();tick()}await persistRuntime();reply({ok:true,status:status()});return}if(m?.type==='clear-diagnostic'){ST.events=[];ST.eventSeq=0;ST.totalEvents=0;ST.chunkIndex=0;ST.lastExportAt=0;ST.network={requests:0,responses:0,failures:0,wsSent:0,wsReceived:0};ST.milestones={account:0,tutorial:0,trainer:0,evolution:0,capture:0,quest:0,zone:0};log('diagnostic-cleared',{at:new Date().toISOString()});reply({ok:true,status:status()});return}if(m?.type==='status'){if(ST.desiredRunning&&!ST.userPaused&&!ST.specialPause&&(!ST.running||!ST.timer||Date.now()-(ST.lastTickAt||0)>6000))await runtimeWatchdog('status-poll').catch(()=>{});reply({ok:true,status:status()});return}if(m?.type==='export'){const filename=await exportDiag('manual-chunk');reply({ok:true,filename});return}if(m?.type==='screenshot'){const ok=await captureScreenshot('manual');reply({ok});return}if(m?.type==='selftest'){const[tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!tab?.id)throw Error('Aba ativa não encontrada');ST.tabId=tab.id;ST.checks.tab=/lumena\.gg/i.test(tab.url||'')?'ok':'error';await attach();await probe();await key('KeyW','w',false);reply({ok:true,status:status()});return}})().catch(e=>{ST.lastError=e.message;log('command-error',{message:e.message,stack:e.stack});reply({ok:false,error:e.message,status:status()})});return true});
chrome.debugger.onEvent.addListener((src,method,p)=>{if(src.tabId!==ST.tabId)return;
 try{
  if(method==='Network.requestWillBeSent'){
   ST.network.requests++;const r=p.request||{};ST.requestMeta[p.requestId]={url:r.url,method:r.method,type:p.type,ts:Date.now()};
   if(ST.config.networkMetadata)log('http-request',{requestId:p.requestId,url:safeText(r.url,4000),method:r.method,type:p.type,documentURL:safeText(p.documentURL,4000),hasPostData:!!r.hasPostData,postData:r.postData?safeText(r.postData,MAX_POST_DATA):null,headers:sanitizeHeaders(r.headers)});
  }else if(method==='Network.responseReceived'){
   ST.network.responses++;const r=p.response||{};if(ST.config.networkMetadata)log('http-response',{requestId:p.requestId,url:safeText(r.url,4000),status:r.status,statusText:r.statusText,mimeType:r.mimeType,protocol:r.protocol,fromDiskCache:r.fromDiskCache,fromServiceWorker:r.fromServiceWorker,type:p.type,headers:sanitizeHeaders(r.headers)});
  }else if(method==='Network.loadingFailed'){
   ST.network.failures++;log('http-failed',{requestId:p.requestId,url:ST.requestMeta[p.requestId]?.url,errorText:p.errorText,canceled:p.canceled,blockedReason:p.blockedReason,type:p.type});
  }else if(method==='Network.webSocketCreated'||method==='Network.webSocketClosed'||method==='Network.webSocketFrameError'){
   log(method,{...p,url:safeText(p.url||'',4000)});
  }else if(method==='Network.webSocketFrameSent'||method==='Network.webSocketFrameReceived'){
   ST.checks.websocket='ok';const sent=method.endsWith('Sent');sent?ST.network.wsSent++:ST.network.wsReceived++;const response=p.response||{},text=frameText(response.payloadData,response.opcode),names=frameEventNames(text);const loggedText=/battleRewardResult/i.test(text)?safeText(text,3500):text;log(sent?'ws-sent':'ws-received',{requestId:p.requestId,opcode:response.opcode,mask:response.mask,payloadLength:String(response.payloadData||'').length,eventNames:names,text:loggedText});
   if(/interior:tide-sigil-hall/i.test(text)){if(ST.interiorId!=='tide-sigil-hall')log('interior-entered',{interiorId:'tide-sigil-hall',location:ST.probe?.location||null});ST.interiorId='tide-sigil-hall'}
   if(sent&&response.opcode===2){const mv=parseMove(response.payloadData);if(mv){ST.officialMoves++;ST.lastMoveAt=Date.now();ST.position={x:mv.x,z:mv.z,facing:mv.facing||null};ensureAutoMap(ST.zoneId,ST.probe?.location);learnCurrentTile('move');log('official-move',{...ST.position,zoneId:ST.zoneId,interiorId:ST.interiorId})}if(text.includes('wild:battleStarted')){ST.battleServerActive=true;ST.phase='battle';ST.lastBattleSeenAt=Date.now()}if(text.includes('wild:encounter')){ST.encounters++;ST.lastEncounterMove=ST.officialMoves;learnCurrentTile('encounter');log('encounter-request',{move:ST.officialMoves,position:ST.position})}}
   if(!sent&&response.opcode===2){const mv=parseMove(response.payloadData);if(mv){ST.officialMoves++;ST.lastMoveAt=Date.now();ST.position={x:mv.x,z:mv.z,facing:mv.facing||null};ensureAutoMap(ST.zoneId,ST.probe?.location);learnCurrentTile('move');log('official-move-received',{...ST.position,zoneId:ST.zoneId,interiorId:ST.interiorId})}if(/wild:battleStarted|trainer:battleStart|champion:battleStart/i.test(text)){if(/wild:battleStarted/i.test(text))learnCurrentTile('wild-battle');ST.battleServerActive=true;if(/trainer:battleStart|champion:battleStart/i.test(text)){ST.trainerMode='battle';log('trainer-battle-start',{trainer:ST.currentTrainer})}ST.phase='battle';ST.lastBattleSeenAt=Date.now();if(!ST.domBattleActive){ST.domBattleActive=true;ST.battles++;log('battle-start-ws',{eventNames:names})}else log('battle-start-ws-confirmed',{eventNames:names})}if(/battleVictory|battleRewardResult|victory/i.test(text)){if(/battleRewardResult/i.test(text)){ST.battleServerActive=false;ST.lastBattleRewardAt=Date.now()}if(ST.trainerMode==='battle'&&/trainer|champion|battleRewardResult/i.test(text))completeCurrentTrainer('victory');ST.wins++;ST.lastBattleOutcome='victory';log('battle-victory-ws',{eventNames:names})}if(/capture(?:Attempt|Started)|catch(?:Attempt|Started)|orb:use/i.test(text)){ST.captureAttempts++;log('wild-capture-attempt-ws',{eventNames:names})}if(names.includes('wild:captureResult')){const success=!/failed|escaped|broke free|success[^a-z]*false|ok[^a-z]*(?:false|0)/i.test(text);ST.capture.lastResult=success?'success':'failed';if(success){ST.captures++;ST.battleServerActive=false;ST.phase='world';ST.lastBattleRewardAt=Date.now();ST.lastBattleOutcome='capture';ST.lastActionSig='';log('battle-server-cleared-after-capture',{eventNames:names})}log(success?'wild-capture-success-ws':'wild-capture-failed-ws',{eventNames:names,text:safeText(text,1800)})}if(/battleEnd|battleEnded/i.test(text)){ST.battleServerActive=false;ST.phase='world';ST.domBattleActive=false;ST.lastBattleEndedAt=Date.now();ST.lastActionSig='';log('battle-end-ws',{eventNames:names})}}
  }else if(method==='Runtime.exceptionThrown')log('runtime-exception',{exceptionDetails:p.exceptionDetails});
  else if(method==='Runtime.consoleAPICalled')log('console',{type:p.type,args:(p.args||[]).map(a=>({type:a.type,subtype:a.subtype,value:safeText(a.value??a.description,MAX_CONSOLE_TEXT)})),stackTrace:p.stackTrace});
  else if(method==='Log.entryAdded')log('browser-log',{entry:{...p.entry,text:safeText(p.entry?.text,MAX_CONSOLE_TEXT),url:safeText(p.entry?.url,4000)}});
  else if(method==='Page.frameNavigated'||method==='Page.navigatedWithinDocument'||method==='Page.lifecycleEvent')log(method,p);
 }catch(e){log('debugger-event-error',{method,message:e.message,stack:e.stack})}
});
chrome.debugger.onDetach.addListener((src,reason)=>{if(src.tabId===ST.tabId){ST.attached=false;log('debugger-detached',{reason,desiredRunning:ST.desiredRunning});if(reason==='canceled_by_user'||ST.debuggerUnavailable){ST.inputMode='dom';ST.debuggerUnavailable=true;ST.checks.debugger='fallback';ST.lastError=null;if(ST.desiredRunning&&!ST.running&&!ST.userPaused){ST.running=true;clearTimeout(ST.timer);ST.timer=setTimeout(tick,40)}return}ST.checks.debugger='pending';ST.lastError=`Debugger desconectado: ${reason}`;if(ST.desiredRunning){clearTimeout(ST.timer);ST.timer=null;setTimeout(()=>ensureAttached(`debugger-detach:${reason}`).catch(()=>{}),900)}}});
chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab)=>{if(tabId!==ST.tabId)return;if(changeInfo.status==='loading'){ST.attached=false;ST.checks.content='pending';log('tab-reloading',{url:tab?.url||null})}if(changeInfo.status==='complete'&&ST.desiredRunning)setTimeout(()=>ensureAttached('tab-complete').catch(()=>{}),900)});
chrome.tabs.onRemoved.addListener(tabId=>{if(tabId===ST.tabId){ST.attached=false;ST.running=false;ST.lastError='A aba do Lumena foi fechada.';log('tab-closed',{tabId});persistRuntime().catch(()=>{})}});
chrome.alarms.onAlarm.addListener(a=>{if(a.name==='lumena-runtime-watchdog'){restoreRuntime('alarm-watchdog').then(()=>runtimeWatchdog('alarm-watchdog')).catch(()=>{})}});
chrome.runtime.onStartup.addListener(()=>restoreRuntime('browser-startup').catch(()=>{}));
chrome.runtime.onInstalled.addListener(()=>{chrome.alarms.create('lumena-runtime-watchdog',{periodInMinutes:1});restoreRuntime('extension-installed').catch(()=>{})});
chrome.alarms.create('lumena-runtime-watchdog',{periodInMinutes:1});
restoreRuntime('service-worker-evaluated').catch(()=>{});