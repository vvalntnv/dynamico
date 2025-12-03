import { createClient } from "@/client";
import {
  address,
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  assertIsSendableTransaction,
  assertIsTransactionWithBlockhashLifetime,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Instruction,
} from "@solana/kit";
import { TOKEN_ADDRESS_RAW } from "./constants";
import {
  fetchToken,
  findAssociatedTokenPda,
  getCreateAssociatedTokenInstruction,
  getTransferCheckedInstruction,
  getWithdrawWithheldTokensFromAccountsInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "@solana-program/token-2022";

async function main() {
  const client = await createClient();
  const mintAddress = address(TOKEN_ADDRESS_RAW);

  // If no recipient provided, use wallet address (transfer to self for testing)
  const recipient = await generateKeyPairSigner();

  console.log(`\n=== Token Transfer Script ===`);
  console.log(`Mint: ${mintAddress}`);
  console.log(`Sender: ${client.wallet.address}`);
  console.log(`Recipient: ${recipient}`);

  // Find associated token accounts for sender and recipient
  const [senderAta] = await findAssociatedTokenPda({
    mint: mintAddress,
    owner: client.wallet.address,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  });

  const [recipientAta] = await findAssociatedTokenPda({
    mint: mintAddress,
    owner: recipient.address,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  });

  console.log(`\nSender ATA: ${senderAta}`);
  console.log(`Recipient ATA: ${recipientAta}`);

  // Check if recipient ATA exists, if not, create it
  const instructions: Instruction[] = [];
  try {
    await fetchToken(client.rpc, recipientAta);
    console.log(`Recipient ATA already exists`);
  } catch (error) {
    console.log(`Creating recipient ATA...`);
    const createAtaIx = getCreateAssociatedTokenInstruction({
      mint: mintAddress,
      owner: recipient.address,
      ata: recipientAta,
      payer: client.wallet,
    });
    instructions.push(createAtaIx);
  }

  // Check sender's balance before transfer
  const senderTokenAccount = await fetchToken(client.rpc, senderAta);
  const initialBalance = senderTokenAccount.data.amount;
  console.log(`\nSender initial balance: ${initialBalance}`);

  // Amount to transfer (1 token with 6 decimals)
  const transferAmount = 1_000_000n;

  // Create transfer instruction using TransferChecked
  const transferIx = getTransferCheckedInstruction({
    source: senderAta,
    mint: mintAddress,
    authority: client.wallet,
    amount: transferAmount,
    destination: recipientAta,
    decimals: 6,
  });

  instructions.push(transferIx);

  // Build and send transfer transaction
  const { value: latestBHash } = await client.rpc
    .getLatestBlockhash({ commitment: "confirmed" })
    .send();

  const transferTxMessage = await pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBHash, tx),
    (tx) => setTransactionMessageFeePayerSigner(client.wallet, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx),
    (tx) => client.estimateAndSetComputeUnitLimit(tx),
  );

  const transferTransaction =
    await signTransactionMessageWithSigners(transferTxMessage);

  assertIsSendableTransaction(transferTransaction);
  assertIsTransactionWithBlockhashLifetime(transferTransaction);

  console.log(`\nSending transfer transaction...`);
  await client.sendAndConfirmTransaction(transferTransaction, {
    commitment: "confirmed",
  });

  const transferSignature = getSignatureFromTransaction(transferTransaction);
  console.log(`\n✓ Transfer successful!`);
  console.log(`  Amount transferred: ${transferAmount} (1 token)`);
  console.log(`  Transaction: ${transferSignature}`);

  // Check balances after transfer
  const senderTokenAccountAfter = await fetchToken(client.rpc, senderAta);
  const recipientTokenAccount = await fetchToken(client.rpc, recipientAta);

  console.log(`\n=== Balances After Transfer ===`);
  console.log(`  Sender: ${senderTokenAccountAfter.data.amount}`);
  console.log(`  Recipient: ${recipientTokenAccount.data.amount}`);

  // Check for withheld fees in the recipient account
  // const withheldAmount = recipientTokenAccount.data.withheldAmount;
  // console.log(`\n=== Withheld Fees Detected ===`);
  // console.log(`  Amount: ${withheldAmount}`);
  // console.log(`  Withdrawing to sender's account...`);

  // Withdraw withheld fees from recipient account back to sender
  const withdrawIx = getWithdrawWithheldTokensFromAccountsInstruction({
    mint: mintAddress,
    feeReceiver: senderAta,
    numTokenAccounts: 1,
    withdrawWithheldAuthority: client.wallet,
    sources: [recipientAta],
  });

  const { value: withdrawBHash } = await client.rpc
    .getLatestBlockhash({ commitment: "confirmed" })
    .send();

  const withdrawTxMessage = await pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(withdrawBHash, tx),
    (tx) => setTransactionMessageFeePayerSigner(client.wallet, tx),
    (tx) => appendTransactionMessageInstruction(withdrawIx, tx),
    (tx) => client.estimateAndSetComputeUnitLimit(tx),
  );

  const withdrawTransaction =
    await signTransactionMessageWithSigners(withdrawTxMessage);

  assertIsSendableTransaction(withdrawTransaction);
  assertIsTransactionWithBlockhashLifetime(withdrawTransaction);

  await client.sendAndConfirmTransaction(withdrawTransaction, {
    commitment: "confirmed",
  });

  const withdrawSignature = getSignatureFromTransaction(withdrawTransaction);
  console.log(`\n✓ Fees withdrawn successfully!`);
  console.log(`  Transaction: ${withdrawSignature}`);

  // Check final balances after fee withdrawal
  const senderFinal = await fetchToken(client.rpc, senderAta);
  const recipientFinal = await fetchToken(client.rpc, recipientAta);

  console.log(`\n=== Final Balances After Fee Withdrawal ===`);
  console.log(`  Sender: ${senderFinal.data.amount}`);
  console.log(`  Recipient: ${recipientFinal.data.amount}`);

  const stringifedData = JSON.stringify(
    senderFinal.data,
    (_, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }

      return value;
    },
    4,
  );
  console.log(`Recipient Data: ${stringifedData}`);
}

main();
