(function(){
  // guarda último payload do page-bridge
  let __lumena_last_bridge_payload = null;
  let __lumena_last_bridge_zone = null;

  // recebe updates do page-bridge (ele já usa postMessage(payload,'*'))
  window.addEventListener('message', e => {
    try {
      const payload = e.data;
      if (!payload || payload.source !== 'lumena-page-bridge') return;
      // armazena
      const prevZone = __lumena_last_bridge_zone;
      __lumena_last_bridge_payload = payload;
      __lumena_last_bridge_zone = payload.zoneId || null;

      // quando mudamos de zona, detecta respawn: prev was wild and new is city
      if (prevZone && prevZone !== __lumena_last_bridge_zone) {
        try {
          const catalog = globalThis.LUMENA_ZONE_CATALOG || [];
          const prevObj = catalog.find(z => z.id === prevZone);
          const newObj = catalog.find(z => z.id === __lumena_last_bridge_zone);
          if (prevObj?.type === 'wild' && newObj?.type === 'city') {
            // notifica o background (service worker) que houve respawn (wild->city)
            chrome.runtime.sendMessage({
              type: 'player-respawned',
              zoneId: __lumena_last_bridge_zone,
              prevZone,
              position: payload.position || null
            });
          }
        } catch (err) { /* ignore */ }
      }
    } catch (err) { /* ignore */ }
  });

  // responde a pedidos do background:
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    try {
      if (!msg || !msg.type) return;
      if (msg.type === 'request-current-spot') {
        // retorna a última posição/zoneId conhecida pelo page-bridge
        const p = __lumena_last_bridge_payload || {};
        sendResponse({ ok: true, spot: { zoneId: p.zoneId || null, position: p.position || null } });
        return true;
      }

      if (msg.type === 'interact-space') {
        // dispara 2x a tecla Space na página (keydown + keyup)
        const doSpace = () => {
          try {
            const kd = new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true });
            const ku = new KeyboardEvent('keyup', { code: 'Space', key: ' ', bubbles: true });
            document.dispatchEvent(kd);
            document.dispatchEvent(ku);
          } catch (e) {}
        };
        doSpace();
        // segunda pressão com pequeno atraso
        setTimeout(doSpace, 160);
        sendResponse({ ok: true });
        return true;
      }
    } catch (err) {
      // fallback
      sendResponse({ ok: false, error: String(err) });
    }
  });

})();
