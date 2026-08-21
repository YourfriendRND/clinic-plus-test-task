import type { Container } from 'inversify';
import { ApplicationComponents } from '../../core/di/application-components';
import type { IOrderRepository } from '../../types/order/order-repository.interface';
import type { IOrderService } from '../../types/order/order-service.interface';
import { OrderRepository } from './order-repository';
import { OrderService } from './order-service';
import './order-controller';

export function loadOrderModule(container: Container): void {
  container.bind<IOrderRepository>(ApplicationComponents.OrderRepository).to(OrderRepository).inSingletonScope();
  container.bind<IOrderService>(ApplicationComponents.OrderService).to(OrderService).inSingletonScope();
}
