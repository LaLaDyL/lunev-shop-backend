// header.js - общий для всех страниц
document.addEventListener('DOMContentLoaded', function() {
  updateHeader();
});

function updateHeader() {
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const nav = document.querySelector('.nav');
  const currentPage = window.location.pathname.split('/').pop();
  
  if (nav) {
    // Определяем активную страницу
    const activeMap = {
      'index.html': 'Главная',
      'favorites.html': 'Избранное',
      'cart.html': 'Корзина',
      'login.html': 'Войти',
      'register.html': 'Регистрация',
      'profile.html': 'Профиль'
    };
    
    const activePage = activeMap[currentPage] || '';
    
    if (loggedIn) {
      // Если пользователь авторизован
      const userName = currentUser.firstName || currentUser.first_name || currentUser.username || 'Профиль';
      nav.innerHTML = `
        <a href="favorites.html"${currentPage === 'favorites.html' ? ' class="active"' : ''}>❤️ Избранное</a>
        <a href="cart.html"${currentPage === 'cart.html' ? ' class="active"' : ''}>🛒 Корзина</a>
        <a href="profile.html" class="user-profile-link${currentPage === 'profile.html' ? ' active' : ''}">
          👤 ${userName}
        </a>
      `;
    } else {
      // Если не авторизован
      nav.innerHTML = `
        <a href="favorites.html"${currentPage === 'favorites.html' ? ' class="active"' : ''}>❤️ Избранное</a>
        <a href="cart.html"${currentPage === 'cart.html' ? ' class="active"' : ''}>🛒 Корзина</a>
        <a href="login.html"${currentPage === 'login.html' ? ' class="active"' : ''}>👤 Войти</a>
      `;
    }
  }
}

// Функция выхода
window.logout = function() {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('currentUser');
  updateHeader();
  
  // Показываем уведомление
  const notification = document.createElement('div');
  notification.className = 'notification info';
  notification.innerHTML = `
    <div class="notification-content">
      <span>Вы вышли из аккаунта</span>
    </div>
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
  
  // Перенаправляем на главную
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
};