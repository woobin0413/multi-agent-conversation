import { Module } from '@nestjs/common';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { AgentsService } from './agents.service';

@Module({
  controllers: [StoryController],
  providers: [StoryService, AgentsService],
})
export class StoryModule {}
