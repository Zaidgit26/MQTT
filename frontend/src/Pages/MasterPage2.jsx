import React, { useState } from "react";
import axios from "axios";
import "./CSS/MasterPage2.css";
import { useNavigate } from "react-router-dom";

const MasterPage2 = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    deviceId: "",
    password: "",
    consumerName: "",
    consumerAddress: "",
    consumerNo: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/register",
        formData
      );
      setMessage(response.data.message);
      setMessageType("success");

      setFormData({
        deviceId: "",
        password: "",
        consumerName: "",
        consumerAddress: "",
        consumerNo: "",
      });
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.message || "Registration failed");
      setMessageType("error");
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  return (
    <div className="user-container">
      <div className="wrapper">
        <div className="user-box">
          <button className="back-btn" onClick={() => navigate("/master")}>
            ←
          </button>
          <h2 className="form-title">USER CREATION</h2>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <form className="user-form" onSubmit={handleRegister}>
            <input
              type="number"
              placeholder="Device ID"
              name="deviceId"
              value={formData.deviceId}
              onChange={handleChange}
              required
              onKeyDown={(e) => {
                if (
                  e.key === "e" ||
                  e.key === "E" ||
                  e.key === "+" ||
                  e.key === "-" ||
                  e.key === "."
                ) {
                  e.preventDefault();
                }
              }}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Consumer Name"
              name="consumerName"
              value={formData.consumerName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Consumer Address"
              name="consumerAddress"
              value={formData.consumerAddress}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              placeholder="Consumer No"
              name="consumerNo"
              value={formData.consumerNo}
              onChange={handleChange}
              required
              onKeyDown={(e) => {
                if (
                  e.key === "e" ||
                  e.key === "E" ||
                  e.key === "+" ||
                  e.key === "-" ||
                  e.key === "."
                ) {
                  e.preventDefault();
                }
              }}
            />

            <button type="submit" className="login-btn">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MasterPage2;
