# Referral App — General Development Plan

Статус: рабочий документ. Обновляется по мере принятия решений.

## Текущий статус

Обновлено: 2026-10-31.

- Phase 0–5 завершены.
- Последние коммиты:
  - `f8c1bf4` — Phase 4: публичный каталог по компаниям.
  - `bd17183` — уточнение ошибки `permission-denied` и деплоя Firestore rules.
- Firestore rules для Phase 4 и 5 задеплоены вручную.
- Phase 5 (клики) реализована, локальные тесты прошли.
- Phase 6 (UX профиля) реализована, локальные тесты прошли.
- Phase 7 (ужесточение Security Rules) реализована, локальные тесты прошли.
- Следующий шаг: Phase 8 (тестирование).
- Интеграционные тесты API отложены до Phase 8.

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

GitHub Pages деплоит только фронтенд. Изменения `firestore.rules` не применяются
автоматически: после правок нужно выполнить `npm run deploy:rules` с выбранным
Firebase-проектом. Иначе production продолжит работать со старыми правилами,
и публикация будет падать с `permission-denied`.

Ограничения бесплатного тарифа, которые влияют на решения:
- нет Cloud Functions → нельзя делать серверные счётчики, модерацию, cron;
- всё, что пишется в Firestore, должно быть разрешено правилами для клиента;
- нельзя доверять фронтенду, но правила Firestore ограничены по выразительности.

## 2. Продуктовая модель

Приложение — каталог реферальных программ.

- **Private rows** (`/users/{uid}/rows/{rowId}`) — личная коллекция пользователя.
  Поля: `companyName`, `companyKey`, `category`, `referralLink`, `bonusDescription`,
  `isPublished`, `publicRowId`, `createdAt`, `updatedAt`.
- **Public rows** (`/publicRows/{rowId}`) — опубликованные записи, видимые всем.
  Поля: `companyName`, `companyKey`, `category`, `referralLink`, `bonusDescription`,
  `ownerUid`, `sourceRowId`, `clicks`, `createdAt`, `updatedAt`.

`companyKey = encodeURIComponent(companyName.trim().toLowerCase().replace(/\s+/g, ' '))`.
`publicRowId = uid + '_' + companyKey`. Это делает ID детерминированным и позволяет
правилам запретить второй публичный документ на ту же компанию у того же пользователя.

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
| D2 | Что такое «Featured»? | Убрать. На MVP каталог группируется по компаниям; фильтр по категории позже |
| D3 | Что такое `views`/`clicks`? | Счётчик кликов по реферальной ссылке. Делаем в Phase 5 |
| D4 | FirebaseUI? | Не использовать. Удалить зависимость и `authUiConfig.js`, обновить AGENTS.md |
| D5 | Профиль: как редактировать? | Режим просмотра + Edit/Delete, подтверждение удаления, inline-валидация |
| D6 | Email verification? | Отправлять при регистрации и требовать подтверждённый email для всего профиля (private rows) и публикации |
| D7 | GitHub OAuth | Отложен. Не входит в текущий план |
| D8 | Как устроен публичный каталог? | Группировка по компаниям; клик по компании копирует случайную ссылку. До 200 ссылок, загрузка одним запросом |

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

- [x] Удалить `firebaseui` из `package.json` и `package-lock.json`.
- [x] Удалить `src/firebase/authUiConfig.js`.
- [x] Удалить мёртвый CSS-селектор `.firebaseui-container`.
- [x] Обновить `AGENTS.md` и `ARCHITECTURE_GUIDE.md`: кастомный auth UI.
- [x] Проверить, что сборка и тесты не ссылаются на FirebaseUI.

Acceptance: нет мёртвого кода и лишней зависимости.

### Phase 3. Email verification (обязательно для профиля)

- [x] При регистрации вызывать `sendEmailVerification`.
- [x] На главной для неподтверждённых: баннер «Подтвердите email».
- [x] Кнопки Resend и «Я подтвердил» (`user.reload()` + `getIdToken(true)`).
- [x] Роутер: без `emailVerified` не пускать в `#/profile`.
- [x] Firestore Rules: `request.auth.token.email_verified == true` для
      `/users/{uid}/rows/**` и для записи в `publicRows`.
- [x] Понятное сообщение при `permission-denied` из-за неподтверждённого email.
- [x] Unit-тесты на состояние verification и роутер.
- [x] Continue URL письма ведёт обратно в приложение (origin + pathname).

Acceptance: неподтверждённый пользователь видит баннер и не может открыть
профиль/создать private row; после подтверждения доступ появляется.
Google-пользователи проходят сразу.

### Phase 4. Публичный каталог по компаниям (основная фича)

Data/API:
- [x] `publishUserRow(uid, rowId)` — upsert public-копии с детерминированным ID.
- [x] `unpublishUserRow(uid, rowId)` — удаляет public-копию.
- [x] `listPublicRows()` — до 200 документов, без orderBy, группировка в браузере.
- [x] При редактировании опубликованной private row обновлять public-копию;
      при смене компании — удалять старый public-документ и создавать новый.
- [x] При удалении private row удалять public-копию.
- [x] Запрещать публикацию второй строки на ту же компанию у того же пользователя.

Rules:
- [x] Читать `publicRows` может любой.
- [x] Создавать/обновлять/удалять public-копию может только verified владелец.
- [x] `rowId == uid + '_' + companyKey`, `clicks == 0` при создании.
- [x] `sourceRowId` ссылается на существующую private row владельца.
- [x] Владелец не может менять `ownerUid`, `sourceRowId`, `companyKey`, `clicks`, `createdAt`.
- [x] Базовая валидация полей public-копии (типы, длины, URL).

UI:
- [x] На карточке private row — статус Published / Not published и кнопка Publish / Unpublish.
- [x] На главной каталог загружается автоматически для всех пользователей.
- [x] Карточка компании: название, категории, количество ссылок.
- [x] Клик по названию компании копирует случайную ссылку из этой компании.
- [x] Ссылки не рендерятся в DOM; хранятся только в JS-массиве.
- [x] Пустое состояние и ошибка загрузки каталога.

Tests:
- [x] Unit: `buildCompanyKey`, `buildPublicRowId`, нормализация, группировка, random pick.
- [x] Unit: private row publish state, home view/model.
- [x] Rules: read, create ownership, deterministic ID, source existence,
      update/delete ownership, clicks/owner/source immutability.
- [ ] Integration-тесты API на эмуляторе — отложены до Phase 8.

Acceptance: пользователь публикует запись и видит компанию на главной без логина;
клик по компании копирует одну случайную ссылку; чужую запись изменить/удалить нельзя.
Старые publicRows со схемой `title/description/visible` не отображаются и требуют
удаления или переопубликации.

### Phase 5. Клики по реферальной ссылке (после Phase 4)

- [x] Метрика: клик по карточке компании, который копирует случайную ссылку.
- [x] `incrementPublicRowClicks(publicRowId)` через `increment(1)` для выбранной строки.
- [x] Правило: анонимный и авторизованный пользователь может изменить **только**
      `clicks` и **только** на `+1`.
- [x] Владелец при редактировании контента не может менять `clicks`
      (правило требует `clicks` без изменений).
- [x] Показывать clicks в private-карточке, если опубликована.
- [x] Зафиксировать ограничение: от накрутки на бесплатном тарифе не защищает.

Acceptance: клик увеличивает счётчик на 1; другие поля через это правило
изменить нельзя; владелец не может подменить счётчик при редактировании.

Ограничение: счётчик клиентский, поэтому его можно накрутить повторными
кликами. Для бесплатного тарифа это сознательно допускается.

### Phase 6. UX профиля

- [x] Карточка в режиме просмотра: поля + Edit/Delete.
- [x] Edit открывает форму; Cancel возвращает в просмотр.
- [x] Delete с подтверждением (диалог).
- [x] Inline-валидация обязательных полей и URL.
- [x] Единый feedback/toast вместо перерисовки всего списка.
- [x] Пустые состояния и состояния загрузки/ошибки.

Acceptance: редактирование и удаление предсказуемы, без случайных удалений.

### Phase 7. Ужесточение Security Rules

- [x] Валидация private rows: только известные поля, типы, максимальные длины,
      `category` из списка, `referralLink` — http(s).
- [x] Валидация public rows: те же поля + `ownerUid`, `sourceRowId`, `clicks`.
- [x] Запрет менять `ownerUid`, `sourceRowId`, `createdAt` при update.
- [x] Запрет произвольных полей (`affectedKeys().hasOnly([...])`).
- [x] Тесты на каждое ограничение.

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

Решения D1–D8 зафиксированы.

1. [x] Phase 0 (гигиена + CI).
2. [x] Phase 1 (auth UI на главной).
3. [x] Phase 2 (FirebaseUI cleanup).
4. [x] Phase 3 (email verification, блокировка профиля).
5. [x] Phase 4 (публичный каталог по компаниям).
6. [x] Phase 5 (клики по реферальным ссылкам).
7. [ ] **Phase 8 (тестирование) — следующий шаг.**
8. [ ] Phase 9 после основного функционала.
