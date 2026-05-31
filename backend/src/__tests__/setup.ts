/**
 * Variables de entorno para el entorno de test. Permiten que env.ts valide
 * correctamente sin depender de un .env real ni de una base de datos viva
 * (los tests usan dobles de repositorio).
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?schema=public';
process.env.JWT_SECRET = 'test-secret-de-prueba-suficientemente-largo';
process.env.CORS_ORIGIN = 'http://localhost:5173';
