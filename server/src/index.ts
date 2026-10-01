import 'dotenv/config'
import { timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import express from 'express'
import type { RowDataPacket } from 'mysql2'
import { pool } from './db.ts'

type Tipo = 'administrador' | 'alumno' | 'maestro' | 'bibliotecario' | 'externo'
type Modo = 'uady' | 'externos'

// Fila de tu tabla `usuarios`
interface UsuarioRow extends RowDataPacket {
  usuario: string
  tipo: string
  contrasena: string
}

// ASIGNA PERMISOS SEGUN EL TIPO. 1 = Desactivo, 2 = Lectura, 3 = Escritura
const PERMISOS: Record<Tipo, Record<'prestamo' | 'compra' | 'devolucion' | 'audiolibros', 1 | 2 | 3>> = {
  administrador: { prestamo: 3, compra: 3, devolucion: 3, audiolibros: 3 },
  bibliotecario: { prestamo: 3, compra: 3, devolucion: 3, audiolibros: 3 },
  maestro: { prestamo: 3, compra: 2, devolucion: 3, audiolibros: 2 },
  alumno: { prestamo: 3, compra: 1, devolucion: 3, audiolibros: 2 },
  externo: { prestamo: 2, compra: 2, devolucion: 2, audiolibros: 2 },
}

const NOMBRE_ROL: Record<Tipo, string> = {
  administrador: 'Administrador',
  bibliotecario: 'Bibliotecario',
  maestro: 'Maestro',
  alumno: 'Alumno',
  externo: 'Externo',
}

// QUE TIPO DE USUARIO ENTRA EN CADA BOTON
const TIPOS_POR_MODO: Record<Modo, Tipo[]> = {
  uady: ['administrador', 'bibliotecario', 'maestro', 'alumno'],
  externos: ['administrador', 'externo'],
}

function normalizarTipo(valor: unknown): Tipo | null {
  const t = String(valor).trim().toLowerCase()
  return t in PERMISOS ? (t as Tipo) : null
}

async function passwordCorrecta(ingresada: string, guardada: string): Promise<boolean> {
  if (/^\$2[aby]\$/.test(guardada)) return bcrypt.compare(ingresada, guardada)
  const a = Buffer.from(ingresada)
  const b = Buffer.from(guardada)
  return a.length === b.length && timingSafeEqual(a, b)
}

const app = express()
app.use(express.json())

app.post('/api/login', async (req, res) => {
  const { identificador, password, modo } = req.body ?? {}

  if (
    typeof identificador !== 'string' ||
    typeof password !== 'string' ||
    (modo !== 'uady' && modo !== 'externos')
  ) {
    res.status(400).json({ message: 'Datos incompletos' })
    return
  }

  // UADY ACEPTA DOMINIO DE LA FAC
  const usuario =
    modo === 'uady'
      ? identificador.trim().replace(/@(alumnos\.|correo\.)?uady\.mx$/i, '')
      : identificador.trim()

  try {
    const [rows] = await pool.query<UsuarioRow[]>(
      'SELECT usuario, tipo, contrasena FROM usuarios WHERE usuario = ? LIMIT 1',
      [usuario],
    )
    const user = rows[0]

    // NO REVELA SI EL USUARIO EXISTE O NO, NI SI LA CONTRASEÑA ES INCORRECTA
    if (!user || !(await passwordCorrecta(password, String(user.contrasena)))) {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
      return
    }

    const tipo = normalizarTipo(user.tipo)
    if (!tipo) {
      res.status(403).json({ message: 'Tu tipo de usuario no tiene permisos asignados' })
      return
    }

    if (!TIPOS_POR_MODO[modo as Modo].includes(tipo)) {
      res.status(403).json({
        message:
          modo === 'uady'
            ? 'Esta cuenta no es de la UADY. Usa el acceso Externos'
            : 'Esta cuenta es de la UADY. Usa el acceso UADY',
      })
      return
    }

    res.json({
      email: user.usuario,
      roleName: NOMBRE_ROL[tipo],
      permissions: PERMISOS[tipo],
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`API lista en http://localhost:${port}`))