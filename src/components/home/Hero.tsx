import { motion } from 'motion/react';
import { Menu, X, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, getDocs, updateDoc, increment } from 'firebase/firestore';
import { Link } from 'react-router-dom';


export default function Hero() {
  const [imageUrl, setImageUrl] = useState('/campeao.png');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeCard, setActiveCard] = useState<any>(null);

  useEffect(() => {
    // Target date: 5 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const heroDoc = await getDoc(doc(db, 'highlights', 'hero'));
        if (heroDoc.exists()) {
          const heroData = heroDoc.data() as any;
          if (heroData.imageUrl) setImageUrl(heroData.imageUrl);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchHero();

    const fetchCard = async () => {
      try {
        const snap = await getDocs(collection(db, 'campaigns'));
        const allCampaigns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Encontra o primeiro card ativo
        const active = allCampaigns.find((c: any) => c.type === 'card' && c.active === true);
        if (active) {
          setActiveCard(active);
        } else {
          setActiveCard(null);
        }
      } catch (e) {
        console.error('Erro ao carregar card:', e);
      }
    };
    fetchCard();
  }, []);

  const handleCardClick = async () => {
    if (!activeCard) return;
    try {
      await updateDoc(doc(db, 'campaigns', activeCard.id), {
        clicks: increment(1)
      });
    } catch (e) {
      console.error('Erro ao registrar clique:', e);
    }
  };

  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black">
      {/* Background Image / Pattern */}
      <div className="absolute inset-0 opacity-60">
        <img
          src={imageUrl}
          alt="Stadium atmosphere"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 via-transparent to-transparent"></div>
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-20 h-full flex items-end pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-3"
          >
            <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 uppercase tracking-[0.4em] italic">
              Racing Futebol Clube
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.9] mb-12"
          >
            Uma vez Racing<br />
            <span className="text-[#c40000]">Sempre Racing...</span>
          </motion.h1>

          {/* Advertising Card - Dynamic from Firestore */}
          {activeCard && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ 
                initial: { delay: 0.4 },
                scale: { duration: 0.2 },
                y: { duration: 0.2 }
              }}
              className="relative group max-w-sm w-full cursor-pointer"
            >
              <div className="absolute inset-0 bg-red-600 rounded-xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

              <div className="relative bg-[#0f0f0f] rounded-xl overflow-hidden shadow-2xl border border-white/5 group-hover:border-white/20 transition-colors duration-300">
                <a 
                  href={activeCard.destinationUrl || '#'} 
                  target={activeCard.destinationUrl?.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  onClick={handleCardClick}
                  className="block"
                >
                  <div className="relative aspect-[21/9] w-full overflow-hidden">
                    <img 
                      src={activeCard.image} 
                      alt={activeCard.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  </div>

                  <div className="p-4 flex items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/5 bg-black flex items-center justify-center">
                        <img 
                          src="/racing-fc.png" 
                          alt="Racing FC" 
                          className="w-8 h-8 object-contain opacity-50 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <h3 className="text-white font-black uppercase italic text-sm leading-tight truncate group-hover:text-red-500 transition-colors">
                          {activeCard.headline || activeCard.title}
                        </h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase italic leading-tight line-clamp-1">
                          {activeCard.subtitle || 'Clique para saber mais'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#c40000] hover:bg-red-700 text-white px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-red-900/20 group-hover:shadow-red-600/40 whitespace-nowrap italic">
                        {activeCard.buttonText || 'Acessar'}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Side Decorative Element */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 opacity-5">
        <div className="grid grid-cols-4 gap-1 p-2">
           {Array.from({ length: 16 }).map((_, i) => (
             <div key={i} className="w-12 h-12 border border-white"></div>
           ))}
        </div>
      </div>
    </section>
  );
}

