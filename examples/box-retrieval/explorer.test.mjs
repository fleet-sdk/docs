import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ErgoBox, OutputBuilder, SInt, TransactionBuilder } from '@fleet-sdk/core';
import { fetchBoxPage, parseExplorerPage, toFleetBox } from './explorer.mjs';

const responseText = readFileSync(new URL('./fixtures/explorer-token-page.json', import.meta.url), 'utf8');
const address = '9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j';
const tokenId = '22'.repeat(32);
function explorerFixture() {
  const box = new ErgoBox(new OutputBuilder('10000000', address, 1000)
    .addTokens({ tokenId, amount: '9007199254740993' })
    .setAdditionalRegisters({ R4: SInt(7) }).build(), '11'.repeat(32), 0).toPlainObject('EIP-12');
  return { ...box, additionalRegisters: { R4: { serializedValue: box.additionalRegisters.R4,
    sigmaType: 'SInt', renderedValue: '7' } }, address, mainChain: true };
}

test('real public Explorer response preserves large integer amounts and matches box hashes', () => {
  const { boxes, total } = parseExplorerPage(responseText);
  assert.equal(total, 5);
  assert.equal(boxes.length, 2);
  assert.equal(boxes[0].assets[5].amount, '47997989999998290');
  assert.ok(boxes.every((box) => new ErgoBox(box).isValid()));
  assert.equal(typeof boxes[0].value, 'string');
  assert.equal('address' in boxes[0], false);
});

test('Explorer register metadata becomes serialized values; exact strings remain exact', () => {
  const box = toFleetBox(explorerFixture());
  assert.deepEqual(box.additionalRegisters, { R4: SInt(7).toHex() });
  assert.equal(box.assets[0].amount, '9007199254740993');
  assert.ok(ErgoBox.validate(box));
});

test('already rounded numbers and inconsistent box content are rejected', () => {
  const rounded = explorerFixture();
  rounded.assets[0].amount = Number('9007199254740993');
  assert.throws(() => toFleetBox(rounded), /exact integer/);
  const changed = explorerFixture();
  changed.value = '10000001';
  assert.throws(() => toFleetBox(changed), /does not match boxId/);
});

test('fractional JSON lexemes cannot round into accepted integer fields', () => {
  const text = JSON.stringify({ total: 1, items: [explorerFixture()] });
  const fractionalValue = text.replace('"value":"10000000"', '"value":10000000.0000000001');
  assert.notEqual(fractionalValue, text);
  assert.throws(() => parseExplorerPage(fractionalValue), /value must be a non-negative integer/);
  assert.throws(() => parseExplorerPage('{"total":0.00000000000000000001,"items":[]}'), /page.total must be/);
});

test('register gaps are rejected and dense registers are projected in numeric order', () => {
  const source = explorerFixture();
  source.additionalRegisters = { R5: source.additionalRegisters.R4 };
  assert.throws(() => toFleetBox(source), /densely packed/);
  const candidate = new ErgoBox(new OutputBuilder('10000000', address, 1000)
    .setAdditionalRegisters({ R4: SInt(7), R5: SInt(8) }).build(), '11'.repeat(32), 0)
    .toPlainObject('EIP-12');
  const reversed = { ...candidate, additionalRegisters: {
    R5: { serializedValue: candidate.additionalRegisters.R5 },
    R4: { serializedValue: candidate.additionalRegisters.R4 }
  } };
  assert.deepEqual(toFleetBox(reversed), candidate);
});

test('index and pinned SDK height bounds are checked before hashing', () => {
  for (const [name, value] of [['index', 65536], ['index', 2 ** 32],
    ['creationHeight', 2 ** 31], ['creationHeight', 1000 + 2 ** 32]]) {
    assert.throws(() => toFleetBox({ ...explorerFixture(), [name]: value }), new RegExp(`${name} is too large`));
  }
  const boundary = new ErgoBox(new OutputBuilder('10000000', address, 2147483647).build(),
    '11'.repeat(32), 65535).toPlainObject('EIP-12');
  assert.deepEqual(toFleetBox(boundary), boundary);
});

test('one page of address or token results passes pagination parameters and cancellation signal', async () => {
  const signal = new AbortController().signal;
  for (const query of [{ address: 'address/with?characters' }, { tokenId }]) {
    let requested;
    const page = await fetchBoxPage({ ...query, limit: 2, offset: 4, signal }, async (url, options) => {
      requested = { url, options };
      return new Response(responseText);
    });
    assert.equal(requested.url.search, '?limit=2&offset=4');
    assert.equal(requested.options.signal, signal);
    assert.equal(requested.url.pathname.split('/').at(-2), query.address ? 'byAddress' : 'byTokenId');
    assert.equal(decodeURIComponent(requested.url.pathname.split('/').at(-1)), query.address ?? tokenId);
    assert.equal(page.boxes.length, 2);
    assert.equal(page.offset, 4);
    assert.equal(page.total, 5);
  }
});

test('HTTP failures, malformed responses, and invalid query parameters fail explicitly', async () => {
  await assert.rejects(fetchBoxPage({ tokenId }, async () => new Response('unavailable', {status:503})), /HTTP 503/);
  assert.throws(() => parseExplorerPage('{"total":1,"items":null}'), /items must be an array/);
  await assert.rejects(fetchBoxPage({ tokenId, address }), /exactly one/);
  await assert.rejects(fetchBoxPage({ tokenId, limit:0 }), /limit 1/);
  const aborted = new Error('aborted by caller');
  await assert.rejects(fetchBoxPage({ tokenId }, async () => { throw aborted; }), (error) => error === aborted);
});

test('empty pages are a successful retrieval result', () => {
  assert.deepEqual(parseExplorerPage('{"total":0,"items":[]}'), {total:0, boxes:[]});
});

test('real Fleet transaction builder separates funding inputs from read-only data inputs', () => {
  const input = toFleetBox(explorerFixture());
  const dataInput = parseExplorerPage(responseText).boxes[0];
  const unsigned = new TransactionBuilder(1574819)
    .from([input]).withDataFrom([dataInput])
    .to(new OutputBuilder('1000000', address)).sendChangeTo(address).payMinFee()
    .build().toEIP12Object();
  assert.deepEqual(unsigned.inputs.map((box) => box.boxId), [input.boxId]);
  assert.deepEqual(unsigned.dataInputs, [dataInput]);
  const returned = unsigned.outputs.flatMap((box) => box.assets).filter((asset) => asset.tokenId === tokenId);
  assert.equal(returned.reduce((sum, asset) => sum + BigInt(asset.amount), 0n), 9007199254740993n);
});
