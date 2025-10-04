import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch posts failed', err);
      setError('Could not load posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please enter title and content');
      return;
    }
    try {
      await axios.post(`${API_URL}/posts`, { title, content });
      await fetchPosts();
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Create post failed', err);
      alert('Create failed');
    }
  };

  const updatePost = async (id) => {
    if (!title.trim() || !content.trim()) {
      alert('Please enter title and content');
      return;
    }
    try {
      await axios.put(`${API_URL}/posts/${id}`, { title, content });
      await fetchPosts();
      setTitle('');
      setContent('');
      setEditingPost(null);
    } catch (err) {
      console.error('Update post failed', err);
      alert('Update failed');
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`${API_URL}/posts/${id}`);
      fetchPosts();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  const editPost = (post) => {
    if (!post) return;
    setEditingPost(post.id);
    setTitle(post.title || '');
    setContent(post.content || '');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (editingPost) {
      updatePost(editingPost);
    } else {
      createPost();
    }
  };

  return (
    <div className="App container">
      <h1>Simple Posts</h1>

      <form className="postForm" onSubmit={onSubmit}>
        <input
          className="input"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="textarea"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <div className="formActions">
          <button className="btn primary" type="submit">
            {editingPost ? 'Update Post' : 'Create Post'}
          </button>
          {editingPost && (
            <button
              type="button"
              className="btn cancel"
              onClick={() => {
                setEditingPost(null);
                setTitle('');
                setContent('');
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="postsSection">
        <h2>Posts</h2>
        {loading && <p className="muted">Loading posts...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="muted">No posts yet — create one!</p>
        )}

        <ul className="postsList">
          {posts.slice().reverse().map((post) => (
            <li key={post.id} className="postCard">
              <div className="postHead">
                <h3 className="postTitle">{post.title}</h3>
                <div className="postActions">
                  <button className="btn edit" onClick={() => editPost(post)}>
                    Edit
                  </button>
                  <button className="btn danger" onClick={() => deletePost(post.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <p className="postContent">{post.content}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;

