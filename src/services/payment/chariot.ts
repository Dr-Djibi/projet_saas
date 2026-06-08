import axios from 'axios';

export interface ChariotPaymentResponse {
  status: string;
  message: string;
  data?: {
    payment_url: string;
    reference: string;
  };
}

/**
 * Service pour la passerelle de paiement Chariot.
 */
export class ChariotService {
  private static apiToken = process.env.CHARIOT_API_TOKEN;
  private static baseUrl = process.env.CHARIOT_BASE_URL || 'https://api.chariotpay.com/v1';

  static async createPayment(data: {
    amount: number;
    currency: string;
    external_id: string;
    payer_phone: string;
    callback_url: string;
    description?: string;
  }): Promise<ChariotPaymentResponse> {
    const payload = {
      amount: data.amount,
      currency: data.currency,
      external_id: data.external_id,
      payer_phone: data.payer_phone,
      callback_url: data.callback_url,
      description: data.description || 'Paiement Menma Bot',
    };

    try {
      const response = await axios.post(`${this.baseUrl}/payments`, payload, {
        headers: { 
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Chariot Create Payment Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create Chariot payment');
      }
      throw error;
    }
  }

  static async getPaymentStatus(paymentId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${this.apiToken}` }
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Chariot Get Status Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to get Chariot payment status');
      }
      throw error;
    }
  }
}
