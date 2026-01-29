/**
 * Workflow Test Data Generator
 * Piano Emotion Manager
 */

/**
 * Genera datos de ejemplo según el tipo de trigger
 */
export function generateTestData(triggerType: string): any {
  const baseDate = new Date();
  const futureDate = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días

  switch (triggerType) {
    case 'client_created':
      return {
        client: {
          id: 9999,
          name: 'Cliente de Prueba',
          email: 'test@example.com',
          phone: '+34 600 123 456',
          address: 'Calle de Prueba, 123',
          city: 'Madrid',
          postalCode: '28001',
          notes: 'Cliente generado para testing de workflow',
          createdAt: baseDate.toISOString()
        },
        workflow: {
          id: 0,
          name: 'Test Workflow',
          executionId: 0
        },
        user: {
          id: 1,
          name: 'Usuario de Prueba',
          email: 'user@test.com',
          role: 'admin'
        }
      };

    case 'appointment_created':
      return {
        appointment: {
          id: 9999,
          clientId: 9999,
          pianoId: 9999,
          date: futureDate.toISOString().split('T')[0],
          time: '10:00',
          type: 'afinacion',
          status: 'programada',
          notes: 'Cita generada para testing de workflow',
          createdAt: baseDate.toISOString()
        },
        client: {
          id: 9999,
          name: 'Cliente de Prueba',
          email: 'test@example.com',
          phone: '+34 600 123 456'
        },
        piano: {
          id: 9999,
          brand: 'Yamaha',
          model: 'U1',
          serialNumber: 'TEST-12345'
        },
        workflow: {
          id: 0,
          name: 'Test Workflow',
          executionId: 0
        },
        user: {
          id: 1,
          name: 'Usuario de Prueba',
          email: 'user@test.com',
          role: 'admin'
        }
      };

    case 'service_completed':
      return {
        service: {
          id: 9999,
          clientId: 9999,
          pianoId: 9999,
          type: 'afinacion',
          date: baseDate.toISOString().split('T')[0],
          cost: 120.00,
          notes: 'Servicio completado para testing de workflow',
          status: 'completed',
          createdAt: baseDate.toISOString()
        },
        client: {
          id: 9999,
          name: 'Cliente de Prueba',
          email: 'test@example.com',
          phone: '+34 600 123 456'
        },
        piano: {
          id: 9999,
          brand: 'Yamaha',
          model: 'U1',
          serialNumber: 'TEST-12345'
        },
        workflow: {
          id: 0,
          name: 'Test Workflow',
          executionId: 0
        },
        user: {
          id: 1,
          name: 'Usuario de Prueba',
          email: 'user@test.com',
          role: 'admin'
        }
      };

    case 'invoice_due':
      const dueDate = new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000); // -1 día (vencida)
      return {
        invoice: {
          id: 9999,
          clientId: 9999,
          number: 'TEST-2024-001',
          amount: 250.00,
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'enviada',
          notes: 'Factura vencida para testing de workflow',
          createdAt: baseDate.toISOString()
        },
        client: {
          id: 9999,
          name: 'Cliente de Prueba',
          email: 'test@example.com',
          phone: '+34 600 123 456',
          address: 'Calle de Prueba, 123'
        },
        workflow: {
          id: 0,
          name: 'Test Workflow',
          executionId: 0
        },
        user: {
          id: 1,
          name: 'Usuario de Prueba',
          email: 'user@test.com',
          role: 'admin'
        }
      };

    case 'manual':
    default:
      return {
        workflow: {
          id: 0,
          name: 'Test Workflow',
          executionId: 0
        },
        user: {
          id: 1,
          name: 'Usuario de Prueba',
          email: 'user@test.com',
          role: 'admin'
        },
        testData: {
          message: 'Datos de prueba para workflow manual',
          timestamp: baseDate.toISOString()
        }
      };
  }
}

/**
 * Describe los datos de ejemplo disponibles para un tipo de trigger
 */
export function describeTestData(triggerType: string): string {
  switch (triggerType) {
    case 'client_created':
      return 'Cliente de prueba con ID 9999, nombre "Cliente de Prueba", email test@example.com';
    
    case 'appointment_created':
      return 'Cita de prueba programada para dentro de 7 días a las 10:00, tipo afinación';
    
    case 'service_completed':
      return 'Servicio de afinación completado hoy, costo €120.00';
    
    case 'invoice_due':
      return 'Factura TEST-2024-001 vencida ayer, monto €250.00';
    
    case 'manual':
    default:
      return 'Datos de prueba genéricos para workflow manual';
  }
}
