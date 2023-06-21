import Express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import LocalStrategy from "./strategies/local";
import authController from "./authController";



const router = Express.Router();

passport.use("local", LocalStrategy);

passport.serializeUser((user: any, done) => {
	done(null, user);
});

passport.deserializeUser((user: any, done) => {
	done(null, user);
});

router.get("/failure", (req: Request, res: Response): void => {
	res.status(200).json({ message: "Invalid credentials" });
});

router.get("/success", (req: Request, res: Response): void => {
	if (req.user) {
		res.status(200).json({ message: "Success", user: req.user });
	}
});

router.post("/login", (req: Request, res: Response, next: NextFunction): void => {
	passport.authenticate("local", {
		successRedirect: "/auth/success",
		failureRedirect: "/auth/failure",
	})(req, res, next);
});

router.post("/register", async (req: Request, res: Response): Promise<void> => {
	let body: IRegisterNewUser = req.body;
	let registerStatus = await authController.registerNewUser(body);
	res.status(200).json(registerStatus);
});

router.post("/user", async (req: Request, res: Response): Promise<void> => {
	let user: IUserSessionInfo = req.user as any;
	let userInfo = {};
	if (user) {
		userInfo = { message: `User logged in`, user: user };
	} else {
		userInfo = { message: "No user logged in", user: {} };
	}
	res.status(200).json(userInfo);
});
 
router.get("/logout", (req: Request, res: Response, next: NextFunction): void => {
	if (!req.user) {
		res.status(401).json({ message: "You are not allowed to log out" });
	}
	if (req.user) {
		req.logout((err) => {
			if (err) {
				return next(err);
			}
			res.clearCookie("connect.sid");
			res.clearCookie("connect.sid.sig");
			res.status(200).json({ message: "Logged out" });
			return;
		});
	}
});

router.post("/update", async (req: Request, res: Response): Promise<void> => {
	let body: IUpdateProfile = req.body;
	let updateStatus = await authController.updateProfile(body);
	let responseMessage = {
		status: 0,
		message: "",
	};
	if (updateStatus === 404) {
		responseMessage = { status: 404, message: "User not found" };
	} else if (updateStatus === 401) {
		responseMessage = { status: 401, message: "Unauthorized" };
	} else if (updateStatus === 400) {
		responseMessage = { status: 400, message: "Bad request" };
	} else if (updateStatus === 200) {
		responseMessage = {
			status: 200,
			message: "Profile updated successfully, please login again to see the changes",
		};
	}
	res.status(200).json(responseMessage);
});

export default router;