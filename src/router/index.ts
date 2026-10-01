import { createRouter, createWebHistory } from 'vue-router'
import LogIn from '../components/LogIn.vue'
import inicio from '../views/inicio.vue'

import Prestamo from '../views/principal/Prestamo.vue'
import Compra from '../views/principal/Compra.vue'
import Devolucion from '../views/principal/Devolucion.vue'
import AudioLibros from '../views/principal/AudioLibros.vue'

// Componentes internos de Préstamo
import SistemaLista from '../components/sistemas/SistemaLista.vue'
import SistemaDetalle from '../components/sistemas/SistemaDetalle.vue'
import SistemaForm from '../components/sistemas/SistemaForm.vue'

const routes = [
  { path: '/', name: 'login', component: LogIn },

  // inicio.vue es el layout (menú lateral + cabecera).
  // Todas las secciones son hijas de /admin para que se muestren
  // dentro de su <router-view>.
  {
    path: '/admin',
    component: inicio,
    redirect: '/admin/prestamo',
    children: [
      {
        path: 'prestamo',
        component: Prestamo,
        children: [
          { path: '', name: 'prestamo-lista', component: SistemaLista },
          { path: 'nuevo', name: 'prestamo-nuevo', component: SistemaForm },
          { path: ':id', name: 'prestamo-detalle', component: SistemaDetalle },
          { path: ':id/editar', name: 'prestamo-editar', component: SistemaForm },
        ],
      },
      { path: 'compra', name: 'compra', component: Compra },
      { path: 'devolucion', name: 'devolucion', component: Devolucion },
      { path: 'audiolibros', name: 'audiolibros', component: AudioLibros },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
