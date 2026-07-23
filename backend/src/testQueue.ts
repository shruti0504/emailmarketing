import { campaignQueue } from "./queues/campaign.queue.js";

await campaignQueue.add(
  "test-campaign",
  {
    campaignId: "123",
    message: "Hello Queue"
  }
);

console.log("Job added");

process.exit();