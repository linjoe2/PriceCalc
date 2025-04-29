import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	// Check for the "Eerst volgende agendapunt" heading
	await expect(page.getByRole('heading', { name: 'Eerst volgende agendapunt' })).toBeVisible();
	// Check for the "Laatst toegevoegde klanten" heading
	await expect(page.getByRole('heading', { name: 'Laatst toegevoegde klanten' })).toBeVisible();
});
