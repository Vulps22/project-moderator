import { Handler, Logger } from "../../../bot/utils";
import { moderationService, questionService } from "../../../services";
import { LoggerService } from "../../../services/LoggerService";
import { BotButtonInteraction } from "../../../bot/structures";
import { QuestionType } from "../../../bot/types";
import { newQuestionView } from "../../../views/moderation/newQuestionView";

const approveQuestionButton: Handler<BotButtonInteraction> = {
    name: "approveQuestion",
    async execute(interaction) {
        const questionId = interaction.params.get("id");

        if (!questionId) {
            await interaction.ephemeralReply('❌ Invalid question ID');
            return;
        }

        try {
            await moderationService.approveQuestion(questionId, interaction.user.id);

            const question = await questionService.getQuestionById(Number(questionId));
            if (!question) {
                await interaction.ephemeralReply('❌ Question not found');
                Logger.error(`Question with ID ${questionId} not found during approval for message ${interaction.message.id}`);
                return;
            }

            if (!question.message_id) {
                await interaction.ephemeralReply('❌ Question has no associated log message');
                return;
            }

            const logChannelId = question.type === QuestionType.Truth
                ? process.env.TRUTHS_CHANNEL_ID!
                : process.env.DARES_CHANNEL_ID!;

            const updatedView = await newQuestionView(question);
            await LoggerService.update(logChannelId, question.message_id, updatedView);
            await interaction.sendReply('✅ Question approved successfully!');

        } catch (error) {
            console.error('Error approving question:', error);
            await interaction.ephemeralReply('❌ Failed to approve question. Please try again.');
        }
    }
};

export default approveQuestionButton;
