<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Nombre de usuario logueado
const userName = ref('Usuario')

onMounted(() => {
  const sessionData = localStorage.getItem('auth_user')
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData)
      userName.value = parsed.name || parsed.email?.split('@')[0] || 'Usuario'
    } catch (e) {
      console.error('Error al leer usuario', e)
    }
  }
})

// Catálogo de libros de ejemplo
const booksCatalog = ref([
  {
    id: 1,
    title: 'Cien años de soledad',
    authors: 'Gabriel García Márquez',
    edition: '1ª Edición Conmemorativa',
    fac: 'FCA',
    publisher: 'Editorial Sudamericana',
    year: 1967,
    isbn: '978-0307474728',
    coverUrl: 'https://m.media-amazon.com/images/I/71YoFJSz3LL.jpg',
    synopsis: 'Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo...'
  },
  {
    id: 2,
    title: 'El Principito',
    authors: 'Antoine de Saint-Exupéry',
    edition: 'Edición Especial',
    fac: 'FCA',
    publisher: 'Reynal & Hitchcock',
    year: 1943,
    isbn: '978-0156012195',
    coverUrl: 'https://tse4.mm.bing.net/th/id/OIP.3J5Q7LzjrIA8dz31Dh64zQHaKT?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    synopsis: 'Un piloto se encuentra varado en el desierto del Sahara después de que su avión sufriera una avería. Allí conoce a un pequeño príncipe proveniente de otro planeta...'
  },
  {
    id: 3,
    title: '1984',
    authors: 'George Orwell',
    edition: 'Edición Conmemorativa',
    fac: 'FCA',
    publisher: 'Secker & Warburg',
    year: 1949,
    isbn: '978-0451524935',
    coverUrl: 'https://tse3.mm.bing.net/th/id/OIP.-j50XrgQGZI3-I-IafkBWAHaJl?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    synopsis: 'En un futuro distópico, Winston Smith vive en una sociedad controlada por el Gran Hermano, donde la libertad de pensamiento y la privacidad están completamente prohibidas...'
  },
  {
    id: 4,
    title: 'Don Quijote de la Mancha',
    authors: 'Miguel de Cervantes',
    edition: 'Clásicos Castalia',
    fac: 'FCA',
    publisher: 'Francisco de Robles',
    year: 1605,
    isbn: '978-8437604947',
    coverUrl: 'https://tse4.mm.bing.net/th/id/OIP.gspNQGbs5FkKrS-USd-C7wHaLH?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    synopsis: 'Alonso Quijano, un hidalgo pobre de la Mancha, enloquece leyendo libros de caballerías y decide convertirse en caballero andante bajo el nombre de Don Quijote...'
  }
])

// Selección de Campus (0 = Todos los Campus)
const selectedCampusId = ref<number>(0)

const campusList = [
  { id: 0, name: 'Todos los Campus' },
  { id: 1, name: 'Arquitectura, Hábitat, Arte y Diseño' },
  { id: 2, name: 'Ciencias Biológicas y Agropecuarias' },
  { id: 3, name: 'Ciencias Exactas e Ingenierías' },
  { id: 4, name: 'Ciencias de la Salud' },
  { id: 5, name: 'Ciencias Sociales, Económico-Administrativas y Humanidades' }
]

function selectCampus(id: number) {
  selectedCampusId.value = id
}

// Búsqueda y autocompletado
const searchQuery = ref('')
const searchedBook = ref<typeof booksCatalog.value[0] | null>(null)
const hasSearched = ref(false)
const isDropdownOpen = ref(false)

const suggestions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []

  return booksCatalog.value.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.authors.toLowerCase().includes(query) ||
    book.isbn.toLowerCase().includes(query)
  )
})

const onInput = () => {
  isDropdownOpen.value = true
}

const onBlur = () => {
  setTimeout(() => {
    isDropdownOpen.value = false
  }, 200)
}

const selectBook = (book: typeof booksCatalog.value[0]) => {
  searchQuery.value = book.title
  searchedBook.value = book
  hasSearched.value = true
  isDropdownOpen.value = false
}

const handleSearch = () => {
  const query = searchQuery.value.trim().toLowerCase()
  hasSearched.value = true
  isDropdownOpen.value = false

  if (!query) {
    searchedBook.value = null
    return
  }

  const found = booksCatalog.value.find(book =>
    book.title.toLowerCase().includes(query) ||
    book.authors.toLowerCase().includes(query) ||
    book.isbn.toLowerCase().includes(query)
  )

  searchedBook.value = found || null
}
</script>

<template>
  <section class="inicio-module">

    <!-- ENCABEZADO CON FILTRADO PRIMERO Y BUSCADOR DESPUÉS -->
    <header class="top-header">
      <div class="header-titles">
        <h1>{{ userName }}</h1>
        <p>Selecciona una biblioteca o realiza una búsqueda general en el catálogo</p>
      </div>

      <!-- PASO 1: SELECCIÓN / FILTRADO POR CAMPUS -->
      <div class="campus-selector-container">
        <span class="campus-selector-title">FILTRADO POR CAMPUS:</span>
        <div class="campus-buttons-grid">
          <button
            v-for="campus in campusList"
            :key="campus.id"
            type="button"
            :class="['campus-btn', { active: selectedCampusId === campus.id }]"
            @click="selectCampus(campus.id)"
          >
            <span class="campus-name">
              {{ campus.id === 0 ? campus.name : 'Biblioteca del Campus de ' + campus.name }}
            </span>
          </button>
        </div>
      </div>

      <!-- PASO 2: BARRA DE BÚSQUEDA -->
      <div class="search-centered">
        <div class="input-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por título, autor o ISBN..."
            class="light-search-input"
            @input="onInput"
            @focus="isDropdownOpen = true"
            @blur="onBlur"
            @keyup.enter="handleSearch"
          />

          <!-- LISTA DESPLEGABLE DE SUGERENCIAS -->
          <ul
            v-if="isDropdownOpen && suggestions.length > 0"
            class="suggestions-dropdown"
          >
            <li
              v-for="book in suggestions"
              :key="book.id"
              class="suggestion-item"
              @mousedown="selectBook(book)"
            >
              <img :src="book.coverUrl" :alt="book.title" class="suggestion-thumb" />
              <div class="suggestion-info">
                <span class="suggestion-title">{{ book.title }}</span>
                <span class="suggestion-author">{{ book.authors }}</span>
              </div>
            </li>
          </ul>
        </div>

        <button class="light-search-btn" @click="handleSearch">Buscar</button>
      </div>
    </header>

    <!-- RESULTADO DE LA BÚSQUEDA -->
    <main class="module-content">

      <!-- Estado Inicial -->
      <div v-if="!hasSearched" class="empty-state">
        <p>Escribe el título, autor o ISBN de un libro para consultar su información.</p>
      </div>

      <!-- Sin Resultados -->
      <div v-else-if="!searchedBook" class="empty-state">
        <p>No se encontraron libros que coincidan con "<strong>{{ searchQuery }}</strong>".</p>
      </div>

      <!-- Libro Encontrado: Ficha Técnica -->
      <div v-else class="book-detail-container">
        
        <!-- PORTADA Y TÍTULO -->
        <div class="book-main-info">
          <div class="book-hero">
            <div class="cover-wrapper">
              <img :src="searchedBook.coverUrl" :alt="searchedBook.title" class="book-cover" />
            </div>
            <h2 class="book-title">{{ searchedBook.title }}</h2>
            <p class="book-author">Por {{ searchedBook.authors }}</p>
          </div>
        </div>

        <!-- FICHA TÉCNICA -->
        <div class="book-details-section">
          <h3>Ficha Técnica</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Editorial:</span>
              <span class="value">{{ searchedBook.publisher }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Facultad:</span>
              <span class="value">{{ searchedBook.fac }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Edición:</span>
              <span class="value">{{ searchedBook.edition }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Año de Publicación:</span>
              <span class="value">{{ searchedBook.year }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Código ISBN:</span>
              <span class="value">{{ searchedBook.isbn }}</span>
            </div>
          </div>

          <div class="synopsis-box">
            <h4>Sinopsis</h4>
            <p>{{ searchedBook.synopsis }}</p>
          </div>
        </div>

      </div>

    </main>

  </section>
</template>

<style scoped>
.inicio-module {
  width: 100%;
  min-height: calc(100vh - 134px);
  color: #4D6787;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* ENCABEZADO Y BÚSQUEDA */
.top-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  text-align: center;
}

.header-titles h1 {
  margin: 0 0 4px;
  color: #4D6787;
  font-size: 28px;
  font-weight: 800;
}

.header-titles p {
  margin: 0;
  color: #7D8794;
  font-size: 14px;
}

/* SELECCIÓN DE CAMPUS (ARRIBA) */
.campus-selector-container {
  width: 100%;
  max-width: 950px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.campus-selector-title {
  font-size: 12px;
  font-weight: 800;
  color: #12305a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.campus-buttons-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.campus-btn {
  display: flex;
  align-items: center;
  padding: 9px 16px;
  background-color: #ffffff;
  color: #4D6787;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.campus-btn:hover {
  background-color: #f1f5f9;
  border-color: #72bbf0;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.campus-btn.active {
  background-color: #12305a;
  color: #ffffff;
  border-color: #12305a;
  box-shadow: 0 4px 12px rgba(18, 48, 90, 0.25);
}

.campus-name {
  white-space: nowrap;
}

/* BUSCADOR (ABAJO) */
.search-centered {
  display: flex;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 560px;
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.light-search-input {
  width: 100%;
  padding: 12px 16px;
  background-color: #ffffff;
  color: #334155;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
}

.light-search-input:focus {
  border-color: #72bbf0;
  box-shadow: 0 0 0 3px rgba(114, 187, 240, 0.15);
}

.light-search-btn {
  padding: 12px 24px;
  background-color: #4D6787;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
  height: fit-content;
}

.light-search-btn:hover {
  background-color: #3b526f;
}

/* MENÚ DESPLEGABLE DE SUGERENCIAS */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  list-style: none;
  padding: 6px 0;
  margin: 0;
  z-index: 100;
  max-height: 250px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;
}

.suggestion-item:hover {
  background-color: #f1f5f9;
}

.suggestion-thumb {
  width: 32px;
  height: 46px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.suggestion-info {
  display: flex;
  flex-direction: column;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.suggestion-author {
  font-size: 12px;
  color: #64748b;
}

/* CONTENEDOR PRINCIPAL */
.module-content {
  width: 100%;
  padding: 28px;
  box-sizing: border-box;
  background-color: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #7D8794;
  font-size: 15px;
}

/* PORTADA Y DETALLES DEL LIBRO */
.book-main-info {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.book-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.cover-wrapper {
  width: 180px;
  height: 260px;
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
  color: #7D8794;
  margin: 0;
}

/* FICHA TÉCNICA */
.book-details-section {
  border-top: 1px solid #eef2f6;
  padding-top: 24px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  color: #7D8794;
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

/* RESPONSIVE */
@media (max-width: 768px) {
  .campus-buttons-grid {
    flex-direction: column;
    align-items: stretch;
  }

  .campus-btn {
    justify-content: center;
  }

  .campus-name {
    white-space: normal;
    text-align: center;
  }
}
</style>