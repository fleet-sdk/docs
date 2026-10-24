// Send ERG to a wallet (testnet). Pass height from your node/wallet provider.
import { ErgoAddress, OutputBuilder, RECOMMENDED_MIN_FEE_VALUE, TransactionBuilder, type Box } from "@fleet-sdk/core";

export function sendToWallet(
  inputs: Box<string>[],
  recipient: string,
  amountNanoErg: bigint,
  changeAddress: string,
  creationHeight: number
) {
  if (!ErgoAddress.validate(recipient)) throw new Error("Invalid recipient address");
  if (!ErgoAddress.validate(changeAddress)) throw new Error("Invalid change address");

  return new TransactionBuilder(creationHeight)
    .from(inputs)
    .to(new OutputBuilder(amountNanoErg, recipient))
    .sendChangeTo(changeAddress)
    .payFee(RECOMMENDED_MIN_FEE_VALUE)
    .build()
    .toEIP12Object();
}
