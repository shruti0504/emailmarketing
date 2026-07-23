import csv from "csv-parser";
import { Readable } from "stream";
import { ContactService } from "./contact.service.js";


const contactService = new ContactService();


export class CsvService {

    async importContacts(
        fileBuffer: Buffer,
        workspaceId: string
    ) {

        const rows: any[] = [];

        await new Promise((resolve, reject) => {

            Readable
                .from(fileBuffer)
                .pipe(csv())
                .on("data", (row) => {
                    rows.push(row);
                })
                .on("end", resolve)
                .on("error", reject);

        });


        let added = 0;
        let duplicates = 0;
        let failed = 0;


        for (const row of rows) {

            try {
                const {
                    name,
                    email,
                    phone,
                    city,
                    tags,
                    ...customFields
                } = row;

                await contactService.createContact(
                    workspaceId,
                    {
                        name,
                        email,
                        phone,
                        city,
                        customFields
                    }
                );

                added++;

            } catch (error: any) {

                if (error.statusCode === 409) {
                    duplicates++;
                }
                else {
                    failed++;
                }

            }

        }


        return {
            total: rows.length,
            added,
            duplicates,
            failed
        };

    }

}