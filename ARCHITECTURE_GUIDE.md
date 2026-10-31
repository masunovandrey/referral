# Referral App Architecture Guide

## Goal

Build a fully static web app with:

- public landing page
- user authentication
- personal profile area
- CRUD for each user's private data
- public data visible to everyone

The app should stay deployable for free and should avoid a custom backend.

## Recommended stack

- Hosting: GitHub Pages or GitLab Pages
- Frontend: Vite + vanilla JavaScript
- Auth: Firebase Authentication
- Database: Cloud Firestore
- Authorization: Firestore Security Rules
- Local testing: Firebase Emulator Suite

## Why Firebase fits this project

Firebase is the most practical option here because it gives you:

- free-tier authentication
- free-tier document database
- client-side SDK for static apps
- security rules for real authorization
- emulator support for local testing

For this workflow, Firebase Auth + Firestore is the correct default choice.

## Core user flows

### 1. Anonymous visitor flow

Any visitor can:

- open the main page
- see login / registration / logout controls
- browse the referral catalog grouped by company
- click a company to copy a random referral link

Anonymous visitors cannot:

- access private user profile data
- create or edit personal data
- write public data

### 2. Authenticated user flow

After login or registration, the user can:

- stay on the main page with public data access
- open a personal profile area
- create private records
- edit private records
- delete private records
- publish or unpublish their own records
- log out

Authenticated users still cannot:

- access another user's private data
- modify or delete another user's public records

## Recommended architecture

### Hosting

Use a static hosting platform:

- GitHub Pages
- or GitLab Pages

Both can host the built Vite output for free.

The frontend remains fully static.

### Authentication

Use Firebase Authentication with:

- email/password
- Google

GitHub sign-in is deferred.

The app uses a custom auth UI instead of FirebaseUI. It covers:

- sign in
- sign up
- password reset
- Google sign-in
- common auth errors

### Database

Use Cloud Firestore with two clear areas:

```text
/publicRows/{rowId}
/users/{uid}/rows/{rowId}
```

Recommended document shapes:

```text
/publicRows/{rowId}
  companyName
  companyKey
  category
  referralLink
  bonusDescription
  ownerUid
  sourceRowId
  clicks
  createdAt
  updatedAt
```

```text
/users/{uid}/rows/{rowId}
  companyName
  companyKey
  category
  referralLink
  bonusDescription
  isPublished
  publicRowId
  createdAt
  updatedAt
```

`publicRowId = uid + '_' + companyKey`, where `companyKey` is the encoded
normalized company name. Only published rows exist in `/publicRows`.

### Authorization

Authorization must be enforced in Firestore Security Rules:

- everyone can read public rows
- nobody anonymous can write public rows
- authenticated users with a verified email can read only their own private rows
- authenticated users with a verified email can create/update/delete only their own private rows
- unverified users cannot access private rows, even their own

Frontend checks are useful for UX, but rules are the real security boundary.

## Recommended frontend structure

Keep Firebase access separate from UI logic:

```text
src/
  firebase/
    app.js
    auth.js
    firestore.js
  features/
    publicRows/
      publicRows.api.js
      publicRows.ui.js
    privateRows/
      privateRows.api.js
      privateRows.ui.js
  app.js
  router.js
  main.js
```

## Recommended pages or views

### Public home page

Should contain:

- app title
- short description
- login/register area
- logout control when signed in
- referral catalog grouped by company
- click on a company copies a random referral link
- link or button to open personal profile when signed in

### Personal profile page

Should contain:

- signed-in user identity
- list of the user's private rows
- form to add a row
- controls to edit a row
- controls to delete a row

## Data access design

### Public data API

Create a small module for public reads, for example:

- `listPublicRows()` — loads up to 200 published rows.
- grouping and random selection live in `publicRows.model.js`.

### Private data API

Create a small module for user-owned data:

- `listUserRows(uid)`
- `createUserRow(uid, input)`
- `updateUserRow(uid, rowId, input)`
- `deleteUserRow(uid, rowId)`
- `publishUserRow(uid, rowId)`
- `unpublishUserRow(uid, rowId)`

Do not call Firestore directly inside click handlers everywhere. Keep access in API modules.

## Minimal route plan

Recommended routes:

- `#/` or `#/home` for public home
- `#/login` only if you want a dedicated auth route
- `#/profile` for personal area

Behavior:

- anonymous user can always view home
- anonymous user trying `#/profile` gets redirected to home or login
- authenticated user can view home and profile

## Best free deployment choice

You asked whether the project can be fully free. Yes.

Recommended free model:

- GitHub Pages or GitLab Pages for hosting
- Firebase Authentication for auth
- Firestore on Firebase Spark plan for data

This is simpler than building your own backend and is realistic for a small app.

## Important constraint

Do not use secrets in frontend code.

Allowed:

- Firebase web config

Forbidden:

- service account keys
- admin credentials
- private backend keys

## Implementation phases

### Phase 1. Fix navigation model

Goal:

- make the public home page the default route
- keep public data accessible without login
- keep profile protected

Deliverables:

- router allows anonymous access to home
- authenticated users can still open profile
- logout returns user to home

### Phase 2. Build public data feature

Goal:

- show public rows to any visitor

Deliverables:

- `publicRows.api.js`
- `publicRows.ui.js`
- button(s) to load public rows
- public rows list rendering

### Phase 3. Build private profile feature

Goal:

- authenticated user can manage their own rows

Deliverables:

- `privateRows.api.js`
- `privateRows.ui.js`
- create/edit/delete form and handlers
- profile page rendering

### Phase 4. Tighten security and test coverage

Goal:

- verify auth and Firestore rules match the intended behavior

Deliverables:

- keep current rules tests
- add missing tests if the model changes
- add unit tests for route and UI state logic

### Phase 5. Deployment setup

Goal:

- build static output and publish it for free

Deliverables:

- Pages workflow or CI config
- correct Vite base path if needed
- production Firebase config values

## Immediate next steps

Do these next, in this order:

1. Add click counters for copied referral links.
2. Harden Firestore rules validation for private and public rows.
3. Add profile view/edit/delete UX.
4. Add integration and end-to-end tests.
5. Polish responsive layout and deployment checks.

## Suggested first implementation target

The best next coding step is:

`Add click counters for the public company catalog.`

That builds directly on the published catalog and keeps the app within the
Firebase free tier.
