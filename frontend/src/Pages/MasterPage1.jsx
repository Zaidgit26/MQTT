import React from 'react'
import './CSS/MasterPage1.css'
import { useNavigate } from 'react-router-dom'

const MasterPage1 = () => {

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored data and navigate to login
    sessionStorage.clear();
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <div className="master-container">
      <div className="wrapper">
        <div className="master-box">
          <button className="master-btn" onClick={() => navigate('/usercreation')}>User Creation</button>
          <button className="master-btn" onClick={() => navigate('/devices')}>Devices</button>
          <button className="master-btn" onClick={() => navigate('/passwordreset')}>Password Reset</button>
          <div className="logout-container">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MasterPage1