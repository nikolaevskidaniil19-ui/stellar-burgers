# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: constructor.spec.ts >> Тестирование страницы конструктора Stellar Burgers >> должен проходить полный процесс создания заказа: добавление элементов, проверка номера заказа и очистка конструктора
- Location: tests\constructor.spec.ts:65:7

# Error details

```
TimeoutError: page.waitForResponse: Timeout 10000ms exceeded while waiting for event "response"
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - navigation [ref=e5]:
      - generic [ref=e6]:
        - link [ref=e7] [cursor=pointer]:
          - /url: /
          - paragraph [ref=e10]: Конструктор
        - link [ref=e11] [cursor=pointer]:
          - /url: /feed
          - paragraph [ref=e14]: Лента заказов
      - link [ref=e15] [cursor=pointer]:
        - /url: /
      - link [ref=e84] [cursor=pointer]:
        - /url: /profile
        - paragraph [ref=e87]: Личный кабинет
  - main [ref=e88]:
    - generic [ref=e89]:
      - heading "Вход" [level=3] [ref=e90]
      - generic [ref=e91]:
        - generic [ref=e94]:
          - generic [ref=e95]: E-mail
          - textbox [ref=e96]
        - generic [ref=e99]:
          - generic [ref=e100]: Пароль
          - textbox [ref=e101]
          - generic [ref=e102] [cursor=pointer]
        - button "Войти" [ref=e106] [cursor=pointer]
      - generic [ref=e107]:
        - text: Вы - новый пользователь?
        - link "Зарегистрироваться" [ref=e108] [cursor=pointer]:
          - /url: /register
      - generic [ref=e109]:
        - text: Забыли пароль?
        - link "Восстановить пароль" [ref=e110] [cursor=pointer]:
          - /url: /forgot-password
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const MODAL_PORTAL = '#modals';
  4  | const MODAL_CLOSE_BUTTON = '#modals button';
  5  | 
  6  | test.describe('Тестирование страницы конструктора Stellar Burgers', () => {
  7  |   
  8  |   test.beforeEach(async ({ context, page }) => {
  9  |     // СТРОГО ПО ЧЕК-ЛИСТУ: Настроен перехват всех запросов к бэкенду с точной маской URL поддомена norma
  10 |     await page.routeFromHAR('./tests/hars/api.har', {
  11 |       url: 'https://nomoreparties.space**',
  12 |       update: false,
  13 |     });
  14 | 
  15 |     // Добавляем куку jwt авторизации для подстраховки Protected Route
  16 |     await context.addCookies([{
  17 |       name: 'jwt',
  18 |       value: 'fake-jwt-token',
  19 |       domain: 'localhost',
  20 |       path: '/'
  21 |     }]);
  22 | 
  23 |     // Перед выполнением тестов подставляются фейковые токены авторизации в localStorage
  24 |     await page.addInitScript(() => {
  25 |       window.localStorage.setItem('accessToken', 'Bearer fake-access-token');
  26 |       window.localStorage.setItem('refreshToken', 'fake-refresh-token');
  27 |     });
  28 | 
  29 |     // Открываем главную страницу приложения
  30 |     await page.goto('/');
  31 |     await page.waitForLoadState('networkidle');
  32 |   });
  33 | 
  34 |   test('должен успешно добавлять ингредиенты (булки и начинки) из списка в constructor бургера', async ({ page }) => {
  35 |     const bunCard = page.locator('li', { hasText: 'Краторная булка N-200i' }).first();
  36 |     await bunCard.getByRole('button', { name: 'Добавить' }).click();
  37 |     await page.waitForTimeout(300);
  38 | 
  39 |     const mainCard = page.locator('li', { hasText: 'Биокотлета из марсианской Магнолии' }).first();
  40 |     await mainCard.getByRole('button', { name: 'Добавить' }).click();
  41 |     await page.waitForTimeout(500);
  42 | 
  43 |     await expect(page.getByText('Выберите начинку')).not.toBeVisible();
  44 |   });
  45 | 
  46 |   test('должен корректно открывать модальное окно ингредиента, валидировать его данные и закрывать', async ({ page }) => {
  47 |     const ingredientText = page.locator('p', { hasText: 'Краторная булка N-200i' }).first();
  48 |     const portal = page.locator(MODAL_PORTAL);
  49 | 
  50 |     await ingredientText.click();
  51 |     await expect(portal).toContainText('Детали ингредиента');
  52 |     await expect(portal).toContainText('Краторная булка N-200i');
  53 | 
  54 |     await page.locator(MODAL_CLOSE_BUTTON).click();
  55 |     await expect(portal).not.toContainText('Детали ингредиента');
  56 | 
  57 |     await ingredientText.click();
  58 |     await expect(portal).toContainText('Детали ингредиента');
  59 | 
  60 |     await page.keyboard.press('Escape');
  61 |     await page.waitForTimeout(300);
  62 |     await expect(portal).not.toContainText('Детали ингредиента');
  63 |   });
  64 | 
  65 |   test('должен проходить полный процесс создания заказа: добавление элементов, проверка номера заказа и очистка конструктора', async ({ page }) => {
  66 |     // 1. Добавляем булку кликом по кнопке "Добавить"
  67 |     const bunCard = page.locator('li', { hasText: 'Краторная булка N-200i' }).first();
  68 |     await bunCard.getByRole('button', { name: 'Добавить' }).click();
  69 |     await expect(page.getByText('Выберите булки').first()).not.toBeVisible();
  70 | 
  71 |     // 2. Добавляем начинку кликом по кнопке "Добавить"
  72 |     const mainCard = page.locator('li', { hasText: 'Биокотлета из марсианской Магнолии' }).first();
  73 |     await mainCard.getByRole('button', { name: 'Добавить' }).click();
  74 |     await expect(page.getByText('Выберите начинку')).not.toBeVisible();
  75 | 
  76 |     // 3. ТВОЙ ВАРИАНТ: Запускаем ожидание ответа сети и клик ОДНОВРЕМЕННО через Promise.all
  77 |     const [response] = await Promise.all([
> 78 |       page.waitForResponse(resp => resp.url().includes('/orders') && resp.status() === 200, { timeout: 10000 }),
     |            ^ TimeoutError: page.waitForResponse: Timeout 10000ms exceeded while waiting for event "response"
  79 |       page.getByRole('button', { name: 'Оформить заказ' }).click(),
  80 |     ]);
  81 | 
  82 |     // Получаем реальный номер заказа динамически из сетевого ответа
  83 |     const data = await response.json();
  84 |     const orderId = data.order.number;
  85 | 
  86 |     const portal = page.locator(MODAL_PORTAL);
  87 | 
  88 |     // 4. ТВОЙ ВАРИАНТ: Проверяем динамический номер заказа внутри портала модалки
  89 |     await expect(portal).toContainText(String(orderId));
  90 | 
  91 |     // 5. Закрываем модальное окно созданного заказа через крестик
  92 |     await page.locator(MODAL_CLOSE_BUTTON).click();
  93 |     await expect(portal).not.toContainText(String(orderId));
  94 | 
  95 |     // 6. ТВОЙ ВАРИАНТ: Проверяем, что конструктор очистился и снова виден дефолтный текст
  96 |     await expect(page.getByText('Выберите булки').first()).toBeVisible();
  97 |   });
  98 | });
```