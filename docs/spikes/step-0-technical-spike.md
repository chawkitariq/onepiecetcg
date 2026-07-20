# Étape 0 — Spike technique

Ce spike valide les briques à risque identifiées dans `docs/spec.md` et `docs/plan.md` avant de construire les parcours produit dessus.

## Portée

- Better Auth monté côté NestJS, avec OAuth Google et Discord uniquement.
- Body parser Nest désactivé pour laisser Better Auth traiter les requêtes brutes.
- Cookies de session configurables pour un usage local et cross-domain.
- Colyseus attaché au serveur HTTP NestJS, pas lancé comme service séparé.
- Room de duel minimale : création, deux clients connectés, destruction propre.
- PostgreSQL configuré via TypeORM avec une entité minimale persistée et relue.
- Client Nuxt capable d'appeler l'API avec cookies et de rejoindre une room Colyseus.

## Dépendances à valider avant installation

Le dépôt impose une validation utilisateur avant toute nouvelle dépendance.

### API

- `better-auth`
- `@thallesp/nestjs-better-auth`
- `@nestjs/typeorm`
- `typeorm@1.x`
- `pg`
- `colyseus`
- `@colyseus/schema`
- `@colyseus/ws-transport`

### API dev

- `@colyseus/testing`

### Web

- `colyseus.js`

## Variables d'environnement prévues

### API

```bash
API_PORT=3000
WEB_ORIGIN=http://localhost:3001

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=onepiecetcg
DATABASE_PASSWORD=onepiecetcg
DATABASE_NAME=onepiecetcg

BETTER_AUTH_SECRET=change-me
BETTER_AUTH_URL=http://localhost:3000
SESSION_COOKIE_DOMAIN=
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAME_SITE=lax

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

### Web

```bash
NUXT_PUBLIC_API_BASE=http://localhost:3000
NUXT_PUBLIC_COLYSEUS_ENDPOINT=ws://localhost:3000
```

## Preuves d'acceptation

L'étape 0 est terminée seulement quand ces preuves existent dans l'état courant du projet.

- `pnpm --dir packages/api build` passe avec Better Auth, TypeORM et Colyseus câblés.
- `pnpm --dir packages/api test` inclut une preuve TypeORM qui persiste et relit une entité minimale.
- `pnpm --dir packages/api test` inclut une preuve Colyseus où deux clients rejoignent la même room.
- Une route de session de test répond correctement avec les cookies envoyés par le client.
- Le bootstrap Nest utilise `bodyParser: false`.
- Le serveur Colyseus est attaché au même serveur HTTP que Nest.
- Le frontend Nuxt expose une page ou un composable de diagnostic capable d'appeler l'API avec `credentials: 'include'`.
- Le frontend Nuxt expose une action de diagnostic capable de joindre une room Colyseus locale.

## Notes d'intégration

- Le serveur reste l'unique source de vérité. Le client de diagnostic ne doit pas contenir de logique d'autorité.
- Les endpoints et rooms de spike doivent être faciles à supprimer ou à remplacer à partir de l'étape 1.
- La configuration cross-domain doit rester pilotée par variables d'environnement, pour passer de `localhost` à `api.*` / `app.*` sans changement de code.

## Résultat

Spike réalisé avec `typeorm@1.1.0`, Better Auth monté sur `/api/auth`, Colyseus attaché au serveur HTTP NestJS, et PostgreSQL local via Docker Compose.

Preuves obtenues :

- `pnpm --dir packages/api build` : OK.
- `pnpm --dir packages/api exec jest --runInBand` : OK, 3 suites / 3 tests.
- Test Colyseus : deux clients rejoignent la même room `duel_spike`, puis quittent la room sans client restant.
- Test TypeORM/PostgreSQL : une entité `SpikeNote` est persistée et relue.
- `pnpm --dir packages/web typecheck` : OK.
- `pnpm --dir packages/web build` : OK.
- Runtime API :
  - `GET /spike/session` répond `{"authenticated":false,"user":null}` avec CORS credentials.
  - `GET /api/auth/get-session` répond `null` sans cookie, ce qui valide le montage Better Auth.
  - `GET /api/auth/ok` répond `{"ok":true}`.
  - `GET /spike/typeorm?label=runtime-step-0` persiste et relit la valeur.

Limite volontaire du spike : le callback OAuth complet Google/Discord n'est pas exercé sans identifiants OAuth locaux. L'étape 0 valide donc l'intégration Nest/Better Auth, le montage des routes, le body parser brut, CORS/cookies et l'endpoint de session ; l'authentification OAuth réelle est à couvrir à l'étape 2 avec des credentials de développement.
