class FreqDist {
  constructor(count=0, samples=0) {
    this._count = count;
    this._samples = samples;
  }

  static load({_count, _samples}){
    return new FreqDist(_count, _samples);
  }

  add(sample, inc){
    this._samples[sample] = this._samples[sample] || 0;
    this._samples[sample] += inc;
    this._count++;
  }

  freq(sample){
    return sample in this ? this._samples[sample]/this._count : 0;
  }

  n(){
    return Object.values(this._samples).reduce((a,b) => a + b, 0);
  }

  keys(){
    return Object.keys(this._samples).filter(a => !a.startsWith('_'));
  }

  get(s){
    return this._samples[s];
  }

  [Symbol.iterator](){
    return Object.keys(this._samples)
      .map(key => this._samples[key])
      .values();
  }
}

module.exports = FreqDist;
