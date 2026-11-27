import { Link, useLocation } from "react-router-dom";
import Icon from "./Icon";
import Logo from "./Logo";
import styles from "./BottomNav.module.css";

// Link (not NavLink): NavLink ignores the hash, so Logros and Perfil would both match /profile.
const ITEMS = [
  { key: "home", label: "Inicio", icon: "home", to: "/home" },
  { key: "subjects", label: "Materias", icon: "book", to: "/subjects" },
  { key: "achievements", label: "Logros", icon: "star", to: "/profile#logros" },
  { key: "profile", label: "Perfil", icon: "user", to: "/profile" },
];

function isActive(key, pathname, hash) {
  switch (key) {
    case "home":
      return pathname === "/home";
    case "subjects":
      return pathname === "/subjects" || pathname === "/learn" || pathname.startsWith("/learn/");
    case "achievements":
      return pathname === "/profile" && hash === "#logros";
    case "profile":
      return pathname === "/profile" && hash !== "#logros";
    default:
      return false;
  }
}

/**
 * BottomNav — fixed four-destination navigation. Below 900 px it is a bottom bar; at >= 900 px the
 * same nav becomes a left rail with the logo on top (DESIGN.md section 14). One <nav> in the DOM.
 * Inactive items use --body for contrast; the active item uses --accent and aria-current="page".
 * Render outside <Screen> (its entry transform breaks position: fixed).
 */
export default function BottomNav() {
  const { pathname, hash } = useLocation();

  return (
    <nav className={styles.nav} aria-label="Navegación principal">
      <div className={styles.inner}>
        {/* Plain div, not a link: the logo must never be a tab stop. */}
        <div className={styles.brand}>
          <Logo size={40} withWord />
        </div>
        {ITEMS.map((item) => {
          const active = isActive(item.key, pathname, hash);
          return (
            <Link
              key={item.key}
              to={item.to}
              className={active ? `${styles.item} ${styles.active}` : styles.item}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} size={24} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
