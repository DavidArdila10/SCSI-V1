import AuthUser from "../pageauth/AuthUser";
import { Link } from "react-router-dom";
import ButtonTheme from "./ButtonTheme";
import logo from "../pageauth/intrawayllogo.png";

const Navbar = () => {
    const { getRol, getLogout, getToken } = AuthUser();
    const rol = getRol();

    const logoutUser = () => {
        const token = getToken();
        getLogout(token)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const renderLinks = () => {
        if (getToken()) {
            return (
                <>
                    <li className="nav-item d-flex align-items-center">
                        <a className="nav-link text-light fw-bold">
                            {getRol().toUpperCase()}
                        </a>
                    </li>
                    <li className="nav-item">
                        <button 
                            className="btn signout-btn d-flex align-items-center px-3 py-2 rounded-pill shadow-sm"
                        >
                            <a
                                className="nav-link d-flex align-items-center text-light"
                                href="#"
                                onClick={logoutUser}
                                style={{ textDecoration: 'none' }}
                            >
                                <span className="material-symbols-outlined me-2">
                                    logout
                                </span>
                                Sign Out
                            </a>
                        </button>
                    </li>
                </>
            );
        } else {
            return (
                <>
                    <li className="nav-item">
                        <a className="nav-link text-light fw-bold" href="/login">
                            Login
                        </a>
                    </li>
                </>
            );
        }
    };

    return (
        <>
            {/* Navbar con diseño adaptable */}
            <nav 
                className="navbar navbar-expand-lg border border-dark shadow-lg d-flex flex-wrap justify-content-between align-items-center"
                style={{ 
                    background: "linear-gradient(135deg, rgba(128, 0, 128, 0.7), rgba(255, 110, 75, 0.8), rgba(255, 0, 0, 0.7))",
                    backdropFilter: "blur(8px)",
                    padding: "10px 20px",
                    borderRadius: "12px",
                }}
            >
                {/* Contenedor del Logo */}
                <div className="d-flex align-items-center">
                    <Link to={`/${rol}`} className="navbar-brand ms-3">
                        <img
                            src={logo} 
                            alt="logo"
                            className="img-fluid"
                            style={{ 
                                maxWidth: "180px", 
                                height: "auto", 
                                minWidth: "100px"
                            }}
                        />
                    </Link>
                </div>

                {/* Título centrado con mejor adaptabilidad */}
                <div className="text-center flex-grow-1 d-flex justify-content-center">
                    <h2 className="text-light fw-bold text-uppercase title-responsive">
                        S.O.W Control System Implementation (SCSI)
                    </h2>
                </div>

                {/* Links de navegación */}
                <div className="d-flex justify-content-end">
                    <ul className="navbar-nav">{renderLinks()}</ul>
                </div>
            </nav>

            {/* Botón de cambio de tema */}
            <div 
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    zIndex: 1000
                }}
            >
                <ButtonTheme />
            </div>

            {/* Estilos adicionales para adaptar el diseño */}
            <style>
                {`
                    .signout-btn {
                        background: rgba(255, 110, 75, 0.8);
                        color: white;
                        border: none;
                        transition: background 0.3s ease-in-out, transform 0.2s ease;
                    }
                    
                    .signout-btn:hover {
                        background: rgba(255, 80, 55, 1);
                        transform: scale(1.05);
                    }
                    
                    .signout-btn:active {
                        background: rgba(200, 60, 40, 1);
                        transform: scale(0.95);
                    }

                    /* Responsive: Adaptar el título y elementos */
                    @media (max-width: 992px) {
                        .title-responsive {
                            font-size: 1.2rem;
                            text-align: center;
                            padding: 10px;
                        }
                    }

                    @media (max-width: 768px) {
                        .title-responsive {
                            font-size: 1rem;
                            text-align: center;
                        }

                        .navbar-brand img {
                            max-width: 120px;
                        }
                    }

                    @media (max-width: 576px) {
                        .title-responsive {
                            font-size: 0.9rem;
                            text-align: center;
                        }

                        .navbar-brand img {
                            max-width: 100px;
                        }
                    }
                `}
            </style>
        </>
    );
};

export default Navbar;
