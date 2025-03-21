import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthUser from "./AuthUser";
import Config from "../Config";
import axios from "axios";
import logo from "./intraway-logo.png";

const Login = () => {
  const { setToken } = AuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.get("/sanctum/csrf-cookie");
      const { data } = await Config.getLogin({ email, password });

      if (data.success) {
        const roleName = data.user.roles?.[0]?.name || "default";
        setToken(data.user, data.token, roleName);

        // ----------- VERSIÓN ORIGINAL (COMENTADA) -----------
        // navigate(roleName === "admin" ? "/admin" : "/");

        // ----------- NUEVA LÓGICA DE REDIRECCIÓN -----------
        if (roleName === "admin") {
          navigate("/admin");
        } else if (roleName === "writer") {
          navigate("/writer");
        } else if (roleName === "reader") {
          navigate("/reader");
        } else if (roleName === "pm") {
          navigate("/pm/cronometros"); // Redirigir a la vista específica de PM
        } else {
          navigate("/");
        }
        
      } else {
        setMessage(data.message || "Incorrect username or password");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setMessage("Incorrect username or password.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center position-relative overflow-hidden"
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, rgba(128,0,128,0.6), rgba(255,110,75,0.7), rgba(255,0,0,0.5))",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Tarjeta de login  */}
      <div
        className="card border-0 shadow-lg p-4 rounded-4"
        style={{
          maxWidth: "400px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(15px)",
          zIndex: 3, // Para que la tarjeta quede por encima de las piezas
        }}
      >
        <div className="card-body text-center text-white">
          <div className="mb-3">
            <img
              src={logo} // Usamos el logo importado localmente
              alt="logo"
              style={{ width: "150px" }}
            />
          </div>

          <h1
            className="fw-bold mb-3"
            style={{ textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)", letterSpacing: "1px" }}
          >
            Login
          </h1>

          {message && (
            <div className="alert alert-danger d-flex align-items-center justify-content-center">
              <span className="material-symbols-outlined me-2">error</span>
              {message}
            </div>
          )}

          <form onSubmit={submitLogin}>
            <div className="form-floating">
              <input
                id="floatingInput1"
                type="email"
                className="form-control mt-3"
                placeholder="Email:"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="floatingInput1">Email address</label>
            </div>

            <div className="form-floating position-relative">
              <input
                id="floatingInput"
                type={passwordVisible ? "text" : "password"}
                className="form-control mt-3"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="floatingInput">Password</label>

              {/* Icono del ojo para mostrar/ocultar contraseña */}
              <span
                id="togglePassword"
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s ease-in-out",
                }}
                onClick={togglePasswordVisibility}
              >
                <i
                  className={passwordVisible ? "fas fa-eye-slash" : "fas fa-eye"}
                  style={{ fontSize: "18px", color: "#b8a5a5" }}
                ></i>
              </span>
            </div>

            <div className="text-center mt-2">
              <Link to="/reset-password" className="text-white text-decoration-none">
                Forgot Password?
              </Link>
            </div>

            <div className="w-100 d-flex justify-content-center">
              <button
                type="submit"
                className="btn w-75 py-2 fw-bold mt-3"
                style={{
                  background: "linear-gradient(45deg, #ff6e4b, #ff4b4b)",
                  border: "none",
                  borderRadius: "30px",
                  color: "white",
                  fontSize: "18px",
                  transition: "0.3s",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
                }}
                onMouseOver={(e) => (e.target.style.transform = "scale(1.09)")}
                onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
