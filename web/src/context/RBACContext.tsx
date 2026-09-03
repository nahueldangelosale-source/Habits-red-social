import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Role, Permission, ROLE_PERMISSIONS } from '../types/rbac';
import { useAuth } from './AuthContext';

export type WorkspaceType = 'B2B' | 'PT' | 'CLINICAL';

interface RBACContextType {
    currentRole: Role;
    permissions: Permission[];
    setRole: (role: Role) => void;
    can: (permission: Permission) => boolean;
    hasRole: (role: Role | Role[]) => boolean;
    isProfessional: boolean;
    isClient: boolean;
    isAdmin: boolean;
    activeWorkspace: WorkspaceType;
    setWorkspace: (ws: WorkspaceType) => void;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    // Map backend role string to Role enum
    const mapRole = (roleStr: string | undefined): Role => {
        if (!roleStr) return Role.PERSONAL_TRAINER; // Default for POC (Trainer is most developed)
        const upper = roleStr.toUpperCase();
        if (upper === 'ADMIN' || upper === 'SUPERUSER') return Role.ADMIN;
        if (upper === 'PERSONAL_TRAINER' || upper === 'TRAINER') return Role.PERSONAL_TRAINER;
        if (upper === 'NUTRITIONIST') return Role.NUTRITIONIST;
        if (upper === 'CLIENT') return Role.CLIENT_HYBRID;
        return Role.PERSONAL_TRAINER;
    };

    const getInitialWorkspace = (role: Role): WorkspaceType => {
        if (role === Role.PERSONAL_TRAINER) return 'PT';
        if (role === Role.NUTRITIONIST) return 'CLINICAL';
        return 'PT'; // Default to PT (Trainer dashboard) for Admin/unknown as well
    };

    const [currentRole, setCurrentRole] = useState<Role>(() => mapRole(user?.role));
    const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>(() => getInitialWorkspace(mapRole(user?.role)));

    // Update role when user data changes (e.g., after whoami hydration)
    React.useEffect(() => {
        if (user?.role) {
            const role = mapRole(user.role);
            setCurrentRole(role);
            setActiveWorkspace(getInitialWorkspace(role));
        }
    }, [user?.role]);

    const permissions = ROLE_PERMISSIONS[currentRole] || [];

    const can = (permission: Permission) => {
        return permissions.includes(permission) || currentRole === Role.ADMIN;
    };

    const hasRole = (role: Role | Role[]) => {
        if (Array.isArray(role)) {
            return role.includes(currentRole);
        }
        return currentRole === role;
    };

    const isProfessional = ([Role.NUTRITIONIST, Role.PERSONAL_TRAINER, Role.ADMIN] as Role[]).includes(currentRole);
    const isClient = ([Role.CLIENT_NUTRITION, Role.CLIENT_FITNESS, Role.CLIENT_HYBRID] as Role[]).includes(currentRole);
    const isAdmin = currentRole === Role.ADMIN;

    return (
        <RBACContext.Provider value={{
            currentRole,
            permissions,
            setRole: setCurrentRole,
            can,
            hasRole,
            isProfessional,
            isClient,
            isAdmin,
            activeWorkspace,
            setWorkspace: setActiveWorkspace
        }}>
            {children}
        </RBACContext.Provider>
    );
};

export const useRBAC = () => {
    const context = useContext(RBACContext);
    if (context === undefined) {
        throw new Error('useRBAC must be used within a RBACProvider');
    }
    return context;
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

/**
 * RoleGuard - Renders children only if user has required role/permission
 */
interface RoleGuardProps {
    children: ReactNode;
    requiredRole?: Role | Role[];
    requiredPermission?: Permission;
    fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    requiredRole,
    requiredPermission,
    fallback = null
}) => {
    const { hasRole, can } = useRBAC();

    if (requiredRole && !hasRole(requiredRole)) {
        return <>{fallback}</>;
    }

    if (requiredPermission && !can(requiredPermission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

/**
 * RoleSwitcher - Dev tool to switch roles easily
 */
export const RoleSwitcher: React.FC = () => {
    const { currentRole, setRole } = useRBAC();
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 9999,
                    background: '#1F2937',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
            >
                👤 {currentRole}
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            background: '#1F2937',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minWidth: '200px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 600 }}>SWITCH ROLE</span>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                >
                    ✕
                </button>
            </div>

            {Object.values(Role).map(role => (
                <button
                    key={role}
                    onClick={() => setRole(role)}
                    style={{
                        textAlign: 'left',
                        background: currentRole === role ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                        color: currentRole === role ? '#818CF8' : '#D1D5DB',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: currentRole === role ? 600 : 400
                    }}
                >
                    {role}
                </button>
            ))}
        </div>
    );
};
