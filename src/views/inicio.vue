<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 1 = Desactivo, 2 = Lectura, 3 = Escritura
type PermissionCode = 1 | 2 | 3

interface UserProfile {
  email: string
  name?: string
  roleName: string
  permissions: {
    prestamo: PermissionCode
    compra: PermissionCode
    devolucion: PermissionCode
    audiolibros: PermissionCode
  }
}
const isUserMenuOpen = ref(false)

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function closeUserMenu() {
  isUserMenuOpen.value = false
}
const currentUser = ref<UserProfile | null>(null)

// El servidor no envía `name`: se usa el correo como respaldo
const displayName = computed(
  () => currentUser.value?.name || currentUser.value?.email || ''
)

onMounted(() => {
  const sessionData = localStorage.getItem('auth_user')
  if (sessionData) {
    currentUser.value = JSON.parse(sessionData)
  } else {
    router.push('/')
  }
})
const activeModuleKey = computed(() => {
  const pathParts = route.path.split('/').filter(Boolean)

  return pathParts[0] === 'admin'
    ? pathParts[1] || 'prestamo'
    : 'prestamo'
})

const currentModulePermission = computed<PermissionCode>(() => {
  if (!currentUser.value) return 1
  const key = activeModuleKey.value as keyof UserProfile['permissions']
  return currentUser.value.permissions[key] ?? 1
})

provide('currentPermission', currentModulePermission)

//  MENU LATERAL
const menuItems = computed(() => {
  const perms = currentUser.value?.permissions || {
    prestamo: 1,
    compra: 1,
    devolucion: 1,
    audiolibros: 1
  }

  return [
    { id: 1, name: 'Préstamo', route: '/admin/prestamo', level: perms.prestamo },
    { id: 2, name: 'Compra', route: '/admin/compra', level: perms.compra },
    { id: 3, name: 'Devolución', route: '/admin/devolucion', level: perms.devolucion },
    { id: 4, name: 'Audiolibros', route: '/admin/audiolibros', level: perms.audiolibros }
  ]
})

function handleLogout() {
  localStorage.removeItem('auth_user')
  router.push('/')
}
</script>

<template>
  <div class="admin-layout">

    <!-- PANEL IZQUIERDO -->
    <aside class="sidebar">
      <div class="brand">
        <h2>OPCIONES</h2>
      </div>

      <nav class="menu">
        <template v-for="item in menuItems" :key="item.id">
          <!-- PERMISO 1: Desactivo -->
          <router-link
            v-if="item.level !== 1"
            :to="item.route"
            class="menu-item"
            :class="{ 'is-readonly': item.level === 2 }"
          >
            <span class="item-name">{{ item.name }}</span>
            <span v-if="item.level === 2" class="badge badge-read" title="Acceso sin manipulación de datos">
            </span>
            <span v-else-if="item.level === 3" class="badge badge-write" title="Acceso total">
            </span>
          </router-link>
        </template>
      </nav>

      <button class="logout-btn" @click="handleLogout">
        Cerrar Sesión
      </button>
    </aside>

    <div class="main-wrapper">
     <header class="top-header">
  <div class="header-title"></div>
  <div v-if="currentUser" class="user-menu-wrapper">
    <button 
      type="button" 
      class="user-card-top" 
      @click="toggleUserMenu"
      :class="{ 'is-active': isUserMenuOpen }"
    >
      <div class="user-avatar">
        {{ displayName.charAt(0).toUpperCase() }}
      </div>
      <div class="user-details">
        <span class="user-name">{{ displayName }}</span>
        <span class="user-role">{{ currentUser.roleName }}</span>
      </div>
      <span class="dropdown-arrow">▾</span>
    </button>

    <!-- MENÚ / DETALLES DEL USUARIO -->
    <div v-if="isUserMenuOpen" class="user-dropdown-card">
      <div class="dropdown-header">
        <h4>Perfil de Usuario</h4>
        <button class="close-btn" @click="closeUserMenu">✕</button>
      </div>

      <div class="dropdown-body">
        <div class="info-row">
          <span class="info-label">Correo:</span>
          <span class="info-value">{{ currentUser.email }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">Rol:</span>
          <span class="info-value">{{ currentUser.roleName }}</span>
        </div>

        <hr class="divider" />

        <div class="permissions-section">
          <h5>Niveles de Permisos:</h5>
          <ul class="permissions-list">
            <li>
              <span>Préstamo:</span>
              <span class="perm-badge" :class="'perm-' + currentUser.permissions.prestamo">
                {{ currentUser.permissions.prestamo === 1 ? 'Desactivo' : currentUser.permissions.prestamo === 2 ? 'Lectura' : 'Escritura' }}
              </span>
            </li>
            <li>
              <span>Compra:</span>
              <span class="perm-badge" :class="'perm-' + currentUser.permissions.compra">
                {{ currentUser.permissions.compra === 1 ? 'Desactivo' : currentUser.permissions.compra === 2 ? 'Lectura' : 'Escritura' }}
              </span>
            </li>
            <li>
              <span>Devolución:</span>
              <span class="perm-badge" :class="'perm-' + currentUser.permissions.devolucion">
                {{ currentUser.permissions.devolucion === 1 ? 'Desactivo' : currentUser.permissions.devolucion === 2 ? 'Lectura' : 'Escritura' }}
              </span>
            </li>
            <li>
              <span>Audiolibros:</span>
              <span class="perm-badge" :class="'perm-' + currentUser.permissions.audiolibros">
                {{ currentUser.permissions.audiolibros === 1 ? 'Desactivo' : currentUser.permissions.audiolibros === 2 ? 'Lectura' : 'Escritura' }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</header>

      <main class="content">
        <router-view :permission="currentModulePermission" />
      </main>
    </div>
  </div>
</template>


<style scoped>
.admin-layout {
  --navy-3: #0a1b33;
  --navy-2: #12305a;
  --navy-1: #1f4a82;
  --yellow-1: #f7b801;
  --yellow-2: #ffd54a;
  --yellow-3: #fce59a;
  --bg: #eef2f8;
  --text: #0a1b33;
  --muted: #5b6b82;

  display: flex;
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--text);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* PANEL IZQUIERDO */
.sidebar {
  width: 260px;
  background-color: var(--navy-2);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 0 18px 24px;
  box-shadow: 4px 0 20px -8px rgba(10, 27, 51, 0.45);
}

.brand {
  margin: 0 -18px 28px;
  padding: 30px 18px 29px;
  background: var(--navy-2);
  border-bottom: 1px solid var(--yellow-1);
  text-align: center;
}

.brand h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #ffffff;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: transform 0.15s, background 0.2s, box-shadow 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
  box-shadow: 0 10px 22px -12px rgba(0, 0, 0, 0.6);
}

.menu-item.router-link-active {
  background: var(--yellow-1);
  color: var(--navy-3);
}

.menu-item.is-readonly.router-link-active {
  background: var(--yellow-3);
}

/* BOLITAS DE PERMISO */
.badge {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.badge-read {
  background-color: var(--yellow-2);
}

.badge-write {
  background-color: #5fd08a;
}

.logout-btn {
  margin-top: auto;
  padding: 12px;
  background: transparent;
  color: var(--yellow-2);
  border: 2px solid var(--yellow-1);
  border-radius: 12px;
  font: inherit;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.logout-btn:hover {
  background: var(--yellow-1);
  color: var(--navy-3);
}

/* CONTENEDOR DERECHO */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.top-header {
  height: 70px;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 16px;
  border-bottom: 1px solid var(--yellow-1);
  box-shadow: 0 8px 20px -14px rgba(10, 27, 51, 0.45);
}

.content {
  flex: 1;
  padding: 32px;
}

/* USUARIO */
.user-menu-wrapper {
  position: relative;
}

.user-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafd;
  padding: 6px 16px 6px 16px;
  border-radius: 20px;
  border: 1.5px solid var(--navy-2);
  cursor: pointer;
  font: inherit;
  outline: none;
}

.user-card-top:hover,
.user-card-top.is-active {
  background: var(--yellow-3);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--navy-2);
  color: var(--yellow-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
}

.user-details {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--navy-3);
}

.user-role {
  font-size: 11px;
  color: var(--muted);
  font-weight: 700;
}

.dropdown-arrow {
  font-size: 12px;
  color: var(--navy-2);
}

.user-dropdown-card {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 290px;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 20px 50px -20px rgba(10, 27, 51, 0.45);
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: var(--navy-2);
  border-bottom: 4px solid var(--yellow-1);
}

.dropdown-header h4 {
  margin: 0;
  font-size: 14px;
  color: #ffffff;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--yellow-2);
  cursor: pointer;
  font-size: 14px;
}

.dropdown-body {
  padding: 18px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  margin-bottom: 8px;
}

.info-label {
  color: var(--muted);
  font-weight: 600;
}

.info-value {
  color: var(--navy-3);
  font-weight: 700;
  word-break: break-all;
  text-align: right;
}

.divider {
  border: none;
  border-top: 1px dashed #d3dbe8;
  margin: 12px 0;
}

.permissions-section h5 {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--navy-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.permissions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.permissions-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--navy-3);
}

.perm-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 800;
}

.perm-1 { background-color: #fde2e0; color: #b3261e; }
.perm-2 { background-color: var(--yellow-3); color: #6b4e00; }
.perm-3 { background-color: #d6f3e1; color: #14532d; }
</style>