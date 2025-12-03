import {
  createTransactionMessage,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  pipe,
  type TransactionSigner,
  type MessageSigner,
  type Rpc,
  type SolanaRpcApi,
  Instruction,
} from "@solana/kit";

/**
 * Gets the latest blockhash from the network
 */
export async function getLatestBlockhash(rpc: Rpc<SolanaRpcApi>) {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
  return latestBlockhash;
}

/**
 * Builds a transaction message with the given instructions
 */
export async function buildTransactionMessage(
  instructions: Instruction[],
  wallet: TransactionSigner & MessageSigner,
  rpc: Rpc<SolanaRpcApi>,
) {
  const latestBlockhash = await getLatestBlockhash(rpc);

  return pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(wallet, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx),
  );
}
