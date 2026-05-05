import { useState, useEffect, FormEvent } from 'react';
import { auth, login, loginWithEmail, createAdminUser, logout, db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot,
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  updateDoc,
  getDoc,
  setDoc,
  increment
} from 'firebase/firestore';
import { 
  Lock, 
  LogOut, 
  LayoutDashboard, 
  Trophy, 
  FileText, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  PlusCircle,
  Download,
  FileImage,
  Sun,
  Moon,
  Upload,
  Eye,
  EyeOff,
  MousePointerClick,
  Users,
  UserCog,
  User,
  Shirt,
  ShieldCheck,
  Paperclip,
  CheckCircle2,
  Link as LinkIcon,
  UserPlus,
  ArrowUpRight,
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Configuração para usar estilos inline em vez de classes (melhor para o Shadow DOM do site)
const Quill = (ReactQuill as any).Quill;
if (Quill) {
  const Size = Quill.import('attributors/style/size');
  Size.whitelist = ['0.75em', '1em', '1.5em', '2.5em'];
  Quill.register(Size, true);

  const Color = Quill.import('attributors/style/color');
  Quill.register(Color, true);

  const Align = Quill.import('attributors/style/align');
  Quill.register(Align, true);
}

export default function Admin() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'news' | 'trophies' | 'transparency' | 'campaign' | 'squad' | 'leads' | 'board' | 'users'>('news');
  const [userRole, setUserRole] = useState<'admin' | 'marketing' | 'secretario' | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [confirmModal, setConfirmModal] = useState<{message: string, onConfirm: () => void} | null>(null);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'size': ['0.75em', '1em', '1.5em', '2.5em'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];
  const [isAddingCampaign, setIsAddingCampaign] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campaignType, setCampaignType] = useState<'popup' | 'card' | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    headline: '',
    subtitle: '',
    buttonText: '',
    image: '',
    destinationUrl: '',
    active: true,
    type: 'popup' as 'popup' | 'card'
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin_theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);
  }, []);
  
  // Custom login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // First access state
  const [loginMode, setLoginMode] = useState<'login' | 'first-access' | 'set-password'>('login');
  const [firstAccessEmail, setFirstAccessEmail] = useState('');
  const [firstAccessError, setFirstAccessError] = useState('');
  const [firstAccessLoading, setFirstAccessLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [setPasswordError, setSetPasswordError] = useState('');
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);

  // Step 1: Valida o formato do e-mail e avança para criação de senha
  // Não precisa ler o Firestore aqui — evita erro de permissão para não-autenticados
  const handleFirstAccess = async (e: FormEvent) => {
    e.preventDefault();
    if (firstAccessLoading) return;
    setFirstAccessError('');
    setFirstAccessLoading(true);

    const email = firstAccessEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFirstAccessError('Informe um e-mail válido.');
      setFirstAccessLoading(false);
      return;
    }

    // Avança direto para a tela de criação de senha
    // A verificação de autorização acontece APÓS a criação da conta (usuário já autenticado)
    setNewPassword('');
    setConfirmPassword('');
    setSetPasswordError('');
    setFirstAccessLoading(false);
    setLoginMode('set-password');
  };

  // Step 2: Cria conta no Firebase Auth, verifica autorização no Firestore (já autenticado)
  const handleSetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (setPasswordLoading) return;
    setSetPasswordError('');

    if (newPassword.length < 6) {
      setSetPasswordError('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSetPasswordError('As senhas não coincidem.');
      return;
    }

    setSetPasswordLoading(true);
    const email = firstAccessEmail.trim().toLowerCase();
    try {
      // Cria a conta no Firebase Auth
      await createAdminUser(email, newPassword);

      // Agora autenticado — verifica se o e-mail está autorizado no Firestore
      try {
        const permDoc = await getDoc(doc(db, 'user_permissions', email));
        if (!permDoc.exists()) {
          // Não autorizado — apaga a conta recém criada e faz logout
          const currentUser = auth.currentUser;
          if (currentUser) await currentUser.delete();
          await logout();
          setSetPasswordError('E-mail não autorizado. Solicite acesso ao administrador.');
          setSetPasswordLoading(false);
          return;
        }
        // Autorizado! Firebase já logou automaticamente ao criar a conta — tudo certo.
      } catch (permErr: any) {
        // Se não conseguir verificar permissão, faz logout por segurança
        await logout();
        setSetPasswordError('Não foi possível verificar autorização. Tente novamente.');
        setSetPasswordLoading(false);
        return;
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        // Conta já existe — pode ser via Google ou e-mail/senha com outra senha
        // Tenta logar com a senha informada
        try {
          await loginWithEmail(email, newPassword);
          // Login OK — verifica autorização
          const permDoc = await getDoc(doc(db, 'user_permissions', email));
          if (!permDoc.exists()) {
            await logout();
            setSetPasswordError('E-mail não autorizado. Solicite acesso ao administrador.');
            return;
          }
          // Autorizado — onAuthStateChanged detecta e abre o painel
        } catch (loginErr: any) {
          if (loginErr.code === 'auth/wrong-password' || loginErr.code === 'auth/invalid-credential') {
            // Conta existe com senha diferente (ou via Google)
            setSetPasswordError(
              'Este e-mail já possui uma conta ativa. Se você usa "Entrar com Google", volte ao login e clique em "Entrar com Google". Caso contrário, entre com sua senha anterior.'
            );
          } else {
            setSetPasswordError(`Erro ao autenticar: ${loginErr.message}`);
          }
        }
      } else {
        setSetPasswordError(`Erro ao criar conta: ${err.message}`);
      }
    } finally {
      setSetPasswordLoading(false);
    }
  };

  // Highlights state
  const [heroData, setHeroData] = useState({
    title: 'RACING FC: O RUBRO-NEGRO CAPIXABA',
    description: 'Tradição, garra e paixão. O Racing de Vitória escreve capítulos de glória no futebol do Espírito Santo desde 1951.',
    buttonText: 'Seja Sócio',
    buttonLink: '#',
    imageUrl: '/head.png'
  });

  // Trophies state
  const [trophies, setTrophies] = useState<any[]>([]);
  const [isAddingTrophy, setIsAddingTrophy] = useState(false);
  const [newTrophy, setNewTrophy] = useState({ title: '', year: '', description: '', imageUrl: '' });

  // Transparency state
  const [reports, setReports] = useState<any[]>([]);
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [reportAttachments, setReportAttachments] = useState<{name: string, url: string, type: 'pdf' | 'image'}[]>([]);
  const [newReport, setNewReport] = useState({ year: '', title: '', content: '' });
  // News state
  const [news, setNews] = useState<any[]>([]);
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newArticle, setNewArticle] = useState({ 
    title: '', 
    subtitle: '', 
    date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }), 
    category: 'Notícias', 
    image: '', 
    content: '',
    createdAt: Date.now()
  });

  // Squad state
  const [athletes, setAthletes] = useState<any[]>([]);
  const [isAddingAthlete, setIsAddingAthlete] = useState(false);
  const [newAthlete, setNewAthlete] = useState({ 
    name: '', 
    nickname: '', 
    birthDate: '', 
    position: '', 
    category: 'Profissional', 
    photoUrl: '',
    number: '' 
  });
  const DEFAULT_SQUAD_CATEGORIES = ['Profissional', 'Sub 7', 'Sub 9', 'Sub 11', 'Sub 13', 'Sub 15', 'Sub 17', 'Sub 21', '+40', '+50'];
  const [squadCategories, setSquadCategories] = useState<string[]>(DEFAULT_SQUAD_CATEGORIES);
  const [selectedSquadCategory, setSelectedSquadCategory] = useState('Profissional');
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{old: string, new: string} | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Board state
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [isAddingBoardMember, setIsAddingBoardMember] = useState(false);
  const [newBoardMember, setNewBoardMember] = useState({ name: '', role: '', category: 'Diretoria executiva', photoUrl: '' });
  const [selectedBoardCategory, setSelectedBoardCategory] = useState('Diretoria executiva');
  
  // Leads state
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [socioLeads, setSocioLeads] = useState<any[]>([]);
  const [selectedLeadTab, setSelectedLeadTab] = useState<'registrations' | 'socios'>('registrations');
  const [authorizedUsers, setAuthorizedUsers] = useState<any[]>([]);
  const [viewLead, setViewLead] = useState<any | null>(null);

  useEffect(() => {
    let unsubscribeRegs: (() => void) | null = null;
    let unsubscribeSocios: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      // Limpa listeners anteriores ao trocar de usuário
      if (unsubscribeRegs) { unsubscribeRegs(); unsubscribeRegs = null; }
      if (unsubscribeSocios) { unsubscribeSocios(); unsubscribeSocios = null; }

      if (u && u.email) {
        try {
          const permDoc = await getDoc(doc(db, 'user_permissions', u.email));
          if (permDoc.exists()) {
            setUserRole(permDoc.data().role);
          } else if (u.email === 'adm.racing@sistema.com') {
            // Única conta raíz permanente — não pode ser removida
            setUserRole('admin');
            await setDoc(doc(db, 'user_permissions', u.email), {
              email: u.email,
              role: 'admin',
              createdAt: Date.now()
            });
          } else {
            // Usuário não autorizado — desloga
            await logout();
            setUserRole(null);
          }
        } catch (e) {
          console.error('Erro ao buscar permissões:', e);
        }

        // Só ativa listeners de leads quando o usuário está autenticado
        try {
          const qRegs = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
          unsubscribeRegs = onSnapshot(qRegs,
            (snapshot) => setRegistrations(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
            () => {
              unsubscribeRegs = onSnapshot(collection(db, 'registrations'),
                (snapshot) => setRegistrations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
              );
            }
          );

          const qSocios = query(collection(db, 'socio_leads'), orderBy('createdAt', 'desc'));
          unsubscribeSocios = onSnapshot(qSocios,
            (snapshot) => setSocioLeads(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
            () => {
              unsubscribeSocios = onSnapshot(collection(db, 'socio_leads'),
                (snapshot) => setSocioLeads(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
              );
            }
          );
        } catch (e) {
          console.error('Erro ao iniciar listeners de leads:', e);
        }

        fetchData();
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRegs) unsubscribeRegs();
      if (unsubscribeSocios) unsubscribeSocios();
    };
  }, []);

  const fetchData = async () => {
    const paths = {
      news: 'news',
      trophies: 'trophies',
      transparency: 'transparency',
      campaigns: 'campaigns',
      players: 'players',
      board: 'board',
      registrations: 'registrations',
      socio_leads: 'socio_leads',
      users: 'user_permissions'
    };

    try {
      console.log('Iniciando fetch de dados...');
      
      // Fetch News
      try {
        const newsSnap = await getDocs(query(collection(db, paths.news), orderBy('createdAt', 'desc')));
        setNews(newsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        // Fallback if index isn't ready or field doesn't exist
        const newsSnap = await getDocs(query(collection(db, paths.news)));
        setNews(newsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      // Fetch Trophies
      try {
        const trophiesSnap = await getDocs(query(collection(db, paths.trophies), orderBy('year', 'desc')));
        setTrophies(trophiesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, paths.trophies);
      }

      // Fetch Transparency
      try {
        const transparencySnap = await getDocs(query(collection(db, paths.transparency), orderBy('year', 'desc')));
        setReports(transparencySnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, paths.transparency);
      }

      // Fetch Campaigns
      try {
        const campaignsSnap = await getDocs(query(collection(db, paths.campaigns), orderBy('createdAt', 'desc')));
        setCampaigns(campaignsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        const campaignsSnap = await getDocs(collection(db, paths.campaigns));
        setCampaigns(campaignsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      // Fetch Athletes (Players)
      try {
        const playersSnap = await getDocs(query(collection(db, paths.players), orderBy('name', 'asc')));
        setAthletes(playersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        const playersSnap = await getDocs(collection(db, paths.players));
        setAthletes(playersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      // Fetch Board
      try {
        const boardSnap = await getDocs(query(collection(db, paths.board), orderBy('name', 'asc')));
        setBoardMembers(boardSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, paths.board);
      }

      // Fetch Registrations
      try {
        const registrationsSnap = await getDocs(query(collection(db, paths.registrations), orderBy('createdAt', 'desc')));
        setRegistrations(registrationsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        const registrationsSnap = await getDocs(collection(db, paths.registrations));
        setRegistrations(registrationsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      // Fetch Socio Leads
      try {
        const socioLeadsSnap = await getDocs(query(collection(db, paths.socio_leads), orderBy('createdAt', 'desc')));
        setSocioLeads(socioLeadsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        const socioLeadsSnap = await getDocs(collection(db, paths.socio_leads));
        setSocioLeads(socioLeadsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      // Fetch Users (Permissions)
      try {
        const usersSnap = await getDocs(query(collection(db, paths.users)));
        setAuthorizedUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.warn("Erro ao buscar usuários ou sem permissão:", e);
      }

      console.log('Dados carregados com sucesso.');
    } catch (e: any) {
      console.error('Erro consolidado no fetchData:', e);
      setLoginError(`Erro no carregamento: ${e.message}`);
    }
  };

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setIsUploading(true);
    setUploadProgress(0);
    showNotification(`Iniciando upload: ${file.name}`, 'info');
    
    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default'); 
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/dbjjrna8a/image/upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          console.log('[Cloudinary] Sucesso:', data.secure_url);
          showNotification('Upload concluído!', 'success');
          setIsUploading(false);
          setUploadProgress(0);
          resolve(data.secure_url);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          console.error('[Cloudinary] Erro:', errorData);
          showNotification(`Erro no Cloudinary: ${errorData.error?.message || 'Falha no upload'}`, 'error');
          setIsUploading(false);
          setUploadProgress(0);
          resolve(null);
        }
      };

      xhr.onerror = () => {
        console.error('[Cloudinary] Erro de rede');
        showNotification('Erro de rede ao subir arquivo.', 'error');
        setIsUploading(false);
        setUploadProgress(0);
        resolve(null);
      };

      xhr.send(formData);
    });
  };

  const handleGoogleLogin = async () => {
    if (isGoogleLoggingIn) return;
    setLoginError('');
    setIsGoogleLoggingIn(true);
    try {
      const result = await login();
      if (!result) {
        setIsGoogleLoggingIn(false);
        return;
      }
      const email = result.user.email || '';
      // Verifica se o email está autorizado
      const permDoc = await getDoc(doc(db, 'user_permissions', email));
      if (!permDoc.exists() && email !== 'adm.racing@sistema.com') {
        await logout();
        setLoginError('Conta Google não autorizada. Solicite acesso ao administrador.');
      }
      // Se autorizado, onAuthStateChanged cuida do resto
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setLoginError(`Erro ao entrar com Google: ${err.message}`);
      }
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const handleCustomLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    
    setLoginError('');
    setIsLoggingIn(true);
    
    const cleanUsername = username.trim().toLowerCase();
    const email = cleanUsername === 'adm.racing' ? 'adm.racing@sistema.com' : cleanUsername;
    
    try {
      console.log('Tentando login para:', email);
      await loginWithEmail(email, password);
    } catch (err: any) {
      console.error('Login error code:', err.code, err.message);
      
      // Lógica de provisionamento inicial para o usuário fixo solicitado
      const isInitialAdmin = cleanUsername === 'adm.racing' && password === 'Racing@adm2026';
      
      // Firebase v10+ uses 'auth/invalid-credential' for many errors including user-not-found
      const isUserNotFoundLike = 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/invalid-login-credentials';

      if (isInitialAdmin && isUserNotFoundLike) {
        try {
          console.log('Tentando registro inicial do Admin Racing FC...');
          await createAdminUser(email, password);
          return;
        } catch (regErr: any) {
          console.error('Erro no registro automático:', regErr);
          if (regErr.code === 'auth/email-already-in-use') {
             setLoginError('Usuário já cadastrado, mas a senha está incorreta.');
          } else if (regErr.code === 'auth/operation-not-allowed') {
             setLoginError('O login por E-mail/Senha está desativado no Firebase Console. Por favor, ative-o na aba "Authentication > Sign-in method".');
          } else {
             setLoginError(`Erro no registro: ${regErr.message}`);
          }
        }
      } else if (err.code === 'auth/operation-not-allowed') {
        setLoginError('Login por E-mail/Senha desativado no Firebase Console.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        if (isInitialAdmin) {
          setLoginError('Senha incorreta para o usuário adm.racing.');
        } else {
          setLoginError('Credenciais inválidas.');
        }
      } else {
        setLoginError(`Erro: ${err.message}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAddNews = async () => {
    if (isSaving) return;
    if (!newArticle.title || !newArticle.content) return showNotification('Preencha o título e o conteúdo da notícia.', 'error');
    
    setIsSaving(true);
    try {
      if (editingNewsId) {
        await setDoc(doc(db, 'news', editingNewsId), {
          ...newArticle,
          updatedAt: Date.now()
        }, { merge: true });
        setNews(news.map(n => n.id === editingNewsId ? { id: editingNewsId, ...newArticle } : n));
        showNotification('Notícia atualizada com sucesso!');
      } else {
        const articleWithTimestamp = {
          ...newArticle,
          createdAt: Date.now()
        };
        const docRef = await addDoc(collection(db, 'news'), articleWithTimestamp);
        setNews([{ id: docRef.id, ...articleWithTimestamp }, ...news]);
        showNotification('Notícia publicada com sucesso!');
      }
      
      setIsAddingNews(false);
      setEditingNewsId(null);
      setNewArticle({ 
        title: '', 
        subtitle: '', 
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }), 
        category: 'Notícias', 
        image: '', 
        content: '',
        createdAt: Date.now()
      });
    } catch (e) {
      handleFirestoreError(e, editingNewsId ? OperationType.UPDATE : OperationType.CREATE, 'news');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (article: any) => {
    setNewArticle({
      title: article.title || '',
      subtitle: article.subtitle || '',
      date: article.date || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      category: article.category || 'Notícias',
      image: article.image || '',
      content: article.content || '',
      createdAt: article.createdAt || Date.now()
    });
    setEditingNewsId(article.id);
    setIsAddingNews(true);
  };

  const handleDeleteNews = async (id: string) => {
    setConfirmModal({
      message: 'Excluir esta notícia definitivamente?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'news', id));
          setNews(news.filter(n => n.id !== id));
          showNotification('Notícia excluída.', 'info');
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `news/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const handleDeleteCampaign = async (id: string) => {
    setConfirmModal({
      message: 'Excluir esta campanha definitivamente?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'campaigns', id));
          setCampaigns(campaigns.filter(c => c.id !== id));
          showNotification('Campanha excluída.', 'info');
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `campaigns/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };



  const handleAddAthlete = async () => {
    if (isSaving) return;
    if (!newAthlete.name || !newAthlete.category) return showNotification('Preencha o nome e a categoria.', 'error');

    setIsSaving(true);
    try {
      // Calcular idade se data de nascimento existir
      let age = '';
      if (newAthlete.birthDate) {
        age = calculateAge(newAthlete.birthDate).toString();
      }

      const athleteData = {
        ...newAthlete,
        age,
        createdAt: Date.now()
      };

      const docRef = await addDoc(collection(db, 'players'), athleteData);
      setAthletes([{ id: docRef.id, ...athleteData }, ...athletes]);
      showNotification('Atleta cadastrado com sucesso!');
      
      setIsAddingAthlete(false);
      setNewAthlete({ 
        name: '', 
        nickname: '', 
        birthDate: '', 
        position: '', 
        category: 'Profissional', 
        photoUrl: '',
        number: '' 
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'players');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAthlete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'players', id));
      setAthletes(athletes.filter(a => a.id !== id));
      showNotification('Atleta removido.', 'info');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `players/${id}`);
    }
    setConfirmModal(null);
  };

  const handleAddBoardMember = async () => {
    if (isSaving) return;
    if (!newBoardMember.name || !newBoardMember.role || !newBoardMember.category) return showNotification('Preencha o nome, cargo e a categoria.', 'error');

    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'board'), {
        ...newBoardMember,
        createdAt: Date.now()
      });
      setBoardMembers([{ id: docRef.id, ...newBoardMember }, ...boardMembers]);
      showNotification('Membro da diretoria cadastrado!');
      
      setIsAddingBoardMember(false);
      setNewBoardMember({ name: '', role: '', category: 'Diretoria executiva', photoUrl: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'board');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBoardMember = async (id: string) => {
    setConfirmModal({
      message: 'Excluir este membro da diretoria?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'board', id));
          setBoardMembers(boardMembers.filter(m => m.id !== id));
          showNotification('Membro removido.', 'info');
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `board/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const handleDeleteLead = async (id: string, type: 'registrations' | 'socios') => {
    setConfirmModal({
      message: `Excluir esta ${type === 'registrations' ? 'matrícula' : 'inscrição de sócio'}?`,
      onConfirm: async () => {
        try {
          const collectionName = type === 'registrations' ? 'registrations' : 'socio_leads';
          await deleteDoc(doc(db, collectionName, id));
          if (type === 'registrations') {
            setRegistrations(registrations.filter(r => r.id !== id));
          } else {
            setSocioLeads(socioLeads.filter(s => s.id !== id));
          }
          showNotification('Registro removido.', 'info');
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `${type === 'registrations' ? 'registrations' : 'socio_leads'}/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const handleAddTrophy = async () => {
    if (isSaving) return;
    if (!newTrophy.title || !newTrophy.year || !newTrophy.imageUrl) return showNotification('Preencha título, ano e anexe a foto.', 'error');
    
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'trophies'), newTrophy);
      setTrophies([{ id: docRef.id, ...newTrophy }, ...trophies]);
      setIsAddingTrophy(false);
      setNewTrophy({ title: '', year: '', description: '', imageUrl: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'trophies');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCampaign = async () => {
    if (isSaving) return;
    if (!newCampaign.type || !newCampaign.image) return showNotification('Selecione o tipo e anexe uma imagem.', 'error');

    setIsSaving(true);
    try {
      if (editingCampaignId) {
        // Se estamos ativando este e for popup, desativar outros primeiro
        if (newCampaign.active) {
           const othersSameType = campaigns.filter(c => c.type === newCampaign.type && c.id !== editingCampaignId);
           for (const p of othersSameType) {
              await updateDoc(doc(db, 'campaigns', p.id), { active: false });
           }
        }

        await updateDoc(doc(db, 'campaigns', editingCampaignId), {
          ...newCampaign,
          type: campaignType,
          updatedAt: Date.now()
        });
        
        fetchData(); // Recarrega tudo para garantir sincronia
        showNotification('Campanha atualizada!');
      } else {
        // Se for novo e ativo e popup, desativar outros
        if (newCampaign.active) {
           const othersSameType = campaigns.filter(c => c.type === newCampaign.type);
           for (const p of othersSameType) {
              await updateDoc(doc(db, 'campaigns', p.id), { active: false });
           }
        }

        const campaignData = {
          ...newCampaign,
          type: campaignType,
          createdAt: Date.now()
        };
        await addDoc(collection(db, 'campaigns'), campaignData);
        fetchData();
        showNotification('Campanha publicada!');
      }
      
      setIsAddingCampaign(false);
      setEditingCampaignId(null);
      setCampaignType(null);
      setNewCampaign({ title: '', headline: '', subtitle: '', buttonText: '', image: '', destinationUrl: '', active: true, type: 'popup' });
    } catch (e) {
      handleFirestoreError(e, editingCampaignId ? OperationType.UPDATE : OperationType.CREATE, 'campaigns');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCampaignActive = async (campaign: any) => {
    try {
      const newState = !campaign.active;
      
      // Se estiver ativando, desativar outros do mesmo tipo
      if (newState) {
        const othersSameType = campaigns.filter(c => c.type === campaign.type && c.id !== campaign.id);
        for (const p of othersSameType) {
          await updateDoc(doc(db, 'campaigns', p.id), { active: false });
        }
      }

      await updateDoc(doc(db, 'campaigns', campaign.id), { active: newState });
      fetchData();
      showNotification(`Campanha ${newState ? 'ativada' : 'desativada'}!`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `campaigns/${campaign.id}`);
    }
  };

  const handleEditCampaign = (campaign: any) => {
    setNewCampaign({
      title: campaign.title || '',
      headline: campaign.headline || '',
      subtitle: campaign.subtitle || '',
      buttonText: campaign.buttonText || '',
      image: campaign.image || '',
      destinationUrl: campaign.destinationUrl || '',
      active: campaign.active ?? true,
      type: campaign.type || 'popup'
    });
    setCampaignType(campaign.type);
    setEditingCampaignId(campaign.id);
    setIsAddingCampaign(true);
  };

  const handleDeleteTrophy = async (id: string) => {
    setConfirmModal({
      message: 'Excluir este título definitivamente?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'trophies', id));
          setTrophies(trophies.filter(t => t.id !== id));
          showNotification('Título excluído.', 'info');
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `trophies/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const handleAddReport = async () => {
    if (isSaving) return;
    if (!newReport.title || !newReport.year) return showNotification('Preencha o título e o ano do exercício.', 'error');

    setIsSaving(true);
    try {
      const data = { 
        ...newReport, 
        attachments: reportAttachments,
        datePublished: new Date().toISOString().split('T')[0]
      };
      const docRef = await addDoc(collection(db, 'transparency'), data);
      setReports([{ id: docRef.id, ...data }, ...reports]);
      setIsAddingReport(false);
      setNewReport({ year: '', title: '', content: '' });
      setReportAttachments([]);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'transparency');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    setConfirmModal({
      message: 'Excluir relatório de transparência?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'transparency', id));
          setReports(reports.filter(r => r.id !== id));
          showNotification('Relatório excluído.', 'info');
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `transparency/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse">Carregando Sistema...</div>;

  if (!user || !userRole) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">

          {/* === TELA DE LOGIN NORMAL === */}
          {loginMode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/10 p-10 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full"></div>
                <img src="/racing-fc.png" alt="Racing FC" className="w-24 h-24 mx-auto relative z-10" />
              </div>
              <h1 className="text-2xl font-black italic uppercase mb-2">Acesso Administrativo</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-8">Racing FC — Painel de Gestão</p>

              <form onSubmit={handleCustomLogin} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest">E-mail / Usuário</label>
                  <input
                    type="text"
                    placeholder="seu@email.com"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-black border border-white/10 p-3 text-sm font-bold text-white outline-none focus:border-red-600/50 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-black border border-white/10 p-3 pr-10 text-sm font-bold text-white outline-none focus:border-red-600/50 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {loginError && (
                  <div className="bg-red-950/50 border border-red-600/30 p-3 rounded-sm">
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider">{loginError}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`w-full bg-red-600 text-white py-4 text-xs font-black uppercase tracking-widest transition-all ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700 active:scale-[0.98]'}`}
                >
                  {isLoggingIn ? 'Autenticando...' : 'Entrar'}
                </button>
              </form>

              {/* Divisor ou */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[9px] font-bold uppercase text-gray-600 tracking-widest">ou</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Botão Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoggingIn}
                className={`w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 text-xs font-black uppercase tracking-widest transition-all border border-white/20 ${
                  isGoogleLoggingIn ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 active:scale-[0.98]'
                }`}
              >
                {/* Ícone Google SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {isGoogleLoggingIn ? 'Conectando...' : 'Entrar com Google'}
              </button>

              <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
                <button
                  onClick={() => { setLoginMode('first-access'); setFirstAccessEmail(''); setFirstAccessError(''); }}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={12} />
                  Primeiro Acesso
                </button>
                <Link to="/" className="text-[10px] uppercase font-bold text-gray-600 hover:text-white transition-colors">← Voltar para o site</Link>
              </div>
            </motion.div>
          )}

          {/* === TELA DE PRIMEIRO ACESSO — verificação de e-mail === */}
          {loginMode === 'first-access' && (
            <motion.div
              key="first-access"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/10 p-10 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-500"></div>

              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-600/10 blur-2xl rounded-full"></div>
                <div className="w-14 h-14 mx-auto relative z-10 bg-red-600/10 border border-red-600/30 rounded-full flex items-center justify-center">
                  <ShieldCheck size={28} className="text-red-500" />
                </div>
              </div>

              <h2 className="text-xl font-black italic uppercase mb-1 text-white">Primeiro Acesso</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-8">Informe seu e-mail para continuar</p>

              <form onSubmit={handleFirstAccess} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Seu E-mail</label>
                  <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={firstAccessEmail}
                    onChange={e => setFirstAccessEmail(e.target.value)}
                    autoFocus
                    className="w-full bg-black border border-white/10 p-3 text-sm font-bold text-white outline-none focus:border-red-600/50 transition-colors placeholder:text-gray-600"
                    required
                  />
                </div>
                {firstAccessError && (
                  <div className="bg-red-950/50 border border-red-600/30 p-3 rounded-sm">
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider">{firstAccessError}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={firstAccessLoading}
                  className={`w-full bg-red-600 text-white py-4 text-xs font-black uppercase tracking-widest transition-all ${firstAccessLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700 active:scale-[0.98]'}`}
                >
                  {firstAccessLoading ? 'Verificando...' : 'Verificar Acesso'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => { setLoginMode('login'); setFirstAccessError(''); }}
                  className="text-[10px] uppercase font-bold text-gray-600 hover:text-white transition-colors"
                >
                  ← Voltar para o Login
                </button>
              </div>
            </motion.div>
          )}

          {/* === TELA DE CRIAÇÃO DE SENHA === */}
          {loginMode === 'set-password' && (
            <motion.div
              key="set-password"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/10 p-10 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-emerald-500"></div>

              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-600/10 blur-2xl rounded-full"></div>
                <div className="w-14 h-14 mx-auto relative z-10 bg-green-600/10 border border-green-600/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-green-500" />
                </div>
              </div>

              <h2 className="text-xl font-black italic uppercase mb-1 text-white">Acesso Autorizado!</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Crie sua senha de acesso</p>
              <p className="text-[10px] text-green-500 font-bold mb-8 truncate">{firstAccessEmail}</p>

              <form onSubmit={handleSetPassword} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      autoFocus
                      className="w-full bg-black border border-white/10 p-3 pr-10 text-sm font-bold text-white outline-none focus:border-green-600/50 transition-colors placeholder:text-gray-600"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Confirmar Senha</label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-black border border-white/10 p-3 pr-10 text-sm font-bold text-white outline-none focus:border-green-600/50 transition-colors placeholder:text-gray-600"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showConfirmPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Indicador de força da senha */}
                {newPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            newPassword.length >= i * 3
                              ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-yellow-500' : i <= 3 ? 'bg-blue-500' : 'bg-green-500'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[8px] text-gray-600 font-bold uppercase">
                      {newPassword.length < 6 ? 'Muito curta' : newPassword.length < 9 ? 'Fraca' : newPassword.length < 12 ? 'Boa' : 'Forte'}
                    </p>
                  </div>
                )}

                {setPasswordError && (
                  <div className="bg-red-950/50 border border-red-600/30 p-3 rounded-sm">
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider">{setPasswordError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={setPasswordLoading}
                  className={`w-full bg-green-700 text-white py-4 text-xs font-black uppercase tracking-widest transition-all ${setPasswordLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600 active:scale-[0.98]'}`}
                >
                  {setPasswordLoading ? 'Criando conta...' : 'Criar Senha e Entrar'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => { setLoginMode('first-access'); setSetPasswordError(''); }}
                  className="text-[10px] uppercase font-bold text-gray-600 hover:text-white transition-colors"
                >
                  ← Alterar E-mail
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen font-sans overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-zinc-900'}`}>
      {/* Sidebar Menu */}
      <aside className={`w-64 border-r flex flex-col flex-shrink-0 transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-white border-gray-200'}`}>
        <div className={`p-6 border-b transition-colors ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 flex items-center justify-center">
                <img src="/racing-fc.png" alt="Racing FC" className="w-full h-full object-contain" />
             </div>
             <span className={`font-black uppercase italic tracking-tighter text-sm ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Racing <span className="text-red-600">Admin</span></span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {[
            { id: 'news', label: 'Notícias', icon: FileText, roles: ['admin', 'marketing'] },
            { id: 'campaign', label: 'Campanhas', icon: FileImage, roles: ['admin', 'marketing'] },
            { id: 'trophies', label: 'Títulos', icon: Trophy, roles: ['admin', 'secretario'] },
            { id: 'squad', label: 'Elenco', icon: Shirt, roles: ['admin', 'secretario'] },
            { id: 'board', label: 'Diretoria', icon: ShieldCheck, roles: ['admin'] },
            { id: 'leads', label: 'Cadastros', icon: Download, roles: ['admin', 'secretario'] },
            { id: 'transparency', label: 'Transparência', icon: FileText, roles: ['admin', 'secretario'] },
            { id: 'users', label: 'Usuários', icon: UserPlus, roles: ['admin'] },
          ].filter(item => item.roles.includes(userRole || '')).map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)} 
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${activeTab === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : theme === 'dark' ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-red-600'}`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t transition-colors space-y-2 ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
           <button 
             onClick={toggleTheme} 
             className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-wider rounded-sm transition-all ${theme === 'dark' ? 'bg-zinc-800 text-yellow-500 hover:bg-zinc-700' : 'bg-gray-100 text-zinc-900 hover:bg-gray-200'}`}
           >
             {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
             Modo {theme === 'dark' ? 'Claro' : 'Escuro'}
           </button>
           <div className={`px-4 py-3 mb-4 rounded-sm transition-colors ${theme === 'dark' ? 'bg-black/40' : 'bg-gray-50'}`}>
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Usuário Logado</p>
              <p className="text-[11px] font-black truncate text-red-500">{user.email}</p>
           </div>
           <button onClick={logout} className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${theme === 'dark' ? 'bg-zinc-800 border-white/5 text-gray-400 hover:bg-red-950/30 hover:text-red-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600'}`}>
             <LogOut size={14} /> Sair do Sistema
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950' : 'bg-gray-50'}`}>
        <header className={`h-16 border-b flex items-center justify-between px-8 backdrop-blur-xl sticky top-0 z-10 transition-colors ${theme === 'dark' ? 'border-white/5 bg-zinc-950/50' : 'border-gray-200 bg-white/80'}`}>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
             Sistema de Gestão / <span className={theme === 'dark' ? 'text-white' : 'text-zinc-900'}>
                {activeTab === 'news' && 'Notícias'}
                {activeTab === 'campaign' && 'Campanhas'}
                {activeTab === 'trophies' && 'Títulos'}
                {activeTab === 'squad' && 'Elenco'}
                {activeTab === 'board' && 'Diretoria'}
                {activeTab === 'leads' && 'Inscrições / Leads'}
                {activeTab === 'transparency' && 'Transparência'}
                {activeTab === 'users' && 'Gestão de Usuários'}
              </span>
           </h2>
           <div className="flex items-center gap-4">
             <Link to="/" className="text-[10px] font-bold uppercase text-gray-500 hover:text-red-500 flex items-center gap-2 transition-colors">Ver Site <Edit3 size={12} /></Link>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {activeTab === 'news' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Gerenciar Notícias</h3>
                <button 
                  onClick={() => {
                    setEditingNewsId(null);
                    setNewArticle({ 
                      title: '', 
                      subtitle: '', 
                      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }), 
                      category: 'Notícias', 
                      image: '', 
                      content: '',
                      createdAt: Date.now()
                    });
                    setIsAddingNews(true);
                  }} 
                  className={`${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-zinc-900 text-white hover:bg-black'} px-5 py-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all`}
                >
                  <PlusCircle size={14} /> Nova Notícia
                </button>
              </div>

              <AnimatePresence>
                {isAddingNews && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`${theme === 'dark' ? 'bg-zinc-900 border-red-600/20' : 'bg-white border-gray-200 shadow-xl'} border p-6 rounded-sm overflow-hidden space-y-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Título da Notícia</label>
                        <input type="text" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-zinc-900'} border p-4 text-sm outline-none focus:border-red-600 transition-colors`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Subtítulo / Resumo</label>
                        <input type="text" value={newArticle.subtitle} onChange={e => setNewArticle({...newArticle, subtitle: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-zinc-900'} border p-4 text-sm outline-none focus:border-red-600 transition-colors`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Categoria</label>
                        <input type="text" value={newArticle.category} onChange={e => setNewArticle({...newArticle, category: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-zinc-900'} border p-4 text-sm outline-none focus:border-red-600 transition-colors`} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Imagem de Destaque</label>
                        <div className="flex flex-col gap-4">
                          {!newArticle.image ? (
                            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 transition-all cursor-pointer ${isUploading ? 'border-red-600/50 bg-red-600/5' : theme === 'dark' ? 'border-white/10 hover:border-red-600/30 bg-black/40 hover:bg-black/60' : 'border-gray-200 hover:border-red-600/30 bg-gray-50 hover:bg-gray-100'}`}>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                disabled={isUploading}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await handleFileUpload(file);
                                    if (url) setNewArticle({...newArticle, image: url});
                                  }
                                  e.target.value = '';
                                }} 
                              />
                              {isUploading ? (
                                <>
                                  <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mb-4"></div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600 animate-pulse">Subindo Imagem ({uploadProgress}%)...</span>
                                </>
                              ) : (
                                <>
                                  <Upload size={32} className="text-gray-500 mb-4 group-hover:scale-110 transition-transform" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Clique para anexar a foto da notícia</span>
                                  <span className="text-[8px] text-gray-600 mt-2">JPG, PNG ou WebP</span>
                                </>
                              )}
                            </label>
                          ) : (
                            <div className={`relative w-full h-64 ${theme === 'dark' ? 'bg-black border-white/5' : 'bg-gray-100 border-gray-200'} border rounded-lg overflow-hidden group`}>
                              <img src={newArticle.image} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-4">
                                <button 
                                  onClick={() => setNewArticle({...newArticle, image: ''})} 
                                  className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors flex flex-col items-center gap-2"
                                >
                                  <Trash2 size={24} />
                                  <span className="text-[8px] font-black uppercase">Remover Imagem</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Conteúdo da Notícia</label>
                        <div className={`rich-text-editor ${theme === 'dark' ? 'dark-quill' : ''}`}>
                          <ReactQuill 
                            theme="snow"
                            value={newArticle.content} 
                            onChange={content => setNewArticle({...newArticle, content})}
                            modules={quillModules}
                            formats={quillFormats}
                            className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-zinc-900'} min-h-[300px] border-white/5`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <button onClick={() => { setIsAddingNews(false); setEditingNewsId(null); }} className="px-6 py-3 text-[10px] font-black uppercase text-gray-500">Cancelar</button>
                      <button onClick={handleAddNews} disabled={isSaving || isUploading} className="bg-red-600 px-10 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                        {isSaving ? 'Salvando...' : isUploading ? 'Aguarde o Upload...' : editingNewsId ? 'Atualizar Notícia' : 'Publicar Notícia'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 gap-3">
                {news.map(n => (
                  <div key={n.id} className={`${theme === 'dark' ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'} p-4 flex justify-between items-center border hover:border-red-600/30 transition-all group`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-20 h-14 ${theme === 'dark' ? 'bg-black border-white/5' : 'bg-gray-100 border-gray-200'} border rounded-sm overflow-hidden flex-shrink-0`}>
                        {n.image ? (
                          <img src={n.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${theme === 'dark' ? 'text-gray-700 bg-zinc-900' : 'text-gray-400 bg-gray-50'}`}>
                            <FileImage size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-red-600 text-[10px] font-black italic tracking-wider uppercase">{n.date} | {n.category}</div>
                        <h4 className={`text-sm font-black uppercase italic leading-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{n.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-[9px] font-bold text-gray-500 uppercase">
                          <div className="flex items-center gap-1">
                            <Eye size={10} className="text-red-600" />
                            {n.views || 0} leituras
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link 
                        to={`/noticias/${n.id}`} 
                        target="_blank"
                        className={`p-2 transition-all rounded-sm ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'}`}
                        title="Ver no Site"
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                      <button 
                        onClick={() => handleEditClick(n)} 
                        className={`p-2 transition-all rounded-sm ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'}`}
                        title="Editar Notícia"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteNews(n.id)} 
                        className={`p-2 transition-all rounded-sm ${theme === 'dark' ? 'text-gray-500 hover:text-red-500 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                        title="Excluir Notícia"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'trophies' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Galeria de Títulos</h3>
                <button onClick={() => setIsAddingTrophy(true)} className={`${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-zinc-900 text-white hover:bg-black'} px-5 py-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all`}>
                  <PlusCircle size={14} /> Novo Título
                </button>
              </div>

              <AnimatePresence>
                {isAddingTrophy && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-zinc-900 border border-red-600/20 p-6 rounded-sm overflow-hidden space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <input type="text" placeholder="Título da Conquista" value={newTrophy.title} onChange={e => setNewTrophy({...newTrophy, title: e.target.value})} className="w-full bg-black border border-white/5 p-3 text-sm text-white" />
                      </div>
                      <input type="text" placeholder="Ano" value={newTrophy.year} onChange={e => setNewTrophy({...newTrophy, year: e.target.value})} className="w-full bg-black border border-white/5 p-3 text-sm text-white" />
                    </div>
                    <textarea placeholder="Descrição curta" value={newTrophy.description} onChange={e => setNewTrophy({...newTrophy, description: e.target.value})} rows={2} className="w-full bg-black border border-white/5 p-3 text-sm text-white" />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider italic">Foto do Troféu</label>
                      <div className="flex flex-col gap-4">
                        {!newTrophy.imageUrl ? (
                          <label className={`flex flex-col items-center justify-center border border-dashed rounded-lg p-8 transition-all cursor-pointer ${isUploading ? 'border-red-600/50 bg-red-600/5' : 'border-white/10 hover:border-red-600/30 bg-black/40 hover:bg-black/60'}`}>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              disabled={isUploading}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await handleFileUpload(file);
                                  if (url) setNewTrophy({...newTrophy, imageUrl: url});
                                }
                                e.target.value = '';
                              }} 
                            />
                            {isUploading ? (
                              <>
                                <div className="w-8 h-8 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mb-4"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 animate-pulse">Subindo Foto ({uploadProgress}%)...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={24} className="text-gray-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Clique para anexar a foto do troféu</span>
                              </>
                            )}
                          </label>
                        ) : (
                          <div className="relative w-full h-32 bg-black border border-white/5 rounded-lg overflow-hidden group">
                            <img src={newTrophy.imageUrl} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-4">
                              <button 
                                onClick={() => setNewTrophy({...newTrophy, imageUrl: ''})} 
                                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors flex items-center gap-2"
                              >
                                <Trash2 size={16} />
                                <span className="text-[8px] font-black uppercase">Remover</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setIsAddingTrophy(false)} className="px-6 py-3 text-[10px] font-black uppercase text-gray-500">Cancelar</button>
                      <button onClick={handleAddTrophy} disabled={isSaving || isUploading} className="bg-red-600 px-8 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-red-600/20">
                        {isSaving ? 'Salvando...' : isUploading ? 'Aguarde o Upload...' : 'Salvar Título'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 gap-3">
                {trophies.map(t => (
                  <div key={t.id} className={`${theme === 'dark' ? 'bg-zinc-900/50' : 'bg-gray-50'} p-4 flex justify-between items-center border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} hover:border-red-600/50 transition-all group shadow-sm`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} rounded-sm overflow-hidden flex-shrink-0`}>
                        <img src={t.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <div className="text-red-600 text-[10px] font-black italic tracking-wider">{t.year}</div>
                        <h4 className="text-sm font-black uppercase italic leading-tight">{t.title}</h4>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteTrophy(t.id)} className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-all"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'transparency' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Documentos de Transparência</h3>
                <button onClick={() => setIsAddingReport(true)} className={`${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-zinc-900 text-white hover:bg-black'} px-5 py-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all`}>
                  <PlusCircle size={14} /> Novo Relatório
                </button>
              </div>

              <AnimatePresence>
                {isAddingReport && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`${theme === 'dark' ? 'bg-zinc-900 border-red-600/20' : 'bg-white border-gray-200 shadow-xl'} border p-6 rounded-sm overflow-hidden space-y-4`}>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Exercício (Ano)</label>
                        <input type="text" placeholder="Ex: 2024" value={newReport.year} onChange={e => setNewReport({...newReport, year: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-zinc-900'} border p-3 text-sm outline-none focus:border-red-600 transition-colors`} />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-500 uppercase">Título do Relatório</label>
                       <input type="text" placeholder="Ex: Balanço Financeiro Anual" value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-zinc-900'} border p-3 text-sm outline-none focus:border-red-600 transition-colors`} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-500 uppercase">Resumo / Conteúdo</label>
                       <textarea placeholder="Breve descrição dos dados apresentados..." value={newReport.content} onChange={e => setNewReport({...newReport, content: e.target.value})} rows={4} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-zinc-900'} border p-3 text-sm outline-none focus:border-red-600 transition-colors`} />
                    </div>
                    
                    <div className="space-y-4">
                      <div className={`flex justify-between items-center border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'} pb-2`}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600">Arquivos Anexos</h4>
                        <button 
                          onClick={() => setReportAttachments([...reportAttachments, { name: '', url: '', type: 'pdf' }])}
                          className={`text-[10px] uppercase font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-600'} hover:text-red-500 transition-colors`}
                        >
                          + Adicionar Arquivo
                        </button>
                      </div>

                      {/* Google Drive Instructions */}
                      <div className="bg-blue-600/5 border border-blue-500/20 p-4 rounded-sm flex gap-4 items-start">
                        <div className="bg-blue-500/20 p-2 rounded">
                          <Eye size={16} className="text-blue-400" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Como usar o Google Drive:</p>
                          <ol className="text-[9px] text-gray-400 space-y-1 list-decimal ml-3 font-medium uppercase tracking-tight">
                            <li>Suba o arquivo no seu <strong>Google Drive</strong>.</li>
                            <li>Clique com o botão direito no arquivo → <strong>Compartilhar</strong>.</li>
                            <li>Em Acesso Geral, mude para <strong>"Qualquer pessoa com o link"</strong>.</li>
                            <li>Clique em <strong>"Copiar Link"</strong> e cole no campo <strong>URL do Arquivo</strong> abaixo.</li>
                          </ol>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {reportAttachments.map((att, i) => (
                          <div key={i} className={`flex flex-col md:flex-row gap-3 ${theme === 'dark' ? 'bg-black/30 border-white/5' : 'bg-gray-50 border-gray-200'} p-4 rounded-sm border group relative`}>
                            <div className="flex-1 space-y-1">
                              <label className="text-[8px] font-black uppercase text-gray-600">Nome do Arquivo</label>
                              <input 
                                placeholder="Ex: Relatório Financeiro" 
                                value={att.name} 
                                onChange={e => {
                                  const next = [...reportAttachments];
                                  next[i].name = e.target.value;
                                  setReportAttachments(next);
                                }} 
                                className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-zinc-900'} border p-2 text-[11px] outline-none focus:border-red-600/30 transition-colors`} 
                              />
                            </div>

                            <div className="flex-[2] space-y-1">
                              <label className="text-[8px] font-black uppercase text-gray-600">URL do Arquivo (Google Drive / Link)</label>
                              <div className="relative">
                                <input 
                                  placeholder="https://drive.google.com/file/d/..." 
                                  value={att.url} 
                                  onChange={e => {
                                    const next = [...reportAttachments];
                                    next[i].url = e.target.value;
                                    setReportAttachments(next);
                                  }} 
                                  className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-zinc-900'} border p-2 text-[11px] outline-none focus:border-red-600/30 transition-colors pl-8`} 
                                />
                                <LinkIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
                              </div>
                            </div>

                            <div className="w-24 space-y-1">
                              <label className="text-[8px] font-black uppercase text-gray-600">Tipo</label>
                              <select 
                                value={att.type} 
                                onChange={e => {
                                  const next = [...reportAttachments];
                                  next[i].type = e.target.value;
                                  setReportAttachments(next);
                                }}
                                className={`w-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} border border-white/5 p-2 text-[11px] outline-none`}
                              >
                                <option value="pdf">PDF</option>
                                <option value="image">Imagem</option>
                              </select>
                            </div>

                            <button 
                              onClick={() => setReportAttachments(reportAttachments.filter((_, idx) => idx !== i))}
                              className="mt-4 md:mt-0 p-2 text-gray-600 hover:text-red-500 transition-colors self-end md:self-center"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <button onClick={() => setIsAddingReport(false)} className="px-6 py-3 text-[10px] font-black uppercase text-gray-500">Cancelar</button>
                      <button 
                        onClick={handleAddReport} 
                        disabled={isSaving || isUploading} 
                        className="bg-red-600 px-10 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-red-600/20 active:scale-95 transition-all"
                      >
                        {isSaving ? 'Enviando...' : isUploading ? 'Aguarde Upload...' : 'Publicar Relatório'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 gap-3">
                {reports.map(r => (
                  <div key={r.id} className={`${theme === 'dark' ? 'bg-zinc-900/50' : 'bg-gray-50'} p-6 flex justify-between items-center border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} hover:border-red-600/50 transition-all group shadow-sm`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} flex items-center justify-center text-gray-500 group-hover:text-red-600 transition-colors`}>
                        <FileText size={24} />
                      </div>
                      <div>
                        <div className="text-red-600 text-[10px] font-black italic tracking-[0.2em] mb-1 uppercase">Exercício {r.year}</div>
                        <h4 className={`text-lg font-black uppercase italic leading-none ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{r.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">Publicado em: {new Date(r.datePublished).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => handleDeleteReport(r.id)} className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'campaign' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Gerenciar Campanhas</h3>
                {!isAddingCampaign && (
                  <button 
                    onClick={() => setIsAddingCampaign(true)} 
                    className={`${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-zinc-900 text-white hover:bg-black'} px-5 py-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all`}
                  >
                    <PlusCircle size={14} /> Novo
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isAddingCampaign && !campaignType && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <button 
                      onClick={() => setCampaignType('popup')}
                      className={`${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-white border-gray-200'} border p-8 text-left hover:border-red-600/50 transition-all group relative overflow-hidden`}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <LayoutDashboard size={32} className="text-red-600 mb-4" />
                      <h4 className="text-lg font-black uppercase italic mb-2">Criar Popup</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                        Janela que aparece automaticamente ao abrir o site. Ideal para promoções relâmpago, avisos de jogos ou captação rápida de sócios.
                      </p>
                    </button>

                    <button 
                      onClick={() => setCampaignType('card')}
                      className={`${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-white border-gray-200'} border p-8 text-left hover:border-red-600/50 transition-all group relative overflow-hidden`}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <FileImage size={32} className="text-red-600 mb-4" />
                      <h4 className="text-lg font-black uppercase italic mb-2">Criar Card</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                        Banner informativo fixo na página inicial. Perfeito para campanhas de longo prazo, patrocínios ou links estratégicos do clube.
                      </p>
                    </button>

                    <div className="md:col-span-2 flex justify-center pt-4">
                      <button 
                        onClick={() => setIsAddingCampaign(false)}
                        className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors"
                      >
                        Cancelar e Voltar
                      </button>
                    </div>
                  </motion.div>
                )}

                {campaignType && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={`${theme === 'dark' ? 'bg-zinc-900 border-red-600/20' : 'bg-white border-gray-200 shadow-xl'} border p-8 rounded-sm space-y-6`}
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">Configuração</span>
                        <h4 className="text-xl font-black uppercase italic">{editingCampaignId ? 'Editar' : 'Nova'} Campanha: {campaignType === 'popup' ? 'Popup' : 'Card'}</h4>
                      </div>
                      <button onClick={() => { setCampaignType(null); setEditingCampaignId(null); setNewCampaign({ title: '', headline: '', subtitle: '', buttonText: '', image: '', destinationUrl: '', active: true, type: 'popup' }); }} className="text-gray-500 hover:text-white"><X size={20} /></button>
                    </div>

                    <div className="space-y-6">
                      {/* Image Upload Area */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Imagem da Campanha</label>
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                            Recomendado: {campaignType === 'popup' ? '1080x1080px (Quadrado)' : '1200x400px (Retangular 3:1)'}
                          </span>
                        </div>
                        {!newCampaign.image ? (
                          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 transition-all cursor-pointer ${isUploading ? 'border-red-600/50 bg-red-600/5' : theme === 'dark' ? 'border-white/10 hover:border-red-600/30 bg-black/40 hover:bg-black/60' : 'border-gray-200 hover:border-red-600/30 bg-gray-50 hover:bg-gray-100'}`}>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              disabled={isUploading}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await handleFileUpload(file);
                                  if (url) setNewCampaign({...newCampaign, image: url});
                                }
                                e.target.value = '';
                              }} 
                            />
                            {isUploading ? (
                              <div className="flex flex-col items-center">
                                <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mb-4"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Subindo ({uploadProgress}%)...</span>
                              </div>
                            ) : (
                              <>
                                <Upload size={32} className="text-gray-500 mb-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Clique para anexar o arquivo</span>
                              </>
                            )}
                          </label>
                        ) : (
                          <div className={`relative rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-white/10 bg-black' : 'border-gray-200 bg-gray-100'} group ${campaignType === 'card' ? 'aspect-[21/9]' : 'aspect-square max-w-xs mx-auto'}`}>
                            <img src={newCampaign.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button onClick={() => setNewCampaign({...newCampaign, image: ''})} className="bg-red-600 p-3 rounded-full text-white hover:bg-red-700 transition-colors">
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Destination Link */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Link de Destino (URL)</label>
                        <div className="flex gap-2">
                          <div className={`flex items-center justify-center ${theme === 'dark' ? 'bg-black border-white/5' : 'bg-gray-100 border-gray-200'} px-4 text-gray-500 rounded-l-sm border`}>
                            <LayoutDashboard size={14} />
                          </div>
                          <input 
                            type="text" 
                            placeholder="https://exemplo.com/pagina-ou-produto" 
                            value={newCampaign.destinationUrl} 
                            onChange={e => setNewCampaign({...newCampaign, destinationUrl: e.target.value})} 
                            className={`flex-1 ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} p-4 text-sm outline-none focus:border-red-600/50 transition-colors border`}
                          />
                        </div>
                        <p className="text-[9px] text-gray-600 uppercase font-bold italic">O usuário será redirecionado para este link ao clicar na imagem.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Nome da Campanha (Interno)</label>
                            <input 
                              type="text" 
                              placeholder="Ex: Campanha Sócio Outubro" 
                              value={newCampaign.title} 
                              onChange={e => setNewCampaign({...newCampaign, title: e.target.value})} 
                              className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`}
                            />
                          </div>
                          
                          {campaignType === 'card' && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Título (Headline Visível)</label>
                              <input 
                                type="text" 
                                placeholder="Ex: Sócio-Torcedor Racing FC" 
                                value={newCampaign.headline} 
                                onChange={e => setNewCampaign({...newCampaign, headline: e.target.value})} 
                                className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`}
                              />
                            </div>
                          )}
                        </div>

                        {campaignType === 'card' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Texto do Botão</label>
                              <input 
                                type="text" 
                                placeholder="Ex: Saiba Mais" 
                                value={newCampaign.buttonText} 
                                onChange={e => setNewCampaign({...newCampaign, buttonText: e.target.value})} 
                                className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Descrição Curta</label>
                              <input 
                                type="text"
                                placeholder="Ex: Benefícios exclusivos para sócios." 
                                value={newCampaign.subtitle} 
                                onChange={e => setNewCampaign({...newCampaign, subtitle: e.target.value})} 
                                className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                      <button onClick={() => { setCampaignType(null); setEditingCampaignId(null); setIsAddingCampaign(false); }} className="px-6 py-3 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">Cancelar</button>
                      <button 
                        onClick={handleAddCampaign}
                        disabled={isSaving || isUploading || !newCampaign.image} 
                        className="bg-red-600 px-10 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
                      >
                        {isSaving ? 'Salvando...' : isUploading ? 'Aguarde Upload...' : editingCampaignId ? 'Salvar Alterações' : 'Publicar Campanha'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {!isAddingCampaign && campaigns.length > 0 && (
                  <div className="grid grid-cols-1 gap-4">
                    {campaigns.map(c => (
                      <div key={c.id} className={`${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} p-4 flex items-center justify-between group hover:border-red-600/50 transition-all shadow-sm`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-10 ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'} rounded overflow-hidden border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} flex-shrink-0`}>
                            <img src={c.image} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${c.type === 'popup' ? 'bg-red-600/20 text-red-500' : 'bg-blue-600/20 text-blue-500'}`}>
                                  {c.type}
                               </span>
                               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${c.active ? 'bg-green-600/20 text-green-500' : 'bg-gray-600/20 text-gray-500'}`}>
                                  {c.active ? 'Ativo' : 'Inativo'}
                               </span>
                               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-zinc-800 text-gray-400' : 'bg-gray-100 text-gray-600'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} flex items-center gap-1`}>
                                  <MousePointerClick size={10} /> {c.clicks || 0}
                               </span>
                               <span className={`text-[9px] font-bold ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} uppercase`}>
                                  {c.createdAt ? (typeof c.createdAt === 'number' ? new Date(c.createdAt) : c.createdAt.toDate?.() || new Date()).toLocaleDateString('pt-BR') : 'Sem data'}
                               </span>
                            </div>
                            <h4 className={`text-xs font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} leading-none`}>{c.title || 'Sem título'}</h4>
                            <p className="text-[8px] text-gray-500 truncate max-w-[200px] mt-1">{c.destinationUrl}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                            onClick={() => toggleCampaignActive(c)} 
                            className={`p-2 transition-colors ${c.active ? 'text-green-500 hover:text-green-400' : 'text-gray-500 hover:text-white'}`}
                            title={c.active ? 'Desativar' : 'Ativar'}
                           >
                              {c.active ? <Eye size={16} /> : <EyeOff size={16} />}
                           </button>
                           <button 
                            onClick={() => handleEditCampaign(c)} 
                            className="p-2 text-gray-500 hover:text-white transition-colors"
                            title="Editar"
                           >
                              <Edit3 size={16} />
                           </button>
                           <button 
                            onClick={() => {
                              setConfirmModal({
                                message: 'Tem certeza que deseja excluir esta campanha?',
                                onConfirm: () => handleDeleteCampaign(c.id)
                              });
                            }} 
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            title="Excluir"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isAddingCampaign && campaigns.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${theme === 'dark' ? 'bg-zinc-900/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'} p-12 text-center rounded-sm border`}>
                    <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-black border-white/5' : 'bg-gray-50 border-gray-200'} rounded-full flex items-center justify-center mx-auto mb-6 border`}>
                      <FileImage size={24} className="text-gray-600" />
                    </div>
                    <h4 className="text-sm text-gray-400 font-black uppercase tracking-widest mb-2">Nenhuma campanha ativa</h4>
                    <p className="text-[10px] text-gray-500 max-w-xs mx-auto leading-relaxed">
                      Crie um Popup ou um Card estratégico para destacar novidades do Racing FC na página inicial.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'squad' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Gerenciar Elenco</h3>
                <div className="flex items-center gap-3">
                  {!isAddingAthlete && (
                    <button 
                      onClick={() => setIsAddingAthlete(true)} 
                      className={`${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-zinc-900 text-white hover:bg-black'} px-5 py-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all`}
                    >
                      <PlusCircle size={14} /> Novo Atleta
                    </button>
                  )}
                  <button
                    onClick={() => setIsManagingCategories(v => !v)}
                    className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                      isManagingCategories
                        ? 'bg-red-600 border-red-600 text-white'
                        : `${theme === 'dark' ? 'border-white/10 text-gray-500 hover:border-white/30 hover:text-white' : 'border-gray-300 text-gray-500 hover:bg-gray-100'}`
                    }`}
                  >
                    <Edit3 size={14} /> Gerenciar Categorias
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isAddingAthlete && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className={`${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-gray-50 border-gray-200'} border p-8 overflow-hidden rounded-sm space-y-6`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500">Nome Completo</label>
                        <input type="text" value={newAthlete.name} onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500">Apelido (Nome de Jogo)</label>
                        <input type="text" value={newAthlete.nickname} onChange={e => setNewAthlete({...newAthlete, nickname: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500">Número da Camisa</label>
                        <input type="number" value={newAthlete.number} onChange={e => setNewAthlete({...newAthlete, number: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500">Data de Nascimento</label>
                        <input type="date" value={newAthlete.birthDate} onChange={e => setNewAthlete({...newAthlete, birthDate: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500">Posição</label>
                        <input type="text" placeholder="Ex: Goleiro, Atacante..." value={newAthlete.position} onChange={e => setNewAthlete({...newAthlete, position: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500">Categoria</label>
                        <select value={newAthlete.category} onChange={e => setNewAthlete({...newAthlete, category: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`}>
                          {squadCategories.map(cat => (
                            <option key={cat} value={cat} className={theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500">Foto do Atleta</label>
                      <div className="flex items-center gap-4">
                        {newAthlete.photoUrl && (
                          <div className={`w-16 h-20 ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} overflow-hidden`}>
                            <img src={newAthlete.photoUrl} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <label className={`flex-1 border-2 border-dashed ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} hover:border-red-600/50 transition-all p-8 text-center cursor-pointer group`}>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleFileUpload(file);
                                if (url) setNewAthlete({...newAthlete, photoUrl: url});
                              }
                              e.target.value = '';
                            }}
                          />
                          <div className="flex flex-col items-center gap-2">
                            <FileImage size={24} className="text-gray-600 group-hover:text-red-600 transition-colors" />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-black'} transition-colors`}>
                              {isUploading ? `Enviando ${uploadProgress}%...` : 'Clique para anexar foto (3/4)'}
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className={`flex gap-3 justify-end pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}>
                      <button onClick={() => setIsAddingAthlete(false)} className="px-6 py-3 text-[10px] font-black uppercase text-gray-500 hover:text-red-600 transition-colors">Cancelar</button>
                      <button onClick={handleAddAthlete} disabled={isSaving || isUploading} className="bg-red-600 text-white px-10 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-red-600/20">
                        {isSaving ? 'Salvando...' : isUploading ? 'Aguarde Upload...' : 'Cadastrar Atleta'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Barra de categorias + botão gerenciar */}
              <div className={`flex flex-wrap gap-2 border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} pb-4 items-center`}>
                {squadCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedSquadCategory(cat); setIsManagingCategories(false); }}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${
                      selectedSquadCategory === cat && !isManagingCategories
                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                        : `${theme === 'dark' ? 'bg-black border-white/10 text-gray-500 hover:border-white/30' : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'}`
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Painel de gerenciamento de categorias */}
              <AnimatePresence>
                {isManagingCategories && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-gray-50 border-gray-200'} border p-6 rounded-sm space-y-4 overflow-hidden`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Gerenciar Categorias do Elenco</p>

                    {/* Adicionar nova categoria */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nome da nova categoria..."
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        className={`flex-1 ${theme === 'dark' ? 'bg-black border-white/10 text-white' : 'bg-white border-gray-200 text-black'} border p-3 text-sm outline-none focus:border-red-600/50 transition-colors`}
                      />
                      <button
                        onClick={() => {
                          const nome = newCategoryName.trim();
                          if (!nome || squadCategories.includes(nome)) return;
                          setSquadCategories(prev => [...prev, nome]);
                          setNewCategoryName('');
                          showNotification(`Categoria "${nome}" criada!`);
                        }}
                        className="bg-red-600 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2"
                      >
                        <PlusCircle size={14} /> Adicionar
                      </button>
                    </div>

                    {/* Lista de categorias */}
                    <div className="space-y-2">
                      {squadCategories.map(cat => (
                        <div key={cat} className={`flex items-center gap-3 p-3 ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-white border-gray-200'} border`}>
                          {editingCategory?.old === cat ? (
                            <>
                              <input
                                type="text"
                                value={editingCategory.new}
                                onChange={e => setEditingCategory({ old: cat, new: e.target.value })}
                                className={`flex-1 ${theme === 'dark' ? 'bg-zinc-800 border-white/10 text-white' : 'bg-gray-100 border-gray-300 text-black'} border p-2 text-sm outline-none focus:border-red-600/50`}
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  const novoNome = editingCategory.new.trim();
                                  if (!novoNome || (squadCategories.includes(novoNome) && novoNome !== cat)) return;
                                  setSquadCategories(prev => prev.map(c => c === cat ? novoNome : c));
                                  if (selectedSquadCategory === cat) setSelectedSquadCategory(novoNome);
                                  setEditingCategory(null);
                                  showNotification('Categoria renomeada!');
                                }}
                                className="text-green-500 hover:text-green-400 p-1 transition-colors"
                              ><Save size={14} /></button>
                              <button onClick={() => setEditingCategory(null)} className="text-gray-500 hover:text-red-500 p-1 transition-colors"><X size={14} /></button>
                            </>
                          ) : (
                            <>
                              <span className={`flex-1 text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{cat}</span>
                              <button
                                onClick={() => setEditingCategory({ old: cat, new: cat })}
                                className="text-gray-500 hover:text-white p-1 transition-colors"
                              ><Edit3 size={14} /></button>
                              <button
                                onClick={() => {
                                  const count = athletes.filter(a => a.category === cat).length;
                                  if (count > 0) {
                                    showNotification(`Mova os ${count} atleta(s) desta categoria antes de excluí-la.`, 'error');
                                    return;
                                  }
                                  setSquadCategories(prev => prev.filter(c => c !== cat));
                                  if (selectedSquadCategory === cat) setSelectedSquadCategory(squadCategories[0] || '');
                                  showNotification(`Categoria "${cat}" excluída.`, 'info');
                                }}
                                className="text-gray-500 hover:text-red-500 p-1 transition-colors"
                              ><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {athletes.filter(a => a.category === selectedSquadCategory).map(a => (
                  <div key={a.id} className={`${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} p-4 flex items-center gap-4 group hover:border-red-600/50 transition-all shadow-sm`}>
                    <div className={`w-12 h-16 ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} overflow-hidden flex-shrink-0`}>
                      {a.photoUrl ? (
                        <img src={a.photoUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={24} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600/20 text-red-500">{a.category}</span>
                        {a.number && <span className="text-[8px] font-black uppercase text-gray-500">#{a.number}</span>}
                      </div>
                      <h4 className={`text-sm font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} leading-none truncate`}>{a.nickname || a.name}</h4>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">{a.position} • {a.age} Anos</p>
                    </div>
                    <button 
                      onClick={() => {
                        setConfirmModal({
                          message: `Deseja excluir o atleta ${a.nickname || a.name}?`,
                          onConfirm: () => handleDeleteAthlete(a.id)
                        });
                      }}
                      className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'board' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Gestão da Diretoria</h3>
                <button 
                  onClick={() => setIsAddingBoardMember(!isAddingBoardMember)}
                  className={`${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-zinc-900 text-white hover:bg-black'} px-6 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all`}
                >
                  {isAddingBoardMember ? <X size={14} /> : <PlusCircle size={14} />}
                  {isAddingBoardMember ? 'Fechar' : 'Novo Membro'}
                </button>
              </div>

              <AnimatePresence>
                {isAddingBoardMember && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-gray-50 border-gray-200'} border p-6 space-y-6 overflow-hidden rounded-sm`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500">Nome Completo</label>
                        <input type="text" placeholder="Nome do membro..." value={newBoardMember.name} onChange={e => setNewBoardMember({...newBoardMember, name: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500">Cargo</label>
                        <input type="text" placeholder="Ex: Presidente, Diretor..." value={newBoardMember.role} onChange={e => setNewBoardMember({...newBoardMember, role: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500">Categoria</label>
                        <select value={newBoardMember.category} onChange={e => setNewBoardMember({...newBoardMember, category: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-white border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600/50 transition-colors`}>
                          {['Diretoria executiva', 'Conselho deliberativo', 'Conselho Fiscal'].map(cat => (
                            <option key={cat} value={cat} className={theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500">Foto</label>
                      <div className="flex items-center gap-4">
                        {newBoardMember.photoUrl && (
                          <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} rounded-full overflow-hidden`}>
                            <img src={newBoardMember.photoUrl} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <label className={`flex-1 border-2 border-dashed ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} hover:border-red-600/50 transition-all p-8 text-center cursor-pointer group`}>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleFileUpload(file);
                                if (url) setNewBoardMember({...newBoardMember, photoUrl: url});
                              }
                              e.target.value = '';
                            }}
                          />
                          <div className="flex flex-col items-center gap-2">
                            <FileImage size={24} className="text-gray-600 group-hover:text-red-600 transition-colors" />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-black'} transition-colors`}>
                              {isUploading ? `Enviando ${uploadProgress}%...` : 'Clique para anexar foto (Quadrada)'}
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className={`flex gap-3 justify-end pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}>
                      <button onClick={() => setIsAddingBoardMember(false)} className="px-6 py-3 text-[10px] font-black uppercase text-gray-500 hover:text-red-600 transition-colors">Cancelar</button>
                      <button onClick={handleAddBoardMember} disabled={isSaving || isUploading} className="bg-red-600 text-white px-10 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-red-600/20">
                        {isSaving ? 'Salvando...' : 'Cadastrar Membro'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`flex flex-wrap gap-2 border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} pb-4`}>
                {['Diretoria executiva', 'Conselho deliberativo', 'Conselho Fiscal'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedBoardCategory(cat)}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${
                      selectedBoardCategory === cat 
                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                        : `${theme === 'dark' ? 'bg-black border-white/10 text-gray-500 hover:border-white/30' : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'}`
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {boardMembers.filter(m => m.category === selectedBoardCategory).map(m => (
                  <div key={m.id} className={`${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} p-4 flex items-center gap-4 group hover:border-red-600/50 transition-all`}>
                    <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} rounded-full overflow-hidden flex-shrink-0`}>
                      {m.photoUrl ? (
                        <img src={m.photoUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-black'} leading-none truncate`}>{m.name}</h4>
                      <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{m.role}</p>
                      <p className={`text-[8px] ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} font-bold uppercase`}>{m.category}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteBoardMember(m.id)}
                      className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'leads' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Central de Inscrições</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedLeadTab('registrations')}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${
                      selectedLeadTab === 'registrations' 
                        ? 'bg-red-600 border-red-600 text-white' 
                        : `${theme === 'dark' ? 'bg-black border-white/10 text-gray-500 hover:border-white/30' : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'}`
                    }`}
                  >
                    Matrículas ({registrations.length})
                  </button>
                  <button 
                    onClick={() => setSelectedLeadTab('socios')}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${
                      selectedLeadTab === 'socios' 
                        ? 'bg-red-600 border-red-600 text-white' 
                        : `${theme === 'dark' ? 'bg-black border-white/10 text-gray-500 hover:border-white/30' : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'}`
                    }`}
                  >
                    Sócios ({socioLeads.length})
                  </button>
                </div>
                <button 
                  onClick={() => {
                    const data = selectedLeadTab === 'registrations' ? registrations : socioLeads;
                    if (data.length === 0) {
                      showNotification('Nenhum dado para exportar', 'error');
                      return;
                    }
                    
                    const headers = selectedLeadTab === 'registrations' 
                      ? ['Data', 'Nome', 'Email', 'WhatsApp', 'Interesse', 'Gênero', 'Responsável', 'Tamanho Uniforme']
                      : ['Data', 'Nome', 'Email', 'WhatsApp', 'Plano', 'Endereço'];
                    
                    const csvContent = [
                      headers.join(';'),
                      ...data.map(item => {
                        const date = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('pt-BR') : new Date(item.createdAt).toLocaleDateString('pt-BR');
                        if (selectedLeadTab === 'registrations') {
                          return [
                            date,
                            `"${item.name}"`,
                            item.email,
                            item.whatsapp,
                            `"${item.interest}"`,
                            item.gender,
                            `"${item.guardian || ''}"`,
                            item.uniformSize
                          ].map(v => String(v).replace(/;/g, ',')).join(';');
                        } else {
                          return [
                            date,
                            `"${item.name}"`,
                            item.email,
                            item.whatsapp,
                            `"${item.plan}"`,
                            `"${item.address || ''}"`
                          ].map(v => String(v).replace(/;/g, ',')).join(';');
                        }
                      })
                    ].join('\n');

                    // Adiciona BOM para o Excel reconhecer caracteres especiais em UTF-8
                    const BOM = '\uFEFF';
                    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `export_${selectedLeadTab}_${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showNotification('Planilha exportada com sucesso!');
                  }}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-zinc-900 text-white hover:bg-black'}`}
                >
                  <Download size={14} /> Exportar Planilha
                </button>
              </div>

              <div className={`${theme === 'dark' ? 'bg-zinc-950' : 'bg-white'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-white/5 bg-zinc-900/50' : 'border-gray-200 bg-gray-50'}`}>
                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Data</th>
                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Nome</th>
                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Contato</th>
                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Detalhes</th>
                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'}`}>
                      {selectedLeadTab === 'registrations' ? (
                        registrations.length > 0 ? (
                          registrations.map((r) => (
                            <tr key={r.id} className={`${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors group`}>
                              <td className="p-4 text-[10px] font-bold text-gray-400">
                                {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('pt-BR') : new Date(r.createdAt).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="p-4">
                                <div className={`text-xs font-black uppercase ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{r.name}</div>
                                <div className="text-[9px] text-gray-500 uppercase font-bold">{r.interest} • {r.gender}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-[10px] font-black text-red-500">{r.whatsapp}</div>
                                <div className="text-[9px] text-gray-500">{r.email}</div>
                              </td>
                              <td className="p-4">
                                <div className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} uppercase font-bold`}>Responsável: {r.guardian || 'N/A'}</div>
                                <div className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} uppercase font-bold`}>Uniforme: {r.uniformSize}</div>
                              </td>
                               <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => setViewLead(r)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                    title="Visualizar Detalhes"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteLead(r.id, 'registrations')}
                                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Nenhuma matrícula encontrada</td>
                          </tr>
                        )
                      ) : (
                        socioLeads.length > 0 ? (
                          socioLeads.map((s) => (
                            <tr key={s.id} className={`${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors group`}>
                              <td className="p-4 text-[10px] font-bold text-gray-400">
                                {s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString('pt-BR') : new Date(s.createdAt).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="p-4">
                                <div className={`text-xs font-black uppercase ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{s.name}</div>
                                <div className="text-[9px] text-gray-500 uppercase font-bold">CPF: {s.cpf}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-[10px] font-black text-red-500">{s.address}</div>
                              </td>
                              <td className="p-4">
                                <div className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} uppercase font-bold`}>Camisa: {s.shirtSize}</div>
                                <div className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} uppercase font-bold`}>RG: {s.rg}</div>
                              </td>
                               <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => setViewLead(s)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                    title="Visualizar Detalhes"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteLead(s.id, 'socios')}
                                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Nenhuma inscrição de sócio encontrada</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && userRole === 'admin' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Gestão de Usuários</h3>
              </div>

              <div className={`${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} p-6 rounded-sm mb-6`}>
                <h4 className={`text-xs font-black uppercase italic mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                  <ShieldCheck size={14} className="text-red-600" />
                  Guia de Permissões
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 ${theme === 'dark' ? 'bg-black/40' : 'bg-white'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}>
                    <span className="text-[9px] font-black uppercase text-red-600 block mb-1">Admin</span>
                    <p className="text-[10px] text-gray-500 font-bold uppercase leading-tight">Acesso total ao sistema e gestão de colaboradores.</p>
                  </div>
                  <div className={`p-4 ${theme === 'dark' ? 'bg-black/40' : 'bg-white'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}>
                    <span className="text-[9px] font-black uppercase text-blue-600 block mb-1">Marketing</span>
                    <p className="text-[10px] text-gray-500 font-bold uppercase leading-tight">Gestão de notícias, campanhas popup e banners.</p>
                  </div>
                  <div className={`p-4 ${theme === 'dark' ? 'bg-black/40' : 'bg-white'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}>
                    <span className="text-[9px] font-black uppercase text-green-600 block mb-1">Secretário</span>
                    <p className="text-[10px] text-gray-500 font-bold uppercase leading-tight">Inscrições, sócios, transparência e elenco.</p>
                  </div>
                </div>
              </div>

              <div className={`${theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-gray-100'} p-6 rounded-sm space-y-4`}>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Adicionar Novo Colaborador</h4>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const email = (e.target as any).email.value.trim().toLowerCase();
                    const role = (e.target as any).role.value;
                    if (!email) return;
                    
                    try {
                      await setDoc(doc(db, 'user_permissions', email), {
                        email,
                        role,
                        createdAt: Date.now(),
                        addedBy: user?.email
                      });
                      setNotification({ message: 'Usuário autorizado com sucesso!', type: 'success' });
                      (e.target as any).reset();
                      fetchData();
                    } catch (err) {
                      setNotification({ message: 'Erro ao autorizar usuário', type: 'error' });
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <input name="email" type="email" placeholder="E-mail do usuário" required className={`${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-black'} border p-4 text-sm outline-none focus:border-red-600 transition-colors`} />
                  <select name="role" className={`${theme === 'dark' ? 'bg-black border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-black'} border p-4 text-sm uppercase font-bold outline-none focus:border-red-600 transition-colors`}>
                    <option value="marketing">Marketing</option>
                    <option value="secretario">Secretário</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <button type="submit" className="bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-colors">
                    Autorizar Acesso
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-2">Usuários com Acesso</p>
                {authorizedUsers.map((u: any) => (
                  <div key={u.id} className={`${theme === 'dark' ? 'bg-black/40 hover:bg-black/60' : 'bg-white border border-gray-100 hover:bg-gray-50'} p-4 flex items-center justify-between transition-all group`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${u.role === 'admin' ? 'bg-red-600 text-white' : u.role === 'marketing' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                        {u.role ? u.role[0].toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{u.email}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{u.role}</p>
                      </div>
                    </div>
                    {u.email !== user?.email && (
                      <button 
                        onClick={() => setConfirmModal({
                          message: `Remover acesso de ${u.email}?`,
                          onConfirm: async () => {
                            try {
                              await deleteDoc(doc(db, 'user_permissions', u.id));
                              setAuthorizedUsers(authorizedUsers.filter(au => au.id !== u.id));
                              showNotification('Acesso removido com sucesso.', 'info');
                            } catch (e) {
                              showNotification('Erro ao remover acesso.', 'error');
                            }
                            setConfirmModal(null);
                          }
                        })}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* View Lead Modal */}
      <AnimatePresence>
        {viewLead && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'} border w-full max-w-2xl shadow-2xl overflow-hidden`}
            >
              <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
                <div>
                  <h4 className={`text-xl font-black uppercase italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} leading-tight`}>
                    Detalhes da {selectedLeadTab === 'registrations' ? 'Matrícula' : 'Inscrição de Sócio'}
                  </h4>
                  <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-1">
                    ID: {viewLead.id}
                  </p>
                </div>
                <button onClick={() => setViewLead(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nome Completo</p>
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} uppercase italic`}>{viewLead.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Data de Nascimento</p>
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{viewLead.birthDate}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Gênero</p>
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} uppercase`}>{viewLead.gender}</p>
                  </div>

                  {selectedLeadTab === 'registrations' ? (
                    <>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tamanho do Uniforme</p>
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{viewLead.uniformSize}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Interesse</p>
                        <p className="text-sm font-bold text-red-600 uppercase italic">{viewLead.interest}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">CPF</p>
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{viewLead.cpf}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">RG</p>
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{viewLead.rg}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Contact & Address */}
                <div className="space-y-6">
                  {selectedLeadTab === 'registrations' ? (
                    <>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Responsável / Guardião</p>
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} uppercase italic`}>{viewLead.guardian || 'NÃO INFORMADO'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">WhatsApp / Telefone</p>
                        <p className="text-sm font-bold text-red-500">{viewLead.whatsapp}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">E-mail</p>
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{viewLead.email}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Endereço Completo</p>
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} uppercase leading-relaxed`}>{viewLead.address}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tamanho da Camisa</p>
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{viewLead.shirtSize}</p>
                      </div>
                    </>
                  )}

                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Data de Inscrição</p>
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {viewLead.createdAt?.toDate ? viewLead.createdAt.toDate().toLocaleString('pt-BR') : new Date(viewLead.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-6 border-t ${theme === 'dark' ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'} flex justify-end`}>
                <button 
                  onClick={() => setViewLead(null)}
                  className={`${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-zinc-900 text-white hover:bg-black'} px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all`}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom UI Feedback System */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 border shadow-2xl backdrop-blur-md ${
              notification.type === 'error' 
                ? 'bg-red-950/90 border-red-500 text-white' 
                : notification.type === 'info'
                ? 'bg-zinc-900/90 border-zinc-500 text-white'
                : 'bg-zinc-900/90 border-green-500 text-white'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              notification.type === 'error' ? 'bg-red-500 animate-pulse' : 'bg-green-500'
            }`} />
            <p className="text-xs font-black uppercase tracking-widest">{notification.message}</p>
          </motion.div>
        )}

        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`${theme === 'dark' ? 'bg-zinc-950 border-white/10' : 'bg-white border-gray-200'} p-8 max-w-sm w-full shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
              <h4 className="text-sm font-black uppercase italic tracking-widest mb-6 leading-relaxed">{confirmModal.message}</h4>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-3 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmModal.onConfirm}
                  className="flex-1 bg-red-600 py-3 text-[10px] font-black uppercase text-white hover:bg-red-700 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
