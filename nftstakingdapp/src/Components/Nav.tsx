import { useState, useEffect, useContext } from "react";
import { provider, signer } from "../ABI";
import { ErrorContext, LoggedInContext, WalletAddressContext } from "../App";

export default function Nav() {
	const { walletAddress, setWalletAddress } = useContext(WalletAddressContext);
	const { setLoggedIn } = useContext(LoggedInContext);
	const { setShowError } = useContext(ErrorContext);
	const [buttonText, setButtonText] = useState<string>("Connect wallet");

	const connectNetwork = async () => {
		const chainId = 5; //goerli
		if (window.ethereum.networkVersion !== chainId) {
			await window.ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: "0x5" }],
			});
		}
	};

	const connectWallet = async () => {
		if (window.ethereum) {
			await provider.send("eth_requestAccounts", []);
			connectNetwork();
			setLoggedIn(true);
			window.ethereum.on("accountsChanged", function () {
				window.location.reload();
				fetchAddress();
			});

			window.ethereum.on("networkChanged", function () {
				window.location.reload();
			});
		} else {
			setButtonText("Connect Wallet");
			setShowError(true);
			const err = setTimeout(() => {
				setShowError(false);
			}, 2000);

			return () => clearTimeout(err);
		}
	};
	const persistRender = async () => {
		const accounts = await provider.listAccounts();
		if (accounts.length > 0) {
			setButtonText("Connected");
			setLoggedIn(true);

			connectNetwork();
		} else {
			setButtonText("Connect wallet");
		}

		window.ethereum.on("accountsChanged", function () {
			window.location.reload();
			console.log("test");
			fetchAddress();
		});

		window.ethereum.on("networkChanged", function () {
			window.location.reload();
			console.log("testing");
		});
	};
	useEffect(() => {
		persistRender();
	}, []);

	const fetchAddress = async () => {
		const signerAddress = await signer.getAddress();
		setWalletAddress(signerAddress);
	};
	useEffect(() => {
		fetchAddress();
	}, [walletAddress]);
	return (
		<div>
			<div className="mt-5  flex flex-row justify-center ">
				<h1 className=" text-2xl mt-20 sm:mt-2 sm:text-3xl ">
					Stake your Emoji!
				</h1>

				<button
					onClick={connectWallet}
					className="absolute right-2 text-xl bg-orange-600 rounded-lg px-3 py-2 hover:bg-orange-700 bounce"
				>
					{buttonText}
				</button>
			</div>
			<div className="  mt-28 text-xl ml-4 mr-4 text-center flex flex-col justify-center items-center sm:text-2xl">
				<div>Earn 10 reward coins a day! </div>
				<div>Only 1 Emoji can be staked at a time</div>
			</div>
		</div>
	);
}
