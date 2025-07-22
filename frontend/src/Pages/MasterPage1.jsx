import React from 'react'
import './CSS/MasterPage1.css'
import { useNavigate } from 'react-router-dom'

const MasterPage1 = () => {

  const navigate = useNavigate();

  return (
    <div className="master-container">
      <div className="wrapper">
        <div className="master-box">
          <button className="master-btn" onClick={() => navigate('/usercreation')}>User Creation</button>
          <button className="master-btn" onClick={() => navigate('/devices')}>Devices</button>
          <button className="master-btn" onClick={() => navigate('/passwordreset')}>Password Reset</button>
          <button className="master-btn logout" onClick={() => navigate('/')}>Logout</button>
        </div>
      </div>
    </div>
  )
}

export default MasterPage1