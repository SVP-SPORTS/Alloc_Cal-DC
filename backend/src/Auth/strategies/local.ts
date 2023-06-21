import { Strategy } from "passport-local";

import bcryptjs from "bcryptjs";
import authController from "../authController";

const LocalStrategy = new Strategy(
	{
		usernameField: "email",
		passwordField: "password",
	},
	async (email, password, done) => {
		try {
			let userCredentials = await authController.getUserCredentials(email);
			if (userCredentials === null) {
				return done(null, false, { message: "An error was encountered" });
			}

			let passwordCorrect = await bcryptjs.compare(password, userCredentials.password);
			if (passwordCorrect) {
				let userSession: IUserSessionInfo = {
					_id: userCredentials._id,
					first_name: userCredentials.first_name,
					last_name: userCredentials.last_name,
					email: userCredentials.email,
					scope: userCredentials.scope,
				};
				// console.log(userSession);
				return done(null, userSession, { message: "Successfully logged in" });
			} else {
				return done(null, false, { message: "Invalid username or password" });
			}
		} catch (err) {
			return done(err);
		}
	},
); 

export default LocalStrategy;