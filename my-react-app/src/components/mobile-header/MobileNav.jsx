import React, { useEffect, useRef, useState } from "react";
import "../../App.css";

import MobileMenuItems from "./MobileMenuItems";

const menuItemsData = [
  {
    title: "HOME",
    url: "/",
  },
  
  
      {
        title: "PRACTICE",
        url: "/Practice",
        
      },
      {
        title: "STATS",
        url: "/Stats",
      },
      {
        title: "TESTS",
        url: "/Tests",
      },
      {
        title: "REPORTS",
        url: "/flashcard-reports",
      }
    
  
 
];

const MobileNav = () => {
  const depthLevel = 0;
  const [showMenu, setShowMenu] = useState(false);
  let ref = useRef();

  const openMenuAndFocusFirst = () => {
    setShowMenu(true);
    window.setTimeout(() => {
      const firstItem = ref.current?.querySelector(':scope > .menu-items > button, :scope > .menu-items > a');
      firstItem?.focus();
    }, 0);
  };

  const handleMenuButtonKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!showMenu) {
        openMenuAndFocusFirst();
      } else {
        const firstItem = ref.current?.querySelector(':scope > .menu-items > button, :scope > .menu-items > a');
        firstItem?.focus();
      }
    }
    if (event.key === 'Escape' && showMenu) {
      event.preventDefault();
      setShowMenu(false);
    }
  };

  useEffect(() => {
    const handler = (event) => {
      if (showMenu && ref.current && !ref.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showMenu]);

  return (

    
    <nav className="mobile-nav">
      
      <button
        
        
        className="mobile-nav__menu-button"
        type="button"
        onClick={() => setShowMenu((prev) => !prev)}
        onKeyDown={handleMenuButtonKeyDown}>
        MENU
      </button>


     

      {showMenu && (
        <ul className="menus" ref={ref}>
          {menuItemsData.map((menu, index) => {
            return (
              <MobileMenuItems
                items={menu}
                key={index}
                depthLevel={depthLevel}
                showMenu={showMenu}
                setShowMenu={setShowMenu}
              />
            );
          })}
        </ul>
      )}
    </nav>
  );
};



export default MobileNav;