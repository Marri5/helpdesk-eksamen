# HelpDesk System

Et komplett kundeservicesystem inspirert av Spiceworks, bygget med MERN stack (MongoDB, Express, React, Node.js).

## Funksjoner

- Brukerautentisering (Innlogging/Registrering)
- Rollebasert tilgangskontroll (Bruker/Admin)
- Opprettelse og administrasjon av henvendelser
- Statussporing
- Prioritetsinnstilling
- Kategoritilordning
- Kommentarsystem
- Admin-kontrollpanel med statistikk
- Responsivt brukergrensesnitt

## Tech Stack

### Backend
- Node.js med Express
- MongoDB for database
- JWT for authentisering
- RESTful API
- MVC

### Frontend
- React with hooks and context API
- React Router for routing
- Axios for API requests
- TailwindCSS for UI styling

## Oppsettinstruksjoner

### Forutsetninger
- Node.js
- MongoDB
- npm or yarn

### Backend Oppsett
1. Gå til backend-mappen:
   ```
   cd backend
   ```

2. Installer dependencies:
   ```
   npm install
   ```

3. Opprett en `.env`-fil i backend-mappen med følgende informasjon:
   ```
   PORT=5000
   MONGO_URI=mongodb://10.12.3.88:27017/helpdesk
   JWT_SECRET=skjult_sikkerhetsnøkkel
   JWT_EXPIRE=7d
   COOKIE_EXPIRE=7
   NODE_ENV=development
   ```

4. Start serveren:
   ```
   npm run dev
   ```

### Frontend Oppsett
1. Gå til frontend-mappen:
   ```
   cd frontend
   ```

2. Installer dependencies:
   ```
   npm install
   ```

3. Start React-appen:
   ```
   npm start
   ```

## API Endepunkter

### Autentisering
- `POST /api/auth/register` - Registrer en ny bruker
- `POST /api/auth/login` - Logg inn en bruker
- `GET /api/auth/me` - Hent nåværende bruker
- `GET /api/auth/logout` - Logg ut bruker

### Tickets
- `GET /api/tickets` - Hent alle tickets
- `GET /api/tickets/:id` - Hent en enkelt ticket
- `POST /api/tickets` - Opprett en ny ticket
- `PUT /api/tickets/:id` - Oppdater en ticket
- `DELETE /api/tickets/:id` - Slett en ticket
- `POST /api/tickets/:id/comments` - Legg til en kommentar på en ticket
- `GET /api/tickets/stats` - Hent statistikken på tickets (kun admin)

### Brukere
- `GET /api/users` - Hent alle brukere (kun admin)
- `GET /api/users/:id` - Hent en bruker etter ID (kun admin)
- `PUT /api/users/:id` - Oppdater en bruker (kun admin)
- `DELETE /api/users/:id` - Slett en bruker (kun admin)
