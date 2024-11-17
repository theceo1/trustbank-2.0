import { DOJAH_API_KEY, DOJAH_API_SECRET, DOJAH_APP_ID } from '@/app/lib/config';

const DOJAH_BASE_URL = 'https://api.dojah.io/api/v1';

const headers = {
  'Authorization': `Bearer ${DOJAH_API_SECRET}`,
  'AppId': DOJAH_APP_ID,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export const DojahService = {
  verifyBasicInfo: async (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
  }) => {
    const response = await fetch(`${DOJAH_BASE_URL}/kyc/basic`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to verify basic information');
    }

    return response.json();
  },

  verifyGovernmentID: async (data: {
    idType: string;
    idNumber: string;
    documentUrl: string;
  }) => {
    const response = await fetch(`${DOJAH_BASE_URL}/kyc/id`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to verify government ID');
    }

    return response.json();
  },

  verifyIncome: async (data: {
    employerName: string;
    annualIncome: string;
    documentUrls: string[];
  }) => {
    const response = await fetch(`${DOJAH_BASE_URL}/kyc/income`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to verify income information');
    }

    return response.json();
  },
};