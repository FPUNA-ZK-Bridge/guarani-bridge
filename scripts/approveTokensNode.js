import { ethers } from "ethers";
import { readFileSync } from "fs";
import accountManager from "../utils/accounts.js";

async function main() {
  // Cargar configuración de contratos
  const l1Config = JSON.parse(readFileSync("deploy-l1.json", "utf8"));
  
  // Usar el account manager para obtener el deployer
  const deployer = accountManager.getDeployerSigner("http://127.0.0.1:8545");
  
  console.log("🔧 Deployer address:", deployer.address);
  
  // Direcciones desde la configuración
  const tokenAddress = l1Config.token;
  
  // ABI simplificado del GuaraniToken (solo las funciones que necesitamos)
  const tokenABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];
  
  // Conectar al contrato
  const token = new ethers.Contract(tokenAddress, tokenABI, deployer);
  
  // Verificar que el contrato existe
  try {
    const name = await token.name();
    const symbol = await token.symbol();
    console.log("🪙 Token encontrado:", name, "(", symbol, ")");
  } catch (error) {
    console.error("❌ Error: No se pudo conectar al contrato.");
    console.error("Dirección verificada:", tokenAddress);
    throw error;
  }
  
  // Dirección del spender desde la configuración
  const spenderAddress = l1Config.sender;
  
  // Cantidad a aprobar: 5000 tokens GUA (suficiente para el lock de 3500)
  const amount = ethers.parseUnits("5000", 18);
  
  console.log("\n💰 Aprobando tokens...");
  console.log("📍 Contrato GuaraniToken:", tokenAddress);
  console.log("📍 Spender (Sender):", spenderAddress);
  console.log("📍 Owner (quien aprueba):", deployer.address);
  console.log("📍 Cantidad:", ethers.formatUnits(amount, 18), "GUA");
  
  // Realizar el approve
  const tx = await token.approve(spenderAddress, amount);
  console.log("Transacción enviada, esperando confirmación...");
  
  const receipt = await tx.wait();
  
  console.log("✅ Approve completado!");
  console.log("Hash de transacción:", tx.hash);
  console.log("Block number:", receipt.blockNumber);
  
  // Verificar el allowance
  try {
    const allowance = await token.allowance(deployer.address, spenderAddress);
    console.log("Allowance aprobado:", ethers.formatUnits(allowance, 18), "GUA");
  } catch (error) {
    console.log("⚠️  No se pudo verificar el allowance, pero el approve debería haber funcionado");
    console.log("Razón:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 