
# tnt-tagger

A statistical part-of-speech tagger.

This is an implementation of Thorsten Brants' TnT parser. TnT, which
stands for Trigrams'n'Tags, is _"an efficient statistical
part-of-speech tagger"_, and its implementation is described in the
article [TnT -- A Statistical Part-of-Speech
Tagger](http://tagh.de/tom/wp-content/uploads/brants-2000.pdf).

In fact, **tnt-tagger** is a port of Python's [NLTK
implementation](https://www.nltk.org/_modules/nltk/tag/tnt.html) of
said parser.

This is currently a work in progress. Future work includes refactoring
code to make it more Javascript-like (for now, it feels a bit
artificial due to the direct translation from Python).

## Installation

```bash
$ npm install tnt-tagger
```
## Usage

```js

const TnT = require('./index');
const {Sentence,Token} = require('cetem-publico');

const ts = [new Sentence(1, [
    new Token('Jersei', {pos: 'N'      }) ,
    new Token('atinge', {pos: 'V'      }) ,
    new Token('média',  {pos: 'N'      }) ,
    new Token('de',     {pos: 'PREP'   }) ,
    new Token('Cr$',    {pos: 'CUR'    }) ,
    new Token('1,4',    {pos: 'NUM'    }) ,
    new Token('milhão', {pos: 'N'      }) ,
    new Token('em',     {pos: 'PREP|+' }) ,
    new Token('a',      {pos: 'ART'    }) ,
    new Token('venda',  {pos: 'N'      }) ,
    new Token('de',     {pos: 'PREP|+' }) ,
    new Token('a',      {pos: 'ART'    }) ,
    new Token('Pinhal', {pos: 'NPROP'  }) ,
    new Token('em',     {pos: 'PREP'   }) ,
    new Token('São',    {pos: 'NPROP'  }) ,
    new Token('Paulo',  {pos: 'NPROP'  })
  ])];

let corpus = {
  sentences:  function*(){
    n = 1;

    for(i=0; i<n; i++){
      yield ts[i];
    }
  }
};





let s = new Sentence(1, [
    new Token('Jersei'),
    new Token('atinge'),
    new Token('média' ),
    new Token('de'    ),
    new Token('Cr$'   ),
    new Token('1,4'   ),
    new Token('milhão'),
    new Token('em'    ),
    new Token('a'     ),
    new Token('venda' ),
    new Token('de'    ),
    new Token('a'     ),
    new Token('Pinhal'),
    new Token('em'    ),
    new Token('São'   ),
    new Token('Paulo' ),
  ]);

let t = new TnT();

t.train(corpus)
  .then(() => t.tag(s))
  .then(console.log);

```

## Methods

## TODO

## Acknowledgements

Thanks to Thorsten Brants for the original version of this algorithm,
and to NLTK's team for the implementation in which this module is
based on.

## Bugs and stuff

Open a GitHub issue or, preferably, send me a pull request.

## License

MIT

