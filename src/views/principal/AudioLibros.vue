<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { Ref } from 'vue'

type PermissionCode = 1 | 2 | 3

const currentPermission = inject<Ref<PermissionCode>>('currentPermission')
const canWrite = computed(() => currentPermission?.value === 3)

// Búsqueda
const searchQuery = ref('')

// Audiolibro de ejemplo
const selectedAudiobook = ref({
  id: 1,
  title: 'Cien años de soledad',
  authors: 'Gabriel García Márquez',
  narrator: 'Gustavo Bonfigli',
  duration: '14 hrs 25 mins',
  fac: 'FCA',
  publisher: 'Penguin Random House Audio',
  year: 2019,
  isbn: '978-0525588320',
  coverUrl: 'https://m.media-amazon.com/images/I/71YoFJSz3LL.jpg',
  synopsis:
    'Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo. Disfruta de esta obra maestra de la literatura hispanoamericana en formato audiolibro narrado por voz profesional.'
})
</script>

<template>
  <section class="audiolibros-module">

    <!-- BARRA SUPERIOR Y BÚSQUEDA CENTRADA -->
    <header class="top-header">
      <div class="header-titles">
        <h1>Módulo de Audiolibros</h1>
        <p>Escucha y consulta reproducciones en formato digital</p>
      </div>

      <!-- Búsqueda -->
      <div class="search-centered">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar audiolibro por título, autor o narrador..."
          class="light-search-input"
        />
        <button class="light-search-btn">Buscar</button>
      </div>
    </header>

    <!-- CONTENIDO PRINCIPAL DEL AUDIOLIBRO -->
    <main class="module-content">
      <div v-if="selectedAudiobook" class="book-detail-container">

        <!-- SECCIÓN DE PORTADA Y ACCIONES -->
        <div class="book-main-info">
          <!-- Izquierda: Portada Grande -->
          <div class="book-hero">
            <div class="cover-wrapper">
              <img :src="selectedAudiobook.coverUrl" :alt="selectedAudiobook.title" class="book-cover" />
            </div>
            <h2 class="book-title">{{ selectedAudiobook.title }}</h2>
            <p class="book-author">Por {{ selectedAudiobook.authors }}</p>
          </div>

          <!-- Derecha: Botones de Acción -->
          <div class="book-actions-card">
            <h3>Acciones Rápidas</h3>
            <div class="action-buttons">
              <button class="btn btn-secondary action-btn" type="button">
                <span>Escuchar Audiolibro</span>
              </button>

              <button class="btn btn-outline action-btn" type="button">
                <span>Escuchar fragmento</span>
              </button>
            </div>
          </div>
        </div>

        <!-- FICHA TÉCNICA -->
        <div class="book-details-section">
          <h3>Ficha Técnica</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Narrador:</span>
              <span class="value">{{ selectedAudiobook.narrator }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Duración Total:</span>
              <span class="value">{{ selectedAudiobook.duration }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Editorial Audio:</span>
              <span class="value">{{ selectedAudiobook.publisher }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Facultad:</span>
              <span class="value">{{ selectedAudiobook.fac }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Año de Edición:</span>
              <span class="value">{{ selectedAudiobook.year }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Código ISBN:</span>
              <span class="value">{{ selectedAudiobook.isbn }}</span>
            </div>
          </div>

          <div class="synopsis-box">
            <h4>Sinopsis</h4>
            <p>{{ selectedAudiobook.synopsis }}</p>
          </div>
        </div>

      </div>
    </main>

  </section>
</template>

<style scoped>
.audiolibros-module {
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

@media (max-width: 768px) {
  .book-main-info {
    grid-template-columns: 1fr;
  }
}
</style>