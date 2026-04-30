import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function TrophiesGallery() {
  const [trophies, setTrophies] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrophies = async () => {
      try {
        const q = query(collection(db, 'trophies'), orderBy('year', 'desc'), limit(3));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setTrophies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          // Fallback if empty
          setTrophies([
            { id: '1', year: '1960', title: 'Campeonato Capixaba', description: 'A maior glória do futebol capixaba.', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop' },
            { id: '2', year: '1955', title: 'Taça Cidade de Vitória', description: 'Conquista histórica na capital.', imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop' },
            { id: '3', year: '1962', title: 'Torneio Início', description: 'Tradição e força rubro-negra.', imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop' }
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTrophies();
  }, []);

  return (
    <section className="py-24 bg-black text-white overflow-hidden relative border-t border-white/5">
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
         <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-600 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-red-600 font-black uppercase text-xs tracking-[0.3em] mb-4 block">Nossa Galeria de Glórias</span>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
               RACING <span className="text-red-800">CAMPEÃO</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-medium">
               Momentos eternizados e troféus que contam a história de um clube nascido para vencer.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {trophies.map((item, index) => (
             <motion.div
               key={item.id}
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: index * 0.1 }}
               viewport={{ once: true }}
               whileHover={{ y: -15 }}
               className="group relative bg-zinc-900/50 border border-white/10 overflow-hidden backdrop-blur-sm"
             >
                <div className="aspect-[4/5] overflow-hidden">
                   <img
                     src={item.imageUrl}
                     alt={item.title}
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                     referrerPolicy="no-referrer"
                   />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/95 to-transparent">
                   <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest mb-4">
                      <Trophy size={12} /> {item.year}
                   </div>
                   <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2 group-hover:text-red-600 transition-colors">
                     {item.title}
                   </h3>
                   <p className="text-gray-400 text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                     {item.description}
                   </p>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="mt-20 text-center">
           <div className="inline-block p-1 bg-zinc-900 border border-white/10 rounded-sm">
              <Link to="/trofeus" className="inline-block bg-red-600 text-white px-12 py-5 font-black uppercase text-sm tracking-widest hover:bg-red-700 transition-all shadow-xl">
                Ver Todas as Conquistas
              </Link>
           </div>
        </div>
      </div>
    </section>
  );
}
