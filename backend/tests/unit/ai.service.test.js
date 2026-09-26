jest.mock('groq-sdk', () => require('../mocks/groq'));

const MockAIProvider = require('../../services/providers/mock.provider');

const ENV_KEYS = ['AI_PROVIDER', 'GROQ_API_KEY', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY'];

describe('services/ai.service - createAIProvider', () => {
  const saved = {};
  let createAIProvider;

  beforeAll(() => {
    ENV_KEYS.forEach(k => { saved[k] = process.env[k]; });
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    ({ createAIProvider } = require('../../services/ai.service'));
  });

  beforeEach(() => ENV_KEYS.forEach(k => { delete process.env[k]; }));

  afterAll(() => {
    ENV_KEYS.forEach(k => {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    });
    jest.restoreAllMocks();
  });

  test('usa mock por defecto si AI_PROVIDER no está definido', () => {
    expect(createAIProvider().name).toBe('mock');
  });

  test('usa mock si AI_PROVIDER no es reconocido', () => {
    process.env.AI_PROVIDER = 'desconocido';
    expect(createAIProvider().name).toBe('mock');
  });

  test('AI_PROVIDER=groq sin GROQ_API_KEY cae a mock', () => {
    process.env.AI_PROVIDER = 'groq';
    expect(createAIProvider().name).toBe('mock');
  });

  test('AI_PROVIDER=groq con GROQ_API_KEY selecciona Groq (no distingue mayúsculas)', () => {
    process.env.AI_PROVIDER = 'GROQ';
    process.env.GROQ_API_KEY = 'test-key';
    expect(createAIProvider().name).toBe('groq');
  });

  test.each([
    ['claude', 'ANTHROPIC_API_KEY'],
    ['openai', 'OPENAI_API_KEY'],
  ])('AI_PROVIDER=%s (no implementado) usa mock y avisa, aunque %s esté configurada', (provider, key) => {
    process.env.AI_PROVIDER = provider;
    process.env[key] = 'test-key';
    expect(createAIProvider().name).toBe('mock');
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(`AI_PROVIDER=${provider} no está implementado`));
  });
});

describe('providers/mock.provider', () => {
  const provider = new MockAIProvider();
  const ctx = {
    user: { nombres: 'Ana' },
    stats: { totalFacturas: 3, facturasMes: 1, totalMonto: 1500000, totalIva: 285000 },
    facturas: [{ numero: 'F-1', proveedor: 'ACME', monto: 500000 }]
  };
  const ask = (content, context = ctx) => provider.chat([{ role: 'user', content }], context);

  beforeAll(() => {
    // Evitar la latencia simulada de 700ms
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => { fn(); return 0; });
  });
  afterAll(() => jest.restoreAllMocks());

  test('name es mock', () => expect(provider.name).toBe('mock'));

  test.each([
    ['llévame a facturación', 'facturacion'],
    ['facturas', 'facturacion'],
    ['abrir reportes', 'reportes'],
    ['llévame a reportes', 'reportes'],
    ['llevame al panel', 'panel'],
    ['ir al panel', 'panel'],
    ['ver mi perfil', 'perfil'],
    ['gestionar usuarios', 'usuarios'],
    ['mostrar aprobaciones', 'aprobaciones'],
  ])('"%s" navega a %s', async (msg, section) => {
    const r = await ask(msg);
    expect(r.action).toEqual({ type: 'navigate', payload: section });
  });

  test('responde cuántas facturas tiene el usuario (singular/plural)', async () => {
    const r = await ask('¿Cuántas facturas tengo?');
    expect(r.reply).toContain('3 facturas');
    expect(r.reply).toContain('1 factura**');
    expect(r.action).toBeUndefined();
  });

  test('responde el monto total e IVA acumulado en COP', async () => {
    const r = await ask('cuánto he facturado');
    expect(r.reply).toMatch(/1\.500\.000/);
    expect(r.reply).toMatch(/285\.000/);
  });

  test('lista las últimas facturas', async () => {
    const r = await ask('mis últimas facturas');
    expect(r.reply).toContain('F-1');
    expect(r.reply).toContain('ACME');
  });

  test('sin facturas sugiere ir a facturación', async () => {
    const r = await ask('facturas recientes', { ...ctx, facturas: [] });
    expect(r.reply).toMatch(/no tienes facturas/);
    expect(r.action).toEqual({ type: 'navigate', payload: 'facturacion' });
  });

  test.each([
    ['¿qué es el IVA?', /19%/],
    ['explícame la retefuente', /Retención en la Fuente/],
    ['tarifa del ICA', /Industria y Comercio/],
    ['qué es el PUC', /Plan Único de Cuentas/],
    ['naturaleza contable', /DÉBITO/],
  ])('tema contable "%s"', async (msg, expected) => {
    expect((await ask(msg)).reply).toMatch(expected);
  });

  test('guía para crear factura navega a facturación', async () => {
    const r = await ask('cómo crear una factura');
    expect(r.reply).toMatch(/Nueva Factura/);
    expect(r.action?.payload).toBe('facturacion');
  });

  test('saluda por nombre', async () => {
    expect((await ask('Hola')).reply).toMatch(/Hola, Ana/);
  });

  test('responde ayuda', async () => {
    expect((await ask('ayuda')).reply).toMatch(/Puedo ayudarte/);
  });

  test('mensaje desconocido devuelve respuesta por defecto', async () => {
    const r = await ask('xyz qwerty');
    expect(r.reply).toMatch(/Escribe \*\*"ayuda"\*\*/);
    expect(r.action).toBeUndefined();
  });

  test('usa el último mensaje del usuario, ignorando los del asistente', async () => {
    const r = await provider.chat([
      { role: 'user', content: 'hola' },
      { role: 'assistant', content: 'ir a reportes' },
      { role: 'user', content: 'qué es el PUC' },
    ], ctx);
    expect(r.reply).toMatch(/Plan Único de Cuentas/);
  });
});
