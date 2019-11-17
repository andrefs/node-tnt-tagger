const FreqDist = require('./freq-dist');

class ConditionalFreqDist {

  constructor (...args) {
    this._count = 0;
  }

  add(cond, sample, inc){
    this[cond] = this[cond] || new FreqDist();
    this[cond].add(sample, inc);
    this._count++;
  }

// TODO: FIX (if a word is '_n' it will clash with method name)
  _n(){
    return Object.values(this).map(fdist => fdist._n()).reduce((a,b) => a + b, 0);
  }

  conditions(){
    return Object.keys(this).filter(c => c[0] !== '_');
  }

  [Symbol.iterator](){
    return Object.keys(this)
      .map(key => this[key])
      .values();
  }
}

module.exports = ConditionalFreqDist;
