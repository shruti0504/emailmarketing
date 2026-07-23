import { Request, Response } from "express";
import { ContactService } from "../service/contact.service.js";

const contactService = new ContactService();
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
  req: Request<ContactParams>,
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
  req: Request<ContactParams>,
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
  req: Request<ContactParams>,
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
}