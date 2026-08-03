// RESPWAN / CRYSTAL flow integration for background.js
// This block listens for popup actions (select-crystal/select-farm) and
// manages the respawn -> crystal interaction -> return to farm flow.
(function(){
  chrome.runtime.onMessage.addListener((m,_s,reply)=>{try{
    if(!m||!m.type)return;
    if(m.type==='select-crystal'){
      (async()=>{
        try{
          const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
          if(!tab?.id)return reply({ok:false,error:'no-active-tab'});
          const r=await chrome.tabs.sendMessage(tab.id,{type:'request-current-spot'});
          if(!r?.ok) return reply({ok:false,error:'no-spot'});
          ST.crystalByZone=ST.crystalByZone||{};
          ST.crystalByZone[r.spot.zoneId]=r.spot;
          await saveCrystalSpots();
          log('manual-crystal-saved',{spot:r.spot});
          reply({ok:true,spot:r.spot});
        }catch(e){reply({ok:false,error:String(e)})}
      })();
      return true;
    }
    if(m.type==='select-farm'){
      (async()=>{
        try{
          const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
          if(!tab?.id)return reply({ok:false,error:'no-active-tab'});
          const r=await chrome.tabs.sendMessage(tab.id,{type:'request-current-spot'});
          if(!r?.ok) return reply({ok:false,error:'no-spot'});
          ST.spotByZone=ST.spotByZone||{};
          ST.spotByZone[r.spot.zoneId]=r.spot;
          await saveSelectedSpots();
          log('manual-farm-saved',{spot:r.spot});
          reply({ok:true,spot:r.spot});
        }catch(e){reply({ok:false,error:String(e)})}
      })();
      return true;
    }

    if(m.type==='player-respawned'){
      (async()=>{
        try{
          const cityZone=m.zoneId;
          // mark a respawn return: prefer lastFarmZone if available
          const targetZone = ST.lastFarmZone||null;
          if(targetZone){
            ST.respawnReturnActive=true;
            ST.respawnReturnTarget=targetZone;
            ST.farmArrived=false;
            ST.selectedSpot=null; ST.spotReturnActive=false; ST.anchorNeighbor=null;
            ST.entryPortalId=null; ST.entryPortalUntil=0; ST.farmRoute=null; ST.farmRouteStep=null;
            log('respawn-return-armed',{from:m.prevZone,to:cityZone,target:ST.respawnReturnTarget});
            // If there is a crystal saved in the city zone, arm a spotReturn to it first
            if(ST.crystalByZone?.[cityZone]){
              ST.selectedSpot=ST.crystalByZone[cityZone];
              ST.selectedSpot.inputMode=ST.inputMode;
              ST.spotReturnIndex=0; ST.spotReturnStartedAt=Date.now(); ST.spotReturnReason='crystal-respawn';
              ST.spotReturnActive=true; ST.anchorNeighbor=null;
              log('respawn-crystal-armed',{zone:cityZone,target:ST.selectedSpot.position});
            }
          }
          reply({ok:true});
        }catch(e){reply({ok:false,error:String(e)})}
      })();
      return true;
    }
  }catch(e){/* ignore */}});

  // monitor loop that handles crystal interaction and switching to farm return
  const POLL_MS=700;
  (async function loop(){
    while(true){
      try{
        if(ST.respawnReturnActive){
          // If we're armed to interact with a crystal and spotReturnActive is set
          if(ST.spotReturnActive && ST.spotReturnReason==='crystal-respawn' && ST.selectedSpot && ST.zoneId===ST.selectedSpot.zoneId){
            // if we've arrived near the target position (selectedSpot.position)
            const map=ensureAutoMap(ST.zoneId,ST.probe?.location);
            const curTile = map && ST.position ? mapTileFromPosition(map,ST.position) : null;
            const spotTile = map && ST.selectedSpot.position ? mapTileFromPosition(map,ST.selectedSpot.position) : null;
            // arrival detection: tile match OR very close in world coords
            let arrived=false;
            if(curTile && spotTile && curTile===spotTile) arrived=true;
            else if(ST.position && ST.selectedSpot.position){
              const dx=ST.position.x-ST.selectedSpot.position.x, dz=ST.position.z-ST.selectedSpot.position.z;
              if(Math.hypot(dx,dz)<0.55) arrived=true;
            }
            if(arrived){
              // trigger interaction via content script
              try{ await chrome.tabs.sendMessage(ST.tabId,{type:'interact-space'}); log('crystal-interacted',{zone:ST.zoneId}); }catch(e){log('crystal-interact-failed',{error:String(e)})}
              // clear crystal spot usage and arm return to farm
              ST.selectedSpot=null; ST.spotReturnActive=false; ST.spotReturnIndex=0; ST.anchorNeighbor=null;
              // set respawnReturnTarget to lastFarmZone if present
              if(ST.lastFarmZone){ ST.respawnReturnTarget=ST.lastFarmZone; }
            }
          }

          // If we have reached the farm target zone, clean up and resume
          if(ST.respawnReturnTarget && ST.zoneId===ST.respawnReturnTarget){
            // detect arrival by comparing to saved spot or just by being in the zone
            const farmSpot = ST.spotByZone?.[ST.zoneId]||null;
            let atFarm=false;
            if(farmSpot && farmSpot.position && ST.position){
              const dx=ST.position.x-farmSpot.position.x, dz=ST.position.z-farmSpot.position.z; if(Math.hypot(dx,dz)<0.6) atFarm=true;
            } else {
              // if we have no precise farm spot, being in the zone is considered arrival
              atFarm=true;
            }
            if(atFarm){
              ST.respawnReturnActive=false; ST.respawnReturnTarget=null; ST.spotReturnActive=false; ST.selectedSpot=null; ST.anchorNeighbor=null;
              ST.farmArrived=true; ST.battleOriginZone=null; ST.battleOriginPosition=null;
              // resume running
              ST.desiredRunning=true; ST.userPaused=false; ST.running=true;
              log('respawn-flow-complete',{zone:ST.zoneId});
            }
          }
        }
      }catch(e){/* swallow */}
      await new Promise(r=>setTimeout(r,POLL_MS));
    }
  })();
})();
