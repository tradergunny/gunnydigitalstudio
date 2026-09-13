// A quiet, self-contained ambient chord. Audio starts only after an explicit click.
export class AmbientAudio {
  private context?:AudioContext;
  private gain?:GainNode;
  private oscillators:OscillatorNode[]=[];
  async set(playing:boolean, volume:number){
    if(!playing&&!this.context)return;
    if(!this.context){
      this.context=new AudioContext();this.gain=this.context.createGain();this.gain.gain.value=0;this.gain.connect(this.context.destination);
      for(const frequency of [130.81,164.81,196,261.63]){
        const oscillator=this.context.createOscillator();oscillator.type='sine';oscillator.frequency.value=frequency;
        const level=this.context.createGain();level.gain.value=.075;oscillator.connect(level);level.connect(this.gain);oscillator.start();this.oscillators.push(oscillator);
      }
    }
    if(playing&&this.context.state==='suspended')await this.context.resume();
    this.gain!.gain.setTargetAtTime(playing?volume/100:0,this.context.currentTime,.28);
  }
  dispose(){this.oscillators.forEach(o=>o.stop());void this.context?.close();}
}
