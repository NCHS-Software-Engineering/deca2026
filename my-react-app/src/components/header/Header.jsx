import React, { useEffect, useState } from "react";
import MobileNav from "../mobile-header/MobileNav";
import Navbar from "./Navbar";
import SearchBar from "../SearchBar";
import { Link } from "react-router-dom";
import HeaderLogo from '../../images/newheaderlogo.png';
import ProfileImage from '../../images/ProfileImageFile.webp';

const Header = () => {
  const [userName, setUserName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState(ProfileImage);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Try different name fields that might exist
        const name = parsed.name || parsed.given_name || parsed.email?.split('@')[0] || 'User';
        setUserName(name);
        
        // Check for custom profile picture first, then Google picture, then default
        const customPicture = localStorage.getItem('customProfilePicture');
        if (customPicture) {
          setProfilePicture(customPicture);
        } else if (parsed.pictureUrl) {
          setProfilePicture(parsed.pictureUrl);
        }
      }

      // initialize dark-mode from localStorage
      const savedDark = localStorage.getItem('darkMode');
      const isDark = savedDark === 'true';
      setDarkMode(isDark);
      if (isDark) document.documentElement.classList.add('dark-mode');
      else document.documentElement.classList.remove('dark-mode');
    } catch (e) {
      // ignore
    }

    // Listen for storage changes to update profile picture dynamically
    const handleStorageChange = (e) => {
      if (e.key === 'customProfilePicture') {
        if (e.newValue) {
          setProfilePicture(e.newValue);
        } else {
          // Picture was removed, revert to Google or default
          try {
            const saved = localStorage.getItem('user');
            if (saved) {
              const parsed = JSON.parse(saved);
              setProfilePicture(parsed.pictureUrl || ProfileImage);
            } else {
              setProfilePicture(ProfileImage);
            }
          } catch (err) {
            setProfilePicture(ProfileImage);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleCustomEvent = () => {
      const customPicture = localStorage.getItem('customProfilePicture');
      if (customPicture) {
        setProfilePicture(customPicture);
      } else {
        try {
          const saved = localStorage.getItem('user');
          if (saved) {
            const parsed = JSON.parse(saved);
            setProfilePicture(parsed.pictureUrl || ProfileImage);
          } else {
            setProfilePicture(ProfileImage);
          }
        } catch (err) {
          setProfilePicture(ProfileImage);
        }
      }
    };

    window.addEventListener('profilePictureChanged', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profilePictureChanged', handleCustomEvent);
    };
  }, []);

  return (
    <header>
      <div className="nav-area">
        <Link to="/" className="logo">
          <img src={HeaderLogo} width="50" height="50" alt="Home Button" />
        </Link>

        {/* for large screens */}
        <Navbar />

        {/* Search Bar */}
        <SearchBar />

        {/* for small screens */}
        <MobileNav />


        {/* would like to add a message shwowing user's name so that they can know if they are logged in*/}
        
        <div className="profile-control">
          <Link to="profile" className="profile-button">
            {userName && <span className="profile-name">{userName}</span>}
            <img src={profilePicture} width="60" height="60" alt="Profile Button" />
          </Link>

          <button
            className={`dark-toggle`}
            data-tooltip={darkMode ? 'Light mode' : 'Dark mode'}
            onClick={() => {
              const next = !darkMode;
              setDarkMode(next);
              try { localStorage.setItem('darkMode', next ? 'true' : 'false'); } catch (e) {}
              document.documentElement.classList.toggle('dark-mode', next);
            }}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {/* small moon icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;