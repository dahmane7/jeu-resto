import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config();

// Mode MOCK : utiliser les données factices si USE_MOCK=true ou si Airtable n'est pas configuré
const USE_MOCK = process.env.USE_MOCK === 'true' || !process.env.AIRTABLE_API_KEY;

// Configuration Airtable (seulement si pas en mode MOCK)
let base: Airtable.Base | null = null;

if (!USE_MOCK) {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error('AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set in .env');
  }

  // Initialiser Airtable
  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: AIRTABLE_API_KEY,
  });

  base = Airtable.base(AIRTABLE_BASE_ID);
}

// Mapping des tables Airtable
export const TABLES = {
  RESTAURANTS: 'Restaurants',
  USERS: 'Users',
  CLIENTS: 'Clients',
  PRIZES: 'Prizes',
  PARTICIPATIONS: 'Participations',
  ANALYTICS: 'Analytics',
} as const;

// Types pour les enregistrements Airtable
export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime?: string;
}

// Helper pour convertir les enregistrements Airtable
export function mapAirtableRecord<T>(record: any): T {
  const mapped: any = {
    id: record.id,
    ...record.fields,
  };
  
  // Airtable stocke createdTime sur l'objet record
  if (record.createdTime) {
    mapped.created_at = record.createdTime;
  }
  
  return mapped as T;
}

// Helper pour convertir les données vers le format Airtable
export function mapToAirtableFields(data: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Ignorer les champs spéciaux
    if (key === 'id' || key === 'created_at' || key === 'updated_at') {
      continue;
    }
    
    // Convertir les dates en format ISO string
    if (value instanceof Date) {
      fields[key] = value.toISOString();
    } else if (value !== undefined && value !== null) {
      fields[key] = value;
    }
  }
  
  return fields;
}

// Service Airtable principal
export class AirtableService {
  private base: Airtable.Base | null;

  constructor() {
    this.base = base;
  }

  // Vérifier si Airtable est configuré
  private checkAirtable() {
    if (!this.base) {
      throw new Error('Airtable n\'est pas configuré. Utilisez le mode MOCK ou configurez AIRTABLE_API_KEY et AIRTABLE_BASE_ID.');
    }
  }

  // Méthode générique pour créer un enregistrement
  async create<T>(tableName: string, data: Record<string, any>): Promise<T> {
    this.checkAirtable();
    const fields = mapToAirtableFields(data);
    const [record] = await this.base!(tableName).create([{ fields }]);
    return mapAirtableRecord<T>(record);
  }

  // Méthode générique pour trouver un enregistrement par ID
  async findById<T>(tableName: string, id: string): Promise<T | null> {
    this.checkAirtable();
    try {
      const record = await this.base!(tableName).find(id);
      return mapAirtableRecord<T>(record);
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  // Méthode générique pour trouver un enregistrement par champ unique
  async findByField<T>(
    tableName: string,
    field: string,
    value: any
  ): Promise<T | null> {
    this.checkAirtable();
    const records = await this.base!(tableName)
      .select({
        filterByFormula: `{${field}} = "${value}"`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) {
      return null;
    }

    return mapAirtableRecord<T>(records[0]);
  }

  // Méthode générique pour trouver plusieurs enregistrements
  async findMany<T>(
    tableName: string,
    options?: {
      filterByFormula?: string;
      sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
      maxRecords?: number;
    }
  ): Promise<T[]> {
    const selectOptions: any = {};

    if (options?.filterByFormula) {
      selectOptions.filterByFormula = options.filterByFormula;
    }

    if (options?.sort) {
      selectOptions.sort = options.sort;
    }

    if (options?.maxRecords) {
      selectOptions.maxRecords = options.maxRecords;
    }

    this.checkAirtable();
    const records: T[] = [];
    await this.base!(tableName)
      .select(selectOptions)
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach((record) => {
          records.push(mapAirtableRecord<T>(record));
        });
        fetchNextPage();
      });

    return records;
  }

  // Méthode générique pour mettre à jour un enregistrement
  async update<T>(
    tableName: string,
    id: string,
    data: Partial<Record<string, any>>
  ): Promise<T> {
    this.checkAirtable();
    const fields = mapToAirtableFields(data);
    const record = await this.base!(tableName).update(id, fields);
    return mapAirtableRecord<T>(record);
  }

  // Méthode générique pour supprimer un enregistrement
  async delete(tableName: string, id: string): Promise<void> {
    this.checkAirtable();
    await this.base!(tableName).destroy(id);
  }

  // Méthode générique pour mettre à jour plusieurs enregistrements
  async updateMany(
    tableName: string,
    updates: Array<{ id: string; fields: Record<string, any> }>
  ): Promise<void> {
    const records = updates.map(({ id, fields }) => ({
      id,
      fields: mapToAirtableFields(fields),
    }));

    this.checkAirtable();
    // Airtable limite à 10 enregistrements par batch
    const batchSize = 10;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await this.base!(tableName).update(batch);
    }
  }
}

// Instance singleton
export const airtable = new AirtableService();

export default airtable;
