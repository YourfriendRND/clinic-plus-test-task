import type { Container } from 'inversify';
import { DataSource } from 'typeorm';
import { ApplicationComponents } from '../application-components';
import { createDataSource } from '../../db/data-source';

export async function loadCoreModule(container: Container): Promise<void> {
  const dataSource = createDataSource();
  await dataSource.initialize();
  container.bind<DataSource>(ApplicationComponents.DataSource).toConstantValue(dataSource);
}
