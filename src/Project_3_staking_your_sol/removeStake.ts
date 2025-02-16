import { getStakeActivation } from "@anza-xyz/solana-rpc-get-stake-activation";
import { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, StakeProgram, Authorized, Lockup, sendAndConfirmTransaction } from "@solana/web3.js";
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
 *  Validator that we will use to remove our stake
 */
const favoriteValidator = "2u83Dx5qPV4QnujjJQv8v2SoqG1ixuAxPK5Jwhtkovd1";
const favoriteValidatorPubKey = new PublicKey(favoriteValidator);

/**
 *  Function to remove our stake
 */
async function removeStake(): Promise<void> {
  if (fs.existsSync("src/stakeAccount.json")) {
    const secretKeyFromFile = Uint8Array.from(JSON.parse(fs.readFileSync("src/stakeAccount.json", "utf-8")));
    const stakeAccount = Keypair.fromSecretKey(secretKeyFromFile);

    /**
     *  Check the status for our stake
     */
    let stakeStatus = await getStakeActivation(devConnection, stakeAccount.publicKey);
    console.log(`🥩 Stake status: ${stakeStatus.status}`);

    /**
     *  Deletegate our stake if we found a favorite validator
     */
    if (!favoriteValidator) console.log("🚫 Cannot delegate stake because no validator was set.");
    if (favoriteValidator) {
      /**
       *  Unstake
       */
      const removeStakeTx = StakeProgram.deactivate({ stakePubkey: stakeAccount.publicKey, authorizedPubkey: wallet.publicKey });
      const removeStakeTxId = await sendAndConfirmTransaction(devConnection, removeStakeTx, [wallet]);
      console.log(`🥩 Stake account deactivated for: ${favoriteValidatorPubKey}\n Transaction: ${removeStakeTxId}`);

      /**
       *  Check the status for our stake
       */
      stakeStatus = await getStakeActivation(devConnection, stakeAccount.publicKey);
      console.log(`🥩 Stake status: ${stakeStatus.status}`);
    }
  } else {
    console.log("🚫 Cannot remove stake because no stake account keypair was found.");
    return;
  }
}

async function runMain(): Promise<void> {
  try {
    await removeStake();
  } catch (error) {
    console.log(error);
  }
}

runMain();
