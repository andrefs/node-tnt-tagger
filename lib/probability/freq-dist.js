class FreqDist {
  constructor (...args) {
    this._count = 0;
  }

  add(sample, inc){
    this[sample] = this[sample] || 0;
    this[sample] += inc;
    this._count++;
  }

  freq(sample){
    return sample in this ? this[sample]/this._count : 0;
  }

  _n(){
    return Object.values(this).reduce((a,b) => a + b, 0);
  }


  keys(){
    return Object.keys(this).filter(a => a[0] !== '_');
  }

  [Symbol.iterator](){
    return Object.keys(this)
      .map(key => this[key])
      .values();
  }
}

module.exports = FreqDist;
