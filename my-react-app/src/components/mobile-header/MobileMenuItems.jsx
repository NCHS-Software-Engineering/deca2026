import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import MobileDropdown from "./MobileDropdown";

const MobileMenuItems = ({ items, depthLevel, showMenu, setShowMenu }) => {
  const [dropdown, setDropdown] = useState(false);
  const itemRef = useRef(null);
  const buttonRef = useRef(null);
  const linkRef = useRef(null);

  const closeDropdown = () => {
    dropdown && setDropdown(false);
    showMenu && setShowMenu(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdown((prev) => !prev);
  };

  const focusSiblingItem = (direction) => {
    const parentMenu = itemRef.current?.parentElement;
    if (!parentMenu) return;

    const siblings = Array.from(parentMenu.querySelectorAll(':scope > .menu-items'));
    const currentIndex = siblings.indexOf(itemRef.current);
    if (currentIndex < 0 || siblings.length === 0) return;

    const nextIndex = (currentIndex + direction + siblings.length) % siblings.length;
    const nextFocusable = siblings[nextIndex]?.querySelector(':scope > button, :scope > a');
    nextFocusable?.focus();
  };

  const focusFirstSubmenuItem = () => {
    window.setTimeout(() => {
      const firstChild = itemRef.current?.querySelector('.dropdown.show > .menu-items > button, .dropdown.show > .menu-items > a');
      firstChild?.focus();
    }, 0);
  };

  const focusParentTrigger = () => {
    const parentItem = itemRef.current?.parentElement?.closest('.menu-items');
    const parentFocusable = parentItem?.querySelector(':scope > button, :scope > a');
    parentFocusable?.focus();
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
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
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (depthLevel > 0) {
          setDropdown(false);
          focusParentTrigger();
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
        event.preventDefault();
        if (dropdown) {
          setDropdown(false);
          (buttonRef.current || linkRef.current)?.focus();
        } else if (showMenu) {
          setShowMenu(false);
        }
        break;
      default:
        break;
    }
  };

  return (
    <li className="menu-items" ref={itemRef} onClick={closeDropdown}>
      {items.url && items.submenu ? (
        <>
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={dropdown ? "true" : "false"}
            onKeyDown={handleKeyDown}>
            <Link to={items.url} onClick={closeDropdown}>
              {items.title}
            </Link>
            <div onClick={(e) => toggleDropdown(e)}>
              {dropdown ? (
                <span className="arrow-close" />
              ) : (
                <span className="arrow" />
              )}
            </div>
          </button>
          <MobileDropdown
            depthLevel={depthLevel}
            submenus={items.submenu}
            dropdown={dropdown}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
          />
        </>
      ) : !items.url && items.submenu ? (
        <>
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={dropdown ? "true" : "false"}
            onKeyDown={handleKeyDown}>
            {items.title}{" "}
            <div onClick={(e) => toggleDropdown(e)}>
              {dropdown ? (
                <span className="arrow-close" />
              ) : (
                <span className="arrow" />
              )}
            </div>
          </button>
          <MobileDropdown
            depthLevel={depthLevel}
            submenus={items.submenu}
            dropdown={dropdown}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
          />
        </>
      ) : (
        <Link ref={linkRef} to={items.url} onKeyDown={handleKeyDown}>{items.title}</Link>
      )}
    </li>
  );
};

export default MobileMenuItems;