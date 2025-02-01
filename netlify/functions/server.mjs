
import { SipelikanServer } from "../../src/server.mjs";
import serverless from "serverless-http";

export const handler = serverless(SipelikanServer);