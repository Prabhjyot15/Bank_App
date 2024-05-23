// RegisterPage.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../common/AuthContext"; // Adjust the path as needed
import { createNewUser, createNewToken } from "../utils/apiServices"; // Adjust the path as needed
import "./RegisterPage.css";
import ErrorMessage from "./ErrorMessage";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await createNewUser(username, password);
      const tokenResponse = await createNewToken(username);
      login({ username }, tokenResponse.token); // Use login method from context
      navigate("/details"); // Redirect to homepage or dashboard as appropriate
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  return (
    <div className="register-page">
      <div className="register-form">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Create Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="password">Create Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <><ErrorMessage message={error} /><br /></>}
          
          <button type="submit">Register</button>
        </form>
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
