import { createClient } from "redis";

export const client = createClient({
  url: process.env.REDISCLOUD_URL,
});
