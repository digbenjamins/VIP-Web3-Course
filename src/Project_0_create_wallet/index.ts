import { PublicKey, Keypair } from "@solana/web3.js";

// Generate a new keypair
const keypair = new Keypair();

// Create keys
const myPublicKey = new PublicKey(keypair.publicKey);
const myPrivateKey = Buffer.from(keypair.secretKey).toString("base64");

// Print the private key as a Base64 string to send SOL
console.log("🔏 Private Key (Base64):", myPrivateKey);

// Print the public key to receive SOL
console.log("🌍 Public Key:", myPublicKey.toString());
