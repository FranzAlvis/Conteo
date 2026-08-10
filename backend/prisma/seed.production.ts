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

/** Misma fuente oficial que seed.ts (ver ese archivo para más contexto). */
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

/**
 * Seed de PRODUCCIÓN: a diferencia de seed.ts (solo para desarrollo/demo),
 * este script:
 *  - Es idempotente: si ya hay datos, no hace nada. Se puede correr en cada
 *    arranque del contenedor sin riesgo de borrar votos reales.
 *  - Nunca hace deleteMany: no hay forma de que este script destruya datos.
 *  - No crea mesas "de ejemplo" ya cargadas, ni delegados ni votos falsos:
 *    todas las mesas quedan PENDIENTE, listas para la elección real.
 *  - Crea un único usuario ADMIN con la contraseña real definida en el
 *    entorno (ADMIN_PASSWORD) en vez de la contraseña débil de desarrollo.
 *    Los usuarios TRANSCRIPTOR/VISOR reales se crean después desde el
 *    módulo de Usuarios con sus datos verdaderos.
 */
async function main() {
  const yaParametrizada = (await prisma.configuracion.count()) > 0;
  if (yaParametrizada) {
    console.log('ℹ️  La base de datos ya está parametrizada, se omite el seed.');
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      'ADMIN_PASSWORD no está definida. Configúrala en el archivo .env antes de iniciar por primera vez.',
    );
  }
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminNombre = process.env.ADMIN_NOMBRE || 'Administrador';

  console.log('🌱 Parametrizando base de datos de PRODUCCIÓN (primera vez)...');

  await prisma.configuracion.create({ data: { id: 1, conteoAbierto: true } });

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      name: adminNombre,
      username: adminUsername,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const cargoVicerrector = await prisma.cargo.create({
    data: {
      nombre: 'Vicerrectorado 2026',
      descripcion:
        'Elecciones de autoridades universitarias 2026-2030 (USFX Sucre)',
    },
  });

  await prisma.candidato.createMany({
    data: [
      {
        nombre: 'Maria Yamile Hayes Michel',
        lista: 'Postulante a Vicerrectorado 2026',
        cargoId: cargoVicerrector.id,
        esPropio: true,
      },
      {
        nombre: 'Franz Armando Villalpando Amonzabel',
        lista: 'Postulante a Vicerrectorado 2026',
        cargoId: cargoVicerrector.id,
        esPropio: false,
      },
      {
        nombre: 'Guido Marcelo Encinas Pasquier',
        lista: 'Postulante a Vicerrectorado 2026',
        cargoId: cargoVicerrector.id,
        esPropio: false,
      },
      {
        nombre: 'Freddy David Espada Rivera',
        lista: 'Postulante a Vicerrectorado 2026',
        cargoId: cargoVicerrector.id,
        esPropio: false,
      },
      {
        nombre: 'Votos En Blanco / Nulos',
        lista: 'N/A',
        cargoId: cargoVicerrector.id,
        esPropio: false,
      },
    ],
  });

  console.log('✅ Candidatos parametrizados correctamente');

  const mesasCsv = leerMesasDesdeCsv();
  const nombresFacultades = [...new Set(mesasCsv.map((m) => m.facultadNombre))];

  const FACULTAD_DOCENTE = 'Mesa Docentes USFX (Exclusiva)';
  nombresFacultades.push(FACULTAD_DOCENTE);

  const facultadesPorNombre = new Map<string, string>();
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

  await prisma.mesa.create({
    data: {
      codigo: 'MESA-DOC-01',
      facultadId: facultadesPorNombre.get(FACULTAD_DOCENTE)!,
      ubicacion: 'Salón de Honor - Campus Central',
      tipo: 'DOCENTE',
      ponderacion: 45,
      estado: 'PENDIENTE',
    },
  });

  console.log(
    `✅ ${mesasCsv.length} mesas estudiantiles + 1 mesa docente registradas (todas PENDIENTE)`,
  );
  console.log(`🎉 Seed de producción completado. Usuario ADMIN: ${admin.username}`);
  console.log(
    '⚠️  Crea los usuarios TRANSCRIPTOR/VISOR reales desde el módulo de Usuarios (no se generan automáticamente).',
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
