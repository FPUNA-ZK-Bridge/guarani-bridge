// relayer/relayer.js  (VERSIÓN ROBUSTA)
import { ethers } from "ethers";
import fs from "fs";
import "dotenv/config";
import accountManager from "../utils/accounts.js";

const {
  RPC_URL_N1,
  RPC_URL_N2,
  PRIVATE_KEY_RELAYER,
  START_BLOCK_N1 = 0,
} = process.env;

const n1 = JSON.parse(fs.readFileSync("deploy-N1.json"));
const n2 = JSON.parse(fs.readFileSync("deploy-N2.json"));

/* ---------- providers ---------- */
const providerN1 = RPC_URL_N1?.startsWith("ws")
  ? new ethers.WebSocketProvider(RPC_URL_N1)
  : new ethers.JsonRpcProvider(RPC_URL_N1);

const providerN2 = new ethers.JsonRpcProvider(RPC_URL_N2);

const signerN2 = PRIVATE_KEY_RELAYER
? new ethers.Wallet(PRIVATE_KEY_RELAYER, providerN2)
: accountManager.getRelayerSigner(RPC_URL_N2);





/* ---------- contratos ---------- */
const senderAbi = [
    {
      "inputs": [
        {
          "internalType": "contract GuaraniToken",
          "name": "_token",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Locked",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipientL2",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "lock",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "lockedBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nonce",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "token",
      "outputs": [
        {
          "internalType": "contract GuaraniToken",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
const receiverAbi = [
    {
      "inputs": [
        {
          "internalType": "contract GuaraniToken",
          "name": "_token",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_relayer",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Minted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mintRemote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "processed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "relayer",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "token",
      "outputs": [
        {
          "internalType": "contract GuaraniToken",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

const sender = new ethers.Contract(n1.sender, senderAbi, providerN1);
const receiver = new ethers.Contract(n2.receiver, receiverAbi, signerN2);

console.log("Relayer escuchando Locked()…");

// Función para manejar eventos Locked con reintentos
const handleLockedEvent = async (id, from, to, amount, retries = 3) => {
  try {
    console.log(
      `🔒  id=${id}  from=${from.substring(0, 6)}… -> ${to.substring(
        0,
        6
      )}…  amount=${ethers.formatUnits(amount, 18)}`
    );

    const tx = await receiver.mintRemote(id, to, amount);
    console.log(`⛓️   mintRemote tx: ${tx.hash}`);
    await tx.wait();
    console.log("✅  confirmado\n");
  } catch (error) {
    console.log(`❌ Error en handleLockedEvent: ${error.message}`);
    if (retries > 0) {
      console.log(`🔄 Reintentando... (${retries} intentos restantes)`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s
      return handleLockedEvent(id, from, to, amount, retries - 1);
    } else {
      console.log(`💥 Error permanente para id ${id}`);
    }
  }
};

// Event listener mejorado con manejo de errores
try {
  // Usar la nueva sintaxis de ethers v6 para events
  sender.on(sender.getEvent("Locked"), handleLockedEvent);
  
  // Manejo de errores del provider
  providerN1.on("error", (error) => {
    console.log("🚨 Error en provider N1:", error.message);
  });

  providerN2.on("error", (error) => {
    console.log("🚨 Error en provider N2:", error.message);
  });

} catch (error) {
  console.log("💥 Error crítico al configurar event listeners:", error.message);
  process.exit(1);
}

receiver.on(receiver.getEvent("Minted"), async (id, to, amount) => {
  console.log(
    `💰  id=${id}  to=${to.substring(0, 6)}…  amount=${ethers.formatUnits(
      amount,
      18
    )}`
  );
  console.log("SE TRANSFIRIO ( evento Minted )");
});

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  if (reason?.message?.includes('results is not iterable')) {
    console.log('⚠️ Warning: ethers event polling issue (ignorado)');
    return; // Ignorar este error específico
  }
  console.log('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  if (error?.message?.includes('results is not iterable')) {
    console.log('⚠️ Warning: ethers event polling issue (ignorado)');
    return; // Ignorar este error específico
  }
  console.log('🚨 Uncaught Exception:', error.message);
});
