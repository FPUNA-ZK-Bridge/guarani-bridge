import hre from "hardhat";
import { writeFileSync } from "fs";
import { HDNodeWallet } from "ethers/wallet"; // esto importa HDNodeWallet
import { Mnemonic } from "ethers";

async function main() {
  const accounts = await hre.ethers.getSigners();
  const [deployer] = accounts;

  // GuaraniToken – pre-mina 1 000 000 GUA
  const Token = await hre.ethers.getContractFactory("GuaraniToken");
  const token = await Token.deploy(hre.ethers.parseUnits("1000000", 18));
  await token.waitForDeployment();

  const Sender = await hre.ethers.getContractFactory("Sender");
  const sender = await Sender.deploy(token.target);
  await sender.waitForDeployment();

  console.log("N1 GuaraniToken:", token.target);
  console.log("N1 Sender:", sender.target);
  console.log("El deployer es:", deployer.address);

  writeFileSync(
    "deploy-N1.json",
    JSON.stringify({ token: token.target, sender: sender.target }, null, 2)
  );

  // Hardhat's default mnemonic
  const mnemonic = Mnemonic.fromPhrase(
    "test test test test test test test test test test test junk"
  );

  const accountData = [];

  for (let i = 0; i < 20; i++) {
    const wallet = HDNodeWallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${i}`);
    accountData.push({
      name: `account#${i}`,
      address: wallet.address,
      privateKey: wallet.privateKey,
    });
  }

  writeFileSync("accounts.json", JSON.stringify(accountData, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
