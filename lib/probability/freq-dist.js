class FreqDist {
  constructor (...args) {
    this._count = 0;
    this._samples = {};
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
