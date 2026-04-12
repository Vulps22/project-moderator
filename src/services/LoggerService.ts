import { Message, MessageCreateOptions, MessageEditOptions, TextChannel } from "discord.js";
import { UniversalMessage } from "../bot/types";

export class LoggerService {
  private static async resolveChannel(channelId: string): Promise<TextChannel> {
    const channel = await global.client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased() || !(channel instanceof TextChannel)) {
      throw new Error(`Channel ${channelId} is not a fetchable text channel`);
    }
    return channel;
  }

  static async postTo(channelId: string, message: UniversalMessage): Promise<Message> {
    const channel = await LoggerService.resolveChannel(channelId);
    return channel.send(message as MessageCreateOptions);
  }

  static async update(
    channelId: string,
    messageId: string,
    message: Partial<UniversalMessage>
  ): Promise<Message> {
    const channel = await LoggerService.resolveChannel(channelId);
    const existing = await channel.messages.fetch(messageId);
    return existing.edit(message as MessageEditOptions);
  }

  static async delete(channelId: string, messageId: string): Promise<void> {
    const channel = await LoggerService.resolveChannel(channelId);
    const existing = await channel.messages.fetch(messageId);
    await existing.delete();
  }
}
