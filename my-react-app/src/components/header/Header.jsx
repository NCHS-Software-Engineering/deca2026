import MobileNav from "../mobile-header/MobileNav";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import HeaderLogo from '../../images/newheaderlogo.png';
import ProfileImage from '../../images/ProfileImageFile.webp';

const Header = () => {
  return (
    <header>
      <div className="nav-area">
        <Link to="/" className="logo">
        <img src = {HeaderLogo}  width="50" height="50" alt = "Home Button"/> 
        </Link>

        
        {/* for large screens */}
        <Navbar />
 
        {/* for small screens */}
        <MobileNav />


        <Link to= 'profile' className= "profile-button">
        <img src = {ProfileImage}  width="60" height="60" alt = "Profile Button"/> 
        </Link>

      </div>
    </header>
  );
};

export default Header;