import { motion } from 'motion/react';
import { Heart, Users, Globe, ArrowRight } from 'lucide-react';

export default function SocialImpact() {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/3] relative z-10 overflow-hidden shadow-2xl">
               <img 
                src="/social.png" 
                alt="Impacto Social na Comunidade" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-red-600/10 mix-blend-multiply"></div>
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-6 z-20 shadow-2xl max-w-[240px] hidden md:block">
              <Heart className="mb-3" size={24} />
              <p className="text-lg font-black italic uppercase tracking-tighter leading-tight">
                "O esporte é a ponte para um futuro digno."
              </p>
            </div>
            {/* Background pattern */}
            <div className="absolute -top-6 -left-6 w-32 h-32 border-l-4 border-t-4 border-red-600 opacity-20"></div>
          </motion.div>

          {/* Text Side */}
          <div className="space-y-6">
            <div>
              <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.3em] mb-3 block">Responsabilidade Social</span>
              <h2 className="text-3xl md:text-5xl font-black text-black leading-tight uppercase italic tracking-tighter">
                O CORAÇÃO DO RACING PULSA NA <span className="text-red-600">GRANDE SÃO PEDRO</span>
              </h2>
            </div>

            <div className="space-y-4 text-gray-700 font-medium leading-relaxed text-base">
              <p>
                Para nós, a vitória vai muito além das quatro linhas. O Racing Futebol Clube entende que sua maior missão é servir à comunidade que nos acolheu. 
              </p>
              <p className="border-l-4 border-red-600 pl-4 italic text-sm md:text-base bg-gray-50 py-4 pr-4">
                Atuamos diretamente na região da <span className="text-red-600 font-bold">Grande São Pedro</span>, em Vitória, uma área marcada pela vulnerabilidade social, mas repleta de talentos e sonhos que precisam de uma oportunidade para brilhar.
              </p>
              <p>
                Através das nossas escolinhas e projetos de apoio, utilizamos o futebol como ferramenta de transformação. Ajudamos famílias e crianças a encontrarem no esporte um caminho de disciplina, educação e esperança.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
               <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 text-red-600 rounded-sm">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase italic text-xs">Famílias</h4>
                    <p className="text-[10px] text-gray-500 font-bold">Suporte Comunitário</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 text-red-600 rounded-sm">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase italic text-xs">Cidadania</h4>
                    <p className="text-[10px] text-gray-500 font-bold">Futuro Social</p>
                  </div>
               </div>
            </div>


          </div>
        </div>
      </div>
    </section>
  );
}
