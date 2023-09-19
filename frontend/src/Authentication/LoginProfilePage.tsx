import { Alert, Button, Card, Container, Group, PasswordInput, SimpleGrid, TextInput, Title } from "@mantine/core";
import { useState, useContext } from "react";
import { UserContext } from "../App";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import Homepage from "../components/Navigation/parentHome";

function LoginProfilePage() {
	const [loginCredentials, setLoginCredentials] = useState({ email: "", password: "" });
	const [navbarOpened, setNavbarOpened] = useState(false);
	const navigate = useNavigate();
	const {
		authenticatedUser,
		setAuthenticatedUser,
	}: { authenticatedUser: IUserSessionInfo; setAuthenticatedUser: any } = useContext(UserContext);
	const [userProfile, setUserProfile] = useState<IUpdateProfile>({
		email: "",
		first_name: authenticatedUser.first_name,
		last_name: authenticatedUser.last_name,
		current_password: "",
		new_password: "",
	});
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [updateStatusMessage, setUpdateStatusMessage] = useState({
		status: 0,
		message: "",
	});
	const [loginErrorMessage, setLoginErrorMessage] = useState("");

	const handleLogin = async () => {
		try {
			let fetchRes = await fetch("http://localhost:5000/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(loginCredentials),
				credentials: "include",
			});
			let response = await fetchRes.json();
			if (response.message === "Success" && response.user._id) {
				setAuthenticatedUser(response.user); // Set the user immediately after successful login
				navigate("/");  // Redirect to the homepage
			} else {
				setLoginErrorMessage(response.message);
			}
		} catch (e) {
			console.log(e);
		}
	};

	
	
	const handleLogout = async () => {
		try {
			let fetchRes = await fetch("http://localhost:5000/api/auth/logout", {
				credentials: "include",
			});
			await fetchRes.json();
			setAuthenticatedUser({
				_id: null,
				email: "",
				first_name: "",
				last_name: "",
				scope: "",
			});
		} catch (e) {
			console.log(e);
		}
	};
	const handleUpdate = async () => {
		if (newPassword !== confirmPassword) {
			setUpdateStatusMessage({
				status: 403,
				message: "Passwords do not match",
			});
			return;
		}

		let userProfileLocalCopy: IUpdateProfile = JSON.parse(JSON.stringify(userProfile));
		userProfileLocalCopy.email = authenticatedUser.email;
		if (newPassword === "") {
			userProfileLocalCopy.new_password = userProfileLocalCopy.current_password;
		} else {
			userProfileLocalCopy.new_password = newPassword;
		}

		try {
			let fetchRes = await fetch("http://localhost:5000/api/auth/update", {
				credentials: "include",
				method: "POST",
				body: JSON.stringify(userProfileLocalCopy),
				headers: {
					"Content-Type": "application/json",
				},
			});
			let response: {
				status: number;
				message: string;
			} = await fetchRes.json();
			setUpdateStatusMessage(response);
			if (response.status === 200) {
				let a = await handleGetUser();
				let userCopy = JSON.parse(JSON.stringify(a.user));
				setAuthenticatedUser((val: IUserSessionInfo) => userCopy);
			}
		} catch (e) {
			console.log(e);
		}
	};
	const handleGetUser = async () => {
		try {
			let fetchRes = await fetch("http://localhost:5000/api/auth/user", {
				method: "POST",
				credentials: "include",
			});
			let response = await fetchRes.json();
			return response;
		} catch (e) {
			console.log(e);
		}
	};

	

	return (
		<>	
		<Homepage setNavbarOpened={setNavbarOpened}/>
		<Container style={{marginTop: "80px"}}>
			
			{authenticatedUser._id !== null && authenticatedUser._id !== undefined ? (
				<>
					<Title>Hi {authenticatedUser.first_name},</Title>
					<Card>
						<TextInput
							placeholder="Email address"
							label="Email address"
							value={authenticatedUser.email}
							disabled
						/>
						<SimpleGrid cols={1} mt={"md"} breakpoints={[{ minWidth: "sm", cols: 2 }]}>
							<TextInput
								placeholder="Enter first name"
								label="First name"
								value={userProfile.first_name}
								onChange={(event) =>
									setUserProfile((userProfile) => ({
										...userProfile,
										first_name: event.target.value,
									}))
								}
							/>
							<TextInput
								placeholder="Enter last name"
								label="Last name"
								value={userProfile.last_name}
								onChange={(event) =>
									setUserProfile((userProfile) => ({
										...userProfile,
										last_name: event.target.value,
									}))
								}
							/>
						</SimpleGrid>
						<TextInput
							mt={"md"}
							placeholder="Enter current password"
							label="Current password"
							onChange={(event) =>
								setUserProfile((userProfile) => ({
									...userProfile,
									current_password: event.target.value,
								}))
							}
						/>
						<SimpleGrid cols={1} mt={"md"} breakpoints={[{ minWidth: "sm", cols: 2 }]}>
							<PasswordInput
								placeholder="Enter new password"
								label="New password"
								value={newPassword}
								onChange={(event) => setNewPassword(event.target.value)}
							/>
							<PasswordInput
								placeholder="Re-enter new password"
								label="Confirm password"
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
								error={confirmPassword !== newPassword}
							/>
						</SimpleGrid>
						<Group mt={"md"} position="apart">
							<Button onClick={handleUpdate} variant="outline">
								Update
							</Button>
							<Button onClick={handleLogout} variant="subtle">
								Log out
							</Button>
						</Group>
						{updateStatusMessage.status !== 0 && (
							<Card.Section mt={"md"}>
								<Alert
									icon={<IconAlertCircle />}
									color={updateStatusMessage.status === 200 ? "green" : "red"}
									title={updateStatusMessage.status === 200 ? "Success" : "Error"}
								>
									{updateStatusMessage.message}
								</Alert>
							</Card.Section>
						)}
					</Card>
				</>
			) : (
				<>
					<Title>Login</Title>
					<form>
						<Card>
							<TextInput
								placeholder="Enter email address"
								label="Username"
								value={loginCredentials.email}
								onChange={(event) =>
									setLoginCredentials({ ...loginCredentials, email: event.target.value })
								}
							/>
							<PasswordInput
								placeholder="Password"
								label="Password"
								value={loginCredentials.password}
								onChange={(event) =>
									setLoginCredentials({ ...loginCredentials, password: event.target.value })
								}
							/>
							<Button mt={"md"} onClick={() => {
    							setNavbarOpened(false);    			
    							
								handleLogin();
								}}>
    									Login
							</Button>
							
							{loginErrorMessage !== "" && (
								<Card.Section mt={"md"}>
									<Alert icon={<IconAlertCircle />} color="red" title="Error">
										{loginErrorMessage}
									</Alert>
								</Card.Section>
							)}
						</Card>
					</form>
				</>
			)}
		</Container>
		</>
	
	);
}
export default LoginProfilePage;