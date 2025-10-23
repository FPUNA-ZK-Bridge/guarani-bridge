import fs from "fs";
import "dotenv/config";

const {
  RPC_URL_L2,
  PRIVATE_KEY_RELAYER
} = process.env;

const ethers = await import('ethers');

// Carga la dirección del contrato Receiver desde tu archivo deploy
const n2 = JSON.parse(fs.readFileSync("../deploy-N2.json"));
console.log("Verificando relayer en contrato Receiver en L2:", n2.receiver);
// Provider y signer
const providerN2 = new ethers.JsonRpcProvider(RPC_URL_L2);
const signerN2 = new ethers.Wallet(PRIVATE_KEY_RELAYER, providerN2);

// ABI mínima solo para leer relayer
const receiverAbi = [
  "function relayer() view returns (address)"
];

const main = async () => {
  try {
    const receiver = new ethers.Contract(n2.receiver, receiverAbi, providerN2);

    // Dirección del signer
    const relayerFromSigner = await signerN2.getAddress();
    console.log("Relayer desde signer:", relayerFromSigner);

    // Dirección del contrato
    const relayerFromContract = await receiver.relayer();
    console.log("Relayer desde contrato:", relayerFromContract);

    // Validación
    if (relayerFromSigner.toLowerCase() === relayerFromContract.toLowerCase()) {
      console.log("✅ El signer coincide con el relayer del contrato");
    } else {
      console.log("❌ El signer NO coincide con el relayer del contrato");
    }

  } catch (err) {
    console.error("Error al verificar relayer:", err);
  }
};

main();
