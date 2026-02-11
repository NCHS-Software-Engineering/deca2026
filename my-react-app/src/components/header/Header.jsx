import React, { useEffect, useState } from "react";
import MobileNav from "../mobile-header/MobileNav";
import Navbar from "./Navbar";
import SearchBar from "../SearchBar";
import { Link } from "react-router-dom";
import HeaderLogo from '../../images/newheaderlogo.png';
import ProfileImage from '../../images/ProfileImageFile.webp';

const Header = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Try different name fields that might exist
        const name = parsed.name || parsed.given_name || parsed.email?.split('@')[0] || 'User';
        setUserName(name);
      }
    } catch (e) {
      // ignore
    }
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
       
        <Link to="profile" className="profile-button">
          {userName && <span className="profile-name">{userName}</span>}
          <img src={ProfileImage} width="60" height="60" alt="Profile Button" />
        </Link>

      </div>
    </header>
  );
};

export default Header;