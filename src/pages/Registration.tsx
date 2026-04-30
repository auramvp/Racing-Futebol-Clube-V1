import { motion } from 'motion/react';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { User, Calendar, Phone, Mail, Shirt, Trophy, CheckCircle, Send, Users } from 'lucide-react';

export default function Registration() {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    whatsapp: '',
    email: '',
    uniformSize: '',
    gender: '',
    guardian: '',
    interest: 'Futebol de Campo'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        ...formData,
        createdAt: new Date()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Erro ao enviar pré-matrícula. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Reduced Header - White/Red Style */}
      <section className="relative h-[30vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[#c40000]/10 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.4em]">Escolinha de Futebol</span>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
              Pré-Matrícula <span className="text-[#c40000]">Atleta</span>
            </h1>
            <p className="text-gray-400 font-medium text-sm max-w-xl">
              Inicie sua jornada no maior do Espírito Santo. Torne-se um atleta do Racing FC.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-black uppercase italic tracking-tighter">Faça parte do nosso time</h2>
              <p className="text-gray-600 font-medium leading-relaxed">
                O Racing FC abre suas portas para novos talentos. Preencha o formulário de pré-matrícula para que nossa equipe técnica entre em contato para agendar uma avaliação ou efetivar sua matrícula nas categorias de base.
              </p>
              
              <div className="space-y-4">
                <h4 className="font-black uppercase text-xs tracking-widest text-red-600">Modalidades Disponíveis:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {['Futsal', 'Fut 7', 'Campo'].map((mod) => (
                     <div key={mod} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-sm">
                        <Trophy size={16} className="text-red-600" />
                        <span className="text-xs font-bold uppercase">{mod}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-black text-white rounded-sm shadow-2xl">
               <h4 className="text-xl font-black uppercase italic mb-4">Atenção!</h4>
               <p className="text-gray-400 text-sm leading-relaxed mb-6">
                 Para atletas menores de 18 anos, é obrigatório o preenchimento dos dados do responsável legal. O Racing FC preza pela segurança e desenvolvimento integral de seus atletas.
               </p>
               <div className="flex items-center gap-3 text-red-500 font-bold text-xs uppercase tracking-widest">
                  <Users size={18} /> Base Forte Racing
               </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white p-8 md:p-12 border border-gray-200 shadow-2xl">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <CheckCircle size={80} className="mx-auto text-green-500" />
                <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter">Pré-Matrícula Enviada!</h3>
                <p className="text-gray-500 font-medium">Nossa coordenação entrará em contato via WhatsApp em até 48 horas úteis.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="bg-black text-white px-8 py-3 font-black uppercase text-[10px] tracking-widest"
                >
                  Nova Matrícula
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nome Completo do Atleta</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={16} />
                    <input 
                      required 
                      type="text" 
                      className="w-full bg-white border border-gray-300 p-4 pl-12 text-sm text-black placeholder:text-gray-400 focus:border-red-600 outline-none transition-colors shadow-sm" 
                      placeholder="Ex: Nome do Jogador" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Data de Nascimento</label>
                    <input 
                      required 
                      type="date" 
                      className="w-full bg-white border border-gray-300 p-4 text-sm text-black focus:border-red-600 outline-none shadow-sm" 
                      value={formData.birthDate} 
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sexo</label>
                    <select 
                      required 
                      className="w-full bg-white border border-gray-300 p-4 text-sm text-black focus:border-red-600 outline-none shadow-sm appearance-none" 
                      value={formData.gender} 
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">WhatsApp (DDD + Número)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={16} />
                      <input 
                        required 
                        type="tel" 
                        className="w-full bg-white border border-gray-300 p-4 pl-12 text-sm text-black placeholder:text-gray-400 focus:border-red-600 outline-none shadow-sm" 
                        placeholder="(27) 99999-9999" 
                        value={formData.whatsapp} 
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tamanho Uniforme</label>
                    <select 
                      required 
                      className="w-full bg-white border border-gray-300 p-4 text-sm text-black focus:border-red-600 outline-none shadow-sm appearance-none" 
                      value={formData.uniformSize} 
                      onChange={(e) => setFormData({...formData, uniformSize: e.target.value})}
                    >
                      <option value="">Selecione</option>
                      <option value="6">6 anos</option>
                      <option value="8">8 anos</option>
                      <option value="10">10 anos</option>
                      <option value="12">12 anos</option>
                      <option value="PP">PP</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={16} />
                    <input 
                      required 
                      type="email" 
                      className="w-full bg-white border border-gray-300 p-4 pl-12 text-sm text-black placeholder:text-gray-400 focus:border-red-600 outline-none shadow-sm" 
                      placeholder="email@exemplo.com" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Responsável (Se menor de idade)</label>
                  <input 
                    type="text" 
                    className="w-full bg-white border border-gray-300 p-4 text-sm text-black placeholder:text-gray-400 focus:border-red-600 outline-none shadow-sm" 
                    placeholder="Nome do Pai/Mãe ou Tutor" 
                    value={formData.guardian} 
                    onChange={(e) => setFormData({...formData, guardian: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Interesse Principal</label>
                  <select 
                    required 
                    className="w-full bg-white border border-gray-300 p-4 text-sm text-black focus:border-red-600 outline-none shadow-sm appearance-none" 
                    value={formData.interest} 
                    onChange={(e) => setFormData({...formData, interest: e.target.value})}
                  >
                    <option value="Futsal">Futsal</option>
                    <option value="Fut 7">Fut 7</option>
                    <option value="Futebol de Campo">Futebol de Campo</option>
                  </select>
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[#c40000] text-white py-4 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                >
                  {loading ? "Processando..." : <><Send size={14} /> Enviar Pré-Matrícula</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
