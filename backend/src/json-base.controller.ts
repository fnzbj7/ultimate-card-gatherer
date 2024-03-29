import {
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Post,
    Res,
    Sse,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { JsonBase } from './entities/entities/json-base.entity';
import { JsonBaseRepository } from './repository/json-base.repository';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CardCompareService } from './services/card-compare.service';
import { AwsCardUploadService } from './services/aws-card-upload.service';
import { Observable } from 'rxjs';

@Controller('/api/entity/json-base')
export class JsonBaseController {
    private logger = new Logger(JsonBaseController.name);

    constructor(
        private readonly jsonBaseRepository: JsonBaseRepository,
        private readonly cardCompareService: CardCompareService,
        private readonly awsCardUploadService: AwsCardUploadService
    ) {}

    @Post('/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        return await this.jsonBaseRepository.mtgJsonSaveOrUpdate(
            JSON.parse(file.buffer.toString()),
        );
    }

    @Get('/all')
    async getJsonFiles(): Promise<JsonBase[]> {
        return await this.jsonBaseRepository.getAllJsonBase();
    }

    @Get('/all/cards')
    async getJsonaFiles(): Promise<JsonBase[]> {
        return await this.jsonBaseRepository.getAllJsonBaseSelect({id: true, setCode: true, name: true, isEverythingDoneF: true, iconModifDate: true });
    }

    @Get('/:id/full')
    async getJsonFile(@Param('id') id: string): Promise<JsonBase> {
        return await this.jsonBaseRepository.getSingleJsonBase(+id);
    }

    @Get('/:id/full-name')
    async getJsonFullName(
        @Param('id') id: string,
    ): Promise<{ fullName: string }> {
        return await this.jsonBaseRepository.getJsonFullName(+id);
    }

    @Delete('/:id')
    async deleteJsonBase(@Param('id') id: string) {
        await this.jsonBaseRepository.deleteJsonBase(+id);
    }

    @Post('/:id/upload-svg')
    @UseInterceptors(FileInterceptor('iconSvg'))
    async uploadSvg(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return await this.jsonBaseRepository.saveIcon(
            +id,
            file.buffer.toString(),
        );
    }

    @Get(':id/icon-svg')
    async getIconSvg(
        @Param('id') id: string,
        @Res() res: Response,
    ): Promise<void> {
        const jsonBase: JsonBase =
            await this.jsonBaseRepository.getSingleJsonBase(+id);
        res.setHeader('Content-Type', 'image/svg+xml');
        if (jsonBase.icon) {
            res.send(jsonBase.icon);
        } else {
            res.send(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="28" height="32" viewBox="0 0 28 32">
            <title>pmtg1</title>
            <path fill="#444" d="M13.721 27.702c-3.77 0-7.131-1.795-9.271-4.577 0.328 0 0.67 0.017 1.031 0.062 0.011 0 0.026 0 0.038 0.003h0.021c0.029 0.003 0.062 0 0.095-0.003 0.478-0.042 0.826-0.429 0.871-0.954 0-0.009 0-0.023 0-0.033l0.003-0.053v-0.023c0-0.529-0.31-0.96-0.771-1.078-0.029-0.006-0.062-0.012-0.094-0.015-0.067-0.005-0.1-0.014-0.121-0.026-0.026-0.198-0.047-0.395-0.047-0.587 0-1.323 0.578-2.959 1.769-5.002 0.038-0.062 0.038-0.042 0.053-0.11l0.068-0.372c0.003-0.023 0.006-0.036 0.006-0.042 0-0.014-0.006-0.011-0.015-0.059l-0.012-0.065c-0.005-0.047-0.020-0.094-0.038-0.138-0.051-0.119-0.133-0.231-0.231-0.334 0.26-0.047 0.485-0.168 0.649-0.363 0.015-0.018 0.029-0.036 0.042-0.054 0 0 0.020-0.033 0.036-0.053 0.062-0.056 0.115-0.115 0.15-0.192 0 0 0.053-0.112 0.074-0.156 0.023-0.039 0.085-0.136 0.085-0.136 0.006-0.011 0.012-0.020 0.017-0.033l0.098-0.18c0.012-0.020 0.027-0.056 0.036-0.079 0 0 0.009-0.021 0.012-0.026 2.011 1.010 4.030 7.893 4.266 10.535 0-0.020-0.002-0.039-0.002-0.056 0 0.508 0.268 0.942 0.682 1.113 0.177 0.073 0.366 0.085 0.561 0.041 0.071-0.017 0.139-0.047 0.201-0.085l0.171-0.113c0.104-0.067 0.218-0.174 0.647-0.567l1.738-1.6c-0.017 0.018-0.029 0.026-0.050 0.042 0.517-0.372 0.623-0.859 0.682-1.119 0-0.003 0.006-0.033 0.006-0.033 0.009-0.042 0.015-0.086 0.015-0.133 0-0.051-0.006-0.101-0.021-0.148l-0.003-0.017c-0.006-0.026-0.017-0.065-0.026-0.091-0.268-0.68-0.57-1.411-0.974-2.17-0.18-0.364-0.274-0.714-0.274-1.063 0-0.41 0.121-0.804 0.26-1.256 0.147-0.481 0.313-1.024 0.363-1.674 0.003-0.015 0.003-0.033 0.003-0.051 0-0.050-0.006-0.106-0.014-0.15v0c-0.006-0.036-0.021-0.068-0.029-0.101 0.014 0.006 0.029 0.015 0.047 0.021 0.11 0.032 0.416 0.109 0.688 0.032 0.056-0.014 0.107-0.044 0.156-0.067-0.003 0.003-0.003 0.003-0.006 0.005 0.003-0.002 0.009-0.005 0.012-0.008 0.065-0.029 0.127-0.059 0.186-0.104 0.053 0.036 0.113 0.091 0.177 0.206 0.933 1.501 1.701 3.222 2.289 5.13 0.098 0.475 0.141 0.803 0.141 1.051 0 0.319-0.070 0.417-0.103 0.455-0.045 0.038-0.153 0.135-0.153 0.135-0.308 0.272-0.621 0.55-0.875 0.697l-0.029 0.015c-0.141 0.085-0.248 0.228-0.29 0.387l-0.005 0.026c-0.027 0.101-0.065 0.254-0.065 0.431 0 0.316 0.121 0.525 0.221 0.647 0.147 0.177 0.431 0.383 0.945 0.345 0 0 0.026-0.003 0.026-0.003 0.124-0.009 0.245-0.054 0.342-0.133l0.020-0.018c0.277-0.218 0.655-0.398 1.149-0.543 0.673-0.121 1.269-0.151 1.822-0.145-2.128 2.912-5.571 4.811-9.448 4.811zM4.482 8.834c-0.029 0.085-0.047 0.168-0.047 0.245v0.068c0 0.313 0.23 0.575 0.537 0.617l0.068 0.009c0.977 0.135 0.989 0.446 0.989 0.747-0.003 0.020-0.006 0.080-0.009 0.139-0.265 1.010-0.549 1.562-0.815 2.002l-0.011 0.020c-0.059 0.098-0.089 0.207-0.089 0.322v0.021c0 0.236 0.107 0.443 0.26 0.614-0.262 0.059-0.481 0.209-0.605 0.44-0.011 0.020-0.023 0.045-0.029 0.065l-0.008 0.020c-0.006 0.015-0.012 0.030-0.018 0.045-0.561 1.757-1.205 3.541-2.025 5.604-0.003 0.006-0.006 0.012-0.009 0.018-0.419-1.202-0.65-2.489-0.65-3.83 0-2.699 0.921-5.185 2.463-7.166zM25.421 16c0 1.219-0.189 2.395-0.534 3.502-0.853-3.248-2.398-6.647-3.599-8.808-0.095-0.42-0.124-0.875-0.151-1.315 0-0.006-0.026-0.417-0.029-0.476 0.003-0.050 0.009-0.209 0.009-0.209 0-0.009 0-0.020 0-0.032v0c0-0.44-0.136-0.768-0.407-0.977-0.304-0.234-0.706-0.26-1.193-0.079-0.207 0.073-0.461 0.038-0.782-0.009 0.006 0 0.011 0 0.017 0.003-0.705-0.127-1.193-0.162-1.71-0.198-0.974-0.085-0.974-0.085-1.001-0.085-0.505 0-0.868 0.422-0.995 0.815-0.009 0.030-0.018 0.059-0.021 0.091l-0.026 0.16c-0.003 0.029-0.005 0.065-0.005 0.098v0.009c0.002 0.316 0.15 0.593 0.401 0.764l0.413 0.275c0 0 0.493 0.336 0.694 0.469 0.203 0.265 0.248 0.451 0.254 0.605-0.048 0.077-0.098 0.154-0.098 0.154-0.292 0.454-0.567 0.88-0.886 1.204-0.009 0.006-0.018 0.015-0.021 0.021l-0.103 0.112c-0.11 0.115-0.286 0.304-0.337 0.629-0.005 0.032-0.008 0.068-0.008 0.101 0 0.062 0.014 0.121 0.023 0.183-0.074-0.033-0.144-0.059-0.219-0.074-0.367-0.088-0.717 0.027-0.939 0.305-0.045 0.056-0.086 0.124-0.11 0.189l-0.009 0.023c-0.033 0.095-0.062 0.163-0.094 0.234-0.135-0.237-0.729-1.264-0.729-1.264-1.866-3.301-2.723-4.645-3.661-4.613-0.018 0-0.035 0.003-0.053 0.003-1.308 0.153-2.268 0.083-3.694-0.053-0.012-0.003-0.023-0.003-0.036-0.003l-0.020-0.003c-0.032 0-0.060 0.003-0.089 0.006-0.124 0.014-0.248 0.062-0.369 0.127 2.129-2.206 5.114-3.585 8.415-3.585 6.451 0 11.701 5.25 11.701 11.702zM27.199 21.849l-0.009-0.008c-0.248-0.257-0.511-0.469-0.765-0.658 0.656-1.601 1.016-3.349 1.016-5.183 0-7.58-6.141-13.722-13.72-13.722-7.577 0-13.72 6.142-13.72 13.722 0 2.040 0.448 3.978 1.249 5.717-0.218 0.189-0.463 0.354-0.75 0.487 0.003 0-0.026 0.012-0.026 0.012-0.097 0.044-0.175 0.109-0.24 0.195l-0.017 0.026c-0.142 0.195-0.215 0.428-0.215 0.673 0 0.254 0.079 0.5 0.227 0.689 0.263 0.348 0.697 0.475 1.098 0.327 0.060-0.023 0.133-0.062 0.184-0.101v0c0.236-0.183 0.493-0.336 0.764-0.463 2.457 3.712 6.667 6.159 11.447 6.159 4.925 0 9.241-2.598 11.663-6.493 0.177 0.056 0.354 0.121 0.528 0.2 0.026 0.009 0.053 0.021 0.079 0.029 0.484 0.142 0.971 0.009 1.246-0.339 0.135-0.174 0.203-0.378 0.203-0.596 0-0.186-0.050-0.375-0.15-0.546-0.023-0.044-0.059-0.091-0.091-0.127z"/>
            </svg>`);
        }
    }

    @Get('/:id/compare')
    getCompare(@Param('id') id: string) {
        return this.cardCompareService.generateCompareDto(+id);
    }

    @Post('/:id/update-json')
    @UseInterceptors(FileInterceptor('json'))
    async updateJson(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return await this.jsonBaseRepository.updateJson(
            +id,
            JSON.parse(file.buffer.toString()),
        );
    }

    /**
     *
     * @param set
     */
    @Sse('/:id/upload-aws')
    async startAwsUpload(@Param('id') id: string ) {
        return new Observable<{ data: string }>((subscriber) => {
            this.awsCardUploadService.startAwsUpload(+id, subscriber);
        });
    }
}
