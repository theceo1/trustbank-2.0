export class ConfigService {
    static getQuidaxConfig() {
      const apiUrl = process.env.NEXT_PUBLIC_QUIDAX_API_URL;
      const secretKey = process.env.QUIDAX_SECRET_KEY;
      const publicKey = process.env.QUIDAX_PUBLIC_KEY;
  
      if (!apiUrl || !secretKey || !publicKey) {
        console.error('Config values:', { apiUrl, secretKey, publicKey });
        throw new Error('Missing Quidax configuration');
      }
  
      return {
        apiUrl: apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl,
        apiKey: secretKey
      };
    }
  }