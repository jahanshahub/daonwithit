import { useState, createContext } from "react";
import ErrorNotify from "./Components/Error";
import Loader from "./Components/Loader";
import Nav from "./Components/Nav";
import Stake from "./Components/Stake";

export const WalletAddressContext = createContext({
	walletAddress: "",
	setWalletAddress: (setWalletAddress: string): void => {},
});

export const LoggedInContext = createContext({
	loggedIn: false,
	setLoggedIn: (setLoggedIn: boolean): void => {},
});

export const StakingContext = createContext({
	staking: false,
	setStaking: (setStaking: boolean): void => {},
});

export const LoadingContext = createContext({
	loading: false,
	setLoading: (setLoading: boolean): void => {},
});

export const ErrorContext = createContext({
	showError: false,
	setShowError: (setShowError: boolean): void => {},
});

export default function App() {
	const [walletAddress, setWalletAddress] = useState<string>("");
	const [loggedIn, setLoggedIn] = useState<boolean>(false);
	const [staking, setStaking] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [showError, setShowError] = useState<boolean>(false);

	return (
		<div>
			<WalletAddressContext.Provider
				value={{ walletAddress, setWalletAddress }}
			>
				<LoggedInContext.Provider value={{ loggedIn, setLoggedIn }}>
					<StakingContext.Provider value={{ staking, setStaking }}>
						<LoadingContext.Provider value={{ loading, setLoading }}>
							<ErrorContext.Provider value={{ showError, setShowError }}>
								{loading ? (
									<div>
										<ErrorNotify />
										<Nav />
										<Loader />
									</div>
								) : (
									<div>
										<ErrorNotify />
										<Nav />
										<Stake />
									</div>
								)}
							</ErrorContext.Provider>
						</LoadingContext.Provider>
					</StakingContext.Provider>
				</LoggedInContext.Provider>
			</WalletAddressContext.Provider>
		</div>
	);
}
