import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import { FeeRegistry } from "../target/types/fee_registry";

describe("fee_registry", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.feeRegistry as Program<FeeRegistry>;

  it("Is initialized!", async () => {
    const tokensOwner = anchor.web3.Keypair.generate();

    const sig = await program.provider.connection.requestAirdrop(
      tokensOwner.publicKey,
      1000 * LAMPORTS_PER_SOL
    );

    await program.provider.connection.confirmTransaction(sig, "confirmed");

    try {
      const sig = await program.methods
        .initializeProject(
          {
            name: "VikiToken",
            symbol: "VIK",
            uri: "https://some-uri.vik/alabalanica.json",
          },
          new anchor.BN(1000000)
        )
        .accounts({
          owner: tokensOwner.publicKey,
        })
        .signers([tokensOwner])
        .rpc();

      console.log("Your transaction signature", sig);
    } catch (err) {
      console.log("PeePee PooPoo man");

      console.log(await err.getLogs());
      throw err;
    }

    const [mintPDA] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("mint_account"), tokensOwner.publicKey.toBuffer()],
      program.programId
    );

    const [accountPDA] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("mint_auth"), tokensOwner.publicKey.toBuffer()],
      program.programId
    );
    const account = await program.account.mintAccountPda.fetch(accountPDA);

    console.log("ETO GO BEEEEEEEEEE ", account);
  });
});
