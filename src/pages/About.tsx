import { motion } from 'motion/react';
import { History, Target, Shield, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white min-h-screen text-black">
      {/* Header Section */}
      <section className="relative py-24 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-30">
           <img 
            src="/RACING ANTIGO.jpg" 
            alt="Historical Racing FC" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="text-red-600 font-black uppercase text-xs tracking-[0.4em] mb-4 block">Nossa História</span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 leading-none text-white">
              RACING <span className="text-red-800">FUTEBOL CLUBE</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl font-medium leading-relaxed">
              Tradição, paixão e glória. Desde 1951, o Racing de Vitória escreve páginas inesquecíveis no futebol do Espírito Santo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* History Content */}
      <section className="py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 bg-red-600 text-white px-4 py-2 font-bold uppercase text-xs tracking-widest">
                <History size={16} /> Fundação
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight">
                UMA HISTÓRIA QUE <span className="text-red-600">NASCEU EM VITÓRIA</span>
              </h2>
              <div className="space-y-6 text-gray-700 font-medium leading-relaxed text-lg">
                <p>
                  O Racing Futebol Clube foi fundado em 20 de setembro de 1951, no coração de Vitória, Espírito Santo. Nascido do desejo de desportistas locais de criar uma equipe que representasse a garra e a técnica do futebol capixaba, o clube rapidamente se tornou uma das referências da capital.
                </p>
                <p>
                  Adotando as cores vermelho e preto, o Racing de Vitória conquistou corações e se tornou conhecido pela sua entrega em campo. Durante décadas, foi um dos pilares do futebol amador e profissional na região, mandando seus jogos no histórico Estádio Governador Bley.
                </p>
                <p>
                  O nome "Racing" foi uma homenagem à velocidade e determinação das equipes da época, buscando sempre um futebol ofensivo e vibrante que encantava os torcedores que lotavam as arquibancadas para ver o rubro-negro capixaba.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] bg-zinc-100 overflow-hidden shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=800&auto=format&fit=crop" 
                  alt="Ancient football photo style" 
                  className="w-full h-full object-cover grayscale opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 border-[20px] border-black/20"></div>
              </div>
              {/* Floating Stat Card */}
              <div className="absolute -bottom-10 -left-10 bg-black text-white p-10 hidden lg:block shadow-2xl border-l-8 border-red-600">
                <span className="text-6xl font-black italic block mb-2">1951</span>
                <span className="text-xs font-bold uppercase tracking-widest text-red-600">Ano de Fundação</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values/Pillars */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Target,
                title: 'Nossa Missão',
                desc: 'Fomentar o esporte e a cultura em Vitória, formando cidadãos através do futebol e honrando nossas cores em cada competição.'
              },
              {
                icon: Shield,
                title: 'Nossa Visão',
                desc: 'Ser reconhecido como o maior formador de talentos do Espírito Santo, unindo tradição histórica com modernidade administrativa.'
              },
              {
                icon: Users,
                title: 'Nossos Valores',
                desc: 'Ética, transparência, superação e o respeito incondicional à nossa apaixonada torcida rubro-negra.'
              }
            ].map((item, i) => (
              <div key={i} className="p-10 bg-white border border-gray-200 hover:border-red-600/50 transition-all group shadow-sm">
                <item.icon size={48} className="text-red-600 mb-8 transform group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">{item.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">LINHA DO <span className="text-red-800">TEMPO</span></h2>
           </div>
           
           <div className="relative space-y-12">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 hidden md:block"></div>
              
              {[
                { year: '1951', title: 'A Fundação', desc: 'Surgimento do Racing Futebol Clube em Vitória.' },
                { year: '1955', title: 'Início das Glórias', desc: 'Participação de destaque nos campeonatos citadinos.' },
                { year: '1962', title: 'A Consolidação', desc: 'Reconhecimento como uma das forças emergentes do estado.' },
                { year: 'Hoje', title: 'Novo Racing', desc: 'Modernização e foco total na volta ao topo do futebol capixaba.' }
              ].map((step, i) => (
                <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                   <div className="flex-1 text-center md:text-right px-4">
                      {i % 2 === 0 && (
                        <>
                          <h4 className="text-red-600 font-black text-3xl mb-2">{step.year}</h4>
                          <h5 className="text-xl font-bold uppercase italic tracking-tighter mb-2">{step.title}</h5>
                          <p className="text-gray-500 font-medium">{step.desc}</p>
                        </>
                      )}
                   </div>
                   <div className="w-12 h-12 bg-red-600 rounded-full border-4 border-white relative z-10 hidden md:flex items-center justify-center shadow-lg"></div>
                   <div className="flex-1 text-center md:text-left px-4">
                      {i % 2 !== 0 && (
                        <>
                          <h4 className="text-red-600 font-black text-3xl mb-2">{step.year}</h4>
                          <h5 className="text-xl font-bold uppercase italic tracking-tighter mb-2">{step.title}</h5>
                          <p className="text-gray-500 font-medium">{step.desc}</p>
                        </>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
}
