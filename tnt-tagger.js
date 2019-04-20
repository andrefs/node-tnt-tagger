
const FreqDist = require('../probability').FreqDist;
const ConditionalFreqDist = require('../probability').ConditionalFreqDist;
const Sentence = require('../cetem-publico/sentence');
const Token = require('../cetem-publico/token');

class Tagger {
  constructor(unk=null, trained=false, N=1000, C=false){
    this._uni = new FreqDist();
    this._bi = new ConditionalFreqDist();
    this._tri = new ConditionalFreqDist();
    this._wd = new ConditionalFreqDist();
    this._eos = new ConditionalFreqDist();
    this._l1 = 0.0;
    this._l2 = 0.0;
    this._l3 = 0.0;
    this._N = N;
    this._C = false;
    this._T = trained;

    this._unk = unk;

    // statistical tools (ignore or delete me)
    this.unknown = 0;
    this.known = 0;
  }

  async train(data){
    let C = false;

    for await (const sent of data.sentences()){
      let history = [['BOS', false], ['BOS', false]];
      for (const token of sent.tokens){
        const w = token.word;
        const t = token.pos;

        if(this._C && w[0] === w[0].toUpperCase()){
          C = true;
        }

        this._wd.add(w, t, 1);
        this._uni.add([t, C], 1);
        this._bi.add(history[1], [t, C], 1);
        this._tri.add(history, [t, C], 1);

        history.push([t, C]);
        history.shift();

        C = false;
      }

      this._eos.add(sent.tokens.slice(-1)[0].pos, 'EOS', 1);
    }

    this._compute_lambda();
  }


  _compute_lambda(){

    // temporary lambda variables
    let tl1 = 0.0;
    let tl2 = 0.0;
    let tl3 = 0.0;

    // for each t1,t2 in system
    for(const history of this._tri.conditions()){
      history.match(/^(.*?,.*?),(.*?,.*?)$/);
      const [h1, h2] = [RegExp.$1, RegExp.$2];

      // for each t3 given t1,t2 in system
      // (NOTE: tag actually represents (tag,C))
      // However no effect within this function
      for (const tag of this._tri[history].keys()){

        // if there has only been 1 occurrence of this tag in the data
        // then ignore this trigram.
        if(this._uni[tag] === 1){ continue; }

        // safe_div provides a safe floating point division
        // it returns -1 if the denominator is 0
        const c3 = this._safe_div(
            this._tri[history][tag] - 1,
            this._tri[history].n() - 1
        );
        const c2 = this._safe_div(
          (this._bi[h2] ? this._bi[h2][tag]||0 : 0) - 1,
          (this._bi[h2] ? this._bi[h2].n() : 0)- 1
        );
        const c1 = this._safe_div(
          this._uni[tag] - 1,
          this._uni.n() - 1
        );

        // if c1 is the maximum value:
        if(c1 > c3 && c1 > c2){
          tl1 += this._tri[history][tag];
        }

        // if c2 is the maximum value
        else if(c2 > c3 && c2 > c1){
          tl2 += this._tri[history][tag];
        }

        // if c3 is the maximum value
        else if (c3 > c2 && c3 > c1){
          tl3 += this._tri[history][tag];
        }

        // if c3, and c2 are equal and larger than c1
        else if (c3 == c2 && c3 > c1){
          tl2 += this._tri[history][tag] / 2.0;
          tl3 += this._tri[history][tag] / 2.0;
        }

        // if c1, and c2 are equal and larger than c3
        // this might be a dumb thing to do....(not sure yet)
        else if (c2 == c1 && c1 > c3){
          tl1 += this._tri[history][tag] / 2.0;
          tl2 += this._tri[history][tag] / 2.0;
        }

        // otherwise there might be a problem
        // eg: all values = 0
        else {
          // print "Problem", c1, c2 ,c3
        }
      };
    };

    // Lambda normalisation:
    // ensures that l1+l2+l3 = 1
    this._l1 = tl1 / (tl1 + tl2 + tl3);
    this._l2 = tl2 / (tl1 + tl2 + tl3);
    this._l3 = tl3 / (tl1 + tl2 + tl3);
  }

  _safe_div(v1, v2){
    if(v2 === 0){ return -1; }
    else { return v1/v2; }
  }

  tag(data){
    let current_state = [[['BOS', 'BOS'], 0.0]];

    const tokens = data.tokens;
    const tags = this._tagword(tokens, current_state);

    let res = [];

    tokens.forEach((token, i) => {
      // unpack and discard the C flags
      const [t, C] = tags[i+2];
      res.push(new Token(token.word, {pos: t}));
    });

    return new Sentence(data.id, res);
  }

  _tagword(sent, current_states){
    // if this word marks the end of the sentance,
    // return the most probable tag
    if(sent.length === 0){
      const [h, logp] = current_states[0];
      return h;
    }

    // otherwise there are more words to be tagged
    const word = sent.slice(0,1)[0].word;
    sent = sent.slice(1);
    let new_states = [];

    // if the Capitalisation is requested,
    // initalise the flag for this word
    let C = false;
    if(this._C && word[0] === word[0].toUpperCase()){
      C = true;
    }

    // if word is known
    // compute the set of possible tags
    // and their associated log probabilities
    if(word in this._wd){
      this.known++;

      for(const [history, curr_sent_logprob] of current_states){
        let logprobs = [];

        for(const t of this._wd[word].keys()){


          const tC = [t, C];
          const p_uni = this._uni.freq(tC);
          const p_bi  = (this._bi[history.slice(-1)[0]] || new FreqDist).freq(tC);
          const p_tri = (this._tri[history.slice(-2)] || new FreqDist()).freq(tC);
          const p_wd  = this._wd[word][t] / this._uni[tC];
          const p     = this._l1 * p_uni + this._l2 * p_bi + this._l3 * p_tri;
          const p2    = Math.log2(p) + Math.log2(p_wd);

          // compute the result of appending each tag to this history
          new_states.push([[...history, tC], curr_sent_logprob + p2])
        };
      };
    }
    // otherwise a new word, set of possible tags is unknown
    else {
      this.unknown++;

      let tag;

      // since a set of possible tags,
      // and the probability of each specific tag
      // can not be returned from most classifiers:
      // specify that any unknown words are tagged with certainty
      let p = 1;

      // if no unknown word tagger has been specified
      // then use the tag 'Unk'
      if(!this._unk){ tag = ['Unk', C]; }
      else {
        const [[_w, t]] = this._unk.tag([word]);
        tag = [t, C];
      }

      for(const [history, logprob] of current_states){
        history.push(tag);
      };

      new_states = current_states;
    }

    // now have computed a set of possible new_states

    // sort states by log prob
    // set is now ordered greatest to least log probability
    new_states.sort((a, b) => { return b[1] - a[1]; });

    // del everything after N (threshold)
    // this is the beam search cut
    if(new_states.length > this._N){
      new_states = new_states.slice(this._N);
    }

    // compute the tags for the rest of the sentence
    // return the best list of tags for the sentence
    return this._tagword(sent, new_states);
  }
}

module.exports = Tagger;
