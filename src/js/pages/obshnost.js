import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal } from 'bootstrap';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { getCurrentUser } from '../auth.js';
import { QUESTION_CATEGORIES, getQuestionCategoryLabel } from '../data/community.js';
import {
  createComment,
  createPost,
  fetchChatMessages,
  fetchComments,
  fetchCommunityMembers,
  fetchPostById,
  fetchPosts,
  fetchPostStats,
  sendChatMessage,
  subscribeChatMessages,
  togglePostLike,
} from '../services/community.js';
import { uploadCommunityImage, validateImageFile } from '../services/storage.js';
import {
  escapeHtml,
  formatMessageTime,
  formatRelativeTime,
  getAvatarColor,
  getAvatarInitials,
  getQueryParam,
} from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

let currentUser = null;
let newsPosts = [];
let questionPosts = [];
let postStats = { likes: {}, comments: {}, userLikes: new Set() };
let chatMessages = [];
let members = [];
let activeQuestionCategory = 'all';
let activePostId = null;
let chatUnsubscribe = null;

let postDetailModal = null;
let newNewsModal = null;
let newQuestionModal = null;

function getPostDetailModal() {
  if (!postDetailModal) postDetailModal = new Modal(document.getElementById('postDetailModal'));
  return postDetailModal;
}

function getNewNewsModal() {
  if (!newNewsModal) newNewsModal = new Modal(document.getElementById('newNewsModal'));
  return newNewsModal;
}

function getNewQuestionModal() {
  if (!newQuestionModal) newQuestionModal = new Modal(document.getElementById('newQuestionModal'));
  return newQuestionModal;
}

function renderAvatar(name, size = 'md') {
  const initials = getAvatarInitials(name);
  const color = getAvatarColor(name);
  const cls = size === 'sm' ? 'community-avatar-sm' : 'community-avatar';
  return `<span class="${cls}" style="background:${color}">${escapeHtml(initials)}</span>`;
}

function renderAdminBadge(role) {
  if (role === 'admin') return '<span class="badge bg-primary ms-1">ADMIN</span>';
  if (role === 'trainer') return '<span class="badge bg-warning text-dark ms-1">ТРЕНЬОР</span>';
  if (role === 'dietitian') return '<span class="badge bg-info text-dark ms-1">ДИЕТОЛОГ</span>';
  return '';
}

function truncateText(text, max = 180) {
  const trimmed = String(text || '').trim();
  if (trimmed.length <= max) return escapeHtml(trimmed);
  return `${escapeHtml(trimmed.slice(0, max))}...`;
}

async function refreshPostStats(posts) {
  postStats = await fetchPostStats(posts.map((p) => p.id));
}

function renderChatMessages() {
  const container = document.getElementById('chatMessages');
  if (!chatMessages.length) {
    container.innerHTML = '<p class="text-muted text-center py-5">Все още няма съобщения. Бъдете първи!</p>';
    return;
  }

  let lastDate = '';
  container.innerHTML = chatMessages.map((msg) => {
    const dateKey = new Date(msg.created_at).toLocaleDateString('bg-BG');
    const dateSep = dateKey !== lastDate
      ? `<div class="community-date-sep"><span>${dateKey === new Date().toLocaleDateString('bg-BG') ? 'ДНЕС' : dateKey}</span></div>`
      : '';
    lastDate = dateKey;

    return `${dateSep}
      <div class="community-chat-message">
        ${renderAvatar(msg.authorName)}
        <div class="community-chat-bubble">
          <div class="community-chat-meta">
            <strong>${escapeHtml(msg.authorName)}</strong>${renderAdminBadge(msg.authorRole)}
            <span class="text-muted">${formatMessageTime(msg.created_at)}</span>
          </div>
          <div>${escapeHtml(msg.content)}</div>
        </div>
      </div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function renderMembers() {
  document.getElementById('chatOnlineCount').textContent = `${members.length} члена`;
  document.getElementById('chatMembersList').innerHTML = members.map((m) => `
    <div class="community-member-row">
      ${renderAvatar(m.authorName, 'sm')}
      <span>${escapeHtml(m.authorName)}${renderAdminBadge(m.authorRole)}</span>
      ${m.id === currentUser?.id ? '<span class="badge bg-success-subtle text-success ms-auto">Вие</span>' : ''}
    </div>`).join('');
}

function renderNewsFeed() {
  document.getElementById('newsCountLabel').textContent = `${newsPosts.length} новини`;
  const feed = document.getElementById('newsFeed');

  if (!newsPosts.length) {
    feed.innerHTML = '<div class="text-center text-muted py-5">Няма новини. Публикувайте първата!</div>';
    return;
  }

  feed.innerHTML = newsPosts.map((post) => {
    const likes = postStats.likes[post.id] || 0;
    const comments = postStats.comments[post.id] || 0;
    const liked = postStats.userLikes.has(post.id);

    return `
      <article class="card community-post-card card-hover mb-3" data-open-post="${post.id}" role="button">
        ${post.image_url ? `<img src="${escapeHtml(post.image_url)}" class="card-img-top community-post-image" alt="">` : ''}
        <div class="card-body">
          <div class="d-flex align-items-start gap-2 mb-2">
            ${renderAvatar(post.authorName, 'sm')}
            <div>
              <div class="fw-semibold">${escapeHtml(post.authorName)}${renderAdminBadge(post.authorRole)}</div>
              <div class="text-muted small">${formatRelativeTime(post.created_at)}</div>
            </div>
          </div>
          <h3 class="h5">${escapeHtml(post.title)}</h3>
          <p class="text-muted mb-3">${truncateText(post.content, 220)}</p>
          <div class="d-flex gap-3 text-muted small">
            <span><i class="bi bi-heart${liked ? '-fill text-danger' : ''}"></i> ${likes}</span>
            <span><i class="bi bi-chat"></i> ${comments}</span>
          </div>
        </div>
      </article>`;
  }).join('');

  feed.querySelectorAll('[data-open-post]').forEach((el) => {
    el.addEventListener('click', () => openPostDetail(el.dataset.openPost));
  });
}

function renderQuestions() {
  const filtered = activeQuestionCategory === 'all'
    ? questionPosts
    : questionPosts.filter((p) => p.question_category === activeQuestionCategory);

  const list = document.getElementById('questionsList');
  if (!filtered.length) {
    list.innerHTML = '<div class="text-center text-muted py-5">Няма въпроси в тази категория.</div>';
    return;
  }

  list.innerHTML = filtered.map((post) => {
    const likes = postStats.likes[post.id] || 0;
    const comments = postStats.comments[post.id] || 0;

    return `
      <div class="card community-question-row card-hover mb-2" data-open-post="${post.id}" role="button">
        <div class="card-body d-flex align-items-center gap-3">
          ${renderAvatar(post.authorName, 'sm')}
          <div class="flex-grow-1 min-width-0">
            <div class="fw-semibold text-truncate">${escapeHtml(post.title)}</div>
            <div class="text-muted small">
              ${escapeHtml(post.authorName)} · ${getQuestionCategoryLabel(post.question_category)} · ${formatRelativeTime(post.created_at)}
            </div>
          </div>
          <div class="d-flex gap-3 text-muted small flex-shrink-0">
            <span><i class="bi bi-heart"></i> ${likes}</span>
            <span><i class="bi bi-chat"></i> ${comments}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('[data-open-post]').forEach((el) => {
    el.addEventListener('click', () => openPostDetail(el.dataset.openPost));
  });
}

function renderQuestionFilters() {
  document.getElementById('questionCategoryFilters').innerHTML = QUESTION_CATEGORIES.map((cat) => `
    <button type="button" class="btn btn-sm ${activeQuestionCategory === cat.id ? 'btn-success' : 'btn-outline-secondary'}" data-qcat="${cat.id}">
      ${cat.label}
    </button>`).join('');

  document.querySelectorAll('[data-qcat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeQuestionCategory = btn.dataset.qcat;
      renderQuestionFilters();
      renderQuestions();
    });
  });
}

async function openPostDetail(postId) {
  activePostId = postId;
  const post = await fetchPostById(postId);
  const comments = await fetchComments(postId);
  const likes = postStats.likes[postId] || 0;
  const liked = postStats.userLikes.has(postId);

  document.getElementById('postDetailTitle').textContent = post.title;
  document.getElementById('postDetailBody').innerHTML = `
    <div class="d-flex align-items-center gap-2 mb-3">
      ${renderAvatar(post.authorName)}
      <div>
        <div class="fw-semibold">${escapeHtml(post.authorName)}${renderAdminBadge(post.authorRole)}</div>
        <div class="text-muted small">${formatRelativeTime(post.created_at)}</div>
      </div>
    </div>
    ${post.image_url ? `<img src="${escapeHtml(post.image_url)}" class="img-fluid rounded mb-3 w-100" alt="">` : ''}
    <p class="mb-0" style="white-space:pre-wrap">${escapeHtml(post.content)}</p>
    ${post.post_type === 'question' ? `<span class="badge bg-light text-dark border mt-3">${getQuestionCategoryLabel(post.question_category)}</span>` : ''}
  `;

  document.getElementById('postLikeCount').textContent = likes;
  document.getElementById('postCommentCount').textContent = comments.length;
  const likeBtn = document.getElementById('postLikeBtn');
  likeBtn.classList.toggle('active', liked);
  likeBtn.querySelector('i').className = liked ? 'bi bi-heart-fill' : 'bi bi-heart';

  document.getElementById('postCommentsList').innerHTML = comments.length
    ? comments.map((c) => `
        <div class="community-comment">
          ${renderAvatar(c.authorName, 'sm')}
          <div>
            <div class="small"><strong>${escapeHtml(c.authorName)}</strong> <span class="text-muted">${formatRelativeTime(c.created_at)}</span></div>
            <div>${escapeHtml(c.content)}</div>
          </div>
        </div>`).join('')
    : '<p class="text-muted small">Все още няма коментари.</p>';

  getPostDetailModal().show();
}

async function loadChat() {
  chatMessages = await fetchChatMessages(200);
  members = await fetchCommunityMembers();
  renderChatMessages();
  renderMembers();
}

async function loadPosts() {
  [newsPosts, questionPosts] = await Promise.all([
    fetchPosts('news'),
    fetchPosts('question'),
  ]);
  await refreshPostStats([...newsPosts, ...questionPosts]);
  renderNewsFeed();
  renderQuestions();
}

function bindEvents() {
  document.getElementById('chatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = e.target.elements.message;
    const content = input.value.trim();
    if (!content || !currentUser) return;

    try {
      await sendChatMessage(currentUser.id, content);
      input.value = '';
      await loadChat();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('newNewsBtn').addEventListener('click', () => {
    document.getElementById('newNewsForm').reset();
    getNewNewsModal().show();
  });

  document.getElementById('newQuestionBtn').addEventListener('click', () => {
    document.getElementById('newQuestionForm').reset();
    getNewQuestionModal().show();
  });

  document.getElementById('newNewsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const file = form.elements.image.files[0];
    let imageUrl = null;

    if (file) {
      const err = validateImageFile(file);
      if (err) { showToast(err, 'error'); return; }
      imageUrl = await uploadCommunityImage(file, currentUser.id);
    }

    try {
      await createPost({
        post_type: 'news',
        title: form.elements.title.value.trim(),
        content: form.elements.content.value.trim(),
        image_url: imageUrl,
      }, currentUser.id);
      getNewNewsModal().hide();
      showToast('Новината е публикувана!');
      await loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('newQuestionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
      await createPost({
        post_type: 'question',
        title: form.elements.title.value.trim(),
        content: form.elements.content.value.trim(),
        question_category: form.elements.question_category.value,
      }, currentUser.id);
      getNewQuestionModal().hide();
      showToast('Въпросът е публикуван!');
      await loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('postLikeBtn').addEventListener('click', async () => {
    if (!activePostId || !currentUser) return;
    try {
      await togglePostLike(activePostId, currentUser.id);
      await refreshPostStats([...newsPosts, ...questionPosts]);
      await openPostDetail(activePostId);
      renderNewsFeed();
      renderQuestions();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('postCommentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activePostId || !currentUser) return;
    const form = e.target;
    const content = form.elements.comment.value.trim();
    if (!content) return;

    try {
      await createComment(activePostId, currentUser.id, content);
      form.reset();
      await refreshPostStats([...newsPosts, ...questionPosts]);
      await openPostDetail(activePostId);
      renderNewsFeed();
      renderQuestions();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function activateTabFromQuery() {
  const tab = getQueryParam('tab');
  const map = { chat: 'chat-tab', news: 'news-tab', questions: 'questions-tab' };
  const tabId = map[tab];
  if (tabId) document.getElementById(tabId)?.click();
}

async function initObshnost() {
  currentUser = await getCurrentUser();
  if (!currentUser) return;

  const categorySelect = document.getElementById('newQuestionCategory');
  categorySelect.innerHTML = QUESTION_CATEGORIES
    .filter((c) => c.id !== 'all')
    .map((c) => `<option value="${c.id}">${c.label}</option>`)
    .join('');

  renderQuestionFilters();
  bindEvents();
  activateTabFromQuery();

  try {
    await Promise.all([loadChat(), loadPosts()]);
  } catch (err) {
    showToast(err.message || 'Грешка при зареждане на общността.', 'error');
  }

  chatUnsubscribe = subscribeChatMessages(async (payload) => {
    const all = await fetchChatMessages(200);
    const found = all.find((m) => m.id === payload.id);
    if (found && !chatMessages.some((m) => m.id === found.id)) {
      chatMessages.push(found);
      renderChatMessages();
    }
  });
}

window.addEventListener('beforeunload', () => {
  chatUnsubscribe?.();
});

initPage(initObshnost, { requireAuth: true });
