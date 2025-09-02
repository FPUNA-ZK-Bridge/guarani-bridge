import { ethers } from "ethers";

async function main() {
  // Configurar provider para la red local
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Usar la clave privada de la primera cuenta de Hardhat
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const deployer = new ethers.Wallet(privateKey, provider);
  
  // Direcciones
  const tokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const senderAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  
  // ABI del token
  const tokenABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)"
  ];
  
  const token = new ethers.Contract(tokenAddress, tokenABI, deployer);
  
  console.log("🔍 Verificando allowance...");
  console.log("Owner:", deployer.address);
  console.log("Spender (Sender):", senderAddress);
  
  // Verificar allowance actual
  const currentAllowance = await token.allowance(deployer.address, senderAddress);
  console.log("Allowance actual:", ethers.formatUnits(currentAllowance, 18), "GUA");
  
  // Verificar balance
  const balance = await token.balanceOf(deployer.address);
  console.log("Balance actual:", ethers.formatUnits(balance, 18), "GUA");
  
  // Cantidad mínima necesaria para el lock
  const requiredAmount = ethers.parseUnits("3500", 18);
  
  if (currentAllowance >= requiredAmount) {
    console.log("✅ Allowance suficiente para el lock de 3500 GUA");
  } else {
    console.log("❌ Allowance insuficiente para el lock de 3500 GUA");
    console.log("Necesitas aprobar al menos:", ethers.formatUnits(requiredAmount, 18), "GUA");
    
    // Aprobar cantidad suficiente (5000 GUA)
    const approveAmount = ethers.parseUnits("5000", 18);
    console.log("\n🔧 Aprobando", ethers.formatUnits(approveAmount, 18), "GUA...");
    
    const tx = await token.approve(senderAddress, approveAmount);
    console.log("Transacción enviada:", tx.hash);
    
    await tx.wait();
    console.log("✅ Allowance actualizado!");
    
    // Verificar nuevo allowance
    const newAllowance = await token.allowance(deployer.address, senderAddress);
    console.log("Nuevo allowance:", ethers.formatUnits(newAllowance, 18), "GUA");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 