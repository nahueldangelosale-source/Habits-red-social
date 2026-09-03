import { test, expect } from '@playwright/test';

test.describe('Revenue Guard FinOps Protection', () => {
    test('should render Insufficient Credits PaymentWall when tenant has 0 balance', async ({ page }) => {
        // 1. Mock the auth endpoint to simulate an athlete logging in
        await page.route('**/api/v1/auth/me', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user_id: '123e4567-e89b-12d3-a456-426614174000',
                    username: 'test_athlete',
                    role: 'CLIENT',
                    tenant_id: '987fcdeb-51a2-43d7-9012-345678901234',
                }),
            });
        });

        // 2. Mock the AI extraction endpoint to simulate a 402 Payment Required response from Revenue Guard
        await page.route('**/api/v1/magic-import/extract', async route => {
            await route.fulfill({
                status: 402,
                contentType: 'application/json',
                body: JSON.stringify({
                    detail: 'Insufficient compute units. Tenant balance: 0'
                }),
            });
        });

        // 3. Navigate to the Magic Import page (assuming token is in localStorage)
        await page.addInitScript(() => {
            localStorage.setItem('token', 'mock_jwt_token_for_playwright');
            localStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));
        });

        await page.goto('/#/import');

        // 4. Trigger the AI action
        const textInput = page.locator('textarea[placeholder*="Pega tu rutina"]');
        await expect(textInput).toBeVisible();
        await textInput.fill('Rutina de prueba para gastar creditos');

        // Click the extract button
        const submitBtn = page.getByRole('button', { name: /Analizar/i });
        await submitBtn.click();

        // 5. Verify the PaymentWall modal appears
        const paymentWall = page.locator('text="Límite de Cómputo Alcanzado"');
        await expect(paymentWall).toBeVisible();

        const upgradeBtn = page.getByRole('button', { name: /Contactar Soporte/i });
        await expect(upgradeBtn).toBeVisible();
    });
});
