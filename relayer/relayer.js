// relayer/relayer.js  (VERSIÓN ROBUSTA)
import { ethers } from "ethers";
import fs from "fs";
import "dotenv/config";
import accountManager from "../utils/accounts.js";
import { WebSocketServer } from "ws";
import http from "http";

const {
  RPC_URL_N1,
  RPC_URL_N2,
  PRIVATE_KEY_RELAYER,
  START_BLOCK_N1 = 0,
} = process.env;

const n1 = JSON.parse(fs.readFileSync("deploy-N1.json"));
const n2 = JSON.parse(fs.readFileSync("deploy-N2.json"));

/* ---------- WebSocket Server ---------- */
const server = http.createServer();
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('📡 Cliente WebSocket conectado');
  clients.add(ws);
  
  ws.on('close', () => {
    console.log('📡 Cliente WebSocket desconectado');
    clients.delete(ws);
  });
});

// Función para enviar logs a todos los clientes conectados
const broadcastLog = (message) => {
  const logMessage = JSON.stringify({ 
    type: 'log', 
    message, 
    timestamp: new Date().toISOString() 
  });
  
  clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(logMessage);
    }
  });
};

server.listen(8080, () => {
  console.log('🌐 WebSocket server running on port 8080');
});

/* ---------- providers ---------- */
const providerN1 = RPC_URL_N1?.startsWith("ws")
  ? new ethers.WebSocketProvider(RPC_URL_N1)
  : new ethers.JsonRpcProvider(RPC_URL_N1);

const providerN2 = new ethers.JsonRpcProvider(RPC_URL_N2); // que concha lo que es?
console.log("--------");

console.log(PRIVATE_KEY_RELAYER ? "Usando PRIVATE_KEY_RELAYER" : "Usando AccountManager");
console.log("Relayer conectado a:" + PRIVATE_KEY_RELAYER);




const signerN2 = PRIVATE_KEY_RELAYER
  ? new ethers.Wallet(PRIVATE_KEY_RELAYER, providerN2)
  : accountManager.getRelayerSigner(RPC_URL_N2); // usar AccountManager

console.log(await signerN2.getAddress());
console.log(n2.relayer); // si guardaste la dirección en deploy-N2.json
console.log("--------");

/* ---------- contratos ---------- */
const senderAbi = [
  "event Locked(uint256 indexed id,address indexed from,address indexed to,uint256 amount)",
];
const receiverAbi = [
  "function mintRemote(uint256,address,uint256)",
  "event Minted(uint256 indexed id,address indexed to,uint256 amount)",
];

const sender = new ethers.Contract(n1.sender, senderAbi, providerN1);
const receiver = new ethers.Contract(n2.receiver, receiverAbi, signerN2);

console.log("Relayer escuchando Locked()…");

sender.on(
  sender.getEvent("Locked"),
  async (id, from, to, amount) => {
    const logMessage = `🔒  id=${id}  from=${from.substring(0, 6)}… -> ${to.substring(
      0,
      6
    )}…  amount=${ethers.formatUnits(amount, 18)}`;
    console.log(logMessage);
    broadcastLog(logMessage);

    const tx = await receiver.mintRemote(id, to, amount);
    const txMessage = `⛓️   mintRemote tx: ${tx.hash}`;
    console.log(txMessage);
    broadcastLog(txMessage);
    
    await tx.wait();
    const confirmMessage = "✅  confirmado\n";
    console.log(confirmMessage);
    broadcastLog(confirmMessage);
  },
  { fromBlock: Number(START_BLOCK_N1) }
);

receiver.on(receiver.getEvent("Minted"), async (id, to, amount) => {
  const mintMessage = `💰  id=${id}  to=${to.substring(0, 6)}…  amount=${ethers.formatUnits(
    amount,
    18
  )}`;
  console.log(mintMessage);
  broadcastLog(mintMessage);
  
  const transferMessage = "SE TRANSFIRIO ( evento Minted )";
  console.log(transferMessage);
  broadcastLog(transferMessage);
});
