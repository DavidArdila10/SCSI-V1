import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import AuthUser from "../pageauth/AuthUser";

const LayoutPM = () => {
    const { getRol } = AuthUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (getRol() !== "pm") {
            navigate("/");
        }
    }, []);

    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
};

export default LayoutPM;
