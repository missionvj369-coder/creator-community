export const ARRIVAL_SESSION_KEY='human.within.arrival.session.v2';
export function createArrivalVisit(storage){
 let admitted=false;try{admitted=storage()?.getItem(ARRIVAL_SESSION_KEY)==='1';}catch{}
 return {get admitted(){return admitted;},admit(){admitted=true;try{storage()?.setItem(ARRIVAL_SESSION_KEY,'1');}catch{}}};
}
export function arrivalDestination(hash){
 return /^#\/(daily|meditate|home|discover|journey|library|products|product|ebooks|wallpapers|you|guide|thread|moment|tools|tool|book|experience|read|browse|listen|session|situations|situation|today|path|world|welcome)(?:\/[a-z0-9-]+)?(?:\/\d+)?$/.test(hash)?hash:'#/home';
}
