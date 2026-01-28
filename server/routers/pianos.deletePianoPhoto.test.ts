import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pianosRouter } from './pianos.router';
import { getDb } from '../db';

// Mock de storage
vi.mock('../storage', () => ({
  storageDelete: vi.fn().mockResolvedValue({ success: true }),
}));

describe('pianos.deletePianoPhoto', () => {
  beforeEach(async () => {
    const db = await getDb();
    
    // Limpiar datos de prueba
    await db.execute('DELETE FROM pianos WHERE brand = "TestBrand"');
    
    // Insertar piano de prueba con fotos
    await db.execute(`
      INSERT INTO pianos (brand, model, serialNumber, pianoType, category, photos, partnerId, organizationId)
      VALUES (
        'TestBrand',
        'TestModel',
        'TEST123',
        'vertical',
        'vertical',
        '["https://storage.example.com/pianos/1/photo1.jpg", "https://storage.example.com/pianos/1/photo2.jpg"]',
        1,
        'test-org'
      )
    `);
  });

  it('debe eliminar una foto del piano correctamente', async () => {
    const db = await getDb();
    
    // Obtener el piano de prueba
    const [piano] = await db.execute('SELECT * FROM pianos WHERE brand = "TestBrand"');
    const pianoId = piano.id;
    
    const caller = pianosRouter.createCaller({});
    
    const result = await caller.deletePianoPhoto({
      pianoId,
      photoUrl: 'https://storage.example.com/pianos/1/photo1.jpg',
    });
    
    expect(result.success).toBe(true);
    
    // Verificar que la foto se eliminó del array
    const [updatedPiano] = await db.execute(`SELECT * FROM pianos WHERE id = ${pianoId}`);
    const photos = JSON.parse(updatedPiano.photos);
    expect(photos).toHaveLength(1);
    expect(photos[0]).toBe('https://storage.example.com/pianos/1/photo2.jpg');
  });

  it('debe eliminar todas las fotos y establecer photos a null', async () => {
    const db = await getDb();
    
    // Obtener el piano de prueba
    const [piano] = await db.execute('SELECT * FROM pianos WHERE brand = "TestBrand"');
    const pianoId = piano.id;
    
    const caller = pianosRouter.createCaller({});
    
    // Eliminar primera foto
    await caller.deletePianoPhoto({
      pianoId,
      photoUrl: 'https://storage.example.com/pianos/1/photo1.jpg',
    });
    
    // Eliminar segunda foto
    await caller.deletePianoPhoto({
      pianoId,
      photoUrl: 'https://storage.example.com/pianos/1/photo2.jpg',
    });
    
    // Verificar que photos es null
    const [updatedPiano] = await db.execute(`SELECT * FROM pianos WHERE id = ${pianoId}`);
    expect(updatedPiano.photos).toBeNull();
  });

  it('debe lanzar error si el piano no existe', async () => {
    const caller = pianosRouter.createCaller({});
    
    await expect(
      caller.deletePianoPhoto({
        pianoId: 99999,
        photoUrl: 'https://storage.example.com/pianos/99999/photo1.jpg',
      })
    ).rejects.toThrow('Piano not found');
  });

  it('debe continuar aunque falle la eliminación de R2', async () => {
    const { storageDelete } = await import('../storage');
    vi.mocked(storageDelete).mockRejectedValueOnce(new Error('R2 error'));
    
    const db = await getDb();
    const [piano] = await db.execute('SELECT * FROM pianos WHERE brand = "TestBrand"');
    const pianoId = piano.id;
    
    const caller = pianosRouter.createCaller({});
    
    // Debe completarse exitosamente aunque falle R2
    const result = await caller.deletePianoPhoto({
      pianoId,
      photoUrl: 'https://storage.example.com/pianos/1/photo1.jpg',
    });
    
    expect(result.success).toBe(true);
    
    // Verificar que la foto se eliminó del array en BD
    const [updatedPiano] = await db.execute(`SELECT * FROM pianos WHERE id = ${pianoId}`);
    const photos = JSON.parse(updatedPiano.photos);
    expect(photos).toHaveLength(1);
  });

  it('debe manejar correctamente URLs con diferentes formatos', async () => {
    const db = await getDb();
    const [piano] = await db.execute('SELECT * FROM pianos WHERE brand = "TestBrand"');
    const pianoId = piano.id;
    
    const caller = pianosRouter.createCaller({});
    
    // URL con query params
    const result = await caller.deletePianoPhoto({
      pianoId,
      photoUrl: 'https://storage.example.com/pianos/1/photo1.jpg?v=123',
    });
    
    expect(result.success).toBe(true);
  });
});
