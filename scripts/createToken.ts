import * as solana from "@solana/kit";
import { createClient } from "@/client";
import type { Client } from "@/client";
import { findAssociatedTokenPda } from "@solana-program/token";
import {
  extension,
  getCreateAssociatedTokenInstruction,
  getMintSize,
} from "@solana-program/token-2022";
import { getCreateAccountInstruction } from "@solana-program/system";
import {
  getInitializeTransferFeeConfigInstruction,
  getInitializeMintInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "@solana-program/token-2022";

async function main() {
  const client = await createClient();

  await createMint(client);
}

async function createMint(client: Client) {
  const mint = await solana.generateKeyPairSigner();
  console.log("minter data: ", mint.address);

  const transferFees = {
    epoch: 0,
    transferFeeBasisPoints: 50,
    maximumFee: 50_000_000n,
  };

  const [treasuryAccountAddress, bump] = await findAssociatedTokenPda({
    mint: mint.address,
    owner: client.wallet.address,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  });

  console.log(
    `Treasury account data: ${treasuryAccountAddress.toString()}. ` +
      `And the bump :p ${bump.toString()}`,
  );

  const createTreasureIx = getCreateAssociatedTokenInstruction({
    payer: client.wallet,
    mint: mint.address,
    owner: client.wallet.address,
    ata: treasuryAccountAddress,
  });

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

  console.log("Mint rent: ", mintRent);
  const createAccIx = getCreateAccountInstruction({
    payer: client.wallet,
    newAccount: mint,
    space: mintSize,
    lamports: mintRent,
    programAddress: TOKEN_2022_PROGRAM_ADDRESS,
  });

  const initializeTransactionFeeIx = getInitializeTransferFeeConfigInstruction({
    mint: mint.address,
    withdrawWithheldAuthority: ext.withdrawWithheldAuthority,
    transferFeeConfigAuthority: ext.transferFeeConfigAuthority,
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
        [
          createAccIx,
          initializeTransactionFeeIx,
          initializeMintIx,
          createTreasureIx,
        ],
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

  const transactionSignature = solana.getSignatureFromTransaction(transaction);

  console.log("Tx signature", transactionSignature);
  console.log("The mint address is: ", mint.address);
}

main();
