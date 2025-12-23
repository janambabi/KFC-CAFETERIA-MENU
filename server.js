const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const MENU_FILE = path.join(__dirname, 'menu.json');

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Initialize menu file if it doesn't exist
if (!fs.existsSync(MENU_FILE)) {
    fs.writeFileSync(MENU_FILE, JSON.stringify({}));
}

// Routes
app.get('/api/menu', (req, res) => {
    try {
        const menus = JSON.parse(fs.readFileSync(MENU_FILE, 'utf8'));
        res.json(menus);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load menu' });
    }
});

app.post('/api/menu', (req, res) => {
    try {
        fs.writeFileSync(MENU_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save menu' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Accessible on your network at http://YOUR_LOCAL_IP:${PORT}`);
});
