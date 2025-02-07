import { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

// Create keys
const myPublicKey = new PublicKey("9BGpXJWxptoadBHn6xFnKWm4XGkxoqVAoLVJSX8C8Va3");

// Print the public key to receive SOL
console.log("Public Key:", myPublicKey);

// Create a connection to the Solana Devnet
const solanaRpc = process.env.HELIUS_HTTPS_URI_DEVNET || "";
const devConnection = new Connection(solanaRpc, "finalized");

// Create a function to get our Wallet balance
async function getWalletBalance(): Promise<string> {
  try {
    //Get the wallet balance
    const walletBalance = await devConnection.getBalance(myPublicKey);

    // Log out the wallet balance
    return `💰 Balance: ${walletBalance / LAMPORTS_PER_SOL} SOL`;
  } catch (error) {
    return `🚫 Error getting balance: ${error}`;
  }
}

// Create a function to airdrop sol
async function airDropSolana(solAmount: number): Promise<boolean> {
  try {
    // Create airdrop signature
    console.log(`☔ Requesting ${solAmount} SOL airdrop...`);
    const airdropSignature = await devConnection.requestAirdrop(myPublicKey, 0.00001 * LAMPORTS_PER_SOL);

    console.log("☔ Airdrop Transaction Signature:", airdropSignature);

    // Get the latest blockheight
    const latestBlockHash = await devConnection.getLatestBlockhash();

    // Confirm transaction
    await devConnection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });

    return true;
  } catch (error) {
    return false;
  }
}

// Run our airdrop
async function main(): Promise<void> {
  const myBalance = await getWalletBalance();
  console.log(myBalance);

  // Airdrop 1 SOL
  await airDropSolana(1);

  const myNewBalance = await getWalletBalance();
  console.log(myNewBalance);
}

main();
