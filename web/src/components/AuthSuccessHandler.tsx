import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export const AuthSuccessHandler = () => {
    const { login } = useAuth();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const token = query.get('token');

        if (token) {
            // Guardar JWT emitido por la infraestructura de Aurea (backend) 
            // tras completar el circuito cerrado Oauth (Callback -> Redireción Front)
            login(token, { email: 'coach@aurea.app' }); // AuthContext se ajusta solo con el decode del back.
            // Limpia la url reseteando la SPA
            window.location.href = '/';
        }
    }, [login]);

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 2 }}
                className="w-12 h-12 rounded-full border-t-2 border-r-2 border-indigo-500"
            />
            <p className="text-indigo-400 font-mono mt-4 animate-pulse">Autenticando enlace criptográfico...</p>
        </div>
    );
};
