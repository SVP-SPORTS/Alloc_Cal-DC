import { Button, Card, Container, SimpleGrid, PasswordInput, TextInput, Title, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";

function RegisterPage() {
	const [registerCredentials, setRegisterCredentials] = useState({
		email: "",
		password: "",
		first_name: "",
		last_name: "",
		location: "",
	});
	const [showRegistrationError, setShowRegistrationError] = useState(false);

	const handleRegister = async () => {
        setShowRegistrationError(false);

        if (
            registerCredentials.email === "" ||
            registerCredentials.first_name === "" ||
            registerCredentials.last_name === "" ||
            registerCredentials.password === ""
        ) {
            setShowRegistrationError(true);
            return;
        }

        let registerCredentialsLocalCopy = JSON.parse(JSON.stringify(registerCredentials));
        registerCredentialsLocalCopy.first_name = registerCredentialsLocalCopy.first_name.trim();
        registerCredentialsLocalCopy.last_name = registerCredentialsLocalCopy.last_name.trim();
        registerCredentialsLocalCopy.username = registerCredentialsLocalCopy.email.trim();

        registerCredentialsLocalCopy.first_name =
            registerCredentialsLocalCopy.first_name.charAt(0).toUpperCase() +
            registerCredentialsLocalCopy.first_name.slice(1);
        registerCredentialsLocalCopy.last_name =
            registerCredentialsLocalCopy.last_name.charAt(0).toUpperCase() +
            registerCredentialsLocalCopy.last_name.slice(1);

        try {
            let fetchRes = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                body: JSON.stringify(registerCredentialsLocalCopy),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            let response = await fetchRes.json();
            if (response.status === 200) {
                window.location.href = "/";
            }
        } catch (e) {
            console.log(e);
        }
    };

  


	return (
		<Container>
			<Title>Register</Title>
			<Card>
				<SimpleGrid breakpoints={[{ minWidth: "xs", cols: 2 }]} cols={1}>
					<TextInput
						placeholder="Enter first name"
						label="First Name"
						value={registerCredentials.first_name}
						withAsterisk
						onChange={(event) =>
							setRegisterCredentials({ ...registerCredentials, first_name: event.target.value })
						}
					/>
					<TextInput
						placeholder="Enter last name"
						label="Last Name"
						value={registerCredentials.last_name}
						withAsterisk
						onChange={(event) =>
							setRegisterCredentials({ ...registerCredentials, last_name: event.target.value })
						}
					/>
					<TextInput
						placeholder="Location"
						label="Location"
						value={registerCredentials.location}
						withAsterisk
						onChange={(event) =>
							setRegisterCredentials({ ...registerCredentials, location: event.target.value })
						}
					/>
				</SimpleGrid>
				<SimpleGrid breakpoints={[{ minWidth: "xs", cols: 2 }]} cols={1}>
					<TextInput
						placeholder="Enter email address"
						label="Username"
						value={registerCredentials.email}
						withAsterisk
						onChange={(event) =>
							setRegisterCredentials({ ...registerCredentials, email: event.target.value })
						}
					/>
					<PasswordInput
						placeholder="Password"
						label="Password"
						value={registerCredentials.password}
						withAsterisk
						onChange={(event) =>
							setRegisterCredentials({ ...registerCredentials, password: event.target.value })
						}
					/>
				</SimpleGrid>

				<Button mt={"md"} onClick={handleRegister}>
					Register
				</Button>
				{showRegistrationError && (
					<Card.Section>
						<Alert mt={"md"} color="red" icon={<IconAlertCircle />}>
							All fields are required for registration. Please fill out all fields and try again.
						</Alert>
					</Card.Section>
				)}
			</Card>
		</Container>
	);
}
export default RegisterPage;