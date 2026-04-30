import { motion } from 'motion/react';
import { Download, Copy, Check, Palette, Shield, Type } from 'lucide-react';
import { useState } from 'react';

export default function BrandKit() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const colors = [
    { name: 'Racing Red', hex: '#c40000', label: 'Cor Principal / Energia' },
    { name: 'Pure Black', hex: '#000000', label: 'Fundo / Autoridade' },
    { name: 'White', hex: '#ffffff', label: 'Contraste / Texto' },
    { name: 'Racing Gray', hex: '#1a1a1a', label: 'Superfícies / UI' },
  ];

  const logoVariations = [
    { name: 'Escudo Oficial', path: '/racing-fc.png', description: 'Uso prioritário em fundos escuros ou imagens.', bg: 'bg-zinc-950/50' },
    { name: 'Versão Branca', path: '/racing escudo branco.png', description: 'Para uso sobre fundos escuros e cores sólidas.', bg: 'bg-zinc-950/50' },
    { name: 'Versão Preta', path: '/Racing escudo preto.png', description: 'Para uso sobre fundos claros ou impressões PB.', bg: 'bg-gray-100' },
  ];

  const handleDownload = (path: string, name: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 bg-red-600/10 border border-red-600/20 rounded-full mb-6"
          >
            <span className="text-red-600 text-xs font-black uppercase tracking-[0.3em]">Identidade Visual</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-6"
          >
            Kit de <span className="text-red-600">Marca</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-base max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Recursos oficiais e diretrizes para o uso correto da marca Racing Futebol Clube em mídias, parcerias e projetos.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Logo Variations Section */}
          <section className="lg:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {logoVariations.map((logo, idx) => (
                <motion.div 
                  key={logo.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center text-center group"
                >
                  <div className={`w-full aspect-square ${logo.bg} rounded-[2rem] border border-white/5 flex items-center justify-center p-8 mb-8 transition-transform group-hover:scale-[1.02]`}>
                    <img src={logo.path} alt={logo.name} className="w-full max-w-[160px] h-auto drop-shadow-2xl" />
                  </div>
                  <h3 className="text-xl font-black uppercase italic tracking-tight mb-2">{logo.name}</h3>
                  <p className="text-gray-500 text-xs font-medium mb-8 leading-relaxed px-4">
                    {logo.description}
                  </p>
                  <button 
                    onClick={() => handleDownload(logo.path, logo.name)}
                    className="mt-auto flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all group/btn"
                  >
                    Download PNG <Download className="w-4 h-4 transition-transform group-hover/btn:translate-y-0.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Colors Section */}
          <section className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-10 h-full"
            >
              <div className="flex items-center gap-3 text-red-600 mb-8">
                <Palette className="w-6 h-6" />
                <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">Cores Oficiais</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {colors.map((color) => (
                  <div 
                    key={color.hex}
                    className="group bg-zinc-950/50 border border-white/5 rounded-2xl p-6 flex items-center gap-6 transition-all hover:bg-zinc-950"
                  >
                    <div 
                      className="w-16 h-16 rounded-xl shadow-lg border border-white/10 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black uppercase italic text-sm tracking-tight mb-1">{color.name}</h3>
                      <p className="text-gray-500 text-xs font-medium mb-2">{color.label}</p>
                      <button 
                        onClick={() => copyToClipboard(color.hex)}
                        className="flex items-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                      >
                        {copiedColor === color.hex ? (
                          <>Copiado! <Check className="w-3 h-3" /></>
                        ) : (
                          <>Copiar HEX: {color.hex} <Copy className="w-3 h-3" /></>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Typography Section */}
          <section className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-10 h-full flex flex-col"
            >
              <div className="flex items-center gap-3 text-red-600 mb-8">
                <Type className="w-6 h-6" />
                <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">Tipografia</h2>
              </div>
              
              <div className="space-y-8 flex-1 flex flex-col justify-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Principal</span>
                  <p className="text-2xl font-black italic uppercase tracking-tighter">Racing FC Bold</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secundária</span>
                  <p className="text-lg font-medium tracking-tight text-gray-300">Inter Medium</p>
                </div>
                <div className="pt-8 border-t border-white/5 mt-auto">
                  <p className="text-gray-500 text-xs font-medium leading-relaxed italic">
                    Utilizamos fontes que transmitem velocidade, agressividade controlada e modernidade.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Press Kit Call to Action */}
          <section className="lg:col-span-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-red-600 rounded-[2.5rem] p-10 md:p-14 text-center relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-4">Download Press Kit Completo</h2>
                <p className="text-white/80 text-base max-w-2xl mx-auto font-medium mb-8">
                  Inclui logos em alta resolução, manual da marca, fotos oficiais do elenco e modelos de apresentação.
                </p>
                <button 
                  onClick={() => handleDownload('/racing-fc.png', 'Racing-FC-Press-Kit')}
                  className="bg-white text-red-600 px-10 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform"
                >
                  Baixar Pacote Completo (ZIP)
                </button>
              </div>
              {/* Decorative Shield Pattern */}
              <div className="absolute top-1/2 left-10 -translate-y-1/2 opacity-10 rotate-12 scale-150 pointer-events-none">
                <img src="/racing-fc.png" alt="" className="w-64 h-auto grayscale brightness-0 invert" />
              </div>
              <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 -rotate-12 scale-150 pointer-events-none">
                <img src="/racing-fc.png" alt="" className="w-64 h-auto grayscale brightness-0 invert" />
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}
