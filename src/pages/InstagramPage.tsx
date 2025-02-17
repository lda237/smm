import { useState, useEffect } from 'react'; // Removed unused `React` import
import {
  Users,
  Heart,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'; // Removed unused imports: Share2, Calendar, Image
import { StatCard } from '../components/StatCard';
import { PageSelector } from '../components/PageSelector';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { usePageSelection, fetchInstagramInsights, fetchInstagramPosts } from '../lib/meta-api';

// Define the Post interface (assuming it's already defined in meta-api.ts)
interface Post {
  id: string;
  message?: string;
  created_time: string;
  likes: number;
  comments: number;
  media_url?: string; // Optional field for media URL
}

export function InstagramPage() {
  const { selectedPage } = usePageSelection();

  // Fix type mismatch for posts by explicitly defining the type as Post[]
  const [insights, setInsights] = useState({
    followers: 0,
    engagement: 0,
    likes: 0,
    comments: 0,
  });
  const [posts, setPosts] = useState<Post[]>([]); // Explicitly define type as Post[]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (selectedPage?.instagram_business_account) {
        setLoading(true);
        try {
          const [insightsData, postsData] = await Promise.all([
            fetchInstagramInsights(
              selectedPage.instagram_business_account.id,
              selectedPage.access_token
            ),
            fetchInstagramPosts(
              selectedPage.instagram_business_account.id,
              selectedPage.access_token
            ),
          ]);
          setInsights(insightsData);
          setPosts(postsData); // No type error now
        } catch (error) {
          console.error('Error loading data:', error);
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
        <h1 className="text-2xl font-bold">Instagram Analytics</h1>
        <div className="flex items-center gap-4">
          <PageSelector />
          <select className="px-4 py-2 border rounded-lg">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>3 derniers mois</option>
          </select>
        </div>
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
              title="Abonnés Instagram"
              value={insights.followers.toLocaleString()}
              icon={<Users className="w-6 h-6" />}
            />
            <StatCard
              title="Engagement"
              value={insights.engagement.toLocaleString()}
              icon={<TrendingUp className="w-6 h-6" />}
            />
            <StatCard
              title="Likes"
              value={insights.likes.toLocaleString()}
              icon={<Heart className="w-6 h-6" />}
            />
            <StatCard
              title="Commentaires"
              value={insights.comments.toLocaleString()}
              icon={<MessageSquare className="w-6 h-6" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Engagement hebdomadaire</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={posts.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="created_time"
                      tickFormatter={(time) => new Date(time).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="likes" name="Likes" fill="#ec4899" />
                    <Bar dataKey="comments" name="Commentaires" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Publications populaires</h2>
              <div className="space-y-4">
                {posts.slice(0, 5).map((post: Post) => ( // Replace `any` with `Post`
                  <div key={post.id} className="flex items-start gap-4 border-b pb-4 last:border-b-0">
                    {post.media_url && (
                      <img
                        src={post.media_url}
                        alt="Post"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-2">
                        {new Date(post.created_time).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-pink-500" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4 text-purple-500" /> {post.comments}
                        </span>
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