import { useContext } from "react";
import { ErrorContext } from "../App";

export default function ErrorNotify() {
	const { showError } = useContext(ErrorContext);

	return (
		<div className="error">
			<div className="errorMessage" id={showError ? "on" : "off"}>
				There was an error
			</div>
		</div>
	);
}
