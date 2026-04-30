// 🔥 Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔐 Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "mr-coffee-menu.firebaseapp.com",
  projectId: "mr-coffee-menu",
  storageBucket: "mr-coffee-menu.firebasestorage.app",
  messagingSenderId: "441734976978",
  appId: "1:441734976978:web:cb21ea3cacdf357de9e40b",
  measurementId: "G-63BZQH9FLZ"
};

// 🚀 Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Analytics
isSupported().then(ok => {
  if (ok) getAnalytics(app);
});

/* ================= STATE ================= */
let menuItems = [];
let fastMode = false;
let currentLang = "en";
let currentCategory = null;

/* ================= DOM ================= */
const categoryGrid = document.getElementById("categoryGrid");
const searchInput = document.getElementById("searchInput");
const backBtn = document.getElementById("backBtn");
const menuGrid = document.getElementById("menuGrid");
const categoryDisplay = document.getElementById("currentCategoryDisplay");

const homePage = document.getElementById("homeMenu");
const categoryPage = document.getElementById("categoryPageMenu");

/* ================= CATEGORY ================= */
const CATEGORY_NAMES = {
  wrap: { en: "Wrap", am: "" },
  drink: { en: "Cold Drinks", am: "ቀዝቃዛ መጠጦች" },
  breakfast: { en: "Breakfast", am: "ቁርስ" },
  hotdrink: { en: "Hot Drinks", am: "ትኩስ መጠጦች" },
  salad: { en: "Salad", am: "ሳላድ" },
  burrito: { en: "Burrito", am: "" },
  shake: { en: "Shake", am: "ሚልክሸክ" },
  burger: { en: "Burger", am: "በርገር" },
  fajita: { en: "Fajita", am: "ፍጅታ" },
  fish: { en: "Fish", am: "አሳ" },
  sandwich: { en: "Sandwich", am: "ሳንድዊች" },
  friesandfelafel: { en: "Fries & Falafel", am: "ችፕስ እና ፈላፈል" },
  pizza: { en: "Pizza", am: "ፒዛ" },
  combo: { en: "Combo", am: "ኮምቦ" },
  nationalfood: { en: "National Food", am: "" },
  chicken: { en: "Chicken", am: "ዶሮ" },
  spaghetti: { en: "Spaghetti", am: "ፓስታ" },
  rice: { en: "Rice", am: "ሩዝ" },
  mojito: { en: "Mojito", am: "ሞጅቶ" },
  extra: { en: "Extra", am: "Extra" },
  juice: { en: "Juice", am: "ጁስ" },
  softdrink: { en: "Soft Drink", am: "ለስላሳ" },
  soup: { en: "Soup", am: "" },
};

const CATEGORY_MAP = {
  wrap: "wrap",
  breakfast: "breakfast",
  drink: "drink",
  colddrink: "drink",
  "cold drink": "drink",
  hotdrink: "hotdrink",
  "hot drink": "hotdrink",
  salad: "salad",
  burrito: "burrito",
  shake: "shake",
  burger: "burger",
  fajita: "fajita",
  fish: "fish",
  sandwich: "sandwich",
  friesandfelafel: "friesandfelafel",
  pizza: "pizza",
  combo: "combo",
  nationalfood: "nationalfood",
  chicken: "chicken",
  spaghetti: "spaghetti",
  rice: "rice",
  mojito: "mojito",
  extra: "extra",
  juice: "juice",
  softdrink: "softdrink",
  soup: "soup",
};

/* ================= NAVIGATION ================= */
function showHome() {
  homePage.classList.add("active");
  categoryPage.classList.remove("active");

  currentCategory = null;
  backBtn.style.display = "none";
  categoryDisplay.textContent = "Select Category";
}

function showCategory(cat) {
  currentCategory = cat;

  homePage.classList.remove("active");
  categoryPage.classList.add("active");

  backBtn.style.display = "flex";
  categoryDisplay.textContent = CATEGORY_NAMES[cat][currentLang];

  renderMenu();
  history.pushState({ page: "category" }, "");
}

window.openCategory = (cat) => showCategory(cat);
backBtn.onclick = showHome;

window.onpopstate = (event) => {
  if (!event.state) showHome();
};

/* ================= FIRESTORE ================= */
onSnapshot(collection(db, "menu"), (snapshot) => {
  menuItems = [];

  snapshot.forEach(doc => {
    const d = doc.data();

    if (d.active === false) return;

    const rawCategory = (d.category || "").toString();
    const cleanCategory = rawCategory.toLowerCase().trim();

    const cat = CATEGORY_MAP[cleanCategory];

    if (!cat) {
      console.warn("❌ Unknown category in Firebase:", rawCategory);
      return;
    }

    const item = {
      category: cat,
      name: d.name || "Unnamed",
      desc: d.desc || "",
      price: d.price || 0,
      fastAllowed: !!d.fastAllowed,
      img: (d.img || "default.jpg").trim(),
      amName: d.amName || d.name,
      amDesc: d.amDesc || d.desc
    };

    console.log("✅ Loaded item:", item.name, "| category:", cat);

    menuItems.push(item);
  });

  console.log("🔥 ALL MENU ITEMS:", menuItems);

  renderHome();
});

/* ================= UI ================= */

// home categories
function renderHome() {
  categoryGrid.innerHTML = "";

  Object.keys(CATEGORY_NAMES).forEach(cat => {
    const firstItem = menuItems.find(m => m.category === cat);

    const card = document.createElement("div");
    card.className = "category-card";

    card.innerHTML = `
      <img src="image/${firstItem?.img || "default.jpg"}"
           onerror="this.src='image/default.jpg'">
      <span>${CATEGORY_NAMES[cat][currentLang]}</span>
    `;

    card.onclick = () => openCategory(cat);
    categoryGrid.appendChild(card);
  });
}

// menu items
function renderMenu() {
  menuGrid.innerHTML = "";

  const term = searchInput.value.toLowerCase();
  let hasItems = false;

  console.log("📂 Current category:", currentCategory);

  menuItems.forEach(item => {
    console.log("➡ Checking:", item.name, "|", item.category);

    if (currentCategory && item.category !== currentCategory) return;
    if (fastMode && !item.fastAllowed) return;

    const nameToCheck = currentLang === "am" ? item.amName : item.name;
    if (term && !nameToCheck.toLowerCase().includes(term)) return;

    hasItems = true;

    const el = document.createElement("div");
    el.className = "menu-card";

    el.innerHTML = `
      <img src="image/${item.img}" onerror="this.src='image/default.jpg'">
      <div class="card-content">
        <h3>${currentLang === "am" ? item.amName : item.name}</h3>
        <p>${currentLang === "am" ? item.amDesc : item.desc}</p>
        <span class="price">${item.price} Birr</span>
      </div>
    `;

    menuGrid.appendChild(el);
  });

  if (!hasItems) {
    menuGrid.innerHTML = `<p style="text-align:center;">No items found</p>`;
  }
}

/* ================= EVENTS ================= */
searchInput.addEventListener("input", renderMenu);

document.getElementById("fastToggle").addEventListener("change", e => {
  fastMode = e.target.checked;
  renderMenu();
});