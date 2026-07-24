// import prisma from "../config/prisma.js";

// export class WebhookRepository {

//   async create(
//     provider: string,
//     messageId: string,
//     event: string,
//     payload: any
//   ) {
//     return prisma.webhookEvent.create({
//       data: {
//         provider,
//         messageId,
//         event,
//         payload,
//       },
//     });
//   }

// }

import prisma from "../config/prisma.js";

export class WebhookRepository {
  async create(
    provider: string,
    messageId: string,
    event: string,
    payload: any
  ) {
    return prisma.webhookEvent.create({
      data: {
        provider,
        messageId,
        event,
        payload,
      },
    });
  }
}