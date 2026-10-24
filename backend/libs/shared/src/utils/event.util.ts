import { randomUUID } from 'crypto';

export interface EventMetadata {
  'x-event-id': string;
  'x-producer': string;
  'x-timestamp': string;
  [key: string]: any;
}

export function createEventHeaders(producer: string, eventId?: string): EventMetadata {
  return {
    'x-event-id': eventId || randomUUID(),
    'x-producer': producer,
    'x-timestamp': new Date().toISOString(),
  };
}
