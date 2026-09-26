import { compile } from "@fleet-sdk/compiler";
import { OutputBuilder, TransactionBuilder, RECOMMENDED_MIN_FEE_VALUE } from "@fleet-sdk/core";
import { MockChain } from "@fleet-sdk/mock-chain";
import { SInt, decode } from "@fleet-sdk/serializer";

// A teaching contract for one box's state lineage, not a global singleton.
// No real wallet, RPC endpoint, or live network is used by this module.
export const counterScript = `{
  val current = SELF.R4[Int].get
  val successor = OUTPUTS(0)
  sigmaProp(
    current < 2147483647 &&
    successor.propositionBytes == SELF.propositionBytes &&
    successor.value == SELF.value &&
    successor.tokens == SELF.tokens &&
    successor.R4[Int].get == current + 1
  )
}`;

export const counterTree = compile(counterScript, { network: "testnet" });
export const stateValue = 10_000_000n;
export const fee = RECOMMENDED_MIN_FEE_VALUE;

export function readCount(box) {
  return decode(box.additionalRegisters.R4).data;
}

export function createExample(initialCount = 0, tokens = []) {
  const chain = new MockChain({ height: 100, timestamp: 1_700_000_000_000 });
  const payer = chain.newParty("Local test payer").withBalance({ nanoergs: 1_000_000_000n, tokens });
  const counter = chain.newParty({ name: "Counter", ergoTree: counterTree.toHex() });
  const createTransaction = new TransactionBuilder(chain.height)
    .from(payer.utxos.toArray())
    .to(new OutputBuilder(stateValue, counterTree.toAddress()).addTokens(tokens).setAdditionalRegisters({
      R4: SInt(initialCount).toHex()
    }))
    .sendChangeTo(payer.address)
    .payFee(fee)
    .build();
  chain.execute(createTransaction, { signers: [payer] });
  return { chain, payer, counter };
}

export function buildIncrement(example, overrides = {}) {
  const { chain, payer, counter } = example;
  const currentBox = overrides.input ?? counter.utxos.toArray()[0];
  const nextCount = overrides.count ?? readCount(currentBox) + 1;
  const output = new OutputBuilder(overrides.value ?? currentBox.value,
    overrides.recipient ?? counterTree.toAddress())
    .addTokens(overrides.assets ?? currentBox.assets)
    .setAdditionalRegisters({ R4: SInt(nextCount).toHex() });
  return new TransactionBuilder(chain.height)
    .from([currentBox, ...payer.utxos.toArray()])
    .to(output)
    .sendChangeTo(payer.address)
    .payFee(fee)
    .build();
}

export function increment(example) {
  const transaction = buildIncrement(example);
  example.chain.execute(transaction, { signers: [example.payer] });
  return example.counter.utxos.toArray()[0];
}
