import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ToastContainer } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

const Layout = () => {
    const { user } = useAuth();
    const company = user?.company;

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                {company && (
                    <div className="print-header">
                        <div style={{ textAlign: 'center', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1b5e20' }}>
                                {company.name}
                            </h1>
                            <p style={{ margin: '3px 0', fontSize: '14px', color: '#333' }}>
                                {company.address?.street ? `${company.address.street}, ` : ''}
                                {company.address?.city ? `${company.address.city}, ` : ''}
                                {company.address?.state ? `${company.address.state}` : ''}
                                {company.address?.pincode ? ` - ${company.address.pincode}` : ''}
                            </p>
                            <p style={{ margin: '3px 0', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                                {user?.name && `Owner/Proprietor: ${user.name}`}
                                {company.phone && ` | Phone: ${company.phone}`}
                                {company.email && ` | Email: ${company.email}`}
                                {company.gstNumber && ` | GSTIN: ${company.gstNumber}`}
                            </p>
                            <hr style={{ border: '0', borderTop: '2px solid #1b5e20', marginTop: '10px' }} />
                        </div>
                    </div>
                )}
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </div>
    );
};

export default Layout;
