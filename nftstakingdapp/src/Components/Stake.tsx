import { useState, useEffect, useContext } from "react";
import { nftContract, stakeContract } from "../ABI";
import {
	ErrorContext,
	LoadingContext,
	LoggedInContext,
	StakingContext,
	WalletAddressContext,
} from "../App";
import { ethers } from "ethers";
/*eslint-disable*/
export default function Stake() {
	const { walletAddress } = useContext(WalletAddressContext);
	const { staking, setStaking } = useContext(StakingContext);
	const { loggedIn } = useContext(LoggedInContext);
	const { setLoading } = useContext(LoadingContext);
	const { setShowError } = useContext(ErrorContext);
	const [toggle, setToggle] = useState<boolean>(false);
	const [nftID, setNftId] = useState<number>(0);
	const [ids, setIds] = useState<any>([]);
	const [hasNFT, setHasNFT] = useState<boolean>(true);
	const [hasStaked, setHasStaked] = useState<boolean>(false);
	const [coinEarned, setCoinEarned] = useState<number>();

	const setter = () => {
		localStorage.setItem("address", walletAddress);
	};
	const remover = () => {
		localStorage.removeItem("address");
	};

	const checkAddress = () => {
		const storedAddress = localStorage.getItem("address");
		if (storedAddress === walletAddress) {
			setStaking(true);
			toggleOn();
		} else {
			console.log("Not staking");
		}
	};
	useEffect(() => {
		checkAddress();
	}, [walletAddress, staking]);

	const requestPermission = async () => {
		try {
			const returnIds = await nftContract.tokensOfOwner(walletAddress);
			setIds(returnIds.toString());

			if (ids == []) {
				setHasNFT(false);
			} else {
				setHasNFT(true);
			}
		} catch (error) {
			setShowError(true);
			const err = setTimeout(() => {
				setShowError(false);
			}, 2000);

			return () => clearTimeout(err);
		}
	};

	const handleSubmit = async (event: any) => {
		event.preventDefault();
		if (nftID > 15 || nftID < 1) {
			alert("Please select the nft ID you want to stake from 1-15");
		} else {
			try {
				const stakingAddress = "0x870708c29dD5b5EF18b3Ce2ccc05F82d3C2B89f1";
				const approve = await nftContract.setApprovalForAll(
					stakingAddress,
					true
				);
				setLoading(true);
				await approve.wait(1);
				const stakeStart = await stakeContract.stake(nftID);
				await stakeStart.wait(1);
				localStorage.setItem("ID", JSON.stringify(nftID));
				setHasStaked(true);
				setter();
				setLoading(false);
			} catch (error) {
				setShowError(true);
				const err = setTimeout(() => {
					setShowError(false);
				}, 2000);

				return () => clearTimeout(err);
			}
		}
	};

	const checkUnstake = () => {
		const storedID = localStorage.getItem("ID") as string;
		const parseID = JSON.parse(storedID);
		setNftId(parseID);
	};
	const handleUnstake = async () => {
		try {
			const staking = await stakeContract.unstake(nftID);
			setLoading(true);
			await staking.wait(1);
			setHasStaked(false);
			remover();
			localStorage.removeItem("ID");
			setNftId(1);
			setLoading(false);
			window.location.reload();
		} catch (error) {
			setShowError(true);
			const err = setTimeout(() => {
				setShowError(false);
			}, 2000);

			return () => clearTimeout(err);
		}
	};

	const stakingEarned = async () => {
		try {
			if (staking) {
				const amountEarned = await stakeContract.calculateTokens(nftID);
				let transform = ethers.utils.formatEther(amountEarned) as any;
				transform = Math.round(transform * 1e4) / 1e4;
				setCoinEarned(transform);
				console.log(coinEarned);
			}
		} catch (error) {
			setShowError(true);
			const err = setTimeout(() => {
				setShowError(false);
			}, 2000);

			return () => clearTimeout(err);
		}
	};

	useEffect(() => {
		if (staking) {
			checkUnstake();
		}
	}, [nftID, coinEarned]);

	const toggleOn = () => {
		requestPermission();
		stakingEarned();

		return (
			<div>
				{hasNFT || staking ? (
					<div>
						{hasStaked || staking ? (
							<div className="mt-28  flex flex-col justify-center items-center">
								<div className=" ml-4 mr-4 text-xl text-center sm:text-2xl">
									You have earned: {coinEarned} STK
								</div>

								<button
									className=" bg-red-600 hover:bg-red-800 buttonBase mt-10 text-xl px-3 py-2 sm:text-2xl"
									onClick={handleUnstake}
								>
									Unstake
								</button>
							</div>
						) : (
							<div>
								<div className="mt-20 text-xl flex flex-col justify-center items-center sm:text-2xl">
									<div>Your available nft ids:</div>
									<div className="  mt-8 ml-5 mr-5 text-xl text sm:text-2xl">
										{ids}
									</div>
									<form className=" mt-5" onSubmit={handleSubmit}>
										<input
											className=" text-black w-10 rounded px-2 py-0.5"
											type="text"
											pattern="[0-9]*"
											value={nftID}
											onChange={(e) =>
												setNftId((v: any) =>
													e.target.validity.valid ? e.target.value : v
												)
											}
										/>
										<input
											className=" bg-green-500 hover:bg-green-600 rounded px-2 py-0.5 bounce"
											type="submit"
											value="Submit"
										/>
									</form>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="mt-28 text-xl flex flex-col justify-center items-center sm:text-2xl">
						<div>You have no nfts! </div>
						<div className=" text-lg ml-4 mr-4 mt-4 text-center">
							Mint an Emoji
							<a
								href="https://goerli.etherscan.io/address/0x312055a20CC562E42edBEAC634D97eee924627Cc#writeContract"
								target="_blank"
								rel="noopener noreferrer"
								className=" text-cyan-400 underline ml-1 mr-1"
							>
								HERE
							</a>
							click on the mint function
						</div>
						<div className=" text-lg">Fee is 0.001 Eth </div>
					</div>
				)}
			</div>
		);
	};

	const toggleOff = () => {
		return (
			<div>
				<div className=" flex flex-col justify-center items-center">
					{loggedIn ? (
						<div>
							<button
								onClick={() => setToggle(true)}
								className=" buttonBase mt-10 text-2xl px-3 py-2 sm:text-3xl"
							>
								Stake now
							</button>
						</div>
					) : (
						<div className=" flex flex-col justify-center items-center">
							<button className=" buttonBase mt-10 text-2xl px-3 py-2 sm:text-3xl">
								Stake now
							</button>
							<div>
								<div className="  mt-5">Please connect your wallet</div>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	};
	return <div>{staking || toggle ? toggleOn() : toggleOff()}</div>;
}
