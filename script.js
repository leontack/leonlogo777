// --- Елементи ---
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout');
const userEmailSpan = document.getElementById('user-email');
const balanceSpan = document.getElementById('balance');

const addBalanceSection = document.getElementById('add-balance-section');
const balanceAmountInput = document.getElementById('balance-amount');
const addBalanceBtn = document.getElementById('add-balance-btn');
const withdrawBalanceBtn = document.getElementById('withdraw-balance-btn');

const addProductSection = document.getElementById('add-product-section');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productImageInput = document.getElementById('product-image');
const productTypeSelect = document.getElementById('product-type');
const addProductBtn = document.getElementById('add-product-btn');

const logosContainer = document.getElementById('logos');
const wallpapersContainer = document.getElementById('wallpapers');
const themesContainer = document.getElementById('themes');
const purchaseHistory = document.getElementById('purchase-history');

const startBtn = document.getElementById('start-btn');

// --- Стан ---
let currentUser = localStorage.getItem('currentUser') || null;
let balance = parseFloat(localStorage.getItem('balance')) || 0;

// --- Демо-товари (один раз при першому запуску) ---
if (!localStorage.getItem('products')) {
  const demoProducts = [
    { name: "Creative Logo", price: 15, image: "https://picsum.photos/300/200?random=1", type: "logo" },
    { name: "Modern Logo", price: 20, image: "https://picsum.photos/300/200?random=2", type: "logo" },
    { name: "City Wallpaper", price: 5, image: "https://picsum.photos/300/200?random=3", type: "wallpaper" },
    { name: "Nature Wallpaper", price: 7, image: "https://picsum.photos/300/200?random=4", type: "wallpaper" },
    { name: "Dark Theme", price: 12, image: "https://picsum.photos/300/200?random=5", type: "theme" },
    { name: "Light Theme", price: 10, image: "https://picsum.photos/300/200?random=6", type: "theme" }
  ];
  localStorage.setItem('products', JSON.stringify(demoProducts));
}

// --- UI ---
function updateUI() {
  userEmailSpan.innerText = currentUser || 'Гість';
  balanceSpan.innerText = balance.toFixed(2);
  addBalanceSection.style.display = currentUser ? 'block' : 'none';
  addProductSection.style.display = currentUser ? 'block' : 'none';
  logoutBtn.style.display = currentUser ? 'inline-block' : 'none';
  loadProducts();
  renderHistory();
}
updateUI();

// --- Toast ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => container.removeChild(toast), 3000);
}

// --- Users ---
function getUsers() { return JSON.parse(localStorage.getItem('users')) || []; }
function saveUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }

signupBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return showToast('Заповніть усі поля', 'error');
  const users = getUsers();
  if (users.find(u => u.email === email)) return showToast('Користувач вже існує', 'error');
  users.push({ email, password });
  saveUsers(users);
  showToast('Реєстрація успішна', 'success');
});

loginBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return showToast('Неправильний email або пароль', 'error');
  currentUser = user.email;
  localStorage.setItem('currentUser', currentUser);
  updateUI();
  showToast('Вхід успішний', 'success');
});

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateUI();
  showToast('Вийшли з системи', 'warning');
});

// --- Products ---
function getProducts() { return JSON.parse(localStorage.getItem('products')) || []; }
function saveProducts(products) { localStorage.setItem('products', JSON.stringify(products)); }

function productCard(product, index) {
  const card = document.createElement('div');
  card.className = 'logo-card';
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <span class="logo-name">${product.name}</span>
    <span class="logo-price">$${Number(product.price).toFixed(2)}</span>
    <button class="buy-button" data-index="${index}">Купити</button>
  `;
  return card;
}

function loadProducts() {
  const products = getProducts();
  logosContainer.innerHTML = '';
  wallpapersContainer.innerHTML = '';
  themesContainer.innerHTML = '';

  products.forEach((p, i) => {
    const card = productCard(p, i);
    if (p.type === 'logo') logosContainer.appendChild(card);
    if (p.type === 'wallpaper') wallpapersContainer.appendChild(card);
    if (p.type === 'theme') themesContainer.appendChild(card);
  });

  document.querySelectorAll('.buy-button').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number(e.currentTarget.dataset.index);
      const products = getProducts();
      const product = products[idx];
      if (!currentUser) return showToast('Увійдіть для покупки', 'error');
      if (balance < product.price) return showToast('Недостатньо коштів', 'error');
      balance = Number((balance - Number(product.price)).toFixed(2));
      localStorage.setItem('balance', balance);
      addPurchase(product);
      updateUI();
      showToast(`Купили ${product.name} за $${Number(product.price).toFixed(2)}`, 'success');
    });
  });
}

addProductBtn.addEventListener('click', () => {
  const name = productNameInput.value.trim();
  const price = parseFloat(productPriceInput.value);
  const image = productImageInput.value.trim();
  const type = productTypeSelect.value;

  if (!name || !price || !image) return showToast('Заповніть всі поля', 'error');

  const products = getProducts();
  products.push({ name, price, image, type, seller: currentUser });
  saveProducts(products);

  productNameInput.value = '';
  productPriceInput.value = '';
  productImageInput.value = '';
  productTypeSelect.value = 'logo';

  loadProducts();
  showToast('Продукт додано!', 'success');
});

// --- Balance ---
addBalanceBtn.addEventListener('click', () => {
  const amount = parseFloat(balanceAmountInput.value);
  if (!amount || amount <= 0) return showToast('Введіть правильну суму', 'error');
  balance = Number((balance + amount).toFixed(2));
  localStorage.setItem('balance', balance);
  balanceAmountInput.value = '';
  updateUI();
  showToast(`Баланс поповнено на $${amount.toFixed(2)}`, 'success');
});

withdrawBalanceBtn.addEventListener('click', () => {
  const amount = parseFloat(balanceAmountInput.value);
  if (!amount || amount <= 0) return showToast('Введіть правильну суму', 'error');
  if (balance < amount) return showToast('Недостатньо коштів для виводу', 'error');
  balance = Number((balance - amount).toFixed(2));
  localStorage.setItem('balance', balance);
  balanceAmountInput.value = '';
  updateUI();
  showToast(`Вивели $${amount.toFixed(2)}`, 'warning');
});

// --- Purchases ---
function getPurchases() { return JSON.parse(localStorage.getItem('purchases')) || []; }
function savePurchases(purchases) { localStorage.setItem('purchases', JSON.stringify(purchases)); }

function addPurchase(product) {
  const purchases = getPurchases();
  purchases.push({
    product: product.name,
    price: product.price,
    buyer: currentUser,
    type: product.type,
    date: new Date().toISOString()
  });
  savePurchases(purchases);
  renderHistory();
}

function renderHistory() {
  purchaseHistory.innerHTML = '<h2>Історія покупок:</h2>';
  const list = document.createElement('div');
  const purchases = getPurchases().filter(p => p.buyer === currentUser);
  if (purchases.length === 0) {
    list.innerHTML = '<div>Поки що немає покупок.</div>';
  } else {
    purchases.forEach(p => {
      const item = document.createElement('div');
      item.textContent = `${p.product} — $${Number(p.price).toFixed(2)} — (${p.type}) — ${new Date(p.date).toLocaleString()}`;
      list.appendChild(item);
    });
  }
  purchaseHistory.appendChild(list);
}

// --- UX: кнопка "Почати" ---
if (startBtn) {
  startBtn.addEventListener('click', () => {
    const target = document.querySelector('#logos-section');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
}
