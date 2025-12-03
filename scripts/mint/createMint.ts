import { generateKeyPairSigner, pipe } from "@solana/kit";
import type { Client } from "../client";
import {
  createTransferFeeConfig,
  createInitializeTransferFeeInstruction,
} from "./transferFees";
import { createMintAccountInstruction } from "./account";
import { createInitializeMintInstruction } from "./initialize";
import { buildTransactionMessage } from "../transactions/builder";
import { signAndSendTransaction } from "../transactions/sender";

/**
 * Step 1: Generate a new keypair for the mint
 */
async function generateMintKeypair() {
  return await generateKeyPairSigner();
}

/**
 * Step 2: Create all the instructions needed to create the mint
 */
async function createMintInstructions(mint: any, client: Client) {
  const transferFeeExtension = createTransferFeeConfig(client.wallet.address);

  const createAccountInstruction = await createMintAccountInstruction(
    mint,
    client.wallet,
    [transferFeeExtension],
    client.rpc,
  );

  const initializeTransferFeeInstruction =
    createInitializeTransferFeeInstruction(mint.address, client.wallet.address);

  const initializeMintInstruction = createInitializeMintInstruction(
    mint.address,
    client.wallet.address,
  );

  return [
    createAccountInstruction,
    initializeTransferFeeInstruction,
    initializeMintInstruction,
  ];
}

/**
 * Step 3: Build the transaction
 */
async function buildMintTransaction(instructions: any[], client: Client) {
  const transactionMessage = await buildTransactionMessage(
    instructions,
    client.wallet,
    client.rpc,
  );

  return await client.estimateAndSetComputeUnitLimit(transactionMessage);
}

/**
 * Step 4: Sign and send the transaction
 */
async function sendMintTransaction(transactionMessage: any, client: Client) {
  await signAndSendTransaction(
    transactionMessage,
    client.rpc,
    client.rpcSubscriptions,
  );
}

/**
 * Creates a new mint with transfer fees
 */
export async function createMint(client: Client) {
  const mint = await generateMintKeypair();

  const instructions = await createMintInstructions(mint, client);

  const transactionMessage = await buildMintTransaction(instructions, client);

  await sendMintTransaction(transactionMessage, client);

  console.log("The mint address is:", mint.address);

  return mint.address;
}
