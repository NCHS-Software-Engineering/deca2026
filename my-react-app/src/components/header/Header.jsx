import React, { useEffect, useState } from "react";
import MobileNav from "../mobile-header/MobileNav";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import HeaderLogo from '../../images/newheaderlogo.png';
import ProfileImage from '../../images/ProfileImageFile.webp';

const Header = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) setRole(parsed.role);
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

        {/* for small screens */}
        <MobileNav />


        {/* would like to add a message shwowing user's name so that they can know if they are logged in*/}
        <Link to= 'profile' className= "profile-button">
        <img src = {ProfileImage}  width="60" height="60" alt = "Profile Button"/> 
         </Link>
        <Link to="profile" className="profile-button">
          {role && <span className="profile-role">{role}</span>}
          <img src={ProfileImage} width="60" height="60" alt="Profile Button" />
        </Link>

      </div>
    </header>
  );
};

export default Header;