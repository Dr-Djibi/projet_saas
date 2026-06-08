import axios from 'axios';

export interface CinetPayInitResponse {
  code: string;
  message: string;
  data?: {
    payment_url: string;
    payment_token: string;
  };
}

export interface CinetPayCheckResponse {
  code: string;
  message: string;
  data?: {
    amount: string;
    currency: string;
    status: string;
    payment_method: string;
    description: string;
    metadata: string;
    operator_id: string;
    payment_date: string;
  };
}

export class CinetPayService {
  private static siteId = process.env.CINETPAY_SITE_ID;
  private static apiKey = process.env.CINETPAY_API_KEY;

  /**
   * Initialise une transaction CinetPay.
   */
  static async initTransaction(data: {
    amount: number;
    currency: string;
    transaction_id: string;
    description: string;
    customer_name: string;
    customer_surname: string;
    customer_email: string;
    customer_phone_number: string;
    return_url: string;
    notify_url: string;
    metadata?: string;
  }): Promise<CinetPayInitResponse> {
    const url = 'https://api-checkout.cinetpay.com/v2/payment';
    
    const payload = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: data.transaction_id,
      amount: data.amount,
      currency: data.currency,
      alternative_currency: "",
      description: data.description,
      customer_id: data.transaction_id, 
      customer_name: data.customer_name,
      customer_surname: data.customer_surname,
      customer_email: data.customer_email,
      customer_phone_number: data.customer_phone_number,
      customer_address: "BP 00",
      customer_city: "Abidjan",
      customer_country: "CI",
      customer_state: "CI",
      customer_zip_code: "00225",
      notify_url: data.notify_url,
      return_url: data.return_url,
      channels: "ALL",
      metadata: data.metadata || "user_payment",
      lang: "fr",
      print_receipt: true
    };

    try {
      const response = await axios.post(url, payload);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('CinetPay Init Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to initialize CinetPay transaction');
      }
      throw error;
    }
  }

  /**
   * Vérifie le statut d'une transaction.
   */
  static async checkStatus(transaction_id: string): Promise<CinetPayCheckResponse> {
    const url = 'https://api-checkout.cinetpay.com/v2/payment/check';
    const payload = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: transaction_id
    };

    try {
      const response = await axios.post(url, payload);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('CinetPay Check Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to check CinetPay transaction status');
      }
      throw error;
    }
  }
}
