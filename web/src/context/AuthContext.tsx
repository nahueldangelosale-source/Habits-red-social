import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    role?: string;
    tenant_id?: string;
    business_name?: string;
    is_new_user?: boolean;
    subscription_tier?: 'FREE' | 'PRO';
    subscription_status?: string;
    payment_provider?: 'STRIPE' | 'MERCADO_PAGO' | 'NONE';
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string, userData?: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            // ANTI-WATERFALL: If we already have user data in memory/localStorage, 
            // we trust it initially but validate in background (Stale-While-Revalidate pattern)
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                    setIsLoading(false);
                } catch (e) {
                    if (import.meta.env.DEV) console.error("Failed to parse saved user", e);
                }
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/whoami`, {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const userData: User = {
                        email: data.email,
                        full_name: data.full_name,
                        role: data.role,
                        subscription_tier: data.subscription_tier,
                        subscription_status: data.subscription_status,
                        payment_provider: data.payment_provider
                    };
                    
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    setToken(storedToken);
                } else {
                    if (import.meta.env.DEV) console.warn("Session expired or invalid token. Falling back to cached user.");
                    if (!savedUser) {
                        logout();
                    }
                }
            } catch (error) {
                if (import.meta.env.DEV) console.error("Auth validation failed (Network/Offline)", error);
                // If offline or demo without backend, we keep the cached user
                if (savedUser) {
                    if (import.meta.env.DEV) console.log("Operating in Offline/Demo Mode (PWA Resilience)");
                } else {
                    logout();
                }
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();

        const handleUnauthorized = () => {
            setToken(null);
            setUser(null);
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, []);


    const login = (newToken: string, userData: User = { email: 'user@example.com' }) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            token,
            user,
            login,
            logout,
            isAuthenticated: !!token,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
