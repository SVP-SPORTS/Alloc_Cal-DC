import Express from "express";
import passport from "passport";
import LocalStrategy from "../Auth/strategies/local";
import authController from "../Auth/authController";
import User from "../Auth/user";
const router = Express.Router();
passport.use("local", LocalStrategy);
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    User.findByPk(user._id).then((user) => {
        done(null, user);
    }).catch((done) => {
        console.log(done);
    });
});
router.get("/failure", (req, res) => {
    res.status(200).json({ message: "Invalid credentials" });
});
router.get("/success", (req, res) => {
    if (req.user) {
        res.status(200).json({ message: "Success", user: req.user });
    }
});
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/auth/failure');
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/auth/success');
        });
    })(req, res, next);
});
router.post("/register", async (req, res) => {
    let body = req.body;
    let registerStatus = await authController.registerNewUser(body);
    res.status(200).json(registerStatus);
});
router.post("/user", async (req, res) => {
    let user = req.user;
    let userInfo = {};
    if (user) {
        userInfo = { message: `User logged in`, user: user };
    }
    else {
        userInfo = { message: "No user logged in", user: {} };
    }
    res.status(200).json(userInfo);
});
router.get("/logout", (req, res, next) => {
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
router.post("/update", async (req, res) => {
    let body = req.body;
    let updateStatus = await authController.updateProfile(body);
    let responseMessage = {
        status: 0,
        message: "",
    };
    if (updateStatus === 404) {
        responseMessage = { status: 404, message: "User not found" };
    }
    else if (updateStatus === 401) {
        responseMessage = { status: 401, message: "Unauthorized" };
    }
    else if (updateStatus === 400) {
        responseMessage = { status: 400, message: "Bad request" };
    }
    else if (updateStatus === 200) {
        responseMessage = {
            status: 200,
            message: "Profile updated successfully, please login again to see the changes",
        };
    }
    res.status(200).json(responseMessage);
});
export default router;
