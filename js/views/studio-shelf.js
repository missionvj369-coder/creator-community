import {h,icon} from '../ui.js?v=18214deeb83d6066';
import {STUDIO_PRODUCTS} from '../studio-meta.js?v=18214deeb83d6066';
import {STUDIO_STEPS} from '../studio-model.js?v=18214deeb83d6066';
import {space} from '../personal.js?v=18214deeb83d6066';
export function studioShelf(){const s=space().studios;return h('section',{class:'profile-panel'},h('h2',{},'Your living studios.'),h('p',{class:'fine'},'Working drafts and saved cards, kept with your space.'),h('div',{class:'studio-shelf-grid'},STUDIO_PRODUCTS.map(meta=>{const draft=s.drafts[meta.id],cards=s.cards.filter(c=>c.kind===meta.id);return h('article',{class:'studio-shelf-item'},h('small',{},'A PERSONAL STUDIO'),h('h3',{},meta.title),h('p',{},draft?.step?`${STUDIO_STEPS[meta.id][draft.step]} · your place is kept`:meta.outcome),h('div',{class:'studio-shelf-preview'},`${cards.length} saved card${cards.length===1?'':'s'}`),h('a',{href:`#/product/${meta.id}`},draft?.step?'Continue in studio':'Open studio',icon('arrow',15)));})));}
