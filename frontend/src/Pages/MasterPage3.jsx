import React, { useState } from "react";
import "./CSS/MasterPage3.css";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const MasterPage3 = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored data and navigate to login
    sessionStorage.clear();
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const [consumerNo, setConsumerNo] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleReset = async () => {
    if (!consumerNo || !newPassword) {
      setMessage("Please fill in all fields.");
      setMessageType("error");
      clearMessageAfterTimeout();
      return;
    }

    try {
      const response = await authAPI.resetPassword({
        consumerNo,
        newPassword,
      });

      setMessage(response.data.message);
      setMessageType("success");
      setConsumerNo("");
      setNewPassword("");
    } catch (err) {
      console.error("Error resetting password:", err);
      setMessage(err.response?.data?.message || "An error occurred while resetting the password.");
      setMessageType("error");
    }

    clearMessageAfterTimeout();
  };

  const clearMessageAfterTimeout = () => {
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  return (
    <div className="container">
        <div className="wrapper">
          <div className="card">
            <div className="header">
              <button
                className="btn top-back"
                onClick={() => navigate("/master")}
              >
                ←
              </button>
              <h2>Password Reset</h2>
            </div>

            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}

            <input
              type="text"
              placeholder="Consumer No"
              className="input-field"
              value={consumerNo}
              onChange={(e) => setConsumerNo(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className="single-button">
              <button className="btn reset" onClick={handleReset}>Reset</button>
            </div>
            <div className="logout-container">
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MasterPage3;
