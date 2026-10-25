import { NavLink, useNavigate, useLocation } from "react-router-dom";

const links = [
  { to: "/log", label: "Log", emoji: "📝" },
  { to: "/dashboard", label: "Patterns", emoji: "📊" },
  { to: "/report", label: "Report", emoji: "📋" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // login, signup, doctor screens-la nav bar vendaam
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/doctor")
  ) {
    return null;
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const pill = (isActive) => ({
    padding: "10px 18px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 600,
    color: isActive ? "#fff" : "#2b1b4a",
    background: isActive
      ? "linear-gradient(90deg, #7c4dff, #ff5fa2)"
      : "rgba(255,255,255,0.8)",
    boxShadow: isActive ? "0 8px 18px rgba(255,95,162,0.4)" : "none",
    transition: "0.2s",
  });

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        padding: 12,
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(10px)",
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: "1.3rem",
          marginRight: 8,
          background: "linear-gradient(90deg, #7c4dff, #ff5fa2)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        🌸 HERTale
      </span>

      {links.map((l) => (
        <NavLink key={l.to} to={l.to} style={({ isActive }) => pill(isActive)}>
          {l.emoji} {l.label}
        </NavLink>
      ))}

      <button
        onClick={logout}
        style={{
          padding: "10px 18px",
          borderRadius: 999,
          border: "2px solid #ff5fa2",
          background: "#fff",
          color: "#ff5fa2",
          fontWeight: 600,
          cursor: "pointer",
          font: "inherit",
        }}
      >
        Logout
      </button>
    </nav>
  );
}