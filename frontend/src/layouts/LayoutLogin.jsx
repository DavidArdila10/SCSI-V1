import React, { useEffect } from 'react'
import InicioUsers from '../pageauth/InicioUsers'
import Footer from '../components/Footer'
import { Outlet, useNavigate } from 'react-router-dom'
import AuthUser from '../pageauth/AuthUser'

const LayoutLogin = () => {
    const { getRol } = AuthUser()
    const navigate = useNavigate()

    useEffect(()=>{
        if(!getRol()){
            navigate("/");
        }
    },[]);

return (
    <>
    <InicioUsers/>
    <Outlet/>
    <Footer/>
    
    </>
)

}
export default LayoutLogin