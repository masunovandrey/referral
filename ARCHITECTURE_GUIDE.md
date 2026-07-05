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
- click buttons to load public data

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
- log out

Authenticated users still cannot:

- access another user's private data
- write shared public data unless you explicitly add an admin workflow later

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
- GitHub

Prefer FirebaseUI for login and registration screens because it already handles:

- sign in
- sign up
- password reset
- provider login
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
  title
  description
  visible
  createdAt
  updatedAt
```

```text
/users/{uid}/rows/{rowId}
  title
  description
  createdAt
  updatedAt
```

### Authorization

Authorization must be enforced in Firestore Security Rules:

- everyone can read public rows
- nobody anonymous can write public rows
- authenticated users can read only their own private rows
- authenticated users can create/update/delete only their own private rows

Frontend checks are useful for UX, but rules are the real security boundary.

## Recommended frontend structure

Keep Firebase access separate from UI logic:

```text
src/
  firebase/
    app.js
    auth.js
    authUiConfig.js
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
- buttons to load public data
- list or cards for public data
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

- `listPublicRows()`

### Private data API

Create a small module for user-owned data:

- `listUserRows(uid)`
- `createUserRow(uid, input)`
- `updateUserRow(uid, rowId, input)`
- `deleteUserRow(uid, rowId)`

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

1. Change routing so the default page is a public home page, not forced login.
2. Add a public home UI with auth controls and buttons for loading public data.
3. Create `features/publicRows` modules and render Firestore public rows.
4. Add a protected profile route.
5. Create `features/privateRows` modules for user CRUD.
6. Update tests for the new route behavior.
7. Add deployment configuration for your chosen Pages provider.

## Suggested first implementation target

The best next coding step is:

`Implement public home route with anonymous access and a protected profile route.`

That is the right first step because your intended workflow depends on it before public/private data features can fit cleanly.
