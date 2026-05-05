import React from 'react';
import MenuItems from "./MenuItems";

const Navbar = () => {
  const depthLevel = 0;

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

    // Add edit tab if user is a teacher
    //if (user && user.email == "hnallman@stu.naperville203.org") {
      baseItems.push({
        title: "EDIT",
        url: "/edit",
      });
    //}

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