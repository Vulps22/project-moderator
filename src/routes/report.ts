import { Request, Response } from 'express';
import { ApiRoute } from '../bot/api/types/ApiRoute';
import { reportService } from '../services';
import { TargetType } from '../bot/types';

const report: ApiRoute = {
  async post(req: Request, res: Response): Promise<void> {
    const { senderId, offenderId, content, type, serverId, reason } = req.body as {
      senderId?: string;
      offenderId?: string;
      content?: string | null;
      type?: TargetType;
      serverId?: string;
      reason?: string;
    };

    if (!senderId || !offenderId || !type || !serverId) {
      res.status(400).json({ error: 'Missing required fields: senderId, offenderId, type, serverId' });
      return;
    }

    try {
      const report = await reportService.createReport(
        senderId,
        offenderId,
        content ?? null,
        type,
        serverId,
        reason
      );

      res.status(200).json({ success: true, reportId: report.id });
    } catch (error) {
      console.error('[POST /report]', error);
      res.status(500).json({ error: 'Failed to create report' });
    }
  },
};

export default report;
