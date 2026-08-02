const $=id=>document.getElementById(id);
async function send(m){const r=await chrome.runtime.sendMessage(m);if(!r?.ok)throw Error(r?.error||"Falha");return r}
function draw(s={}){const mode=s.specialPause?(s.specialPause.shiny?`Encontro: ✨ SHINY ${s.specialPause.name||"?"}`:`Encontro: ${s.specialPause.name||"?"} Tier ${s.specialPause.tier||"?"}`):s.userPaused?"Pausado":s.recovering?"Recuperando":s.running?"Ativo":"Parado";$("status").textContent=`${mode} · ${s.location||s.zoneId||"aguardando mapa"}`;const p=s.selectedSpot;$("tileStatus").textContent=p?`Tile salvo: ${p.zoneId} · ${p.position?"posição absoluta":"posição indisponível"}`:"Nenhum tile selecionado neste mapa"}
async function storedConfig(){const x=await chrome.storage.local.get("lumenaCoreConfig");return x.lumenaCoreConfig||{}}
$("start").onclick=async()=>{try{const st=(await send({type:"status"})).status;if(st.desiredRunning||st.userPaused||st.specialPause)draw((await send({type:"resume"})).status);else draw((await send({type:"start",config:await storedConfig()})).status)}catch(e){$("status").textContent="Erro: "+e.message}};
$("pause").onclick=async()=>{try{draw((await send({type:"pause"})).status)}catch(e){$("status").textContent="Erro: "+e.message}};
$("stop").onclick=async()=>{try{draw((await send({type:"stop"})).status)}catch(e){$("status").textContent="Erro: "+e.message}};
async function refresh(){try{draw((await send({type:"status"})).status)}catch(e){$("status").textContent="Núcleo indisponível"}}
refresh();setInterval(refresh,1000);
$("selectTile").onclick=async()=>{try{draw((await send({type:"select-tile"})).status)}catch(e){$("tileStatus").textContent="Erro: "+e.message}};
$("clearTile").onclick=async()=>{try{draw((await send({type:"clear-selected-tile"})).status)}catch(e){$("tileStatus").textContent="Erro: "+e.message}};
