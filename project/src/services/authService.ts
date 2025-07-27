const API_URL = 'http://localhost:5000/api/auth'; 

// Function to register a new user
const register = async (email: string, password: string, username: string, role: string) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, username, role }),
        });

        // Check if the response is OK (status 2xx)
        if (!response.ok) {
            // If not OK, parse the error message from the backend
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        return data; 
    } catch (error: any) {
        console.error('Error during registration:', error.message);
        throw error; 
    }
};

// --- New: Function to log in a user ---
const login = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        // The backend will return a token and user info, including role
        return data; 
    } catch (error: any) {
        console.error('Error during login:', error.message);
        throw error;
    }
};
// --- End New ---

const authService = {
    register,
    login, // Add the new login function here
};

export default authService;
