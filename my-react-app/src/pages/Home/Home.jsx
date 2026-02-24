import './Home.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import promo from '../../images/DECA-promo-1.webp';
import promo2 from '../../images/promo2.jpeg';
import promo3 from '../../images/promo3.jpg';
import scrollTopImage from '../../images/your-scroll-image.png';
import { useNavigate } from "react-router-dom";

// Slideshow images array - add more images here
const slideshowImages = [
  promo,
  promo2, // Replace with additional images
  promo3, // Replace with additional images
];

function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [correctPassword, setCorrectPassword] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  

  useEffect(() => {
    // Check for stored unlock flag
    const stored = sessionStorage.getItem("deca_unlocked");
    if (stored === "true") {
      setUnlocked(true);
    }

    const toggleVisibility = () => {
            const scrollButton = document.querySelector(".scroll-to-top");
      if (scrollButton) {
        if (window.scrollY > 300) {
          scrollButton.classList.add("visible");
        } else {
          scrollButton.classList.remove("visible");
        }
      }

    };

    const fetchPassword = async () => {
      try {
        const res = await axios.get("https://deca.redhawks.us/api/password");
        setCorrectPassword(res.data.password);
        console.log("Fetched password from DB:", res.data.password);
      } catch (err) {
        console.error("Failed to fetch password:", err);
      }
    };
    fetchPassword();

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    if (!unlocked) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [unlocked]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };

  const navigate = useNavigate();

  const handleClick = (name, color, cluster) => {
    // Save to localStorage
    localStorage.setItem('deca_headerName', name);
    localStorage.setItem('deca_color', color);
    localStorage.setItem('deca_cluster', cluster);
  
    // Navigate to Practice page
    navigate("/Practice", { state: { name, color, cluster } });
  };
  

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    if (passwordInput === correctPassword) {
      setUnlocked(true);
      sessionStorage.setItem("deca_unlocked", "true");
      setError('');
      window.location.reload();
    } else {
      setError('Incorrect password. Try again.');
    }
  };

  if (!unlocked) {
    return (
      <div className="password-lock-container">
        <h2>Enter Password to Access DECApp</h2>
        <form onSubmit={handleSubmitPassword}>
          <input
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button type="submit">Unlock</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="squares-container">
        <div className="left-square">  
          <h2>Welcome to DECApp!</h2>
          <p>
            DECApp is a study tool designed for DECA participants at NCHS. 
            <br /><br />
            Choose your event below to start studying!
          </p>
        </div>
        <div className="right-square">  
          <div className="slideshow-container">
            <img src={slideshowImages[currentSlide]} alt="DECA Promo" className="square-image" />
            
            {/* Navigation buttons */}
            <button className="slideshow-prev" onClick={prevSlide}>
              ❮
            </button>
            <button className="slideshow-next" onClick={nextSlide}>
              ❯
            </button>
            
            {/* Slide indicators */}
            <div className="slideshow-dots">
              {slideshowImages.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="selector-container">
        <button className="selector-box-left-end business" onClick={() => handleClick("Business Management and Administration", "var(--Color-Business)", "Business")}>
          <h2>Business Management & Administration</h2>
        </button>

        <button className="selector-box entrepreneurship" onClick={() => handleClick("Entrepreneurship", "var(--Color-Entrepreneurship)", "Entrepreneurship")}>
          <h2>Entrepreneurship</h2>
        </button>

        <button className="selector-box finance" onClick={() => handleClick("Finance", "var(--Color-Finance)", "Finance")}>
          <h2>Finance</h2>
        </button>

        <button className="selector-box hospitality" onClick={() => handleClick("Hospitality and Tourism", "var(--Color-Hospitality)", "Hospitality")}>
          <h2>Hospitality and Tourism</h2>
        </button>

        <button className="selector-box marketing" onClick={() => handleClick("Marketing", "var(--Color-Marketing)", "Marketing")}>
          <h2>Marketing</h2>
        </button>

        <button className="selector-box-right-end personal-finance" onClick={() => handleClick("Personal Financial Literacy", "var(--Color-Personal-Finance)", "FinancialLiteracy")}>
          <h2>Personal Financial Literacy</h2>
        </button>
      </div>

      <div className = "names-2025">
          <h4>2024-2025 Dev Team: Henry Allman '25, Bijoux Stilson '26, Robbie Ruthig '26</h4>
          <h4>2025-2026 Dev Team: Shriya Kunnanath '26, Nimai Nagireddy '27, Jonathan Yuan '26</h4>
      </div>


      <div className="scroll-to-top" onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}>
        <img src={scrollTopImage} alt="Scroll to top" />
      </div>
    </>
  );
}

export default Home;
