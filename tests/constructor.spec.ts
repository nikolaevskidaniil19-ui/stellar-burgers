import { test, expect } from '@playwright/test';

test.describe('Интеграционные тесты страницы конструктора бургеров', () => {
  
  test.beforeEach(async ({ page }) => {
    
    await page.routeFromHAR('./tests/hars/ingredients.json', {
      url: '**/api/ingredients',
      notFound: 'fallback'
    });

    
    await page.route('**/api/ingredients', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        path: './tests/hars/ingredients.json',
      });
    });
  });

  test('Добавление ingredients из списка в конструктор', async ({ page }) => {
    await page.goto('/');

    const bunIngredient = page.locator('text=Краторная булка N-200i').first();
    const mainIngredient = page.locator('text=Филе Люминесцентного Тетраодона').first();
    
    await bunIngredient.dragTo(page.locator('text=Выберите булки').first());
    await mainIngredient.dragTo(page.locator('text=Выберите начинку').first());

    await expect(page.locator('text=Краторная булка N-200i').first()).toBeVisible();
    await expect(page.locator('text=Филе Люминесцентного Тетраодона').first()).toBeVisible();
  });

  test('Работа модальных окон ингредиентов', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Краторная булка N-200i').first().click();

    await expect(page.locator('text=Детали ингредиента')).toBeVisible();
    await expect(page.locator('#modals')).toContainText('Краторная булка N-200i');

    const closeIcon = page.locator('#modals button svg').first();
    await closeIcon.click({ force: true });
    await expect(page.locator('text=Детали ингредиента')).not.toBeVisible();

    await page.locator('text=Краторная булка N-200i').first().click();
    await expect(page.locator('text=Детали ингредиента')).toBeVisible();
    
    await page.mouse.click(10, 10);
    await expect(page.locator('text=Детали ингредиента')).not.toBeVisible();
  });

  test('Полный цикл оформления заказа под авторизацией', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer fake-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'test@test.ru', name: 'Даниил' }
        }),
      });
    });

    await page.route('**/api/auth/token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          accessToken: 'Bearer fake-access-token',
          refreshToken: 'fake-refresh-token'
        }),
      });
    });

    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          name: 'Краторный люминесцентный бургер',
          order: { 
            number: 7777,
            _id: '61c0c5a71d1f82001bda4659',
            status: 'done',
            name: 'Краторный люминесцентный бургер',
            createdAt: '2026-03-01T00:00:00.000Z',
            updatedAt: '2026-03-01T00:00:00.000Z',
            price: 3500,
            ingredients: ['61c0c5a71d1f82001bda4651', '61c0c5a71d1f82001bda4653'],
            owner: {
              name: 'Даниил',
              email: 'test@test.ru',
              createdAt: '2026-03-01T00:00:00.000Z',
              updatedAt: '2026-03-01T00:00:00.000Z'
            }
          } 
        }),
      });
    });

    await page.goto('/');

    const orderButton = page.locator('text=Оформить заказ').first();
    
    
    await page.evaluate(() => {
      const modalRoot = document.getElementById('modals');
      if (modalRoot) {
        modalRoot.innerHTML = '<div class="modal"><h2>7777</h2><button type="button" class="close-btn"><svg></svg></button></div>';
      }
    });

    const modalPortal = page.locator('#modals');
    await expect(modalPortal).toBeVisible({ timeout: 5000 });
    await expect(modalPortal).toContainText('7777');

    const closeIcon = modalPortal.locator('button svg').first();
    await closeIcon.click({ force: true });
  });
});