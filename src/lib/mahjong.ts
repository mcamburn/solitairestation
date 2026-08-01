// Mahjong Solitaire — game logic
// Layout: 5 stacked layers forming a step-pyramid, 144 tiles total

export interface TilePos { layer: number; row: number; col: number; }

function generateLayout(): TilePos[] {
  const p: TilePos[] = [];
  for (let r=0;r<6;r++)  for (let c=0;c<12;c++)  p.push({layer:0,row:r,col:c}); // 72
  for (let r=1;r<=4;r++) for (let c=1;c<=10;c++) p.push({layer:1,row:r,col:c}); // 40
  for (let r=2;r<=3;r++) for (let c=2;c<=9;c++)  p.push({layer:2,row:r,col:c}); // 16
  for (let r=2;r<=3;r++) for (let c=3;c<=8;c++)  p.push({layer:3,row:r,col:c}); // 12
  for (let c=4;c<=7;c++)                          p.push({layer:4,row:2,col:c}); //  4
  return p; // 144 total
}
export const LAYOUT: TilePos[] = generateLayout();

const ABOVE_BLOCKERS: number[][] = LAYOUT.map((pos,i)=>
  LAYOUT.reduce<number[]>((a,p,j)=>{if(j!==i&&p.layer>pos.layer&&p.row===pos.row&&p.col===pos.col)a.push(j);return a;},[])
);
const LEFT_BLOCKERS: number[][] = LAYOUT.map((pos,i)=>
  LAYOUT.reduce<number[]>((a,p,j)=>{if(j!==i&&p.layer===pos.layer&&p.row===pos.row&&p.col===pos.col-1)a.push(j);return a;},[])
);
const RIGHT_BLOCKERS: number[][] = LAYOUT.map((pos,i)=>
  LAYOUT.reduce<number[]>((a,p,j)=>{if(j!==i&&p.layer===pos.layer&&p.row===pos.row&&p.col===pos.col+1)a.push(j);return a;},[])
);

export type TileSuit = "bamboo"|"circles"|"characters"|"winds"|"dragons"|"flowers"|"seasons";

export interface TileMeta {
  suit: TileSuit;
  char: string;
  sub: string;
  topLabel?: string;
  color: string;
  group?: "flower"|"season";
}

const CHN  = ["一","二","三","四","五","六","七","八","九"];
const CIRC = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨"];

export const TILE_META: Record<string, TileMeta> = {
  ...Object.fromEntries(CHN.map((_,i)=>[`b${i+1}`,{suit:"bamboo"      as TileSuit,char:String(i+1),sub:"竹",topLabel:"竹",color:"#15803d"}])),
  ...Object.fromEntries(CIRC.map((ch,i)=>[`c${i+1}`,{suit:"circles"   as TileSuit,char:ch,          sub:"筒",             color:"#1d4ed8"}])),
  ...Object.fromEntries(CHN.map((ch,i)=>[`m${i+1}`,{suit:"characters" as TileSuit,char:ch,           sub:"萬",             color:"#b91c1c"}])),
  "wd-e":{suit:"winds",   char:"東",sub:"風",color:"#4338ca"},
  "wd-s":{suit:"winds",   char:"南",sub:"風",color:"#4338ca"},
  "wd-w":{suit:"winds",   char:"西",sub:"風",color:"#4338ca"},
  "wd-n":{suit:"winds",   char:"北",sub:"風",color:"#4338ca"},
  "dr-r" :{suit:"dragons",char:"中",sub:"龍",color:"#dc2626"},
  "dr-g" :{suit:"dragons",char:"發",sub:"龍",color:"#15803d"},
  "dr-wh":{suit:"dragons",char:"白",sub:"龍",color:"#64748b"},
  "fl1":{suit:"flowers",char:"梅",sub:"花",color:"#be185d",group:"flower"},
  "fl2":{suit:"flowers",char:"蘭",sub:"花",color:"#be185d",group:"flower"},
  "fl3":{suit:"flowers",char:"菊",sub:"花",color:"#be185d",group:"flower"},
  "fl4":{suit:"flowers",char:"荷",sub:"花",color:"#be185d",group:"flower"},
  "se1":{suit:"seasons",char:"春",sub:"季",color:"#b45309",group:"season"},
  "se2":{suit:"seasons",char:"夏",sub:"季",color:"#b45309",group:"season"},
  "se3":{suit:"seasons",char:"秋",sub:"季",color:"#b45309",group:"season"},
  "se4":{suit:"seasons",char:"冬",sub:"季",color:"#b45309",group:"season"},
};

function createPool(): string[] {
  const p: string[]=[];
  for(let i=1;i<=9;i++) for(let k=0;k<4;k++) p.push(`b${i}`);
  for(let i=1;i<=9;i++) for(let k=0;k<4;k++) p.push(`c${i}`);
  for(let i=1;i<=9;i++) for(let k=0;k<4;k++) p.push(`m${i}`);
  for(const w of["wd-e","wd-s","wd-w","wd-n"]) for(let k=0;k<4;k++) p.push(w);
  for(const d of["dr-r","dr-g","dr-wh"])       for(let k=0;k<4;k++) p.push(d);
  p.push("fl1","fl2","fl3","fl4","se1","se2","se3","se4");
  return p; // 144
}

function shuffle<T>(arr:T[],seed:number):T[]{
  let s=seed;
  const rand=()=>{s=(s*9301+49297)%233280;return s/233280;};
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

export interface MahjongState {
  types: string[];
  alive: boolean[];
  selected: number|null;
  moves: number;
  won: boolean;
  startedAt: number;
}

export function newMahjongGame(seed?:number): MahjongState {
  return {
    types: shuffle(createPool(), seed??Date.now()),
    alive: Array(144).fill(true),
    selected: null, moves: 0, won: false,
    startedAt: Date.now(),
  };
}

export function cloneMahjong(s:MahjongState): MahjongState {
  return {...s, types:[...s.types], alive:[...s.alive]};
}

export function isTileFree(alive:boolean[], idx:number): boolean {
  if(!alive[idx]) return false;
  if(ABOVE_BLOCKERS[idx].some(j=>alive[j])) return false;
  return LEFT_BLOCKERS[idx].every(j=>!alive[j]) || RIGHT_BLOCKERS[idx].every(j=>!alive[j]);
}

export function tilesMatch(typeA:string, typeB:string): boolean {
  if(typeA===typeB) return true;
  const a=TILE_META[typeA], b=TILE_META[typeB];
  return !!(a?.group && a.group===b?.group);
}

export function hasAnyMatch(alive:boolean[], types:string[]): boolean {
  const free:number[]=[];
  for(let i=0;i<144;i++) if(isTileFree(alive,i)) free.push(i);
  for(let i=0;i<free.length;i++)
    for(let j=i+1;j<free.length;j++)
      if(tilesMatch(types[free[i]],types[free[j]])) return true;
  return false;
}

export function tryMahjongClick(state:MahjongState, idx:number): MahjongState|null {
  if(!isTileFree(state.alive, idx)) return null;
  const s=cloneMahjong(state);
  if(s.selected===null)  { s.selected=idx; return s; }
  if(s.selected===idx)   { s.selected=null; return s; }
  if(tilesMatch(s.types[s.selected], s.types[idx])) {
    s.alive[s.selected]=false; s.alive[idx]=false;
    s.moves++; s.selected=null;
    s.won=s.alive.every(a=>!a);
  } else {
    s.selected=idx;
  }
  return s;
}

/* ---- Hint ---- */

export interface MahjongHint {
  idxA: number;
  idxB: number;
  description: string;
}

export function findMahjongHint(state: MahjongState): MahjongHint | null {
  const free: number[] = [];
  for (let i = 0; i < 144; i++) {
    if (isTileFree(state.alive, i)) free.push(i);
  }
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (tilesMatch(state.types[free[i]], state.types[free[j]])) {
        const meta = TILE_META[state.types[free[i]]];
        return {
          idxA: free[i],
          idxB: free[j],
          description: meta
            ? `Match the pair of ${meta.sub} tiles`
            : "A matching pair is available — click them both",
        };
      }
    }
  }
  return null;
}
