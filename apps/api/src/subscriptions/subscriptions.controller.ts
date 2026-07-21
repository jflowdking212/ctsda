import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin/billing')
@UseGuards(AuthGuard)
@Roles('super_admin')
export class SubscriptionsController {
  constructor(private readonly billingService: SubscriptionsService) {}

  @Get('subscriptions')
  async listSubscriptions() {
    return this.billingService.listSubscriptions();
  }

  @Get('orders')
  async listOrders() {
    return this.billingService.listOrders();
  }

  @Post('orders')
  async createManualOrder(@Body() body: any) {
    return this.billingService.createManualOrder(body);
  }
}
