# Referral App — General Development Plan

Статус: рабочий документ. Обновляется по мере принятия решений.

## 1. Архитектура (как есть)

Проект полностью статический и бесплатный в хостинге:

```text
GitHub Pages (статика: HTML/CSS/JS из dist/)
        |
        | Firebase JS SDK (в браузере)
        v
Firebase Auth  +  Cloud Firestore  +  Firestore Security Rules
```

- **GitHub Pages** — хостинг собранного Vite-фронтенда. Бесплатно.
- **Firebase Auth** — логин/регистрация/сброс пароля. Бесплатно (Spark).
- **Cloud Firestore** — база данных. Бесплатно в пределах Spark-лимитов.
- **Security Rules** — единственный настоящий слой авторизации.
- **Своего бэкенда нет.** Cloud Functions не используем (требует Blaze).
- Единственная возможная будущая трата — доменное имя.

Ограничения бесплатного тарифа, которые влияют на решения:
- нет Cloud Functions → нельзя делать серверные счётчики, модерацию, cron;
- всё, что пишется в Firestore, должно быть разрешено правилами для клиента;
- нельзя доверять фронтенду, но правила Firestore ограничены по выразительности.

## 2. Продуктовая модель

Приложение — каталог реферальных программ.

- **Private rows** (`/users/{uid}/rows/{rowId}`) — личная коллекция пользователя.
  Поля: `companyName`, `category`, `referralLink`, `bonusDescription`,
  `isPublished`, `publicRowId`, `createdAt`, `updatedAt`.
- **Public rows** (`/publicRows/{rowId}`) — опубликованные записи, видимые всем.
  Поля: `companyName`, `category`, `referralLink`, `bonusDescription`,
  `ownerUid`, `sourceRowId`, `clicks`, `createdAt`, `updatedAt`.

Ключевое решение: **в `publicRows` лежат только реально опубликованные записи.**
Никаких черновиков и поля `visible` в публичной коллекции. Наличие документа
в `publicRows` = запись публична. Это убирает утечку «скрытых» записей через
прямой запрос.

Публикация — это копирование private row в publicRows с сохранением связи
`sourceRowId` ↔ `publicRowId`. Private row остаётся источником правды.

## 3. Принятые решения

| # | Вопрос | Решение |
|---|--------|---------|
| D1 | Кто наполняет публичный каталог? | Пользователь публикует свою private row (Publish/Unpublish) |
| D2 | Что такое «Featured»? | Убрать. На MVP «Recent» + фильтр по категории |
| D3 | Что такое `views`/`clicks`? | Счётчик кликов по реферальной ссылке. Делаем сразу |
| D4 | FirebaseUI? | Не использовать. Удалить зависимость и `authUiConfig.js`, обновить AGENTS.md |
| D5 | Профиль: как редактировать? | Режим просмотра + Edit/Delete, подтверждение удаления, inline-валидация |
| D6 | Email verification? | Отправлять при регистрации и требовать подтверждённый email для всего профиля (private rows) и публикации |
| D7 | GitHub OAuth | Отложен. Не входит в текущий план |

### Следствия D6 (email verification)

- Без `email_verified == true` пользователь не попадает в `#/profile`.
- Firestore Rules требуют `request.auth.token.email_verified == true` для
  `/users/{uid}/rows/{rowId}` и для записи в `publicRows`.
- На главной для неподтверждённых: баннер «Подтвердите email», кнопки
  Resend и «Я подтвердил» (перезагрузка пользователя + refresh токена).
- Google-аккаунты считаются подтверждёнными автоматически.
- Уже существующие неподтверждённые пользователи будут заблокированы от профиля;
  при деплое нужно учесть это как осознанное изменение поведения.

## 4. Фазы разработки

Порядок важен: сначала гигиена и auth, затем публичный каталог, затем
ужесточение правил и тесты.

### Phase 0. Гигиена репозитория и CI

- [x] Удалить `firestore-debug.log` из git, добавить в `.gitignore`.
- [x] Добавить `dist/`, `firestore-debug.log`, `.firebase/` в `.gitignore`
      (проверить, что ничего лишнего не отслеживается).
- [x] Добавить CI-job с unit + rules тестами (отдельно от деплоя).
- [x] Деплой запускать только после зелёных тестов.

Acceptance: `git ls-files` не содержит логов/сборки; PR/push в `main` гоняет тесты.

### Phase 1. Исправить auth-UI на главной

- [x] Для авторизованного пользователя не рендерить форму email/Google.
- [x] Показывать identity + Log out + View profile.
- [x] Для анонимного — форма входа/регистрации и Google.
- [x] Unit-тесты на view-model состояния главной.
- [x] Разметка главной вынесена в `src/features/home/homeView.js` + DOM-тесты.

Acceptance: залогиненный пользователь не видит нерабочую форму логина.

### Phase 2. Убрать FirebaseUI

- [ ] Удалить `firebaseui` из `package.json`.
- [ ] Удалить `src/firebase/authUiConfig.js`.
- [ ] Обновить `AGENTS.md`: зафиксировать выбранный подход к auth UI.
- [ ] Проверить, что сборка и тесты не ссылаются на FirebaseUI.

Acceptance: нет мёртвого кода и лишней зависимости.

### Phase 3. Email verification (обязательно для профиля)

- [ ] При регистрации вызывать `sendEmailVerification`.
- [ ] На главной для неподтверждённых: баннер «Подтвердите email».
- [ ] Кнопки Resend и «Я подтвердил» (`user.reload()` + `getIdToken(true)`).
- [ ] Роутер: без `emailVerified` не пускать в `#/profile`.
- [ ] Firestore Rules: `request.auth.token.email_verified == true` для
      `/users/{uid}/rows/**` и для записи в `publicRows`.
- [ ] Понятное сообщение при `permission-denied` из-за неподтверждённого email.
- [ ] Unit-тесты на состояние verification и роутер.

Acceptance: неподтверждённый пользователь видит баннер и не может открыть
профиль/создать private row; после подтверждения доступ появляется.
Google-пользователи проходят сразу.

### Phase 4. Публичный каталог (основная фича)

Data/API:
- [ ] `publishUserRow(uid, rowId)` — создаёт/обновляет `publicRows` из private row.
- [ ] `unpublishUserRow(uid, rowId)` — удаляет public-копию.
- [ ] `listPublicRows({ category, sort, limit })` — recent / by category.
- [ ] При редактировании private row обновлять и public-копию, если опубликована.
- [ ] При удалении private row удалять public-копию.

Rules:
- [ ] Читать `publicRows` может любой.
- [ ] Создавать public-копию может только владелец (`ownerUid == auth.uid`).
- [ ] Обновлять/удалять public-копию может только владелец.
- [ ] Валидация полей public-копии (типы, длины, допустимые категории, URL).
- [ ] `sourceRowId` должен ссылаться на существующую private row владельца.

UI:
- [ ] На карточке private row — кнопка Publish / Unpublish и статус.
- [ ] На главной — реальный список public rows (без placeholder).
- [ ] Карточка public row: company, category, bonus, кнопка Open referral link.
- [ ] Фильтр по категории; «Recent» по `createdAt desc`.
- [ ] Убрать неоднозначную кнопку Featured (или заменить на Popular позже).

Tests:
- [ ] Rules-тесты на publish/unpublish/ownership.
- [ ] Unit-тесты нормализации и фильтров public rows.
- [ ] Integration-тесты API на эмуляторе.

Acceptance: пользователь публикует свою запись и видит её на главной без логина;
чужую запись изменить/удалить нельзя.

### Phase 5. Клики по реферальной ссылке (делаем сразу)

- [ ] Метрика: клик по кнопке «Open referral link» в public-карточке.
- [ ] `incrementClicks(publicRowId)` через `increment(1)`.
- [ ] Правило: анонимный и авторизованный пользователь может изменить **только**
      `clicks` и **только** на `+1`.
- [ ] Владелец при редактировании контента не может менять `clicks`
      (правило требует `clicks` без изменений).
- [ ] Показывать clicks в public-карточке и в private-карточке, если опубликована.
- [ ] Зафиксировать ограничение: от накрутки на бесплатном тарифе не защищает.

Acceptance: клик увеличивает счётчик на 1; другие поля через это правило
изменить нельзя; владелец не может подменить счётчик при редактировании.

### Phase 6. UX профиля

- [ ] Карточка в режиме просмотра: поля + Edit/Delete.
- [ ] Edit открывает форму; Cancel возвращает в просмотр.
- [ ] Delete с подтверждением (диалог).
- [ ] Inline-валидация обязательных полей и URL.
- [ ] Единый feedback/toast вместо перерисовки всего списка.
- [ ] Пустые состояния и состояния загрузки/ошибки.

Acceptance: редактирование и удаление предсказуемы, без случайных удалений.

### Phase 7. Ужесточение Security Rules

- [ ] Валидация private rows: только известные поля, типы, максимальные длины,
      `category` из списка, `referralLink` — http(s).
- [ ] Валидация public rows: те же поля + `ownerUid`, `sourceRowId`, `clicks`.
- [ ] Запрет менять `ownerUid`, `sourceRowId`, `createdAt` при update.
- [ ] Запрет произвольных полей (`affectedKeys().hasOnly([...])`).
- [ ] Тесты на каждое ограничение.

Пример валидации категории и URL:

```js
function isValidRow(data) {
  return data.companyName is string
      && data.companyName.size() > 0
      && data.companyName.size() <= 120
      && data.category in [
        'e-commerce & marketplaces', 'fashion & accessories', 'beauty',
        'health', 'wellness & fitness', 'food', 'travel',
        'mobility & transportation', 'fintech', 'insurance',
        'telecom & connectivity', 'utilities & home', 'real estate',
        'software', 'education', 'entertainment', 'games', 'pet',
        'baby & family'
      ]
      && data.referralLink is string
      && data.referralLink.matches('^https?://.+')
      && data.bonusDescription is string
      && data.bonusDescription.size() <= 1000;
}
```

Пример правил для private и public rows (включая verification и clicks):

```js
match /users/{uid}/rows/{rowId} {
  allow read, create, update, delete: if request.auth != null
    && request.auth.uid == uid
    && request.auth.token.email_verified == true
    && (request.method == 'delete' || isValidRow(request.resource.data));
}

match /publicRows/{rowId} {
  allow read: if true;

  allow create: if request.auth != null
    && request.auth.token.email_verified == true
    && request.resource.data.ownerUid == request.auth.uid
    && isValidRow(request.resource.data)
    && exists(/databases/$(database)/documents/users/$(request.auth.uid)/rows/$(request.resource.data.sourceRowId));

  // Владелец редактирует контент, но не трогает clicks/owner/sourceRowId.
  allow update: if request.auth != null
    && request.auth.token.email_verified == true
    && resource.data.ownerUid == request.auth.uid
    && request.resource.data.ownerUid == resource.data.ownerUid
    && request.resource.data.sourceRowId == resource.data.sourceRowId
    && request.resource.data.clicks == resource.data.clicks
    && isValidRow(request.resource.data);

  // Любой (включая анонимного) может увеличить только clicks на 1.
  allow update: if request.resource.data.diff(resource.data).affectedKeys()
                  .hasOnly(['clicks'])
    && request.resource.data.clicks == resource.data.clicks + 1;

  allow delete: if request.auth != null
    && request.auth.token.email_verified == true
    && resource.data.ownerUid == request.auth.uid;
}
```

Примечания:
- `exists(...)` для `sourceRowId` добавляет одно чтение на публикацию/обновление.
- Несколько `allow update` объединяются по OR: владелец проходит по первому,
  клик — по второму.
- `isValidRow` должна допускать служебные поля (`ownerUid`, `sourceRowId`,
  `clicks`, timestamps) отдельно для public и private.

Acceptance: нельзя записать мусор, подменить владельца, изменить чужие данные
или накрутить `clicks` больше чем на 1 за операцию.

### Phase 8. Тестирование

- [ ] Unit: модели, view-models, нормализация, роутер.
- [ ] Rules: public read, ownership, publish/unpublish, validation, clicks,
      email verification.
- [ ] Integration (эмулятор): API publish/list/update/delete/incrementClicks.
- [ ] E2E (Playwright, Auth + Firestore emulator):
      аноним видит каталог; регистрация; блокировка профиля без verification;
      создание private row; публикация; клик по ссылке; редактирование;
      удаление; logout; защита профиля.
- [ ] Всё в CI.

Acceptance: критические флоу покрыты, тесты блокируют деплой при падении.

### Phase 9. Полировка и деплой

- [ ] Проверить GitHub Pages деплой и `base: './'`.
- [ ] Проверить, что env-секреты не попадают в репозиторий.
- [ ] Адаптивность и доступность (labels, focus, aria-live уже частично есть).
- [ ] Позже: кастомный домен.
- [ ] README — когда продукт стабилизируется.

## 5. Что осознанно не делаем сейчас

- GitHub OAuth — отложен.
- Cloud Functions, Admin SDK, платные сервисы — запрещены.
- Модерация/админ-панель — только если появится реальная потребность.
- Account linking, сложные OAuth-сценарии — позже.
- Полнотекстовый поиск (в Firestore дорого/сложно) — позже или через Algolia.

## 6. Порядок ближайших шагов

Решения D1–D6 зафиксированы.

1. Phase 0 (гигиена + CI).
2. Phase 1 (auth UI на главной).
3. Phase 2 (FirebaseUI cleanup).
4. Phase 3 (email verification, блокировка профиля).
5. Phase 4 (публичный каталог) — самая крупная часть.
6. Phase 5 (клики) сразу после публичного каталога.
7. Phase 7 + 8 (rules hardening + тесты) параллельно с Phase 4–5.
8. Phase 6 и 9 после основного функционала.
