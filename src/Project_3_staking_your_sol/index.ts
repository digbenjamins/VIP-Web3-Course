import { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
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
 *  Function to get our wallet balance
 */
async function getWalletBalance(publicKey: PublicKey): Promise<number> {
  try {
    //Get the wallet balance
    const walletBalance = await devConnection.getBalance(publicKey);

    // Log out the wallet balance
    console.log("🌍 Public Key:", publicKey.toString());
    console.log(`💰 Balance: ${walletBalance / LAMPORTS_PER_SOL} SOL`);
    return walletBalance;
  } catch (error) {
    console.log(`🚫 Error getting balance: ${error}`);
    return -1;
  }
}

getWalletBalance(wallet.publicKey);
