import { Menu, X, Instagram, Youtube, ChevronDown, Lock, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const topLinks = [
    { name: 'Seja Sócio-Torcedor', href: '/socio' },
    { name: 'Notícias', href: '/noticias' },
  ];

  const mainLinks = [
    { name: 'Matrículas', href: '/matriculas' },
    { 
      name: 'Elenco', 
      href: '#', 
      hasDropdown: true, 
      subItems: [
        'Profissional', 'Sub 7', 'Sub 9', 'Sub 11', 'Sub 13', 
        'Sub 15', 'Sub 17', 'Sub 21', '+40', '+50'
      ] 
    },
    { name: 'Sócio-Torcedor', href: '/socio' },
    { name: 'Títulos', href: '/trofeus' },
    { name: 'Transparência', href: '/transparencia' },
    { 
      name: 'Institucional', 
      href: '#', 
      hasDropdown: true, 
      subItems: ['Diretoria', 'Estatuto'] 
    },
    { name: 'Clube', href: '/o-clube' },
    { name: 'Kit de Marca', href: '/kit-de-marca' },
  ];

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <header className="relative w-full z-50 shadow-2xl">
      {/* --- DESKTOP VIEW --- */}
      <div className="hidden lg:block">
        {/* Top Bar - Red Tier */}
        <div className="bg-[#c40000] h-20 flex items-center relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
            {/* Logo / Shield - Overlapping */}
            <div className="relative w-40 h-full flex-shrink-0">
              <Link to="/" className="absolute -top-12 left-0 z-50 group">
                <img 
                  src="/racing-fc.png" 
                  alt="Racing FC Shield" 
                  className="w-40 h-48 object-contain transition-transform group-hover:scale-105 [filter:drop-shadow(2px_0_0_white)_drop-shadow(-2px_0_0_white)_drop-shadow(0_2px_0_white)_drop-shadow(0_-2px_0_white)]" 
                />
              </Link>
            </div>

            {/* Center Actions */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-4">
              {topLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="bg-white/10 hover:bg-white text-white hover:text-[#c40000] px-5 py-2 rounded-sm font-black uppercase text-[10px] tracking-widest transition-all border border-white/20"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-6 text-white/90">
              <a href="https://x.com/RacingFCOficial" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/racingfutebolclub" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://www.youtube.com/@TvRacingOficial" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Youtube size={18} />
              </a>
              <div className="h-4 w-[1px] bg-white/20 mx-2" />
              <Link to="/admin" className="text-white/40 hover:text-white transition-colors">
                <Lock size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Black Tier */}
        <div className="bg-black h-12 flex items-center border-b border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center">
            <div className="ml-44 flex items-center space-x-8">
              {mainLinks.map((link) => (
                <div key={link.name} className="relative group/nav">
                  <Link
                    to={link.href}
                    className="text-gray-100 hover:text-[#c40000] uppercase text-[11px] font-black tracking-[0.1em] transition-colors flex items-center gap-1 py-4"
                  >
                    {link.name}
                    {link.hasDropdown && <ChevronDown size={12} className="group-hover/nav:rotate-180 transition-transform" />}
                  </Link>

                  {link.subItems && (
                    <div className="absolute top-full left-0 bg-black border border-white/10 min-w-[180px] opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 shadow-2xl z-50">
                      <div className="py-2">
                        {link.subItems.map((sub) => (
                          <Link
                            key={sub}
                            to={link.name === 'Elenco' 
                              ? `/elenco/${sub.toLowerCase().replace(' ', '-')}`
                              : `/${sub.toLowerCase().replace(' ', '-')}`
                            }
                            className="block px-4 py-2 text-[10px] font-bold text-gray-300 hover:text-white hover:bg-[#c40000] uppercase tracking-wider transition-colors"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="lg:hidden flex flex-col">
        {/* Top Bar - Red */}
        <div className="bg-[#c40000] h-16 flex items-center justify-between px-4 relative z-50">
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/racingfutebolclub" target="_blank" rel="noopener noreferrer" className="text-white/80">
              <Instagram size={20} />
            </a>
            <a href="https://www.youtube.com/@TvRacingOficial" target="_blank" rel="noopener noreferrer" className="text-white/80">
              <Youtube size={20} />
            </a>
          </div>

          {/* Centered Shield */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 z-50">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <img 
                src="/racing-fc.png" 
                alt="Racing FC Shield" 
                className="h-24 w-auto drop-shadow-2xl [filter:drop-shadow(1px_1px_0_white)_drop-shadow(-1px_-1px_0_white)]" 
              />
            </Link>
          </div>

          <Link to="/admin" className="text-white/40 p-2">
            <Lock size={20} />
          </Link>
        </div>

        {/* Bottom Bar - Black */}
        <div className="bg-black h-12 flex items-center justify-between px-4 border-b border-white/10 relative z-40">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-white flex items-center gap-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Menu</span>
          </button>
          
          <button className="text-white p-2">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden absolute top-[112px] left-0 right-0 bg-black/98 backdrop-blur-xl border-b border-white/10 z-40 overflow-hidden shadow-2xl"
          >
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {mainLinks.map((link) => (
                <div key={link.name} className="space-y-4">
                  <div 
                    onClick={() => link.hasDropdown ? toggleDropdown(link.name) : setIsOpen(false)}
                    className="flex items-center justify-between group"
                  >
                    <Link
                      to={link.href}
                      className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-[#c40000] transition-colors"
                    >
                      {link.name}
                    </Link>
                    {link.hasDropdown && (
                      <ChevronDown 
                        size={20} 
                        className={`text-gray-500 transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} 
                      />
                    )}
                  </div>

                  {/* Mobile Dropdown Items */}
                  <AnimatePresence>
                    {link.subItems && activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="grid grid-cols-2 gap-3 pl-4 border-l border-white/10"
                      >
                        {link.subItems.map((sub) => (
                          <Link
                            key={sub}
                            to={link.name === 'Elenco' 
                              ? `/elenco/${sub.toLowerCase().replace(' ', '-')}`
                              : `/${sub.toLowerCase().replace(' ', '-')}`
                            }
                            onClick={() => setIsOpen(false)}
                            className="text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-widest py-2"
                          >
                            {sub}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              <div className="pt-6 border-t border-white/10 space-y-3">
                {topLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block w-full bg-[#c40000] text-white py-4 rounded-sm font-black uppercase tracking-widest text-[10px] text-center hover:bg-white hover:text-[#c40000] transition-all"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
