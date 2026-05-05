import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Calendar, User, ArrowLeft, Share2, Facebook, Instagram, Eye } from 'lucide-react';

function NewsContent({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const shadow = container.shadowRoot || container.attachShadow({ mode: 'open' });
      
      const baseStyle = `
        :host { 
          display: block; 
          width: 100%; 
          overflow: hidden; 
          max-width: 100%; 
        }
        .article-body {
          font-family: 'Inter', -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #1F2123;
          line-height: 1.65;
          font-size: 18px;
          font-weight: 400;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          overflow: hidden;
          max-width: 100%;
        }
        .article-body p, .article-body span {
          font-weight: 400;
        }
        .article-body strong, .article-body b {
          font-weight: 700;
          color: #111;
        }
        img { max-width: 100%; height: auto; display: block; margin: 2.5rem auto; border-radius: 0.5rem; }
        h1, h2, h3, h4, h5, h6 { 
          color: #111; 
          margin-top: 3rem; 
          margin-bottom: 1.5rem; 
          font-weight: 700; 
          line-height: 1.3; 
          font-size: 1.5rem;
        }
        p { margin-bottom: 1.8rem; }
        a { color: #0044cc; text-decoration: underline; font-weight: 500; }
        a:hover { color: #0033aa; }
        ul, ol { margin-bottom: 1.8rem; padding-left: 1.5rem; }
        li { margin-bottom: 0.75rem; }
        blockquote { 
          border-left: 4px solid #e5e7eb; 
          padding-left: 1.5rem; 
          margin: 2.5rem 0; 
          font-style: italic; 
          color: #4b5563;
          font-size: 1.25rem;
        }
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }
        pre { background: #f9fafb; padding: 1.25rem; border-radius: 8px; overflow-x: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.9rem; border: 1px solid #e5e7eb; }
      `;

      shadow.innerHTML = `
        <style>${baseStyle}</style>
        <div class="article-body">${html}</div>
      `;

      // Corrigir links sem protocolo (ex: www.google.com -> https://www.google.com)
      const links = shadow.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && 
            !href.match(/^[a-z]+:\/\//i) && 
            !href.startsWith('/') && 
            !href.startsWith('#') && 
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:')) {
          link.setAttribute('href', `https://${href}`);
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        } else if (href && (href.startsWith('http') || href.startsWith('//'))) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    }
  }, [html]);

  return <div ref={containerRef} />;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  date: any;
  author: string;
  category: string;
  views?: number;
}

export default function NewsDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setItem({ id: docSnap.id, ...data } as NewsItem);
          
          // Incrementar visualizações de forma silenciosa
          updateDoc(docRef, {
            views: increment(1)
          }).catch(e => console.error("Erro ao incrementar views:", e));
        }
      } catch (error) {
        console.error("Error fetching news detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (item) {
      document.title = `${item.title} | Racing FC`;
      
      // Atualizar meta tags dinamicamente (ajuda no SEO e compartilhamento)
      const updateMeta = (name: string, content: string, property = false) => {
        const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let el = document.querySelector(selector);
        if (!el) {
          el = document.createElement('meta');
          if (property) el.setAttribute('property', name);
          else el.setAttribute('name', name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      const description = item.summary || 'Notícia do Racing Futebol Clube';
      updateMeta('description', description);
      updateMeta('og:title', item.title, true);
      updateMeta('og:description', description, true);
      updateMeta('og:image', item.imageUrl || 'https://racing-futebol-clube-v1.vercel.app/racing-fc.png', true);
      updateMeta('twitter:title', item.title, true);
      updateMeta('twitter:description', description, true);
    }
    
    return () => {
      document.title = 'Racing Futebol Clube | Site Oficial';
    };
  }, [item]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
        <h2 className="text-3xl font-black text-black uppercase italic">Notícia não encontrada</h2>
        <Link to="/noticias" className="bg-black text-white px-8 py-3 font-bold uppercase text-xs tracking-widest">Voltar para notícias</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Image Section */}
      <section className="relative h-[60vh] overflow-hidden bg-black">
        <img 
          src={(item as any).image || item.imageUrl || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1920&auto=format&fit=crop'} 
          alt={item.title} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end pb-12">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <Link to="/noticias" className="inline-flex items-center gap-2 text-black/80 hover:text-red-600 font-black uppercase text-[10px] tracking-widest mb-8 transition-colors drop-shadow-sm">
              <ArrowLeft size={16} /> Voltar para Notícias
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="bg-red-600 text-white px-4 py-1 font-black text-xs uppercase tracking-widest shadow-2xl">
                {item.category || 'Geral'}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-black uppercase italic tracking-normal leading-[1.1] drop-shadow-sm">
                {item.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-gray-100 mb-12">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-red-600" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-gray-400">Publicado em</span>
                <span className="text-sm font-bold text-black">
                   {item.date?.toDate ? item.date.toDate().toLocaleDateString('pt-BR') : (item.date || 'Recent')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-red-600" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-gray-400">Escrito por</span>
                <span className="text-sm font-bold text-black">{item.author || 'Racing FC'}</span>
              </div>
            </div>
            {item.views !== undefined && (
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-red-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400">Visualizações</span>
                  <span className="text-sm font-bold text-black">{item.views || 0}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black uppercase text-gray-400 mr-2">Compartilhar:</span>
             <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all">
                <Facebook size={18} />
             </button>
             <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all">
                <Instagram size={18} />
             </button>
             <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all">
                <Share2 size={18} />
             </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto pb-20">
          <NewsContent html={item.content} />
        </div>

        {/* Tags / Footer */}
        <div className="mt-20 pt-12 border-t border-gray-100">
           <div className="bg-gray-50 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                 <h4 className="text-xl font-black uppercase italic text-black">Mais Notícias?</h4>
                 <p className="text-gray-500 font-medium text-sm">Acompanhe o Racing Futebol Clube em tempo real.</p>
              </div>
              <Link to="/noticias" className="bg-[#c40000] text-white px-10 py-4 font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl">
                 Ver todas as matérias
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
}
