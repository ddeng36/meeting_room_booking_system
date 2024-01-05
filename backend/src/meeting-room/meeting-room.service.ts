import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private repository: Repository<MeetingRoom>;

  async find(pageNo: number, pageSize: number, name: string, capacity: number, equipment: string) {
    if (pageNo < 1 || pageSize < 0) {
      throw new BadRequestException(
        'pageNo and pageSize must be positive integer',
      );
    }

    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string,any> = {};
    if(name) {
      condition.name = Like(`%${name}%`);
    }
    if(capacity) {
      condition.capacity = capacity;
    }
    if(equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }

    const [meetingRooms, totalCount] = await this.repository.findAndCount({
      skip: skipCount,
      take: pageSize,
      where: condition,
    });

    return {
      meetingRooms,
      totalCount,
    };
  }

  async create(meetingRoom: CreateMeetingRoomDto) {
    const room = await this.repository.findOneBy({
      name: meetingRoom.name,
    });
    if (room) {
      throw new BadRequestException('Room already exists');
    }
    return await this.repository.save(meetingRoom);
  }

  async update(meetingRoomDto: UpdateMeetingRoomDto) {
    const meetingRoom = await this.repository.findOneBy({
      id: meetingRoomDto.id,
    });

    if (!meetingRoom) {
      throw new BadRequestException('Room not found');
    }

    meetingRoom.capacity = meetingRoomDto.capacity;
    meetingRoom.location = meetingRoomDto.location;
    meetingRoom.name = meetingRoomDto.name;

    if (meetingRoomDto.description) {
      meetingRoom.description = meetingRoomDto.description;
    }
    if (meetingRoomDto.equipment) {
      meetingRoom.equipment = meetingRoomDto.equipment;
    }

    await this.repository.update(
      {
        id: meetingRoom.id,
      },
      meetingRoom,
    );
    return 'success';
  }

  async findById(id: number) {
    return await this.repository.findOneBy({
      id,
    });
  }

  async remove(id: number) {
    return await this.repository.delete({
      id,
    });
  }

  initData() {
    const room1 = new MeetingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '一层西';

    const room2 = new MeetingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '二层东';

    const room3 = new MeetingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '三层东';

    this.repository.insert([room1, room2, room3]);
  }
}