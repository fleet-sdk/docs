import { readFile } from 'node:fs/promises';
import { ErgoAddress, ErgoBox, OutputBuilder, TransactionBuilder } from '@fleet-sdk/core';
import { fetchBoxPage, parseExplorerPage } from './explorer.mjs';

const tokenId = 'f60bff91f7ae3f3a5f0c2d35b46ef8991f213a61d7f7e453d344fa52a42d9f9a';
const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--live') || args.length > 1) {
  console.error('Usage: node demo.mjs [--live]');
  process.exitCode = 2;
} else {
  try {
    const page = args.includes('--live')
      ? await fetchBoxPage({ tokenId, limit: 2, signal: AbortSignal.timeout(10000) })
      : parseExplorerPage(await readFile(new URL('./fixtures/explorer-token-page.json', import.meta.url), 'utf8'));
    console.log(JSON.stringify({ mode: args.length ? 'live public GET' : 'recorded public response',
      totalAtQueryTime: page.total, boxesInThisPage: page.boxes.length,
      boxes: page.boxes.map((box) => ({ boxId: box.boxId, value: box.value, assets: box.assets.length })) }, null, 2));

    if (page.boxes.length === 0) {
      console.log('No unspent boxes in this page; there is nothing to use as a data input.');
    } else {
      // Synthetic funding input: its transactionId does not identify a real UTXO.
      // The real public box is a READ-ONLY data input, never a funding source here.
      const address = ErgoAddress.fromErgoTree(page.boxes[0].ergoTree).toString();
      const height = page.boxes[0].creationHeight;
      const funding = new ErgoBox(new OutputBuilder('10000000', address, height).build(), '11'.repeat(32), 0);
      const unsigned = new TransactionBuilder(height)
        .from([funding])
        .withDataFrom([page.boxes[0]])
        .to(new OutputBuilder('1000000', address))
        .sendChangeTo(address)
        .payMinFee()
        .build()
        .toEIP12Object();
      console.log(JSON.stringify({ demonstration: 'unsigned only; synthetic funding; no chain submission',
        fundingInputs: unsigned.inputs.map((box) => box.boxId), dataInputs: unsigned.dataInputs.map((box) => box.boxId),
        outputValues: unsigned.outputs.map((box) => box.value) }, null, 2));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
