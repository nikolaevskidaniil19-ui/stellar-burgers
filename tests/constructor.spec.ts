import { test, expect } from '@playwright/test';
import fs from 'fs';

const har = JSON.parse(fs.readFileSync('tests/hars/api.har', 'utf-8'));
const entries = har.log.entries;

test.describe('Конструктор бургера — интеграционные тесты', () => {
  test.beforeEach(async ({ page }) => {
    // Перехват запросов к API с подстановкой ответов из HAR-файла
    await page.route('https://nomoreparties.space/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      const entry = entries.find(
        (e: { request: { url: string; method: string } }) =>
          e.request.url === url && e.request.method === method
      );
      if (entry) {
        await route.fulfill({
          status: entry.response.status,
          contentType: entry.response.content.mimeType,
          body: entry.response.content.text
        });
      } else {
        await route.fallback();
      }
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'fake-refresh-token');
      document.cookie = 'accessToken=Bearer%20fake-access-token; path=/';
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('должен добавлять булку и начинку в конструктор', async ({ page }) => {
    await expect(page.getByText('Краторная булка N-200i')).toBeVisible();

    const bunCard = page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' })
      .first();
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByText('Краторная булка N-200i (верх)')).toBeVisible();
    await expect(page.getByText('Краторная булка N-200i (низ)')).toBeVisible();

    const mainCard = page
      .locator('li')
      .filter({ hasText: 'Биокотлета из марсианской хлореллы' })
      .first();
    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByText('Выберите начинку')).not.toBeVisible();
  });

  test('должен открывать модальное окно ингредиента с верными данными и закрывать по крестику', async ({
    page
  }) => {
    await expect(page.getByText('Краторная булка N-200i')).toBeVisible();

    await page
      .locator('a[href="/ingredients/643d69a5c3f7b9001cfa093c"]')
      .click();

    const modal = page.locator('#modals');

    await expect(modal).toContainText('Краторная булка N-200i');
    await expect(modal).toContainText('Калории, ккал');
    await expect(modal).toContainText('420');
    await expect(modal).toContainText('Белки, г');
    await expect(modal).toContainText('80');

    await modal.locator('button').first().click();
    await expect(modal).not.toContainText('Краторная булка N-200i');
  });

  test('должен закрывать модальное окно ингредиента по клику на оверлей', async ({
    page
  }) => {
    await expect(page.getByText('Краторная булка N-200i')).toBeVisible();

    await page
      .locator('a[href="/ingredients/643d69a5c3f7b9001cfa093c"]')
      .click();

    const modal = page.locator('#modals');
    await expect(modal).toContainText('Краторная булка N-200i');

    await page.mouse.click(5, 5);

    await expect(modal).not.toContainText('Краторная булка N-200i');
  });

  test('должен создать заказ, показать номер и очистить конструктор', async ({
    page
  }) => {
    await expect(page.getByText('Краторная булка N-200i')).toBeVisible();

    const bunCard = page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' })
      .first();
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    const mainCard = page
      .locator('li')
      .filter({ hasText: 'Биокотлета из марсианской хлореллы' })
      .first();
    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    const sauceCard = page
      .locator('li')
      .filter({ hasText: 'Соус Фирменный' })
      .first();
    await sauceCard.getByRole('button', { name: 'Добавить' }).click();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

     const modal = page.locator('#modals');
    await expect(modal).toContainText('12345');

    await modal.locator('button').first().click();
    await expect(modal).not.toContainText('12345');

    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();
  });
});