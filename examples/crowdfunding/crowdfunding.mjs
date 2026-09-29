import { MockChain } from "@fleet-sdk/mock-chain";
import {
  TransactionBuilder,
  OutputBuilder,
  ErgoAddress,
  RECOMMENDED_MIN_FEE_VALUE
} from "@fleet-sdk/core";
import { compile } from "@fleet-sdk/compiler";
import { SInt, SLong, SGroupElement } from "@fleet-sdk/serializer";

const chain = new MockChain({ height: 1_000_000 });
const alice = chain.newParty("Alice (backer)");
const bob = chain.newParty("Bob (backer)");
const project = chain.newParty("Project");

alice.addBalance({ nanoergs: 5_000_000_000n });
bob.addBalance({ nanoergs: 5_000_000_000n });

const pub = (party) =>
  ErgoAddress.fromBase58(party.address.toString()).getPublicKeys()[0];

const DEADLINE = chain.height + 100;                 // Int
const GOAL = 2_000_000_000n;                          // 2 ERG

const script = `{
  val deadline = SELF.R4[Int].get
  val backer = SELF.R5[GroupElement].get
  val projectKey = SELF.R6[GroupElement].get
  val goal = SELF.R7[Long].get

  val raiseMore = sigmaProp({
    val out = OUTPUTS(0)
    out.propositionBytes == SELF.propositionBytes &&
    out.R4[Int].get == deadline &&
    out.R5[GroupElement].get == backer &&
    out.R6[GroupElement].get == projectKey &&
    out.R7[Long].get == goal &&
    out.value > SELF.value &&
    HEIGHT < deadline
  })

  val success = sigmaProp(HEIGHT >= deadline && SELF.value >= goal) && proveDlog(projectKey)
  val refund  = sigmaProp(HEIGHT >= deadline && SELF.value < goal)  && proveDlog(backer)

  raiseMore || success || refund
}`;

const contract = compile(script);

const regs = () => ({
  R4: SInt(DEADLINE).toHex(),
  R5: SGroupElement(pub(alice)).toHex(),
  R6: SGroupElement(pub(project)).toHex(),
  R7: SLong(GOAL).toHex()
});

const campaign = chain.addParty(contract.toHex(), "Campaign");

// 1) Alice opens the campaign with 1 ERG
const PLEDGE1 = 1_000_000_000n;
const tx1 = new TransactionBuilder(chain.height)
  .from(alice.utxos.toArray())
  .to(new OutputBuilder(PLEDGE1, contract).setAdditionalRegisters(regs()))
  .sendChangeTo(alice.address)
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();
console.log("create:", chain.execute(tx1, { signers: [alice] }));

const campaignBox = () => campaign.utxos.toArray()[0];

// 2) Bob pledges 1.5 ERG (extends the same box)
const PLEDGE2 = 1_500_000_000n;
const box1 = campaignBox();
const tx2 = new TransactionBuilder(chain.height)
  .from([box1, ...bob.utxos.toArray()])
  .to(new OutputBuilder(box1.value + PLEDGE2, contract).setAdditionalRegisters(regs()))
  .sendChangeTo(bob.address)
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();
console.log("pledge:", chain.execute(tx2, { signers: [bob] }));

// 3) deadline passes
chain.newBlocks(101);

// 4) success path: project collects 2.5 ERG (>= 2 ERG goal)
const box2 = campaignBox();
console.log("campaign value (nanoERG):", box2.value.toString(), "height:", chain.height);
const tx3 = new TransactionBuilder(chain.height)
  .from(box2)
  .to(new OutputBuilder(box2.value - RECOMMENDED_MIN_FEE_VALUE, project.address.toString()))
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();
console.log("collect:", chain.execute(tx3, { signers: [project] }));
console.log("project balance:", project.balance.nanoergs.toString());
