<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { RouterLink } from 'vue-router'
import type { Ref } from 'vue'

type PermissionCode = 1 | 2 | 3

const currentPermission = inject<Ref<PermissionCode>>('currentPermission')
const canWrite = computed(() => currentPermission?.value === 3)

// Búsqueda
const searchQuery = ref('')

// Libro de ejemplo
const selectedBook = ref({
  id: 1,
  title: 'Cien años de soledad',
  authors: 'Gabriel García Márquez',
  edition: '1ª Edición Conmemorativa',
  fac: 'FCA',
  publisher: 'Editorial Sudamericana',
  year: 1967,
  isbn: '978-0307474728',
  coverUrl: 'https://m.media-amazon.com/images/I/71YoFJSz3LL.jpg',
  synopsis:
    'Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo. Macondo era entonces una aldea de veinte casas de barro y cañabrava construidas a la orilla de un río de aguas diáfanas...',
  price: 299.00
})

// Estados de la vista
const isLoanModalOpen = ref(false)
const isBuyModalOpen = ref(false)
const activeNotification = ref<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null)

// Estado del Préstamo Activo (Confirmación en Pantalla)
const activeLoanInfo = ref<{
  startDate: string
  endDate: string
  days: number
} | null>(null)

// Configuración de Préstamo
const loanDurationDays = ref<number>(3)
const startDate = ref<string>(new Date().toISOString().split('T')[0])

// Cálculo de fecha de entrega
const endDate = computed(() => {
  if (!startDate.value) return ''
  const date = new Date(startDate.value + 'T00:00:00')
  date.setDate(date.getDate() + loanDurationDays.value)
  return date.toISOString().split('T')[0]
})

// Mostrar notificación en pantalla
const showNotification = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
  activeNotification.value = { text, type }
  setTimeout(() => {
    if (activeNotification.value?.text === text) {
      activeNotification.value = null
    }
  }, 5000)
}

// Acciones
const openLoanModal = () => {
  isLoanModalOpen.value = true
}

const confirmLoan = () => {
  activeLoanInfo.value = {
    startDate: startDate.value,
    endDate: endDate.value,
    days: loanDurationDays.value
  }
  isLoanModalOpen.value = false
  showNotification('¡Préstamo registrado exitosamente!', 'success')
}

const returnBook = () => {
  if (!activeLoanInfo.value) {
    showNotification('Actualmente este libro no tiene un préstamo activo registrado.', 'info')
    return
  }
  activeLoanInfo.value = null
  showNotification('El libro ha sido devuelto correctamente.', 'success')
}

const downloadSample = () => {
  const content = `FRAGMENTO DE MUESTRA: ${selectedBook.value.title}\nAutor: ${selectedBook.value.authors}\n\n${selectedBook.value.synopsis}\n\n--- Fin de la muestra ---`
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Fragmento_${selectedBook.value.title.replace(/\s+/g, '_')}.txt`
  link.click()
  URL.revokeObjectURL(url)
  showNotification('Descargando fragmento de muestra en tu dispositivo...', 'info')
}

const buyBook = () => {
  isBuyModalOpen.value = true
}

const confirmPurchase = () => {
  isBuyModalOpen.value = false
  showNotification('¡Compra realizada con éxito! Recibirás la factura por correo.', 'success')
}
</script>

<template>
  <section class="prestamo-module">

    <!-- BARRA SUPERIOR Y BÚSQUEDA CENTRADA -->
    <header class="top-header">
      <div class="header-titles">
        <h1>Módulo de Préstamos</h1>
        <p>Gestión y consulta de catálogo de libros</p>
      </div>

      <!-- Búsqueda -->
      <div class="search-centered">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título, autor o ISBN..."
          class="light-search-input"
        />
        <button class="light-search-btn">Buscar</button>
      </div>
    </header>

    <!-- MENSAJE DE NOTIFICACIÓN / ALERTA DE PANTALLA -->
    <div v-if="activeNotification" :class="['screen-alert', activeNotification.type]">
      <span>{{ activeNotification.text }}</span>
      <button class="close-alert-btn" @click="activeNotification = null">✕</button>
    </div>

    <!-- CONTENIDO PRINCIPAL DEL LIBRO -->
    <main class="module-content">
      <div v-if="selectedBook" class="book-detail-container">

        <!-- RESUMEN EN PANTALLA DE PRÉSTAMO ACTIVO (SI EXISTE) -->
        <div v-if="activeLoanInfo" class="active-loan-banner">
          <div class="banner-info">
            <span class="badge-status"> Estado: Prestado</span>
            <p>
              Préstamo por <strong>{{ activeLoanInfo.days }} días</strong>.
              Inició el <strong>{{ activeLoanInfo.startDate }}</strong> y debe entregarse antes del
              <strong class="highlight-date">{{ activeLoanInfo.endDate }}</strong>.
            </p>
          </div>
          <button class="btn btn-secondary" @click="returnBook">
            Devolver Libro Ahora
          </button>
        </div>

        <!-- SECCIÓN DE PORTADA Y ACCIONES -->
        <div class="book-main-info">
          <!-- Izquierda: Portada Grande -->
          <div class="book-hero">
            <div class="cover-wrapper">
              <img :src="selectedBook.coverUrl" :alt="selectedBook.title" class="book-cover" />
            </div>
            <h2 class="book-title">{{ selectedBook.title }}</h2>
            <p class="book-author">Por {{ selectedBook.authors }}</p>
          </div>

          <!-- Derecha: Botones de Acción -->
          <div class="book-actions-card">
            <h3>Acciones Rápidas</h3>
            <div class="action-buttons">
              <button
                class="btn btn-secondary action-btn"
                :disabled="!!activeLoanInfo"
                @click="openLoanModal"
              >
                <span class="btn-icon"></span>
                <span>{{ activeLoanInfo ? 'Libro ya Prestado' : 'Prestar Libro' }}</span>
              </button>
<!--
              <button
                class="btn btn-secondary action-btn"
                @click="returnBook"
              >
                <span class="btn-icon"></span>
                <span>Devolver Libro</span>
              </button>
-->
              <button class="btn btn-secondary action-btn" @click="buyBook">
                <span class="btn-icon"></span>
                <span>Comprar (${{ selectedBook.price }} MXN)</span>
              </button>

              <button class="btn btn-outline action-btn" @click="downloadSample">
                <span>Descargar fragmento</span>
              </button>
            </div>
          </div>
        </div>

        <!-- datos del libro -->
        <div class="book-details-section">
          <h3>Ficha Técnica</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Editorial:</span>
              <span class="value">{{ selectedBook.publisher }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Facultad:</span>
              <span class="value">{{ selectedBook.fac }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Edición:</span>
              <span class="value">{{ selectedBook.edition }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Año de Publicación:</span>
              <span class="value">{{ selectedBook.year }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Código ISBN:</span>
              <span class="value">{{ selectedBook.isbn }}</span>
            </div>
          </div>

          <div class="synopsis-box">
            <h4>Sinopsis</h4>
            <p>{{ selectedBook.synopsis }}</p>
          </div>
        </div>

      </div>
    </main>

    <!-- REGISTRAR PRÉSTAMO -->
    <div v-if="isLoanModalOpen" class="modal-overlay" @click.self="isLoanModalOpen = false">
      <div class="modal-card">
        <h3>Registrar Préstamo</h3>
        <p class="modal-subtitle">Selecciona el plazo deseado y la fecha inicial:</p>

        <!-- Selección de Días (Visible y contrastado) -->
        <div class="form-group">
          <label>Duración del préstamo:</label>
          <div class="duration-options">
            <button
              v-for="days in [3, 5, 10]"
              :key="days"
              type="button"
              :class="['day-chip', { active: loanDurationDays === days }]"
              @click="loanDurationDays = days"
            >
              {{ days }} Días
            </button>
          </div>
        </div>

        <!-- Selector de Fecha de Inicio (Claro) -->
        <div class="form-group">
          <label for="start-date">Fecha de inicio:</label>
          <input
            id="start-date"
            v-model="startDate"
            type="date"
            class="light-date-input"
          />
        </div>

        <!-- Resumen con fecha final -->
        <div class="loan-summary">
          <span>Fecha límite de devolución:</span>
          <strong class="summary-date">{{ endDate }}</strong>
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" @click="isLoanModalOpen = false">Cancelar</button>
          <button class="btn btn-primary" @click="confirmLoan">Confirmar Préstamo</button>
        </div>
      </div>
    </div>

    <!-- COMPRA -->
    <div v-if="isBuyModalOpen" class="modal-overlay" @click.self="isBuyModalOpen = false">
      <div class="modal-card">
        <h3>Comprar Libro</h3>
        <p class="modal-subtitle">Detalles de la compra directa:</p>

        <div class="buy-summary">
          <p><strong>Libro:</strong> {{ selectedBook.title }}</p>
          <p><strong>Formato:</strong> Tapa Blanda</p>
          <p class="buy-price">Total: ${{ selectedBook.price }} MXN</p>
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" @click="isBuyModalOpen = false">Cancelar</button>
          <button class="btn btn-accent" @click="confirmPurchase">Procesar Pago</button>
        </div>
      </div>
    </div>

  </section>
</template>

<style scoped>
.prestamo-module {
  width: 100%;
  min-height: calc(100vh - 134px);
  color: #4d6787;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* ENCABEZADO Y BÚSQUEDA CENTRADA */
.top-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.header-titles h1 {
  margin: 0 0 4px;
  color: #4d6787;
  font-size: 28px;
  font-weight: 800;
}

.header-titles p {
  margin: 0;
  color: #7d8794;
  font-size: 14px;
}

/* Búsqueda clara y centrada */
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
  background-color: #4d6787;
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

/* NAVEGACIÓN INTERNA */
.module-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  padding: 5px;
  background-color: #fffde1;
  border: 1px solid #f2eab4;
  border-radius: 12px;
  width: fit-content;
}

.module-nav-link {
  display: inline-flex;
  align-items: center;
  padding: 9px 15px;
  border-radius: 8px;
  color: #4d6787;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}

/* MENSJES Y ALERTAS EN PANTALLA */
.screen-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
}

.screen-alert.success {
  background-color: #eaf8e6;
  border: 1px solid #c3e8b7;
  color: #2d5a1e;
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

/* BANNER DE PRÉSTAMO ACTIVO */
.active-loan-banner {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.banner-info p {
  margin: 6px 0 0;
  color: #166534;
  font-size: 14px;
}

.badge-status {
  background-color: #dcfce7;
  color: #15803d;
  font-weight: 800;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.highlight-date {
  color: #15803d;
  font-size: 15px;
}

/* CONTENEDOR PRINCIPAL */
.module-content {
  width: 100%;
  min-height: 400px;
  padding: 24px;
  box-sizing: border-box;
  background-color: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
}

.book-main-info {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.book-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.cover-wrapper {
  width: 100%;
  max-width: 240px;
  height: 340px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  margin-bottom: 16px;
  background-color: #f1f5f9;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-title {
  font-size: 22px;
  font-weight: 800;
  color: #2c3e50;
  margin: 8px 0 4px;
}

.book-author {
  font-size: 15px;
  color: #7d8794;
  margin: 0;
}

/* TARJETA DE BOTONES DE ACCIÓN */
.book-actions-card {
  padding: 24px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  height: fit-content;
}

.book-actions-card h3 {
  margin-top: 0;
  margin-bottom: 18px;
  font-size: 16px;
  color: #334155;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
}

.btn-icon {
  font-size: 16px;
}

/* ESTILOS DE BOTONES */
.btn {
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #d9efbd;
  color: #2d5a1e;
  border: 1px solid #c4e3a4;
}
.btn-primary:hover:not(:disabled) {
  background-color: #cbe8aa;
}

.btn-secondary {
  background-color: #cfebff;
  color: #1e425e;
  border: 1px solid #b3dcfa;
}
.btn-secondary:hover {
  background-color: #bde0fe;
}

.btn-accent {
  background-color: #ffe3c4;
  color: #633806;
  border: 1px solid #f3d0a4;
}
.btn-accent:hover {
  background-color: #fcd5a9;
}

.btn-outline {
  background-color: #ffffff;
  color: #4d6787;
  border: 1px solid #cbd5e1;
}
.btn-outline:hover {
  background-color: #f1f5f9;
}

/* FICHA TÉCNICA Y SINOPSIS */
.book-details-section {
  border-top: 1px solid #eef2f6;
  padding-top: 24px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item .label {
  font-size: 12px;
  color: #7d8794;
  text-transform: uppercase;
  font-weight: 700;
}

.detail-item .value {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.synopsis-box h4 {
  margin-bottom: 8px;
  color: #2c3e50;
}

.synopsis-box p {
  line-height: 1.6;
  color: #5a6e85;
}

/* MODALES Y OVERLAYS */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: #ffffff;
  padding: 28px;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-card h3 {
  margin: 0 0 6px;
  color: #1e293b;
}

.modal-subtitle {
  margin: 0 0 20px;
  font-size: 13px;
  color: #64748b;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #334155;
}

/* BOTONES DE DÍAS  */
.duration-options {
  display: flex;
  gap: 10px;
}

.day-chip {
  flex: 1;
  padding: 10px;
  border: 1px solid #cbd5e1;
  background-color: #f1f5f9;
  color: #334155 !important; /* Mantiene visibilidad completa */
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-chip:hover {
  background-color: #e2e8f0;
}

.day-chip.active {
  background-color: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af !important;
}

/* INPUT DE FECHA CON FONDO CLARO */
.light-date-input {
  width: 100%;
  padding: 10px 14px;
  background-color: #ffffff !important;
  color: #1e293b !important;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
  outline: none;
}

.light-date-input:focus {
  border-color: #3b82f6;
}

/* RESUMEN DE FECHA FINAL */
.loan-summary {
  background-color: #f0fdf4;
  padding: 12px 16px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  color: #166534;
}

.summary-date {
  font-size: 16px;
  color: #15803d;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.buy-summary {
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.buy-summary p {
  margin: 6px 0;
  color: #334155;
}

.buy-price {
  font-size: 18px;
  font-weight: 800;
  color: #633806;
  margin-top: 12px !important;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .book-main-info {
    grid-template-columns: 1fr;
  }

  .active-loan-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>