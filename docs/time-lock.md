# Time-Locked Box (Single-Interaction Example)

A time-lock contract holds ERG or tokens in an eUTxO box until the blockchain reaches a target block height (`HEIGHT`), after which the designated beneficiary can unlock and spend the funds in a single transaction.

## Contract Design Using Registers

Storing the unlock block height in `R4` (`Int`) and the beneficiary's public key in `R5` (`GroupElement`) lets any number of users lock boxes under a single shared contract address:

```scala
{
  val unlockHeight = SELF.R4[Int].get
  val beneficiary  = SELF.R5[GroupElement].get

  sigmaProp(HEIGHT >= unlockHeight) && proveDlog(beneficiary)
}
```

```sh
npm install @fleet-sdk/core @fleet-sdk/compiler @fleet-sdk/serializer @fleet-sdk/mock-chain
```

## Complete Runnable Example (`MockChain`)

The script below compiles the time-lock contract, locks `5 ERG` until block `800,100`, verifies that an early withdrawal at block `800,050` is rejected, advances the chain to `800,100`, and completes the withdrawal:

```ts
import { compile } from "@fleet-sdk/compiler";
import {
  OutputBuilder,
  RECOMMENDED_MIN_FEE_VALUE,
  TransactionBuilder
} from "@fleet-sdk/core";
import { MockChain } from "@fleet-sdk/mock-chain";
import { SGroupElement, SInt } from "@fleet-sdk/serializer";

const TIME_LOCK_SCRIPT = `
  {
    val unlockHeight = SELF.R4[Int].get
    val beneficiary  = SELF.R5[GroupElement].get
    sigmaProp(HEIGHT >= unlockHeight) && proveDlog(beneficiary)
  }
`;

const mockChain = new MockChain({ height: 800_000 });
const depositor = mockChain.newParty("Depositor");
const beneficiary = mockChain.newParty("Beneficiary");

depositor.addBalance({ nanoergs: 10_000_000_000n });
beneficiary.addBalance({ nanoergs: 1_000_000_000n }); // fee coverage

const timeLockTree = compile(TIME_LOCK_SCRIPT);
const timeLockContract = mockChain.addParty(timeLockTree.toHex(), "TimeLock");

const unlockHeight = 800_100;
const lockedAmount = 5_000_000_000n; // 5 ERG
const [beneficiaryPk] = beneficiary.address.getPublicKeys();

// 1. Lock 5 ERG until block 800,100
const lockTx = new TransactionBuilder(mockChain.height)
  .from(depositor.utxos.toArray())
  .to(
    new OutputBuilder(lockedAmount, timeLockTree).setAdditionalRegisters({
      R4: SInt(unlockHeight).toHex(),
      R5: SGroupElement(beneficiaryPk).toHex()
    })
  )
  .sendChangeTo(depositor.address)
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();

mockChain.execute(lockTx, { signers: [depositor] });

// 2. Attempt early unlock at block 800,050 -> rejected (false)
mockChain.jumpTo(800_050);
const lockedBox = timeLockContract.utxos.toArray()[0];

const buildUnlockTx = () =>
  new TransactionBuilder(mockChain.height)
    .from([lockedBox, ...beneficiary.utxos.toArray()])
    .to(new OutputBuilder(lockedAmount, beneficiary.address))
    .sendChangeTo(beneficiary.address)
    .payFee(RECOMMENDED_MIN_FEE_VALUE)
    .build();

const earlyAttempt = mockChain.execute(buildUnlockTx(), {
  signers: [beneficiary],
  throw: false
});
console.log("Early unlock at 800,050:", earlyAttempt); // false

// 3. Advance to block 800,100 and claim funds -> accepted (true)
mockChain.jumpTo(unlockHeight);
const validClaim = mockChain.execute(buildUnlockTx(), {
  signers: [beneficiary]
});
console.log("Unlock at 800,100:", validClaim); // true
```
