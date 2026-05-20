import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { getRoleFeatures, getRoleDisplayName, ROLES } from '../../utils/roleUtils';
import './profile.css';
import ProfileImageFile from '../../images/ProfileImageFile.webp';

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";
const apiUrl = (path) => `${API_BASE}${path}`;

const ROLEPLAY_CLUSTERS = {
  'Principles of Business Administration Events': [
    'Principles of Business Management and Administration (PBM)',
    'Principles of Entrepreneurship (PEN)',
    'Principles of Finance (PFN)',
    'Principles of Hospitality and Tourism (PHT)',
    'Principles of Marketing (PMK)'
  ],
  'Team Decision Making Events': [
    'Business Law and Ethics (BLTDM)',
    'Buying and Merchandising (BTDM)',
    'Entrepreneurship (ETDM)',
    'Financial Services (FTDM)',
    'Hospitality Services (HTDM)',
    'Marketing Management (MTDM)',
    'Sports and Entertainment Marketing (STDM)',
    'Travel and Tourism (TTDM)'
  ],
  'Individual Series Events': [
    'Accounting Applications (ACT)',
    'Apparel and Accessories Marketing (AAM)',
    'Automotive Services Marketing (ASM)',
    'Business Finance (BFS)',
    'Business Services Marketing (BSM)',
    'Entrepreneurship (ENT)',
    'Food Marketing (FMS)',
    'Hotel and Lodging Management (HLM)',
    'Human Resources Management (HRM)',
    'Marketing Communications (MCS)',
    'Quick Serve Restaurant Management (QSRM)',
    'Restaurant and Food Service Management (RFSM)',
    'Retail Merchandising (RMS)',
    'Sports and Entertainment Marketing (SEM)'
  ],
  'Personal Financial Literacy Event': [
    'Personal Financial Literacy (PFL)'
  ]
};

const ROLEPLAY_CLUSTER_OPTIONS = Object.keys(ROLEPLAY_CLUSTERS);

const WRITTEN_CLUSTERS = {
  'Business Operations Research Events': [
    'Business Services Operations (BOR)',
    'Buying and Merchandising Operations (BMOR)',
    'Finance Operations (FOR)',
    'Hospitality and Tourism Operations (HTOR)',
    'Sports and Entertainment Marketing Operations (SEOR)'
  ],
  'Project Management Events': [
    'Business Solutions Project (PMBS)',
    'Career Development Project (PMCD)',
    'Community Awareness Project (PMCA)',
    'Community Giving Project (PMCG)',
    'Financial Literacy Project (PMFL)',
    'Sales Project (PMSP)'
  ],
  'Entrepreneurship Events': [
    'Innovation Plan (EIP)',
    'Start-Up Business Plan (ESB)',
    'Franchise Business Plan (EFB)',
    'Independent Business Plan (EIB)',
    'Business Growth Plan (EBG)',
    'International Business Plan (IBP)'
  ],
  'Integrated Marketing Campaign Events': [
    'Integrated Marketing Campaign-Event (IMCE)',
    'Integrated Marketing Campaign-Product (IMCP)',
    'Integrated Marketing Campaign-Service (IMCS)'
  ]
};

const WRITTEN_CLUSTER_OPTIONS = Object.keys(WRITTEN_CLUSTERS);
const CROP_SIZE = 300;

const getSelectionsStorageKey = (currentUser) => {
  const userIdentifier = currentUser?.googleId || currentUser?.email;
  return userIdentifier ? `profileSelections:${userIdentifier}` : null;
};

function Profile() {
  const cropPreviewCanvasRef = useRef(null);
  const cropImageRef = useRef(null);

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
  const [roleplayCluster, setRoleplayCluster] = useState('');
  const [roleplayEvent, setRoleplayEvent] = useState('');
  const [writtenCluster, setWrittenCluster] = useState('');
  const [writtenEvent, setWrittenEvent] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const roleplayEvents = roleplayCluster ? ROLEPLAY_CLUSTERS[roleplayCluster] : [];
  const writtenEvents = writtenCluster ? WRITTEN_CLUSTERS[writtenCluster] : [];
  const hasRoleplaySelection = Boolean(roleplayCluster && roleplayEvent);
  const hasWrittenSelection = Boolean(writtenCluster && writtenEvent);
  const hasIncompleteRoleplay = Boolean(roleplayCluster && !roleplayEvent);
  const hasIncompleteWritten = Boolean(writtenCluster && !writtenEvent);
  const canSaveSelections = (hasRoleplaySelection || hasWrittenSelection) && !hasIncompleteRoleplay && !hasIncompleteWritten;

  useEffect(() => {
    if (!user) {
      return;
    }

    const selectionsStorageKey = getSelectionsStorageKey(user);
    if (!selectionsStorageKey) {
      return;
    }

    const storedSelections = localStorage.getItem(selectionsStorageKey);
    if (!storedSelections) {
      return;
    }

    try {
      const parsedSelections = JSON.parse(storedSelections);

      const savedRoleplayCluster = parsedSelections.roleplayCluster;
      const isValidRoleplayCluster = Boolean(savedRoleplayCluster && ROLEPLAY_CLUSTERS[savedRoleplayCluster]);
      const savedRoleplayEvent = parsedSelections.roleplayEvent;
      const isValidRoleplayEvent = Boolean(
        isValidRoleplayCluster &&
        savedRoleplayEvent &&
        ROLEPLAY_CLUSTERS[savedRoleplayCluster].includes(savedRoleplayEvent)
      );

      const savedWrittenCluster = parsedSelections.writtenCluster;
      const isValidWrittenCluster = Boolean(savedWrittenCluster && WRITTEN_CLUSTERS[savedWrittenCluster]);
      const savedWrittenEvent = parsedSelections.writtenEvent;
      const isValidWrittenEvent = Boolean(
        isValidWrittenCluster &&
        savedWrittenEvent &&
        WRITTEN_CLUSTERS[savedWrittenCluster].includes(savedWrittenEvent)
      );

      setRoleplayCluster(isValidRoleplayCluster ? savedRoleplayCluster : '');
      setRoleplayEvent(isValidRoleplayEvent ? savedRoleplayEvent : '');
      setWrittenCluster(isValidWrittenCluster ? savedWrittenCluster : '');
      setWrittenEvent(isValidWrittenEvent ? savedWrittenEvent : '');
    } catch (error) {
      console.error('Error loading saved profile selections:', error);
    }
  }, [user]);

  const handleSaveSelections = () => {
    if (!user) {
      return;
    }

    const selectionsStorageKey = getSelectionsStorageKey(user);
    if (!selectionsStorageKey || !canSaveSelections) {
      return;
    }

    const selections = {
      roleplayCluster,
      roleplayEvent,
      writtenCluster,
      writtenEvent
    };

    localStorage.setItem(selectionsStorageKey, JSON.stringify(selections));

    const updatedUser = {
      ...user,
      profileSelections: selections
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setSaveMessage('Your event selections were saved.');
  };

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
      const res = await axios.post(apiUrl('/api/login'), {
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

  const drawCropPreview = (canvas, image) => {
    if (!canvas || !image) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const scale = imageScale;
    const offsetX = imagePosition.x;
    const offsetY = imagePosition.y;
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;
    const centerX = CROP_SIZE / 2 + offsetX;
    const centerY = CROP_SIZE / 2 + offsetY;

    context.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
    context.save();
    context.beginPath();
    context.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
    context.closePath();
    context.clip();
    context.drawImage(
      image,
      centerX - scaledWidth / 2,
      centerY - scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );
    context.restore();
  };

  useEffect(() => {
    if (!tempImage) {
      cropImageRef.current = null;
      return undefined;
    }

    const image = new Image();
    image.onload = () => {
      cropImageRef.current = image;
      drawCropPreview(cropPreviewCanvasRef.current, image);
    };
    image.src = tempImage;

    return () => {
      image.onload = null;
    };
  }, [tempImage]);

  useEffect(() => {
    if (!showCropper || !cropImageRef.current) {
      return;
    }

    drawCropPreview(cropPreviewCanvasRef.current, cropImageRef.current);
  }, [showCropper, imagePosition, imageScale]);

  const saveCroppedImage = () => {
    const canvas = cropPreviewCanvasRef.current;
    if (!canvas || !cropImageRef.current) {
      return;
    }

    const croppedImage = canvas.toDataURL('image/png');
    setProfilePicture(croppedImage);
    localStorage.setItem('customProfilePicture', croppedImage);
    window.dispatchEvent(new Event('profilePictureChanged'));
    setShowCropper(false);
    setTempImage(null);
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

  useEffect(() => {
    if (!saveMessage) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setSaveMessage('');
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [saveMessage]);

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
            
            <div className="Titles">Cluster: </div>
            <select
              className="profile-select"
              value={roleplayCluster}
              onChange={(e) => {
                setRoleplayCluster(e.target.value);
                setRoleplayEvent('');
              }}
            >
              <option value="">Select roleplay cluster</option>
              {ROLEPLAY_CLUSTER_OPTIONS.map((cluster) => (
                <option key={cluster} value={cluster}>
                  {cluster}
                </option>
              ))}
            </select>

            <div className="Titles">Roleplay event: </div>
            <select
              className="profile-select"
              value={roleplayEvent}
              onChange={(e) => setRoleplayEvent(e.target.value)}
              disabled={!roleplayCluster}
            >
              <option value="">
                {roleplayCluster ? 'Select roleplay event' : 'Select a cluster first'}
              </option>
              {roleplayEvents.map((eventName) => (
                <option key={eventName} value={eventName}>
                  {eventName}
                </option>
              ))}
            </select>

            <div className="Titles">Written cluster: </div>
            <select
              className="profile-select"
              value={writtenCluster}
              onChange={(e) => {
                setWrittenCluster(e.target.value);
                setWrittenEvent('');
              }}
            >
              <option value="">Select written cluster</option>
              {WRITTEN_CLUSTER_OPTIONS.map((cluster) => (
                <option key={cluster} value={cluster}>
                  {cluster}
                </option>
              ))}
            </select>

            <div className="Titles">Written event: </div>
            <select
              className="profile-select"
              value={writtenEvent}
              onChange={(e) => setWrittenEvent(e.target.value)}
              disabled={!writtenCluster}
            >
              <option value="">
                {writtenCluster ? 'Select written event' : 'Select a cluster first'}
              </option>
              {writtenEvents.map((eventName) => (
                <option key={eventName} value={eventName}>
                  {eventName}
                </option>
              ))}
            </select>

            <button
              onClick={handleSaveSelections}
              className="save-selections-button"
              disabled={!canSaveSelections}
            >
              Save Event Selections
            </button>
            {saveMessage && <div className="profile-save-message">{saveMessage}</div>}

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
              <canvas
                ref={cropPreviewCanvasRef}
                width={CROP_SIZE}
                height={CROP_SIZE}
                className="cropper-canvas"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
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
