import { Request, Response } from 'express';
import { ApiRoute } from '../bot/api/types/ApiRoute';
import { questionService } from '../services';
import { LoggerService } from '../services/LoggerService';
import { newQuestionView } from '../views/moderation/newQuestionView';
import { Question, QuestionType } from '@vulps22/project-encourage-types';

const question: ApiRoute = {
  async post(req: Request, res: Response): Promise<void> {
    const { questionId } = req.body as {
      questionId?: number;
    };

    if (!questionId) {
      res.status(400).json({ error: 'Missing required field: questionId' });
      return;
    }

    const question: Question | null = await questionService.getQuestionById(questionId);

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const channelId = question.type === QuestionType.Truth ? process.env.TRUTHS_CHANNEL_ID : process.env.DARES_CHANNEL_ID;
    if (!channelId) {
      res.status(500).json({ error: 'Channel ID not configured' });
      return;
    }
    const message = await newQuestionView(question, null);
    const posted = await LoggerService.postTo(channelId, message);
    await questionService.setMessageId(question.id, posted.id);

    res.status(200).json({ success: true, questionId: question.id });
  },
};

export default question;
