# Safari A

A lightweight request management Android app for a small family business in Ethiopia. Safari A helps two trusted users coordinate customer voucher requests quickly and reliably.

## Features

- **Sender Mode** — Simple, elder-friendly interface for creating requests
- **Receiver Mode** — PIN-protected admin dashboard for managing requests
- **Google Sheets Backend** — Lightweight, cost-free backend via Apps Script
- **Offline Support** — Queue requests locally and sync when online
- **Bilingual** — English and Amharic
- **Themes** — Light, Dark, and System Default

## Tech Stack

- React Native (Expo SDK 52)
- Expo Router
- React Native Paper (Material Design 3)
- Zustand + TanStack Query
- MMKV local storage
- Google Apps Script + Google Sheets

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and set your Apps Script Web App URL and API key:

```
EXPO_PUBLIC_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
EXPO_PUBLIC_API_KEY=your-secret-api-key
```

See [backend/README.md](backend/README.md) for Google backend setup.

### 3. Start the app

```bash
npm start
```

Press `a` for Android emulator or scan the QR code with Expo Go.

## Default PIN

Receiver mode default PIN: **1234**

Change it in Receiver → Settings → Change PIN.

## Project Structure

```
app/           Expo Router screens (Sender + Receiver)
src/           Business logic, components, hooks, services
backend/       Google Apps Script source files
```

## Building for Android

Install EAS CLI and configure:

```bash
npm install -g eas-cli
eas build --platform android --profile preview
```

## Architecture

The app uses a repository pattern so the Google Sheets backend can be replaced with Firebase, Supabase, or PostgreSQL in future versions without rewriting the UI.

## Version

Safari A Version 1.0.0

## License

Family Business Use License — Version 1
