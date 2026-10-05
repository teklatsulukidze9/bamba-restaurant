const $ = s => document.querySelector(s);
const OWN = 'http://localhost:3000/api';

const HEAT = ['არაცხარე', '🌶 ნაკლებად ცხარე', '🌶🌶 საშუალო', '🌶🌶🌶 ცხარე'];
const ICON = { starters: '🧀', salads: '🥗', soups: '🍲', garnish: '🍟', side: '🥖', main: '🍖', dessert: '🍰', drinks: '🥂', burger: '🍔', pizza: '🍕', khachapuri: '🧀' };

const bcart = () => JSON.parse(localStorage.getItem('bcart') || '{}');
const saveB = c => localStorage.setItem('bcart', JSON.stringify(c));
const bfav = () => JSON.parse(localStorage.getItem('bfav') || '[]');
const saveFav = f => localStorage.setItem('bfav', JSON.stringify(f));

let MENU = typeof BMENU !== 'undefined' ? BMENU : (typeof BAMBA !== 'undefined' ? BAMBA : []);

async function loadMenu() {
  try {
    const res = await fetch(OWN + '/menu');
    if (res.ok) {
      const l = await res.json();
      if (Array.isArray(l) && l.length) MENU = l;
    }
  } catch {}
}

function updateCounts() {
  const c = bcart();
  const count = Object.values(c).reduce((a, b) => a + b, 0);
  if ($('#cartCount')) $('#cartCount').textContent = count;
  if ($('#favCount')) $('#favCount').textContent = bfav().length;
}

const bcard = d => {
  const isFav = bfav().includes(d.id);
  return `<article class="card" style="border:1px solid var(--border, #eee); padding:15px; border-radius:12px; background:var(--bg-card, #fff);">
    <span class="fav-icon" data-fav="${d.id}" style="cursor:pointer; float:right;">${isFav ? '❤️' : '🤍'}</span>
    <div class="ph" style="font-size:30px; text-align:center;">${ICON[d.c] || '🍽️'}</div>
    ${d.img ? `<img src="${d.img}" alt="${d.n}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-top:5px;">` : ''}
    <div class="bd" style="margin-top:10px;">
      <h3 style="margin:5px 0;">${d.n}</h3>
      <small style="color:#666;">${d.e || ''}</small>
      ${d.i ? `<p class="ing" style="font-size:13px; color:#777;">${d.i}</p>` : ''}
      <div class="row" style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
        <b style="font-size:18px;">${d.p} ₾</b>
        <button class="btn main-btn" data-b="${d.id}" style="padding:8px 12px; border-radius:6px; cursor:pointer;">კალათაში</button>
      </div>
    </div>
  </article>`;
};

async function initBamba() {
  await loadMenu();
  const grid = $('#menuGrid') || $('#bgrid');
  if (!containerValid(grid)) return;

  let cat = '';
  if ($('#bcats') && typeof BCATS !== 'undefined') {
    $('#bcats').innerHTML = '<button data-c="" class="on">ყველა</button>' + Object.entries(BCATS).map(([k, v]) => `<button data-c="${k}">${v}</button>`).join('');
  }

  const draw = () => {
    const q = $('#q') ? $('#q').value.trim().toLowerCase() : '';
    const h = $('#bh') ? $('#bh').value : '';
    const list = MENU.filter(d => (!cat || d.c === cat)
      && (d.n + ' ' + (d.e || '') + ' ' + (d.i || '')).toLowerCase().includes(q)
      && (h === '' || (d.c !== 'drinks' && (h === 'sweet' ? d.s : d.h == h))));

    grid.innerHTML = list.length ? list.map(bcard).join('') : '<p style="grid-column:1/-1; text-align:center;">კერძი ვერ მოიძებნა.</p>';
  };

  if ($('#bcats')) $('#bcats').onclick = e => {
    if (e.target.dataset.c === undefined) return;
    cat = e.target.dataset.c;
    document.querySelectorAll('#bcats button').forEach(b => b.classList.toggle('on', b === e.target));
    draw();
  };

  ['q', 'bh', 'bn', 'bv'].forEach(id => $('#' + id) && $('#' + id).addEventListener('input', draw));

  grid.onclick = e => {
    const id = e.target.dataset.b;
    const fId = e.target.dataset.fav;
    if (id) {
      const c = bcart(); c[id] = (c[id] || 0) + 1; saveB(c); updateCounts();
      e.target.textContent = '✓ დაემატა'; setTimeout(() => e.target.textContent = 'კალათაში', 1000);
    }
    if (fId) {
      let f = bfav();
      f = f.includes(+fId) ? f.filter(x => x !== +fId) : [...f, +fId];
      saveFav(f); updateCounts(); draw();
    }
  };
  draw();
}

function containerValid(el) { return el !== null; }

// Cart Page Logic
async function initBCart() {
  await loadMenu();
  const box = $('#bcart'); if (!box) return;
  const draw = () => {
    const c = bcart(), find = id => MENU.find(x => x.id == id), ids = Object.keys(c).filter(find);
    box.innerHTML = ids.length ? ids.map(id => {
      const d = find(id);
      return `<div class="item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
        <div><h3>${d.n}</h3><span>${d.p} ₾</span></div>
        <div class="qty">
          <button data-b="${id}" data-q="-1">−</button>
          <b style="margin:0 10px;">${c[id]}</b>
          <button data-b="${id}" data-q="1">+</button>
        </div>
        <b>${(d.p * c[id]).toFixed(2)} ₾</b>
        <button class="btn" data-b="${id}" data-q="del" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:5px;">✕</button>
      </div>`;
    }).join('') : '<p>კალათა ცარიელია.</p>';

    if ($('#btotal')) $('#btotal').textContent = ids.reduce((s, id) => s + find(id).p * c[id], 0).toFixed(2);
  };

  box.onclick = e => {
    const d = e.target.dataset; if (!d.b) return;
    const c = bcart(), n = d.q === 'del' ? 0 : (c[d.b] || 0) + +d.q;
    if (n < 1) delete c[d.b]; else c[d.b] = n;
    saveB(c); updateCounts(); draw();
  };
  draw();
}

// Fav Page Logic
async function initFavPage() {
  await loadMenu();
  const grid = $('#favGrid'); if (!grid) return;
  const draw = () => {
    const favs = bfav(), list = MENU.filter(x => favs.includes(x.id));
    grid.innerHTML = list.length ? list.map(bcard).join('') : '<p>ფავორიტები ცარიელია.</p>';
  };
  grid.onclick = e => {
    const fId = e.target.dataset.fav;
    if (fId) {
      saveFav(bfav().filter(x => x !== +fId)); updateCounts(); draw();
    }
  };
  draw();
}

// ==========================================
// შეკვეთის ფუნქცია (ამოწმებს ავტორიზაციას)
// ==========================================
window.handleCheckout = () => {
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');

  if (!user) {
    alert('⚠️ შეკვეთის გასაფორმებლად აუცილებელია ავტორიზაცია / რეგისტრაცია!');
    window.location.href = 'auth.html';
    return;
  }

  const c = bcart();
  if (Object.keys(c).length === 0) {
    alert('თქვენი კალათა ცარიელია!');
    return;
  }

  alert(`🎉 გმადლობთ შეკვეთისთვის, ${user.name || user.user || ''}! შეკვეთა მიღებულია.`);
  localStorage.removeItem('bcart');
  updateCounts();
  if ($('#bcart')) initBCart();
};

document.addEventListener('DOMContentLoaded', () => {
  updateCounts();
  if ($('#menuGrid') || $('#bgrid')) initBamba();
  if ($('#bcart')) initBCart();
  if ($('#favGrid')) initFavPage();

  const themeBtn = $('#themeToggle');
  if (themeBtn) {
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');
    themeBtn.onclick = () => {
      document.body.classList.toggle('dark-theme');
      localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    };
  }

  const burger = $('#burgerBtn'), nav = $('#navMenu');
  if (burger) burger.onclick = () => nav.classList.toggle('active');

  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
  if (user) {
    if ($('#authLink')) { $('#authLink').textContent = user.name || user.user; $('#authLink').href = '#'; }
    if (user.role === 'admin' && $('#dashLink')) $('#dashLink').style.display = 'inline';
  }
});