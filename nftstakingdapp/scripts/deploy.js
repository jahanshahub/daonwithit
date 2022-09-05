const hre = require("hardhat");

async function main() {
	const nftAddress = "0x3507bc3babb70c3a16403806d9460c24600688d9";
	const Staking = await hre.ethers.getContractFactory("Staking");
	const staking = await Staking.deploy(nftAddress);

	await staking.deployed();

	console.log("Contract deployed to", staking.address);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
