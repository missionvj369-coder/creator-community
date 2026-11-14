import {cinemaSound} from './cinema-sound.js?v=18214deeb83d6066';
let serial=0;
// The opening borrows the app's mixer; it never creates an overlapping drone.
export class ArrivalSound {
 constructor({bus=cinemaSound}={}){this.bus=bus;this.owner=`opening-${++serial}`;this.on=false;this.closed=false;bus.hold(this.owner);}
 async start(){if(this.closed||!this.bus.enabled)return false;this.bus.resume(this.owner);this.on=await this.bus.startScore();if(this.closed){this.on=false;return false;}return this.on;}
 pause(){this.on=false;this.bus.hold(this.owner);}
 close(){if(this.closed)return;this.closed=true;this.on=false;this.bus.resume(this.owner);}
}
