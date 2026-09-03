import axios from 'axios';

/**
 * -----------------------------------------------------------------------------
 * Servicio de Integración FatSecret API
 * -----------------------------------------------------------------------------
 * PREPARACIÓN FASE 2: Conexión con platform.fatsecret.com para obtener
 * alimentos validados y reemplazar entradas manuales dentro de los Smart Blocks.
 * 
 * En esta fase de infraestructura, preparamos las interfaces y stubs.
 */

export interface FatSecretFood {
  food_id: string;
  food_name: string;
  food_type: 'Brand' | 'Generic';
  food_description: string; // ej: "Per 100g - Calories: 120kcal | Fat: 2g | Carbs: 20g | Protein: 5g"
}

interface FatSecretConfig {
  clientId: string;
  clientSecret: string;
  scope: string;
}

export class FatSecretService {
  private static instance: FatSecretService;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private constructor(private config: FatSecretConfig) {}

  public static getInstance(): FatSecretService {
    if (!FatSecretService.instance) {
      FatSecretService.instance = new FatSecretService({
        clientId: process.env.VITE_FATSECRET_CLIENT_ID || 'placeholder_client_id',
        clientSecret: process.env.VITE_FATSECRET_CLIENT_SECRET || 'placeholder_client_secret',
        scope: 'basic'
      });
    }
    return FatSecretService.instance;
  }

  /**
   * Autenticación OAuth 2.0 Client Credentials
   */
  private async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('[FATSECRET API] Obteniendo token OAUTH2...');
      // MOCK: En fase 2, aquí va la llamada real a https://oauth.fatsecret.com/connect/token
      this.accessToken = "mock_oauth_token_12345";
      this.tokenExpiry = Date.now() + 86400 * 1000; // 24h
      return this.accessToken;
    } catch (error) {
      console.error('[FATSECRET API] Error de Autenticación', error);
      throw error;
    }
  }

  /**
   * Búsqueda de alimentos por texto libre
   * endpoint: https://platform.fatsecret.com/rest/server.api
   */
  public async searchFood(query: string): Promise<FatSecretFood[]> {
    const token = await this.authenticate();
    
    console.log(`[FATSECRET API] Buscando: ${query} con token ${token.substring(0,5)}...`);
    
    // MOCK: Simulación de latencia de red de FatSecret
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            food_id: "33691",
            food_name: query || "Avena",
            food_type: "Generic",
            food_description: "Per 100g - Calories: 389kcal | Fat: 6.90g | Carbs: 66.27g | Protein: 16.89g"
          }
        ]);
      }, 350);
    });
  }
}

export const fatSecretClient = FatSecretService.getInstance();
