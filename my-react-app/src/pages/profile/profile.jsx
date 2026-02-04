import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { getRoleFeatures, getRoleDisplayName, ROLES } from '../../utils/roleUtils';
import './profile.css';

function Profile() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const responseMessage = async (response) => {
    try {
      const userObject = jwtDecode(response.credential);

      // Send user data to backend (role will be determined by server based on email)
      const res = await axios.post('https://deca.redhawks.us/api/login', {
        googleId: userObject.sub,
        name: userObject.name,
        email: userObject.email,
        pictureUrl: userObject.picture
      });

      // Add role to user object and store
      const userWithRole = res.data.user;
      setUser(userWithRole);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      window.location.reload();
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const errorMessage = (error) => {
    console.log(error);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.reload();
  };

  const renderAccountTier = () => {
    if (!user) return null;
    
    const features = getRoleFeatures(user.role);
    const isSponsor = user.role === ROLES.SPONSOR;

    return (
      <div className="account-tier-section">
        <div className={`tier-badge ${user.role}`}>
          <span className="tier-icon">{features.icon}</span>
          <span className="tier-name">{getRoleDisplayName(user.role)}</span>
          {isSponsor && <span className="tier-badge-premium">Premium</span>}
        </div>
        
        <div className="tier-features">
          <h3>Your Account Features:</h3>
          <ul>
            {features.canViewRestrictedContent && (
              <li>✓ Access to Sponsor-Only Content</li>
            )}
            {features.canAccessAnalytics && (
              <li>✓ Advanced Analytics & Reports</li>
            )}
            {features.canManageUsers && (
              <li>✓ User Management Capabilities</li>
            )}
            {features.canEditPIs && (
              <li>✓ Performance Indicator Editing</li>
            )}
            {features.canViewTeacherDashboard && (
              <li>✓ Teacher Dashboard Access</li>
            )}
            {features.canExportData && (
              <li>✓ Data Export Functionality</li>
            )}
            {!features.canViewRestrictedContent && (
              <li className="limited">Limited to standard content</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <>
      {!user ? (
        <div className="login-container">
          <h2>React Google Login</h2>
          <div className="google-login-button">
            <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
          </div>
        </div>
      ) : (
        <div>
          <div className="Welcome"><h1>Welcome to your profile!</h1></div>
          <div className="profile-info">
            {user.picture && <img src={user.picture} alt="profile" />}
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            
            {renderAccountTier()}

            <div className="Titles">Roleplay event: </div>
            <div className="Titles">Cluster: </div>
            <div className="Titles">Written event: </div>
            <div className="Titles">Cluster: </div>

            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
