import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Outlet, useNavigate } from 'react-router-dom'
import AuthUser from '../pageauth/AuthUser'

const LayoutWriter = () => {
        const { getRol } = AuthUser()
        const navigate = useNavigate()
    
        useEffect(()=>{
            if(getRol()!="writer"){
                navigate("/")
            }
        },[])
    return (
        <>
        <Navbar/>
        <Outlet/>
        
        </>
    )
}
export default LayoutWriter