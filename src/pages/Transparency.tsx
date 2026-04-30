import { motion } from 'motion/react';
import { FileText, Download, ShieldCheck, Calendar, FileImage, ChevronDown, ChevronUp, Eye, Paperclip } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function Transparency() {
  const [reports, setReports] = useState<any[]>([]);
  const [expandedReports, setExpandedReports] = useState<Record<string, boolean>>({});

  const toggleReport = (id: string) => {
    setExpandedReports(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSafeUrl = (url: string) => {
    return url.trim();
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const q = query(collection(db, 'transparency'), orderBy('year', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setReports([]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="bg-[#f1f2f6] min-h-screen text-black">
      {/* Header Section - Keep Dark */}
      <section className="relative py-16 overflow-hidden border-b border-gray-200 bg-black">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="grid grid-cols-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-white/5"></div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.5em] mb-2 block">Portal da Transparência</span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
              PRESTAÇÃO <span className="text-red-600">DE CONTAS</span>
            </h1>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl font-medium leading-relaxed">
              Compromisso com a ética, integridade e clareza na gestão do Racing Futebol Clube. 
              Acesso público a relatórios, balanços e documentos oficiais.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Reports Section */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <div className="space-y-16">
          {reports.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-lg">
              <ShieldCheck size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Nenhum relatório publicado no momento.</p>
            </div>
          ) : (
            reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-t-4 border-t-red-600 border border-gray-200 p-8 md:p-12 relative group shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] rounded-sm hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-black text-white px-6 py-2 font-black italic text-xs shadow-2xl tracking-widest border border-red-600/20">
                  EXERCÍCIO {report.year}
                </div>

                <div className="mt-4 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-black leading-none">
                        {report.title}
                      </h2>
                      <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest">
                        <Calendar size={12} />
                        Publicado em: {report.datePublished}
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <ShieldCheck size={48} className="text-gray-50 opacity-10" />
                    </div>
                  </div>

                  <div className="relative">
                    <div className={`text-gray-700 font-medium leading-loose text-sm md:text-base whitespace-pre-wrap transition-all duration-700 ease-in-out overflow-hidden ${!expandedReports[report.id] ? 'max-h-48' : 'max-h-[10000px]'}`}>
                      <div className="bg-gray-50/50 p-6 md:p-8 border-l-4 border-red-600 rounded-r-sm italic">
                        {report.content}
                      </div>
                    </div>
                    
                    {!expandedReports[report.id] && report.content && report.content.length > 200 && (
                      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-10" />
                    )}

                    {report.content && report.content.length > 200 && (
                      <button 
                        onClick={() => toggleReport(report.id)}
                        className="mt-8 flex items-center justify-center gap-3 w-full md:w-auto px-10 py-5 bg-red-600 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)] hover:shadow-black/20 group relative z-20 active:scale-95"
                      >
                        {expandedReports[report.id] ? (
                          <>Recolher Relatório <ChevronUp size={18} className="group-hover:-translate-y-1 transition-transform" /></>
                        ) : (
                          <>Ver Relatório Completo <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" /></>
                        )}
                      </button>
                    )}
                  </div>

                  {report.attachments && report.attachments.length > 0 && (
                    <div className="pt-8 mt-8 border-t border-gray-100 space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-[0.3em] text-black flex items-center gap-2">
                        <Paperclip size={16} className="text-red-600" /> Documentação Auxiliar
                      </h4>
                      <div className="space-y-3">
                        {report.attachments.map((file: any, i: number) => (
                          <div 
                            key={i}
                            className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50/50 border border-gray-100 hover:border-red-600/30 transition-all shadow-sm rounded-sm gap-4 group/att"
                          >
                            <div className="flex items-center gap-4">
                              {file.type === 'pdf' ? (
                                <div className="bg-red-600 text-white p-3 rounded shadow-lg">
                                  <FileText size={20} />
                                </div>
                              ) : (
                                <div className="bg-black text-white p-3 rounded shadow-lg">
                                  <FileImage size={20} />
                                </div>
                              )}
                              <div>
                                <p className="font-black text-sm uppercase tracking-tight text-black mb-0.5">{file.name || 'Documento Oficial'}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                    {file.type || 'PDF'}
                                  </span>
                                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Racing FC ©</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <a
                                href={getSafeUrl(file.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 md:flex-none text-center px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/10 active:scale-95"
                              >
                                Visualizar <Eye size={14} />
                              </a>
                              <a
                                href={file.url.trim()}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 md:flex-none text-center px-6 py-3 bg-transparent border-2 border-black text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                              >
                                Baixar <Download size={14} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-black">Dúvidas sobre a Gestão?</h3>
            <p className="text-gray-600 max-w-xl mx-auto font-medium">
              Nosso canal de transparência está sempre aberto aos torcedores e parceiros. 
              Entre em contato com nosso conselho fiscal para mais informações.
            </p>
          </div>
          <button className="border-2 border-black/10 text-black px-12 py-5 font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-all">
            Falar com a Ouvidoria
          </button>
        </div>
      </section>
    </div>
  );
}
