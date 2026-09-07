import User from '../models/User';
import Category from '../models/Category';
import Item from '../models/Item';
import StockEntry from '../models/StockEntry';
import StockExit from '../models/StockExit';
import { connectDB } from '../config/database';

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Item.deleteMany({});
        await StockEntry.deleteMany({});
        await StockExit.deleteMany({});

        console.log('🗑️ Cleared existing data');

        // Create admin user
        const adminUser = await User.create({
            name: 'Administrador',
            email: 'admin@inventory.com',
            password: 'admin123',
            role: 'admin'
        });

        // Create manager user
        const managerUser = await User.create({
            name: 'Manager',
            email: 'manager@inventory.com',
            password: 'manager123',
            role: 'manager'
        });

        // Create employee user
        const employeeUser = await User.create({
            name: 'Empleado',
            email: 'employee@inventory.com',
            password: 'employee123',
            role: 'employee'
        });

        console.log('👥 Created users');

        // Create categories
        const categories = await Category.create([
            {
                name: 'Herramientas Manuales',
                description: 'Herramientas de mano para uso general'
            },
            {
                name: 'Herramientas Eléctricas',
                description: 'Herramientas que requieren electricidad'
            },
            {
                name: 'Materiales de Construcción',
                description: 'Materiales básicos para construcción'
            },
            {
                name: 'Equipos de Seguridad',
                description: 'Equipos de protección personal'
            },
            {
                name: 'Suministros de Oficina',
                description: 'Materiales y suministros para oficina'
            },
            {
                name: 'Electrónica',
                description: 'Equipos y componentes electrónicos'
            },
            {
                name: 'Ferretería',
                description: 'Tornillos, tuercas, clavos y accesorios'
            },
            {
                name: 'Pinturas y Acabados',
                description: 'Pinturas, barnices y productos de acabado'
            },
            {
                name: 'Plomería',
                description: 'Tuberías, conexiones y accesorios de plomería'
            },
            {
                name: 'Jardinería',
                description: 'Herramientas y suministros para jardinería'
            }
        ]);

        console.log('📂 Created categories');

        // Create items with realistic inventory data
        const items = [
            // Herramientas Manuales
            {
                name: 'Martillo de Carpintero 16oz',
                description: 'Martillo de acero forjado con mango de fibra de vidrio',
                category: categories[0]._id,
                quantity: 25,
                minStock: 5,
                maxStock: 50,
                price: 59.90,
                currency: 'PEN',
                location: 'Almacén A - Estante 1A',
                barcode: '7501234567890',
                status: 'active'
            },
            {
                name: 'Destornillador Phillips #2',
                description: 'Destornillador Phillips punta magnética, mango ergonómico',
                category: categories[0]._id,
                quantity: 3,
                minStock: 10,
                maxStock: 30,
                price: 32.50,
                currency: 'PEN',
                location: 'Almacén A - Estante 1B',
                barcode: '7501234567891',
                status: 'active'
            },
            {
                name: 'Alicate Universal 8"',
                description: 'Alicate universal con aislamiento hasta 1000V',
                category: categories[0]._id,
                quantity: 18,
                minStock: 8,
                maxStock: 25,
                price: 78.90,
                currency: 'PEN',
                location: 'Almacén A - Estante 1C',
                barcode: '7501234567892',
                status: 'active'
            },
            {
                name: 'Llave Inglesa Ajustable 10"',
                description: 'Llave inglesa cromada con apertura hasta 32mm',
                category: categories[0]._id,
                quantity: 12,
                minStock: 6,
                maxStock: 20,
                price: 45.75,
                currency: 'PEN',
                location: 'Almacén A - Estante 1D',
                barcode: '7501234567893',
                status: 'active'
            },
            {
                name: 'Nivel de Burbuja 24"',
                description: 'Nivel de aluminio con 3 burbujas, precisión 0.5mm/m',
                category: categories[0]._id,
                quantity: 8,
                minStock: 4,
                maxStock: 15,
                price: 89.50,
                currency: 'PEN',
                location: 'Almacén A - Estante 2A',
                barcode: '7501234567894',
                status: 'active'
            },

            // Herramientas Eléctricas
            {
                name: 'Taladro Percutor 650W',
                description: 'Taladro percutor con mandril de 13mm, incluye maletín',
                category: categories[1]._id,
                quantity: 8,
                minStock: 3,
                maxStock: 15,
                price: 89.99,
                currency: 'USD',
                location: 'Almacén B - Estante 1A',
                barcode: '7501234567895',
                status: 'active'
            },
            {
                name: 'Sierra Circular 7¼" 1400W',
                description: 'Sierra circular con guía láser y freno eléctrico',
                category: categories[1]._id,
                quantity: 5,
                minStock: 2,
                maxStock: 10,
                price: 156.75,
                currency: 'USD',
                location: 'Almacén B - Estante 1B',
                barcode: '7501234567896',
                status: 'active'
            },
            {
                name: 'Amoladora Angular 4½" 900W',
                description: 'Amoladora con protector ajustable y mango auxiliar',
                category: categories[1]._id,
                quantity: 12,
                minStock: 5,
                maxStock: 18,
                price: 67.50,
                currency: 'USD',
                location: 'Almacén B - Estante 1C',
                barcode: '7501234567897',
                status: 'active'
            },
            {
                name: 'Lijadora Orbital 200W',
                description: 'Lijadora orbital con sistema de aspiración de polvo',
                category: categories[1]._id,
                quantity: 6,
                minStock: 3,
                maxStock: 12,
                price: 45.99,
                currency: 'USD',
                location: 'Almacén B - Estante 2A',
                barcode: '7501234567898',
                status: 'active'
            },

            // Materiales de Construcción
            {
                name: 'Cemento Portland Tipo I 42.5kg',
                description: 'Cemento Portland para uso general en construcción',
                category: categories[2]._id,
                quantity: 45,
                minStock: 20,
                maxStock: 100,
                price: 45.50,
                currency: 'PEN',
                location: 'Almacén C - Zona 1',
                barcode: '7501234567899',
                status: 'active'
            },
            {
                name: 'Ladrillo King Kong 18 Huecos',
                description: 'Ladrillo de arcilla cocida 24x13x9cm',
                category: categories[2]._id,
                quantity: 1200,
                minStock: 500,
                maxStock: 2000,
                price: 1.65,
                currency: 'PEN',
                location: 'Patio Exterior - Zona A',
                barcode: '7501234567900',
                status: 'active'
            },
            {
                name: 'Arena Gruesa m³',
                description: 'Arena gruesa lavada para concreto y mortero',
                category: categories[2]._id,
                quantity: 15,
                minStock: 8,
                maxStock: 25,
                price: 85.00,
                currency: 'PEN',
                location: 'Patio Exterior - Zona B',
                barcode: '7501234567901',
                status: 'active'
            },
            {
                name: 'Fierro Corrugado ½" x 9m',
                description: 'Varilla de acero corrugado grado 60',
                category: categories[2]._id,
                quantity: 180,
                minStock: 100,
                maxStock: 300,
                price: 28.75,
                currency: 'PEN',
                location: 'Patio Exterior - Zona C',
                barcode: '7501234567902',
                status: 'active'
            },

            // Equipos de Seguridad
            {
                name: 'Casco de Seguridad Blanco',
                description: 'Casco tipo jockey con barbiquejo ajustable',
                category: categories[3]._id,
                quantity: 15,
                minStock: 10,
                maxStock: 30,
                price: 69.90,
                currency: 'PEN',
                location: 'Almacén D - Estante 1A',
                barcode: '7501234567903',
                status: 'active'
            },
            {
                name: 'Guantes de Cuero Reforzados',
                description: 'Guantes de cuero con refuerzo en palma y dedos',
                category: categories[3]._id,
                quantity: 2,
                minStock: 20,
                maxStock: 50,
                price: 24.90,
                currency: 'PEN',
                location: 'Almacén D - Estante 1B',
                barcode: '7501234567904',
                status: 'active'
            },
            {
                name: 'Lentes de Seguridad Transparentes',
                description: 'Lentes con protección UV y anti-empañante',
                category: categories[3]._id,
                quantity: 35,
                minStock: 15,
                maxStock: 50,
                price: 18.50,
                currency: 'PEN',
                location: 'Almacén D - Estante 1C',
                barcode: '7501234567905',
                status: 'active'
            },
            {
                name: 'Chaleco Reflectivo Naranja',
                description: 'Chaleco con cintas reflectivas 3M, talla única',
                category: categories[3]._id,
                quantity: 22,
                minStock: 12,
                maxStock: 40,
                price: 32.90,
                currency: 'PEN',
                location: 'Almacén D - Estante 2A',
                barcode: '7501234567906',
                status: 'active'
            },

            // Suministros de Oficina
            {
                name: 'Papel Bond A4 75g 500 hojas',
                description: 'Resma de papel bond blanco para impresión',
                category: categories[4]._id,
                quantity: 25,
                minStock: 10,
                maxStock: 50,
                price: 18.50,
                currency: 'PEN',
                location: 'Oficina - Armario 1A',
                barcode: '7501234567907',
                status: 'active'
            },
            {
                name: 'Bolígrafos Pilot Azul Caja x12',
                description: 'Bolígrafos de tinta gel azul, punta 0.7mm',
                category: categories[4]._id,
                quantity: 8,
                minStock: 5,
                maxStock: 20,
                price: 12.00,
                currency: 'PEN',
                location: 'Oficina - Armario 1B',
                barcode: '7501234567908',
                status: 'active'
            },
            {
                name: 'Archivador A4 Lomo Ancho',
                description: 'Archivador de cartón forrado, lomo 7.5cm',
                category: categories[4]._id,
                quantity: 15,
                minStock: 8,
                maxStock: 25,
                price: 8.90,
                currency: 'PEN',
                location: 'Oficina - Armario 2A',
                barcode: '7501234567909',
                status: 'active'
            },

            // Electrónica
            {
                name: 'Multímetro Digital',
                description: 'Multímetro con pantalla LCD, rango automático',
                category: categories[5]._id,
                quantity: 4,
                minStock: 2,
                maxStock: 8,
                price: 125.00,
                currency: 'USD',
                location: 'Almacén E - Estante 1A',
                barcode: '7501234567910',
                status: 'active'
            },
            {
                name: 'Cable THW 12 AWG x 100m',
                description: 'Cable eléctrico THW calibre 12, color azul',
                category: categories[5]._id,
                quantity: 8,
                minStock: 4,
                maxStock: 15,
                price: 185.50,
                currency: 'PEN',
                location: 'Almacén E - Estante 1B',
                barcode: '7501234567911',
                status: 'active'
            },
            {
                name: 'Interruptor Termomagnético 20A',
                description: 'Breaker monopolar 20A, curva C',
                category: categories[5]._id,
                quantity: 12,
                minStock: 6,
                maxStock: 20,
                price: 45.90,
                currency: 'PEN',
                location: 'Almacén E - Estante 2A',
                barcode: '7501234567912',
                status: 'active'
            },

            // Ferretería
            {
                name: 'Tornillos Autorroscantes 8x1" Caja x100',
                description: 'Tornillos galvanizados para drywall',
                category: categories[6]._id,
                quantity: 45,
                minStock: 20,
                maxStock: 80,
                price: 15.75,
                currency: 'PEN',
                location: 'Almacén F - Gaveta 1A',
                barcode: '7501234567913',
                status: 'active'
            },
            {
                name: 'Clavos de Acero 3" x 1kg',
                description: 'Clavos de cabeza plana para construcción',
                category: categories[6]._id,
                quantity: 28,
                minStock: 15,
                maxStock: 50,
                price: 8.90,
                currency: 'PEN',
                location: 'Almacén F - Gaveta 1B',
                barcode: '7501234567914',
                status: 'active'
            },
            {
                name: 'Tuercas Hexagonales ½" x 50 unid',
                description: 'Tuercas galvanizadas rosca fina',
                category: categories[6]._id,
                quantity: 18,
                minStock: 10,
                maxStock: 30,
                price: 22.50,
                currency: 'PEN',
                location: 'Almacén F - Gaveta 2A',
                barcode: '7501234567915',
                status: 'active'
            },

            // Pinturas y Acabados
            {
                name: 'Pintura Látex Blanco 4L',
                description: 'Pintura látex lavable para interiores',
                category: categories[7]._id,
                quantity: 12,
                minStock: 6,
                maxStock: 25,
                price: 89.90,
                currency: 'PEN',
                location: 'Almacén G - Estante 1A',
                barcode: '7501234567916',
                status: 'active'
            },
            {
                name: 'Barniz Marino Transparente 1L',
                description: 'Barniz poliuretano para exteriores',
                category: categories[7]._id,
                quantity: 8,
                minStock: 4,
                maxStock: 15,
                price: 65.50,
                currency: 'PEN',
                location: 'Almacén G - Estante 1B',
                barcode: '7501234567917',
                status: 'active'
            },
            {
                name: 'Rodillo de Lana 9" con Bandeja',
                description: 'Kit de rodillo con bandeja plástica',
                category: categories[7]._id,
                quantity: 15,
                minStock: 8,
                maxStock: 25,
                price: 28.90,
                currency: 'PEN',
                location: 'Almacén G - Estante 2A',
                barcode: '7501234567918',
                status: 'active'
            },

            // Plomería
            {
                name: 'Tubo PVC 4" x 3m Desagüe',
                description: 'Tubo PVC para desagüe, unión campana',
                category: categories[8]._id,
                quantity: 25,
                minStock: 12,
                maxStock: 40,
                price: 35.75,
                currency: 'PEN',
                location: 'Almacén H - Zona 1',
                barcode: '7501234567919',
                status: 'active'
            },
            {
                name: 'Codo PVC ½" x 90°',
                description: 'Codo de PVC roscado para agua fría',
                category: categories[8]._id,
                quantity: 85,
                minStock: 40,
                maxStock: 120,
                price: 3.25,
                currency: 'PEN',
                location: 'Almacén H - Gaveta 1A',
                barcode: '7501234567920',
                status: 'active'
            },
            {
                name: 'Válvula de Compuerta ¾"',
                description: 'Válvula de bronce con volante',
                category: categories[8]._id,
                quantity: 6,
                minStock: 4,
                maxStock: 12,
                price: 78.90,
                currency: 'PEN',
                location: 'Almacén H - Estante 1A',
                barcode: '7501234567921',
                status: 'active'
            },

            // Jardinería
            {
                name: 'Pala Punta Mango Largo',
                description: 'Pala de acero con mango de madera 120cm',
                category: categories[9]._id,
                quantity: 8,
                minStock: 4,
                maxStock: 15,
                price: 45.90,
                currency: 'PEN',
                location: 'Almacén I - Zona 1',
                barcode: '7501234567922',
                status: 'active'
            },
            {
                name: 'Manguera de Jardín ½" x 15m',
                description: 'Manguera flexible con conectores incluidos',
                category: categories[9]._id,
                quantity: 12,
                minStock: 6,
                maxStock: 20,
                price: 68.50,
                currency: 'PEN',
                location: 'Almacén I - Estante 1A',
                barcode: '7501234567923',
                status: 'active'
            },
            {
                name: 'Fertilizante NPK 20-20-20 x 1kg',
                description: 'Fertilizante granulado balanceado',
                category: categories[9]._id,
                quantity: 0,
                minStock: 10,
                maxStock: 30,
                price: 25.90,
                currency: 'PEN',
                location: 'Almacén I - Estante 2A',
                barcode: '7501234567924',
                status: 'active'
            },

            // Productos con diferentes estados
            {
                name: 'Soldadora Inverter 200A',
                description: 'Soldadora eléctrica portátil con accesorios',
                category: categories[1]._id,
                quantity: 3,
                minStock: 2,
                maxStock: 6,
                price: 450.00,
                currency: 'USD',
                location: 'Almacén B - Estante 3A',
                barcode: '7501234567925',
                status: 'inactive'
            },
            {
                name: 'Compresor de Aire 50L',
                description: 'Compresor de aire 2HP, tanque 50 litros',
                category: categories[1]._id,
                quantity: 1,
                minStock: 1,
                maxStock: 3,
                price: 680.00,
                currency: 'USD',
                location: 'Almacén B - Zona Especial',
                barcode: '7501234567926',
                status: 'discontinued'
            }
        ];

        const createdItems = await Item.create(items);

        console.log('📦 Created items');

        // Create stock entries (historical data)
        const stockEntries = [
            // Entradas del mes pasado
            {
                item: createdItems[0]._id, // Martillo
                quantity: 50,
                unitCost: 55.00,
                supplier: 'Ferretería Central SAC',
                reason: 'purchase',
                notes: 'Compra inicial de inventario',
                createdBy: adminUser._id,
                createdAt: new Date('2024-11-15T10:30:00Z')
            },
            {
                item: createdItems[1]._id, // Destornillador
                quantity: 30,
                unitCost: 30.00,
                supplier: 'Herramientas del Norte EIRL',
                reason: 'purchase',
                notes: 'Reposición de stock',
                createdBy: managerUser._id,
                createdAt: new Date('2024-11-18T14:15:00Z')
            },
            {
                item: createdItems[5]._id, // Taladro
                quantity: 15,
                unitCost: 85.00,
                supplier: 'Importadora Técnica SA',
                reason: 'purchase',
                notes: 'Nuevos taladros con garantía extendida',
                createdBy: adminUser._id,
                createdAt: new Date('2024-11-20T09:45:00Z')
            },
            {
                item: createdItems[9]._id, // Cemento
                quantity: 100,
                unitCost: 42.50,
                supplier: 'Cementos Lima SA',
                reason: 'purchase',
                notes: 'Compra al por mayor con descuento',
                createdBy: managerUser._id,
                createdAt: new Date('2024-11-22T11:20:00Z')
            },
            {
                item: createdItems[10]._id, // Ladrillos
                quantity: 2000,
                unitCost: 1.50,
                supplier: 'Ladrillera San Martín',
                reason: 'purchase',
                notes: 'Stock para temporada alta',
                createdBy: adminUser._id,
                createdAt: new Date('2024-11-25T08:00:00Z')
            },

            // Entradas de este mes
            {
                item: createdItems[13]._id, // Casco
                quantity: 25,
                unitCost: 65.00,
                supplier: 'Seguridad Industrial Perú',
                reason: 'purchase',
                notes: 'Cascos con certificación internacional',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-12-02T13:30:00Z')
            },
            {
                item: createdItems[14]._id, // Guantes
                quantity: 50,
                unitCost: 22.00,
                supplier: 'EPP Solutions SAC',
                reason: 'purchase',
                notes: 'Guantes reforzados para trabajo pesado',
                createdBy: managerUser._id,
                createdAt: new Date('2024-12-05T10:15:00Z')
            },
            {
                item: createdItems[17]._id, // Papel A4
                quantity: 50,
                unitCost: 17.50,
                supplier: 'Papelería Moderna EIRL',
                reason: 'purchase',
                notes: 'Papel de alta calidad para impresión',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-12-08T16:45:00Z')
            },
            {
                item: createdItems[2]._id, // Alicate
                quantity: 20,
                unitCost: 75.00,
                supplier: 'Herramientas Profesionales SA',
                reason: 'purchase',
                notes: 'Alicates con certificación eléctrica',
                createdBy: adminUser._id,
                createdAt: new Date('2024-12-10T09:20:00Z')
            },
            {
                item: createdItems[1]._id, // Destornillador
                quantity: 15,
                unitCost: 32.50,
                supplier: 'Ferretería Central SAC',
                reason: 'return',
                notes: 'Devolución de cliente por cambio de especificación',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-12-12T11:30:00Z')
            },

            // Entradas recientes
            {
                item: createdItems[22]._id, // Tornillos
                quantity: 100,
                unitCost: 14.50,
                supplier: 'Ferretería Industrial Lima',
                reason: 'purchase',
                notes: 'Tornillos galvanizados de alta resistencia',
                createdBy: managerUser._id,
                createdAt: new Date('2024-12-15T14:00:00Z')
            },
            {
                item: createdItems[25]._id, // Pintura
                quantity: 30,
                unitCost: 85.00,
                supplier: 'Pinturas Premium SAC',
                reason: 'purchase',
                notes: 'Pintura látex premium con garantía de cobertura',
                createdBy: adminUser._id,
                createdAt: new Date('2024-12-18T10:45:00Z')
            },
            {
                item: createdItems[11]._id, // Arena
                quantity: 25,
                unitCost: 80.00,
                supplier: 'Agregados del Centro',
                reason: 'purchase',
                notes: 'Arena lavada y cernida',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-12-20T08:30:00Z')
            },
            {
                item: createdItems[4]._id, // Nivel
                quantity: 5,
                unitCost: 85.00,
                supplier: 'Instrumentos de Precisión SA',
                reason: 'adjustment',
                notes: 'Ajuste por diferencia en inventario físico',
                createdBy: managerUser._id,
                createdAt: new Date('2024-12-21T15:20:00Z')
            }
        ];

        await StockEntry.create(stockEntries);
        console.log('📈 Created stock entries');

        // Create stock exits (historical data)
        const stockExits = [
            // Salidas del mes pasado
            {
                item: createdItems[0]._id, // Martillo
                quantity: 25,
                unitCost: 59.90,
                destination: 'Constructora ABC SAC',
                reason: 'sale',
                notes: 'Venta para proyecto residencial',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-11-16T11:00:00Z')
            },
            {
                item: createdItems[1]._id, // Destornillador
                quantity: 12,
                unitCost: 32.50,
                destination: 'Taller Mecánico El Rápido',
                reason: 'sale',
                notes: 'Venta al por menor',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-11-19T14:30:00Z')
            },
            {
                item: createdItems[5]._id, // Taladro
                quantity: 7,
                unitCost: 89.99,
                destination: 'Empresa de Remodelaciones XYZ',
                reason: 'sale',
                notes: 'Venta con descuento por volumen',
                createdBy: managerUser._id,
                createdAt: new Date('2024-11-23T10:15:00Z')
            },
            {
                item: createdItems[9]._id, // Cemento
                quantity: 55,
                unitCost: 45.50,
                destination: 'Obra Residencial Los Pinos',
                reason: 'sale',
                notes: 'Entrega directa en obra',
                createdBy: adminUser._id,
                createdAt: new Date('2024-11-26T07:45:00Z')
            },
            {
                item: createdItems[10]._id, // Ladrillos
                quantity: 800,
                unitCost: 1.65,
                destination: 'Constructora Moderna EIRL',
                reason: 'sale',
                notes: 'Venta para construcción de viviendas',
                createdBy: managerUser._id,
                createdAt: new Date('2024-11-28T09:20:00Z')
            },

            // Salidas de este mes
            {
                item: createdItems[13]._id, // Casco
                quantity: 10,
                unitCost: 69.90,
                destination: 'Minera del Sur SA',
                reason: 'sale',
                notes: 'Cascos para personal de seguridad',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-12-03T13:45:00Z')
            },
            {
                item: createdItems[14]._id, // Guantes
                quantity: 48,
                unitCost: 24.90,
                destination: 'Fábrica Textil Lima Norte',
                reason: 'sale',
                notes: 'Guantes para operarios de producción',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-12-06T11:20:00Z')
            },
            {
                item: createdItems[17]._id, // Papel A4
                quantity: 25,
                unitCost: 18.50,
                destination: 'Oficinas Administrativas del Estado',
                reason: 'sale',
                notes: 'Venta institucional con facturación especial',
                createdBy: managerUser._id,
                createdAt: new Date('2024-12-09T15:30:00Z')
            },
            {
                item: createdItems[2]._id, // Alicate
                quantity: 2,
                unitCost: 78.90,
                destination: 'Taller Eléctrico Voltaje',
                reason: 'sale',
                notes: 'Venta de herramientas especializadas',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-12-11T10:45:00Z')
            },
            {
                item: createdItems[6]._id, // Sierra Circular
                quantity: 1,
                unitCost: 156.75,
                destination: 'Carpintería San José',
                reason: 'sale',
                notes: 'Sierra para trabajos de precisión',
                createdBy: managerUser._id,
                createdAt: new Date('2024-12-13T14:15:00Z')
            },

            // Salidas por otros motivos
            {
                item: createdItems[18]._id, // Bolígrafos
                quantity: 2,
                unitCost: 12.00,
                destination: 'N/A',
                reason: 'damage',
                notes: 'Caja dañada durante transporte',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-12-14T16:00:00Z')
            },
            {
                item: createdItems[32]._id, // Fertilizante (ya en 0)
                quantity: 30,
                unitCost: 25.90,
                destination: 'Vivero Municipal',
                reason: 'sale',
                notes: 'Última venta antes de agotarse',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-12-16T09:30:00Z')
            },
            {
                item: createdItems[22]._id, // Tornillos
                quantity: 55,
                unitCost: 15.75,
                destination: 'Empresa de Drywall Profesional',
                reason: 'sale',
                notes: 'Tornillos para instalación de drywall',
                createdBy: managerUser._id,
                createdAt: new Date('2024-12-17T11:45:00Z')
            },
            {
                item: createdItems[25]._id, // Pintura
                quantity: 18,
                unitCost: 89.90,
                destination: 'Proyecto Inmobiliario Vista Hermosa',
                reason: 'sale',
                notes: 'Pintura para acabados interiores',
                createdBy: adminUser._id,
                createdAt: new Date('2024-12-19T13:20:00Z')
            },
            {
                item: createdItems[11]._id, // Arena
                quantity: 10,
                unitCost: 85.00,
                destination: 'Obra Menor Residencial',
                reason: 'sale',
                notes: 'Arena para mezcla de concreto',
                createdBy: employeeUser._id,
                createdAt: new Date('2024-12-21T08:15:00Z')
            }
        ];

        await StockExit.create(stockExits);
        console.log('📉 Created stock exits');
        console.log('✅ Seed data created successfully!');
        console.log('\n📋 Test Users:');
        console.log('Admin: admin@inventory.com / admin123');
        console.log('Manager: manager@inventory.com / manager123');
        console.log('Employee: employee@inventory.com / employee123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    seedData();
}

export default seedData;