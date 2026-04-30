import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, User } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

export default function Board() {
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const q = query(collection(db, 'board'), orderBy('name', 'asc'));
        const snap = await getDocs(q);
        setBoardMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error("Error fetching board:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, []);

  const sections = [
    {
      id: 'executiva',
      title: 'Diretoria executiva',
      description: 'Responsável pela gestão administrativa, operacional e financeira do clube no dia a dia.',
      filter: 'Diretoria executiva'
    },
    {
      id: 'deliberativo',
      title: 'Conselho deliberativo',
      description: 'Órgão de deliberação e consulta, responsável por zelar pelo cumprimento do estatuto e decisões estratégicas.',
      filter: 'Conselho deliberativo'
    },
    {
      id: 'fiscal',
      title: 'Conselho Fiscal',
      description: 'Responsável pela fiscalização contábil e auditoria das contas da instituição.',
      filter: 'Conselho Fiscal'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Reduced Header - Keep Dark */}
      <section className="relative h-[30vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[#c40000]/10 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.4em]">Racing Futebol Clube</span>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
              Diretoria <span className="text-[#c40000]">Institucional</span>
            </h1>
            <p className="text-gray-400 font-medium text-sm max-w-xl">
              Liderança e governança dedicada à excelência do rubro-negro.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sections.map((section, sIdx) => {
          const members = boardMembers.filter(m => m.category === section.filter);
          if (members.length === 0) return null;

          return (
            <div key={section.id} className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black text-black uppercase italic tracking-tighter whitespace-nowrap">
                    {section.title}
                  </h2>
                  <div className="h-px bg-red-600/20 w-full"></div>
                </div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{section.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="bg-gray-50 border border-gray-100 p-4 hover:border-red-600/40 transition-all text-center shadow-sm h-full">
                      <div className="aspect-square bg-gray-200 rounded-full mb-4 mx-auto overflow-hidden border-2 border-white group-hover:border-red-600/30 transition-colors flex items-center justify-center">
                         {member.photoUrl ? (
                           <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                         ) : (
                           <User size={32} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                         )}
                      </div>
                      <h3 className="text-xs font-black text-black uppercase italic tracking-tight leading-tight">{member.name}</h3>
                      <p className="text-[10px] text-red-600 font-bold uppercase mt-1 tracking-tight">{member.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
