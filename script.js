// --- Змінні ---
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout');
const userEmailSpan = document.getElementById('user-email');
const addProductBtn = document.getElementById('add-product-btn');

let currentUser = localStorage.getItem('currentUser') || null;
let balance = parseFloat(localStorage.getItem('balance')) || 0;

// --- UI оновлення ---
function updateUI() {
  userEmailSpan.innerText = currentUser || "Гість";
  document.getElementById('balance').innerText = balance.toFixed(2);
  document.getElementById('add-product-section').style.display = currentUser ? 'block' : 'none';
  logoutBtn.style.display = currentUser ? 'inline-block' : 'none';
  loadProducts();
  renderAccount();
}
updateUI();

// --- Toast ---
function showToast(message, type='success'){
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(()=> container.removeChild(toast),3000);
}

// --- Користувачі ---
function getUsers() { return JSON.parse(localStorage.getItem('users')) || []; }
function saveUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }

// --- Реєстрація ---
signupBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if(!email || !password) return showToast('Заповніть усі поля', 'error');

  let users = getUsers();
  if(users.find(u => u.email === email)) return showToast('Користувач вже існує', 'error');

  users.push({email, password});
  saveUsers(users);
  currentUser = email;
  balance = 777777; // Бонус на старт
  localStorage.setItem('currentUser', currentUser);
  localStorage.setItem('balance', balance);
  updateUI();
  showToast('Реєстрація успішна! $777,777 бонус', 'success');
});

// --- Логін ---
loginBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if(!user) return showToast('Неправильний email або пароль', 'error');

  currentUser = user.email;
  balance = parseFloat(localStorage.getItem('balance')) || 777777;
  localStorage.setItem('currentUser', currentUser);
  localStorage.setItem('balance', balance);
  updateUI();
  showToast('Вхід успішний', 'success');
});

// --- Логут ---
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateUI();
  showToast('Вийшли з системи', 'warning');
});

// --- Товари ---
function getProducts(){ return JSON.parse(localStorage.getItem('products')) || []; }
function saveProducts(products){ localStorage.setItem('products', JSON.stringify(products)); }

function loadProducts(){
  const container = document.getElementById('products');
  container.innerHTML = '';
  const products = getProducts();
  products.forEach((p, idx)=>{
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" style="width:100%;border-radius:10px;margin-bottom:10px;">
      <span class="product-name">${p.name}</span>
      <span class="product-type">${p.type}</span>
      <span class="product-price">$${p.price}</span>
      <button class="buy-btn" data-index="${idx}">Купити</button>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.buy-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const idx = e.target.dataset.index;
      const products = getProducts();
      const product = products[idx];
      if(!currentUser) return showToast('Увійдіть для покупки', 'error');
      if(balance < product.price) return showToast('Недостатньо коштів', 'error');

      balance -= parseFloat(product.price);
      localStorage.setItem('balance', balance);
      addPurchase(product);
      updateUI();
      showToast(`Купили ${product.name} за $${product.price}`, 'success');
    });
  });
}

// --- Додавання товарів ---
addProductBtn.addEventListener('click', ()=>{
  const name = document.getElementById('product-name').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  const image = document.getElementById('product-image').value.trim();
  const type = document.getElementById('product-type').value;
  if(!name || !price || !image || !type) return showToast('Заповніть всі поля', 'error');

  const products = getProducts();
  products.push({name, price, image, type, seller: currentUser});
  saveProducts(products);
  loadProducts();
  showToast('Товар додано!', 'success');
});

// --- Історія покупок ---
function getPurchases(){ return JSON.parse(localStorage.getItem('purchases')) || []; }
function savePurchases(purchases){ localStorage.setItem('purchases', JSON.stringify(purchases)); }

function addPurchase(product){
  const purchases = getPurchases();
  purchases.push({name: product.name,
