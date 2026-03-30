import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllRolesAndPermissions = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true 
          }
        }
      }
    });

    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      actions: role.permissions.map(rp => rp.permission.action)
    }));

    return res.status(200).json(formattedRoles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};