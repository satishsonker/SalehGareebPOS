import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiLogIn } from 'react-icons/fi';
import { apiBasePath } from '../../services/api/commonApi';
import { getShopAccessByUser } from '../../services/api/accessControlApi';
import ShopAccessList from '../../components/Shop/ShopAccessList';
import './ShopSelection.css';
import { jwtDecode } from "jwt-decode";

function ShopSelection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, selectedShop, setSelectedShop } = useAuth();
    const [error, setError] = useState('');
    const [shopList, setShopList] = useState([])

    const [userData, setUserData] = useState({});

    // Redirect if already authenticated
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (!token || !user) {
            const from = '/login';
            navigate(from, { replace: true });
        }
        if (user) {
            var userDataTemp = jwtDecode(token);
            var userData = {
                userId: userDataTemp["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
                email: userDataTemp["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
                firstName: userDataTemp["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"],
                lastName: userDataTemp["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"],
                phone: userDataTemp["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"],
                role: userDataTemp["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
            };
            setUserData(userData);
            fetchShops(userData.userId);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!selectedShop) {
            setError('Please select a shop to continue.');
            return;
        }

        localStorage.setItem('selectedShop', JSON.stringify(selectedShop));
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
    };

    return (
        <div className="shopselection-container">
            <div className="shopselection-card">
                <div className="shopselection-header">
                    <div className="shopselection-icon">
                        <img src={`${apiBasePath}/logo/logo.png`} alt="Saleh Gareeb POS Icon" className="logo" />
                    </div>
                    <h1>Welcome Back {userData?.firstName}</h1>
                </div>

                <form onSubmit={handleSubmit} className="shopselection-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    <ShopAccessList shops={shopList} selectedShop={selectedShop} setSelectedShop={setSelectedShop} />
                    <button
                        type="submit"
                        className="shopselection-button"
                        disabled={!selectedShop}
                    >
                        <>
                            <FiLogIn />
                            Continue
                        </>
                    </button>
                </form>

                <div className="shopselection-footer">
                    <p>If shop is not listed, please contact your administrator</p>
                </div>
            </div>
        </div>
    );
}

export default ShopSelection;
