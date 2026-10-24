import { ClientProviderOptions, Transport } from '@nestjs/microservices';

export const MICROSERVICE_CONFIG = {
  AUTH_SERVICE: { hostEnv: 'AUTH_SERVICE_HOST', defaultPort: 3001, defaultHost: '127.0.0.1' },
  PROJECT_SERVICE: { hostEnv: 'PROJECT_SERVICE_HOST', defaultPort: 3003, defaultHost: '127.0.0.1' },
  USER_SERVICE: { hostEnv: 'USER_SERVICE_HOST', defaultPort: 3004, defaultHost: '127.0.0.1' },
  CONTRACT_SERVICE: { hostEnv: 'CONTRACT_SERVICE_HOST', defaultPort: 3005, defaultHost: '127.0.0.1' },
  PAYMENT_SERVICE: { hostEnv: 'PAYMENT_SERVICE_HOST', defaultPort: 3006, defaultHost: '127.0.0.1' },
} as const;

export type MicroserviceName = keyof typeof MICROSERVICE_CONFIG;

/**
 * Returns dynamic TCP microservice client configuration.
 * Reads host from process.env[HOST_VAR] (used in Docker network)
 * with graceful fallback to 127.0.0.1 for local host development.
 */
export function getTcpClient(name: MicroserviceName): ClientProviderOptions {
  const conf = MICROSERVICE_CONFIG[name];
  return {
    name,
    transport: Transport.TCP,
    options: {
      host: process.env[conf.hostEnv] || conf.defaultHost,
      port: Number(process.env[`${name}_PORT`]) || conf.defaultPort,
    },
  };
}
