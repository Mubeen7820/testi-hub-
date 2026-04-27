import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const saveTestimonial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { 
      id, feedback, rating, name, role, company, date, time, profileImage, imageHash, isExported,
      template, customBackgroundColor, customTextColor, fontFamily, fontSize, watermarkColor,
      tone, tag, websiteUrl, linkedinUrl, socialLink
    } = req.body;

    // First, try to find existing by ID
    let existingTestimonial = null;
    if (id) {
      existingTestimonial = await prisma.testimonial.findUnique({ where: { id } });
    }

    // If not found by ID, try to find by Content (UserId + Feedback + Name)
    if (!existingTestimonial) {
      existingTestimonial = await prisma.testimonial.findFirst({
        where: {
          userId,
          feedback: feedback,
          name: name || null
        }
      });
    }

    const dataPayload = {
      feedback, rating, name, role, company, date, time, profileImage, imageHash,
      isExported: isExported || false,
      template, customBackgroundColor, customTextColor, fontFamily, fontSize, watermarkColor,
      tone, tag, websiteUrl, linkedinUrl, socialLink
    };

    const testimonial = await prisma.testimonial.upsert({
      where: { id: existingTestimonial?.id || id || 'new-uuid-placeholder' },
      update: dataPayload,
      create: {
        id: id || undefined,
        userId,
        ...dataPayload
      }
    });

    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Save testimonial error:', error);
    res.status(500).json({ message: 'Failed to save testimonial' });
  }
};

export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const testimonials = await prisma.testimonial.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: id as string }
    });

    if (!testimonial || testimonial.userId !== userId) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Delete associated download events first
    await prisma.downloadEvent.deleteMany({
      where: { testimonialId: id as string }
    });

    await prisma.testimonial.delete({
      where: { id: id as string }
    });

    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete testimonial' });
  }
};

export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { isExported } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: id as string }
    });

    if (!testimonial || testimonial.userId !== userId) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    const updated = await prisma.testimonial.update({
      where: { id: id as string },
      data: { isExported }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update testimonial' });
  }
};

export const getDownloads = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const downloads = await prisma.downloadEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(downloads);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch downloads' });
  }
};

export const saveDownload = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, format, date, time, testimonialId } = req.body;

    const download = await prisma.downloadEvent.create({
      data: {
        userId,
        name,
        format,
        date,
        time,
        testimonialId
      }
    });

    res.status(201).json(download);
  } catch (error) {
    console.error('Save download event error:', error);
    res.status(500).json({ message: 'Failed to save download event' });
  }
};

export const deleteDownload = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const download = await prisma.downloadEvent.findUnique({
      where: { id: id as string }
    });

    if (!download || download.userId !== userId) {
      return res.status(404).json({ message: 'Download not found' });
    }

    await prisma.downloadEvent.delete({
      where: { id: id as string }
    });

    res.json({ message: 'Download deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete download' });
  }
};
