import Dropdown from "../Dropdown";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const MenuItems = ({ items, depthLevel }) => {
  const [dropdown, setDropdown] = useState(false);
  const ref = useRef();
  const buttonRef = useRef(null);
  const linkRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (dropdown && ref.current && !ref.current.contains(event.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [dropdown]);

  const onMouseEnter = () => setDropdown(true);
  const onMouseLeave = () => setDropdown(false);
  const toggleDropdown = () => setDropdown((prev) => !prev);
  const closeDropdown = () => dropdown && setDropdown(false);

  const getCurrentFocusable = () => buttonRef.current || linkRef.current;

  const focusSiblingItem = (direction) => {
    const parentMenu = ref.current?.parentElement;
    if (!parentMenu) return;

    const siblings = Array.from(parentMenu.querySelectorAll(':scope > .menu-items'));
    const currentIndex = siblings.indexOf(ref.current);
    if (currentIndex < 0 || siblings.length === 0) return;

    const nextIndex = (currentIndex + direction + siblings.length) % siblings.length;
    const nextFocusable = siblings[nextIndex]?.querySelector(':scope > button, :scope > a');
    nextFocusable?.focus();
  };

  const focusFirstSubmenuItem = () => {
    window.setTimeout(() => {
      const firstChild = ref.current?.querySelector('.dropdown.show > .menu-items > button, .dropdown.show > .menu-items > a');
      firstChild?.focus();
    }, 0);
  };

  const focusParentTrigger = () => {
    const parentItem = ref.current?.parentElement?.closest('.menu-items');
    const parentFocusable = parentItem?.querySelector(':scope > button, :scope > a');
    parentFocusable?.focus();
  };

  const focusLowerBarItem = () => {
    const lowerBarTarget = document.querySelector(
      '.selector-container .selector-box-left-end, .selector-container .selector-box, .selector-container .selector-box-right-end, .selector-container button, .selector-container a'
    );

    if (!lowerBarTarget) return false;

    lowerBarTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    lowerBarTarget.focus();
    return true;
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        if (depthLevel === 0 && focusLowerBarItem()) {
          event.preventDefault();
          break;
        }
        event.preventDefault();
        focusSiblingItem(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusSiblingItem(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (items.submenu?.length) {
          setDropdown(true);
          focusFirstSubmenuItem();
        } else {
          focusSiblingItem(1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (depthLevel > 0) {
          setDropdown(false);
          focusParentTrigger();
        } else {
          focusSiblingItem(-1);
        }
        break;
      case 'Enter':
      case ' ':
        if (items.submenu?.length) {
          event.preventDefault();
          setDropdown((prev) => !prev);
        }
        break;
      case 'Escape':
        if (dropdown) {
          event.preventDefault();
          setDropdown(false);
          getCurrentFocusable()?.focus();
        }
        break;
      default:
        break;
    }
  };

  // Safely grab the user
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    user = raw && raw !== "undefined" ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Invalid user in localStorage:", e);
  }

  const isAdmin = user?.role === "teacher" || user?.privileges === "teacher_override";
  const shouldShowItem = items.url !== "/edit" || isAdmin;

  return shouldShowItem ? (
    <li
      className="menu-items"
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={closeDropdown}
    >
      {items.url && items.submenu ? (
        <>
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={dropdown ? "true" : "false"}
            onClick={toggleDropdown}
            onKeyDown={handleKeyDown}
          >
            <Link to={items.url} onKeyDown={handleKeyDown}>{items.title}</Link>
            {depthLevel > 0 ? <span>&raquo;</span> : <span className="arrow" />}
          </button>
          <Dropdown
            depthLevel={depthLevel}
            submenus={items.submenu}
            dropdown={dropdown}
          />
        </>
      ) : !items.url && items.submenu ? (
        <>
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={dropdown ? "true" : "false"}
            onClick={toggleDropdown}
            onKeyDown={handleKeyDown}
          >
            {items.title}
            {depthLevel > 0 ? <span>&raquo;</span> : <span className="arrow" />}
          </button>
          <Dropdown
            depthLevel={depthLevel}
            submenus={items.submenu}
            dropdown={dropdown}
          />
        </>
      ) : (
        <Link ref={linkRef} to={items.url} onKeyDown={handleKeyDown}>{items.title}</Link>
      )}
    </li>
  ) : null;
};

export default MenuItems;
