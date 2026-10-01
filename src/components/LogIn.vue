<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

interface LoginForm {
  email: string
  password: string
}

interface LoginPayload {
  email: string
}

// 1 = Desactivo/Oculto, 2 = Lectura, 3 = Escritura
export type PermissionCode = 1 | 2 | 3

export interface UserProfile {
  email: string
  name: string
  roleName: string
  permissions: {
    prestamo: PermissionCode
    compra: PermissionCode
    devolucion: PermissionCode
    audiolibros: PermissionCode
  }
}

type View = 'choose' | 'externos' | 'uady'
type UadyRole = 'Alumno' | 'Maestro'

const emit = defineEmits<{
  (e: 'login-success', payload: LoginPayload): void
}>()

const router = useRouter()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALUMNO_REGEX = /^A\d{8}$/i 
const MAESTRO_REGEX = /^[a-záéíóúüñ]+\.[a-záéíóúüñ]+$/i 

const view = ref<View>('choose')
const form = reactive<LoginForm>({ email: '', password: '' })
const errors = reactive<Partial<Record<keyof LoginForm, string>>>({})
const showPassword = ref(false)
const isLoading = ref(false)
const serverError = ref('')
const successMessage = ref('')

// Quita un dominio institucional opcional: A23211341@alumnos.uady.mx -> A23211341
function cleanUadyUser(raw: string): string {
  return raw.trim().replace(/@(alumnos\.|correo\.)?uady\.mx$/i, '')
}


function detectUadyRole(raw: string): UadyRole | null {
  const user = cleanUadyUser(raw)
  if (ALUMNO_REGEX.test(user)) return 'Alumno'
  if (MAESTRO_REGEX.test(user)) return 'Maestro'
  return null
}

const detectedRole = computed(() =>
  view.value === 'uady' ? detectUadyRole(form.email) : null,
)

function resetMessages(): void {
  errors.email = ''
  errors.password = ''
  serverError.value = ''
  successMessage.value = ''
}

function goTo(next: View): void {
  form.email = ''
  form.password = ''
  showPassword.value = false
  resetMessages()
  view.value = next
}

function validate(): boolean {
  resetMessages()
  let valid = true

  if (!form.email.trim()) {
    errors.email =
      view.value === 'externos' ? 'El correo es obligatorio' : 'El usuario o correo es obligatorio'
    valid = false
  } else if (view.value === 'externos' && !EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Ingresa un correo válido'
    valid = false
  }

  if (!form.password) {
    errors.password = 'La contraseña es obligatoria'
    valid = false
  }

  return valid
}

// Envía las credenciales a la API y devuelve el perfil si son correctas.
async function authenticate(): Promise<UserProfile> {
  let response: Response
  try {
    response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identificador: form.email.trim(),
        password: form.password,
        modo: view.value,
      }),
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message ?? 'Ocurrió un error al iniciar sesión')
  }
  return data as UserProfile
}

async function handleSubmit(): Promise<void> {
  serverError.value = ''
  successMessage.value = ''

  if (!validate()) return

  isLoading.value = true

  try {
    const profile = await authenticate()
    localStorage.setItem('auth_user', JSON.stringify(profile))

    successMessage.value = `Bienvenido, ${profile.roleName}`
    emit('login-success', { email: profile.email })

    setTimeout(() => {
      router.push('/admin')
    }, 600)
  } catch (err) {
    serverError.value =
      err instanceof Error ? err.message : 'Ocurrió un error al iniciar sesión'
  } finally {
    isLoading.value = false
  }
}
</script>


<template>
  <section class="login-page">
    <div class="login-card">
      
      <header class="card-header">
        <h1 class="brand">BiblioJaguar</h1>
        <p class="brand-sub">Administrador de Proyectos</p>
      </header>

      <div class="card-body">
        
        
        <div v-if="view === 'choose'" class="choose">
          <h2 class="view-title">Bienvenido</h2>
          <p class="view-subtitle">Selecciona cómo quieres ingresar</p>

          <button type="button" class="choice-btn choice-uady" @click="goTo('uady')">
            <span class="choice-name">UADY</span>
            <span class="choice-desc">Alumnos, maestros y bibliotecarios</span>
          </button>

          <button type="button" class="choice-btn choice-externos" @click="goTo('externos')">
            <span class="choice-name">Externos</span>
            <span class="choice-desc">Usuarios ajenos a la universidad</span>
          </button>
        </div>

        
        <form v-else novalidate @submit.prevent="handleSubmit">
          <button type="button" class="back-btn" @click="goTo('choose')">← Volver</button>

          <h2 class="view-title">
            {{ view === 'externos' ? 'Acceso Externos' : 'Acceso UADY' }}
          </h2>
          <p class="view-subtitle">Ingresa tus datos</p>

          <!-- Correo / usuario -->
          <div class="field">
            <label for="email">
              {{ view === 'externos' ? 'Correo' : 'Correo o usuario' }}
            </label>
            <input
              id="email"
              v-model="form.email"
              :type="view === 'externos' ? 'email' : 'text'"
              :autocomplete="view === 'externos' ? 'email' : 'username'"
              :class="{ invalid: errors.email }"
            />
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            <span v-else-if="detectedRole" class="role-hint">
              Se detectó: <strong>{{ detectedRole }}</strong>
            </span>
          </div>

          <!-- Contraseña -->
          <div class="field">
            <label for="password">Contraseña</label>
            <div class="password-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Escribe tu contraseña"
                :class="{ invalid: errors.password }"
              />
              <button
                type="button"
                class="toggle-password"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          </div>

          <p v-if="serverError" class="server-error">{{ serverError }}</p>
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? 'Ingresando...' : 'Iniciar sesión' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Paleta: azul marino + amarillo */
.login-page {
  --navy-3: #0a1b33;
  --navy-2: #12305a;
  --navy-1: #1f4a82;
  --yellow-1: #f7b801;
  --yellow-2: #ffd54a;
  --yellow-3: #FCE59A;
  --bg: #eef2f8;
  --text: #0a1b33;
  --muted: #5b6b82;
  --danger: #b3261e;

  position: relative;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  box-sizing: border-box;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 20px 50px -20px rgba(10, 27, 51, 0.45);
  text-align: left;
}

/* TITULO */
.card-header {
  position: relative;
  padding: 30px 28px 26px;
  text-align: center;
  background: var(--navy-2);
  border-bottom: 5px solid var(--yellow-1);
}

.brand {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #ffffff;
}

.brand-sub {
  margin: 10px 0 0;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--yellow-1);
}

.card-body {
  padding: 28px 32px 32px;
}

.view-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
  text-align: center;
  color: var(--navy-3);
}

.view-subtitle {
  margin: 0 0 24px;
  font-size: 14px;
  text-align: center;
  color: var(--muted);
}

/* BOTONES PARA ENTRAR */
.choose {
  display: flex;
  flex-direction: column;
}

.choice-btn {
  font: inherit;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  margin-bottom: 14px;
  padding: 16px 20px;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  border: 2px solid transparent;
  transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
}

.choice-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px -12px rgba(10, 27, 51, 0.6);
}

.choice-name {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: var(--navy-2);
  text-transform: uppercase;
}

.choice-desc {
  font-size: 13px;
  color: var(--navy-2);
  opacity: 0.85;
}

.choice-uady {
  color: var(--navy-3);
  border-color: var(--navy-2);
}

.choice-externos {
  color: var(--navy-2);
  border-color: var(--navy-2);
}

/* VOVLER */
.back-btn {
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 14px;
  padding: 2px 13px;
  color: var(--navy-3);
  background: var(--yellow-3);
  border-radius: 15px;
  border: 1.5px solid #ffff;
  cursor: pointer;
}

.back-btn:hover {
  color: var(--navy-2);
  text-decoration: underline;
}

/* DATOS PARA ENTRAR */
.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: var(--navy-3);
  margin-bottom: 6px;
}

.field input[type='email'],
.field input[type='password'],
.field input[type='text'] {
  font: inherit;
  font-size: 15px;
  padding: 10px 12px;
  border: 1.5px solid #0e0868;
  border-radius: 10px;
  background: #f8fafd !important;
  color: var(--text) !important;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field input:-webkit-autofill,
.field input:-webkit-autofill:hover,
.field input:-webkit-autofill:focus,
.field input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px #f8fafd inset !important;
  -webkit-text-fill-color: #0a1b33 !important;
  transition: background-color 5000s ease-in-out 0s;
}

.field input:focus {
  border-color: var(--yellow);
  box-shadow: 0 0 0 3px rgba(247, 184, 1, 0.3);
}

.field input.invalid {
  border-color: var(--danger);
}

.error-text {
  margin-top: 6px;
  font-size: 13px;
  color: var(--danger);
}

.role-hint {
  margin-top: 6px;
  font-size: 13px;
  color: var(--navy-500);
}

.password-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

.password-wrapper input {
  flex: 1;
  padding-right: 70px;
}

.toggle-password {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none !important;
  border: none !important;
  color: var(--navy-500) !important;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 6px;
  outline: none !important;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.toggle-password:focus,
.toggle-password:active {
  outline: none !important;
  background: none !important;
}

/* MENSAJES SI ENTRA O NO */
.server-error {
  background: rgba(179, 38, 30, 0.08);
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 18px;
  text-align: center;
}

.success-message {
  background: rgba(31, 122, 76, 0.1);
  border: 1px solid #1f7a4c;
  color: #175c39;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 18px;
  text-align: center;
}

/* BOTON PRINCIPAL */
.submit-btn {
  font: inherit;
  width: 100%;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--navy-3);
  background: var(--yellow-2);
  border: none;
  border-radius: 999px;
  padding: 13px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.submit-btn:hover:not(:disabled) {
  background: var(--yellow-3);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .card-body {
    padding: 24px 20px 28px;
  }
}
</style>