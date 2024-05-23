import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Import the CSS file for styling
import { useAuth } from "../common/AuthContext";
import { loginUser } from "../utils/apiServices";
import ErrorMessage from "./ErrorMessage";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const response = await loginUser(username, password);
        login({ username }, response.token);
        navigate("/details");
      
    } catch (error) {
      setError(error?.response?.data?.error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <div className="login-form">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              placeholder="Username"
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
            />
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="example@example.com"
            />
            {error && <ErrorMessage message={error} />}

            <button type="submit">Login</button>
          </form>
          <Link to="/register">Register here</Link>
          <br />
          <Link to="/">Go back</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
