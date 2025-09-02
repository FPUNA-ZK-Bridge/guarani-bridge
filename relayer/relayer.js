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

const providerN2 = new ethers.JsonRpcProvider(RPC_URL_N2); // que concha lo que es?

const signerN2 = PRIVATE_KEY_RELAYER
  ? new ethers.Wallet(PRIVATE_KEY_RELAYER, providerN2)
  : accountManager.getRelayerSigner(RPC_URL_N2); // usar AccountManager

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
  },
  { fromBlock: Number(START_BLOCK_N1) }
);

receiver.on(receiver.getEvent("Minted"), async (id, to, amount) => {
  console.log(
    `💰  id=${id}  to=${to.substring(0, 6)}…  amount=${ethers.formatUnits(
      amount,
      18
    )}`
  );
  console.log("SE TRANSFIRIO ( evento Minted )");
});
