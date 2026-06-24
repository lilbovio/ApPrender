import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import chispappIcon from "../../assets/ChispappICON.png";

/**
 * Sidebar Component
 * Left navigation sidebar with logo, menu items, and weekly goal widget
 */
const Sidebar = ({ stats = { completed: 0, total: 5 } }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/home", label: "Inicio", icon: "🏠" },
    { path: "/subjects", label: "Materias", icon: "📚" },
    { path: "/profile", label: "Mi Héroe", icon: "👤" },
    { path: "/profile", label: "Insignias", icon: "🏅" }
  ];

  const isActive = (path) => location.pathname === path;

  const progressPercentage = stats.total > 0 
    ? Math.min((stats.completed / stats.total) * 100, 100) 
    : 0;

  return (
    <aside className={styles.sidebar} role="navigation" aria-label="Main navigation">
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <img 
          src={chispappIcon} 
          alt="Chispapp Logo" 
          className={styles.logoIcon}
        />
        <span className={styles.logoText}>Chispapp</span>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.navMenu}>
        {menuItems.map((item) => (
          <button
            key={item.path + item.label}
            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ""}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={isActive(item.path) ? "page" : undefined}
          >
            <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Weekly Goal Widget */}
      <div className={styles.weeklyGoalWidget}>
        <div className={styles.goalIcon} aria-hidden="true">🎯</div>
        <h3 className={styles.goalTitle}>Meta de la semana</h3>
        <p className={styles.goalDescription}>
          ¡Completa 2 misiones más para abrir el cofre mágico!
        </p>
        <div className={styles.goalProgress}>
          <span className={styles.goalLabel}>PROGRESO</span>
          <span className={styles.goalValue}>{stats.completed}/{stats.total}</span>
        </div>
        <div className={styles.goalBar} role="progressbar" aria-valuenow={progressPercentage} aria-valuemin="0" aria-valuemax="100">
          <div 
            className={styles.goalBarFill} 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

// Made with Bob
