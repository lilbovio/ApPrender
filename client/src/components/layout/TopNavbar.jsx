import { useNavigate } from "react-router-dom";
import styles from "./TopNavbar.module.css";

/**
 * TopNavbar Component
 * Top navigation bar with app title, level progress, stats, and user avatar
 */
const TopNavbar = ({ user = null, stats = { level: 1, xp: 0, coins: 0, trophies: 0 } }) => {
  const navigate = useNavigate();

  // Calculate level progress (0-100%)
  const xpInLevel = stats.xp % 200;
  const levelProgress = (xpInLevel / 200) * 100;

  return (
    <>
      {/* App Title Bar */}
      <div className={styles.titleBar}>
        <span className={styles.appTitle}>Chispapp</span>
      </div>

      {/* Main Navbar */}
      <header className={styles.topNavbar} role="banner">
        <div className={styles.navbarContent}>
          {/* Left Section - Logo */}
          <div className={styles.leftSection}>
            <span className={styles.navbarLogo}>Chispapp</span>
          </div>

          {/* Right Section - Stats and Avatar */}
          <div className={styles.rightSection}>
            {/* Level Progress */}
            <div className={styles.levelProgress} aria-label={`Nivel ${stats.level}, ${Math.round(levelProgress)}% de progreso`}>
              <span className={styles.levelLabel}>NIVEL {stats.level}</span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${levelProgress}%` }}
                  role="progressbar"
                  aria-valuenow={levelProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>

            {/* Coins Counter */}
            <button 
              className={styles.statBadge}
              style={{ background: '#FFD700' }}
              onClick={() => navigate('/profile')}
              aria-label={`${stats.coins} monedas`}
            >
              <span className={styles.statIcon}>💰</span>
              <span className={styles.statValue}>{stats.coins}</span>
              <span className={styles.notificationDot} aria-label="Nueva notificación">1</span>
            </button>

            {/* Trophies Counter */}
            <button 
              className={styles.statBadge}
              style={{ background: '#FF8C42' }}
              onClick={() => navigate('/profile')}
              aria-label={`${stats.trophies} trofeos`}
            >
              <span className={styles.statIcon}>🏆</span>
              <span className={styles.statValue}>{stats.trophies}</span>
            </button>

            {/* User Avatar */}
            <button 
              className={styles.userAvatar}
              onClick={() => navigate('/profile')}
              aria-label="Perfil de usuario"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name || "Usuario"} />
              ) : (
                <span className={styles.avatarPlaceholder}>👤</span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopNavbar;

// Made with Bob
