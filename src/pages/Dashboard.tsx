import { useState, useEffect } from 'react';
import { Users, ThumbsUp, Share2, MessageSquare } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { PageSelector } from '../components/PageSelector';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  usePageSelection,
  fetchFacebookInsights,
  fetchInstagramInsights,
  fetchFacebookPosts,
  fetchInstagramPosts,
} from '../lib/meta-api';

// Define types for aggregated stats and combined posts
interface AggregatedStats {
  totalFollowers: number;
  totalEngagement: number;
  totalLikes: number;
  totalComments: number;
}

interface CombinedPost {
  id: string;
  platform: 'facebook' | 'instagram';
  message?: string;
  created_time: string;
  likes: number;
  comments: number;
  shares?: number;
  media_url?: string;
}

// Define a type for platform comparison data
interface PlatformComparisonData {
  name: string;
  followers: number;
  engagement: number;
  reach: number;
}

export function Dashboard() {
  const { selectedPage } = usePageSelection();

  const [stats, setStats] = useState<AggregatedStats>({
    totalFollowers: 0,
    totalEngagement: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  const [posts, setPosts] = useState<CombinedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformData, setPlatformData] = useState<PlatformComparisonData[]>([]);

  useEffect(() => {
    async function loadData() {
      if (selectedPage) {
        setLoading(true);
        try {
          // Fetch Facebook and Instagram insights and posts
          const [fbInsights, igInsights, fbPosts, igPosts] = await Promise.all([
            fetchFacebookInsights(selectedPage.id, selectedPage.access_token),
            selectedPage.instagram_business_account
              ? fetchInstagramInsights(
                  selectedPage.instagram_business_account.id,
                  selectedPage.access_token
                )
              : Promise.resolve({ followers: 0, engagement: 0, likes: 0, comments: 0 }),
            fetchFacebookPosts(selectedPage.id, selectedPage.access_token),
            selectedPage.instagram_business_account
              ? fetchInstagramPosts(
                  selectedPage.instagram_business_account.id,
                  selectedPage.access_token
                )
              : Promise.resolve([]),
          ]);

          // Log the raw data from API calls
          console.log('Facebook Insights:', fbInsights);
          console.log('Instagram Insights:', igInsights);
          console.log('Facebook Posts:', fbPosts);
          console.log('Instagram Posts:', igPosts);

          // Aggregate stats
          const aggregatedStats = {
            totalFollowers: fbInsights.followers + igInsights.followers,
            totalEngagement: fbInsights.engagement + igInsights.engagement,
            totalLikes:
              fbPosts.reduce((sum, post) => sum + post.likes, 0) +
              igPosts.reduce((sum, post) => sum + post.likes, 0),
            totalComments:
              fbPosts.reduce((sum, post) => sum + post.comments, 0) +
              igPosts.reduce((sum, post) => sum + post.comments, 0),
          };
          console.log('Aggregated Stats:', aggregatedStats);
          setStats(aggregatedStats);

          // Combine and sort posts
          const combinedPosts = [
            ...fbPosts.map((post) => ({ ...post, platform: 'facebook' as const })),
            ...igPosts.map((post) => ({ ...post, platform: 'instagram' as const })),
          ].sort((a, b) =>
            new Date(b.created_time).getTime() - new Date(a.created_time).getTime()
          );
          console.log('Combined Posts:', combinedPosts);
          setPosts(combinedPosts);

          // Platform comparison data
          const platformComparisonData = [
            {
              name: 'Facebook',
              followers: fbInsights.followers,
              engagement: fbInsights.engagement,
              reach: fbInsights.reach,
            },
            {
              name: 'Instagram',
              followers: igInsights.followers,
              engagement: igInsights.engagement,
              reach: igInsights.likes, // Using likes as reach for Instagram
            },
          ];
          console.log('Platform Comparison Data:', platformComparisonData);
          setPlatformData(platformComparisonData);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [selectedPage]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vue d'ensemble</h1>
        <PageSelector />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Abonnés"
              value={stats.totalFollowers.toLocaleString()}
              icon={<Users className="w-6 h-6" />}
            />
            <StatCard
              title="Total Engagement"
              value={stats.totalEngagement.toLocaleString()}
              icon={<Share2 className="w-6 h-6" />}
            />
            <StatCard
              title="Total Likes"
              value={stats.totalLikes.toLocaleString()}
              icon={<ThumbsUp className="w-6 h-6" />}
            />
            <StatCard
              title="Total Commentaires"
              value={stats.totalComments.toLocaleString()}
              icon={<MessageSquare className="w-6 h-6" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Comparaison des Plateformes</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="followers" name="Abonnés" fill="#2563eb" />
                    <Bar dataKey="engagement" name="Engagement" fill="#16a34a" />
                    <Bar dataKey="reach" name="Portée" fill="#9333ea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Activité Récente</h2>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded ${
                            post.platform === 'facebook'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {post.platform === 'facebook' ? 'Facebook' : 'Instagram'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(post.created_time).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{post.message || 'No message'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" /> {post.comments}
                        </span>
                        {post.platform === 'facebook' && post.shares && (
                          <span className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" /> {post.shares}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}