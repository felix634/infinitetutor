import { test, expect } from '@playwright/test';

test.describe('Intake Wizard', () => {
    test('should complete the intake wizard and trigger syllabus generation', async ({ page }) => {
        // Navigate to the landing page
        await page.goto('/');

        // Verify we are on the landing page
        await expect(page.locator('h1')).toContainText('The Infinite Way To Master Anything');

        // Step 1: Topic
        const topicInput = page.getByPlaceholder('e.g. Molecular Gastronomy');
        await topicInput.fill('Quantum Computing');
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 2: Level
        await expect(page.getByText('Your current level?')).toBeVisible();
        await page.getByRole('button', { name: 'Intermediate' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 3: Time
        await expect(page.getByText('Daily time investment?')).toBeVisible();
        // Adjust the slider or just click continue since it has a default
        await page.getByRole('button', { name: 'Generate Syllabus' }).click();

        // Verify Syllabus Generation state (Loading state)
        await expect(page.getByText('Generating...')).toBeVisible();

        // Optional: Wait for completion if backend is expected to respond fast
        // For now, checking the 'Generating...' state is sufficient for 'triggered correctly'
    });
});
