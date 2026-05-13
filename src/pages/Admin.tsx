import { useState, useEffect, useRef } from 'react';

interface MenuItem {
  id?: number;
  name: string;
  desc: string;
  price: string;
  badge?: string;
  image?: string;
  order?: number;
}

interface MenuCategory {
  id?: number;
  title: string;
  items: MenuItem[];
  order?: number;
}

type ReservationStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

interface Reservation {
  id: number;
  locale: string;
  date: string;
  time: string;
  guests: string;
  contactName: string;
  contactPhone: string;
  status: ReservationStatus;
  source: string;
  notes?: string | null;
  createdAt: string;
}

type RestaurantKey = 'san-marcos' | 'la-ronda';
type AdminSection = 'menu' | 'reservas' | 'settings';

const ADMIN_PASSWORD_KEY = 'lq_admin_password';
const ADMIN_SESSION_KEY = 'lq_admin_session';
const DEFAULT_ADMIN_PASSWORD = 'admin';

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition duration-150 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400';

type ToastType = 'success' | 'error';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3001';

const statusLabel: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

const statusBadgeClass: Record<ReservationStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  cancelled: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>('menu');
  const [activeRestaurant, setActiveRestaurant] = useState<RestaurantKey>('san-marcos');
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());
  const [dragCatIdx, setDragCatIdx] = useState<number | null>(null);
  const [dragOverCatIdx, setDragOverCatIdx] = useState<number | null>(null);
  const [dragItemSrc, setDragItemSrc] = useState<{ catIndex: number; itemIndex: number } | null>(null);
  const [dragItemOverIdx, setDragItemOverIdx] = useState<number | null>(null);
  const [isReservationsLoading, setIsReservationsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const toastTimerRef = useRef<number | null>(null);
  const addItemBtnRefs = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    if (isAuthenticated) loadMenu();
  }, [isAuthenticated, activeRestaurant]);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu?restaurant=${activeRestaurant}`);
      if (!res.ok) throw new Error('No se pudo cargar el menu');
      const data = await res.json();
      setMenu(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Error al cargar el menu', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    setIsReservationsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations`);
      if (!res.ok) throw new Error('No se pudo cargar reservas');
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Error al cargar reservas', 'error');
      console.error(error);
    } finally {
      setIsReservationsLoading(false);
    }
  };

  const updateReservationStatus = async (id: number, status: ReservationStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar estado');
      showToast('Estado actualizado correctamente.');
      await loadReservations();
    } catch (error) {
      console.error(error);
      showToast('Error al actualizar estado', 'error');
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeSection === 'reservas') loadReservations();
  }, [isAuthenticated, activeSection]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2500);
  };

  const getSavedPassword = () => localStorage.getItem(ADMIN_PASSWORD_KEY) ?? DEFAULT_ADMIN_PASSWORD;

  const normalizePrice = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '$0';
    return trimmed.startsWith('$') ? trimmed : `$${trimmed}`;
  };

  const handlePasswordSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === getSavedPassword()) {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
      setStatusMessage('');
      setActiveSection('menu');
    } else {
      setStatusMessage('Contraseña incorrecta. Intenta nuevamente.');
    }
  };

  const handleMenuChange = (categoryIndex: number, itemIndex: number, field: keyof MenuItem, value: string) => {
    const newMenu = [...menu];
    const safeItem = { ...newMenu[categoryIndex].items[itemIndex] };
    if (field === 'price') safeItem.price = normalizePrice(value);
    else (safeItem as Record<string, unknown>)[field] = value;
    newMenu[categoryIndex].items[itemIndex] = safeItem;
    setMenu(newMenu);
  };

  const handleAddItem = (categoryIndex: number) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      next.delete(categoryIndex);
      return next;
    });
    const newMenu = [...menu];
    newMenu[categoryIndex].items.push({ name: '', desc: '', price: '$' });
    setMenu(newMenu);
    showToast('Plato agregado. Guarda cambios para publicar.');
    setTimeout(() => {
      addItemBtnRefs.current.get(categoryIndex)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleImageUpload = async (categoryIndex: number, itemIndex: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Error al subir imagen');
      const { url } = await res.json();
      const newMenu = [...menu];
      newMenu[categoryIndex].items[itemIndex] = { ...newMenu[categoryIndex].items[itemIndex], image: url };
      setMenu(newMenu);
      showToast('Imagen subida. Guarda cambios para publicar.');
    } catch {
      showToast('Error al subir la imagen', 'error');
    }
  };

  const handleCategoryTitleChange = (categoryIndex: number, value: string) => {
    const newMenu = [...menu];
    newMenu[categoryIndex] = { ...newMenu[categoryIndex], title: value };
    setMenu(newMenu);
  };

  const handleAddCategory = () => {
    const cleanTitle = newCategoryTitle.trim();
    if (!cleanTitle) { showToast('Escribe un título para crear la categoría.', 'error'); return; }
    const exists = menu.some(c => c.title.toLowerCase() === cleanTitle.toLowerCase());
    if (exists) { showToast('Ya existe una categoría con ese título.', 'error'); return; }
    setMenu(prev => [...prev, { title: cleanTitle, items: [] }]);
    setNewCategoryTitle('');
    showToast(`Categoría "${cleanTitle}" creada.`);
  };

  const handleCatDrop = (toIndex: number) => {
    if (dragCatIdx === null || dragCatIdx === toIndex) return;
    const newMenu = [...menu];
    const [removed] = newMenu.splice(dragCatIdx, 1);
    newMenu.splice(toIndex, 0, removed);
    setMenu(newMenu);
    setCollapsedCategories(new Set());
    setDragCatIdx(null);
    setDragOverCatIdx(null);
  };

  const handleItemDrop = (catIndex: number, toItemIndex: number) => {
    if (!dragItemSrc || dragItemSrc.catIndex !== catIndex || dragItemSrc.itemIndex === toItemIndex) return;
    const newMenu = [...menu];
    const items = [...newMenu[catIndex].items];
    const [removed] = items.splice(dragItemSrc.itemIndex, 1);
    items.splice(toItemIndex, 0, removed);
    newMenu[catIndex] = { ...newMenu[catIndex], items };
    setMenu(newMenu);
    setDragItemSrc(null);
    setDragItemOverIdx(null);
  };

  const toggleCategory = (index: number) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleRemoveCategory = (categoryIndex: number) => {
    const newMenu = [...menu];
    const removedTitle = newMenu[categoryIndex]?.title ?? 'Categoría';
    newMenu.splice(categoryIndex, 1);
    setMenu(newMenu);
    setCollapsedCategories(prev => {
      const next = new Set<number>();
      for (const idx of prev) {
        if (idx < categoryIndex) next.add(idx);
        else if (idx > categoryIndex) next.add(idx - 1);
      }
      return next;
    });
    showToast(`Se eliminó "${removedTitle}".`);
  };

  const handleRemoveItem = (categoryIndex: number, itemIndex: number) => {
    const newMenu = [...menu];
    newMenu[categoryIndex].items.splice(itemIndex, 1);
    setMenu(newMenu);
  };

  const handleSaveMenu = async () => {
    setLoading(true);
    const normalizedMenu = menu.map((category, catIndex) => ({
      title: category.title,
      order: catIndex,
      items: category.items.map((item, itemIndex) => ({
        name: item.name,
        desc: item.desc,
        price: normalizePrice(item.price),
        badge: item.badge || undefined,
        image: item.image || undefined,
        order: itemIndex,
      })),
    }));
    setMenu(prev =>
      prev.map(category => ({
        ...category,
        items: category.items.map(item => ({ ...item, price: normalizePrice(item.price) })),
      }))
    );
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant: activeRestaurant, categories: normalizedMenu }),
      });
      if (!res.ok) throw new Error('No se pudo guardar el menu');
      setActiveSection('menu');
      showToast('Menú guardado correctamente.');
      await loadMenu();
    } catch (error) {
      console.error(error);
      showToast('Error al guardar el menú. Revisa que el servidor esté corriendo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setPassword('');
    setActiveSection('menu');
    setStatusMessage('Sesión cerrada.');
  };

  const handleChangePassword = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentPasswordInput !== getSavedPassword()) { setStatusMessage('La contraseña actual no coincide.'); return; }
    if (newPasswordInput.length < 4) { setStatusMessage('La nueva contraseña debe tener al menos 4 caracteres.'); return; }
    if (newPasswordInput !== confirmPasswordInput) { setStatusMessage('La confirmación no coincide.'); return; }
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPasswordInput);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setStatusMessage('');
    showToast('Contraseña actualizada correctamente.');
  };

  // ─── RENDER: MENU ───────────────────────────────────────────────────────────
  const renderMenuSection = () => (
    <>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Carta del Menú</h1>
          <p className="text-xs text-slate-500 mt-0.5">Arrastra para reordenar · Los cambios se publican al guardar</p>
        </div>
        <button
          onClick={handleSaveMenu}
          disabled={loading}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Guardar cambios
            </>
          )}
        </button>
      </div>

      {/* Restaurant tabs */}
      <div className="mb-5 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 w-fit">
        {([['san-marcos', 'San Marcos'], ['la-ronda', 'La Ronda']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveRestaurant(key)}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-semibold transition ${
              activeRestaurant === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* New category */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Nueva categoría</p>
        <div className="flex gap-2">
          <input
            type="text"
            className={inputClass}
            value={newCategoryTitle}
            onChange={e => setNewCategoryTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            placeholder="Ej: Entradas, Platos fuertes, Postres…"
          />
          <button
            onClick={handleAddCategory}
            className="flex cursor-pointer shrink-0 items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Crear
          </button>
        </div>
      </div>

      {/* Category list */}
      {menu.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-14 text-center">
          <svg className="h-8 w-8 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <p className="text-sm font-medium text-slate-500">No hay categorías todavía</p>
          <p className="text-xs text-slate-400 mt-1">Crea la primera categoría arriba</p>
        </div>
      )}

      {menu.map((category, categoryIndex) => {
        const isCollapsed = collapsedCategories.has(categoryIndex);
        const isDragSrc = dragCatIdx === categoryIndex;
        const isDragTarget = dragOverCatIdx === categoryIndex && dragCatIdx !== categoryIndex;
        return (
          <div
            key={category.id ?? category.title}
            draggable
            onDragStart={e => { e.stopPropagation(); setDragCatIdx(categoryIndex); }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverCatIdx(categoryIndex); }}
            onDrop={e => { e.preventDefault(); e.stopPropagation(); handleCatDrop(categoryIndex); }}
            onDragEnd={() => { setDragCatIdx(null); setDragOverCatIdx(null); }}
            className={`mb-3 overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-150 ${
              isDragSrc ? 'opacity-40 border-slate-200' : isDragTarget ? 'border-slate-500 shadow-md' : 'border-slate-200'
            }`}
          >
            {/* Accordion header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <span className="shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="7" cy="4" r="1.5"/><circle cx="13" cy="4" r="1.5"/>
                  <circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/>
                  <circle cx="7" cy="16" r="1.5"/><circle cx="13" cy="16" r="1.5"/>
                </svg>
              </span>
              <button
                type="button"
                onClick={() => toggleCategory(categoryIndex)}
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                aria-label={isCollapsed ? 'Expandir' : 'Colapsar'}
              >
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <input
                draggable={false}
                type="text"
                className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-200 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100"
                value={category.title}
                onChange={e => handleCategoryTitleChange(categoryIndex, e.target.value)}
                placeholder="Título de la categoría"
              />
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                {category.items.length}
              </span>
              <button
                type="button"
                onClick={() => handleAddItem(categoryIndex)}
                className="flex cursor-pointer shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                title="Añadir plato"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Plato
              </button>
              <button
                onClick={() => handleRemoveCategory(categoryIndex)}
                className="flex cursor-pointer h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                title="Eliminar categoría"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>

            {/* Collapsible body */}
            {!isCollapsed && (
              <div className="p-4 space-y-2">
                {category.items.map((item, itemIndex) => {
                  const isItemDragSrc = dragItemSrc?.catIndex === categoryIndex && dragItemSrc?.itemIndex === itemIndex;
                  const isItemDropTarget = dragItemOverIdx === itemIndex && dragItemSrc?.catIndex === categoryIndex && dragItemSrc?.itemIndex !== itemIndex;
                  return (
                    <div
                      key={itemIndex}
                      draggable
                      onDragStart={e => { e.stopPropagation(); setDragItemSrc({ catIndex: categoryIndex, itemIndex }); }}
                      onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragItemOverIdx(itemIndex); }}
                      onDrop={e => { e.preventDefault(); e.stopPropagation(); handleItemDrop(categoryIndex, itemIndex); }}
                      onDragEnd={() => { setDragItemSrc(null); setDragItemOverIdx(null); }}
                      className={`rounded-lg border p-3 transition-all ${
                        isItemDragSrc ? 'opacity-40 border-slate-200 bg-slate-100'
                        : isItemDropTarget ? 'border-slate-400 bg-slate-50 shadow-sm'
                        : 'border-slate-100 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-2.5 shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 transition-colors">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <circle cx="7" cy="4" r="1.5"/><circle cx="13" cy="4" r="1.5"/>
                            <circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/>
                            <circle cx="7" cy="16" r="1.5"/><circle cx="13" cy="16" r="1.5"/>
                          </svg>
                        </span>
                        <label className="group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-400 hover:bg-slate-100">
                          {item.image ? (
                            <img src={`${API_BASE_URL}${item.image}`} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-slate-300 group-hover:text-slate-400">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                              </svg>
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(categoryIndex, itemIndex, file);
                            }}
                          />
                        </label>
                        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_90px_90px]">
                          <input type="text" className={inputClass} value={item.name}
                            onChange={e => handleMenuChange(categoryIndex, itemIndex, 'name', e.target.value)}
                            placeholder="Nombre del plato" />
                          <input type="text" className={inputClass} value={item.desc}
                            onChange={e => handleMenuChange(categoryIndex, itemIndex, 'desc', e.target.value)}
                            placeholder="Descripción" />
                          <input type="text" className={inputClass} value={item.price}
                            onChange={e => handleMenuChange(categoryIndex, itemIndex, 'price', e.target.value)}
                            placeholder="Precio" />
                          <input type="text" className={inputClass} value={item.badge || ''}
                            onChange={e => handleMenuChange(categoryIndex, itemIndex, 'badge', e.target.value)}
                            placeholder="Badge" />
                        </div>
                        <button
                          onClick={() => handleRemoveItem(categoryIndex, itemIndex)}
                          className="mt-0.5 flex cursor-pointer h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Eliminar plato"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {item.image && (
                        <button
                          type="button"
                          onClick={() => {
                            const newMenu = [...menu];
                            newMenu[categoryIndex].items[itemIndex] = { ...item, image: undefined };
                            setMenu(newMenu);
                          }}
                          className="mt-2 ml-19 cursor-pointer text-xs text-red-500 transition hover:text-red-700"
                        >
                          Quitar imagen
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  ref={el => { if (el) addItemBtnRefs.current.set(categoryIndex, el); }}
                  onClick={() => handleAddItem(categoryIndex)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-2.5 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Añadir plato
                </button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  // ─── RENDER: RESERVAS ────────────────────────────────────────────────────────
  const renderReservasSection = () => (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Reservas</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {reservations.length} reserva{reservations.length !== 1 ? 's' : ''} registrada{reservations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={loadReservations}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Actualizar
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isReservationsLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-500">
            <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando reservas…
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="h-8 w-8 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <p className="text-sm font-medium text-slate-500">Sin reservas registradas</p>
            <p className="text-xs text-slate-400 mt-1">Las reservas aparecerán aquí cuando lleguen</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Registro</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Local</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha · Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Personas</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contacto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map(reservation => (
                  <tr key={reservation.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(reservation.createdAt).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {reservation.locale}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <p className="font-medium">{reservation.date}</p>
                      <p className="text-xs text-slate-500">{reservation.time}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{reservation.guests}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <p className="font-medium">{reservation.contactName}</p>
                      <p className="text-xs text-slate-500">{reservation.contactPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass[reservation.status]}`}>
                        {statusLabel[reservation.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                          className="flex cursor-pointer items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          title="Confirmar"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => updateReservationStatus(reservation.id, 'rejected')}
                          className="flex cursor-pointer items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                          title="Rechazar"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // ─── RENDER: SETTINGS ────────────────────────────────────────────────────────
  const renderSettingsSection = () => (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Configuración</h1>
        <p className="text-xs text-slate-500 mt-0.5">Gestiona las credenciales de acceso al panel</p>
      </div>
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Cambiar contraseña</h2>
        <form className="space-y-4" onSubmit={handleChangePassword}>
          {([
            { label: 'Contraseña actual', value: currentPasswordInput, setter: setCurrentPasswordInput, show: showCurrentPw, toggle: () => setShowCurrentPw(p => !p) },
            { label: 'Nueva contraseña', value: newPasswordInput, setter: setNewPasswordInput, show: showNewPw, toggle: () => setShowNewPw(p => !p) },
            { label: 'Confirmar contraseña', value: confirmPasswordInput, setter: setConfirmPasswordInput, show: showConfirmPw, toggle: () => setShowConfirmPw(p => !p) },
          ] as const).map(({ label, value, setter, show, toggle }) => (
            <label key={label} className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
              <div className="relative mt-1">
                <input
                  type={show ? 'text' : 'password'}
                  className={`${inputClass} pr-10`}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {show ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
          ))}
          {statusMessage && (
            <p className={`flex items-center gap-2 text-xs font-medium ${statusMessage.includes('correctamente') ? 'text-emerald-600' : 'text-red-600'}`}>
              {statusMessage}
            </p>
          )}
          <button
            type="submit"
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
            </svg>
            Guardar contraseña
          </button>
        </form>
      </div>
    </div>
  );

  // ─── LOGIN ───────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        className="flex min-h-screen items-center justify-center bg-slate-50 p-6"
      >
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <img
              src="/src/assets/logo/leña_quiteña_logo.png"
              alt="Leña Quiteña"
              className="mx-auto mb-4 h-36 w-auto object-contain"
            />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Leña Quiteña</h1>
            <p className="mt-1 text-sm text-slate-500">Panel de administración</p>
          </div>
          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                </svg>
              </span>
              <input
                type={showLoginPw ? 'text' : 'password'}
                className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition duration-150 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Introduce la contraseña"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowLoginPw(p => !p)}
                className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showLoginPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showLoginPw ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            <button
              type="submit"
              className="mt-4 w-full cursor-pointer rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-[0.98]"
            >
              Ingresar al panel
            </button>
            {statusMessage && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                {statusMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  // ─── MAIN LAYOUT ─────────────────────────────────────────────────────────────
  const navItems: { key: AdminSection; label: string; icon: React.ReactNode }[] = [
    {
      key: 'menu',
      label: 'Menú',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      ),
    },
    {
      key: 'reservas',
      label: 'Reservas',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      ),
    },
    {
      key: 'settings',
      label: 'Configuración',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      className="grid min-h-screen grid-cols-1 bg-slate-50 md:grid-cols-[auto_1fr]"
    >
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
          isSidebarCollapsed ? 'w-15' : 'w-52'
        }`}
      >
        {/* Brand */}
        <div className={`flex items-center border-b border-slate-100 px-3 py-4 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          {!isSidebarCollapsed && (
            <>
              <img
                src="/src/assets/logo/leña_quiteña_logo.png"
                alt="Leña Quiteña"
                className="h-8 w-8 shrink-0 rounded-lg object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">Leña Quiteña</p>
                <p className="truncate text-xs text-slate-500">Administración</p>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            title={isSidebarCollapsed ? 'Expandir panel' : 'Colapsar panel'}
            className="flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            {isSidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <path d="M9 3v18"/>
                <path d="m14 9 3 3-3 3"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <path d="M15 3v18"/>
                <path d="m10 15-3-3 3-3"/>
              </svg>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-2 py-4">
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key)}
              title={isSidebarCollapsed ? label : undefined}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                isSidebarCollapsed ? 'justify-center' : ''
              } ${
                activeSection === key
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="shrink-0">{icon}</span>
              {!isSidebarCollapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="space-y-0.5 border-t border-slate-100 px-2 py-3">
          <button
            type="button"
            onClick={handleLogout}
            title={isSidebarCollapsed ? 'Cerrar sesión' : undefined}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <span className="shrink-0">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
              </svg>
            </span>
            {!isSidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="overflow-auto p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          {activeSection === 'menu' && renderMenuSection()}
          {activeSection === 'reservas' && renderReservasSection()}
          {activeSection === 'settings' && renderSettingsSection()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
