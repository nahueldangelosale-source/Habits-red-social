import { test, expect } from '@playwright/test';

test.describe('B2C Magic Link Authentication & Burn Protocol', () => {

    test('should successfully redeem a magic link and burn it on subsequent uses', async ({ page }) => {
        const mockToken = 'burnable_token_123abc';
        const loginUrl = `/#/atleta/auth/${mockToken}`;

        // --- First Attempt: Success ---
        await page.route('**/api/v1/auth-b2c/redeem', async (route, request) => {
            // Return 200 OK and a valid token on the first attempt
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    access_token: 'mock_jwt_for_athlete',
                    token_type: 'bearer',
                    user: {
                        user_id: 'athlete-123',
                        first_name: 'Juan',
                        last_name: 'Pérez',
                        role: 'CLIENT'
                    }
                }),
            });
        });

        await page.goto(loginUrl);

        // Verify successful redirection and rendering of Athlete Mobile View
        const welcomeHeader = page.locator('text="Hola, Juan"');
        await expect(welcomeHeader).toBeVisible();

        const workoutTab = page.locator('text="Mi Entrenamiento"');
        await expect(workoutTab).toBeVisible();

        // --- Second Attempt: Burned / Invalid ---
        // Clear localStorage to simulate an expired session or visiting from another device
        await page.evaluate(() => localStorage.clear());

        // Remock the route to simulate the backend rejecting a burned token
        await page.route('**/api/v1/auth-b2c/redeem', async (route) => {
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    detail: 'Invalid or expired magic link'
                }),
            });
        });

        await page.goto(loginUrl);

        // Verify error state is shown instead of dashboard
        const errorHeader = page.locator('text="Enlace Caducado o Inválido"');
        await expect(errorHeader).toBeVisible();

        const errorDesc = page.locator('text="Este enlace mágico ya ha sido utilizado o ha expirado por seguridad."');
        await expect(errorDesc).toBeVisible();
    });
});
