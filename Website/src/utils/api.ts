import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Replace with your Django backend URL

export const register = async (username: string, email: string, password: string, phone_number: string) => {
    const response = await axios.post(`${API_URL}/register/`, {
        username,
        email,
        password,
        phone_number,
    });
    console.log(response.data);
    return response.data;
};

export const login = async (username: string, password: string) => {
    localStorage.setItem('userid', username);

    const response = await axios.post(`${API_URL}/login/`, {
        username,
        password,
    });
    if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
    }
    console.log(response.data);
    return response.data;
};

export const getUserDetails = async () => {
    console.log(localStorage.getItem('userid'));
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_URL}/user/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};