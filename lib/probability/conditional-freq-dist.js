const FreqDist = require('./freq-dist');

class ConditionalFreqDist {

  constructor (...args) {
    this._count = 0;
    this._conds = {};
  }

  add(cond, sample, inc){
    this._conds[cond] = this._conds.hasOwnProperty(cond) ?
      this._conds[cond] :
      new FreqDist();
    this._conds[cond].add(sample, inc);
    this._count++;
  }

  n(){
    return Object.values(this).map(fdist => fdist.n()).reduce((a,b) => a + b, 0);
  }

  conditions(){
    return Object.keys(this._conds).filter(c => c[0] !== '_');
  }

  [Symbol.iterator](){
    return Object.keys(this._conds)
      .map(key => this._conds[key])
      .values();
  }
}

module.exports = ConditionalFreqDist;
