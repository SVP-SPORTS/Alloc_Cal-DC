import { Strategy } from "passport-local";
import bcryptjs from "bcryptjs";
import authController from "../authController";
import passport from "passport";
import User from "../user";

const LocalStrategy = new Strategy(
	{
		usernameField: "email",
		passwordField: "password",
	},
	async (email, password, done) => {
		try {
			let userCredentials = await authController.getUserCredentials(email);
			if (userCredentials === null) {
				return done(null, false, { message: "Invalid username or password" });
			}

			let passwordCorrect = await bcryptjs.compare(password, userCredentials.password);
			if (passwordCorrect) {
				let userSession: IUserSessionInfo = {
					_id: userCredentials._id,
					first_name: userCredentials.first_name,
					last_name: userCredentials.last_name,
					email: userCredentials.email,
					location: userCredentials.location,
					scope: userCredentials.scope,
				};
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