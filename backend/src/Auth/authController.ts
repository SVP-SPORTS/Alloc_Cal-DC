import bcryptjs from "bcryptjs";
import User from './user';
import { v4 as uuidv4 } from 'uuid';


const checkIfUserExists = async (email: string) => {
  let response: {
    status: number;
    message: string;
  } = { message: "User not found", status: 404 };
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      response.message = "User exists";
      response.status = 400;
    }
  } catch (e) {
    console.error(e);
  }
  return response;
};

const addUser = async (user: IRegisterNewUser): Promise<boolean> => {
  let userAddedSuccess = false;
  let hashedPassword = await bcryptjs.hash(user.password, 10);
  try {
    const newUser = await User.create({
      _id: uuidv4(),
      email: user.email,
      password: hashedPassword,
      first_name: user.first_name,
      last_name: user.last_name
    });
    if (newUser) {
      userAddedSuccess = true;
    }
  } catch (e) {
    console.error(e);
  }
  return userAddedSuccess;
};

const registerNewUser = async (user: IRegisterNewUser) => {
  let userStatus = await checkIfUserExists(user.email);
  if (userStatus.status === 400) {
    return false;
  } else {
    await addUser(user);
    return true;
  }
};

const getUserCredentials = async (email: string): Promise<IUserCredentialsFromDatabase | null> => {
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      return user.get();
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

const updateProfile = async (user: IUpdateProfile) => {
  let userProfile: IUserCredentialsFromDatabase | null = null;
  try {
    userProfile = await User.findOne({ where: { email: user.email } });
  } catch (e) {
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
    const result = await User.update(
      { first_name: user.first_name, last_name: user.last_name, password: hashedPassword },
      { where: { email: user.email } }
    );
    if (result[0] !== 0) {
      return 200;
    }
  } catch (e) {
    console.log(e);
  }
  return 400;
};

export default {
  registerNewUser,
  getUserCredentials,
  updateProfile,
};

