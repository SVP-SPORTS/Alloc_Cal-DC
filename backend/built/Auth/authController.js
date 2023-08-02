import bcryptjs from "bcryptjs";
import User from './user';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const checkIfUserExists = async (email) => {
    let response = { message: "User not found", status: 404 };
    try {
        const user = await User.findOne({ where: { email } });
        if (user) {
            response.message = "User exists";
            response.status = 400;
        }
    }
    catch (e) {
        console.error(e);
    }
    return response;
};
const addUser = async (user) => {
    let userAddedSuccess = false;
    let hashedPassword = await bcryptjs.hash(user.password, 10);
    try {
        const newUser = await User.create({
            _id: uuidv4(),
            email: user.email,
            password: hashedPassword,
            first_name: user.first_name,
            last_name: user.last_name,
            location: user.location,
            scope: user.scope,
        });
        if (newUser) {
            userAddedSuccess = true;
        }
    }
    catch (e) {
        console.error(e);
    }
    return userAddedSuccess;
};
const registerNewUser = async (user) => {
    let userStatus = await checkIfUserExists(user.email);
    if (userStatus.status === 400) {
        return false;
    }
    else {
        await addUser(user);
        return true;
    }
};
const getUserCredentials = async (email) => {
    try {
        const user = await User.findOne({ where: { email } });
        if (user) {
            return {
                _id: user._id,
                email: user.email,
                password: user.password,
                first_name: user.first_name,
                last_name: user.last_name,
                location: user.location,
                scope: user.scope,
            };
        }
    }
    catch (e) {
        console.error(e);
    }
    return null;
};
const updateProfile = async (user) => {
    let userProfile = null;
    try {
        userProfile = await User.findOne({ where: { email: user.email } });
    }
    catch (e) {
        console.log(e);
    }
    if (!userProfile) {
        return 404;
    }
    const passwordCheck = await bcryptjs.compare(user.current_password, userProfile.password);
    if (passwordCheck === false) {
        return 401;
    }
    let hashedPassword = await bcryptjs.hash(user.new_password, 10);
    try {
        const result = await User.update({ first_name: user.first_name, last_name: user.last_name, password: hashedPassword }, { where: { email: user.email } });
        if (result[0] !== 0) {
            return 200;
        }
    }
    catch (e) {
        console.log(e);
    }
    return 400;
};
// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign({ _id: user._id, email: user.email, scope: user.scope }, JWT_SECRET, { expiresIn: '1h' });
};
// Verify JWT Token
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (e) {
        return null;
    }
};
// Add new login function
const loginUser = async (credentials) => {
    const user = await getUserCredentials(credentials.email);
    if (!user)
        return { message: 'User not found', status: 404 };
    const passwordCheck = await bcryptjs.compare(credentials.password, user.password);
    if (!passwordCheck)
        return { message: 'Invalid credentials', status: 401 };
    // create a session info object
    const sessionInfo = {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        scope: user.scope,
        location: user.location,
    };
    // Generate JWT Token
    const token = generateToken(sessionInfo);
    return { token, status: 200 };
};
export default {
    registerNewUser,
    getUserCredentials,
    updateProfile,
    generateToken,
    verifyToken,
    loginUser,
};
