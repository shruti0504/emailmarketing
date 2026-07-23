
import { ContactService } from "../service/contact.service.js";
import { CsvService } from "../service/csv.service.js";
import { Request, Response, NextFunction } from "express";
const contactService = new ContactService();
const csvService = new CsvService();
interface ContactParams {
  id: string;
}

export class ContactController {
  async create(req: Request, res: Response) {
    try {
      const contact = await contactService.createContact(
        req.user.workspaceId,
        req.body
      );

      return res.status(201).json({
        success: true,
        message: "Contact created successfully.",
        data: contact,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async getAll(
  req: Request,
  res: Response
) {
  try {
    const contacts =
      await contactService.getContacts(
        req.user.workspaceId
      );

    return res.json({
      success: true,
      data: contacts,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}
async getById(
  req: Request<{id:string}>,
  res: Response
){
  try {
    const contact =
      await contactService.getContactById(
        req.params.id,
        req.user.workspaceId
      );

    return res.json({
      success: true,
      data: contact,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}
async update(
  req: Request<{id:string}>,
  res: Response
) {
  try {
    const contact =
      await contactService.updateContact(
        req.params.id,
        req.user.workspaceId,
        req.body
      );

    return res.json({
      success: true,
      message: "Contact updated successfully.",
      data: contact,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}
async delete(
  req: Request<{id:string}>,
  res: Response
) {
  try {
    await contactService.deleteContact(
      req.params.id,
      req.user.workspaceId
    );

    return res.json({
      success: true,
      message: "Contact deleted successfully.",
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

async importContacts(
  req: Request,
  res: Response
) {
  try {

    if (!req.file) {
      return res.status(400).json({
        success:false,
        message:"CSV file is required"
      });
    }


    const result =
      await csvService.importContacts(
        req.file.buffer,
        req.user.workspaceId
      );


    return res.status(200).json({
      success:true,
      message:"Contacts imported successfully",
      data: result
    });


  } catch(error:any){

    return res.status(500).json({
      success:false,
      message:error.message
    });

  }
}
}