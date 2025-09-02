import { ethers } from "ethers";
import accountManager from "../utils/accounts.js";

/**
 * Script para verificar balance de GuaraniToken
 * Uso: node scripts/checkBalance.js <direccion> <red>
 */

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error("❌ Uso: node scripts/checkBalance.js <direccion> <red>");
    console.log("Ejemplo: node scripts/checkBalance.js 0x1234...5678 1");
    process.exit(1);
  }

  const address = args[0];
  const network = args[1];

  if (!ethers.isAddress(address)) {
    console.error("❌ Dirección inválida");
    process.exit(1);
  }

  // Configurar red
  let rpcUrl, tokenAddress;
  
  if (network === "1") {
    rpcUrl = "http://127.0.0.1:8545";
    tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  } else if (network === "2") {
    rpcUrl = "http://127.0.0.1:9545";
    tokenAddress = "0x8464135c8F25Da09e49BC8782676a84730C318bC";
  } else {
    console.error("❌ Red inválida (1 o 2)");
    process.exit(1);
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // ABI básico para balance
    const tokenAbi = [
      "function balanceOf(address) view returns (uint256)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)"
    ];
    
    const token = new ethers.Contract(tokenAddress, tokenAbi, provider);
    
    const balance = await token.balanceOf(address);
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    
    console.log("💰 Balance de", address);
    console.log("🌐 Red L" + network);
    console.log("💎", ethers.formatUnits(balance, decimals), symbol);
    
    if (balance === 0n) {
      console.log("\n⚠️  Balance cero. Para obtener tokens:");
      if (network === "1") {
        console.log("   Ejecuta: node scripts/mintTokens.js");
      } else {
        console.log("   Haz bridge desde L1 o mint desde L2");
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error); 