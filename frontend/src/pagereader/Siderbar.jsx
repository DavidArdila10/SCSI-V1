import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const [sidebarConfig, setSidebarConfig] = useState({ width: "200px", showText: true });
  const [clickCount, setClickCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (["/reader/sow"].includes(location.pathname)) {
      setSidebarConfig({ width: "80px", showText: false }); // Solo iconos
    } else {
      setSidebarConfig({ width: "200px", showText: true }); // Sidebar normal con texto
    }
  }, [location.pathname]);

  // Manejar la lógica del mensaje emergente cuando hay más de 3 clics
  useEffect(() => {
    if (clickCount >= 3) {
      setShowMessage(true);

      // Ocultar el mensaje después de 6 segundos
      const timer = setTimeout(() => {
        setShowMessage(false);
        setClickCount(0); // Reiniciar el contador
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [clickCount]);

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
          background: "transparent",
          borderRight: "none",
        }}
      >
        <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
          <li className="nav-item">
            <NavLink
              to={`/reader/sow`}
              className={({ isActive }) =>
                isActive ? "btn sidebar-btn active-sidebar-btn" : "btn sidebar-btn"
              }
              onClick={() => setClickCount((prev) => prev + 1)} // Contador de clics
            >
              <span className="material-symbols-outlined icon-adjust">table_view</span>
              {sidebarConfig.showText && <span className="btn-text">S.O.W</span>}
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Mensaje emergente como burbuja flotante */}
      {showMessage && (
        <div className="floating-message">
          📌 Estás en la sección de S.O.W
        </div>
      )}

      {/* Contenido principal */}
      <div
        className="content"
        style={{
          marginLeft: sidebarConfig.width,
          transition: "margin-left 0.3s ease-in-out",
          width: "100%",
        }}
      >
        {/* Aquí se renderiza el contenido */}
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
            padding: 10px 12px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 10px;
            transition: all 0.3s ease-in-out;
            background: linear-gradient(135deg, rgba(180, 90, 200, 0.7), rgba(255, 120, 75, 0.8), rgba(255, 60, 60, 0.6));
            color: white;
            border: none;
            box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            gap: 8px;
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
            transition: margin 0.3s ease-in-out;
          }

          .btn-text {
            opacity: 1;
            transition: opacity 0.3s ease-in-out;
          }

          /* Ocultar texto en S.O.W cuando está en /reader/sow */
          ${!sidebarConfig.showText ? ".btn-text { opacity: 0; width: 0; }" : ""}

          /* Estilo para la burbuja flotante */
          .floating-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            opacity: 1;
            animation: fadeOut 6s forwards;
            z-index: 1000;
          }

          @keyframes fadeOut {
            0% { opacity: 1; transform: translateX(-50%) translateY(0); }
            90% { opacity: 1; }
            100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          }
        `}
      </style>
    </div>
  );
};

export default Sidebar;
