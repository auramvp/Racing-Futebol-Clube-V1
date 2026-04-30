import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Calendar, User, ArrowRight, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  date: any;
  author: string;
  category: string;
}

export default function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const newsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as NewsItem[];
        setNews(newsData);
      } catch (error) {
        console.error("Error fetching news:", error);
        // Fallback for old docs
        const querySnapshot = await getDocs(collection(db, 'news'));
        const newsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as NewsItem[];
        setNews(newsData);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Keep Dark */}
      <section className="relative h-[30vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[#c40000]/10 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.4em]">Racing Futebol Clube</span>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
              Notícias <span className="text-[#c40000]">do Clube</span>
            </h1>
            <p className="text-gray-400 font-medium text-sm max-w-xl">
              Fique por dentro de tudo o que acontece no cotidiano do rubro-negro capixaba.
            </p>
          </motion.div>
        </div>
      </section>

      {/* News Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {news.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col h-full bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden"
              >
                <Link to={`/noticias/${item.id}`} className="relative aspect-video overflow-hidden bg-zinc-100">
                  <img 
                    src={(item as any).image || (item as any).imageUrl || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop'} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-xl">
                      {item.category || 'Geral'}
                    </span>
                  </div>
                </Link>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-red-600" />
                      {item.date?.toDate ? item.date.toDate().toLocaleDateString('pt-BR') : (item.date || 'Recent')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-red-600" />
                      {item.author || 'Racing FC'}
                    </div>
                  </div>

                  <h2 className="text-2xl font-black text-black uppercase italic tracking-tighter mb-4 leading-tight group-hover:text-red-600 transition-colors">
                    <Link to={`/noticias/${item.id}`}>{item.title}</Link>
                  </h2>

                  <p className="text-gray-600 font-medium text-sm leading-relaxed mb-8 flex-1 line-clamp-3">
                    {(item as any).subtitle || item.summary || item.content?.substring(0, 150) + '...'}
                  </p>

                  <Link 
                    to={`/noticias/${item.id}`}
                    className="inline-flex items-center gap-2 text-black font-black uppercase text-xs tracking-widest group/btn"
                  >
                    Ler Matéria Completa 
                    <ArrowRight size={16} className="text-red-600 group-hover/btn:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 space-y-6">
            <Newspaper size={64} className="mx-auto text-gray-100" />
            <h2 className="text-3xl font-black text-black uppercase italic tracking-tighter">Nenhuma Notícia Publicada</h2>
            <p className="text-gray-400 font-medium">Fique atento, em breve traremos as novidades do clube.</p>
          </div>
        )}
      </section>
    </div>
  );
}
