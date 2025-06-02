export class UpdateUserDto {
    id: number;
    name: string;
    email: string;
    role: number;
    password: string;
    status: boolean;
    isFileUploader: boolean;
    isLiveManager: boolean;
    liveNameList: string[];
}
