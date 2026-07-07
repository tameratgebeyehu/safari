# Safari A – Google Apps Script Backend

## Setup Instructions

### 1. Create the Google Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. Name it **"Safari A Database"**.
3. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

### 2. Deploy the Apps Script

1. Open your spreadsheet → **Extensions → Apps Script**.
2. Delete the existing `Code.gs` content.
3. Create the following files (+ button in the left panel) and paste the contents:
   - `Code.gs` — main router
   - `RequestsService.gs`
   - `FavoritesService.gs`
   - `SettingsService.gs`
   - `LogsService.gs`
   - `Validation.gs`
4. In the **Project Settings** (⚙️), scroll to **Script Properties** and add:
   | Property | Value |
   |---|---|
   | `SPREADSHEET_ID` | Your spreadsheet ID from step 1 |
   | `API_SECRET` | A random secret key (e.g. `safari-a-secret-2025`) |
5. Click **Deploy → New Deployment**:
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** and copy the **Deployment URL**.

### 3. Initialize the Sheets

Run the `setupSheets()` function once from the Apps Script editor to create all sheet tabs with proper headers:
- `Requests` (11 columns)
- `Favorites` (5 columns)
- `Settings` (2 columns)
- `Logs` (4 columns)

### 4. Configure the Mobile App

Create a `.env` file in the project root:
```env
EXPO_PUBLIC_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
EXPO_PUBLIC_API_KEY=safari-a-secret-2025
```

> ⚠️ The `EXPO_PUBLIC_API_KEY` must match the `API_SECRET` set in Script Properties.

### 5. Test the Connection

In the App Script editor, run the `doGet` function manually with:
```json
{ "parameter": { "action": "health", "apiKey": "safari-a-secret-2025" } }
```

Expected response:
```json
{ "success": true, "data": { "status": "ok", "timestamp": "..." } }
```

---

## API Endpoints

| Action | Method | Description |
|---|---|---|
| `health` | GET | Health check |
| `getRequests` | GET | Get all requests |
| `createRequest` | POST | Create a new request |
| `updateRequest` | POST | Update request status/description |
| `deleteRequest` | POST | Delete a request |
| `getFavorites` | GET | Get all favorites |
| `createFavorite` | POST | Add a favorite |
| `updateFavorite` | POST | Update a favorite |
| `deleteFavorite` | POST | Delete a favorite |
| `getSettings` | GET | Get settings |
| `updateSettings` | POST | Update settings |

## Sheet Structure

### Requests (11 columns)
| Col | Field |
|---|---|
| A | Request ID |
| B | Buyer Phone |
| C | Amount |
| D | Description |
| E | Status |
| F | Created Date (Ethiopian) |
| G | Created Time |
| H | Completed Date |
| I | Completed Time |
| J | Last Updated (ISO) |
| K | ISO Timestamp (creation, immutable) |

### Favorites (5 columns)
| Col | Field |
|---|---|
| A | Favorite ID |
| B | Phone Number |
| C | Customer Name |
| D | Description |
| E | Created Date |
