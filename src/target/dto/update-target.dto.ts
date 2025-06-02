import { PartialType } from '@nestjs/mapped-types';
import { CreateTargetDto } from './create-target.dto';

export class UpdateTargetDto {
    liveId: string;
    targets: Target[];
}

interface Target {
    id: number;
    data: Date;
    target: number;
}
