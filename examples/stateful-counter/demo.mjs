import { createExample, increment, readCount } from "./counter.mjs";

const example = createExample();
const states = [example.counter.utxos.toArray()[0], increment(example), increment(example)];
console.log(JSON.stringify({
  execution: "offline MockChain + Sigma.JS",
  realTransactions: 0,
  states: states.map(box => ({ count: readCount(box), boxId: box.boxId, value: box.value.toString() }))
}, null, 2));
