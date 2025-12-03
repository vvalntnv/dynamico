import * as solana from "@solana/kit";
import { createClient } from "./client";
import type { Client } from "./client";
import { getInitializeMintInstruction } from "@solana-program/token";
import { extension, getMintSize } from "@solana-program/token-2022";
import { getCreateAccountInstruction } from "@solana-program/system";
import {
  getInitializeTransferFeeConfigInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "@solana-program/token-2022";

async function main() {
  const client = await createClient();

  await createMint(client);
}

async function createMint(client: Client) {
  const mint = await solana.generateKeyPairSigner();

  const transferFees = {
    epoch: 0,
    transferFeeBasisPoints: 50,
    maximumFee: 50_000_000n,
  };

  const ext = extension("TransferFeeConfig", {
    transferFeeConfigAuthority: client.wallet.address,
    withdrawWithheldAuthority: client.wallet.address,
    withheldAmount: 0n,
    olderTransferFee: transferFees,
    newerTransferFee: transferFees,
  });

  const mintSize = getMintSize([ext]);
  const mintRent = await client.rpc
    .getMinimumBalanceForRentExemption(BigInt(mintSize))
    .send();

  const createAccIx = getCreateAccountInstruction({
    payer: client.wallet,
    newAccount: mint,
    space: mintSize,
    lamports: mintRent,
    programAddress: TOKEN_2022_PROGRAM_ADDRESS,
  });

  const initializeTransactionFeeIx = getInitializeTransferFeeConfigInstruction({
    mint: mint.address,
    withdrawWithheldAuthority: client.wallet.address,
    transferFeeConfigAuthority: client.wallet.address,
    transferFeeBasisPoints: ext.newerTransferFee.transferFeeBasisPoints,
    maximumFee: ext.newerTransferFee.maximumFee,
  });

  const initializeMintIx = getInitializeMintInstruction({
    mint: mint.address,
    decimals: 6,
    mintAuthority: client.wallet.address,
    freezeAuthority: client.wallet.address,
  });

  const { value: latestBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send();

  const transactionMessage = await solana.pipe(
    solana.createTransactionMessage({ version: 0 }),
    (tx) => solana.setTransactionMessageFeePayerSigner(client.wallet, tx),
    (tx) =>
      solana.setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) =>
      solana.appendTransactionMessageInstructions(
        [createAccIx, initializeTransactionFeeIx, initializeMintIx],
        tx,
      ),
    (tx) => client.estimateAndSetComputeUnitLimit(tx),
  );

  const transaction =
    await solana.signTransactionMessageWithSigners(transactionMessage);

  solana.assertIsSendableTransaction(transaction);
  solana.assertIsTransactionWithBlockhashLifetime(transaction);

  await client.sendAndConfirmTransaction(transaction, {
    commitment: "confirmed",
  });

  console.log("The mint address is: ", mint.address);
}

main();
