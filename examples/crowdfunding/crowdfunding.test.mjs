import { MockChain } from "@fleet-sdk/mock-chain";
import {
  TransactionBuilder,
  OutputBuilder,
  ErgoAddress,
  RECOMMENDED_MIN_FEE_VALUE
} from "@fleet-sdk/core";
import { compile } from "@fleet-sdk/compiler";
import { SInt, SLong, SGroupElement } from "@fleet-sdk/serializer";
import assert from "node:assert";

const SCRIPT = `{
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

const GOAL = 2_000_000_000n;

function setup() {
  const chain = new MockChain({ height: 1_000_000 });
  const alice = chain.newParty("Alice");
  const bob = chain.newParty("Bob");
  const project = chain.newParty("Project");
  alice.addBalance({ nanoergs: 5_000_000_000n });
  bob.addBalance({ nanoergs: 5_000_000_000n });
  const pub = (p) => ErgoAddress.fromBase58(p.address.toString()).getPublicKeys()[0];
  const contract = compile(SCRIPT);
  const DEADLINE = chain.height + 100;
  const regs = () => ({
    R4: SInt(DEADLINE).toHex(),
    R5: SGroupElement(pub(alice)).toHex(),
    R6: SGroupElement(pub(project)).toHex(),
    R7: SLong(GOAL).toHex()
  });
  const campaign = chain.addParty(contract.toHex(), "Campaign");
  return { chain, alice, bob, project, contract, regs, campaign, DEADLINE };
}

function createCampaign({ chain, alice, contract, regs }, amount) {
  const tx = new TransactionBuilder(chain.height)
    .from(alice.utxos.toArray())
    .to(new OutputBuilder(amount, contract).setAdditionalRegisters(regs()))
    .sendChangeTo(alice.address)
    .payFee(RECOMMENDED_MIN_FEE_VALUE)
    .build();
  return chain.execute(tx, { signers: [alice] });
}

function pledge(ctx, backer, amount) {
  const box = ctx.campaign.utxos.toArray()[0];
  const tx = new TransactionBuilder(ctx.chain.height)
    .from([box, ...backer.utxos.toArray()])
    .to(new OutputBuilder(box.value + amount, ctx.contract).setAdditionalRegisters(ctx.regs()))
    .sendChangeTo(backer.address)
    .payFee(RECOMMENDED_MIN_FEE_VALUE)
    .build();
  return ctx.chain.execute(tx, { signers: [backer] });
}

function collect(ctx) {
  const box = ctx.campaign.utxos.toArray()[0];
  const tx = new TransactionBuilder(ctx.chain.height)
    .from(box)
    .to(new OutputBuilder(box.value - RECOMMENDED_MIN_FEE_VALUE, ctx.project.address.toString()))
    .payFee(RECOMMENDED_MIN_FEE_VALUE)
    .build();
  return ctx.chain.execute(tx, { signers: [ctx.project] });
}

function refund(ctx) {
  const box = ctx.campaign.utxos.toArray()[0];
  const tx = new TransactionBuilder(ctx.chain.height)
    .from(box)
    .to(new OutputBuilder(box.value - RECOMMENDED_MIN_FEE_VALUE, ctx.alice.address.toString()))
    .payFee(RECOMMENDED_MIN_FEE_VALUE)
    .build();
  return ctx.chain.execute(tx, { signers: [ctx.alice] });
}

function attempt(fn) {
  try { return fn(); } catch { return false; }
}

// 1: pledge before deadline works
{
  const ctx = setup();
  assert.equal(createCampaign(ctx, 1_000_000_000n), true);
  assert.equal(pledge(ctx, ctx.bob, 1_500_000_000n), true);
  assert.equal(ctx.campaign.utxos.toArray()[0].value, 2_500_000_000n);
  console.log("ok 1 - pledge before deadline");
}
// 2: pledge after deadline rejected
{
  const ctx = setup();
  createCampaign(ctx, 1_000_000_000n);
  ctx.chain.newBlocks(101);
  assert.equal(attempt(() => pledge(ctx, ctx.bob, 1_500_000_000n)), false);
  console.log("ok 2 - pledge after deadline rejected");
}
// 3: collect before deadline rejected
{
  const ctx = setup();
  createCampaign(ctx, 2_500_000_000n);
  assert.equal(attempt(() => collect(ctx)), false);
  console.log("ok 3 - collect before deadline rejected");
}
// 4: collect below goal rejected
{
  const ctx = setup();
  createCampaign(ctx, 1_000_000_000n);
  ctx.chain.newBlocks(101);
  assert.equal(attempt(() => collect(ctx)), false);
  console.log("ok 4 - collect below goal rejected");
}
// 5: refund after deadline when below goal
{
  const ctx = setup();
  createCampaign(ctx, 1_000_000_000n);
  ctx.chain.newBlocks(101);
  assert.equal(refund(ctx), true);
  console.log("ok 5 - refund after deadline below goal");
}
// 6: refund rejected when goal met
{
  const ctx = setup();
  createCampaign(ctx, 2_500_000_000n);
  ctx.chain.newBlocks(101);
  assert.equal(attempt(() => refund(ctx)), false);
  console.log("ok 6 - refund rejected when goal met");
}
console.log("all tests passed");
