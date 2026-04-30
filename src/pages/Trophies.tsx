import { motion } from 'motion/react';
import { Trophy, Award, Star, History as HistoryIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function Trophies() {
  const [trophies, setTrophies] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrophies = async () => {
      try {
        const q = query(collection(db, 'trophies'), orderBy('year', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setTrophies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          // Default data if Firestore is empty
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
    <div className="bg-white min-h-screen text-black">
      {/* Hero Header - Keep Dark */}
      <section className="relative py-24 border-b border-white/5 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1920&auto=format&fit=crop" 
            alt="Trophy background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <span className="text-red-600 font-black uppercase text-xs tracking-[0.5em] mb-4 block">Memorial Racing FC</span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 leading-none text-white">
              GALERIA DE <span className="text-red-700">TROFÉUS</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl font-medium leading-relaxed">
              Cada conquista é um capítulo da nossa imortal história. Explore o legado de glórias do rubro-negro capixaba.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Stats / Summary */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Títulos Estaduais', value: '12', icon: Trophy },
            { label: 'Torneios Início', value: '08', icon: Star },
            { label: 'Taças de Prata', value: '03', icon: Award },
            { label: 'Anos de Glória', value: '73', icon: HistoryIcon },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <stat.icon className="mx-auto mb-4 text-red-600 group-hover:scale-110 transition-transform" size={24} />
              <div className="text-4xl font-black italic text-black mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trophies Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {trophies.map((trophy, index) => (
            <motion.div
              key={trophy.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-xl hover:shadow-2xl hover:border-red-600/20 transition-all duration-500"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-100 mb-8">
                <img 
                  src={trophy.imageUrl} 
                  alt={trophy.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-6 left-6 flex flex-col items-start translate-x-[-20%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="bg-red-600 text-white px-4 py-1 font-black text-[10px] uppercase tracking-widest italic rounded-full">CONQUISTA</span>
                </div>
              </div>
              
              <div className="space-y-4 px-2">
                <div className="flex items-center justify-between">
                  <span className="text-red-600 font-black text-3xl italic tracking-tighter">{trophy.year}</span>
                  <div className="h-px bg-gray-100 flex-grow mx-4"></div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                    <Trophy size={18} className="text-gray-300 group-hover:text-red-600 transition-colors" />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-4 group-hover:bg-red-600 transition-all duration-500">
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-black transition-colors group-hover:text-white leading-tight">
                    {trophy.title}
                  </h3>
                </div>
                
                <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-3">
                  {trophy.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-red-600 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-8 leading-none">
            A NOSSA HISTÓRIA <span className="text-black">SE SEGUE ESCREVENDO</span>
          </h2>
          <p className="text-red-100 text-lg mb-12 font-medium max-w-2xl mx-auto">
            Apoie o Racing FC rumo a novas conquistas. Sua participação é fundamental para o futuro do rubro-negro.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button className="bg-black text-white px-12 py-5 font-black uppercase text-sm tracking-widest hover:bg-zinc-900 transition-all">
              Visitar Memorial
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
