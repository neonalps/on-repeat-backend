import { HttpMethod } from "@src/http/constants";
import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";

export interface CorsConfig {
    allowedMethods: HttpMethod[];
    allowedOrigins: string[];
}

export class CorsManager {

    public static async registerCorsConfig(server: FastifyInstance, config: CorsConfig): Promise<void> {
        await server.register(cors, {
            methods: config.allowedMethods,
            origin: config.allowedOrigins,
        });
    }

}