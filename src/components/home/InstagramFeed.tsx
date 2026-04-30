import { motion } from 'motion/react';
import { Instagram, Heart, MessageCircle, ExternalLink, ArrowRight } from 'lucide-react';

export default function InstagramFeed() {
  const posts = [
    {
      id: 1,
      image: "/001.jpg",
      likes: "1.2k",
      comments: "45",
      type: "image"
    },
    {
      id: 2,
      image: "/002.webp",
      likes: "850",
      comments: "32",
      type: "image"
    },
    {
      id: 3,
      image: "/003.webp",
      likes: "2.1k",
      comments: "108",
      type: "image"
    },
    {
      id: 4,
      image: "/004.jpg",
      likes: "940",
      comments: "28",
      type: "image"
    },
    {
      id: 5,
      image: "/005.webp",
      likes: "1.5k",
      comments: "56",
      type: "image"
    },
    {
      id: 6,
      image: "/006.png",
      likes: "3.2k",
      comments: "214",
      type: "image"
    }
  ];

  return (
    <section className="py-24 bg-black text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px] rounded-full">
                <div className="bg-black p-[2px] rounded-full">
                  <div className="w-16 h-16 bg-black rounded-full overflow-hidden flex items-center justify-center shadow-inner">
                    <img src="/racing-fc.png" alt="Profile" className="w-full h-full object-contain p-2" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">@racingfutebolclub</h3>
                <p className="text-gray-400 font-bold text-sm">Racing Futebol Clube - Oficial</p>
              </div>
            </div>
            <p className="max-w-md text-gray-400 font-medium">
              Acompanhe o dia a dia do maior das comunidades. Bastidores, jogos, projetos sociais e muito mais.
            </p>
          </div>
          
          <a 
            href="https://www.instagram.com/racingfutebolclub" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
          >
            <Instagram size={18} />
            Seguir no Instagram
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
          {posts.map((post, idx) => (
            <motion.a
              key={post.id}
              href="https://www.instagram.com/racingfutebolclub"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative aspect-square overflow-hidden bg-white/5"
            >
               <img 
                src={post.image} 
                alt={`Instagram post ${post.id}`} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 font-black italic">
                  <Heart size={20} fill="currentColor" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-2 font-black italic">
                  <MessageCircle size={20} fill="currentColor" />
                  <span>{post.comments}</span>
                </div>
                <div className="absolute top-4 right-4">
                  <ExternalLink size={16} className="opacity-50" />
                </div>
              </div>
              {post.type === 'video' && (
                <div className="absolute top-4 right-4 bg-black/50 p-1 rounded-sm group-hover:hidden">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </motion.a>
          ))}
        </div>

        {/* Mobile Call to Action */}
        <div className="mt-8 text-center md:hidden">
           <a 
            href="https://www.instagram.com/racingfutebolclub" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-red-500 font-black uppercase text-xs tracking-widest items-center gap-2 inline-flex"
          >
            Ver todas as publicações <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
