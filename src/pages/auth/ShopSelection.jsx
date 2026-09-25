import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiCheck, FiLogIn, FiMapPin } from 'react-icons/fi';
import { apiBasePath } from '../../services/api/commonApi';
import { getShopAccessByUser } from '../../services/api/accessControlApi';
import ShopAccessList from '../../components/Shop/ShopAccessList';
import './ShopSelection.css';
import { jwtDecode } from "jwt-decode";
const shopColors = [
    "#2563eb",
    "#ea580c",
    "#7c3aed",
    "#0f766e",
    "#0891b2",
    "#c2410c"
];
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

        console.log('ShopSelection handleSubmit called, selectedShop:', selectedShop);

        if (selectedShop == null) {
            setError('Please select a shop to continue.');
            return;
        }
            localStorage.setItem('selectedShop', JSON.stringify(selectedShop));
            const from = location.state?.from || '/'; 
            console.log('ShopSelection redirecting (TEMP full reload) to:', from);
            // TEMP: force full page redirect for debugging navigation issues
            window.location.replace(from);
    };

    return (
        <div className="shopselection-container">
            <div className="shopselection-page">
                <div className="shopselection-header">
                    <div className="shopselection-brand">
                        <div className="shopselection-brand-icon">
                              <img
                                            src={`${apiBasePath}${shopList[0]?.userImageThumbPath || "/assets/images/default-shop-image.jpg"}`}
                                            alt={shopList[0]?.shopName || "Shop"}
                                            className="shopselection-logo"
                                        />
                        </div>
                        <div>
                            <h1>Welcome Back, {userData?.firstName}</h1>
                            <p>Select a shop to continue to your dashboard</p>
                        </div>
                    </div>
                    <div className="shopselection-user">
                        <span>Logged in as</span>
                        <strong>{userData?.firstName}</strong>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="shopselection-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="shopselection-grid">
                        {shopList?.map((shop, index) => {
                            const isSelected = selectedShop == shop.id;
                            const color = shopColors[index % shopColors.length];

                            return (
                                <button
                                    key={shop.id}
                                    type="button"
                                    className={`shopselection-shop-card ${isSelected ? "selected" : ""}`}
                                    style={{ "--shop-color": color }}
                                    onClick={() => setSelectedShop(shop.id)}
                                >
                                    <div className="shopselection-card-circles" />

                                    {/* <div className="shopselection-shop-icon">
                                        <img
                                            src={`${apiBasePath}${shop.userImageThumbPath || "/assets/images/default-shop-image.jpg"}`}
                                            alt={shop.shopName || "Shop"}
                                            className="shopselection-logo"
                                        />
                                    </div> */}

                                    <div className="shopselection-shop-content">
                                        <h2>{shop.shopName || shop.name || "Shop"}</h2>
                                        <p className="shopselection-shop-location">
                                            <FiMapPin />
                                            {shop.address || shop.location || "Shop location"}
                                        </p>
                                    </div>

                                    <div className="shopselection-select-indicator">
                                        {isSelected ? <FiCheck /> : <span>Select shop</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="shopselection-bottom">
                        <div className="shopselection-footer">
                            <p>If shop is not listed, please contact your administrator.</p>
                        </div>

                        <button
                            type="submit"
                            className="shopselection-button"
                            disabled={selectedShop == null}
                        >
                            <FiLogIn />
                            Continue to Dashboard
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ShopSelection;
