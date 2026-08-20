import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RoleCode } from '../role-code.enum';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'enum', enum: RoleCode, unique: true })
  code!: RoleCode;
}
