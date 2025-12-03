import { createClient } from "@/client";
import {
  address,
  appendTransactionMessageInstruction,
  assertAccountExists,
  assertIsSendableTransaction,
  assertIsTransactionWithBlockhashLifetime,
  createTransactionMessage,
  fetchEncodedAccount,
  getSignatureFromTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Address,
} from "@solana/kit";
import { TOKEN_ADDRESS_RAW } from "./constants";
import {
  getMintToInstruction,
  getMintCodec,
  findAssociatedTokenPda,
  TOKEN_2022_PROGRAM_ADDRESS,
  type Mint,
} from "@solana-program/token-2022";

async function main(ataOwner?: Address<string>) {
  const client = await createClient();
  const owner = ataOwner || client.wallet.address;

  const mintAddress = address(TOKEN_ADDRESS_RAW);

  const amount = 10_000_000n;

  const [treasuryAccountAddress] = await findAssociatedTokenPda({
    mint: mintAddress,
    owner,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  });

  const mintTokensIx = getMintToInstruction({
    mint: mintAddress,
    mintAuthority: client.wallet.address,
    amount,
    token: treasuryAccountAddress,
  });

  const { value: latestBHash } = await client.rpc
    .getLatestBlockhash({ commitment: "confirmed" })
    .send();

  const txMessage = await pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBHash, tx),
    (tx) => setTransactionMessageFeePayerSigner(client.wallet, tx),
    // (tx) => addSignersToTransactionMessage([client.wallet], tx),
    (tx) => appendTransactionMessageInstruction(mintTokensIx, tx),
    (tx) => client.estimateAndSetComputeUnitLimit(tx),
  );

  const transaction = await signTransactionMessageWithSigners(txMessage);

  assertIsSendableTransaction(transaction);
  assertIsTransactionWithBlockhashLifetime(transaction);

  await client.sendAndConfirmTransaction(transaction, {
    commitment: "confirmed",
  });

  const transactionSignature = getSignatureFromTransaction(transaction);

  console.log(`Minted ${amount} to ${treasuryAccountAddress} ATA.`);
  console.log(`Transaction signature is: ${transactionSignature}`);

  const mintAccount = await fetchEncodedAccount(client.rpc, mintAddress);
  assertAccountExists(mintAccount);

  const mintCodec = getMintCodec();
  const decodedData = mintCodec.decode(mintAccount.data);

  decodedData satisfies Mint;

  const totalTokens = decodedData.supply / BigInt(Math.pow(10, 6));
  console.log("Total tokens cirulating: ", totalTokens.toString());
}

main();
