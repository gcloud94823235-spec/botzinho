importScripts('world-catalog.js','nav-catalog.js','route-fix.js','zone-catalog.js','tier-catalog.js','trainer-catalog.js','background-respawn-block.js');
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

const ST={running:false,tabId:null,attached:false,phase:'idle',lastError:null,events:[],timer:null,exportTimer:null,startedAt:0,lastMoveAt:0,officialMoves:0,encounters:0,battles:0,wins:0,captureAt:...