# TodoList
A modern web application for task management with user authorization, a user-friendly interface, and a well-thought-out architecture.
The application allows you to create, edit, delete, and filter tasks, as well as manage them within individual lists.

The project is built using the Feature-Sliced ​​Design (FSD) and BEM methodology

✅ Features

➕ User registration and authorization (also using Google and GitLab

➕ Access token update via refresh mechanics

➕ Obtaining and storing profile data

➕ Creating multiple task lists

➕ Adding, editing, and deleting tasks

➕ Changing completion status

➕ Search and pagination

➕ Responsive interface

## Tech Stack
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![React Router DOM](https://img.shields.io/badge/React%20Router%20DOM-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![React Query](https://img.shields.io/badge/React%20Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-EC4D37?style=for-the-badge)
![Zod](https://img.shields.io/badge/Zod-000000?style=for-the-badge&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![React Responsive](https://img.shields.io/badge/React%20Responsive-00C2FF?style=for-the-badge)
![Motion](https://img.shields.io/badge/Motion-000000?style=for-the-badge&logo=framer&logoColor=white)
![clsx](https://img.shields.io/badge/clsx-000000?style=for-the-badge)

## Installation
- git clone git@gitlab.pointpulse.ru:l1/todolist/frontend.git
- npm install
- npm run dev

## API
BASE_URL: http://46.29.114.107:8000

Authorization using access/refresh JWT tokens
- Access Token (short-lived)
- Refresh Token (via httpOnly cookie)
- Automatic token refresh via Axios interceptor
- Global authorization state storage

Auth
| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/auth/register` | Register User
| `POST` | `/auth/verify-email` | Verify Email
| `POST` | `/auth/send-verification-email` | Send Verification Email Endpoint
| `POST` | `/auth/login` | Login
| `POST` | `/auth/refresh` | Refresh
| `POST` | `/auth/logout` | Logout
| `POST` | `/auth/forgot-password` | Forgot Password
| `POST` | `/auth/reset-password` | Reset Password

OAuth2
| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/auth/gitlab/login` | `Gitlab Login`
| `GET` | `/auth/gitlab/callback` | `Gitlab Callback`
| `GET` | `/auth/google/login` | `Google Login`
| `GET` | `/auth/google/callback` | `Google Callback`