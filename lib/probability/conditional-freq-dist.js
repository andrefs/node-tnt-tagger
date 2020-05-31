const FreqDist = require('./freq-dist');

class ConditionalFreqDist {

  constructor (count=0, conds={}) {
    this._count = count;
    this._conds = conds;
  }

  static load({_count, _conds}){
    let condObjs = {};
    for(const [key, props] of Object.entries(_conds)){
      condObjs[key] = new FreqDist(props._count, props._samples);
    }
    return new ConditionalFreqDist(_count, condObjs);
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
    return Object.keys(this._conds).filter(c => !c.startsWith('_'));
  }

  get(c){
    return this._conds[c];
  }


  [Symbol.iterator](){
    return Object.keys(this._conds)
      .map(key => this._conds[key])
      .values();
  }
}

module.exports = ConditionalFreqDist;
