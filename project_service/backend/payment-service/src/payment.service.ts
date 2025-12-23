import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async processPayment(data: any) {
    const { orderId, amount, paymentMethod, cardDetails } = data;

    // Simulate payment processing
    // In a real application, you would integrate with a payment gateway like Stripe, PayPal, etc.
    const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate for simulation

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const payment = new this.paymentModel({
      orderId,
      amount,
      paymentMethod,
      transactionId,
      status: isPaymentSuccessful ? 'completed' : 'failed',
      cardLast4: cardDetails?.last4 || '****',
    });

    await payment.save();

    if (!isPaymentSuccessful) {
      return {
        success: false,
        message: 'Payment processing failed',
        data: {
          paymentId: payment._id,
          transactionId,
          status: 'failed',
        },
      };
    }

    return {
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId: payment._id,
        transactionId,
        status: 'completed',
        amount,
      },
    };
  }

  async getPaymentStatus(orderId: string) {
    const payment = await this.paymentModel.findOne({ orderId }).exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      success: true,
      data: {
        paymentId: payment._id,
        orderId: payment.orderId,
        status: payment.status,
        amount: payment.amount,
        transactionId: payment.transactionId,
      },
    };
  }

  async refundPayment(paymentId: string, amount: number) {
    const payment = await this.paymentModel.findById(paymentId).exec();
    
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new BadRequestException('Can only refund completed payments');
    }

    if (amount > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    // Simulate refund processing
    const refundTransactionId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    payment.status = 'refunded';
    payment.refundAmount = amount;
    payment.refundTransactionId = refundTransactionId;
    await payment.save();

    return {
      success: true,
      message: 'Refund processed successfully',
      data: {
        paymentId: payment._id,
        refundAmount: amount,
        refundTransactionId,
      },
    };
  }
}

