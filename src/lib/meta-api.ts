import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Page {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

interface FacebookInsights {
  followers: number;
  engagement: number;
  reach: number;
  impressions: number;
}

interface InstagramInsights {
  followers: number;
  engagement: number;
  likes: number;
  comments: number;
}

interface Post {
  id: string;
  message?: string;
  created_time: string;
  likes: number;
  comments: number;
  shares?: number;
  media_url?: string;
}

export async function fetchPages(): Promise<Page[]> {
  try {
    const response = await fetch(`${API_URL}/api/pages`);
    if (!response.ok) {
      throw new Error('Failed to fetch pages');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

export async function fetchFacebookInsights(pageId: string, accessToken: string): Promise<FacebookInsights> {
  try {
    const response = await fetch(
      `${API_URL}/api/facebook/insights/${pageId}?access_token=${accessToken}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch Facebook insights');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Facebook insights:', error);
    return {
      followers: 0,
      engagement: 0,
      reach: 0,
      impressions: 0,
    };
  }
}

export async function fetchInstagramInsights(igAccountId: string, accessToken: string): Promise<InstagramInsights> {
  try {
    const response = await fetch(
      `${API_URL}/api/instagram/insights/${igAccountId}?access_token=${accessToken}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch Instagram insights');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Instagram insights:', error);
    return {
      followers: 0,
      engagement: 0,
      likes: 0,
      comments: 0,
    };
  }
}

export async function fetchFacebookPosts(pageId: string, accessToken: string): Promise<Post[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/facebook/posts/${pageId}?access_token=${accessToken}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch Facebook posts');
    }
    const posts = await response.json();
    return posts.map((post: Post) => ({
      ...post,
      message: post.message || 'No message'
    }));
  } catch (error) {
    console.error('Error fetching Facebook posts:', error);
    return [];
  }
}

export async function fetchInstagramPosts(igAccountId: string, accessToken: string): Promise<Post[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/instagram/posts/${igAccountId}?access_token=${accessToken}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch Instagram posts');
    }
    const posts = await response.json();
    return posts.map((post: Post) => ({
      ...post,
      message: post.message || 'No caption'
    }));
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return [];
  }
}

export function usePageSelection() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPages() {
      try {
        setLoading(true);
        setError(null);
        const fetchedPages = await fetchPages();
        
        if (fetchedPages.length === 0) {
          setError('No pages found');
        } else {
          setPages(fetchedPages);
          if (!selectedPage) {
            setSelectedPage(fetchedPages[0]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pages');
        console.error('Error loading pages:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPages();
  }, [selectedPage]);

  return {
    pages,
    selectedPage,
    setSelectedPage,
    loading,
    error,
  };
}