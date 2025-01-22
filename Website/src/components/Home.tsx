import React, { useEffect, useState } from 'react';
import { User } from '../types/types';
import { getUserDetails } from '../utils/api';
import './css/Home.css';

const Home: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userDetails = await getUserDetails();
                setUser(userDetails);
            } catch (err) {
                console.error('Failed to fetch user details');
            }
        };
        fetchUserDetails();
    }, []);

    return (
        <div className="home-container">
            <div className="home-box">
                <h2>Welcome to the Home Page</h2>
                {user ? (
                    <div className="user-details">
                        <p>Username: {user.username}</p>
                        <p>Email: {user.email}</p>
                        <p>Phone Number: {user.phone_number}</p>
                    </div>
                ) : (
                    <p>Loading user details...</p>
                )}
            </div>
        </div>
    );
};

export default Home;