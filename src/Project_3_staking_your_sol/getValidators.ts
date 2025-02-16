import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import * as dotenv from "dotenv";

/**
 *  Load environment variables from .env config file
 */
dotenv.config();

/**
 *  Create a connection to solana devnet.
 *  You can use the solanaRpc from Helius or clusterApiUrl("devnet")
 */
const solanaRpc = process.env.HELIUS_HTTPS_URI_DEVNET || "";
const devConnection = new Connection(clusterApiUrl("devnet"), "finalized");

/**
 *  Function to get all validators and a public key from the first validator
 */
async function getVoteAccounts(): Promise<void> {
  try {
    /**
     *  Get the current validators with stake, and delinquent delinquent validators with no stake
     */
    const { current, delinquent } = await devConnection.getVoteAccounts();

    /**
     *  Output some validator information
     */
    console.log(`All validators: ${current.concat(delinquent).length}`);
    console.log(`Staked validators: ${current.length}`);

    /**
     *  Get the first validator to use for our stake
     */
    const firstValidator = current[0];
    const firstValidatorPubKey = new PublicKey(firstValidator.votePubkey);
    console.log(`🔑 1st validator public key: ${firstValidatorPubKey}`);
  } catch (error) {}
}

async function runMain(): Promise<void> {
  try {
    await getVoteAccounts();
  } catch (error) {}
}

runMain();
