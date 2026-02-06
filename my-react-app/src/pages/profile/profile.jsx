import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './profile.css';

function Profile() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const responseMessage = async (response) => {
    try {
      const userObject = jwtDecode(response.credential);

      // Determine role based on email domain
      let role = "student";
      if (
        userObject.email.endsWith("@naperville203.org") &&
        !userObject.email.endsWith("@stu.naperville203.org")
      ) {
        role = "teacher";
      }

      // Send user data + role to backend
      const res = await axios.post('https://deca.redhawks.us/api/login', {
        googleId: userObject.sub,
        name: userObject.name,
        email: userObject.email,
        pictureUrl: userObject.picture,
        role: role
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
            <p><strong>Role:</strong> {user.role}</p>

            <div className="Titles">Roleplay event: </div>
            <div className="Titles">Cluster: </div>
            <div className="Titles">Written event: </div>
            <div className="Titles">Cluster: </div>

            <button onClick={handleLogout}>Logout</button> {/*does not show a pointer cursor*/}
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
