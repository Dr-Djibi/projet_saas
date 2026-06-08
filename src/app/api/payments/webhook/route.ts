import { NextRequest, NextResponse } from 'next/server';
import { PaymentLog, PaymentTransaction, WhatsappBot, sequelize } from '@/lib/models';
import { CinetPayService } from '@/services/payment/cinetpay';
import { ChariotService } from '@/services/payment/chariot';

interface WebhookMetadata {
  internalTransactionId?: string;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: Record<string, unknown>;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    } else {
      body = await req.json() as Record<string, unknown>;
    }

    console.log('Payment Webhook received:', body);

    let transactionId: string | null = null;
    let provider: 'cinetpay' | 'chariot' | null = null;

    // Détection du fournisseur
    if (body.cpm_trans_id) {
      transactionId = body.cpm_trans_id as string;
      provider = 'cinetpay';
    } else if (body.external_id || body.reference) {
      transactionId = (body.external_id || body.reference) as string;
      provider = 'chariot';
    }

    if (!transactionId || !provider) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    // Vérification du statut auprès du fournisseur pour plus de sécurité
    let isSuccess = false;
    let amount = 0;

    if (provider === 'cinetpay') {
      const check = await CinetPayService.checkStatus(transactionId);
      if (check.code === '00' && check.data?.status === 'ACCEPTED') {
        isSuccess = true;
        amount = parseFloat(check.data.amount);
      }
    } else if (provider === 'chariot') {
      const check = await ChariotService.getPaymentStatus(transactionId);
      if (check.status === 'success' || check.data?.status === 'SUCCESS') {
        isSuccess = true;
        amount = check.amount || check.data?.amount || 0;
      }
    }

    if (!isSuccess) {
      console.log(`Payment not successful for ${transactionId} (${provider})`);
      return NextResponse.json({ message: 'Payment not successful' });
    }

    // Mise à jour de la base de données
    await sequelize.transaction(async (t) => {
      // 1. Trouver le log de paiement par l'ID externe
      const paymentLog = await PaymentLog.findOne({ 
        where: { transactionId, provider },
        transaction: t 
      });

      if (!paymentLog) {
        console.error(`Payment log not found for external ID ${transactionId}`);
        return;
      }

      if (paymentLog.status === 'success') {
        console.log(`Payment ${transactionId} already processed`);
        return;
      }

      // 2. Mettre à jour les logs
      const currentMetadata = (paymentLog.metadata as WebhookMetadata) || {};
      paymentLog.status = 'success';
      paymentLog.metadata = { 
        ...currentMetadata, 
        webhook_body: body,
        processed_at: new Date().toISOString()
      };
      await paymentLog.save({ transaction: t });

      // Trouver la transaction interne liée
      const internalTxId = currentMetadata.internalTransactionId;
      
      let internalTx = null;
      if (internalTxId) {
        internalTx = await PaymentTransaction.findByPk(internalTxId, { transaction: t });
      }

      // Fallback: chercher par userId et montant
      if (!internalTx) {
        internalTx = await PaymentTransaction.findOne({
          where: { 
            userId: paymentLog.userId, 
            status: 'pending',
            amount: paymentLog.amount
          },
          order: [['createdAt', 'DESC']],
          transaction: t
        });
      }

      if (internalTx) {
        internalTx.status = 'success';
        await internalTx.save({ transaction: t });
      }

      // 3. Créditer l'utilisateur (Bot)
      const bot = await WhatsappBot.findOne({ 
        where: { userId: paymentLog.userId },
        transaction: t 
      });

      if (bot) {
        // Règle: 1000 FCFA = 168 heures (1 semaine)
        const hoursToAdd = (amount / 1000) * 168;
        bot.remainingHours = (bot.remainingHours || 0) + hoursToAdd;
        
        // Si le bot était expiré, on le remet en pause pour qu'il puisse être réactivé
        if (bot.status === 'expired') {
          bot.status = 'paused';
        }
        
        await bot.save({ transaction: t });
        console.log(`Credited ${hoursToAdd} hours to bot for user ${paymentLog.userId}. New total: ${bot.remainingHours}`);
      } else {
        console.error(`Bot not found for user ${paymentLog.userId}`);
      }
    });

    return NextResponse.json({ message: 'Webhook processed successfully' });

  } catch (error: unknown) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
