export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  TRAINER: 'trainer',
  DIETITIAN: 'dietitian',
};

export const ROLE_LABELS = {
  user: 'Потребител',
  admin: 'Админ',
  trainer: 'Треньор',
  dietitian: 'Диетолог',
};

const ROLE_PRIORITY = ['admin', 'trainer', 'dietitian', 'user'];

export function pickPrimaryRole(roles = []) {
  const list = roles.map((r) => (typeof r === 'string' ? r : r.role));
  for (const role of ROLE_PRIORITY) {
    if (list.includes(role)) return role;
  }
  return 'user';
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}

export function getRoleBadgeClass(role) {
  switch (role) {
    case 'admin': return 'bg-danger';
    case 'trainer': return 'bg-warning text-dark';
    case 'dietitian': return 'bg-info text-dark';
    default: return 'bg-secondary';
  }
}

export function canAccessStaffPanel(role) {
  return role === 'admin' || role === 'trainer' || role === 'dietitian';
}

export function getStaffTabs(role) {
  if (role === 'admin') return ['users', 'recipes', 'workouts', 'foods'];
  if (role === 'trainer') return ['workouts'];
  if (role === 'dietitian') return ['recipes', 'foods'];
  return [];
}

export function canManageWorkouts(role, user, authorId) {
  if (!user) return false;
  if (role === 'admin' || role === 'trainer') return true;
  return Boolean(authorId && user.id === authorId);
}

export function canManageRecipes(role, user, authorId) {
  if (!user) return false;
  if (role === 'admin' || role === 'dietitian') return true;
  return Boolean(authorId && user.id === authorId);
}

export function canManageFoods(role) {
  return role === 'admin' || role === 'dietitian';
}

export function buildRoleMap(roles) {
  const map = {};
  (roles || []).forEach((row) => {
    const userId = row.user_id;
    const role = row.role;
    if (!map[userId]) map[userId] = role;
    else if (ROLE_PRIORITY.indexOf(role) < ROLE_PRIORITY.indexOf(map[userId])) {
      map[userId] = role;
    }
  });
  return map;
}
