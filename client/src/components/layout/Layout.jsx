import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import styles from "./Layout.module.css";

/**
 * Layout Component
 * Main layout wrapper that combines Sidebar, TopNavbar, and content area
 */
const Layout = ({ children, user = null, stats = null }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 768 && sidebarOpen) {
        const sidebar = document.querySelector('[role="navigation"]');
        if (sidebar && !sidebar.contains(e.target) && !e.target.closest('[data-hamburger]')) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Prepare stats for components - stats will be passed from Home component
  const navbarStats = stats ? {
    level: stats.level || 1,
    xp: stats.xp || 0,
    coins: stats.badges || 0,
    trophies: stats.badges || 0
  } : {
    level: 1,
    xp: 0,
    coins: 0,
    trophies: 0
  };

  const sidebarStats = stats ? {
    completed: (stats.mathCompleted || 0) + (stats.englishCompleted || 0),
    total: 5
  } : {
    completed: 0,
    total: 5
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Hamburger Menu Button (Mobile Only) */}
      <button
        className={styles.hamburger}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={sidebarOpen}
        data-hamburger
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {/* Sidebar */}
      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.open : ''}`}>
        <Sidebar stats={sidebarStats} />
      </div>

      {/* Top Navbar */}
      <TopNavbar user={user} stats={navbarStats} />

      {/* Main Content Area */}
      <main className={styles.mainContent} role="main">
        {children}
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout;

// Made with Bob
