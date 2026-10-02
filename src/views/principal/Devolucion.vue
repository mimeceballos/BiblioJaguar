<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Búsqueda
const searchQuery = ref('')

// Notificaciones en pantalla
const activeNotification = ref<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null)

function showNotification(text: string, type: 'success' | 'warning' | 'info' = 'success') {
  activeNotification.value = { text, type }
  setTimeout(() => {
    if (activeNotification.value?.text === text) {
      activeNotification.value = null
    }
  }, 5000)
}

// Lista de Libros Actualmente Prestados (Casos de Prueba)
const activeLoans = ref([
  {
    id: 101,
    title: 'El Principito',
    coverUrl: 'https://tse4.mm.bing.net/th/id/OIP.3J5Q7LzjrIA8dz31Dh64zQHaKT?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    startDate: '2026-09-20',
    endDate: '2026-09-29',
    daysOverdue: 2, // Retrasado 2 días ($30 de multa)
    status: 'overdue'
  },
  {
    id: 102,
    title: '1984',
    coverUrl: 'https://tse3.mm.bing.net/th/id/OIP.-j50XrgQGZI3-I-IafkBWAHaJl?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    startDate: '2026-09-27',
    endDate: '2026-10-02',
    daysRemaining: 1, // Vence mañana
    status: 'warning'
  },
  {
    id: 103,
    title: 'Don Quijote de la Mancha',
    coverUrl: 'https://tse4.mm.bing.net/th/id/OIP.gspNQGbs5FkKrS-USd-C7wHaLH?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    startDate: '2026-09-29',
    endDate: '2026-10-04',
    daysRemaining: 3, // Dentro del plazo normal
    status: 'normal'
  },
  {
    id: 104,
    title: 'Cien años de soledad',
    coverUrl: 'https://m.media-amazon.com/images/I/71YoFJSz3LL.jpg',
    startDate: '2026-10-01',
    endDate: '2026-10-06',
    daysRemaining: 5, // Dentro del plazo normal (Azul)
    status: 'normal'
  }
])

// Libros filtrados por la búsqueda
const filteredLoans = computed(() => {
  if (!searchQuery.value.trim()) return activeLoans.value
  return activeLoans.value.filter(loan =>
    loan.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Tarifas de amonestación
const PENALTY_PER_DAY = 15

// Acción: Devolver Libro
function handleReturn(book: typeof activeLoans.value[0]) {
  if (book.status === 'overdue') {
    const penaltyTotal = book.daysOverdue * PENALTY_PER_DAY
    showNotification(
      `Libro "${book.title}" devuelto. Se cobró una amonestación de $${penaltyTotal} MXN (${book.daysOverdue} días de retraso a $${PENALTY_PER_DAY}/día).`,
      'warning'
    )
  } else {
    showNotification(`Libro "${book.title}" devuelto con éxito sin recargos.`, 'success')
  }

  // Eliminar el libro de los préstamos activos
  activeLoans.value = activeLoans.value.filter(item => item.id !== book.id)
}

// Acción: Volver a Prestar (Renovar)
function handleRenew(book: typeof activeLoans.value[0]) {
  if (book.status === 'overdue') {
    const penaltyTotal = book.daysOverdue * PENALTY_PER_DAY
    showNotification(
      `No se puede renovar directamente. Se debe liquidar la amonestación de $${penaltyTotal} MXN primero.`,
      'warning'
    )
    return
  }

  // Renovar agregando 5 días más
  const currentEnd = new Date(book.endDate + 'T00:00:00')
  currentEnd.setDate(currentEnd.getDate() + 5)
  book.endDate = currentEnd.toISOString().split('T')[0]
  book.daysRemaining = (book.daysRemaining || 0) + 5
  book.status = 'normal'

  showNotification(`Préstamo de "${book.title}" renovado por 5 días adicionales hasta el ${book.endDate}.`, 'info')
}

function handleLogout(): void {
  router.push('/')
}
</script>

<template>
  <div class="devoluciones-page">
    <!-- BARRA SUPERIOR Y BÚSQUEDA CENTRADA -->
    <header class="top-header">
      <div class="header-titles">
        <h1>Devolución de Libros</h1>
        <p>Gestión de préstamos activos, devoluciones y amonestaciones</p>
      </div>

      <div class="search-centered">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título de libro prestado..."
          class="light-search-input"
        />
        <button class="light-search-btn">Buscar</button>
      </div>
    </header>

    <!-- NOTIFICACIÓN EN PANTALLA -->
    <div v-if="activeNotification" :class="['screen-alert', activeNotification.type]">
      <span>{{ activeNotification.text }}</span>
      <button class="close-alert-btn" @click="activeNotification = null">✕</button>
    </div>

    <!-- CONTENEDOR DE LIBROS EN PRESTAMO -->
    <main class="loans-container">
      <h3>Libros en posesión del usuario ({{ filteredLoans.length }})</h3>

      <div v-if="filteredLoans.length === 0" class="empty-state">
        <p>No se encontraron libros pendientes de devolución.</p>
      </div>

      <div class="loans-list">
        <div
          v-for="book in filteredLoans"
          :key="book.id"
          :class="['loan-card', book.status]"
        >
          <!-- Imagen y Datos Básicos -->
          <div class="book-info">
            <img :src="book.coverUrl" :alt="book.title" class="book-thumb" />
            <div class="book-meta">
              <h4 class="book-title">{{ book.title }}</h4>
              <div class="dates-info">
                <span><strong>Inicio:</strong> {{ book.startDate }}</span>
                <span><strong>Vencimiento:</strong> {{ book.endDate }}</span>
              </div>
            </div>
          </div>

          <!-- Estado y Tiempos de Devolución -->
          <div class="status-badge-container">
            <!-- Caso 1: Retrasado -->
            <div v-if="book.status === 'overdue'" class="status-tag status-overdue">
              <span class="tag-title"> Vencido ({{ book.daysOverdue }} días con retraso)</span>
              <span class="penalty-text">Amonestación: ${{ book.daysOverdue * PENALTY_PER_DAY }} MXN</span>
            </div>

            <!-- Caso 2: Vence Mañana -->
            <div v-else-if="book.status === 'warning'" class="status-tag status-warning">
              <span class="tag-title"> Queda 1 día</span>
              <span class="tag-sub">Vence mañana</span>
            </div>

            <!-- Caso 3: Plazo Normal -->
            <div v-else class="status-tag status-normal">
              <span class="tag-title"> En plazo ({{ book.daysRemaining }} días restantes)</span>
            </div>
          </div>

          <!-- Opciones de Acción -->
          <div class="card-actions">
            <button class="btn btn-return" @click="handleReturn(book)">
              Devolver
            </button>
            <button class="btn btn-renew" @click="handleRenew(book)">
              Volver a Prestar
            </button>
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<style scoped>
.devoluciones-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
  color: #4D6787;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-sizing: border-box;
}

/* BÚSQUEDA CENTRADA Y ENCABEZADO */
.top-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  text-align: center;
}

.header-titles h1 {
  margin: 0 0 6px;
  color: #4D6787;
  font-size: 28px;
  font-weight: 800;
}

.header-titles p {
  margin: 0;
  color: #7D8794;
  font-size: 14px;
}

.search-centered {
  display: flex;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 520px;
}

.light-search-input {
  flex: 1;
  padding: 11px 16px;
  background-color: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.light-search-input:focus {
  border-color: #72bbf0;
  box-shadow: 0 0 0 3px rgba(114, 187, 240, 0.15);
}

.light-search-btn {
  padding: 11px 22px;
  background-color: #4D6787;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.light-search-btn:hover {
  background-color: #3b526f;
}

/* ALERTAS Y NOTIFICACIONES */
.screen-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 14px;
}

.screen-alert.success {
  background-color: #eaf8e6;
  border: 1px solid #c3e8b7;
  color: #2d5a1e;
}

.screen-alert.warning {
  background-color: #fff1f2;
  border: 1px solid #fecdd3;
  color: #9f1239;
}

.screen-alert.info {
  background-color: #eaf5ff;
  border: 1px solid #bce1ff;
  color: #1e425e;
}

.close-alert-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: inherit;
}

/* LISTA DE PRÉSTAMOS */
.loans-container {
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 32px;
}

.loans-container h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #334155;
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: #94a3b8;
}

.loans-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* TARJETA DE LIBRO (FILA) */
.loan-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 20px;
  border-radius: 14px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.loan-card.overdue {
  background-color: #fff5f5;
  border-color: #fecaca;
}

.loan-card.warning {
  background-color: #fffbeb;
  border-color: #fef08a;
}

/* INFORMACIÓN DEL LIBRO */
.book-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1.2;
}

.book-thumb {
  width: 55px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.book-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
}

.dates-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: #64748b;
}

/* ETIQUETAS DE ESTADO */
.status-badge-container {
  flex: 1;
  display: flex;
  justify-content: center;
}

.status-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 14px;
  border-radius: 10px;
  text-align: center;
}

.status-overdue {
  background-color: #ffe4e6;
  color: #9f1239;
}

.penalty-text {
  font-size: 13px;
  font-weight: 800;
  margin-top: 2px;
}

.status-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.tag-title {
  font-size: 13px;
  font-weight: 700;
}

.tag-sub {
  font-size: 11px;
  opacity: 0.85;
}

.status-normal {
  background-color: #dcfce7;
  color: #166534;
}

/* BOTONES DE ACCIÓN DE LA TARJETA */
.card-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-return {
  background-color: #cfebff;
  color: #1e425e;
  border: 1px solid #b3dcfa;
}

.btn-return:hover {
  background-color: #bde0fe;
}

.btn-renew {
  background-color: #d9efbd;
  color: #2d5a1e;
  border: 1px solid #c4e3a4;
}

.btn-renew:hover {
  background-color: #cbe8aa;
}

/* FOOTER Y CERRAR SESIÓN */
.footer-actions {
  display: flex;
  justify-content: center;
}

.logout-btn {
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #4D6787;
  background: #CFEBFF;
  border: none;
  border-radius: 999px;
  padding: 12px 28px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.logout-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .loan-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .status-badge-container {
    justify-content: flex-start;
    width: 100%;
  }

  .card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>