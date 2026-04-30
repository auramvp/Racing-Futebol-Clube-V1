import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Player } from '../types';
import { User, Shield } from 'lucide-react';

export default function Squad() {
  const { category } = useParams<{ category: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // Map URL category to Display Name
  const categoryMap: Record<string, string> = {
    'profissional': 'Profissional',
    'sub-7': 'Sub 7',
    'sub-9': 'Sub 9',
    'sub-11': 'Sub 11',
    'sub-13': 'Sub 13',
    'sub-15': 'Sub 15',
    'sub-17': 'Sub 17',
    'sub-21': 'Sub 21',
    '+40': '+40',
    '+50': '+50'
  };

  const displayName = categoryMap[category || ''] || 'Elenco';

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'players'), 
          where('category', '==', displayName)
        );
        const querySnapshot = await getDocs(q);
        const playersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];
        setPlayers(playersData);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [displayName]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Keep Dark */}
      <section className="relative h-[20vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[#c40000]/10 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <span className="text-red-600 font-black uppercase text-[8px] tracking-[0.5em]">Racing Futebol Clube</span>
            <h1 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
              Elenco <span className="text-[#c40000]">{displayName}</span>
            </h1>
            <p className="text-gray-400 font-medium text-xs max-w-2xl">
              Conheça os atletas da categoria {displayName}.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : players.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-gray-50 border border-gray-100 p-1.5 shadow-sm hover:shadow-lg transition-all relative overflow-hidden"
              >
                  {/* Photo Placeholder/Image */}
                  <div className="aspect-[3/4] bg-white border border-gray-100 mb-1.5 overflow-hidden relative">
                    {player.photoUrl ? (
                      <img src={player.photoUrl} alt={player.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <User size={30} />
                      </div>
                    )}
                    
                    {player.number && (
                      <div className="absolute bottom-0 left-0 p-1 text-xl font-black text-black/5 group-hover:text-red-600/20 transition-colors">
                        #{player.number}
                      </div>
                    )}
                  </div>

                  {/* Info Area */}
                  <div className="space-y-0">
                    <h3 className="text-red-600 font-black uppercase italic text-sm tracking-tighter group-hover:translate-x-1 transition-transform truncate">
                      {player.nickname}
                    </h3>
                    <div className="space-y-0">
                       <p className="text-black font-bold text-[7px] uppercase tracking-widest truncate">{player.name}</p>
                       <p className="text-gray-500 font-medium text-[7px] uppercase tracking-widest flex items-center gap-1">
                         {player.position || 'Atleta'}
                       </p>
                    </div>
                  </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-6">
            <Shield size={64} className="mx-auto text-white/10" />
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Nenhum atleta cadastrado</h3>
              <p className="text-gray-400 font-medium">Estamos preparando as informações desta categoria.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
