let container = null;

function ensureContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container-zl';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, type = 'success') {
  const el = document.createElement('div');
  const bgClass = type === 'error' ? 'text-bg-danger' : type === 'info' ? 'text-bg-primary' : 'text-bg-success';
  el.className = `toast align-items-center ${bgClass} border-0 show`;
  el.setAttribute('role', 'alert');
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  ensureContainer().appendChild(el);
  setTimeout(() => el.remove(), 4000);
}
