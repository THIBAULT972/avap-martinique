# 🏅 AVAP Martinique — Site + Quiz Interactif (Supabase Realtime)

Site Next.js de l'association AVAP avec quiz temps réel compatible Vercel via Supabase.

---

## 🚀 Installation complète

### Étape 1 : Installer les dépendances

```bash
npm install
```

### Étape 2 : Configurer Supabase

1. Va sur [supabase.com](https://supabase.com) → ton projet
2. **SQL Editor** → copie-colle le contenu de `sql/setup.sql` → **Run**
3. **Settings > API** → récupère :
   - `Project URL` → c'est ton `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → c'est ton `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → c'est ton `SUPABASE_SERVICE_ROLE_KEY`

### Étape 3 : Activer Realtime

1. Va dans **Database > Replication**
2. Clique sur **supabase_realtime** (la publication)
3. Vérifie que la table **quiz_events** est bien cochée
4. Si elle n'apparaît pas, le script SQL l'a déjà ajoutée, tu n'as rien à faire

### Étape 4 : Créer le fichier .env.local

```bash
cp .env.local.example .env.local
```

Remplis avec tes vraies clés :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Étape 5 : Ajouter tes images

Place tes 3 images dans `public/images/` :
- **logo.png** — Logo AVAP
- **team.png** — Photo Team Boulogne Yang-Ting
- **cidolit.png** — Logo partenaire

### Étape 6 : Lancer

```bash
npm run dev
```

→ Site sur http://localhost:3000

---

## 📁 Structure du Projet

```
avap-martinique/
├── app/
│   ├── layout.tsx              ← Navbar + Footer
│   ├── page.tsx                ← Page d'accueil
│   ├── globals.css             ← Tailwind + custom
│   ├── quiz/
│   │   ├── page.tsx            ← /quiz (joueurs)
│   │   ├── admin/page.tsx      ← /quiz/admin (animateur)
│   │   └── display/page.tsx    ← /quiz/display (projecteur)
│   ├── photos/page.tsx
│   ├── contact/page.tsx
│   ├── mentions-legales/page.tsx
│   └── api/quiz/route.ts       ← API serverless
├── components/
│   ├── quiz/QuizEngine.tsx     ← Composant quiz (3 vues)
│   ├── MobileMenu.tsx
│   └── CookieBanner.tsx
├── lib/
│   └── supabase.ts             ← Clients Supabase (browser + server)
├── data/
│   └── questions.json          ← 20 questions
├── sql/
│   └── setup.sql               ← Script SQL à exécuter dans Supabase
├── public/images/               ← ⚠️ Tes images ici
└── .env.local                   ← ⚠️ Tes clés Supabase ici
```

---

## 🎮 Comment fonctionne le Quiz

### Architecture Supabase

```
┌──────────┐    POST /api/quiz     ┌──────────────┐
│  Player  │ ───────────────────→ │  API Route   │
│  Admin   │                       │  (Vercel)    │
│  Display │ ←─── Realtime ─────── │              │
└──────────┘    quiz_events table  └──────┬───────┘
                                          │
                                   ┌──────▼───────┐
                                   │   Supabase   │
                                   │  PostgreSQL  │
                                   │  + Realtime  │
                                   └──────────────┘
```

1. **Les actions** (join, answer, nextQuestion...) passent par l'API Route (`POST /api/quiz`)
2. L'API écrit l'état dans PostgreSQL (tables `players`, `answers`, `game_sessions`)
3. L'API insère un **événement** dans la table `quiz_events`
4. **Supabase Realtime** détecte l'INSERT et broadcast à tous les clients connectés
5. Le QuizEngine met à jour son state en temps réel

### Timer

Le timer est géré **côté client** : l'API stocke `question_start_time` et les clients calculent le temps restant. Quand le timer atteint 0, le client admin/display appelle `timerExpired` pour déclencher la révélation.

### Session en classe

1. Ouvre `/quiz/display` sur le PC projecteur → QR code s'affiche
2. Ouvre `/quiz/admin` sur ton téléphone
3. Les élèves scannent le QR → arrivent sur `/quiz`
4. Clique **"Question suivante"** dans Admin
5. 30 secondes par question
6. Podium final avec confettis 🎉

---

## 🚀 Déploiement Vercel

1. Push sur GitHub
2. Connecte le repo sur [vercel.com](https://vercel.com)
3. Ajoute les **Environment Variables** :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → `https://ton-domaine.vercel.app`
4. Deploy !

---

## 🛠 Stack

| Techno | Usage |
|--------|-------|
| Next.js 14 | Framework (App Router) |
| Tailwind CSS | Style |
| Framer Motion | Animations |
| Supabase | Base de données + Realtime |
| canvas-confetti | Confettis podium |
| QRCode | Génération QR serveur |
