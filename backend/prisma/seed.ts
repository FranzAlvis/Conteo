import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient, TipoMesa } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CSV_PATH = path.join(__dirname, 'data', 'mesas_facultades.csv');

interface CsvMesaRow {
  Mesa: string;
  Facultad: string;
  q_ejemplo: string;
}

interface MesaSeedInput {
  numero: number;
  codigo: string;
  facultadNombre: string;
  tipo: TipoMesa;
}

/**
 * Lee prisma/data/mesas_facultades.csv (fuente oficial de mesas y facultades
 * USFX 2026) y devuelve la lista de mesas a crear, en el orden del archivo.
 * La columna "q_ejemplo" es un identificador de relleno del csv original,
 * no un tamaño de padrón real, por lo que no se usa para totalPadron.
 */
function leerMesasDesdeCsv(): MesaSeedInput[] {
  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows: CsvMesaRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return rows.map((row) => {
    const numero = Number(row.Mesa);
    if (!Number.isInteger(numero) || numero <= 0) {
      throw new Error(`Número de mesa inválido en CSV: "${row.Mesa}"`);
    }
    if (!row.Facultad) {
      throw new Error(`Facultad vacía para la mesa ${row.Mesa} en CSV`);
    }
    return {
      numero,
      codigo: `MESA-${String(numero).padStart(2, '0')}`,
      facultadNombre: row.Facultad.trim(),
      tipo: 'ESTUDIANTIL' as TipoMesa,
    };
  });
}

async function main() {
  console.log('🌱 Iniciando parametrización de base de datos (Seed)...');

  // 1. Limpiar base de datos (orden respeta dependencias FK)
  await prisma.resetAuditoria.deleteMany();
  await prisma.delegado.deleteMany();
  await prisma.actaMesa.deleteMany();
  await prisma.votoMesa.deleteMany();
  await prisma.mesa.deleteMany();
  await prisma.facultad.deleteMany();
  await prisma.candidato.deleteMany();
  await prisma.cargo.deleteMany();
  await prisma.user.deleteMany();
  await prisma.configuracion.deleteMany();

  // 2. Configuración global
  await prisma.configuracion.create({
    data: { id: 1, conteoAbierto: true },
  });

  // 3. Usuarios por defecto
  const [passwordHashAdmin, passwordHashTrans, passwordHashVisor] =
    await Promise.all([
      bcrypt.hash('admin123', 10),
      bcrypt.hash('trans123', 10),
      bcrypt.hash('visor123', 10),
    ]);

  const admin = await prisma.user.create({
    data: {
      name: 'Yamile Hayes Michel (Admin)',
      username: 'admin',
      passwordHash: passwordHashAdmin,
      role: 'ADMIN',
      telefono: '71234567',
      isActive: true,
    },
  });

  const transcriptor1 = await prisma.user.create({
    data: {
      name: 'Juan Carlos Pérez (Transcriptor 1)',
      username: 'transcriptor',
      passwordHash: passwordHashTrans,
      role: 'TRANSCRIPTOR',
      telefono: '76543210',
      isActive: true,
    },
  });

  const transcriptor2 = await prisma.user.create({
    data: {
      name: 'María Elena Torrez (Transcriptor 2)',
      username: 'transcriptor2',
      passwordHash: passwordHashTrans,
      role: 'TRANSCRIPTOR',
      telefono: '68098765',
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Observador Electoral',
      username: 'visor',
      passwordHash: passwordHashVisor,
      role: 'VISOR',
      telefono: '70011223',
      isActive: true,
    },
  });

  console.log('✅ Usuarios creados (admin, transcriptores, visor)');

  // 4. Cargo y candidatos
  const cargoVicerrector = await prisma.cargo.create({
    data: {
      nombre: 'Vicerrectorado 2026',
      descripcion:
        'Elecciones de autoridades universitarias 2026-2030 (USFX Sucre)',
    },
  });

  const [yamile, villalpando, encinas, espada, blancos] = await Promise.all([
    prisma.candidato.create({
      data: {
        nombre: 'Maria Yamile Hayes Michel',
        lista: 'Postulante a Vicerrectorado 2026',
        cargoId: cargoVicerrector.id,
        esPropio: true,
      },
    }),
    prisma.candidato.create({
      data: {
        nombre: 'Franz Armando Villalpando Amonzabel',
        lista: 'Postulante a Vicerrectorado 2026',
        cargoId: cargoVicerrector.id,
        esPropio: false,
      },
    }),
    prisma.candidato.create({
      data: {
        nombre: 'Guido Marcelo Encinas Pasquier',
        lista: 'Postulante a Vicerrectorado 2026',
        cargoId: cargoVicerrector.id,
        esPropio: false,
      },
    }),
    prisma.candidato.create({
      data: {
        nombre: 'Freddy David Espada Rivera',
        lista: 'Postulante a Vicerrectorado 2026',
        cargoId: cargoVicerrector.id,
        esPropio: false,
      },
    }),
    prisma.candidato.create({
      data: {
        nombre: 'Votos En Blanco / Nulos',
        lista: 'N/A',
        cargoId: cargoVicerrector.id,
        esPropio: false,
      },
    }),
  ]);

  console.log('✅ Candidatos parametrizados correctamente');

  // 5. Facultades + Mesas (fuente: prisma/data/mesas_facultades.csv)
  const mesasCsv = leerMesasDesdeCsv();
  const nombresFacultades = [...new Set(mesasCsv.map((m) => m.facultadNombre))];

  // Mesa docente exclusiva no forma parte del csv de mesas estudiantiles.
  const FACULTAD_DOCENTE = 'Mesa Docentes USFX (Exclusiva)';
  nombresFacultades.push(FACULTAD_DOCENTE);

  const facultadesPorNombre = new Map<string, string>(); // nombre -> id
  for (const nombre of nombresFacultades) {
    const facultad = await prisma.facultad.create({
      data: { nombre, keyword: nombre },
    });
    facultadesPorNombre.set(nombre, facultad.id);
  }

  console.log(`✅ ${facultadesPorNombre.size} facultades/sedes registradas`);

  await prisma.mesa.createMany({
    data: mesasCsv.map((m) => ({
      codigo: m.codigo,
      facultadId: facultadesPorNombre.get(m.facultadNombre)!,
      tipo: m.tipo,
      ponderacion: 1,
      estado: 'PENDIENTE',
    })),
  });

  const mesaDocente = await prisma.mesa.create({
    data: {
      codigo: 'MESA-DOC-01',
      facultadId: facultadesPorNombre.get(FACULTAD_DOCENTE)!,
      ubicacion: 'Salón de Honor - Campus Central',
      totalPadron: 120,
      tipo: 'DOCENTE',
      ponderacion: 45,
      estado: 'PENDIENTE',
    },
  });

  console.log(
    `✅ ${mesasCsv.length} mesas estudiantiles + 1 mesa docente registradas`,
  );

  // 6. Ejemplo de flujo ya transcrito, en edición y pendiente para demo/QA
  const mesa1 = await prisma.mesa.update({
    where: { codigo: 'MESA-01' },
    data: {
      transcriptorId: transcriptor1.id,
      estado: 'CARGADA',
      totalPadron: 250,
    },
  });

  await prisma.mesa.update({
    where: { codigo: 'MESA-02' },
    data: {
      transcriptorId: transcriptor1.id,
      estado: 'EN_CARGA',
      totalPadron: 280,
    },
  });

  await prisma.mesa.update({
    where: { codigo: 'MESA-03' },
    data: { transcriptorId: transcriptor2.id, totalPadron: 300 },
  });

  await prisma.mesa.update({
    where: { id: mesaDocente.id },
    data: { transcriptorId: transcriptor2.id, estado: 'CARGADA' },
  });

  // 7. Delegados de ejemplo
  await prisma.delegado.create({
    data: {
      nombre: 'Ana María Roca',
      ci: '8492019 CH',
      celular: '71234567',
      correo: 'ana.roca@usfx.edu.bo',
      mesaId: mesa1.id,
      isActive: true,
    },
  });

  await prisma.delegado.create({
    data: {
      nombre: 'Jorge Luis Gutiérrez',
      ci: '9210384 CH',
      celular: '68019283',
      correo: 'jorge.gutierrez@gmail.com',
      isActive: true,
    },
  });

  await prisma.delegado.create({
    data: {
      nombre: 'Dr. Fernando Arancibia',
      ci: '3410928 CH',
      celular: '77889900',
      correo: 'f.arancibia@usfx.edu.bo',
      mesaId: mesaDocente.id,
      isActive: true,
    },
  });

  // 8. Votos iniciales de las mesas ya cargadas
  await prisma.votoMesa.createMany({
    data: [
      { mesaId: mesa1.id, candidatoId: yamile.id, cantidad: 130 },
      { mesaId: mesa1.id, candidatoId: villalpando.id, cantidad: 70 },
      { mesaId: mesa1.id, candidatoId: encinas.id, cantidad: 30 },
      { mesaId: mesa1.id, candidatoId: espada.id, cantidad: 15 },
      { mesaId: mesa1.id, candidatoId: blancos.id, cantidad: 5 },
    ],
  });

  await prisma.votoMesa.createMany({
    data: [
      { mesaId: mesaDocente.id, candidatoId: yamile.id, cantidad: 30 },
      { mesaId: mesaDocente.id, candidatoId: villalpando.id, cantidad: 15 },
      { mesaId: mesaDocente.id, candidatoId: encinas.id, cantidad: 5 },
      { mesaId: mesaDocente.id, candidatoId: espada.id, cantidad: 8 },
      { mesaId: mesaDocente.id, candidatoId: blancos.id, cantidad: 2 },
    ],
  });

  console.log('✅ Votos iniciales registrados en mesas de ejemplo');
  console.log(
    `🎉 Seed completado: ${mesasCsv.length + 1} mesas, ${facultadesPorNombre.size} facultades, admin=${admin.username}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
