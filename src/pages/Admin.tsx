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
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-lg text-zinc-800 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200';

type ToastType = 'success' | 'error';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3001';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === '1');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>('menu');
  const [activeRestaurant, setActiveRestaurant] = useState<RestaurantKey>('san-marcos');
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReservationsLoading, setIsReservationsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadMenu();
    }
  }, [isAuthenticated, activeRestaurant]);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu?restaurant=${activeRestaurant}`);
      if (!res.ok) {
        throw new Error('No se pudo cargar el menu');
      }
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
      if (!res.ok) {
        throw new Error('No se pudo cargar reservas');
      }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error('No se pudo actualizar estado');
      }

      showToast('Estado actualizado correctamente.');
      await loadReservations();
    } catch (error) {
      console.error(error);
      showToast('Error al actualizar estado', 'error');
    }
  };

  const statusBadgeClass: Record<ReservationStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border border-red-200',
    cancelled: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
  };

  useEffect(() => {
    if (isAuthenticated && activeSection === 'reservas') {
      loadReservations();
    }
  }, [isAuthenticated, activeSection]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2200);
  };

  const getSavedPassword = () => {
    return localStorage.getItem(ADMIN_PASSWORD_KEY) ?? DEFAULT_ADMIN_PASSWORD;
  };

  const normalizePrice = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '$0';
    return trimmed.startsWith('$') ? trimmed : `$${trimmed}`;
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === getSavedPassword()) {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
      setStatusMessage('');
      setActiveSection('menu');
    } else {
      setStatusMessage('Contrasena incorrecta. Intenta nuevamente.');
    }
  };

  const handleMenuChange = (categoryIndex: number, itemIndex: number, field: keyof MenuItem, value: string) => {
    const newMenu = [...menu];
    const safeItem = { ...newMenu[categoryIndex].items[itemIndex] };
    if (field === 'price') {
      safeItem.price = normalizePrice(value);
    } else {
      (safeItem as Record<string, unknown>)[field] = value;
    }
    newMenu[categoryIndex].items[itemIndex] = safeItem;
    setMenu(newMenu);
  };

  const handleAddItem = (categoryIndex: number) => {
    const newMenu = [...menu];
    newMenu[categoryIndex].items.push({ name: '', desc: '', price: '$' });
    setMenu(newMenu);
    showToast('Plato agregado. Guarda cambios para publicar.');
  };

  const handleImageUpload = async (categoryIndex: number, itemIndex: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Error al subir imagen');
      const { url } = await res.json();
      const newMenu = [...menu];
      newMenu[categoryIndex].items[itemIndex] = {
        ...newMenu[categoryIndex].items[itemIndex],
        image: url,
      };
      setMenu(newMenu);
      showToast('Imagen subida. Guarda cambios para publicar.');
    } catch {
      showToast('Error al subir la imagen', 'error');
    }
  };

  const handleCategoryTitleChange = (categoryIndex: number, value: string) => {
    const newMenu = [...menu];
    newMenu[categoryIndex] = {
      ...newMenu[categoryIndex],
      title: value,
    };
    setMenu(newMenu);
  };

  const handleAddCategory = () => {
    const cleanTitle = newCategoryTitle.trim();

    if (!cleanTitle) {
      showToast('Escribe un titulo para crear el menu.', 'error');
      return;
    }

    const exists = menu.some((category) => category.title.toLowerCase() === cleanTitle.toLowerCase());
    if (exists) {
      showToast('Ya existe un menu con ese titulo.', 'error');
      return;
    }

    setMenu((prev) => [...prev, { title: cleanTitle, items: [] }]);
    setNewCategoryTitle('');
    showToast(`Menu "${cleanTitle}" creado.`);
  };

  const handleRemoveCategory = (categoryIndex: number) => {
    const newMenu = [...menu];
    const removedTitle = newMenu[categoryIndex]?.title ?? 'Menu';
    newMenu.splice(categoryIndex, 1);
    setMenu(newMenu);
    showToast(`Se elimino "${removedTitle}".`);
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

    setMenu((prev) =>
      prev.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
          ...item,
          price: normalizePrice(item.price),
        })),
      }))
    );

    try {
      const res = await fetch(`${API_BASE_URL}/api/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ restaurant: activeRestaurant, categories: normalizedMenu }),
      });

      if (!res.ok) {
        throw new Error('No se pudo guardar el menu');
      }

      setActiveSection('menu');
      showToast('Menu guardado correctamente en la base de datos.');
      await loadMenu();
    } catch (error) {
      console.error(error);
      showToast('Error al guardar el menu. Revisa que el servidor este corriendo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setPassword('');
    setActiveSection('menu');
    setStatusMessage('Sesion cerrada.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentPasswordInput !== getSavedPassword()) {
      setStatusMessage('La contrasena actual no coincide.');
      return;
    }

    if (newPasswordInput.length < 4) {
      setStatusMessage('La nueva contrasena debe tener al menos 4 caracteres.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setStatusMessage('La confirmacion no coincide con la nueva contrasena.');
      return;
    }

    localStorage.setItem(ADMIN_PASSWORD_KEY, newPasswordInput);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setStatusMessage('Contrasena actualizada correctamente.');
  };

  const renderMenuSection = () => (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Editar Menu</h1>
        {loading && <p className="text-lg text-zinc-500">Guardando...</p>}
      </div>

      {/* Selector de restaurante */}
      <div className="mb-6 flex gap-3">
        {([['san-marcos', 'San Marcos'], ['la-ronda', 'La Ronda']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveRestaurant(key)}
            className={`rounded-lg px-5 py-2.5 text-lg font-semibold transition ${
              activeRestaurant === key
                ? 'bg-zinc-900 text-white'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900">Crear nuevo menu</h2>
        <p className="mb-4 text-lg text-zinc-600">
          Ejemplo: Menu de Hoy!, Menu Ejecutivo, Especiales del Chef.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            className={inputClass}
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)}
            placeholder="Titulo del nuevo menu"
          />
          <button
            onClick={handleAddCategory}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-lg font-semibold text-white transition hover:bg-zinc-800"
          >
            Crear Menu
          </button>
        </div>
      </div>

      {menu.map((category, categoryIndex) => (
        <div key={category.title} className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 grid grid-cols-1 gap-3 border-b border-zinc-200 pb-3 md:grid-cols-[1fr_auto]">
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-lg font-semibold text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              value={category.title}
              onChange={(e) => handleCategoryTitleChange(categoryIndex, e.target.value)}
              placeholder="Titulo del menu"
            />
            <button
              onClick={() => handleRemoveCategory(categoryIndex)}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-lg font-medium text-red-700 transition hover:bg-red-100"
            >
              Eliminar Menu
            </button>
          </div>
          {category.items.map((item, itemIndex) => (
            <div key={itemIndex} className="mb-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
              <div className="flex gap-4">
                {/* Image preview / upload */}
                <label className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-white transition hover:border-zinc-400">
                  {item.image ? (
                    <img src={`${API_BASE_URL}${item.image}`} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl text-zinc-300 group-hover:text-zinc-400">+</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(categoryIndex, itemIndex, file);
                    }}
                  />
                </label>

                {/* Fields */}
                <div className="grid flex-1 grid-cols-1 gap-2 lg:grid-cols-[1fr_2fr_100px_100px]">
                  <input
                    type="text"
                    className={inputClass}
                    value={item.name}
                    onChange={(e) => handleMenuChange(categoryIndex, itemIndex, 'name', e.target.value)}
                    placeholder="Nombre del plato"
                  />
                  <input
                    type="text"
                    className={inputClass}
                    value={item.desc}
                    onChange={(e) => handleMenuChange(categoryIndex, itemIndex, 'desc', e.target.value)}
                    placeholder="Descripcion"
                  />
                  <input
                    type="text"
                    className={inputClass}
                    value={item.price}
                    onChange={(e) => handleMenuChange(categoryIndex, itemIndex, 'price', e.target.value)}
                    placeholder="Precio"
                  />
                  <input
                    type="text"
                    className={inputClass}
                    value={item.badge || ''}
                    onChange={(e) => handleMenuChange(categoryIndex, itemIndex, 'badge', e.target.value)}
                    placeholder="Badge"
                  />
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemoveItem(categoryIndex, itemIndex)}
                  className="self-start rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-lg font-medium text-red-700 transition hover:bg-red-100"
                  title="Eliminar plato"
                >
                  &times;
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
                  className="mt-2 ml-24 text-sm text-red-500 hover:text-red-700 transition"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => handleAddItem(categoryIndex)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-lg font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Anadir Plato
          </button>
        </div>
      ))}
      <button
        onClick={handleSaveMenu}
        disabled={loading}
        className="rounded-lg bg-zinc-900 px-5 py-2.5 text-lg font-semibold text-white transition hover:bg-zinc-800"
      >
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </>
  );

  const renderReservasSection = () => (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Reservas</h1>
        <button
          type="button"
          onClick={loadReservations}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-lg font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          Recargar
        </button>
      </div>

      {isReservationsLoading ? (
        <p className="text-zinc-600">Cargando reservas...</p>
      ) : reservations.length === 0 ? (
        <p className="text-zinc-600">No hay reservas registradas todavia.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-lg">
            <thead>
              <tr className="text-left text-zinc-600">
                <th className="px-3 py-2">Fecha registro</th>
                <th className="px-3 py-2">Local</th>
                <th className="px-3 py-2">Reserva</th>
                <th className="px-3 py-2">Personas</th>
                <th className="px-3 py-2">Contacto</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="rounded-xl bg-zinc-50">
                  <td className="px-3 py-3 text-zinc-700">
                    {new Date(reservation.createdAt).toLocaleString('es-EC')}
                  </td>
                  <td className="px-3 py-3 font-medium text-zinc-900">{reservation.locale}</td>
                  <td className="px-3 py-3 text-zinc-700">
                    {reservation.date} · {reservation.time}
                  </td>
                  <td className="px-3 py-3 text-zinc-700">{reservation.guests}</td>
                  <td className="px-3 py-3 text-zinc-700">
                    <p>{reservation.contactName}</p>
                    <p className="text-zinc-500">{reservation.contactPhone}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-base font-semibold capitalize ${statusBadgeClass[reservation.status]}`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-base font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => updateReservationStatus(reservation.id, 'rejected')}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-base font-semibold text-white transition hover:bg-red-700"
                      >
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
  );

  const renderSettingsSection = () => (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Settings</h1>
      <form className="mt-5 grid gap-4" onSubmit={handleChangePassword}>
        <label className="grid gap-2 text-lg font-medium text-zinc-700">
          Contrasena actual
          <input
            type="password"
            className={inputClass}
            value={currentPasswordInput}
            onChange={(e) => setCurrentPasswordInput(e.target.value)}
            placeholder="Contrasena actual"
          />
        </label>
        <label className="grid gap-2 text-lg font-medium text-zinc-700">
          Nueva contrasena
          <input
            type="password"
            className={inputClass}
            value={newPasswordInput}
            onChange={(e) => setNewPasswordInput(e.target.value)}
            placeholder="Nueva contrasena"
          />
        </label>
        <label className="grid gap-2 text-lg font-medium text-zinc-700">
          Confirmar nueva contrasena
          <input
            type="password"
            className={inputClass}
            value={confirmPasswordInput}
            onChange={(e) => setConfirmPasswordInput(e.target.value)}
            placeholder="Confirmar nueva contrasena"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-lg font-semibold text-white transition hover:bg-zinc-800"
        >
          Guardar nueva contrasena
        </button>
      </form>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 p-6 md:p-10">
        <form
          onSubmit={handlePasswordSubmit}
          className="mx-auto mt-10 max-w-md rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm"
        >
          <h1 className="text-xl font-semibold leading-tight tracking-tight text-zinc-900">
            Leña Quiteña - El Sabor de la Memoria
          </h1>
          <p className="mt-1 text-lg text-zinc-500">Panel de administracion</p>
          <input
            type="password"
            className={`${inputClass} mt-4`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Introduce la contrasena"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-lg font-semibold text-white transition hover:bg-zinc-800"
          >
            Entrar
          </button>
          {statusMessage && <p className="mt-3 text-lg font-medium text-zinc-700">{statusMessage}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-zinc-100 md:grid-cols-[auto_1fr]">
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`rounded-xl border px-4 py-3 text-lg font-medium shadow-lg ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <aside
        className={`sticky top-0 flex h-screen flex-col gap-2 border-r border-zinc-200 bg-white p-3 transition-all ${
          isSidebarCollapsed ? 'w-21' : 'w-57.5'
        }`}
      >
        <div className="mb-2 border-b border-zinc-200 px-1 pb-2">
          <h1 className={`font-semibold leading-tight text-zinc-900 ${isSidebarCollapsed ? 'text-base' : 'text-lg'}`}>
            {isSidebarCollapsed ? 'Leña Quiteña' : 'Leña Quiteña - El Sabor de la Memoria'}
          </h1>
          <p className={`mt-1 text-zinc-500 ${isSidebarCollapsed ? 'text-sm' : 'text-base'}`}>
            {isSidebarCollapsed ? 'Panel' : 'Panel de administracion'}
          </p>
        </div>

        <button
          type="button"
          className="ml-auto rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-base font-medium text-zinc-700 hover:bg-zinc-100"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
        >
          {isSidebarCollapsed ? '>>' : '<<'}
        </button>

        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-left text-lg font-medium transition ${
            activeSection === 'menu'
              ? 'bg-zinc-900 text-white'
              : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
          }`}
          onClick={() => setActiveSection('menu')}
        >
          {isSidebarCollapsed ? 'M' : 'Menu'}
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-left text-lg font-medium transition ${
            activeSection === 'reservas'
              ? 'bg-zinc-900 text-white'
              : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
          }`}
          onClick={() => setActiveSection('reservas')}
        >
          {isSidebarCollapsed ? 'R' : 'Reservas'}
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-left text-lg font-medium transition ${
            activeSection === 'settings'
              ? 'bg-zinc-900 text-white'
              : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
          }`}
          onClick={() => setActiveSection('settings')}
        >
          {isSidebarCollapsed ? 'S' : 'Settings'}
        </button>

        <button
          type="button"
          className="sticky bottom-3 mt-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-lg font-medium text-red-700 transition hover:bg-red-100"
          onClick={handleLogout}
        >
          {isSidebarCollapsed ? 'X' : 'Desloguearse'}
        </button>
      </aside>

      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          {statusMessage && (
            <p className="mb-4 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-lg font-medium text-zinc-700 shadow-sm">
              {statusMessage}
            </p>
          )}
        {activeSection === 'menu' && renderMenuSection()}
        {activeSection === 'reservas' && renderReservasSection()}
        {activeSection === 'settings' && renderSettingsSection()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
