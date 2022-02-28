import { Injectable, OnModuleDestroy } from '@nestjs/common'
import edgedb, { Client } from 'edgedb'

import e from '../../../../dbschema/edgeql-js'

export const db = e

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly client: Client

  constructor() {
    this.client = edgedb()
  }

  /**
   * Close client on app exit
   */
  async onModuleDestroy() {
    await this.client.close()
  }
}
