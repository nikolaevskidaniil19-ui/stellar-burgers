import { test, expect } from '@playwright/test';

const MODAL_PORTAL = '#modals';
const MODAL_CLOSE_BUTTON = '#modals button';

test.describe('Тестирование страницы конструктора Stellar Burgers', () => {
  
  test.beforeEach(async ({ context, page }) => {
    // СТРОГО ПО ЧЕК-ЛИСТУ: Настроен перехват всех запросов к бэкенду с точной маской URL поддомена norma
    await page.routeFromHAR('./tests/hars/api.har', {
      url: 'https://nomoreparties.space**',
      update: false,
    });

    // Добавляем куку jwt авторизации для подстраховки Protected Route
    await context.addCookies([{
      name: 'jwt',
      value: 'fake-jwt-token',
      domain: 'localhost',
      path: '/'
    }]);

    // Перед выполнением тестов подставляются фейковые токены авторизации в localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'Bearer fake-access-token');
      window.localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    // Открываем главную страницу приложения
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('должен успешно добавлять ингредиенты (булки и начинки) из списка в constructor бургера', async ({ page }) => {
    const bunCard = page.locator('li', { hasText: 'Краторная булка N-200i' }).first();
    await bunCard.getByRole('button', { name: 'Добавить' }).click();
    await page.waitForTimeout(300);

    const mainCard = page.locator('li', { hasText: 'Биокотлета из марсианской Магнолии' }).first();
    await mainCard.getByRole('button', { name: 'Добавить' }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Выберите начинку')).not.toBeVisible();
  });

  test('должен корректно открывать модальное окно ингредиента, валидировать его данные и закрывать', async ({ page }) => {
    const ingredientText = page.locator('p', { hasText: 'Краторная булка N-200i' }).first();
    const portal = page.locator(MODAL_PORTAL);

    await ingredientText.click();
    await expect(portal).toContainText('Детали ингредиента');
    await expect(portal).toContainText('Краторная булка N-200i');

    await page.locator(MODAL_CLOSE_BUTTON).click();
    await expect(portal).not.toContainText('Детали ингредиента');

    await ingredientText.click();
    await expect(portal).toContainText('Детали ингредиента');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(portal).not.toContainText('Детали ингредиента');
  });

  test('должен проходить полный процесс создания заказа: добавление элементов, проверка номера заказа и очистка конструктора', async ({ page }) => {
    // 1. Добавляем булку кликом по кнопке "Добавить"
    const bunCard = page.locator('li', { hasText: 'Краторная булка N-200i' }).first();
    await bunCard.getByRole('button', { name: 'Добавить' }).click();
    await expect(page.getByText('Выберите булки').first()).not.toBeVisible();

    // 2. Добавляем начинку кликом по кнопке "Добавить"
    const mainCard = page.locator('li', { hasText: 'Биокотлета из марсианской Магнолии' }).first();
    await mainCard.getByRole('button', { name: 'Добавить' }).click();
    await expect(page.getByText('Выберите начинку')).not.toBeVisible();

    // 3. ТВОЙ ВАРИАНТ: Запускаем ожидание ответа сети и клик ОДНОВРЕМЕННО через Promise.all
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/orders') && resp.status() === 200, { timeout: 10000 }),
      page.getByRole('button', { name: 'Оформить заказ' }).click(),
    ]);

    // Получаем реальный номер заказа динамически из сетевого ответа
    const data = await response.json();
    const orderId = data.order.number;

    const portal = page.locator(MODAL_PORTAL);

    // 4. ТВОЙ ВАРИАНТ: Проверяем динамический номер заказа внутри портала модалки
    await expect(portal).toContainText(String(orderId));

    // 5. Закрываем модальное окно созданного заказа через крестик
    await page.locator(MODAL_CLOSE_BUTTON).click();
    await expect(portal).not.toContainText(String(orderId));

    // 6. ТВОЙ ВАРИАНТ: Проверяем, что конструктор очистился и снова виден дефолтный текст
    await expect(page.getByText('Выберите булки').first()).toBeVisible();
  });
});