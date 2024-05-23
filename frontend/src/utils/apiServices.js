import axios from "axios";
import Cookies from "js-cookie";
// import * as Sentry from '@sentry/browser'
// import { handleError } from '@jetkit/react'


const api = axios.create({
  baseURL: "http://127.0.0.1:5000", // Replace with your actual backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Login User
const loginUser = async (username, password) => {
  try {
    const response = await api.post("/login", { username, password });
    Cookies.set("token", response.data.token); // Storing the token in cookies
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response.data);
    throw error;
  }
};

// Check if Username Exists
const checkUsernameExists = async (username) => {
  try {
    const response = await api.get("/checkIfUserNameExists", {
      params: { username },
    });
    return response.data.exists;
  } catch (error) {
    console.error("Error checking username:", error.response.data);
    throw error;
  }
};

// Create a New Token for a User
const createNewToken = async (username) => {
  try {
    const response = await api.post("/createNewToken", { username });
    Cookies.set("token", response.data.token); // Updating the token in cookies
    return response.data;
  } catch (error) {
    console.error("Error creating new token:", error.response.data);
    throw error;
  }
};

// Create New User
const createNewUser = async (username, password) => {
  try {
    const response = await api.post("/createNewUser", { username, password });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error.response.data);
    throw error;
  }
};

// Add Money to User Account
const addMoneyAPI = async (username, amount) => {
    try {
        console.log(typeof amount)
    const token = Cookies.get("token");
    const response = await api.post(
      "/add_money",
      { username, amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding money:", error.response.data);
    throw error;
  }
};

// Withdraw Money from User Account
const withdrawMoneyAPI = async (username, amount) => {
  try {
    const token = Cookies.get("token");
    const response = await api.post(
      "/withdraw_money",
      { username, amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error withdrawing money:", error.response.data);
    throw error;
  }
};

// Transfer/send Money from One User to Another
const transferMoneyAPI = async (sender, receiver, amount) => {
  try {
    const token = Cookies.get("token");
    const response = await api.post(
      "/transfer_money",
      { sender, receiver, amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error transferring money:", error.response.data);
    throw error;
  }
};

// Get User Balance
const getUserBalance = async (username) => {
    const token = Cookies.get("token");  // Ensure the token is being fetched correctly
    try {
        const response = await api.get(`/get_balance?username=${encodeURIComponent(username)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.balance;
    } catch (error) {
        console.error("Error getting user balance:", error.response.data);
        throw error;
    }
};

// const handleApiErrorWithSentry = (error) => {
//     Sentry.captureException(error)
//     handleError(error)
//   }

export {
  loginUser,
  checkUsernameExists,
  createNewToken,
  createNewUser,
  addMoneyAPI,
  withdrawMoneyAPI,
  transferMoneyAPI,
  getUserBalance,
};
