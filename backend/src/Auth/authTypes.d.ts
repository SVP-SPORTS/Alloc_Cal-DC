interface IUserCredentialsFromDatabase {
	_id: string;
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	scope: string;
}

interface IUserSessionInfo {
	_id: string;
	email: string;
	first_name: string;
	last_name: string;
	scope: string;
}

interface IRegisterNewUser {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
}

interface IUpdateProfile {
	email: string;
	first_name: string;
	last_name: string;
	current_password: string;
	new_password: string;
}