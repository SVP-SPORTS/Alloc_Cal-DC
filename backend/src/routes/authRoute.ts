import Express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import LocalStrategy from "../Auth/strategies/local";
import authController from "../Auth/authController";



import User from "../Auth/user";

import { checkScope, isAuthenticated } from "../Auth/authMiddleware";



const router = Express.Router(); 

passport.use("local", LocalStrategy);

passport.serializeUser((user: any, done) => {
	done(null, user);
});

passport.deserializeUser((user: IUserSessionInfo, done) => {
	User.findByPk(user._id).then((user) => {
		done(null, user);
	  }).catch((done) => {
		console.log(done);
	  });
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
	passport.authenticate("local", (err: Error, user: IUserCredentialsFromDatabase, info: any) => {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/auth/failure'); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect('/');
        });
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

router.post("/update",async (req: Request, res: Response): Promise<void> => {
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

router.get("/users", async (req: Request, res: Response): Promise<void> => {
  const users = await authController.getAllUsers();
  if (users) {
    res.status(200).json(users);
  } else {
    res.status(500).json({message: 'An error occurred'});
  }
});



router.put('/update/:id',isAuthenticated,checkScope('SuperAdmin'), async (req: Request, res: Response) => {
	const { scope, location } = req.body;
	
	let userData = await User.findOne({ where: { _id: req.params.id } });
	
	if (!userData){
	  return res.status(404).json({ error: 'User does not exist' });
	} 
	
	// Update User
	await User.update(
	  { scope: scope, location: location },
	  { where: { _id: req.params.id } }
	);
	
	const updatedUserData = await User.findOne({ where: { _id: req.params.id } });
	res.status(200).json(updatedUserData);
  });


export default router;