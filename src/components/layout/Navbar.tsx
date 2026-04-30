import { Menu, X, Instagram, Youtube, ChevronDown, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <header className="relative w-full z-50 shadow-2xl">
      {/* Top Bar - Red Tier */}
      <div className="bg-[#c40000] h-16 md:h-20 flex items-center relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          
          {/* Logo / Shield - Positioned to overlap */}
          <div className="relative w-28 md:w-40 h-full flex-shrink-0">
            <Link to="/" className="absolute -top-6 md:-top-12 left-0 z-50 group">
              <img 
                src="/racing-fc.png" 
                alt="Racing FC Shield" 
                className="w-28 h-32 md:w-40 md:h-48 object-contain transition-transform group-hover:scale-110 [filter:drop-shadow(2px_0_0_white)_drop-shadow(-2px_0_0_white)_drop-shadow(0_2px_0_white)_drop-shadow(0_-2px_0_white)]" 
              />
            </Link>
          </div>

          {/* Center Actions - Desktop - Centered Absolute */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center space-x-4">
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

          {/* Right Section: Social & Search */}
          <div className="flex items-center space-x-3 md:space-x-6">
            {/* Social Icons - Desktop */}
            <div className="hidden md:flex items-center space-x-4 text-white/90">
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
            </div>

            <div className="hidden md:flex items-center ml-4">
              <div className="h-4 w-[1px] bg-white/20 mx-4" />
              <Link to="/admin" className="text-white/40 hover:text-white transition-colors">
                <Lock size={16} />
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden text-white p-2 ml-2 bg-black/20 rounded-md"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Black Tier (Desktop) */}
      <div className="bg-black h-12 hidden lg:flex items-center border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center">
          <div className="ml-32 md:ml-44 flex items-center space-x-8">
            {mainLinks.map((link) => (
              <div key={link.name} className="relative group/nav">
                <Link
                  to={link.href}
                  className="text-gray-100 hover:text-[#c40000] uppercase text-[11px] font-black tracking-[0.1em] transition-colors flex items-center gap-1 py-4"
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown size={12} className="group-hover/nav:rotate-180 transition-transform" />}
                </Link>

                {/* Dropdown Menu */}
                {link.subItems && (
                  <div className="absolute top-full left-0 bg-black border border-white/10 min-w-[160px] opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 shadow-2xl z-50">
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

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="lg:hidden fixed inset-0 z-[100] bg-black"
        >
          <div className="flex flex-col h-full">
            <div className="bg-[#c40000] p-6 flex justify-between items-center">
              <img src="/racing-fc.png" alt="Logo" className="h-12" />
              <button onClick={() => setIsOpen(false)} className="text-white">
                <X size={32} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {mainLinks.map((link) => (
                <div key={link.name} className="space-y-4">
                  <Link
                    to={link.href}
                    onClick={() => !link.hasDropdown && setIsOpen(false)}
                    className="block text-2xl font-black uppercase tracking-tighter text-white border-b border-white/10 pb-2"
                  >
                    {link.name}
                  </Link>
                  {link.subItems && (
                    <div className="grid grid-cols-2 gap-2 pl-4">
                      {link.subItems.map((sub) => (
                        <Link
                          key={sub}
                          to={link.name === 'Elenco' 
                            ? `/elenco/${sub.toLowerCase().replace(' ', '-')}`
                            : `/${sub.toLowerCase().replace(' ', '-')}`
                          }
                          onClick={() => setIsOpen(false)}
                          className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-6 space-y-4">
                {topLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block w-full bg-[#c40000] text-white py-4 rounded font-bold uppercase tracking-widest text-sm text-center"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
