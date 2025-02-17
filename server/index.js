import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:5173'], // Autorise plusieurs origines
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// Routes for Facebook Graph API
app.get('/api/pages', async (req, res) => {
  try {
    if (!process.env.VITE_FACEBOOK_PAGE_TOKEN) {
      return res.status(400).json({ error: 'Facebook Page Token is missing' });
    }

    const response = await axios.get(
      `https://graph.facebook.com/v22.0/me/accounts`,
      {
        params: {
          access_token: process.env.VITE_FACEBOOK_PAGE_TOKEN,
          fields: 'name,access_token,instagram_business_account'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching pages:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

app.get('/api/facebook/insights/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    if (!/^\d+$/.test(pageId)) {
      return res.status(400).json({ error: 'Invalid page ID' });
    }

    const { access_token } = req.query;
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const [followers, insights] = await Promise.all([
      axios.get(`https://graph.facebook.com/v22.0/${pageId}`, {
        params: {
          fields: 'followers_count',
          access_token
        }
      }),
      axios.get(`https://graph.facebook.com/v22.0/${pageId}/insights`, {
        params: {
          metric: 'page_impressions,page_engaged_users,page_post_engagements',
          period: 'day',
          access_token
        }
      })
    ]);

    res.json({
      followers: followers.data.followers_count || 0,
      engagement: insights.data.data.find(d => d.name === 'page_engaged_users')?.values[0]?.value || 0,
      reach: insights.data.data.find(d => d.name === 'page_impressions')?.values[0]?.value || 0,
      impressions: insights.data.data.find(d => d.name === 'page_post_engagements')?.values[0]?.value || 0
    });
  } catch (error) {
    console.error('Error fetching Facebook insights:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Facebook insights' });
  }
});

app.get('/api/facebook/posts/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    if (!/^\d+$/.test(pageId)) {
      return res.status(400).json({ error: 'Invalid page ID' });
    }

    const { access_token } = req.query;
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const response = await axios.get(
      `https://graph.facebook.com/v22.0/${pageId}/posts`,
      {
        params: {
          fields: 'message,created_time,likes.summary(true),comments.summary(true),shares',
          access_token
        }
      }
    );

    const posts = response.data.data.map(post => ({
      id: post.id,
      message: post.message || 'No message',
      created_time: post.created_time,
      likes: post.likes?.summary?.total_count || 0,
      comments: post.comments?.summary?.total_count || 0,
      shares: post.shares?.count || 0
    }));

    res.json(posts);
  } catch (error) {
    console.error('Error fetching Facebook posts:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Facebook posts' });
  }
});

app.get('/api/instagram/insights/:igAccountId', async (req, res) => {
  try {
    const { igAccountId } = req.params;
    const { access_token } = req.query;
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const [followers, insights] = await Promise.all([
      axios.get(`https://graph.facebook.com/v22.0/${igAccountId}`, {
        params: {
          fields: 'followers_count',
          access_token
        }
      }),
      axios.get(`https://graph.facebook.com/v22.0/${igAccountId}/insights`, {
        params: {
          metric: 'impressions,reach,profile_views',
          period: 'day',
          access_token
        }
      })
    ]);

    res.json({
      followers: followers.data.followers_count || 0,
      engagement: insights.data.data.find(d => d.name === 'profile_views')?.values[0]?.value || 0,
      likes: insights.data.data.find(d => d.name === 'reach')?.values[0]?.value || 0,
      comments: insights.data.data.find(d => d.name === 'impressions')?.values[0]?.value || 0
    });
  } catch (error) {
    console.error('Error fetching Instagram insights:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Instagram insights' });
  }
});

app.get('/api/instagram/posts/:igAccountId', async (req, res) => {
  try {
    const { igAccountId } = req.params;
    const { access_token } = req.query;
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const response = await axios.get(
      `https://graph.facebook.com/v22.0/${igAccountId}/media`,
      {
        params: {
          fields: 'caption,timestamp,like_count,comments_count,media_url',
          access_token
        }
      }
    );

    const posts = response.data.data.map(post => ({
      id: post.id,
      message: post.caption || 'No caption',
      created_time: post.timestamp,
      likes: post.like_count,
      comments: post.comments_count,
      media_url: post.media_url
    }));

    res.json(posts);
  } catch (error) {
    console.error('Error fetching Instagram posts:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Instagram posts' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});