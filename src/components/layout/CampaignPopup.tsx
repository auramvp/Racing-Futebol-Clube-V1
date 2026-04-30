import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, query, where, getDocs, limit, orderBy, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Campaign {
  id: string;
  type: string;
  image: string;
  destinationUrl: string;
  title?: string;
  active: boolean;
}

export default function CampaignPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        let docs: Campaign[] = [];
        try {
          const q = query(
            collection(db, 'campaigns'),
            where('active', '==', true)
          );
          const querySnapshot = await getDocs(q);
          docs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Campaign));
        } catch (e) {
          // Fallback if index is not ready
          const querySnapshot = await getDocs(collection(db, 'campaigns'));
          docs = querySnapshot.docs
            .map(d => ({ id: d.id, ...d.data() } as Campaign))
            .filter(c => c.active === true);
        }

        if (docs.length > 0) {
          // Filtra popups e pega o mais recente
          const popups = docs.filter(c => c.type === 'popup');
          if (popups.length > 0) {
            const latest = popups.sort((a: any, b: any) => {
              const dateA = (a.createdAt?.seconds || (typeof a.createdAt === 'number' ? a.createdAt / 1000 : 0));
              const dateB = (b.createdAt?.seconds || (typeof b.createdAt === 'number' ? b.createdAt / 1000 : 0));
              return dateB - dateA;
            })[0];
            
            setCampaign(latest);
            
            // Show after 1.5 seconds delay
            setTimeout(() => setIsOpen(true), 1500);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar campanha:', error);
      }
    };

    fetchCampaign();
  }, []);

  const closePopup = () => {
    setIsOpen(false);
  };

  const handlePopupClick = async () => {
    if (!campaign) return;
    try {
      await updateDoc(doc(db, 'campaigns', campaign.id), {
        clicks: increment(1)
      });
    } catch (e) {
      console.error('Erro ao registrar clique popup:', e);
    }
  };

  if (!campaign) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-black rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)] border border-white/10"
          >
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-6 right-6 z-50 w-10 h-10 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all border border-white/10 backdrop-blur-md"
            >
              <X size={20} />
            </button>

            {/* Content Area - Fixed Square Format */}
            <div className="relative aspect-square w-full overflow-hidden">
               {/* Clickable Area */}
               <a 
                 href={campaign.destinationUrl || '#'} 
                 target={campaign.destinationUrl?.startsWith('http') ? '_blank' : '_self'}
                 rel="noopener noreferrer"
                 onClick={() => { handlePopupClick(); closePopup(); }}
                 className="block w-full h-full"
               >
                  <img 
                    src={campaign.image} 
                    alt={campaign.title || 'Campanha Racing FC'} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  
               </a>
            </div>
            
            {/* Bottom Glow Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-red-950 via-red-600 to-red-950"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
