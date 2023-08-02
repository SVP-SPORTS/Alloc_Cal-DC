interface IUserSessionInfo {
	_id: string | null;
	email: string;
	first_name: string;
	last_name: string;
	scope: string;
	location:string;
}

interface IUpdateProfile {
	email: string;
	first_name: string;
	last_name: string;
	current_password: string;
	new_password: string;
}