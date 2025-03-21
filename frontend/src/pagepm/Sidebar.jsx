import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = ({ children }) => {
  const location = useLocation();
  const [sidebarConfig, setSidebarConfig] = useState({ width: "80px" });

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="sidebar-container d-flex flex-column p-3"
        style={{
          width: sidebarConfig.width,
          transition: "width 0.3s ease-in-out",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: "100px",
          background: "transparent", // Sin fondo
          borderRight: "none",
        }}
      >
        <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
          {/* Botón exclusivo para PM */}
          <li className="nav-item">
            <NavLink
              to={`/pm/cronometros`}
              className={({ isActive }) =>
                isActive ? "btn sidebar-btn active-sidebar-btn" : "btn sidebar-btn"
              }
            >
              <span className="material-symbols-outlined icon-adjust">timer</span>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Contenido principal */}
      <div
        className="content"
        style={{
          marginLeft: sidebarConfig.width,
          transition: "margin-left 0.3s ease-in-out",
          width: "100%",
        }}
      >
        {children}
      </div>

      {/* Estilos mejorados */}
      <style>
        {`
          .sidebar-container {
            display: flex;
            align-items: center;
          }

          .nav-item {
            margin-bottom: 15px;
          }

          .sidebar-btn {
            width: 100%;
            min-width: 60px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 10px;
            transition: all 0.3s ease-in-out;
            background: linear-gradient(135deg, rgba(180, 90, 200, 0.7), rgba(255, 120, 75, 0.8), rgba(255, 60, 60, 0.6));
            color: white;
            border: none;
            box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
          }

          .sidebar-btn:hover {
            background: linear-gradient(135deg, rgba(200, 100, 220, 0.7), rgba(255, 140, 90, 0.7), rgba(255, 80, 80, 0.7));
            transform: translateY(-3px);
          }

          .active-sidebar-btn {
            background: linear-gradient(135deg, rgba(220, 120, 240, 0.9), rgba(255, 150, 100, 0.9), rgba(255, 90, 90, 0.9));
            border: 2px solid rgba(255, 255, 255, 0.5);
          }

          .icon-adjust {
            font-size: 22px;
            transition: transform 0.3s ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default Sidebar;
