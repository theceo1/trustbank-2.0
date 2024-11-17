export class ConfigService {
    static getQuidaxConfig() {
      const apiKey = process.env.QUIDAX_SECRET_KEY;
      const publicKey = process.env.QUIDAX_PUBLIC_KEY;
      const apiUrl = process.env.NEXT_PUBLIC_QUIDAX_API_URL;
  
      if (!apiKey || !publicKey || !apiUrl) {
        throw new Error('Missing Quidax configuration');
      }
  
      return {
        apiKey,
        publicKey,
        apiUrl
      };
    }
  }