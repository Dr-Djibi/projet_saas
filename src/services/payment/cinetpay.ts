import axios from 'axios';

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
  }) {
    const url = 'https://api-checkout.cinetpay.com/v2/payment';
    
    const payload = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: data.transaction_id,
      amount: data.amount,
      currency: data.currency,
      alternative_currency: "",
      description: data.description,
      customer_id: data.transaction_id, // Utiliser transaction_id comme customer_id pour simplifier
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
      metadata: "user_payment",
      lang: "fr",
      print_receipt: true
    };

    const response = await axios.post(url, payload);
    return response.data;
  }

  /**
   * Vérifie le statut d'une transaction.
   */
  static async checkStatus(transaction_id: string) {
    const url = 'https://api-checkout.cinetpay.com/v2/payment/check';
    const payload = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: transaction_id
    };

    const response = await axios.post(url, payload);
    return response.data;
  }
}
