import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user';
import { OrderStatus } from '../order-status.enum';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'executor_id' })
  executor!: User | null;

  @Column({ name: 'execution_date', type: 'date' })
  executionDate!: string;

  @Column({ type: 'varchar', length: 512 })
  address!: string;

  @Column({ type: 'enum', enum: OrderStatus })
  status!: OrderStatus;

  @Column({ type: 'text' })
  description!: string;
}
