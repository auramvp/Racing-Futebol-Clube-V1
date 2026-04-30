import { motion } from 'motion/react';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { User, Calendar, MapPin, CreditCard, Shirt, Send, CheckCircle } from 'lucide-react';

export default function Socio() {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: '',
    address: '',
    shirtSize: '',
    cpf: '',
    rg: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'socio_leads'), {
        ...formData,
        createdAt: new Date()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting lead:", error);
      alert("Erro ao enviar interesse. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Keep Dark */}
      <section className="relative h-[30vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
            src="/sócio torcedor.png" 
            alt="Sócio Torcedor" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.5em]">Programa Oficial</span>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
              Sócio <span className="text-[#c40000]">Torcedor</span>
            </h1>
            <p className="text-gray-300 font-medium text-lg max-w-2xl italic">
              "Novos tempos no clube. Esta é a sua chance de mostrar a paixão que nos move."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Info Side */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-black uppercase italic tracking-tighter">O Programa está chegando</h2>
              <p className="text-gray-600 font-medium leading-relaxed text-lg">
                O programa de sócio torcedor do Racing FC está sendo construído em conjunto com uma ampla rede de parceiros locais e nacionais para oferecer os melhores benefícios para você.
              </p>
              <div className="p-6 border-l-4 border-red-600 bg-gray-50 space-y-4 shadow-sm">
                <p className="text-black font-bold text-sm uppercase tracking-widest">Inscrição de Interesse</p>
                <p className="text-gray-500 text-sm">
                  Esta é uma pré-inscrição para os apaixonados pelo clube. Cadastre-se agora para receber em primeira mão as modalidades, preços e benefícios exclusivos assim que o portal oficial for lançado.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { title: 'Rede de Parceiros', desc: 'Descontos exclusivos em comércios da Grande São Pedro.' },
                 { title: 'Prioridade', desc: 'Acesso antecipado à compra de uniformes e eventos.' }
               ].map((item, i) => (
                 <div key={i} className="p-6 bg-white border border-gray-100 shadow-sm">
                   <h4 className="text-red-600 font-black text-xs uppercase tracking-widest mb-2">{item.title}</h4>
                   <p className="text-gray-500 text-xs font-medium">{item.desc}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-8 md:p-12 border border-gray-200 shadow-2xl relative">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <CheckCircle size={80} className="mx-auto text-green-500" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter">Interesse Registrado!</h3>
                  <p className="text-gray-500 font-medium">Obrigado por fazer parte deste novo tempo do Racing FC. Em breve entraremos em contato.</p>
                </div>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-red-600 font-black uppercase text-[10px] tracking-widest"
                >
                  Fazer outro cadastro
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={18} />
                      <input 
                        required
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 p-4 pl-12 text-black text-sm focus:border-red-600 outline-none transition-colors"
                        placeholder="Ex: João da Silva"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Data de Nascimento */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Data de Nascimento</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={18} />
                        <input 
                          required
                          type="date"
                          className="w-full bg-gray-50 border border-gray-200 p-4 pl-12 text-gray-900 text-sm focus:border-red-600 outline-none transition-colors"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Sexo */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sexo</label>
                      <select 
                        required
                        className="w-full bg-gray-50 border border-gray-200 p-4 text-gray-900 text-sm focus:border-red-600 outline-none transition-colors appearance-none"
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      >
                        <option value="">Selecione</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Endereço Completo</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={18} />
                      <input 
                        required
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 p-4 pl-12 text-gray-900 text-sm focus:border-red-600 outline-none transition-colors"
                        placeholder="Rua, Número, Bairro, Cidade"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CPF */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">CPF</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={18} />
                        <input 
                          required
                          type="text"
                          className="w-full bg-gray-50 border border-gray-200 p-4 pl-12 text-gray-900 text-sm focus:border-red-600 outline-none transition-colors"
                          placeholder="000.000.000-00"
                          value={formData.cpf}
                          onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* RG */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">RG</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={18} />
                        <input 
                          required
                          type="text"
                          className="w-full bg-gray-50 border border-gray-200 p-4 pl-12 text-gray-900 text-sm focus:border-red-600 outline-none transition-colors"
                          placeholder="0.000.000"
                          value={formData.rg}
                          onChange={(e) => setFormData({...formData, rg: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tamanho da Camisa */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tamanho da Camisa</label>
                    <div className="relative">
                      <Shirt className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={18} />
                      <select 
                        required
                        className="w-full bg-gray-50 border border-gray-200 p-4 pl-12 text-gray-900 text-sm focus:border-red-600 outline-none transition-colors appearance-none"
                        value={formData.shirtSize}
                        onChange={(e) => setFormData({...formData, shirtSize: e.target.value})}
                      >
                        <option value="">Selecione</option>
                        <option value="P">P</option>
                        <option value="M">M</option>
                        <option value="G">G</option>
                        <option value="GG">GG</option>
                        <option value="XG">XG</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[#c40000] text-white py-5 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Registrar Interesse <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
