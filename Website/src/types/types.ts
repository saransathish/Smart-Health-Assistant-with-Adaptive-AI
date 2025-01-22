export interface User {
    username: string;
    email: string;
    phone_number: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
}