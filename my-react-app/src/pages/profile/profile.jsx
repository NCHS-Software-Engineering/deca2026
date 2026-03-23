import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './profile.css';
import ProfileImageFile from '../../images/ProfileImageFile.webp';

function Profile() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [profilePicture, setProfilePicture] = useState(() => {
    return localStorage.getItem('customProfilePicture') || null;
  });

  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
      const res = await axios.post('https://decatest.redhawks.us/api/login', {
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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setImagePosition({ x: 0, y: 0 });
        setImageScale(1);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset the file input
    event.target.value = '';
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - imagePosition.x,
      y: touch.clientY - imagePosition.y
    });
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      setImagePosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const saveCroppedImage = () => {
    // Create a canvas to crop the circular area
    const canvas = document.createElement('canvas');
    const size = 300; // Final image size
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Draw the positioned and scaled image
    const img = new Image();
    img.onload = () => {
      const scale = imageScale;
      const offsetX = imagePosition.x;
      const offsetY = imagePosition.y;
      
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        img.width * scale,
        img.height * scale
      );

      const croppedImage = canvas.toDataURL('image/png');
      setProfilePicture(croppedImage);
      localStorage.setItem('customProfilePicture', croppedImage);
      window.dispatchEvent(new Event('profilePictureChanged'));
      setShowCropper(false);
      setTempImage(null);
    };
    img.src = tempImage;
  };

  const cancelCrop = () => {
    setShowCropper(false);
    setTempImage(null);
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    localStorage.removeItem('customProfilePicture');
    // Dispatch custom event to notify header
    window.dispatchEvent(new Event('profilePictureChanged'));
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
            {/* Profile Picture Section */}
            <div className="profile-picture-section">
              <img 
                src={profilePicture || user.pictureUrl || ProfileImageFile} 
                alt="Profile" 
                className="profile-picture-large"
              />
              <div className="profile-picture-controls">
                <label htmlFor="profile-upload" className="upload-button">
                  Change Picture
                </label>
                <input 
                  id="profile-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                {profilePicture && (
                  <button onClick={removeProfilePicture} className="remove-button">
                    Remove Custom Picture
                  </button>
                )}
              </div>
            </div>

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

      {/* Image Cropper Modal */}
      {showCropper && (
        <div className="cropper-modal">
          <div className="cropper-container">
            <h3>Position Your Photo</h3>
            <p className="cropper-instructions">Drag to reposition • Use slider to zoom</p>
            
            <div 
              className="cropper-preview"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              <img
                src={tempImage}
                alt="Crop preview"
                className="cropper-image"
                style={{
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                draggable={false}
              />
              <div className="cropper-circle-overlay" />
            </div>

            <div className="cropper-controls">
              <label>Zoom:</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={imageScale}
                onChange={(e) => setImageScale(parseFloat(e.target.value))}
                className="zoom-slider"
              />
            </div>

            <div className="cropper-buttons">
              <button onClick={cancelCrop} className="cancel-crop-button">
                Cancel
              </button>
              <button onClick={saveCroppedImage} className="save-crop-button">
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
