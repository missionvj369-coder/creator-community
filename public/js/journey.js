import { state, mutateSpace } from './store.js';
import { normaliseJourney, normaliseThread, createThread, insightsOf } from './journey-model.js';
import { sessionRecord } from './space-model.js';
export const journey=()=>normaliseJourney(state.doc?.space?.journey);
export const activeThread=()=>{const j=journey();return j.threads.find(t=>t.id===j.activeId)||null;};
export const threadById=id=>journey().threads.find(t=>t.id===id)||null;
export const insights=()=>insightsOf(journey());
export function saveThread(thread){const t=normaliseThread({...thread,updatedAt:Date.now()});if(!t)return null;mutateSpace(s=>{const j=normaliseJourney(s.journey),i=j.threads.findIndex(x=>x.id===t.id);if(i<0)j.threads.push(t);else j.threads[i]=t;if(t.stage==='done'){if(j.activeId===t.id)j.activeId=null;}else j.activeId=t.id;s.journey=j;if(t.stage==='done')s=sessionRecord(s,{id:`thread-${t.id}`,route:`#/thread/${t.id}`,title:t.checkin.topic,kind:'Guided journey',at:t.closedAt,seconds:t.seconds,completed:t.review.attempted==='yes'});return s;});return t;}
export function startThread({parent=null}={}){const existing=activeThread();if(existing)return existing;const t=createThread({id:crypto.randomUUID?.()||`t-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,minutes:state.doc?.space?.minutes||2,parent});saveThread(t);return t;}
export function deleteThread(id){mutateSpace(s=>{s.journey=normaliseJourney(s.journey);s.journey.threads=s.journey.threads.filter(t=>t.id!==id);if(s.journey.activeId===id)s.journey.activeId=null;s.sessions=s.sessions.filter(x=>x.id!==`thread-${id}`);return s;});}
