# BookApp Frontend (React + Vite + Tailwind)

This frontend is scaffolded to work with your provided backend.

## Setup

1. Install dependencies:

```
cd frontend_bookapp
npm install
```

2. Configure backend base URL by creating a `.env` file in the project root:

```
VITE_API_BASE=http://localhost:8080
```

3. Run dev server:

```
npm run dev
```

## Notes
- The frontend expects endpoints like `/books`, `/books/:id`, `/users/login`, `/users/register`, `/cart`, `/orders` based on your backend.
- Authentication is handled simplistically by storing the user object in `localStorage`. If your backend returns JWT tokens, the code will store tokens if present as `token`.

Feel free to tell me any UI or flow tweaks and I will update the project.
