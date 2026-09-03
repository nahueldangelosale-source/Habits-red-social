/**
 * Permission Definitions
 * Matches backend app/db/rbac.py
 */

export const Role = {
    // Profesionales (B2B)
    NUTRITIONIST: "NUTRITIONIST",
    PERSONAL_TRAINER: "PERSONAL_TRAINER",
    ADMIN: "ADMIN",
    SUPERUSER: "SUPERUSER",

    // Clientes (B2C)
    CLIENT_NUTRITION: "CLIENT_NUTRITION",
    CLIENT_FITNESS: "CLIENT_FITNESS",
    CLIENT_HYBRID: "CLIENT_HYBRID"
} as const;

export type Role = typeof Role[keyof typeof Role];

export const Permission = {
    // NUTRITION
    DIET_CREATE: "diet:create",
    DIET_READ: "diet:read",
    DIET_EDIT: "diet:edit",
    DIET_DELETE: "diet:delete",

    // FITNESS
    WORKOUT_CREATE: "workout:create",
    WORKOUT_READ: "workout:read",
    WORKOUT_EDIT: "workout:edit",

    // CLINICAL
    CLINICAL_FULL: "clinical:full",

    // ADMIN
    ADMIN_USERS: "admin:users"
} as const;

export type Permission = typeof Permission[keyof typeof Permission];

// Default permissions just for frontend mocking/logic
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.NUTRITIONIST]: [
        Permission.DIET_CREATE,
        Permission.DIET_READ,
        Permission.DIET_EDIT,
        Permission.DIET_DELETE,
        Permission.CLINICAL_FULL
    ],
    [Role.PERSONAL_TRAINER]: [
        Permission.WORKOUT_CREATE,
        Permission.WORKOUT_READ,
        Permission.WORKOUT_EDIT,
        Permission.CLINICAL_FULL
    ],
    [Role.ADMIN]: Object.values(Permission),
    [Role.SUPERUSER]: Object.values(Permission),
    [Role.CLIENT_NUTRITION]: [Permission.DIET_READ],
    [Role.CLIENT_FITNESS]: [Permission.WORKOUT_READ],
    [Role.CLIENT_HYBRID]: [Permission.DIET_READ, Permission.WORKOUT_READ]
};
