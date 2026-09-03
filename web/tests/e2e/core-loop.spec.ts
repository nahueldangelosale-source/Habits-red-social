import { test, expect } from '@playwright/test';

// Use a mock tenant UUID or wait for network idle to ensure MSW/Mock data loads
const PLAN_ID = '00000000-0000-0000-0000-000000000000'; // Assume frontend will use a mocked plan if API fails or we intercept

test.describe('B2B Copilot Core Loop', () => {
    test('Drag generic block, await AI swap, and share via WhatsApp', async ({ page }) => {
        // 1. Interceptar la API de Hexfit Killer (suggest-swap)
        await page.route('**/api/v1/fitness/suggest-swap', async (route) => {
            // Respond multiple fields with artificial delay
            setTimeout(() => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        suggested_exercise_id: '1234',
                        name: 'IA: Press de Banca Mock',
                        sets: 3,
                        reps: 12,
                        weight_kg: 50.0,
                        confidence: 0.99
                    }),
                });
            }, 1000); // 1s de lag artificial
        });

        // 2. Interceptar API de WhatsApp Share
        await page.route('**/api/v1/workouts/*/share/whatsapp', async (route) => {
            route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'queued', delivery_id: 'whatsapp_xyz' }),
            });
        });

        // Ir al home (que por defecto debería cargar el dashboard / builder)
        // Asumiendo que el Frontend Vite levanta en / y el Canvas renderiza
        await page.goto('/');

        // 3. Aserciones de Carga
        // Wait for the Generic Block to be visible
        const genericBlock = page.getByText('Empuje Horizontal');
        await expect(genericBlock).toBeVisible({ timeout: 10000 });

        // Encontrar el Dropzone del Día 1
        const day1Dropzone = page.locator('.bg-card').filter({ hasText: 'Día 1' });
        await expect(day1Dropzone).toBeVisible();

        // 4. Simular Drag and Drop manual
        await genericBlock.hover();
        await page.mouse.down();
        // Drag towards the dropzone center
        const dropzoneBox = await day1Dropzone.boundingBox();
        if (dropzoneBox) {
            await page.mouse.move(dropzoneBox.x + dropzoneBox.width / 2, dropzoneBox.y + dropzoneBox.height / 2, { steps: 10 });
        }
        await page.mouse.up();

        // 5. Verificar que aparece el Skeleton Loading
        // El Skeleton tiene un SVG "Sparkles" y la clase "animate-pulse"
        const skeleton = page.locator('.animate-pulse').first();
        // Aserción asíncrona pero que debería fallar si no aparece al instante
        await expect(skeleton).toBeVisible();

        // 6. Verificar el Reemplazo Final de la IA
        // Después del mock timeout (1s), debería aparecer el ejercicio "IA: Press de Banca Mock"
        const realExercise = page.getByText('IA: Press de Banca Mock');
        await expect(realExercise).toBeVisible({ timeout: 3000 }); // Damos 3s máx para que resuelva la mutación optimista de React Query

        // 7. Core Loop Monetization: Click en WhatsApp
        const shareBtn = page.getByRole('button', { name: /enviar por whatsapp/i });
        if (await shareBtn.isVisible()) {
            await shareBtn.click();

            // El Toast de react-hot-toast aparece
            const toastMessage = page.getByText('Rutina encolada para WhatsApp');
            await expect(toastMessage).toBeVisible({ timeout: 2000 });
        }
    });
});
