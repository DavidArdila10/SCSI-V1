import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Config from "../Config"; // Importa Config para reutilizar la configuración de Axios

const AuthUser = () => {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["user", "token", "role"]);

  const getToken = () => cookies.token || null;
  const getUser = () => cookies.user || null;
  const getRol = () => cookies.role || null;

  const saveToken = (user, token, role) => {
    setCookie("user", user, { path: "/", maxAge: 60 * 60 * 24 });
    setCookie("token", token, { path: "/", maxAge: 60 * 60 * 24 });
    setCookie("role", role, { path: "/", maxAge: 60 * 60 * 24 });

    if (role === "admin") navigate("/admin");
    if (role === "writer") navigate("/writer");
    if (role === "reader") navigate("/reader");
    if (role === "pm") navigate("/pm");
  };

  const getLogout = async () => {
    try {
      await Config.getLogout(); // Reutiliza el método de Config.jsx para realizar la solicitud
      removeCookie("user", { path: "/" });
      removeCookie("token", { path: "/" });
      removeCookie("role", { path: "/" });
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return {
    setToken: saveToken,
    token: getToken(),
    user: getUser(),
    role: getRol(),
    getToken,
    getUser,
    getRol,
    getLogout,
  };
};

export default AuthUser;
