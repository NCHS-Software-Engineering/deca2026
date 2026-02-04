import './Home.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import promo from '../../images/DECA-promo-1.webp';
import scrollTopImage from '../../images/your-scroll-image.png';
import { useNavigate } from "react-router-dom";

function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [correctPassword, setCorrectPassword] = useState('');
  

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
          <img src={promo} alt="" className="square-image" />
        </div>
      </div>
      
      <div className="selector-container">
        <button className="selector-box-left-end business" onClick={() => handleClick("Business Management and Administration", "var(--Color-Business)", "Business")}>
          <h3>Business Management & Administration</h3>
        </button>

        <button className="selector-box entrepreneurship" onClick={() => handleClick("Entrepreneurship", "var(--Color-Entrepreneurship)", "Entrepreneurship")}>
          <h3>Entrepreneurship</h3>
        </button>

        <button className="selector-box finance" onClick={() => handleClick("Finance", "var(--Color-Finance)", "Finance")}>
          <h3>Finance</h3>
        </button>

        <button className="selector-box hospitality" onClick={() => handleClick("Hospitality and Tourism", "var(--Color-Hospitality)", "Hospitality")}>
          <h3>Hospitality and Tourism</h3>
        </button>

        <button className="selector-box marketing" onClick={() => handleClick("Marketing", "var(--Color-Marketing)", "Marketing")}>
          <h3>Marketing</h3>
        </button>

        <button className="selector-box-right-end personal-finance" onClick={() => handleClick("Personal Financial Literacy", "var(--Color-Personal-Finance)", "FinancialLiteracy")}>
          <h3>Personal Financial Literacy</h3>
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
