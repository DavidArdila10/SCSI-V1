import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Config from '../Config';
import logo from "./intraway-logo.png"; 

const ResetRequest = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await Config.sendRequest({
                email,
                password,
                password_confirmation: passwordConfirmation
            });
            console.log('Response:', response);  

            if (response && response.message) {
                setMessage(response.message);
                setTimeout(() => { navigate('/login'); }, 2000);
            } else {
                setMessage('Unexpected response format.');
            }
        } catch (error) {
            console.error('Error:', error);

            if (error.errors) {
                const errorMessages = Object.values(error.errors).flat().join(' ');
                setMessage(errorMessages);
            } else {
                setMessage(error.message || 'Error sending password reset request.');
            }
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{
                height: "100vh",
                background: "linear-gradient(135deg, rgba(128,0,128,0.6), rgba(255,110,75,0.7), rgba(255,0,0,0.5))",
                backdropFilter: "blur(10px)",
            }}
        >
            <div
                className="card border-0 shadow-lg p-4 rounded-4"
                style={{
                    maxWidth: "400px",
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(15px)",
                }}
            >
                <div className="card-body text-center text-white">
                    <div className="mb-3">
                        <img
                            src={logo} // Usamos el logo importado localmente
                            alt="logo"
                            style={{ width: "200px" }}
                        />
                    </div>

                    <h2
                        className="fw-bold mb-3"
                        style={{
                            textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
                            letterSpacing: "1px",
                        }}
                    >
                        Password Reset Request
                    </h2>

                    {message && (
                        <div
                            className="alert alert-danger d-flex align-items-center justify-content-center"
                            style={{
                                fontSize: "14px",
                                boxShadow: "0px 2px 5px rgba(255, 0, 0, 0.3)",
                                borderRadius: "8px",
                                padding: "8px",
                            }}
                        >
                            <span className="material-symbols-outlined me-2">error</span>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="d-flex flex-column">
                        <div className="form-floating">
                            <input
                                type="email"
                                className="form-control mt-3"
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <label htmlFor="email">Email address</label>
                        </div>

                        <div className="form-floating">
                            <input
                                type="password"
                                className="form-control mt-3"
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="password">New Password</label>
                        </div>

                        <div className="form-floating">
                            <input
                                type="password"
                                className="form-control mt-3"
                                id="passwordConfirmation"
                                placeholder="Confirm Password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                            />
                            <label htmlFor="passwordConfirmation">Confirm Password</label>
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
                                onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                                onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                            >
                                Send Request
                            </button>
                        </div>

                        <div className="text-center mt-2">
                            <Link to="/login" className="text-white text-decoration-none">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetRequest;
