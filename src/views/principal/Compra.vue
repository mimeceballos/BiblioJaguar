<script setup lang="ts">
import { ref, computed, inject } from 'vue'
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
const isBuyModalOpen = ref(false)
const activeNotification = ref<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null)

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
const buyBook = () => {
  isBuyModalOpen.value = true
}

const confirmPurchase = () => {
  isBuyModalOpen.value = false
  showNotification('¡Compra realizada con éxito! Recibirás la factura por correo.', 'success')
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
</script>

<template>
  <section class="compra-module">

    <!-- BARRA SUPERIOR Y BÚSQUEDA CENTRADA -->
    <header class="top-header">
      <div class="header-titles">
        <h1>Módulo de Compras</h1>
        <p>Venta de libros y material académico</p>
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

    <!-- MENSAJE DE NOTIFICACIÓN -->
    <div v-if="activeNotification" :class="['screen-alert', activeNotification.type]">
      <span>{{ activeNotification.text }}</span>
      <button class="close-alert-btn" @click="activeNotification = null">✕</button>
    </div>

    <!-- CONTENIDO PRINCIPAL DEL LIBRO -->
    <main class="module-content">
      <div v-if="selectedBook" class="book-detail-container">

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
              <button class="btn btn-secondary action-btn" @click="buyBook">
                <span>Comprar (${{ selectedBook.price }} MXN)</span>
              </button>

              <button class="btn btn-outline action-btn" @click="downloadSample">
                <span>Descargar fragmento</span>
              </button>
            </div>
          </div>
        </div>

        <!-- FICHA TÉCNICA -->
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

    <!-- MODAL DE COMPRA -->
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
.compra-module {
  width: 100%;
  min-height: calc(100vh - 134px);
  color: #4d6787;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

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

.btn {
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  text-align: center;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .book-main-info {
    grid-template-columns: 1fr;
  }
}
</style>