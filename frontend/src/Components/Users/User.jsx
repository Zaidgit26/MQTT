import React, { useEffect, useState } from 'react'
import './User.css';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';

const User = ( { searchTerm, visibleCount, onUserCountChange }) => {

  const [users,setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userAPI.getUsers();
        setUsers(response.data.users);
        onUserCountChange(response.data.users.length);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [onUserCountChange]);

  const filteredUsers = users.filter((user) =>
    user.consumerNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = (userId) => {
    localStorage.setItem('userDeviceId', userId);
    navigate('/connecteddevices');
  };

  return (
    <>
      {filteredUsers.slice(0, visibleCount).map((user, index) => (
        <div className="consumer" key={user._id}>
          <div className="serial-number">{index + 1}</div>
          <span className="consumer-no">{user.consumerNo}</span>
          <button className="device-btn" onClick={()=> handleUserClick(user.deviceId)}>
            {Array.isArray(user.deviceId) ? user.deviceId[0] : user.deviceId}
          </button>
        </div>  
      ))}
    </>
  );
};

export default User