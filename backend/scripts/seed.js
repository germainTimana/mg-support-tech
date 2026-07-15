const { readFileSync } = require('fs');
const { resolve } = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function loadEnv() {
  try {
    const content = readFileSync(resolve(__dirname, '../.env'), 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* ignore */
  }
}

const DEMO_USERS = [
  {
    nombre: 'Administrador MG',
    email: 'admin@mgsupport.com',
    password: 'admin123',
    role: 'admin',
    documentoIdentidad: '1000000001',
    telefono: '3000000001',
  },
  {
    nombre: 'Carlos Técnico',
    email: 'tecnico@mgsupport.com',
    password: 'tecnico123',
    role: 'tecnico',
    documentoIdentidad: '1000000002',
    telefono: '3000000002',
  },
  {
    nombre: 'María Cliente',
    email: 'cliente@mgsupport.com',
    password: 'cliente123',
    role: 'cliente',
    documentoIdentidad: '1000000003',
    telefono: '3000000003',
    direccion: 'Calle 10 #20-30',
  },
];

async function seed() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI required');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const users = mongoose.connection.collection('users');

  for (const demo of DEMO_USERS) {
    const exists = await users.findOne({ email: demo.email });
    if (exists) {
      console.log(`Ya existe: ${demo.email}`);
      continue;
    }
    await users.insertOne({
      nombre: demo.nombre,
      email: demo.email,
      password: await bcrypt.hash(demo.password, 10),
      role: demo.role,
      documentoIdentidad: demo.documentoIdentidad,
      telefono: demo.telefono,
      direccion: demo.direccion,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Creado: ${demo.email} / ${demo.password} (${demo.role})`);
  }

  await mongoose.disconnect();
  console.log('Seed completado.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
