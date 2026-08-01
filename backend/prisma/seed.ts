import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando parametrización de base de datos (Seed)...')

  // 1. Limpiar base de datos
  await prisma.actaMesa.deleteMany()
  await prisma.votoMesa.deleteMany()
  await prisma.mesa.deleteMany()
  await prisma.candidato.deleteMany()
  await prisma.cargo.deleteMany()
  await prisma.user.deleteMany()

  // 2. Crear Usuarios por defecto
  const passwordHashAdmin = await bcrypt.hash('admin123', 10)
  const passwordHashTrans = await bcrypt.hash('trans123', 10)
  const passwordHashVisor = await bcrypt.hash('visor123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Yamile Hayes Michel (Admin)',
      username: 'admin',
      passwordHash: passwordHashAdmin,
      role: 'ADMIN',
      isActive: true,
    },
  })

  const transcriptor = await prisma.user.create({
    data: {
      name: 'Carlos Transcriptor',
      username: 'transcriptor',
      passwordHash: passwordHashTrans,
      role: 'TRANSCRIPTOR',
      isActive: true,
    },
  })

  const visor = await prisma.user.create({
    data: {
      name: 'Observador Electoral',
      username: 'visor',
      passwordHash: passwordHashVisor,
      role: 'VISOR',
      isActive: true,
    },
  })

  console.log('✅ Usuarios creados (admin, transcriptor, visor)')

  // 3. Crear Cargo
  const cargoVicerrector = await prisma.cargo.create({
    data: {
      nombre: 'Vicerrectorado 2026',
      descripcion: 'Elecciones de autoridades universitarias 2026-2030',
    },
  })

  // 4. Crear Candidatos
  const yamile = await prisma.candidato.create({
    data: {
      nombre: 'Yamile Hayes Michel',
      lista: 'Frente Unidad Universitaria (Lista 1)',
      cargoId: cargoVicerrector.id,
      esPropio: true,
    },
  })

  const mendoza = await prisma.candidato.create({
    data: {
      nombre: 'Dr. Roberto Mendoza',
      lista: 'Frente Reformista Estudiantil (Lista 2)',
      cargoId: cargoVicerrector.id,
      esPropio: false,
    },
  })

  const soliz = await prisma.candidato.create({
    data: {
      nombre: 'Dra. Patricia Soliz',
      lista: 'Movimiento Autonomía y Ciencia (Lista 3)',
      cargoId: cargoVicerrector.id,
      esPropio: false,
    },
  })

  const blancos = await prisma.candidato.create({
    data: {
      nombre: 'Votos En Blanco / Nulos',
      lista: 'N/A',
      cargoId: cargoVicerrector.id,
      esPropio: false,
    },
  })

  console.log('✅ Candidatos parametrizados correctamente')

  // 5. Crear Mesas de votación
  const mesa1 = await prisma.mesa.create({
    data: {
      codigo: 'MESA-01',
      facultad: 'Facultad de Medicina',
      ubicacion: 'Aula Magna - Planta Baja',
      totalPadron: 250,
      estado: 'CARGADA',
      transcriptorId: transcriptor.id,
    },
  })

  const mesa2 = await prisma.mesa.create({
    data: {
      codigo: 'MESA-02',
      facultad: 'Facultad de Derecho',
      ubicacion: 'Bloque A - Aula 102',
      totalPadron: 280,
      estado: 'EN_CARGA',
      transcriptorId: transcriptor.id,
    },
  })

  const mesa3 = await prisma.mesa.create({
    data: {
      codigo: 'MESA-03',
      facultad: 'Facultad de Tecnología',
      ubicacion: 'Laboratorio de Informática',
      totalPadron: 300,
      estado: 'PENDIENTE',
    },
  })

  // 6. Registrar Votos Iniciales para Mesa-01
  await prisma.votoMesa.createMany({
    data: [
      { mesaId: mesa1.id, candidatoId: yamile.id, cantidad: 145 },
      { mesaId: mesa1.id, candidatoId: mendoza.id, cantidad: 80 },
      { mesaId: mesa1.id, candidatoId: soliz.id, cantidad: 15 },
      { mesaId: mesa1.id, candidatoId: blancos.id, cantidad: 5 },
    ],
  })

  console.log('✅ Mesas y Votos iniciales registrados correctamente')
  console.log('🎉 Seed completado exitosamente.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
