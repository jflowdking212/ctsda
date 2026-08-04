import { Body, Controller, Headers, Post, Req, UseGuards, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-checkout')
  @UseGuards(AuthGuard)
  async createCheckout(@CurrentUser() user: any, @Body() body: { applicationId: string }) {
    return this.paymentsService.createCheckoutSession(user.userId, body.applicationId);
  }

  @Post('webhook')
  async webhook(@Body() body: any, @Req() request: any, @Headers('stripe-signature') signature?: string) {
    return this.paymentsService.handleWebhook(body, signature, request.rawBody);
  }

  @Post('invoices/:id/verify-manual')
  @UseGuards(AuthGuard)
  async verifyManual(@CurrentUser() user: any, @Param('id') invoiceId: string) {
    return this.paymentsService.verifyManualPayment(invoiceId, user.userId);
  }

  @Post('refund')
  @UseGuards(AuthGuard)
  async refund(@CurrentUser() user: any, @Body() body: { invoiceId: string }) {
    return this.paymentsService.refund(user.userId, body.invoiceId);
  }
}
