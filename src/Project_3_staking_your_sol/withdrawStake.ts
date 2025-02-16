import { Connection, Keypair, LAMPORTS_PER_SOL, StakeProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import * as dotenv from "dotenv";
import * as fs from "fs";

/**
 *  Load environment variables from .env config file
 */
dotenv.config();

/**
 *  Create a connection to solana devnet.
 *  You can use the solanaRpc from Helius or clusterApiUrl("devnet")
 */
const solanaRpc = process.env.HELIUS_HTTPS_URI_DEVNET || "";
const devConnection = new Connection(solanaRpc, "finalized");

/**
 *  Import our wallet based on the keypair that we created and stored in wallet.json
 */
const secretKeyFromFile = Uint8Array.from(JSON.parse(fs.readFileSync("src/wallet.json", "utf-8")));
const wallet = Keypair.fromSecretKey(secretKeyFromFile);

/**
 *  Function to withdraw our stake
 */
async function withdrawStake(): Promise<void> {
  if (fs.existsSync("src/stakeAccount.json")) {
    const secretKeyFromFile = Uint8Array.from(JSON.parse(fs.readFileSync("src/stakeAccount.json", "utf-8")));
    const stakeAccount = Keypair.fromSecretKey(secretKeyFromFile);

    /**
     *  Get our current stake balance
     */
    let stakeBalance = await devConnection.getBalance(stakeAccount.publicKey);
    console.log(`🥩 Current stake account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);

    /**
     *  Create a transaction to withdraw our stake
     */
    const withdrawStakeTx = StakeProgram.withdraw({
      stakePubkey: stakeAccount.publicKey,
      authorizedPubkey: wallet.publicKey,
      toPubkey: wallet.publicKey,
      lamports: stakeBalance,
    });

    /**
     *  Confirm this transaction to withdraw our stake
     */
    const withdrawStakeTxId = await sendAndConfirmTransaction(devConnection, withdrawStakeTx, [wallet]);
    console.log(`📃 Stake account withdrawn. Transaction: ${withdrawStakeTxId}`);

    /**
     *  Get our current stake balance
     */
    stakeBalance = await devConnection.getBalance(stakeAccount.publicKey);
    console.log(`🥩 New stake account balance for: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);
  } else {
    console.log("🚫 Cannot remove stake because no stake account keypair was found.");
    return;
  }
}

async function runMain(): Promise<void> {
  try {
    await withdrawStake();
  } catch (error) {
    console.log(error);
  }
}

runMain();
