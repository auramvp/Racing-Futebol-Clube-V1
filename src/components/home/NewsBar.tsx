import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function NewsBar() {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Tenta buscar ordenado por data de criação
        const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(4));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNews(data);
      } catch (e) {
        console.error('Erro ao buscar notícias (ordenado):', e);
        // Fallback: Busca sem ordenação e ordena no front-end para garantir que apareça
        try {
          const q = query(collection(db, 'news'), limit(10));
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Ordena manualmente pelas mais recentes (createdAt ou date)
          const sortedData = data.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 4);
          setNews(sortedData);
        } catch (err) {
          console.error('Erro fatal ao buscar notícias:', err);
        }
      }
    };
    fetchNews();
  }, []);

  return (
    <section className="bg-black py-8 border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-red-900/5 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex flex-col">
            <Link to="/noticias" className="flex items-center gap-2 group w-fit mb-1">
              <span className="h-px w-6 bg-red-600 transition-all group-hover:w-10"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-white transition-colors">Últimas Notícias</span>
            </Link>
            <h2 className="text-white font-black text-xl uppercase italic tracking-tighter">Fique por dentro <span className="text-red-600">do Clube</span></h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar flex-1 md:justify-end">
            {news.map((item, i) => (
              <Link key={item.id || i} to={`/noticias/${item.id}`}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  className="min-w-[280px] h-20 bg-white rounded-xl p-2 shadow-lg relative overflow-hidden group cursor-pointer transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center gap-3 h-full">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img 
                        src={item.image || item.imageUrl || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=200&auto=format&fit=crop'} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="text-red-600 font-black text-[8px] uppercase block mb-0.5 tracking-wider">{item.date || 'NOTÍCIA'}</span>
                      <h3 className="text-black font-black text-xs uppercase tracking-tighter truncate leading-tight mb-0.5">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-[10px] font-bold line-clamp-1 leading-tight lowercase first-letter:uppercase">
                        {item.summary || 'Clique para ler os detalhes da notícia...'}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
