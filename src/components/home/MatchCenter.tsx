import { MATCHES } from '../../constants';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function MatchCenter() {
  const nextMatch = MATCHES.find(m => m.status === 'upcoming');
  const lastMatch = MATCHES.find(m => m.status === 'finished');

  if (!nextMatch) return null;

  return (
    <section className="bg-zinc-900 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12">
        {/* Next Match Highlight */}
        <div className="md:col-span-8 bg-black p-8 md:p-12 relative flex flex-col justify-center">
            <div className="mb-8 flex items-center justify-between">
                <span className="text-red-500 font-black uppercase text-xs tracking-[0.2em]">Próxima Partida</span>
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">{nextMatch.competition}</span>
            </div>

            <div className="flex items-center justify-around md:justify-between gap-8 mb-12">
               {/* Team Home */}
               <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-red-600 rounded-sm flex items-center justify-center border-4 border-white shadow-xl">
                      <span className="text-white font-black text-4xl italic">RFC</span>
                  </div>
                  <span className="text-white font-black text-xl md:text-2xl uppercase italic">Racing FC</span>
               </div>

               <div className="flex flex-col items-center">
                  <span className="text-white/20 font-black text-5xl md:text-7xl italic">X</span>
                  <div className="mt-4 flex flex-col items-center text-center">
                    <span className="text-white/60 font-bold text-xs uppercase tracking-widest">{nextMatch.date}</span>
                    <span className="text-white font-black text-2xl mt-1 tracking-tighter">{nextMatch.time}</span>
                  </div>
               </div>

               {/* Team Away */}
               <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-zinc-800 rounded-sm flex items-center justify-center border-4 border-white/20">
                      <img src={nextMatch.opponentLogo} alt={nextMatch.opponent} className="w-16 h-16 opacity-80" />
                  </div>
                  <span className="text-white/80 font-black text-xl md:text-2xl uppercase italic">{nextMatch.opponent}</span>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={16} className="text-red-600" />
                    <span className="text-sm font-medium">{nextMatch.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={16} className="text-red-600" />
                    <span className="text-sm font-medium">Domingo, {nextMatch.date}</span>
                </div>
                <button className="ml-auto bg-red-600 text-white px-10 py-4 font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all">
                  Comprar Ingressos
                </button>
            </div>
        </div>

        {/* Last Match Summary */}
        <div className="md:col-span-4 bg-zinc-900 border-l border-white/5 p-8 flex flex-col justify-center">
           <div className="mb-6">
              <span className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Último Resultado</span>
           </div>

           {lastMatch && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded-full"></div>
                      <span className="text-white font-bold text-sm">{lastMatch.opponent}</span>
                   </div>
                   <span className="text-white font-black text-xl">{lastMatch.score?.home}</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-[10px] text-white font-black">R</span>
                      </div>
                      <span className="text-white font-bold text-sm">Racing FC</span>
                   </div>
                   <span className="text-red-600 font-black text-xl">{lastMatch.score?.away}</span>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <button className="text-white/60 hover:text-white font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all">
                      Ver Melhores Momentos <Clock size={14} />
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </section>
  );
}
