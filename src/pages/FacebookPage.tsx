import { useState, useEffect } from 'react';
import { Users, ThumbsUp, Share2, MessageSquare, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { PageSelector } from '../components/PageSelector';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { usePageSelection, fetchFacebookInsights, fetchFacebookPosts } from '../lib/meta-api';

// Interface pour les posts Facebook
interface Post {
  id: string;
  message?: string;
  created_time: string;
  likes: number;
  comments: number;
  shares?: number;
}

export function FacebookPage() {
  const { selectedPage } = usePageSelection();

  // États pour les données
  const [insights, setInsights] = useState({
    followers: 0,
    engagement: 0,
    reach: 0,
    impressions: 0,
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Format des données pour le graphique
  const [chartData, setChartData] = useState<
    Array<{ date: string; likes: number; comments: number; shares: number }>
  >([]);

  // Chargement des données
  useEffect(() => {
    async function loadData() {
      if (selectedPage) {
        setLoading(true);
        try {
          // Récupérer les insights et les posts
          const [insightsData, postsData] = await Promise.all([
            fetchFacebookInsights(selectedPage.id, selectedPage.access_token),
            fetchFacebookPosts(selectedPage.id, selectedPage.access_token),
          ]);

          // Mettre à jour les insights
          setInsights(insightsData);

          // Mettre à jour les posts
          setPosts(postsData);

          // Formater les données pour le graphique
          const formattedData = postsData.slice(0, 7).map((post) => ({
            date: new Date(post.created_time).toLocaleDateString(),
            likes: post.likes,
            comments: post.comments,
            shares: post.shares || 0,
          }));
          setChartData(formattedData);
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
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
        <h1 className="text-2xl font-bold">Facebook Analytics</h1>
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
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Abonnés Facebook"
              value={insights.followers.toLocaleString()}
              icon={<Users className="w-6 h-6" />}
            />
            <StatCard
              title="Engagement"
              value={insights.engagement.toLocaleString()}
              icon={<TrendingUp className="w-6 h-6" />}
            />
            <StatCard
              title="Portée"
              value={insights.reach.toLocaleString()}
              icon={<Share2 className="w-6 h-6" />}
            />
            <StatCard
              title="Impressions"
              value={insights.impressions.toLocaleString()}
              icon={<MessageSquare className="w-6 h-6" />}
            />
          </div>

          {/* Graphique et publications récentes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Aperçu des performances</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="likes"
                      name="Likes"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="comments"
                      name="Commentaires"
                      stroke="#16a34a"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="shares"
                      name="Partages"
                      stroke="#9333ea"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Publications récentes</h2>
              <div className="space-y-4">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="border-b pb-4 last:border-b-0">
                    <p className="text-sm text-gray-600 mb-2">
                      {post.message || 'Pas de message'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" /> {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" /> {post.shares || 0}
                      </span>
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