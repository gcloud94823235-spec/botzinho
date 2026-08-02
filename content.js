(() => {
  let pageBridge={ok:false,position:null,zoneId:null,phase:null,confidence:0,at:0,diagnostics:null};
  addEventListener('message',e=>{
    const d=e.data;
    if(e.source!==window||!d||d.source!=='lumena-page-bridge')return;
    pageBridge={
      ok:!!d.ok,
      position:d.position&&Number.isFinite(+d.position.x)&&Number.isFinite(+d.position.z)?{x:+d.position.x,y:Number.isFinite(+d.position.y)?+d.position.y:null,z:+d.position.z}:null,
      zoneId:typeof d.zoneId==='string'?d.zoneId:null,phase:typeof d.phase==='string'?d.phase:null,
      currentScene:d.currentScene||null,transition:d.transition||null,activeInteriorId:d.activeInteriorId||null,
      encounter:d.encounter&&typeof d.encounter==='object'?d.encounter:null,
      battle:d.battle&&typeof d.battle==='object'?d.battle:null,
      confidence:Number(d.confidence)||0,stale:!!d.stale,candidate:d.candidate||null,
      diagnostics:d.diagnostics||null,at:Number(d.at)||Date.now()
    };
  },false);
  const V = el => { if (!el) return false; const r=el.getBoundingClientRect(),s=getComputedStyle(el); return r.width>3&&r.height>3&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0; };
  const R = v => String(v||'').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig,'[EMAIL REDACTED]').replace(/(password|token|secret|private[_ -]?key|mnemonic|seed)(\s*[:=]\s*)([^\s,;]+)/ig,'$1$2[REDACTED]');
  const T = el => R(el?.innerText||el?.textContent||el?.getAttribute?.('aria-label')||'').trim().replace(/\s+/g,' ');
  const I = el => { if(!el||!V(el))return null;const r=el.getBoundingClientRect();return{text:T(el).slice(0,300),disabled:!!el.disabled||el.getAttribute('aria-disabled')==='true',className:String(el.className||''),rect:{x:r.x,y:r.y,w:r.width,h:r.height,cx:r.x+r.width/2,cy:r.y+r.height/2}}; };
  const visible=(sel,limit=80)=>[...document.querySelectorAll(sel)].filter(V).slice(0,limit);
  const pp=s=>{const m=String(s).match(/(\d+)\s*(?:\/|of)\s*(\d+)/i);return m?{current:+m[1],max:+m[2]}:null};
  const meta=label=>{const n=String(label).replace(/\s+\d+\s*(?:\/|of)\s*\d+.*$/i,'').trim().toUpperCase();return(globalThis.LUMENA_MOVE_CATALOG||[]).find(m=>String(m.name||'').toUpperCase()===n)||null};
  const score=x=>{if(x.disabled||(x.pp&&x.pp.current<=0))return-1e9;const p=Number(x.meta?.power||0),a=Number(x.meta?.accuracy??100),c=String(x.meta?.category||'').toLowerCase();return(c==='status'?-1000:0)+p*Math.max(.1,a/100)+(x.pp?.current||0)/1000};
  function evolutionState(){
    const root=document.querySelector('.growth-overlay--evolution,[class*="growth-overlay--evolution"]');
    if(!root||!V(root))return{active:false,action:null,buttons:[]};
    const buttons=[...root.querySelectorAll('button,[role="button"]')].map(I).filter(Boolean);
    const primary=buttons.find(x=>!x.disabled&&(/evolve|evolution|yes|confirm/i.test(x.text)||/growth-overlay__evolution-button--primary/.test(x.className)))
      ||buttons.find(x=>!x.disabled&&/continue|next|done|finish|close|ok/i.test(x.text))
      ||buttons.find(x=>!x.disabled&&!/skip|cancel|no|later/i.test(x.text));
    return{active:true,action:primary?{kind:'evolution',target:primary}:null,buttons,text:T(root).slice(0,1200)};
  }

  function moveChoiceState(){
    const root=document.querySelector('.battle-move-choice,[class*="battle-move-choice"]');
    if(!root||!V(root))return{active:false,stage:null,newMove:null,currentMoves:[],confirm:null,keep:null,action:null};
    const confirm=[...root.querySelectorAll('.battle-move-choice__confirm-actions button,button,[role="button"]')].map(I).filter(Boolean).find(x=>!x.disabled&&/^confirm$/i.test(x.text));
    const keep=I(root.querySelector('.battle-move-choice__skip'))||[...root.querySelectorAll('button,[role="button"]')].map(I).filter(Boolean).find(x=>!x.disabled&&/keep current moves|keep this set|don\'t learn|do not learn/i.test(x.text));
    const newRoot=root.querySelector('.battle-move-choice__new-move,[aria-label="New move"]');
    const newText=T(newRoot), newName=T(newRoot?.querySelector('.battle-move-choice__move-name,[class*="move-name"]')) || newText.split(/\b(?:POWER|ACCURACY|PP)\b/i)[0].replace(/^New move\s*/i,'').trim();
    const newMeta=meta(newName)||meta(newText);
    const cards=[...root.querySelectorAll('.battle-move-choice__move--card,[aria-label="Current moves"] [role="button"],.battle-move-choice__moves article[role="button"]')].map(el=>({el,info:I(el)})).filter(x=>x.info).map(x=>{
      const name=T(x.el.querySelector('.battle-move-choice__move-name,[class*="move-name"]'))||x.info.text;
      const m=meta(name)||meta(x.info.text), q=pp(x.info.text), val=score({...x.info,meta:m,pp:q});
      return{...x.info,name,meta:m,pp:q,score:val};
    }).sort((a,b)=>a.score-b.score);
    if(confirm)return{active:true,stage:'confirm',newMove:{name:newName,meta:newMeta,text:newText},currentMoves:cards,confirm,keep,action:{kind:'move-choice-confirm',target:confirm}};
    const worst=cards[0]||null;
    const newScore=score({disabled:false,meta:newMeta,pp:null});
    let learn=!!worst;
    if(newMeta&&worst?.meta){
      const newPower=Number(newMeta.power||0), oldPower=Number(worst.meta.power||0);
      const newStatus=String(newMeta.category||'').toLowerCase()==='status', oldStatus=String(worst.meta.category||'').toLowerCase()==='status';
      learn = newScore>worst.score || (!newStatus&&oldStatus) || newPower>oldPower;
    }
    const action=learn&&worst?{kind:'move-choice-select',target:worst}:keep?{kind:'move-choice-keep',target:keep}:worst?{kind:'move-choice-select',target:worst}:null;
    return{active:true,stage:'select',newMove:{name:newName,meta:newMeta,text:newText,score:newScore},currentMoves:cards,confirm:null,keep,selected:worst,decision:learn?'replace':'keep',action};
  }
  function forcedSwitchState(text){
    const switchHeading=/CHOOSE YOUR NEXT LUMEN|SWAP IN WHICH LUMEN\??|choose your next lumen|swap in which lumen/i.test(text);
    const forced=!!(switchHeading||document.querySelector('.battle-team--forced,[class*="battle-team--forced"],.hud-menu__lumen-list,[class*="hud-menu__lumen"]'));
    if(!forced)return{forced:false,candidates:[],confirm:null,action:null};
    const confirm=[...document.querySelectorAll('button,[role="button"]')].map(I).filter(Boolean).find(x=>!x.disabled&&/^(swap lumens?|switch lumens?|choose|select|confirm)$/i.test(x.text));
    if(confirm)return{forced:true,candidates:[],confirm,action:{kind:'forced-switch-confirm',target:confirm}};
    const roots=[...document.querySelectorAll('.battle-team--forced,[class*="battle-team--forced"],.battle-team,[class*="battle-team"],.hud-menu,[class*="hud-menu"]')].filter(V),seen=new Set(),els=[];
    for(const root of roots)for(const el of root.querySelectorAll('button,[role="button"],[tabindex],li,[class*="member"],[class*="slot"],[class*="card"],[class*="row"],.hud-menu__lumen-row')){if(seen.has(el)||!V(el))continue;seen.add(el);els.push(el)}
    if(!els.length)for(const el of document.querySelectorAll('button,[role="button"],.hud-menu__lumen-row'))if(V(el)&&/\d+\s*\/\s*\d+/.test(T(el)))els.push(el);
    const candidates=els.map(I).filter(Boolean).map(x=>{
      const raw=String(x.text||'').replace(/\s+/g,' ').trim();
      const hp=raw.match(/(\d+)\s*\/\s*(\d+)/),cur=hp?Number(hp[1]):null,max=hp?Number(hp[2]):null;
      const lvl=Number(raw.match(/Lv\.?\s*(\d+)/i)?.[1]||0);
      const inBattle=/\bIN\s+BATTLE\b/i.test(raw);
      const fainted=/\bFNT\b/i.test(raw)||cur===0;
      const eligible=Number.isFinite(cur)&&Number.isFinite(max)&&max>0&&cur>0&&!inBattle&&!fainted&&!x.disabled;
      return{...x,text:raw,hp:hp?{current:cur,max,ratio:max?cur/max:0}:null,level:lvl,inBattle,fainted,eligible,bad:!eligible,score:eligible?((cur/max)*1000+cur+lvl/100):-1e9};
    }).filter(x=>x.hp).sort((a,b)=>b.score-a.score);
    const unique=[];const seenRows=new Set();
    for(const x of candidates){const key=`${Math.round(x.rect?.cx||0)}:${Math.round(x.rect?.cy||0)}:${x.text}`;if(seenRows.has(key))continue;seenRows.add(key);unique.push(x)}
    const target=unique.find(x=>x.eligible)||null;
    return{forced:true,candidates:unique,confirm:null,action:target?{kind:'forced-switch-select',target}:null};
  }
  function captureState(){
    const buttons=[...document.querySelectorAll('button,[role="button"]')].map(I).filter(Boolean);
    const body=T(document.body).slice(0,2600);
    const overlay=[...document.querySelectorAll('.battle-item-overlay,[class*="battle-item-overlay"],[class*="item-overlay"]')].find(V)||null;
    const overlayText=T(overlay).slice(0,2200);
    const blockedTrainer=/cannot capture|can(?:not|'t) capture.*trainer|trainer(?:'s)? lumen|trainer battle|challenged you/i.test(overlayText||body);
    const itemButton=buttons.find(x=>!x.disabled&&/^(item|items|bag)$/i.test(x.text))||buttons.find(x=>!x.disabled&&/battle-action-button--item|item-button/i.test(x.className));
    const lanternButtons=buttons.filter(x=>!x.disabled&&/lantern/i.test(x.text));
    const wisp=lanternButtons.find(x=>/wisp lantern/i.test(x.text))||null;
    const aurora=lanternButtons.find(x=>/aurora lantern/i.test(x.text))||null;
    const throwButton=buttons.find(x=>!x.disabled&&/^(use|throw|confirm|capture)$/i.test(x.text))||null;
    const backButton=buttons.find(x=>!x.disabled&&/^back$/i.test(x.text)&&/battle-item-overlay__back|item-overlay/i.test(x.className))||buttons.find(x=>!x.disabled&&/^back$/i.test(x.text))||null;
    const hpTexts=[...document.querySelectorAll('[class*="enemy"],[class*="opponent"],[class*="battle"]')].filter(V).map(T).join(' | ');
    let enemyHpRatio=null;
    const percentMatches=[...(overlayText||body).matchAll(/(?:HP\s*)?(\d{1,3})\s*%/ig)].map(m=>+m[1]).filter(n=>n>=0&&n<=100);
    if(percentMatches.length)enemyHpRatio=percentMatches[0]/100;
    if(enemyHpRatio==null){const pm=hpTexts.match(/(?:enemy|wild|opponent)[\s\S]{0,160}?(\d{1,3})\s*%/i)||body.match(/(?:enemy|wild|opponent)[\s\S]{0,160}?(\d{1,3})\s*%/i);if(pm)enemyHpRatio=Math.max(0,Math.min(1,+pm[1]/100));}
    if(enemyHpRatio==null){const frac=[...hpTexts.matchAll(/(\d+)\s*\/\s*(\d+)/g)].map(m=>({cur:+m[1],max:+m[2]})).filter(x=>x.max>0&&x.cur<=x.max);if(frac.length>1)enemyHpRatio=frac[0].cur/frac[0].max;}
    let stage='weaken';
    if(overlay){
      if(lanternButtons.length)stage='select-lantern';
      else if(throwButton)stage='throw';
      else if(backButton)stage='no-lantern';
      else stage='select-lantern';
    }else if(itemButton)stage='open-bag';
    const recommended=aurora||wisp||lanternButtons[0]||null;
    return{active:!!(overlay||itemButton),stage,blockedTrainer,bagButton:itemButton,wisp,aurora,recommended,throwButton,backButton,noLantern:!!(overlay&&!lanternButtons.length&&!throwButton),enemyHpRatio,overlayText,text:(overlayText||body).slice(0,1800)};
  }
  function battleState(){
    const moveChoice=moveChoiceState(),capture=captureState();
    const fight=I(document.querySelector('.battle-action-button--fight')),advance=I(document.querySelector('.battle-ui__advance-catcher')),switchRoot=document.querySelector('.battle-switch-prompt');
    const switchOptions=switchRoot&&V(switchRoot)?[...switchRoot.querySelectorAll('button,[role="button"]')].map(I).filter(Boolean):[];
    const moves=[...document.querySelectorAll('.battle-move-button')].map(el=>({el,info:I(el)})).filter(x=>x.info).map(x=>({...x.info,pp:pp(x.info.text),meta:meta(x.info.text)})).sort((a,b)=>score(b)-score(a));
    const text=String(document.body?.innerText||''),forcedSwitch=forcedSwitchState(text),allFainted=!!(forcedSwitch.forced&&forcedSwitch.candidates.length&&forcedSwitch.candidates.every(x=>x.bad)&&!forcedSwitch.confirm),active=!!(moveChoice.active||fight||advance||switchOptions.length||moves.length||forcedSwitch.forced||document.querySelector('[class*="battle-ui"]'));
    // Enemy and ally HUDs can both contain a shiny star. Always scope visual
    // shiny detection to the enemy HUD only.
    const explicitEnemyRoot=
      document.querySelector('.battle-monster-hud--enemy')||
      document.querySelector('[class~="battle-monster-hud--enemy"]');

    const enemyCandidates=[...document.querySelectorAll(
      '.battle-monster-hud--enemy,[class*="enemy-hud"],[class*="opponent-hud"],[data-side="enemy"],[data-team="enemy"]'
    )].filter(el=>V(el)&&/Lv\.?\s*\d+|HP/i.test(T(el)));

    const enemyRoot=explicitEnemyRoot&&V(explicitEnemyRoot)
      ? explicitEnemyRoot
      : enemyCandidates[0]||null;

    // Never fall back to document.body here: the player's own shiny name is
    // also present in the battle text and caused false positives.
    const enemyText=enemyRoot?T(enemyRoot):'';
    let enemyNameRaw=T(enemyRoot?.querySelector(
      '.battle-monster-hud__name,[class*="monster-name"],[class*="enemy-name"],[class*="name"],h2,h3,strong'
    ));
    if(!enemyNameRaw&&enemyText){
      const lines=enemyText.split(/\n+/).map(x=>x.trim()).filter(Boolean);
      enemyNameRaw=lines.find(x=>
        !/^Lv\.?\s*\d+/i.test(x)&&
        !/^HP$/i.test(x)&&
        !/^\d{1,3}%$/.test(x)&&
        !/^\d+\s*\/\s*\d+$/.test(x)
      )||null;
      if(!enemyNameRaw){
        const m=enemyText.match(/(?:Lv\.?\s*\d+\s*)?([A-Z][A-Za-z0-9'_-]{2,24}(?:\s*✨)?)/);
        enemyNameRaw=m?m[1]:null;
      }
    }
    const officialEncounter=pageBridge?.encounter||null;
    const officialEnemy=pageBridge?.battle?.enemy||null;
    const shinyFromEncounter=
      officialEncounter?.shiny===true||
      officialEncounter?.shinyRaw===true||
      officialEncounter?.isShinyRaw===true;
    const shinyFromState=officialEnemy?.shiny===true||officialEnemy?.shinyRaw===true||officialEnemy?.isShinyRaw===true;
    const shinyFromStar=!!(
      enemyRoot&&(
        /✨|\u2728/.test(String(enemyNameRaw||'')) ||
        /✨|\u2728/.test(String(enemyText||''))
      )
    );
    const shiny=!!(shinyFromEncounter||shinyFromState||shinyFromStar);
    const sources=[
      shinyFromEncounter?'wild-encounter-result':null,
      shinyFromState?'battle-state':null,
      shinyFromStar?'name-star':null
    ].filter(Boolean);
    const shinySource=sources.length?sources.join('+'):null;
    const enemyName=String(enemyNameRaw||officialEnemy?.name||'')
      .replace(/✨|\u2728/g,'')
      .replace(/[♀♂]/g,'')
      .trim()||null;
    const trainerBattle=/trainer battle|challenged you|trainer(?:'s)? lumen|champion|adept/i.test(text);
    let action=null;if(moveChoice.action)action=moveChoice.action;else if(forcedSwitch.action)action=forcedSwitch.action;else if(switchOptions.length)action={kind:'switch',target:switchOptions.find(x=>!x.disabled&&!/back|cancel/i.test(x.text))||switchOptions.find(x=>!x.disabled)||null};else if(advance&&!advance.disabled)action={kind:'advance',target:advance};else if(moves.some(x=>!x.disabled&&(!x.pp||x.pp.current>0)))action={kind:'move',target:moves.find(x=>!x.disabled&&(!x.pp||x.pp.current>0))};else if(fight&&!fight.disabled)action={kind:'fight',target:fight};else{const g=[...document.querySelectorAll('button,[role="button"]')].map(I).filter(Boolean).find(x=>!x.disabled&&/continue|next|ok|claim|close/i.test(x.text));if(g)action={kind:'continue',target:g}}
    return{active,allFainted,moveChoice,capture,fight,advance,switchOptions,forcedSwitch,moves:moves.map(({el,...x})=>({...x,score:score(x)})),enemyHudFound:!!enemyRoot,enemyHudClass:enemyRoot?.className||null,enemyName,enemyNameRaw,enemySpeciesId:officialEnemy?.speciesId||officialEncounter?.speciesId||null,enemyForm:officialEnemy?.form??officialEncounter?.form??null,enemyGender:officialEnemy?.gender||officialEncounter?.gender||null,encounterRequestId:officialEncounter?.requestId||null,encounterMethod:officialEncounter?.method||null,encounterZoneId:officialEncounter?.zoneId||null,shiny,shinySource,shinyFromEncounter,shinyFromState,shinyFromStar,enemyText:enemyText.slice(0,900),trainerBattle,action,text:text.slice(0,1800)};
  }

  function safeField(el){
    const type=String(el.type||el.getAttribute('type')||'').toLowerCase();
    const sensitive=type==='password'||/password|token|secret|private|mnemonic|seed/i.test(`${el.name||''} ${el.id||''} ${el.autocomplete||''}`);
    const value=String(el.value||'');
    return{tag:el.tagName.toLowerCase(),type,name:String(el.name||''),id:String(el.id||''),placeholder:String(el.placeholder||'').slice(0,200),autocomplete:String(el.autocomplete||''),required:!!el.required,disabled:!!el.disabled,checked:'checked'in el?!!el.checked:undefined,value:sensitive?'[REDACTED]':(type==='email'?'[EMAIL REDACTED]':value.slice(0,120)),valueLength:value.length};
  }
  function uiState(){
    const dialogs=visible('[role="dialog"],dialog,[class*="modal"],[class*="overlay"],[class*="popup"]').map(el=>({text:T(el).slice(0,1800),className:String(el.className||''),buttons:[...el.querySelectorAll('button,[role="button"]')].map(I).filter(Boolean).slice(0,30)})).slice(0,20);
    const headings=visible('h1,h2,h3,[role="heading"]',40).map(T).filter(Boolean).slice(0,40);
    const buttons=visible('button,[role="button"],a[href]',120).map(I).filter(Boolean).slice(0,120);
    const forms=visible('form',20).map(form=>({action:String(form.action||''),method:String(form.method||''),text:T(form).slice(0,1200),fields:[...form.querySelectorAll('input,select,textarea')].slice(0,50).map(safeField)}));
    const inputs=visible('input,select,textarea',80).map(safeField);
    const alerts=visible('[role="alert"],[aria-live],[class*="toast"],[class*="notification"],[class*="error"],[class*="success"]',40).map(el=>({text:T(el).slice(0,1200),className:String(el.className||'')}));
    return{headings,dialogs,buttons,forms,inputs,alerts,route:{href:location.href,pathname:location.pathname,search:location.search,hash:location.hash}};
  }

  function genericDialogState(){
    const roots=visible('[role="dialog"],dialog,[class*="dialog"],[class*="modal"],[class*="overlay"],[class*="textbox"],[class*="speech"]');
    const root=roots.find(el=>{
      if(el.closest('#lumena-bot-hud'))return false;
      const cls=String(el.className||'').toLowerCase(),txt=T(el);
      if(!txt||txt.length<2)return false;
      if(/battle|move-choice|capture|bag|inventory|evolution|gacha|capsule|incubat|settings|leaderboard|trade|chat/i.test(cls))return false;
      if(/wants to learn a new move|choose a move to forget|swap in which lumen|choose your next lumen/i.test(txt))return false;
      const r=el.getBoundingClientRect();
      return r.width>=180&&r.height>=60;
    })||null;
    if(!root)return{active:false,action:null,text:null,buttons:[]};
    const buttons=[...root.querySelectorAll('button,[role="button"]')].map(I).filter(Boolean).filter(x=>!x.disabled);
    const safe=buttons.find(x=>/^(?:continue|next|ok|okay|confirm|accept|yes|close|done|proceed|talk|interact)$/i.test(x.text))||buttons.find(x=>/continue|next|confirm|accept|close|proceed/i.test(x.text));
    const rootTarget=I(root),text=T(root).slice(0,2200);
    const choiceRequired=buttons.length>1&&!safe;
    const action=safe?{kind:'npc-dialog-button',target:safe}:(!choiceRequired&&rootTarget?{kind:'npc-dialog-advance',target:rootTarget}:null);
    return{active:true,action,text,buttons,choiceRequired};
  }
  function trainerState(){
    const text=R(document.body?.innerText||'');
    const roots=visible('[role="dialog"],dialog,[class*="modal"],[class*="overlay"],[class*="dialog"]');
    const root=roots.find(el=>{
      const t=T(el);
      const cls=String(el.className||'');
      return /trainer|challenge|battle|rematch|pixels|scout|rook|angler|rival|champion|adept/i.test(t)||/dialog.*(?:npc|trainer)|(?:npc|trainer).*dialog/i.test(cls);
    })||null;
    const buttons=root?[...root.querySelectorAll('button,[role="button"]')].map(I).filter(Boolean):[];
    const challenge=buttons.find(x=>!x.disabled&&/challenge|battle|fight|rematch|start/i.test(x.text))||null;
    const close=buttons.find(x=>!x.disabled&&/close|cancel|back|leave/i.test(x.text))||null;
    const rootTarget=root?I(root):null;
    const rootText=root?T(root).slice(0,1600):null;
    const isNarrative=!!(root&&rootTarget&&!challenge&&!close&&rootText&&rootText.length>2);
    const action=challenge?{kind:'trainer-challenge',target:challenge}:isNarrative?{kind:'trainer-dialog-advance',target:rootTarget}:null;
    return{active:!!root,action,text:rootText,detected:/trainer|rematch|daily battle/i.test(text),dialog:isNarrative,buttons};
  }
  function gachaState(){
    const roots=visible('[role="dialog"],dialog,[class*="modal"],[class*="overlay"],[class*="capsule"],[class*="gacha"]');
    const root=roots.find(el=>/capsule core|gacha|pull|hold|press and hold/i.test(T(el)))||null;
    if(!root)return{active:false};
    const candidates=[...root.querySelectorAll('button,[role="button"],[class*="pull"],[class*="hold"],[tabindex]')].map(I).filter(Boolean);
    const target=candidates.find(x=>!x.disabled&&/pull|hold|press|free/i.test(x.text))||candidates.find(x=>!x.disabled)||null;
    const text=T(root).slice(0,1800);
    return{active:true,target:target?{kind:'gacha-hold',target}:null,ready:/release|ready|complete|100%/i.test(text),result:/obtained|received|reward|you got/i.test(text),text};
  }
  function incubatorState(){
    const roots=visible('[role="dialog"],dialog,[class*="modal"],[class*="overlay"],[class*="incubat"],[class*="hatch"]');
    const root=roots.find(el=>/incubat|crystal|hatch/i.test(T(el)))||null;
    if(!root)return{active:false};
    const buttons=[...root.querySelectorAll('button,[role="button"]')].map(I).filter(Boolean);
    const action=buttons.find(x=>!x.disabled&&/incubat|start|place|select crystal|hatch|open/i.test(x.text))||null;
    return{active:true,action:action?{kind:'incubator',target:action}:null,text:T(root).slice(0,1800)};
  }
  function casinoState(){
    const root=[...document.querySelectorAll('.overlay-ui--casino-slots,.overlay-ui--casino,[class*="overlay-ui--casino"],.casino-ui')].find(V)||null;
    if(!root)return{active:false,game:null,spinning:false,chips:null,bet:null,spin:null,betAction:null,statusText:null};
    const text=T(root).slice(0,2200);
    const game=/\bSLOTS\b/i.test(text)||root.matches('.overlay-ui--casino-slots')?'slots':/\bROULETTE\b/i.test(text)?'roulette':/\bBLACKJACK\b/i.test(text)?'blackjack':'casino';
    const buttons=[...root.querySelectorAll('button,[role="button"]')].map(I).filter(Boolean);
    const spin=buttons.find(x=>/casino-ui__action--spin/.test(x.className)||/^SPIN\s*\(/i.test(x.text)||/^SPIN$/i.test(x.text))||null;
    const statusEl=root.querySelector('.casino-ui__slot-status,[role="status"]');
    const statusText=T(statusEl)||null;
    const spinning=!!(statusText&&/spinning/i.test(statusText))||!!(spin?.disabled&&/spinning/i.test(text));
    const chipText=T(root.querySelector('.overlay-ui__chip--gold,.casino-ui__chip-count,.casino-ui__chips'));
    const chipMatch=chipText.match(/([\d.,]+)/);
    const chips=chipMatch?Number(chipMatch[1].replace(/\./g,'').replace(',','.')):null;
    const betButtons=[...root.querySelectorAll('.casino-ui__bet')].filter(V).map(el=>({el,info:I(el),value:Number(T(el).match(/\d+/)?.[0]||0),active:el.classList.contains('casino-ui__bet--active')})).filter(x=>x.info&&x.value>0);
    const activeBet=betButtons.find(x=>x.active)?.value||Number(spin?.text?.match(/SPIN\s*\((\d+)\)/i)?.[1]||0)||null;
    return{active:true,game,spinning,chips,bet:activeBet,spin:spin?{kind:'casino-spin',target:spin}:null,betButtons:betButtons.map(x=>({...x.info,value:x.value,active:x.active})),statusText,text};
  }
  function snapshot(){const loc=I(document.querySelector('.hud__location-button')),evolution=evolutionState(),canvases=[...document.querySelectorAll('canvas')].map(c=>{const r=c.getBoundingClientRect();return{w:c.width,h:c.height,rect:{x:r.x,y:r.y,w:r.width,h:r.height}}});return{url:location.href,title:document.title,focused:document.hasFocus(),visibility:document.visibilityState,location:loc?.text||null,bridge:{...pageBridge},play:playState(),evolution,battle:battleState(),dialog:genericDialogState(),trainer:trainerState(),gacha:gachaState(),incubator:incubatorState(),casino:casinoState(),ui:uiState(),canvases,bodyText:R(document.body?.innerText||'').slice(0,12000)}}
  function findMoveChoiceElement(kind,targetText=''){
    const root=document.querySelector('.battle-move-choice,[class*="battle-move-choice"]');
    if(!root)return null;
    const all=[...root.querySelectorAll('button,[role="button"],.battle-move-choice__move--card,[class*="battle-move-choice__move--card"]')];
    if(kind==='move-choice-confirm')return all.find(el=>/^confirm$/i.test(T(el))&&!el.disabled)||null;
    if(kind==='move-choice-keep')return root.querySelector('.battle-move-choice__skip')||all.find(el=>/keep current moves|keep this set|don\'t learn|do not learn/i.test(T(el)))||null;
    if(kind==='move-choice-select'){
      const wanted=String(targetText||'').replace(/\s+/g,' ').trim().slice(0,120);
      return all.find(el=>T(el)===wanted)||all.find(el=>wanted&&T(el).includes(wanted.slice(0,50)))||null;
    }
    return null;
  }
  function scrollMoveChoiceTarget(kind,targetText){
    const root=document.querySelector('.battle-move-choice,[class*="battle-move-choice"]');
    const el=findMoveChoiceElement(kind,targetText);
    if(!root||!el)return{ok:false,error:'move-choice-target-not-found'};
    const scrollers=[root,...root.querySelectorAll('*')].filter(x=>{
      try{const cs=getComputedStyle(x);return /(auto|scroll)/.test(cs.overflowY||'')&&x.scrollHeight>x.clientHeight+8}catch{return false}
    });
    if(kind==='move-choice-confirm')for(const sc of scrollers)sc.scrollTop=sc.scrollHeight;
    try{el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})}catch{el.scrollIntoView()}
    const r=el.getBoundingClientRect();
    const inView=r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
    return{ok:true,target:I(el),inView,viewport:{w:innerWidth,h:innerHeight},scrollTop:scrollers.map(x=>x.scrollTop).slice(0,6)};
  }

  const spotRouteRecorder={
    zone:null,route:[],held:new Map(),startedAt:Date.now(),fromEntry:false,origin:'content-load'
  };
  function currentZoneLabel(){
    return T(document.querySelector('.hud__location-button'))||null;
  }
  function resetSpotRouteRecorder(reason='zone-change'){
    spotRouteRecorder.zone=currentZoneLabel();
    spotRouteRecorder.route=[];
    spotRouteRecorder.held.clear();
    spotRouteRecorder.startedAt=Date.now();
    spotRouteRecorder.fromEntry=reason==='zone-change';
    spotRouteRecorder.origin=reason;
  }
  addEventListener('keydown',e=>{
    if(!e.isTrusted||e.repeat||!['KeyW','KeyA','KeyS','KeyD'].includes(e.code))return;
    if(!spotRouteRecorder.held.has(e.code))spotRouteRecorder.held.set(e.code,{at:performance.now(),key:e.key.toLowerCase()});
  },true);
  addEventListener('keyup',e=>{
    if(!e.isTrusted||!['KeyW','KeyA','KeyS','KeyD'].includes(e.code))return;
    const held=spotRouteRecorder.held.get(e.code);if(!held)return;
    spotRouteRecorder.held.delete(e.code);
    const ms=Math.max(20,Math.min(1200,Math.round(performance.now()-held.at)));
    spotRouteRecorder.route.push({code:e.code,key:held.key,ms});
    if(spotRouteRecorder.route.length>1000)spotRouteRecorder.route.shift();
  },true);
  let lastRecorderZone=null;
  setInterval(()=>{
    const z=currentZoneLabel();
    if(z&&lastRecorderZone&&z!==lastRecorderZone)resetSpotRouteRecorder('zone-change');
    if(z&&!lastRecorderZone){spotRouteRecorder.zone=z;lastRecorderZone=z}
    else if(z)lastRecorderZone=z;
  },350);

  chrome.runtime.onMessage.addListener((m,_s,reply)=>{
    if(m?.type==='probe'){reply({ok:true,snapshot:snapshot(),catalogs:{moves:(globalThis.LUMENA_MOVE_CATALOG||[]).length,maps:Object.keys(globalThis.LUMENA_MAP_CATALOG||{}).length}});return true}
    if(m?.type==='spot-capture-route'){
      for(const [code,held] of spotRouteRecorder.held){
        const ms=Math.max(20,Math.min(1200,Math.round(performance.now()-held.at)));
        spotRouteRecorder.route.push({code,key:held.key,ms});
      }
      spotRouteRecorder.held.clear();
      reply({ok:true,zone:currentZoneLabel(),route:spotRouteRecorder.route.slice(),routeFromEntry:spotRouteRecorder.fromEntry,routeOrigin:spotRouteRecorder.origin});
      return true;
    }
    if(m?.type==='input-key'){
      try{
        const type=m.down?'keydown':'keyup';
        const opts={key:m.key,code:m.code,bubbles:true,cancelable:true,composed:true,repeat:false};
        const targets=[window,document,document.body,document.querySelector('canvas')].filter(Boolean);
        for(const target of targets)target.dispatchEvent(new KeyboardEvent(type,opts));
        reply({ok:true});
      }catch(e){reply({ok:false,error:e.message})}
      return true;
    }
    if(m?.type==='input-click'){
      try{
        const t=m.target||{},r=t.rect||{},x=Number(r.cx),y=Number(r.cy);
        let el=Number.isFinite(x)&&Number.isFinite(y)?document.elementFromPoint(x,y):null;
        if(!el&&t.text){el=[...document.querySelectorAll('button,[role=button],a,input')].find(x=>T(x)===T({innerText:t.text}))}
        if(!el)throw Error('Elemento do clique não encontrado');
        fireClick(el);reply({ok:true});
      }catch(e){reply({ok:false,error:e.message})}
      return true;
    }
    if(m?.type==='ensure-action-visible'){
      const result=scrollMoveChoiceTarget(m.kind,m.targetText);
      setTimeout(()=>reply(result),90);
      return true;
    }
  });

  function installLumenaBotHud(){
    if(document.getElementById('lumena-bot-hud'))return;
    const host=document.createElement('div');host.id='lumena-bot-hud';host.innerHTML=`<style>
#lumena-bot-hud{position:fixed;right:14px;top:110px;z-index:2147483647;width:270px;font:13px Arial;color:#eef7ff;background:rgba(5,24,40,.94);border:1px solid #4b7b9b;border-radius:10px;box-shadow:0 8px 30px #0008;user-select:none}#lumena-bot-hud .h{padding:9px 10px;background:#0d3855;border-radius:10px 10px 0 0;font-weight:bold;cursor:move;display:flex;justify-content:space-between}#lumena-bot-hud .b{padding:10px}#lumena-bot-hud label{display:block;margin:7px 0}#lumena-bot-hud input[type=number]{width:100%;box-sizing:border-box;background:#102f49;color:#fff;border:1px solid #507d99;border-radius:5px;padding:5px}#lumena-bot-hud .r{display:flex;gap:5px}#lumena-bot-hud button{flex:1;border:0;border-radius:6px;padding:8px;color:white;background:#365f7d;font-weight:bold;cursor:pointer}#lumena-bot-hud .go{background:#15945f}#lumena-bot-hud .stop{background:#a63b48}#lumena-bot-hud .status{margin-top:7px;padding:7px;background:#071a2a;border-radius:6px;font-size:12px}#lumena-bot-hud .toggle{margin-top:8px;width:100%;text-align:left;background:#173d58}#lumena-bot-hud .settings{display:none;margin-top:7px;padding:7px;background:#0b263b;border-radius:6px}#lumena-bot-hud.open .settings{display:block}#lumena-bot-hud.min .b{display:none}</style><div class="h"><span>Lumena Bot v7.7.2</span><span id="lbh-min">—</span></div><div class="b"><div class="r"><button id="lbh-start" class="go">Play</button><button id="lbh-pause">Pause</button><button id="lbh-stop" class="stop">Parar</button></div><div class="r" style="margin-top:6px"><button id="lbh-select-tile" style="background:#7a5a18">Select Tile</button><button id="lbh-clear-tile">Limpar Tile</button></div><div id="lbh-tile-status" class="status">Nenhum tile selecionado neste mapa</div><div id="lbh-status" class="status">Carregando…</div><button id="lbh-toggle" class="toggle">▶ Configurações</button><div class="settings"><label><input id="lbh-play" type="checkbox" checked> Entrar automaticamente no PLAY</label><label><input id="lbh-battle" type="checkbox" checked> Batalha automática</label><label><input id="lbh-smooth" type="checkbox" checked> Caminhada suave</label><label><input id="lbh-trainers" type="checkbox"> Treinadores diários do mapa</label><div style="margin:7px 0;padding:7px;background:#071a2a;border-radius:6px"><b>Pausar em encontro wild</b><label><input id="lbh-tier-s" type="checkbox"> Tier S</label><label><input id="lbh-tier-a" type="checkbox"> Tier A</label><label><input id="lbh-tier-b" type="checkbox" checked> Tier B</label><label><input id="lbh-shiny" type="checkbox" checked> ✨ Shiny</label></div><label><input id="lbh-capture" type="checkbox" checked> Captura wild</label><label><input id="lbh-capture-shiny-only" type="checkbox" checked> Capturar Shiny com 100% HP ✨</label><label>HP para captura <input id="lbh-hp" type="number" min="1" max="100" value="30"></label><label><input id="lbh-return" type="checkbox" checked> Voltar após wipe</label><details id="lbh-casino" style="margin-top:8px"><summary style="cursor:pointer;font-weight:bold">Volt Casino — Slots</summary><label><input id="lbh-auto-slots" type="checkbox"> Auto Spin (abrir slots manualmente)</label><label>Aposta <input id="lbh-slot-bet" type="number" min="1" max="3" value="1"></label><label>Máximo de spins <input id="lbh-slot-max" type="number" min="1" max="100000" value="100"></label><label>Parar com saldo mínimo <input id="lbh-slot-min" type="number" min="0" value="0"></label><div id="lbh-slot-status" class="status">Slots aguardando</div></details><details id="lbh-diag" style="margin-top:8px"><summary style="cursor:pointer;font-weight:bold">Diagnóstico</summary><label><input id="lbh-full-diag" type="checkbox"> Diagnóstico completo</label><label>Exportar a cada (min) <input id="lbh-diag-min" type="number" min="1" max="120" value="5"></label><label><input id="lbh-net" type="checkbox" checked> Metadados de rede</label><label><input id="lbh-dom" type="checkbox" checked> Snapshots do DOM</label><div class="r" style="margin-top:6px"><button id="lbh-export">Exportar</button><button id="lbh-shot">Screenshot</button><button id="lbh-clear">Limpar</button></div><div id="lbh-diag-status" class="status">Diagnóstico pronto</div></details></div></div>`;document.documentElement.appendChild(host);
    const q=id=>host.querySelector('#'+id);let drag=false,dx=0,dy=0;host.querySelector('.h').onmousedown=e=>{if(e.target.id==='lbh-min')return;drag=true;dx=e.clientX-host.offsetLeft;dy=e.clientY-host.offsetTop};addEventListener('mousemove',e=>{if(drag){host.style.left=(e.clientX-dx)+'px';host.style.top=(e.clientY-dy)+'px';host.style.right='auto'}});addEventListener('mouseup',()=>drag=false);q('lbh-min').onclick=()=>host.classList.toggle('min');q('lbh-toggle').onclick=()=>{host.classList.toggle('open');q('lbh-toggle').textContent=host.classList.contains('open')?'▼ Configurações':'▶ Configurações'};
    const config=()=>({autoEnterPlay:q('lbh-play').checked,movement:true,battle:q('lbh-battle').checked,smoothMovement:q('lbh-smooth').checked,dailyTrainers:q('lbh-trainers').checked,trainersBeforeFarm:false,pauseTierS:q('lbh-tier-s').checked,pauseTierA:q('lbh-tier-a').checked,pauseTierB:q('lbh-tier-b').checked,pauseShiny:q('lbh-shiny').checked,autoCaptureWild:q('lbh-capture').checked,captureOnlyShiny:q('lbh-capture-shiny-only').checked,captureHpPercent:+q('lbh-hp').value||30,lanternPreference:'auto',captureRetries:3,localFarmMode:true,moveToFarmMap:false,stayOnFarmMap:false,returnAfterWipe:q('lbh-return').checked,autoSlots:q('lbh-auto-slots').checked,slotBet:Math.max(1,Math.min(3,+q('lbh-slot-bet').value||1)),slotMaxSpins:Math.max(1,+q('lbh-slot-max').value||100),slotMinChips:Math.max(0,+q('lbh-slot-min').value||0),tutorial:false,followQuests:false,autoGacha:false,autoIncubator:false,recordVideo:false,fullDiagnostic:q('lbh-full-diag').checked,diagnosticMinutes:+q('lbh-diag-min').value||5,networkMetadata:q('lbh-net').checked,domSnapshots:q('lbh-dom').checked});
    async function cmd(m){try{const r=await chrome.runtime.sendMessage(m);if(!r?.ok)throw Error(r?.error||'Falha');paint(r.status);return r}catch(e){q('lbh-status').textContent='Erro: '+e.message}}
    function paint(s={}){const mode=s.specialPause?(s.specialPause.shiny?`PAUSADO: ✨ SHINY ${s.specialPause.name||'?'}`:`PAUSADO: ${s.specialPause.name||'?'} Tier ${s.specialPause.tier||'?'}`):s.userPaused?'Pausado':s.recovering?'Recuperando':s.trainerMode&&s.trainerMode!=='idle'&&s.trainerMode!=='complete'?`Treinador: ${s.currentTrainer?.name||s.trainerMode}`:s.respawnReturnActive?'Voltando após wipe':s.running?'Ativo':'Parado';q('lbh-status').textContent=`${mode} · ${s.location||s.zoneId||'aguardando mapa'} · B:${s.battles||0} V:${s.wins||0} C:${s.captures||0}`;if(q('lbh-diag-status'))q('lbh-diag-status').textContent=`Eventos: ${s.totalEvents||0} · HTTP: ${s.network?.requests||0} · WS: ${s.network?.wsReceived||0} · Mapas: ${s.catalog?.total||0}`;if(q('lbh-slot-status')){const c=s.casino||{};q('lbh-slot-status').textContent=c.active?`Slots: ${c.spins||0}/${c.maxSpins||0} · saldo ${c.chips??'?'} · ${c.lastResult||c.statusText||'pronto'}`:'Slots aguardando abertura manual'}if(q('lbh-tile-status')){const p=s.selectedSpot;q('lbh-tile-status').textContent=p?`Tile salvo: ${p.zoneId} · retorno ${p.position?'posição absoluta':'posição indisponível'}`:'Nenhum tile selecionado neste mapa'}}
    q('lbh-select-tile').onclick=async()=>{const r=await cmd({type:'select-tile'});if(r?.spot)q('lbh-tile-status').textContent=`Tile salvo em ${r.spot.location||r.spot.zoneId}`};q('lbh-clear-tile').onclick=()=>cmd({type:'clear-selected-tile'});q('lbh-start').onclick=async()=>{const c=config();await chrome.storage.local.set({lumenaCoreConfig:c});const st=await cmd({type:'status'});if(st?.status?.desiredRunning||st?.status?.userPaused||st?.status?.specialPause)cmd({type:'resume'});else cmd({type:'start',config:c})};q('lbh-pause').onclick=()=>cmd({type:'pause'});q('lbh-stop').onclick=()=>cmd({type:'stop'});q('lbh-export').onclick=async()=>{const r=await cmd({type:'export'});if(r?.filename)q('lbh-diag-status').textContent='Salvo: '+r.filename.split('/').pop()};q('lbh-shot').onclick=async()=>{const r=await cmd({type:'screenshot'});q('lbh-diag-status').textContent=r?.ok?'Screenshot salvo':'Falha no screenshot'};q('lbh-clear').onclick=async()=>{await cmd({type:'clear-diagnostic'});q('lbh-diag-status').textContent='Diagnóstico limpo'};for(const id of ['lbh-play','lbh-battle','lbh-smooth','lbh-trainers','lbh-tier-s','lbh-tier-a','lbh-tier-b','lbh-shiny','lbh-capture','lbh-capture-shiny-only','lbh-hp','lbh-return','lbh-auto-slots','lbh-slot-bet','lbh-slot-max','lbh-slot-min','lbh-full-diag','lbh-diag-min','lbh-net','lbh-dom'])q(id).onchange=async()=>{const c=config();await chrome.storage.local.set({lumenaCoreConfig:c});cmd({type:'update-config',config:c,reason:'floating-hud-live'})};
    chrome.storage.local.get('lumenaCoreConfig').then(x=>{const a=x.lumenaCoreConfig||{};if(typeof a.autoEnterPlay==='boolean')q('lbh-play').checked=a.autoEnterPlay;if(typeof a.battle==='boolean')q('lbh-battle').checked=a.battle;if(typeof a.smoothMovement==='boolean')q('lbh-smooth').checked=a.smoothMovement;if(typeof a.dailyTrainers==='boolean')q('lbh-trainers').checked=a.dailyTrainers;if(typeof a.pauseTierS==='boolean')q('lbh-tier-s').checked=a.pauseTierS;if(typeof a.pauseTierA==='boolean')q('lbh-tier-a').checked=a.pauseTierA;if(typeof a.pauseTierB==='boolean')q('lbh-tier-b').checked=a.pauseTierB;if(typeof a.pauseShiny==='boolean')q('lbh-shiny').checked=a.pauseShiny;if(typeof a.autoCaptureWild==='boolean')q('lbh-capture').checked=a.autoCaptureWild;else q('lbh-capture').checked=true;if(typeof a.captureOnlyShiny==='boolean')q('lbh-capture-shiny-only').checked=a.captureOnlyShiny;else q('lbh-capture-shiny-only').checked=true;if(typeof a.returnAfterWipe==='boolean')q('lbh-return').checked=a.returnAfterWipe;if(typeof a.autoSlots==='boolean')q('lbh-auto-slots').checked=a.autoSlots;if(a.slotBet)q('lbh-slot-bet').value=a.slotBet;if(a.slotMaxSpins)q('lbh-slot-max').value=a.slotMaxSpins;if(a.slotMinChips!=null)q('lbh-slot-min').value=a.slotMinChips;if(a.captureHpPercent)q('lbh-hp').value=a.captureHpPercent;if(typeof a.fullDiagnostic==='boolean')q('lbh-full-diag').checked=a.fullDiagnostic;if(a.diagnosticMinutes)q('lbh-diag-min').value=a.diagnosticMinutes;if(typeof a.networkMetadata==='boolean')q('lbh-net').checked=a.networkMetadata;if(typeof a.domSnapshots==='boolean')q('lbh-dom').checked=a.domSnapshots}).catch(e=>{q('lbh-status').textContent='Erro ao carregar configuração: '+e.message});
    let initAttempts=0;const pollStatus=async()=>{const r=await cmd({type:'status'});if(r?.ok)initAttempts=0;else if(++initAttempts>=3)q('lbh-status').textContent='Serviço da extensão indisponível. Recarregue a extensão e a página.'};pollStatus();setInterval(pollStatus,1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installLumenaBotHud,{once:true});else installLumenaBotHud();

  let autoPlayEnabled=true,autoPlayBusy=false,lastAutoPlayClick=0;
  function normalizePlayText(el){
    return R(`${el?.innerText||el?.textContent||''} ${el?.getAttribute?.('aria-label')||''} ${el?.getAttribute?.('title')||''}`)
      .replace(/\s+/g,' ').trim();
  }
  function playTarget(){
    const candidates=[...document.querySelectorAll('button,[role="button"],a[href],input[type="button"],input[type="submit"]')].filter(V);
    const exact=candidates.find(el=>{
      const text=normalizePlayText(el);
      if(!/^(?:🎮\s*)?(?:play|play game|enter game|start game)$/i.test(text))return false;
      const r=el.getBoundingClientRect();
      return r.width>=100&&r.height>=32&&!el.disabled&&el.getAttribute('aria-disabled')!=='true';
    });
    if(exact)return exact;
    const playLeaf=[...document.querySelectorAll('button span,button strong,button b,[role="button"] span,a[href] span')]
      .find(el=>V(el)&&/^(?:play|play game|enter game|start game)$/i.test(T(el)));
    const parent=playLeaf?.closest('button,[role="button"],a[href]');
    if(parent&&V(parent)){const r=parent.getBoundingClientRect();if(r.width>=100&&r.height>=32)return parent}
    return candidates.find(el=>{
      const text=normalizePlayText(el);
      const r=el.getBoundingClientRect();
      return /\bPLAY\b/i.test(text)&&r.width>=180&&r.height>=45&&r.top>innerHeight*.35;
    })||null;
  }
  function playState(){
    const target=playTarget();
    return target?{active:true,action:{kind:'enter-play',target:I(target)},text:normalizePlayText(target)}:{active:false,action:null,text:null};
  }
  function gameHudReady(){return !!document.querySelector('.hud__location-button,.hud__settings,.battle-ui,[class*="hud__currencies"]')}
  function fireClick(el){
    const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    for(const type of ['pointerover','mouseover','pointerdown','mousedown','pointerup','mouseup','click']){
      const C=type.startsWith('pointer')?PointerEvent:MouseEvent;
      el.dispatchEvent(new C(type,{bubbles:true,cancelable:true,view:window,clientX:x,clientY:y,button:0,buttons:type.includes('down')?1:0,pointerId:1,pointerType:'mouse',isPrimary:true}));
    }
    try{el.click()}catch{}
  }
  async function autoEnterPlayTick(){
    if(!autoPlayEnabled||autoPlayBusy||gameHudReady()||Date.now()-lastAutoPlayClick<900)return;
    const el=playTarget();if(!el)return;
    autoPlayBusy=true;lastAutoPlayClick=Date.now();
    try{fireClick(el)}finally{setTimeout(()=>{autoPlayBusy=false},500)}
  }
  chrome.storage.local.get('lumenaCoreConfig').then(x=>{const c=x.lumenaCoreConfig||{};autoPlayEnabled=c.autoEnterPlay!==false;autoEnterPlayTick()});
  chrome.storage.onChanged.addListener(ch=>{const c=ch.lumenaCoreConfig?.newValue;if(c)autoPlayEnabled=c.autoEnterPlay!==false});
  const autoPlayObserver=new MutationObserver(()=>autoEnterPlayTick());
  if(document.documentElement)autoPlayObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden','disabled','aria-hidden']});
  setInterval(autoEnterPlayTick,750);

})();
