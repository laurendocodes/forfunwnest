import { Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';

@ApiTags('tracks')
@Controller('tracks')
@ApiBearerAuth()
@UseGuards(JwtGuard ) 
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}


  @ApiQuery({ name: 'search', required: false })
    @Get()
  async getAllSong(@Query('searchQuery') string ) {
    
    return this.tracksService.getAllSong();

  } 
    @Get(':id')
    @ApiParam({name:'id', required: true })
  async getSongDetail(@Param('id', ) id:any, @Req() req:any) {
    return this.tracksService.getTrackStream(id);

  }
    @Get(':id/stream')
    @ApiParam({name:'id', required: true })
  async getTrackStream(@Param('id', ) id:any, @Req() req:any) {
    return this.tracksService.getTrackStream(id);

  }

  //   @Get(':id/stream')
  // async getSongStreaemingUrl(@Param('id', ) id:number, @Req() req:any) {
  //   return this.tracksService.getSongStreaemingUrl(id);

  



}
