export class ConfigService {
    static getQuidaxConfig() {
      const apiKey = process.env.QUIDAX_API_KEY;
      const apiUrl = process.env.QUIDAX_API_URL;
  
      if (!apiKey || !apiUrl) {
        throw new Error('Missing Quidax configuration');
      }
  
      return {
        apiKey,
        apiUrl
      };
    }
  }