import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDetailsPage.css"; // Import the CSS file for styling
import { useAuth } from "../common/AuthContext";
import {
  addMoneyAPI,
  getUserBalance,
  transferMoneyAPI,
  withdrawMoneyAPI,
} from "../utils/apiServices";
import ErrorMessage from "./ErrorMessage";
import Swal from "sweetalert2";

const UserDetailsPage = () => {
  const [currentBalance, setCurrentBalance] = useState(null);
  const [addMoney, setAddMoney] = useState(1);
  const [withdrawMoney, setWithdrawMoney] = useState(0);
  const [transferMoney, setTransferMoney] = useState(0);
  const [receiver, setReceiver] = useState("");
  const [error, setError] = useState("");

  const handleFinancialTransaction = async (type, amount, receiver = null) => {
    try {
      let response;
      const numericAmount = parseFloat(amount);

      switch (type) {
        case "add":
          response = await addMoneyAPI(username, numericAmount);
          break;
        case "withdraw":
          response = await withdrawMoneyAPI(username, numericAmount);
          break;
        case "send":
          response = await transferMoneyAPI(username, receiver.target.value, numericAmount);
          break;
        default:
          throw new Error("Invalid transaction type");
      }

      await handleUserBalance(); // Update user balance after transaction
      if (response)
        Swal.fire({
          title: "Success",
          text: response.message,
          icon: "success",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
    } catch (error) {
      setError(error?.response?.data?.error);
      if (error?.response?.data?.error === "Invalid token") {
        navigate("/login");
        setError("");
      }
    }
  };

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const username = user?.username;
  const handleUserBalance = async () => {
    try {
      const res = await getUserBalance(username);
      setCurrentBalance(res);
    } catch (error) {
      setError(error?.response?.data?.error);
      if (error?.response?.data?.error === "Invalid token") {
        navigate("/login");
        setError("");
      }
    }
  };

  useEffect(() => {
    handleUserBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="user-details-page">
      <header className="header">
        <h1>User Details</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <div className="content">
        <div className="user-details">
          <p>User Name: {username}</p>
          <p>Current Balance: ${currentBalance}</p>
          <ErrorMessage message={error} />
          <footer>
            <div className="action-box">
              <h2>Transfer Money</h2>
              <input
                type="text"
                placeholder="Receiver's Username"
                onChange={setReceiver}
              />
              <input
                type="number"
                placeholder="Amount in $"
                onChange={(e) => setTransferMoney(e.target.value)}
              />
              <button
                className="user-action-button"
                onClick={() =>
                  handleFinancialTransaction("send", transferMoney, receiver)
                }
              >
                Send Money
              </button>
            </div>

            <div className="action-box">
              <h2>Withdraw Money</h2>
              <input
                type="number"
                placeholder="Amount in $"
                onChange={(e) => setWithdrawMoney(e.target.value)}
              />
              <button
                className="user-action-button"
                onClick={() =>
                  handleFinancialTransaction("withdraw", withdrawMoney)
                }
              >
                Withdraw Money
              </button>
            </div>

            <div className="action-box">
              <h2>Add Money</h2>
              <input
                type="number"
                placeholder="Amount in $"
                onChange={(e) => setAddMoney(e.target.value)}
              />
              <button
                className="user-action-button"
                onClick={() => handleFinancialTransaction("add", addMoney)}
              >
                Add Money
              </button>
            </div>
          </footer>
        </div>
        <div className="user-image">
          <img src="/image.jpg" alt="User" />
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
