import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// interface User {
//     email: string;
//     name: string;
// }

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userdetails, setUserdetails] = useState<any>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/check`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true);
                setUserdetails(data);
                console.log(data)
            } else {
                setIsAuthenticated(false);
                setUserdetails(null);
            }
        } catch (error) {
            setIsAuthenticated(false);
            setUserdetails(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credential: string) => {
        try {
            const decoded = jwtDecode(credential);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: (decoded as any).email,
                    name: (decoded as any).name
                })
            });

            if (response.ok) {
                setIsAuthenticated(true);
                setUserdetails({
                    email: (decoded as any).email,
                    name: (decoded as any).name
                });
                checkAuth();
            }
        } catch (error) {
            console.error('Authentication error:', error);
        }
    };

    return { isAuthenticated, loading, userdetails, handleGoogleLogin, checkAuth };
};
