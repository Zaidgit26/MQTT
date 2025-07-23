import React, { useEffect, useState, useRef } from "react";
import "./CSS/MasterPage4.css";
import { useNavigate } from "react-router-dom";
import Mqttdata from "../Components/Data/Mqttdata";
import { deviceAPI } from "../services/api";
import { isAuthenticated, getUserData, logout } from "../utils/auth";

const MasterPage4 = () => {
  const [data, setData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const lastFetchRef = useRef(0);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };



  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      console.error("User not authenticated");
      navigate('/', { replace: true });
      return;
    }

    // Get device ID from sessionStorage (not localStorage)
    const deviceId = sessionStorage.getItem("userDeviceId");

    // If no device ID in sessionStorage, try to get from user data
    if (!deviceId) {
      const userData = getUserData();
      if (userData && userData.deviceId && userData.deviceId.length > 0) {
        // Store the first device ID for future use
        sessionStorage.setItem("userDeviceId", userData.deviceId[0]);
      } else {
        console.error("No device ID found");
        setError("No device ID found");
        return;
      }
    }

    const fetchData = async () => {
      // Prevent too frequent requests (minimum 10 seconds between requests)
      const now = Date.now();
      if (now - lastFetchRef.current < 10000) {
        return;
      }

      // Prevent multiple simultaneous requests
      if (isLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);
      lastFetchRef.current = now;

      try {
        // Get the current device ID (might have been updated)
        const currentDeviceId = sessionStorage.getItem("userDeviceId");
        if (!currentDeviceId) {
          throw new Error("Device ID not found");
        }

        const response = await deviceAPI.getDevice(currentDeviceId);
        setData(JSON.stringify(response.data.device));
      } catch (error) {
        console.error("Error fetching data:", error);

        // Handle authentication errors
        if (error.response?.status === 401 || error.message.includes("Authentication")) {
          console.error("Authentication failed, redirecting to login");
          navigate('/', { replace: true });
          return;
        }

        setError(error.message || "Failed to fetch device data");
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling with longer interval to avoid rate limiting
    intervalRef.current = setInterval(fetchData, 15000); // Fetch data every 15 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [navigate]); // Only depend on navigate to avoid infinite loops

  return (
    <div className="container">
      <div className="wrapper">
        <div className="box">
          <div className="header">
            <h2>Connected Users</h2>
            {isLoading && <span style={{ fontSize: '12px', color: '#666' }}>Loading...</span>}
          </div>
          {error && (
            <div style={{
              padding: '10px',
              margin: '10px 0',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33'
            }}>
              Error: {error}
            </div>
          )}
          <Mqttdata data={data} />
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

export default MasterPage4;
