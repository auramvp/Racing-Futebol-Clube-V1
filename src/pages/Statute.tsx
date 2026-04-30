import { motion } from 'motion/react';
import { FileText, Shield, Download } from 'lucide-react';

export default function Statute() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Keep Dark */}
      <section className="relative h-[30vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[#c40000]/10 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <span className="text-red-600 font-black uppercase text-xs tracking-[0.5em]">Racing Futebol Clube</span>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
              Estatuto <span className="text-[#c40000]">Social</span>
            </h1>
            <p className="text-gray-400 font-medium text-lg max-w-2xl">
              O conjunto de normas e princípios que regem a conduta e a administração do nosso clube.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gray-50 border border-gray-100 p-8 md:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row items-start gap-12">
            <div className="bg-red-600 p-6 rounded-sm shadow-2xl">
              <FileText size={64} className="text-white" />
            </div>
            
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-black text-black uppercase italic tracking-tighter">O Documento Fundamental</h2>
              <p className="text-gray-600 font-medium leading-relaxed text-lg">
                O Estatuto Social do Racing Futebol Clube é o conjunto de normas que regem a organização, o funcionamento e as finalidades da nossa instituição. 
                Ele define os direitos e deveres dos sócios, as competências da diretoria e os princípios que garantem a integridade e a tradição do nosso clube.
              </p>
              
              <div className="pt-8">
                <button className="bg-black text-white px-10 py-5 font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-red-600 transition-all shadow-xl group">
                  <Download size={18} /> Baixar Estatuto (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 border border-gray-100 bg-gray-50 shadow-sm">
              <h4 className="text-red-600 font-black uppercase italic text-xl mb-4">Transparência</h4>
              <p className="text-gray-600 font-medium">Garantia de que todas as ações administrativas sigam rigorosamente as normas estatutárias.</p>
           </div>
           <div className="p-8 border border-gray-100 bg-gray-50 shadow-sm">
              <h4 className="text-red-600 font-black uppercase italic text-xl mb-4">Democracia</h4>
              <p className="text-gray-600 font-medium">Processos eleitorais e decisões colegiadas protegidas pelo nosso documento base.</p>
           </div>
        </div>
      </section>
    </div>
  );
}
