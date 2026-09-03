import { test, expect } from '@playwright/test';

test.describe('OCR Quarantine Vault E2E', () => {
  test('Subir documento de baja confianza dispara Split View', async ({ page }) => {
    // 1. Ir a la vista de OCR
    await page.goto('/ocr-vault'); // Ajustar ruta según corresponda

    // 2. Simular subida de archivo
    // Usamos el botón mock de la UI
    await page.getByText('Subir Laboratorio').click();

    // 3. Verificar estado PROCESSING sin waitForTimeout
    await expect(page.getByText('Estado de Extracción Celery')).toBeVisible();
    await expect(page.locator('.animate-pulse')).toHaveCount(1, { timeout: 5000 });

    // 4. Dynamic Polling - Esperar a que el backend devuelva PENDING_REVIEW
    // Dado que el mock demora 5-12s, damos timeout generoso
    await expect(page.getByText('Bóveda de Cuarentena (HITL)')).toBeVisible({ timeout: 15000 });

    // 5. Verificar Split View Rendering
    await expect(page.getByText('Reporte de Laboratorio')).toBeVisible(); // Lado Izquierdo (PDF)
    await expect(page.locator('input[type="number"]').first()).toBeVisible(); // Lado Derecho (Form)

    // 6. Realizar Merge Atómico (Simular edición humana)
    const firstInput = page.locator('input[type="number"]').first();
    await firstInput.fill('100'); // Corregimos valor
    await page.getByText('Aprobar Merge Atómico').click();

    // 7. Esperar a que el estado pase a VERIFICADO
    await expect(page.getByText('Auditado y Mergeado')).toBeVisible({ timeout: 5000 });
  });
});
