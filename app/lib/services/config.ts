export class ConfigService {
    static getQuidaxConfig() {
      // Server-side environment variables
      const serverApiKey = process.env.QUIDAX_SECRET_KEY;
      // Client-side environment variables
      const clientApiKey = process.env.NEXT_PUBLIC_QUIDAX_SECRET_KEY;
      
      const apiKey = serverApiKey || clientApiKey;
      const apiUrl = process.env.NEXT_PUBLIC_QUIDAX_API_URL;
      const webhookSecret = process.env.QUIDAX_WEBHOOK_SECRET;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
      // Debug logging
      console.debug('Quidax Config:', {
        hasServerApiKey: !!serverApiKey,
        hasClientApiKey: !!clientApiKey,
        apiUrl,
        hasWebhookSecret: !!webhookSecret,
        appUrl,
        envKeys: Object.keys(process.env).filter(key => key.includes('QUIDAX'))
      });
  
      if (!apiKey) {
        console.error('Missing Quidax API key. Available env vars:', 
          Object.keys(process.env).filter(key => key.includes('QUIDAX'))
        );
        throw new Error('Missing Quidax API key');
      }
  
      return {
        apiKey,
        apiUrl: apiUrl || 'https://api.quidax.com/v1',
        webhookSecret,
        appUrl: appUrl || 'http://localhost:3000'
      };
    }
  }