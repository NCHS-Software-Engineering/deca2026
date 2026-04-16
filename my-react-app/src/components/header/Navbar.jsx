import React, { useState, useEffect } from 'react';
import MenuItems from "./MenuItems";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const depthLevel = 0;

  useEffect(() => {
    // Retrieve user from localStorage when component mounts
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Dynamic menu items with conditional edit tab
  const getMenuItemsData = () => {
    const baseItems = [
      {
        title: "HOME",
        url: "/",
      },
      {
        title: "PRACTICE",
        url: "/Practice",
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

    // Add edit tab if user is a teacher
    if (user && user.email == "hnallman@stu.naperville203.org") {
      baseItems.push({
        title: "EDIT",
        url: "/edit",
      });
      baseItems.push({
        title: "STATS",
        url: "/Stats",
      })
    }

    return baseItems;
  };

  return (
    <nav className="desktop-nav">
      <ul className="menus">
        {getMenuItemsData().map((menu, index) => {
          return <MenuItems items={menu} key={index} depthLevel={depthLevel} />;
        })}
      </ul>
    </nav>
  );
};

export default Navbar;