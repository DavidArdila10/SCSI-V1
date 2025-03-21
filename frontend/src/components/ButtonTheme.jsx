import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ButtonTheme = () => {
    const [theme, setTheme] = useState(() => {
        return (
            localStorage.getItem("theme") ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light")
        );
    });

    useEffect(() => {
        const handleThemeChange = () => {
            const storedTheme = localStorage.getItem("theme");
            const preferredTheme =
                storedTheme ||
                (window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light");

            applyTheme(preferredTheme);
            setTheme(preferredTheme);
        };

        handleThemeChange();
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", handleThemeChange);

        return () => {
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", handleThemeChange);
        };
    }, []);

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem("theme", theme);

        const activeThemeIcon = document.querySelector(
            ".theme-icon-active use"
        );
        const btnToActive = document.querySelector(
            `[data-bs-theme-value="${theme}"]`
        );

        if (activeThemeIcon && btnToActive) {
            const svgOfActiveBtn = btnToActive
                .querySelector("svg use")
                .getAttribute("href");
            activeThemeIcon.setAttribute("href", svgOfActiveBtn);

            document
                .querySelectorAll("[data-bs-theme-value]")
                .forEach((element) => {
                    element.classList.remove("active");
                });

            btnToActive.classList.add("active");
        }
    }, [theme]);

    const applyTheme = (themeValue) => {
        const rootElement = document.documentElement;

        // Restablece los estilos al cambiar de tema
        rootElement.style.filter = "";
        rootElement.style.backgroundColor = "";

        // Aplica el filtro amarillo si el tema es blue-light-filter
        if (themeValue === "blue-light-filter") {
            rootElement.style.filter = "brightness(0.9)";

            // Agregar una capa amarilla translúcida
            let overlay = document.getElementById("yellow-overlay");
            if (!overlay) {
                overlay = document.createElement("div");
                overlay.id = "yellow-overlay";
                overlay.style.position = "fixed";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.width = "100%";
                overlay.style.height = "100%";
                overlay.style.backgroundColor = "rgba(173, 216, 230, 0.1)";
                overlay.style.pointerEvents = "none";
                overlay.style.zIndex = "9999";
                document.body.appendChild(overlay);
            }
        } else {
            // Elimina la capa amarilla si existe
            const overlay = document.getElementById("yellow-overlay");
            if (overlay) {
                overlay.remove();
            }
        }

        rootElement.setAttribute("data-bs-theme", themeValue);
    };

    const handleThemeClick = (themeValue) => {
        setTheme(themeValue);
    };

    const svg = () => {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="d-none">
                <symbol id="check2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                </symbol>
                <symbol id="circle-half" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z" />
                </symbol>
                <symbol id="moon-stars-fill" viewBox="0 0 16 16">
                    <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
                    <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156.156 0 0 0-.732-.732z" />
                </symbol>
                <symbol id="sun-fill" viewBox="0 0 16 16">
                    <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
                </symbol>
                <symbol id="eye-icon" viewBox="0 0 16 16">
                    <path d="M8 3C4.5 3 1.6 5.4 0 8c1.6 2.6 4.5 5 8 5s6.4-2.4 8-5c-1.6-2.6-4.5-5-8-5zm0 1c3 0 5.5 1.8 7 4-1.5 2.2-4 4-7 4s-5.5-1.8-7-4c1.5-2.2 4-4 7-4zm0 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0 1c.8 0 1.5.7 1.5 1.5S8.8 9.5 8 9.5 6.5 8.8 6.5 8 7.2 6.5 8 6.5z" />
                </symbol>
            </svg>
        );
    };

    return (
        <div className="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle">
            {svg()}
            <button
                className="btn btn-bd-primary py-2 dropdown-toggle d-flex align-items-center justify-content-end"
                id="bd-theme"
                type="button"
                aria-expanded="false"
                data-bs-toggle="dropdown"
                aria-label="Toggle theme (auto)"
                data-bs-flip="false"
            >
                <svg
                    className="bi my-1 theme-icon-active"
                    width="1em"
                    height="1em"
                >
                    <use href="#circle-half"></use>
                </svg>
                <span className="visually-hidden" id="bd-theme-text">
                    Toggle theme
                </span>
            </button>

            <ul
                className="dropdown-menu dropdown-menu-end shadow"
                aria-labelledby="bd-theme-text"
                style={{
                    position: "absolute",
                    inset: "auto 0px 0px auto",
                    margin: "0px",
                    transform: "translate(0px, -44px)",
                }}
            >
                <li>
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center"
                        data-bs-theme-value="light"
                        aria-pressed="false"
                        onClick={() => handleThemeClick("light")}
                    >
                        <svg
                            className="bi me-2 opacity-50"
                            width="1em"
                            height="1em"
                        >
                            <use href="#sun-fill"></use>
                        </svg>
                        Light
                        <svg
                            className="bi ms-auto d-none"
                            width="1em"
                            height="1em"
                        >
                            <use href="#check2"></use>
                        </svg>
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center"
                        data-bs-theme-value="dark"
                        aria-pressed="false"
                        onClick={() => handleThemeClick("dark")}
                    >
                        <svg
                            className="bi me-2 opacity-50"
                            width="1em"
                            height="1em"
                        >
                            <use href="#moon-stars-fill"></use>
                        </svg>
                        Dark
                        <svg
                            className="bi ms-auto d-none"
                            width="1em"
                            height="1em"
                        >
                            <use href="#check2"></use>
                        </svg>
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center"
                        data-bs-theme-value="auto"
                        aria-pressed="true"
                        onClick={() => handleThemeClick("auto")}
                    >
                        <svg
                            className="bi me-2 opacity-50"
                            width="1em"
                            height="1em"
                        >
                            <use href="#circle-half"></use>
                        </svg>
                        Auto
                        <svg
                            className="bi ms-auto d-none"
                            width="1em"
                            height="1em"
                        >
                            <use href="#check2"></use>
                        </svg>
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center"
                        data-bs-theme-value="blue-light-filter"
                        aria-pressed="false"
                        onClick={() => handleThemeClick("blue-light-filter")}
                    >
                        <svg
                            className="bi me-2 opacity-50"
                            width="1em"
                            height="1em"
                        >
                            <use href="#eye-icon"></use>
                        </svg>
                        Blue Light Filter
                        <svg
                            className="bi ms-auto d-none"
                            width="1em"
                            height="1em"
                        >
                            <use href="#check2"></use>
                        </svg>
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default ButtonTheme;
