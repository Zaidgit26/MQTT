import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/MasterPage4.css";
import { useNavigate } from "react-router-dom";
import Mqttdata from "../Components/Data/Mqttdata";

const MasterPage4 = () => {
  const [data, setData] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const deviceId = localStorage.getItem("userDeviceId");

    if (!deviceId) {
      console.error("No device ID found");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/devices/${deviceId}`
        );
        setData(JSON.stringify(response.data.device));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="container">
      <div className="wrapper">
        <div className="box">
          <div className="header">
            <button className="back-button" onClick={() => navigate('/')}>←</button>
            <h2>Connected Users</h2>
          </div>
          <Mqttdata data={data} />
        </div>
      </div>
    </div>
  );
};

export default MasterPage4;
