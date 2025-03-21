import { useEffect, useState } from 'react';
import Config from '../Config';
import Siderbar from './Sidebar';
import { Link } from 'react-router-dom';

const ResetRequests = () => {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await Config.resetRequests();
                console.log('Data fetched from API:', data); 
                         if (data && Array.isArray(data)) {
                    setRequests(data);
                } else {
                    setRequests([]);
                }
            } catch (error) {
                console.error('Error fetching reset requests', error);
                setRequests([]);
            }
        };
        fetchRequests();
    }, []);

    const approveRequest = async (id, email, password) => {
        try {
            const response = await Config.resetRequestsApprove(id, email, password);
            setMessage(response.data);
            // Actualiza el estado de las solicitudes
            setRequests(requests.filter(request => request.id !== id));
        } catch (error) {
            console.error('Error approving reset request', error);
            setMessage('Error approving reset request.');
        }
    };

    const cancelRequest = async (email) => {
        try {
            const response = await Config.resetRequestsCancel({ email });
            setMessage(response.data?.message || 'Request cancelled successfully.');
            // Actualiza el estado de las solicitudes
            setRequests(requests.filter(request => request.email !== email));
        } catch (error) {
            console.error('Error cancelling reset request', error);
            setMessage(error.response?.data?.message || 'Error cancelling reset request.');
        }
    };

    return (
        <div style={{ overflow: 'hidden' }}>
            <div className="row">
                <div className="col-sm-1">
                <Siderbar />
                </div>
                <div className='col-sm-11 mt-4 mb-3'>
                    <div className="me-4">
                    <div className="card">
                        <div className="card-body">
                        <div className="d-flex">
                                <Link
                                    to={-1}
                                    className="btn btn-secondary me-3 col-sm-1"
                                >
                                    <span className="material-symbols-outlined me-2">
                                        arrow_back
                                    </span>
                                    Back
                                </Link>
                                <h2 className='d-flex justify-content-center col-sm-11'>Password Reset Requests</h2>
           
                         </div>
            {message && <p>{message}</p>}
            <div className="table-responsive mt-4">
            <table className="table text-center align-middle">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    
                {requests.length > 0 ? (
                    requests.map((request) => (
                        <tr key={request.id}>
                            <td>{request.email}</td>
                            <td>
                                <button
                                    className="btn btn-success"
                                    onClick={() => approveRequest(request.id, request.email, request.password)}
                                >
                                    Approve
                                </button>
                                <button
                                    className="btn btn-danger ms-2"
                                    onClick={() => cancelRequest(request.email)}
                                >
                                    Cancel
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="2">No requests found.</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
            </div>
            </div>
            </div>
            </div>
            </div>
        </div>
    );
};

export default ResetRequests;

