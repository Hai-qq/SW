import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { ChatService } from './chat.service';
import { ListMessagesDto } from './dto/list-messages.dto';
import { OpenConversationDto } from './dto/open-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @HttpCode(200)
  @Post('conversations')
  openConversation(
    @CurrentUser() user: { id: bigint },
    @Body() dto: OpenConversationDto,
  ) {
    return this.chatService.openConversation(user.id, dto);
  }

  @Get('conversations')
  listConversations(@CurrentUser() user: { id: bigint }) {
    return this.chatService.listConversations(user.id);
  }

  @Get('conversations/:conversationId/messages')
  listMessages(
    @CurrentUser() user: { id: bigint },
    @Param('conversationId') conversationId: string,
    @Query() dto: ListMessagesDto,
  ) {
    return this.chatService.listMessages(user.id, conversationId, dto);
  }

  @HttpCode(200)
  @Post('conversations/:conversationId/messages')
  sendMessage(
    @CurrentUser() user: { id: bigint },
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user.id, conversationId, dto);
  }

  @HttpCode(200)
  @Post('conversations/:conversationId/read')
  markRead(
    @CurrentUser() user: { id: bigint },
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.markRead(user.id, conversationId);
  }
}
