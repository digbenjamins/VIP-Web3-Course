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
 *  Validator that we will use to create our stake
 */
const favoriteValidator = "2u83Dx5qPV4QnujjJQv8v2SoqG1ixuAxPK5Jwhtkovd1";
const favoriteValidatorPubKey = new PublicKey(favoriteValidator);

/**
 *  Function to create a stake
 */
async function createStake(): Promise<void> {
  if (fs.existsSync("src/stakeAccount.json")) {
    const secretKeyFromFile = Uint8Array.from(JSON.parse(fs.readFileSync("src/stakeAccount.json", "utf-8")));
    const stakeAccount = Keypair.fromSecretKey(secretKeyFromFile);

    /**
     *  Calculate the rent and add it to the amount we want to stake.
     */
    const minimumRent = await devConnection.getMinimumBalanceForRentExemption(StakeProgram.space);
    const amountToStake = 0.1 * LAMPORTS_PER_SOL;
    const amountToStakeWithRent = amountToStake + minimumRent;

    /**
     *  Turn regular account into stake account
     */
    const createStakeAccountTransaction = StakeProgram.createAccount({
      authorized: new Authorized(wallet.publicKey, wallet.publicKey),
      fromPubkey: wallet.publicKey,
      lamports: amountToStakeWithRent,
      lockup: new Lockup(0, 0, wallet.publicKey),
      stakePubkey: stakeAccount.publicKey,
    });

    const createStakeAccountTransactionId = await sendAndConfirmTransaction(devConnection, createStakeAccountTransaction, [wallet, stakeAccount]);

    /**
     *  Output the current stake created
     */
    console.log(`📜 Stake account created: ${createStakeAccountTransactionId}`);
    const stakeBalance = await devConnection.getBalance(stakeAccount.publicKey);
    console.log(`🥩 Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL}`);

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
       *  Create a transaction to delegate our stake
       */
      const delegateStakeTx = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: wallet.publicKey,
        votePubkey: favoriteValidatorPubKey,
      });

      /**
       *  Send and confirm our transaction
       */
      const delegateStakeTxId = await sendAndConfirmTransaction(devConnection, delegateStakeTx, [wallet]);
      console.log(`📜 Stake account delegated to: ${favoriteValidatorPubKey}\n Transaction: ${delegateStakeTxId}`);

      /**
       *  Check the status for our stake
       */
      stakeStatus = await getStakeActivation(devConnection, stakeAccount.publicKey);
      console.log(`🥩 Stake status: ${stakeStatus.status}`);
    }
  } else {
    console.log("🚫 Cannot delegate stake because no stake account keypair was found.");
    return;
  }
}

async function runMain(): Promise<void> {
  try {
    await createStake();
  } catch (error) {}
}

runMain();
