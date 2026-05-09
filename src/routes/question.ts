import { Request, Response } from 'express';
import { ApiRoute } from '../bot/api/types/ApiRoute';
import { MetaQuestionBuilder } from '../bot/builders/MetaQuestionBuilder';
import { questionService } from '../services';
import { LoggerService } from '../services/LoggerService';
import { newQuestionView } from '../views/moderation/newQuestionView';
import { QuestionType } from '@vulps22/project-encourage-types';

const question: ApiRoute = {
  async post(req: Request, res: Response): Promise<void> {
    console.log(`[DEBUG MS/POST /question] Request received — body=${JSON.stringify(req.body)}`);
    const { questionId } = req.body as {
      questionId?: number;
    };

    if (!questionId) {
      console.log(`[DEBUG MS/POST /question] Rejected: missing questionId`);
      res.status(400).json({ error: 'Missing required field: questionId' });
      return;
    }

    console.log(`[DEBUG MS/POST /question] Fetching meta question ${questionId} from DS`);
    const meta = await new MetaQuestionBuilder().getMetaQuestion(questionId);
    console.log(`[DEBUG MS/POST /question] DS returned: ${meta ? `id=${meta.question.id} type=${meta.question.type}` : 'null (not found)'}`);

    if (!meta) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const { question, user, server } = meta;

    const channelId = question.type === QuestionType.Truth ? process.env.TRUTHS_CHANNEL_ID : process.env.DARES_CHANNEL_ID;
    console.log(`[DEBUG MS/POST /question] Channel resolved — type=${question.type} channelId=${channelId}`);
    if (!channelId) {
      console.log(`[DEBUG MS/POST /question] Error: channel ID not configured for type=${question.type}`);
      res.status(500).json({ error: 'Channel ID not configured' });
      return;
    }

    console.log(`[DEBUG MS/POST /question] Building newQuestionView for question ${question.id}`);
    const message = await newQuestionView(question, null, user, server);
    console.log(`[DEBUG MS/POST /question] Posting to Discord channel ${channelId}`);
    const posted = await LoggerService.postTo(channelId, message);
    console.log(`[DEBUG MS/POST /question] Discord message posted — messageId=${posted.id}`);

    console.log(`[DEBUG MS/POST /question] Updating question ${question.id} with messageId=${posted.id}`);
    await questionService.setMessageId(question.id, posted.id);
    console.log(`[DEBUG MS/POST /question] Done — responding 200`);

    res.status(200).json({ success: true, questionId: question.id });
  },
};

export default question;
