import React, { useState } from "react";
import "./CSS/Devices.css";
import { useNavigate } from "react-router-dom";
import User from "../Components/Users/User";

const Devices = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const [userCount, setUserCount] = useState(0);
  const navigate = useNavigate();
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };
  
  return (
    <div className="outer-container">
      <div className="wrapper">
        <div className="inner-container">
          <div className="top-bar">
            <button className="gradient-btn" onClick={() => navigate('/master')}>←</button>
            <input
              type="text"
              placeholder="Search ..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <h2>Connected List</h2>

          <User searchTerm={searchTerm} visibleCount={visibleCount} onUserCountChange={(count) => setUserCount(count)}/>
      
        { userCount > 5 && (
          <div className="bottom-bar">
            <button className="gradient-btn" onClick={handleLoadMore}>Load More ...</button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Devices;
