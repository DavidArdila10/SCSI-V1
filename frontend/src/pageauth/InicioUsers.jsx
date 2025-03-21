import React from "react";
import { Link } from "react-router-dom";
import logo from "./intraway-logo.png";

const InicioUsers = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center position-relative overflow-hidden"
      style={{
        height: "100vh",
        background:
          "linear-gradient(135deg, rgba(128,0,128,0.6), rgba(255,110,75,0.7), rgba(255,0,0,0.5))",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Tarjeta principal */}
      <div
        className="card border-0 shadow-lg p-4 rounded-4 position-relative"
        style={{
          maxWidth: "400px",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(15px)",
          zIndex: 3, // Para quedar encima de las piezas
        }}
      >
        <div className="card-body text-center text-white">
          <div className="mb-4">
            <img
              src={logo} // Usamos el logo importado
              alt="Intraway logo"
              style={{ width: "200px" }}
            />
          </div>

          <h1
            className="fw-bold mb-4"
            style={{
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
              letterSpacing: "1px",
            }}
          >
            Welcome to <span style={{ color: "#ff4b4b" }}>SCSI</span>
          </h1>

          <Link
            to="/login"
            className="btn w-75 py-2 fw-bold"
            style={{
              background: "linear-gradient(45deg, #ff6e4b, #ff4b4b)",
              border: "none",
              borderRadius: "30px",
              color: "white",
              fontSize: "18px",
              transition: "0.3s",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
            }}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.08)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
          >
            Log in
          </Link>
        </div>
        {/* Texto en la esquina inferior derecha */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "15px",
            fontSize: "9px",
            color: "rgba(255, 255, 255, 0.7)",
            fontWeight: "bold",
          }}
        >
          By DELIVERY TEAM CO.
        </div>
      </div>
    </div>
  );
};

export default InicioUsers;
