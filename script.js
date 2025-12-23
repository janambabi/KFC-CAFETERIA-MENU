/* ================= CONFIG ================= */
const ADMIN_PIN = "7788";

/* ================= ELEMENTS ================= */
const pinModal = document.getElementById("pinModal");
const adminPanel = document.querySelector(".admin-only");

const menuWrapper = document.getElementById("menuWrapper");
const scrollWrapper = document.getElementById("scrollWrapper");
const menuList = document.getElementById("menuList");
const menuListClone = document.getElementById("menuListClone");

const itemName = document.getElementById("itemName");
const itemPrice = document.getElementById("itemPrice");
const addBtn = document.getElementById("addBtn");
const pinInput = document.getElementById("pinInput");
const pinError = document.getElementById("pinError");

/* ================= DATE ================= */
const today = new Date().toISOString().split("T")[0];
document.getElementById("todayDate").innerText =
    "📅 " + today.split("-").reverse().join("-");

/* ================= STORAGE ================= */
let menus = {};
let todayMenu = [];
let editingIndex = -1;

// Load menu from server
async function loadMenu() {
    try {
        const response = await fetch('/api/menu');
        if (response.ok) {
            menus = await response.json();
            todayMenu = menus[today] || [];
        }
    } catch (error) {
        console.error('Failed to load menu:', error);
        // Fallback to localStorage if server is unavailable
        menus = JSON.parse(localStorage.getItem("menus")) || {};
        todayMenu = menus[today] || [];
    }
    renderMenu();
}

// Save menu to server
async function saveMenuToServer() {
    try {
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(menus),
        });
        if (!response.ok) {
            throw new Error('Failed to save menu');
        }
    } catch (error) {
        console.error('Failed to save menu to server:', error);
        // Fallback to localStorage
        localStorage.setItem("menus", JSON.stringify(menus));
    }
}

/* ================= CONTINUOUS SCROLL ================= */
let scrollY = 0;
let scrollSpeed = 0.8; // 🔧 adjust (0.25–0.4)
let scrollRunning = false;
let scrollTimeout;
let startDelayTimeout;

function startScroll() {
    if (scrollRunning) return;

    scrollRunning = true;
    scrollY = 0;

    const contentHeight = menuList.scrollHeight;

    function step() {
        if (!scrollRunning) return;

        scrollY += scrollSpeed;
        scrollWrapper.style.transform = `translateY(-${scrollY}px)`;

        // seamless infinite loop with delay
        if (scrollY >= contentHeight) {
            scrollY = 0;
            scrollWrapper.style.transform = "translateY(0)";

            // Pause for 3 seconds
            scrollTimeout = setTimeout(() => {
                if (scrollRunning) {
                    requestAnimationFrame(step);
                }
            }, 3000);
            return;
        }

        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function stopScroll() {
    scrollRunning = false;
    clearTimeout(scrollTimeout);
    scrollWrapper.style.transform = "translateY(0)";
}

/* ================= RENDER MENU ================= */
function renderMenu() {
    menuList.innerHTML = "";
    menuListClone.innerHTML = "";

    todayMenu.forEach((item, index) => {
        const html = `
        <div class="col-md-3 col-sm-6 mb-4">
            <div class="menu-card">
                <div>${item.name}</div>
                <div class="price">₹${item.price}</div>

                <div class="admin-only mt-3" style="flex-direction:column;gap:6px;">
                    <div>
                        Order:
                        <input type="number"
                               min="1"
                               max="${todayMenu.length}"
                               value="${index + 1}"
                               onchange="changeOrder(${index}, this.value)"
                               style="width:70px;text-align:center;">
                    </div>
                    <div style="display:flex;gap:5px;justify-content:center;">
                        <button class="btn btn-warning btn-sm" onclick="editItem(${index})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">Remove</button>
                    </div>
                </div>
            </div>
        </div>`;

        menuList.innerHTML += html;
        menuListClone.innerHTML += html;
    });

    applyMode();
}

/* ================= ADD / UPDATE ================= */
async function addItem() {
    if (!itemName.value || !itemPrice.value) return;

    if (editingIndex > -1) {
        todayMenu[editingIndex] = {
            name: itemName.value,
            price: itemPrice.value
        };
        editingIndex = -1;
        addBtn.innerText = "Add";
    } else {
        todayMenu.push({
            name: itemName.value,
            price: itemPrice.value
        });
    }

    await saveMenu();
}

/* ================= EDIT ================= */
function editItem(index) {
    itemName.value = todayMenu[index].name;
    itemPrice.value = todayMenu[index].price;
    editingIndex = index;
    addBtn.innerText = "Update";
}

/* ================= REMOVE ================= */
async function removeItem(index) {
    if (!confirm("Remove this item?")) return;
    todayMenu.splice(index, 1);
    await saveMenu();
}

/* ================= CHANGE ORDER ================= */
async function changeOrder(oldIndex, newPos) {
    newPos = parseInt(newPos) - 1;
    if (newPos < 0 || newPos >= todayMenu.length) return;

    const item = todayMenu.splice(oldIndex, 1)[0];
    todayMenu.splice(newPos, 0, item);
    await saveMenu();
}

/* ================= SAVE ================= */
async function saveMenu() {
    menus[today] = todayMenu;
    await saveMenuToServer();
    itemName.value = "";
    itemPrice.value = "";
    renderMenu();
}

/* ================= ADMIN LOGIN ================= */
function checkPin() {
    if (pinInput.value === ADMIN_PIN) {
        localStorage.setItem("admin", "true");
        pinModal.style.display = "none";
        adminPanel.style.display = "flex";
        renderMenu();
    } else {
        pinError.innerText = "❌ Wrong PIN";
    }
}

/* ================= LOGOUT ================= */
function logout() {
    localStorage.removeItem("admin");
    adminPanel.style.display = "none";
    editingIndex = -1;
    addBtn.innerText = "Add";
    renderMenu();
}

/* ================= MODE HANDLING ================= */
function applyMode() {
    const isAdmin = localStorage.getItem("admin");

    document.querySelectorAll(".admin-only").forEach(el => {
        el.style.display = isAdmin ? "flex" : "none";
    });

    if (isAdmin) {
        clearTimeout(startDelayTimeout);
        stopScroll();
        menuWrapper.style.overflowY = "auto";
        menuListClone.style.display = "none";
    } else {
        stopScroll();
        menuWrapper.style.overflowY = "hidden";
        menuListClone.style.display = "";

        // Wait for CSS entry animations (approx 1.5s) before starting scroll
        clearTimeout(startDelayTimeout);
        startDelayTimeout = setTimeout(() => {
            startScroll();
        }, 2000);
    }
}

/* ================= OPEN PIN ================= */
document.body.addEventListener("dblclick", () => {
    if (!localStorage.getItem("admin")) {
        pinModal.style.display = "flex";
        pinInput.value = "";
        pinError.innerText = "";
        pinInput.focus();
    }
});

pinInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        checkPin();
    }
});

/* ================= INIT ================= */
loadMenu();
