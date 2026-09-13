export type Mood = 'day' | 'warm' | 'night';
export type ObjectId = 'workstation' | 'laptop' | 'pc' | 'speakers' | 'lamp' | 'chair' | 'blind' | 'drawer' | 'headphones' | 'server' | 'camera';
export interface StudioState {
  mood: Mood; light: number; monitors: boolean; laptop: boolean; pc: boolean;
  lamp: boolean; server: boolean; blind: number; drawer: boolean; chair: number;
  sound: boolean; volume: number; hotspots: boolean;
}
export const defaults: StudioState = { mood:'day', light:80, monitors:true, laptop:true, pc:true, lamp:true, server:true, blind:55, drawer:false, chair:0, sound:false, volume:30, hotspots:true };
const storageKey='gunny-studio-v1';
export function restore(): StudioState {
  try {
    const raw=JSON.parse(localStorage.getItem(storageKey) || '{}');
    const result={...defaults};
    for (const key of Object.keys(defaults) as (keyof StudioState)[]) {
      if(typeof raw[key]===typeof defaults[key]) (result as unknown as Record<string,unknown>)[key]=raw[key];
    }
    if(!['day','warm','night'].includes(result.mood))result.mood='day';
    for(const key of ['light','blind','volume'] as const)result[key]=Math.max(0,Math.min(100,result[key]));
    result.chair=Number.isFinite(result.chair)?result.chair:0;
    result.sound=false;
    return result;
  } catch {return {...defaults};}
}
export class Store {
  value=restore();
  private listeners=new Set<(state:StudioState)=>void>();
  update(patch:Partial<StudioState>){
    this.value={...this.value,...patch};
    try{localStorage.setItem(storageKey,JSON.stringify(this.value));}catch{/* Storage may be unavailable in private contexts. */}
    this.listeners.forEach(fn=>fn(this.value));
  }
  subscribe(fn:(state:StudioState)=>void){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
  reset(){this.update({...defaults});}
}
