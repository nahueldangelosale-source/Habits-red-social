import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, ArrowUpRight, Sparkles, UserPlus, User, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { API_BASE_URL } from '../api/client';
import toast from 'react-hot-toast';

const API_URL = API_BASE_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '858729707538-otkd8je19k5n6j1hhtecprph44vbb5nq.apps.googleusercontent.com';

// Icono Oficial Vectorial de Google
const GoogleGIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
);

// Banderitas Vectoriales Nítidas Multiplataforma
const FlagSpain = () => (
    <svg className="w-4 h-3 rounded-xs overflow-hidden shadow-2xs shrink-0" viewBox="0 0 640 480">
        <path fill="#c60b1e" d="M0 0h640v480H0z"/>
        <path fill="#ffc400" d="M0 120h640v240H0z"/>
    </svg>
);

const FlagUK = () => (
    <svg className="w-4 h-3 rounded-xs overflow-hidden shadow-2xs shrink-0" viewBox="0 0 640 480">
        <path fill="#012169" d="M0 0h640v480H0z"/>
        <path fill="#FFF" d="m75 0 245 180L565 0h75v60L435 240l205 180v60h-75L320 300 75 480H0v-60l205-180L0 60V0z"/>
        <path fill="#C8102E" d="m424 281 216 159v40L370 281zm-208-82L0 40V0l270 199zM640 0v10L425 171l45 28L640 38zM0 480v-10l215-161-45-28L0 442z"/>
        <path fill="#FFF" d="M240 0h160v480H240zM0 160h640v160H0z"/>
        <path fill="#C8102E" d="M267 0h106v480H267zM0 187h640v106H0z"/>
    </svg>
);

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const { lang, setLang } = useLanguage();
    
    // Selector principal: 'USER' (Soy Usuario) vs 'COACH' (Soy Coach)
    const [role, setRole] = useState<'USER' | 'COACH'>('USER');
    const roleRef = useRef<'USER' | 'COACH'>('USER');

    useEffect(() => {
        roleRef.current = role;
    }, [role]);

    // Sub-modo: 'login' (Iniciar Sesión) vs 'register' (Crear Cuenta)
    const [mode, setMode] = useState<'login' | 'register'>('login');
    
    // Auto-redirección si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            const savedUserStr = localStorage.getItem('user');
            const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
            if (savedUser?.role === 'CLIENT_FITNESS' || savedUser?.role === 'ATHLETE' || savedUser?.role === 'PATIENT') {
                navigate('/athlete', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, navigate]);

    // Form inputs
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEmailAlreadyRegistered, setIsEmailAlreadyRegistered] = useState(false);

    const isGoogleInitRef = useRef(false);

    // ═══════════════════════════════════════════════════════════════
    // GOOGLE ONE-TAP & GIS INITIALIZATION (SINGLETON)
    // ═══════════════════════════════════════════════════════════════
    useEffect(() => {
        const handleGoogleCallback = async (response: any) => {
            if (!response?.credential) return;
            setIsGoogleLoading(true);
            setError(null);
            setIsEmailAlreadyRegistered(false);
            const toastId = toast.loading(lang === 'es' ? 'Validando con Google...' : 'Verifying with Google...');

            try {
                const isUser = roleRef.current === 'USER';
                const targetRole = isUser ? 'CLIENT_FITNESS' : 'ADMIN';
                const res = await fetch(`${API_URL}/api/v1/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        credential: response.credential,
                        role: targetRole,
                        specialty: 'PERSONAL_TRAINER'
                    })
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    let msg = 'Fallo de autenticación con Google';
                    if (typeof errorData.detail === 'string') msg = errorData.detail;
                    else if (Array.isArray(errorData.detail)) msg = errorData.detail.map((d: any) => d.msg || d.message).join(', ');
                    throw new Error(msg);
                }

                const data = await res.json();
                if (!data.access_token) {
                    throw new Error("No se recibió clave de acceso válida.");
                }

                if (data.user?.is_new_user && targetRole === 'ADMIN') {
                    localStorage.removeItem('coach_wizard_completed');
                }

                toast.dismiss(toastId);
                toast.success(lang === 'es' ? '¡Bienvenido/a a Habits!' : 'Welcome to Habits!');
                const userToSave = {
                    ...(data.user || {}),
                    role: isUser ? 'CLIENT_FITNESS' : (data.user?.role || 'ADMIN')
                };
                login(data.access_token, userToSave);

                if (isUser || userToSave.role === 'CLIENT_FITNESS' || userToSave.role === 'ATHLETE') {
                    navigate('/athlete', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            } catch (err: any) {
                toast.dismiss(toastId);
                console.error("Google Auth Error:", err);
                setError(err.message || "Error al autenticar con Google.");
            } finally {
                setIsGoogleLoading(false);
            }
        };

        const initGoogle = () => {
            if ((window as any).google?.accounts?.id && !(window as any).__google_gis_initialized) {
                try {
                    (window as any).google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: handleGoogleCallback,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });
                    (window as any).__google_gis_initialized = true;
                    isGoogleInitRef.current = true;
                } catch (e) {
                    console.warn("Google GIS Init Warn:", e);
                }
            }
        };

        const timer = setTimeout(initGoogle, 300);
        return () => clearTimeout(timer);
    }, [lang, login, navigate]);

    // Disparador manual para el botón de Google (Popup OAuth2 Flow)
    const handleGoogleSignIn = () => {
        setIsGoogleLoading(true);
        setError(null);

        // Si la librería Google Identity Services está cargada
        if ((window as any).google?.accounts?.oauth2) {
            try {
                const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: 'email profile openid',
                    callback: async (tokenResponse: any) => {
                        if (tokenResponse?.error) {
                            setIsGoogleLoading(false);
                            console.error("Google Token Error:", tokenResponse);
                            return;
                        }

                        if (tokenResponse?.access_token) {
                            const isUser = roleRef.current === 'USER';
                            const targetRole = isUser ? 'CLIENT_FITNESS' : 'ADMIN';
                            const toastId = toast.loading(
                                mode === 'register'
                                    ? (isUser
                                        ? (lang === 'es' ? 'Creando tu cuenta de Usuario...' : 'Setting up your User profile...')
                                        : (lang === 'es' ? 'Creando tu espacio de Coach...' : 'Setting up your Coach space...'))
                                    : (lang === 'es' ? 'Iniciando sesión con Google...' : 'Signing in with Google...')
                            );
                            try {
                                const res = await fetch(`${API_URL}/api/v1/auth/google`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        credential: tokenResponse.access_token,
                                        role: targetRole,
                                        specialty: 'PERSONAL_TRAINER'
                                    })
                                });

                                if (res.ok) {
                                    const data = await res.json();
                                    if (data.user?.is_new_user && targetRole === 'ADMIN') {
                                        localStorage.removeItem('coach_wizard_completed');
                                    }
                                    toast.dismiss(toastId);
                                    toast.success(lang === 'es' ? '¡Bienvenido/a a Habits!' : 'Welcome to Habits!');
                                    const userToSave = {
                                        ...(data.user || {}),
                                        role: isUser ? 'CLIENT_FITNESS' : (data.user?.role || 'ADMIN')
                                    };
                                    login(data.access_token, userToSave);
                                    if (isUser || userToSave.role === 'CLIENT_FITNESS' || userToSave.role === 'ATHLETE') {
                                        navigate('/athlete', { replace: true });
                                    } else {
                                        navigate('/dashboard', { replace: true });
                                    }
                                } else {
                                    const errorData = await res.json().catch(() => ({}));
                                    let msg = lang === 'es' ? 'Fallo al autenticar con Google en el servidor.' : 'Failed to authenticate.';
                                    if (typeof errorData.detail === 'string') msg = errorData.detail;
                                    toast.dismiss(toastId);
                                    toast.error(msg);
                                    setError(msg);
                                }
                            } catch (e: any) {
                                toast.dismiss(toastId);
                                toast.error(e.message || 'Error de conexión con Google');
                            } finally {
                                setIsGoogleLoading(false);
                            }
                        }
                    }
                });

                tokenClient.requestAccessToken({ prompt: 'select_account' });
                return;
            } catch (err) {
                console.warn("OAuth2 Popup fallback to prompt:", err);
            }
        }

        // Si no está listo, intentamos con One-Tap prompt
        if ((window as any).google?.accounts?.id) {
            (window as any).google.accounts.id.prompt();
        } else {
            toast(lang === 'es' ? 'Cargando servicio de Google, intentá en un segundo...' : 'Loading Google services, please wait...', { icon: '⏳' });
        }
        setIsGoogleLoading(false);
    };

    // ═══════════════════════════════════════════════════════════════
    // LIQUID GLASS 3D INTERACTIVE PARALLAX PHYSICS FOR THE LOGO
    // ═══════════════════════════════════════════════════════════════
    const logoCardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 22, stiffness: 260 };
    const rotateX = useSpring(useTransform(mouseY, [-80, 80], [14, -14]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-80, 80], [-14, 14]), springConfig);
    const sheenX = useSpring(useTransform(mouseX, [-80, 80], ['-100%', '200%']), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!logoCardRef.current) return;
        const rect = logoCardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const handleSwitchToRegister = () => {
        setMode('register');
        setError(null);
        setIsEmailAlreadyRegistered(false);
        // Limpiar burbujas para permitir crear cuenta desde cero
        setEmail('');
        setPassword('');
    };

    const handleSwitchToLogin = () => {
        setMode('login');
        setError(null);
        setIsEmailAlreadyRegistered(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setIsEmailAlreadyRegistered(false);

        try {
            if (mode === 'login') {
                if (!email.trim() || !password) {
                    throw new Error(lang === 'es' ? 'Por favor completá tu correo y contraseña.' : 'Please enter your email and password.');
                }

                const formData = new FormData();
                formData.append('username', email.trim());
                formData.append('password', password);

                const response = await fetch(`${API_URL}/token`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    let msg = lang === 'es' 
                        ? 'Credenciales inválidas. Verificá tu correo y contraseña.'
                        : 'Invalid credentials. Please verify your email and password.';
                    if (typeof errorData.detail === 'string') msg = errorData.detail;
                    else if (Array.isArray(errorData.detail)) msg = errorData.detail.map((d: any) => d.msg || d.message).join(', ');
                    throw new Error(msg);
                }

                const data = await response.json();

                if (!data.access_token) {
                    throw new Error(lang === 'es' ? "El servidor no devolvió una clave de acceso válida." : "Invalid access token received.");
                }

                const userRole = data.user?.role;
                const isAthlete = role === 'USER' || userRole === 'CLIENT_FITNESS' || userRole === 'ATHLETE' || userRole === 'PATIENT';
                const finalRole = role === 'USER' ? 'CLIENT_FITNESS' : (userRole || 'ADMIN');

                login(data.access_token, {
                    ...(data.user || {}),
                    email: email.trim(),
                    role: finalRole
                });
                toast.success(lang === 'es' ? '¡Bienvenido/a a Habits!' : 'Welcome back!');

                if (isAthlete) {
                    navigate('/athlete', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            } else {
                // Modo 'register' (Crear Cuenta / Registrarse con correo)
                if (!email.trim() || !password) {
                    throw new Error(lang === 'es' ? 'Por favor completá tu correo electrónico y contraseña.' : 'Please enter your email and password.');
                }
                if (password.length < 6) {
                    throw new Error(lang === 'es' ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.');
                }

                const parts = fullName.trim().split(/\s+/);
                const firstName = parts[0] || (role === 'USER' ? 'Usuario' : 'Coach');
                const lastName = parts.slice(1).join(' ') || (role === 'USER' ? 'Habits' : '');

                if (role === 'USER') {
                    // REGISTRO DE USUARIO STANDALONE (B2C)
                    const response = await fetch(`${API_URL}/api/v1/auth/register-b2c`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: email.trim(),
                            password,
                            first_name: firstName,
                            last_name: lastName
                        })
                    });

                    if (response.status === 409) {
                        // Auto-login instantáneo si ya fue creado con esa clave
                        const loginFormData = new FormData();
                        loginFormData.append('username', email.trim());
                        loginFormData.append('password', password);

                        const loginRes = await fetch(`${API_URL}/token`, {
                            method: 'POST',
                            body: loginFormData
                        });

                        if (loginRes.ok) {
                            const loginData = await loginRes.json();
                            if (loginData.access_token) {
                                login(loginData.access_token, {
                                    ...(loginData.user || {}),
                                    email: email.trim(),
                                    role: 'CLIENT_FITNESS'
                                });
                                toast.success(lang === 'es' ? '¡Sesión iniciada con éxito!' : 'Logged in successfully!');
                                navigate('/athlete', { replace: true });
                                return;
                            }
                        }

                        setIsEmailAlreadyRegistered(true);
                        throw new Error(lang === 'es' ? 'Este correo ya está registrado. Ingresá tu contraseña para iniciar sesión.' : 'This email is already registered. Please sign in.');
                    }

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        let msg = lang === 'es' ? 'Error al registrar la cuenta de Usuario' : 'Error registering user account';
                        if (typeof errorData.detail === 'string') msg = errorData.detail;
                        else if (Array.isArray(errorData.detail)) msg = errorData.detail.map((d: any) => d.msg || d.message).join(', ');
                        throw new Error(msg);
                    }

                    const data = await response.json();
                    if (!data.access_token) {
                        throw new Error(lang === 'es' ? "Cuenta creada pero ocurrió un fallo al iniciar sesión." : "Account created but login failed.");
                    }

                    login(data.access_token, {
                        ...(data.user || {}),
                        email: email.trim(),
                        role: 'CLIENT_FITNESS'
                    });
                    toast.success(lang === 'es' ? '¡Cuenta de Usuario creada! Bienvenido/a a Habits.' : 'Account created! Welcome to Habits.');
                    navigate('/athlete', { replace: true });
                } else {
                    // REGISTRO DE COACH MULTI-TENANT (B2B)
                    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: email.trim(),
                            password,
                            first_name: firstName,
                            last_name: lastName,
                            specialty: 'PERSONAL_TRAINER'
                        })
                    });

                    if (response.status === 409) {
                        // Auto-login instantáneo si ya fue creado con esa clave
                        const loginFormData = new FormData();
                        loginFormData.append('username', email.trim());
                        loginFormData.append('password', password);

                        const loginRes = await fetch(`${API_URL}/token`, {
                            method: 'POST',
                            body: loginFormData
                        });

                        if (loginRes.ok) {
                            const loginData = await loginRes.json();
                            if (loginData.access_token) {
                                login(loginData.access_token, loginData.user || { email: email.trim(), role: 'ADMIN' });
                                toast.success(lang === 'es' ? '¡Sesión iniciada con éxito!' : 'Logged in successfully!');
                                navigate('/dashboard', { replace: true });
                                return;
                            }
                        }

                        setIsEmailAlreadyRegistered(true);
                        throw new Error(lang === 'es' ? 'Este correo ya está registrado como Coach. Ingresá tu contraseña para iniciar sesión.' : 'This email is already registered. Please sign in.');
                    }

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        let msg = lang === 'es' ? 'Error al registrar la cuenta de Coach' : 'Error registering coach account';
                        if (typeof errorData.detail === 'string') msg = errorData.detail;
                        else if (Array.isArray(errorData.detail)) msg = errorData.detail.map((d: any) => d.msg || d.message).join(', ');
                        throw new Error(msg);
                    }

                    const data = await response.json();

                    if (!data.access_token) {
                        throw new Error(lang === 'es' ? "Cuenta creada pero ocurrió un fallo en sesión." : "Account created but login failed.");
                    }

                    // Reset coach wizard flag so the new coach sees the Progressive Onboarding Tour immediately
                    localStorage.removeItem('coach_wizard_completed');
                    login(data.access_token, data.user || { email: email.trim(), role: 'ADMIN' });
                    toast.success(lang === 'es' ? '¡Cuenta creada! Personalicemos tu espacio...' : 'Account created! Let\'s setup your space...');
                    navigate('/dashboard', { replace: true });
                }
            }
        } catch (error: any) {
            console.error("Fallo de Autenticación:", error);
            setError(error.message || "Error de conexión con el servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full flex items-center justify-center p-0 sm:p-4 font-sans relative overflow-y-auto bg-gradient-to-b from-[#F3F5FA] via-[#F8FAFD] to-[#EDF2FA] text-slate-900 select-none">
            
            {/* MALLA AMBIENTAL CLÍNICA SOFT */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute -top-[10%] -right-[10%] w-[550px] h-[550px] rounded-full bg-purple-300/15 blur-[120px]" />
                <div className="absolute top-[20%] -left-[15%] w-[600px] h-[600px] rounded-full bg-indigo-300/15 blur-[130px]" />
                <div className="absolute -bottom-[15%] right-[20%] w-[500px] h-[500px] rounded-full bg-emerald-300/15 blur-[120px]" />
            </div>

            {/* TARJETA LIQUID GLASS PREMIUM: EDGE-TO-EDGE EN MÓVIL, CARD EN DESKTOP */}
            <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full min-h-[100dvh] sm:min-h-0 sm:max-w-[430px] relative z-10 my-auto flex flex-col justify-center"
            >
                <div className="relative w-full min-h-[100dvh] sm:min-h-0 rounded-none sm:rounded-3xl p-6 sm:p-7 backdrop-blur-3xl bg-white/95 sm:bg-white/90 border-0 sm:border sm:border-white/80 shadow-none sm:shadow-[0_20px_50px_rgba(30,41,59,0.06),0_1px_3px_rgba(30,41,59,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] overflow-hidden flex flex-col justify-center">
                    
                    {/* BANDERITAS DUALES DE IDIOMA */}
                    <div className="absolute top-4 right-4 z-20">
                        <div className="flex items-center bg-slate-100/90 backdrop-blur-md p-0.5 rounded-full border border-slate-200/70 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => setLang('es')}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                                    lang === 'es'
                                        ? 'bg-white text-slate-900 shadow-xs scale-102 font-black'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                                title="Cambiar a Español"
                            >
                                <FlagSpain />
                                <span>ES</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setLang('en')}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                                    lang === 'en'
                                        ? 'bg-white text-slate-900 shadow-xs scale-102 font-black'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                                title="Switch to English"
                            >
                                <FlagUK />
                                <span>EN</span>
                            </button>
                        </div>
                    </div>

                    {/* HEADER CON LOGO MANDALA & LIQUID GLASS 3D */}
                    <div className="text-center mb-3 flex flex-col items-center pt-1">
                        <div
                            ref={logoCardRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            className="perspective-1000 select-none py-0.5"
                        >
                            <motion.div
                                style={{
                                    rotateX,
                                    rotateY,
                                    transformStyle: 'preserve-3d',
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative cursor-pointer w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center"
                                title="Habits • Tu Red Social Saludable"
                            >
                                <motion.div 
                                    style={{ left: sheenX }}
                                    className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none rounded-full blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                />

                                <img
                                    src="/logo-habits-transparent.png"
                                    alt="Habits - Tu Red Social Saludable"
                                    className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(99,102,241,0.14)] transition-all duration-300 pointer-events-none"
                                />
                            </motion.div>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-center mt-0.5">
                            Habits
                            <span className="text-emerald-500 text-3xl sm:text-4xl translate-y-0.5 ml-0.5">
                                .
                            </span>
                        </h1>

                        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-500 mt-0.5">
                            {lang === 'en' ? 'Your Healthy Social Network' : 'Tu Red Social Saludable'}
                        </p>
                    </div>

                    {/* SELECTOR PRINCIPAL: SOY USUARIO / SOY COACH */}
                    <div className="grid grid-cols-2 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 mb-2.5 text-xs font-black shadow-2xs">
                        <button
                            type="button"
                            onClick={() => {
                                setRole('USER');
                                setError(null);
                                setIsEmailAlreadyRegistered(false);
                            }}
                            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer ${
                                role === 'USER'
                                    ? 'bg-white text-emerald-600 shadow-xs scale-[1.02] font-black'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <User size={14} className={role === 'USER' ? 'text-emerald-500' : 'text-slate-400'} />
                            <span>{lang === 'en' ? 'I am a User' : 'Soy Usuario'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setRole('COACH');
                                setError(null);
                                setIsEmailAlreadyRegistered(false);
                            }}
                            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer ${
                                role === 'COACH'
                                    ? 'bg-white text-indigo-600 shadow-xs scale-[1.02] font-black'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Dumbbell size={14} className={role === 'COACH' ? 'text-indigo-600' : 'text-slate-400'} />
                            <span>{lang === 'en' ? 'I am a Coach' : 'Soy Coach'}</span>
                        </button>
                    </div>

                    {/* SUB-SELECTOR: INICIAR SESIÓN / CREAR CUENTA */}
                    <div className="flex bg-slate-100/70 p-0.5 rounded-xl border border-slate-200/60 mb-3 text-[11px] font-bold">
                        <button
                            type="button"
                            onClick={handleSwitchToLogin}
                            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                                mode === 'login'
                                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {lang === 'en' ? 'Sign In' : 'Iniciar Sesión'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSwitchToRegister}
                            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                mode === 'register'
                                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <UserPlus size={12} />
                            <span>{lang === 'en' ? 'Create Account' : 'Crear Cuenta'}</span>
                        </button>
                    </div>

                    {/* ERROR NOTIFICATION / QUICK SWITCH TO LOGIN */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-3 p-3 rounded-2xl text-xs font-medium flex flex-col gap-2 ${
                                isEmailAlreadyRegistered
                                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-900'
                                    : 'bg-rose-50 border border-rose-200/80 text-rose-700'
                            }`}
                        >
                            <div className="flex items-center gap-2 font-bold">
                                {isEmailAlreadyRegistered ? (
                                    <AlertCircle size={15} className="text-indigo-600 shrink-0" />
                                ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                )}
                                <span>{error}</span>
                            </div>

                            {isEmailAlreadyRegistered && (
                                <button
                                    type="button"
                                    onClick={handleSwitchToLogin}
                                    className="self-start px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                                >
                                    <span>Ir a Iniciar Sesión</span>
                                    <ArrowUpRight size={13} />
                                </button>
                            )}
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════════
                        BOTÓN OFICIAL DE GOOGLE (CONTINUAR / REGISTRARSE)
                       ═══════════════════════════════════════════════════════════════ */}
                    <div className="mb-3">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                        >
                            <GoogleGIcon />
                            <span>
                                {isGoogleLoading
                                    ? (lang === 'es' ? 'Conectando con Google...' : 'Connecting...')
                                    : (mode === 'register'
                                        ? (lang === 'es' ? 'Registrarse con Google' : 'Sign up with Google')
                                        : (lang === 'es' ? 'Continuar con Google' : 'Continue with Google'))}
                            </span>
                        </button>
                    </div>

                    {/* DIVISOR ESTÉTICO */}
                    <div className="relative flex items-center justify-center my-3">
                        <div className="border-t border-slate-200/80 w-full" />
                        <span className="bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 absolute">
                            {mode === 'login'
                                ? (lang === 'es' ? 'o con usuario y contraseña' : 'or with email & password')
                                : (lang === 'es' ? 'o registrarse con correo' : 'or register with email')}
                        </span>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════
                        FORMULARIO CON CAMPOS DINÁMICOS
                       ═══════════════════════════════════════════════════════════════ */}
                    <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
                        {mode === 'register' && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-1"
                            >
                                <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                                    {role === 'USER'
                                        ? (lang === 'en' ? 'FULL NAME' : 'NOMBRE Y APELLIDO')
                                        : (lang === 'en' ? 'NAME OR BRAND' : 'NOMBRE O MARCA DE COACH')}
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-50/90 focus:bg-white border border-slate-200/90 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
                                        placeholder={role === 'USER' ? (lang === 'en' ? 'e.g. Alex Smith' : 'Ej. Juan Pérez') : (lang === 'en' ? 'e.g. Coach Alex' : 'Ej. Coach Marcos')}
                                        required={mode === 'register'}
                                        autoComplete="name"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                                {mode === 'register' 
                                    ? (lang === 'en' ? 'EMAIL ADDRESS' : 'CORREO ELECTRÓNICO')
                                    : (lang === 'en' ? 'USERNAME (EMAIL)' : 'USUARIO (CORREO ELECTRÓNICO)')}
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50/90 focus:bg-white border border-slate-200/90 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
                                    placeholder={mode === 'register' ? "ejemplo@tucorreo.com" : "tu@email.com"}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                                {mode === 'register' 
                                    ? (lang === 'en' ? 'CHOOSE PASSWORD (MIN 6 CHARACTERS)' : 'CREAR CONTRASEÑA (MÍNIMO 6 CARACTERES)')
                                    : (lang === 'en' ? 'PASSWORD' : 'CONTRASEÑA')}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50/90 focus:bg-white border border-slate-200/90 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
                                    placeholder={mode === 'register' ? "Mínimo 6 caracteres" : "••••••••"}
                                    required
                                    autoComplete={mode === 'login' ? "current-password" : "new-password"}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative group overflow-hidden rounded-2xl p-[1px] shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-70 mt-2 cursor-pointer"
                        >
                            <div className={`absolute inset-0 rounded-2xl group-hover:scale-105 transition-transform duration-500 ${
                                role === 'USER'
                                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600'
                                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600'
                            }`} />
                            <div className={`relative rounded-[15px] px-4 py-2.5 flex items-center justify-center gap-2 ${
                                role === 'USER'
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                            }`}>
                                <span className="font-montserrat font-black text-white text-xs uppercase tracking-wider">
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {lang === 'en' ? 'AUTHENTICATING...' : 'PROCESANDO...'}
                                        </span>
                                    ) : (
                                        mode === 'login' 
                                            ? (role === 'USER'
                                                ? (lang === 'en' ? 'SIGN IN AS USER' : 'INICIAR SESIÓN COMO USUARIO')
                                                : (lang === 'en' ? 'SIGN IN AS COACH' : 'INICIAR SESIÓN COMO COACH'))
                                            : (role === 'USER'
                                                ? (lang === 'en' ? 'CREATE USER ACCOUNT' : 'CREAR CUENTA DE USUARIO')
                                                : (lang === 'en' ? 'CREATE COACH ACCOUNT' : 'CREAR CUENTA DE COACH'))
                                    )}
                                </span>
                                {!isLoading && <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-1 transition-transform" />}
                            </div>
                        </button>

                        {/* ENLACE RÁPIDO PARA CAMBIAR ENTRE INICIAR SESIÓN Y REGISTRO */}
                        <div className="text-center pt-1">
                            {mode === 'login' ? (
                                <button
                                    type="button"
                                    onClick={handleSwitchToRegister}
                                    className="text-[11px] text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
                                >
                                    {lang === 'en' ? 'Don\'t have an account yet? ' : '¿No tienes cuenta aún? '}
                                    <span className={role === 'USER' ? 'text-emerald-600 font-black underline' : 'text-indigo-600 font-black underline'}>
                                        {lang === 'en' ? 'Register with email' : 'Registrarse con correo'}
                                    </span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSwitchToLogin}
                                    className="text-[11px] text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
                                >
                                    {lang === 'en' ? 'Already have an account? ' : '¿Ya tienes una cuenta? '}
                                    <span className={role === 'USER' ? 'text-emerald-600 font-black underline' : 'text-indigo-600 font-black underline'}>
                                        {lang === 'en' ? 'Sign in with email' : 'Iniciar Sesión'}
                                    </span>
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 text-center">
                        <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                            <ShieldCheck size={12} className="text-emerald-500" />
                            <span>Google 1-Tap OAuth & SSL • Aislamiento Multi-Tenant</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
