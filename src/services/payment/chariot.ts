import axios from 'axios';

/**
 * Service pour la passerelle de paiement Chariot.
 * Note: À adapter selon la documentation spécifique de Chariot API.
 */
export class ChariotService {
  private static apiToken = process.env.CHARIOT_API_TOKEN;
  private static baseUrl = 'https://api.chariotpay.com/v1'; // URL d'exemple

  static async createPayment(data: {
    amount: number;
    currency: string;
    external_id: string;
    payer_phone: string;
    callback_url: string;
  }) {
    const payload = {
      amount: data.amount,
      currency: data.currency,
      external_id: data.external_id,
      payer_phone: data.payer_phone,
      callback_url: data.callback_url,
    };

    const response = await axios.post(`${this.baseUrl}/payments`, payload, {
      headers: { 'Authorization': `Bearer ${this.apiToken}` }
    });

    return response.data;
  }

  static async getPaymentStatus(paymentId: string) {
    const response = await axios.get(`${this.baseUrl}/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${this.apiToken}` }
    });
    return response.data;
  }
}
