const API_URL = 'http://localhost:3000/api';
const $ = sel => document.querySelector(sel);

// Theme Toggle & Mobile Burger
const themeBtn = $('#themeToggle');
if (themeBtn) {
  themeBtn.onclick = () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
  };
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeBtn.textContent = '☀️';
  }
}

const burgerBtn = $('#burgerBtn'), navMenu = $('#navMenu');
if (burgerBtn && navMenu) burgerBtn.onclick = () => navMenu.classList.toggle('open');

// 1. მენიუს წამოღება და რენდერი
async function loadAdminMenu() {
  const container = $('#adminMenuList');
  if (!container) return;

  try {
    const res = await fetch(`${API_URL}/menu`);
    const data = await res.json();

    container.innerHTML = data.map(item => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:15px; border-radius:10px; border:1px solid var(--border);">
        <div style="display:flex; align-items:center; gap:15px;">
          <img src="${item.img}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;">
          <div>
            <b>${item.n}</b> (${item.c})
            <div style="font-size:13px; color:var(--text-muted);">${item.i || ''}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <input type="number" step="0.5" value="${item.p}" id="price-${item.id}" style="width:80px; padding:6px; border-radius:6px; border:1px solid var(--border); background:var(--bg-main); color:var(--text-main);">
          <button class="btn-main" style="padding:6px 12px; width:auto; background:#10b981;" onclick="updatePrice(${item.id})">💾 ფასი</button>
          <button class="btn-main" style="padding:6px 12px; width:auto; background:#ef4444;" onclick="deleteDish(${item.id})">🗑️ წაშლა</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p style="color:#ef4444;">⚠️ ვერ უკავშირდება API სერვერს (შეამოწმეთ `node server.js` ჩართულია თუ არა)</p>';
  }
}

// 2. ახალი კერძის დამატება (POST)
$('#addDishForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newDish = {
    n: $('#dishName').value,
    e: $('#dishEng').value,
    c: $('#dishCat').value,
    p: parseFloat($('#dishPrice').value),
    img: $('#dishImg').value,
    i: $('#dishIngredients').value
  };

  try {
    const res = await fetch(`${API_URL}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDish)
    });

    if (res.ok) {
      alert('კერძი წარმატებით დაემატა!');
      e.target.reset();
      loadAdminMenu();
    }
  } catch (err) {
    alert('შეცდომა კერძის დამატებისას!');
  }
});

// 3. ფასის შეცვლა (PATCH)
window.updatePrice = async (id) => {
  const newPrice = parseFloat($(`#price-${id}`).value);
  try {
    const res = await fetch(`${API_URL}/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p: newPrice })
    });

    if (res.ok) alert('ფასი განახლდა!');
  } catch (err) {
    alert('შეცდომა ფასის შეცვლისას!');
  }
};

// 4. კერძის წაშლა (DELETE)
window.deleteDish = async (id) => {
  if (!confirm('ნამდვილად გსურთ წაშლა?')) return;
  try {
    const res = await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadAdminMenu();
    }
  } catch (err) {
    alert('შეცდომა წაშლისას!');
  }
};

// 5. შეტყობინებების წამოღება (GET)
async function loadMessages() {
  const container = $('#adminMessages');
  if (!container) return;

  try {
    const res = await fetch(`${API_URL}/messages`);
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = '<p>შეტყობინებები არ არის.</p>';
      return;
    }

    container.innerHTML = data.map(m => `
      <div style="border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:10px;">
        <b>${m.name || 'მომხმარებელი'}</b> (${m.email || 'მეილი არ არის'})
        <p style="margin-top:5px; color:var(--text-muted);">${m.message || ''}</p>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p>შეტყობინებების ჩატვირთვა ვერ მოხერხდა.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadAdminMenu();
  loadMessages();
});