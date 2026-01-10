export interface ProductMemory {
  display_name: string;
  tare: number;
  usage_count: number;
  last_used_at: number;
}

export interface SupplierMemory {
  display_name: string;
  last_product_slug: string;
  products: Record<string, ProductMemory>;
}

export interface Database {
  suppliers: Record<string, SupplierMemory>;
}

const STORAGE_KEY = 'conferente_learning_db';

// Helper to normalize strings (remove accents, lowercase)
const normalize = (str: string) => 
  str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const getDB = (): Database => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { suppliers: {} };
  } catch (e) {
    return { suppliers: {} };
  }
};

const saveDB = (db: Database) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const learn = (supplier: string, product: string, tare: number) => {
  if (!supplier || !product) return;

  const db = getDB();
  const supplierSlug = normalize(supplier);
  const productSlug = normalize(product);

  // Initialize Supplier if new
  if (!db.suppliers[supplierSlug]) {
    db.suppliers[supplierSlug] = {
      display_name: supplier,
      last_product_slug: '',
      products: {}
    };
  }

  // Update Supplier Metadata
  db.suppliers[supplierSlug].display_name = supplier; // Keep most recent casing
  db.suppliers[supplierSlug].last_product_slug = productSlug;

  // Initialize/Update Product
  const currentProduct = db.suppliers[supplierSlug].products[productSlug];
  
  db.suppliers[supplierSlug].products[productSlug] = {
    display_name: product,
    tare: tare,
    usage_count: (currentProduct?.usage_count || 0) + 1,
    last_used_at: Date.now()
  };

  saveDB(db);
  console.log(`[Learning] Learned: ${supplier} -> ${product} = Tare ${tare}kg`);
};

export const predict = (supplier: string): { product: string; tare: number } | null => {
  if (!supplier) return null;

  const db = getDB();
  const supplierSlug = normalize(supplier);
  const supplierData = db.suppliers[supplierSlug];

  if (!supplierData || !supplierData.last_product_slug) return null;

  const lastProductSlug = supplierData.last_product_slug;
  const productData = supplierData.products[lastProductSlug];

  if (productData) {
    return {
      product: productData.display_name,
      tare: productData.tare
    };
  }

  return null;
};

// Allow looking up specific product for a supplier (if user types product manually)
export const predictProductTare = (supplier: string, product: string): number | null => {
  if (!supplier || !product) return null;
  
  const db = getDB();
  const supplierSlug = normalize(supplier);
  const productSlug = normalize(product);
  
  const productData = db.suppliers[supplierSlug]?.products[productSlug];
  return productData ? productData.tare : null;
};

// --- NEW FUNCTIONS FOR AUTO-COMPLETION ---

export const getKnownSuppliers = (): string[] => {
  const db = getDB();
  // Return array of display names, sorted alphabetically
  return Object.values(db.suppliers)
    .map(s => s.display_name)
    .sort();
};

export const getKnownProducts = (): string[] => {
  const db = getDB();
  const allProducts = new Set<string>();
  
  Object.values(db.suppliers).forEach(supplier => {
    Object.values(supplier.products).forEach(product => {
      allProducts.add(product.display_name);
    });
  });

  return Array.from(allProducts).sort();
};

// Nueva función: Detectar si hay tara para este producto de otro fornecedor
export interface TareWarning {
  supplier: string;
  tare: number;
  usageCount: number;
  message: string;
}

export const checkOtherSupplierTare = (currentSupplier: string, product: string): TareWarning | null => {
  if (!currentSupplier || !product) return null;
  
  const db = getDB();
  const currentSupplierSlug = normalize(currentSupplier);
  const productSlug = normalize(product);
  
  // Buscar en todos los fornecedores si hay este producto con tara diferente
  let foundTare: { supplier: string; tare: number; usageCount: number } | null = null;
  
  Object.entries(db.suppliers).forEach(([supplierSlug, supplierData]) => {
    // Ignorar el fornecedor actual
    if (supplierSlug === currentSupplierSlug) return;
    
    const productData = supplierData.products[productSlug];
    if (productData && productData.tare > 0) {
      // Si encontramos una tara y es la primera, o si tiene más uso, la preferimos
      if (!foundTare || productData.usage_count > foundTare.usageCount) {
        foundTare = {
          supplier: supplierData.display_name,
          tare: productData.tare,
          usageCount: productData.usage_count
        };
      }
    }
  });
  
  if (foundTare) {
    // Verificar si el fornecedor actual ya tiene este producto con tara diferente
    const currentProductData = db.suppliers[currentSupplierSlug]?.products[productSlug];
    const hasCurrentTare = currentProductData && currentProductData.tare > 0;
    const tareDiffers = hasCurrentTare && Math.abs(currentProductData.tare - foundTare.tare) > 0.001;
    
    if (!hasCurrentTare) {
      // No hay tara para este fornecedor, pero otro fornecedor sí tiene
      return {
        ...foundTare,
        message: `Existe uma tara registrada para "${product}" de "${foundTare.supplier}" (${(foundTare.tare * 1000).toFixed(0)}g). Deseja usar esta tara ou definir uma nova?`
      };
    } else if (tareDiffers) {
      // Hay tara diferente de otro fornecedor
      return {
        ...foundTare,
        message: `Atenção: A tara para "${product}" de "${foundTare.supplier}" é ${(foundTare.tare * 1000).toFixed(0)}g, mas você tem ${(currentProductData.tare * 1000).toFixed(0)}g para este fornecedor. As taras podem variar por fornecedor. Deseja atualizar para ${(foundTare.tare * 1000).toFixed(0)}g?`
      };
    }
  }
  
  return null;
};

// Nueva función: Obtener todas las taras de un producto de diferentes fornecedores
export interface ProductTareInfo {
  supplier: string;
  tare: number;
  usageCount: number;
  lastUsed: number;
}

export const getAllProductTares = (product: string): ProductTareInfo[] => {
  if (!product) return [];
  
  const db = getDB();
  const productSlug = normalize(product);
  const tares: ProductTareInfo[] = [];
  
  Object.values(db.suppliers).forEach(supplierData => {
    const productData = supplierData.products[productSlug];
    if (productData && productData.tare > 0) {
      tares.push({
        supplier: supplierData.display_name,
        tare: productData.tare,
        usageCount: productData.usage_count,
        lastUsed: productData.last_used_at
      });
    }
  });
  
  // Ordenar por uso más reciente
  return tares.sort((a, b) => b.lastUsed - a.lastUsed);
};

// Función mejorada para predecir tara de producto+fornecedor específico
export const predictTareForSupplierProduct = (supplier: string, product: string): number | null => {
  return predictProductTare(supplier, product);
};

// Actualizar tara confirmada (se vuelve predeterminada para ese fornecedor+producto)
export const confirmTare = (supplier: string, product: string, tare: number) => {
  learn(supplier, product, tare);
  console.log(`[Learning] Tare confirmed: ${supplier} -> ${product} = ${tare}kg (now default)`);
};