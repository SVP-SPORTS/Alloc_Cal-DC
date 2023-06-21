import React, { useContext } from "react";
import { UserContext } from "../../App";
import LoginProfilePage from "../../Authentication/LoginProfilePage";

export default function PrivateRoute({ page }: { page: React.ReactNode }) {
	const { authenticatedUser }: { authenticatedUser: IUserSessionInfo } = useContext(UserContext);

	return (
		<React.Fragment>
			{authenticatedUser._id !== null && authenticatedUser._id !== undefined ? page : <LoginProfilePage />}
		</React.Fragment>
	);
}