import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { Outlet, useNavigate } from 'react-router-dom'
import AuthUser from '../pageauth/AuthUser'

const LayoutReader = () => {
        const { getRol } = AuthUser()
        const navigate = useNavigate()
    
        useEffect(()=>{
            if(getRol()!="reader"){
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
export default LayoutReader