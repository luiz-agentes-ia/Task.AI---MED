
import React, { useState } from 'react';
import { User, Mail, Shield, Camera, Save } from 'lucide-react';

const Profile: React.FC = () => {
  const [name, setName] = useState('Dr. Carlos Eduardo Silva');
  const [email] = useState('carlos.silva@clinica.com.br');
  const [specialty, setSpecialty] = useState('Dermatologia');

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <h2 className="text-2xl font-bold text-navy">Meu Perfil</h2>
        <p className="text-slate-500">Gerencie suas informações de conta.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-navy"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 inline-block">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-slate-200 shadow-lg">
              <img src="https://picsum.photos/seed/doctor/300/300" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md text-navy border border-slate-200 hover:bg-slate-50">
              <Camera size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <User size={14} /> Nome Completo
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Mail size={14} /> E-mail (Inalterável)
              </label>
              <input 
                type="email" 
                value={email} 
                readOnly 
                className="w-full p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Área de Atuação</label>
              <input 
                type="text" 
                value={specialty} 
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Shield size={14} /> Senha
              </label>
              <button className="w-full p-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-navy hover:bg-slate-50">
                Alterar Senha
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button className="flex items-center gap-2 bg-navy text-white px-8 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">
              <Save size={18} /> Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
