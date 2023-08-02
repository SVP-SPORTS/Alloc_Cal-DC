interface IUserCredentialsFromDatabase {
	_id: string;
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	scope: string;
	location: string;
}

interface IUserSessionInfo {
	_id: string;
	email: string;
	first_name: string;
	last_name: string;
	scope: string;
	location: string;
}

interface IRegisterNewUser {
	email: string;
	password: string;
	first_name: string;
	last_name: string; 
	location: string;
	scope: string; // Add scope property to the registration data interface
  }

interface IUpdateProfile {
	email: string;
	first_name: string;
	last_name: string;
	current_password: string;
	new_password: string;
	scope: string;
	location: string;
}

declare global {
	namespace Express {
	  interface User {
		_id: string;
		email: string;
		first_name: string;
		last_name: string;
		scope: string;
		location: string
	  }
	}
  } 

  