import { getSupabaseOrThrow } from '../supabaseClient.js';
import { getAuthorDisplayName } from '../utils/helpers.js';
import { buildRoleMap } from '../data/roles.js';

async function attachAuthors(rows) {
  if (!rows?.length) return [];

  const client = getSupabaseOrThrow();
  const authorIds = [...new Set(rows.map((r) => r.author_id))];

  const { data: profiles, error: profilesError } = await client
    .from('profiles')
    .select('id, full_name')
    .in('id', authorIds);

  if (profilesError) throw profilesError;

  const { data: roles, error: rolesError } = await client
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', authorIds);

  if (rolesError) throw rolesError;

  const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  const roleMap = buildRoleMap(roles);

  return rows.map((row) => ({
    ...row,
    authorName: getAuthorDisplayName(profileMap[row.author_id]?.full_name, roleMap[row.author_id]),
    authorRole: roleMap[row.author_id] || 'user',
  }));
}

export async function fetchPosts(postType) {
  let query = getSupabaseOrThrow()
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (postType) query = query.eq('post_type', postType);

  const { data, error } = await query;
  if (error) throw error;
  return attachAuthors(data || []);
}

export async function fetchPostById(id) {
  const { data, error } = await getSupabaseOrThrow()
    .from('community_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  const [post] = await attachAuthors([data]);
  return post;
}

export async function createPost(post, authorId) {
  const { data, error } = await getSupabaseOrThrow()
    .from('community_posts')
    .insert({
      author_id: authorId,
      post_type: post.post_type,
      title: post.title,
      content: post.content,
      image_url: post.image_url || null,
      question_category: post.question_category || 'general',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(id) {
  const { error } = await getSupabaseOrThrow()
    .from('community_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function fetchPostStats(postIds) {
  if (!postIds.length) return { likes: {}, comments: {}, userLikes: new Set() };

  const client = getSupabaseOrThrow();
  const [{ data: likes, error: likesError }, { data: comments, error: commentsError }] = await Promise.all([
    client.from('community_post_likes').select('post_id, user_id').in('post_id', postIds),
    client.from('community_comments').select('post_id').in('post_id', postIds),
  ]);

  if (likesError) throw likesError;
  if (commentsError) throw commentsError;

  const likeCounts = {};
  const userLikes = new Set();
  const user = (await client.auth.getUser()).data.user;

  (likes || []).forEach((row) => {
    likeCounts[row.post_id] = (likeCounts[row.post_id] || 0) + 1;
    if (user && row.user_id === user.id) userLikes.add(row.post_id);
  });

  const commentCounts = {};
  (comments || []).forEach((row) => {
    commentCounts[row.post_id] = (commentCounts[row.post_id] || 0) + 1;
  });

  return { likes: likeCounts, comments: commentCounts, userLikes };
}

export async function togglePostLike(postId, userId) {
  const client = getSupabaseOrThrow();
  const { data: existing, error: findError } = await client
    .from('community_post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (findError) throw findError;

  if (existing) {
    const { error } = await client.from('community_post_likes').delete().eq('id', existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await client.from('community_post_likes').insert({ post_id: postId, user_id: userId });
  if (error) throw error;
  return true;
}

export async function fetchComments(postId) {
  const { data, error } = await getSupabaseOrThrow()
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return attachAuthors(data || []);
}

export async function createComment(postId, authorId, content) {
  const { data, error } = await getSupabaseOrThrow()
    .from('community_comments')
    .insert({ post_id: postId, author_id: authorId, content })
    .select()
    .single();

  if (error) throw error;
  const [comment] = await attachAuthors([data]);
  return comment;
}

export async function fetchChatMessages(limit = 100) {
  const { data, error } = await getSupabaseOrThrow()
    .from('community_chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return attachAuthors(data || []);
}

export async function sendChatMessage(authorId, content) {
  const { data, error } = await getSupabaseOrThrow()
    .from('community_chat_messages')
    .insert({ author_id: authorId, content })
    .select()
    .single();

  if (error) throw error;
  const [message] = await attachAuthors([data]);
  return message;
}

export function subscribeChatMessages(onInsert) {
  const client = getSupabaseOrThrow();
  const channel = client
    .channel('community-chat')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'community_chat_messages' },
      (payload) => onInsert(payload.new),
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

export async function fetchCommunityMembers() {
  const client = getSupabaseOrThrow();

  const { data: profiles, error } = await client
    .from('profiles')
    .select('id, full_name, created_at')
    .order('full_name', { ascending: true });

  if (error) throw error;

  const { data: roles, error: rolesError } = await client
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) throw rolesError;

  const roleMap = buildRoleMap(roles);

  return (profiles || []).map((profile) => ({
    ...profile,
    authorRole: roleMap[profile.id] || 'user',
    authorName: getAuthorDisplayName(profile.full_name, roleMap[profile.id]),
  }));
}
