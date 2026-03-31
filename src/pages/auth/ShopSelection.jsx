import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, selectedShop, setSelectedShop } from '../../contexts/AuthContext';
import { FiLock, FiLogIn, FiRefreshCw } from 'react-icons/fi';
import { apiBasePath } from '../../services/api/commonApi';
import { getShopAccessByUser } from '../../services/api/accessControlApi';
import ShopAccessList from '../../components/Shop/ShopAccessList';
import './Login.css';

function ShopSelection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        shopId: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shopList, setShopList] = useState([])

    const [userData, setUserData] = useState({});

    // Redirect if already authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            const from = '/login';
            navigate(from, { replace: true });
        }

        const user = localStorage.getItem('user');
        if (user) {
            var userData = JSON.parse(user);
            setUserData(userData);
            fetchShops(userData.id);
        }
    }, [isAuthenticated, navigate, location]);

    const fetchShops = (userId) => {
        getShopAccessByUser(userId)
            .then((response) => {
                setShopList(response.data);
            })
            .catch((err) => {
                console.error('Error fetching shop access:', err);
                setError('Failed to load shops. Please try again later.');
            });
    };

    useEffect(() => {
        const sessionIdFromState = location.state?.sessionId;
        const sessionIdFromStorage = localStorage.getItem('sessionId');
        const sessionId = sessionIdFromState || sessionIdFromStorage || '';

        if (!sessionId) {
            navigate('/login', { replace: true });
            return;
        }
    }, [location.state, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const credentials = {
                otp: formData.otp.trim(),
                sessionId: formData.sessionId
            };

            const result = await validateOtp(credentials);

            if (result.success) {
                // Redirect to intended page or default to admin
                const from = location.state?.from?.pathname || '/admin';
                navigate(from, { replace: true });
            } else {
                setError(result.message || 'Invalid OTP or session ID');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during OTP verification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">
                        <img src={`${apiBasePath}/logo/logo.png`} alt="Saleh Gareeb POS Icon" className="logo" />
                    </div>
                    <h1>Welcome Back {userData?.firstName}</h1>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                        <ShopAccessList shops={shopList} selectedShop={selectedShop} setSelectedShop={setSelectedShop} />
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading || !formData.otp.trim()}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            <>
                                <FiLogIn />
                                Verify OTP
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Need help? Contact your administrator</p>
                </div>
            </div>
        </div>
    );
}

export default ShopSelection;
