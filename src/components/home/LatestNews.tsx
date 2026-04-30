import { NEWS } from '../../constants';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function LatestNews() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-16">
          <div className="space-y-4">
             <span className="text-red-600 font-black uppercase text-xs tracking-[0.3em]">Racing News</span>
             <h2 className="text-4xl md:text-6xl font-black text-black leading-none uppercase italic tracking-tighter">
                Últimas <span className="text-gray-300">Notícias</span>
             </h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-black font-black uppercase text-xs tracking-widest hover:text-red-600 transition-colors">
            Ver Todas <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Main big card */}
          {NEWS.slice(0, 1).map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -10 }}
              className="md:col-span-2 group cursor-pointer"
            >
              <div className="relative aspect-video overflow-hidden mb-6 bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                  {item.category}
                </div>
              </div>
              <div className="space-y-4">
                 <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{item.date}</span>
                 <h3 className="text-3xl font-black text-black leading-tight group-hover:text-red-600 transition-colors uppercase italic tracking-tighter">
                   {item.title}
                 </h3>
                 <p className="text-gray-600 font-medium line-clamp-2">
                   {item.summary}
                 </p>
              </div>
            </motion.div>
          ))}

          {/* Smaller cards */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
             {NEWS.slice(1, 3).map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden mb-4 bg-gray-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-black text-white px-2 py-1 font-bold text-[9px] uppercase tracking-widest">
                      {item.category}
                    </div>
                  </div>
                  <div className="space-y-2">
                     <span className="text-gray-400 font-bold text-[9px] uppercase tracking-widest">{item.date}</span>
                     <h3 className="text-lg font-black text-black leading-tight group-hover:text-red-600 transition-colors uppercase italic tracking-tighter line-clamp-2">
                       {item.title}
                     </h3>
                  </div>
                </motion.div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
