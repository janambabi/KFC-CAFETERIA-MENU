# KFC Cafeteria Menu Display System

A responsive menu display system for cafeterias that shows the daily menu on multiple devices (mobiles and TVs) with synchronized updates.

## Features

- **Multi-device synchronization**: Menu updates are synchronized across all connected devices
- **Admin panel**: Double-click to access admin login and manage menu items
- **Continuous scrolling**: Automatic scrolling animation for non-admin view
- **Responsive design**: Works on mobile devices and TVs
- **Real-time updates**: Changes made by admin are immediately visible on all devices

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

### For Customers
- The menu automatically scrolls continuously
- Menu items are displayed in cards with name and price

### For Admins
- Double-click anywhere on the page to open the admin login
- Enter PIN: `7788`
- Add, edit, remove, or reorder menu items
- Changes are automatically synchronized across all devices

## Technical Details

- **Frontend**: HTML, CSS (Bootstrap), JavaScript
- **Backend**: Node.js with Express
- **Data Storage**: JSON file on server
- **Synchronization**: HTTP API calls for real-time updates

## File Structure

- `index.html` - Main HTML page
- `style.css` - Styling and animations
- `script.js` - Client-side JavaScript
- `server.js` - Express server
- `package.json` - Dependencies
- `menu.json` - Menu data storage (created automatically)

## API Endpoints

- `GET /api/menu` - Retrieve menu data
- `POST /api/menu` - Save menu data

## Troubleshooting

If the server is not available, the application falls back to localStorage for single-device operation.
