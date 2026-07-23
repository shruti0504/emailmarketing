import { Worker } from "bullmq";
import redis from "../config/redis.js";


const worker = new Worker(
  "campaignQueue",

  async(job)=>{

   const {
  campaignId,
  workspaceId
} = job.data;


console.log(
  "🚀 Sending campaign:",
  campaignId,
  "workspace:",
  workspaceId
);
  },

  {
    connection: redis,
  }
);


worker.on("completed",(job)=>{
  console.log(
    `Job ${job.id} completed`
  );
});


worker.on("failed",(job,error)=>{
  console.log(
    "Job failed",
    error
  );
});


console.log(
  "🚀 Campaign worker started"
);