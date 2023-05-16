import { Injectable, Logger } from '@nestjs/common';
import fs = require('fs');
import aw = require('aws-cli-js');
import { JsonBaseRepository } from '../repository/json-base.repository'
import { Subscriber } from 'rxjs';
import { JsonBase } from 'src/entities/entities/json-base.entity';

@Injectable()
export class AwsCardUploadService {
    private log = new Logger(AwsCardUploadService.name);

    awsCli;

    constructor(
        private jsonBaseRepository: JsonBaseRepository

    ) {
        const Aws = aw.Aws;
        this.awsCli = new Aws();
    }

    async startAwsUpload(id: number, subscriber: Subscriber<{ data: string }>) {

        const jsonBase = await this.jsonBaseRepository.getSingleJsonBase(id);

        await this.uploadImages(jsonBase, 'webp', subscriber);
    }

    private async uploadImages(jsonBase: JsonBase, imgType: string, subscriber: Subscriber<{ data: string }>) {
        const {setCode} = jsonBase
        this.log.log(`Amazon upload start with ${setCode} and ${imgType}`);
        const imgFolder = `../img-new/${setCode}/finished/${setCode}/${imgType}`;
        const imgArr: string[] = fs.readdirSync(imgFolder);

        let count = 0;
        subscriber.next({
            data: JSON.stringify({
                finishedProcess: count,
                maxProcess: imgArr.length,
            }),
        });
        
        for (const imgFile of imgArr) {
            const destPath = `${setCode}/${imgType}/${imgFile}`;
            this.log.log(`upload start for ${destPath}`);
            const imgPath = `d:\\Projects\\magic\\ultimate-card-gatherer\\img-new\\${setCode}\\finished\\${setCode}\\${imgType}\\${imgFile}`;
            await this.awsCli.command(
                `s3api put-object --bucket magiccollection --key ${destPath} ` +
                    `--body ${imgPath} ` +
                    `--acl public-read --content-type image/png --cache-control "public, max-age=31536000"`,
            );

            subscriber.next({
                data: JSON.stringify({
                    finishedProcess: ++count,
                    maxProcess: imgArr.length,
                }),
            });
        }
        subscriber.complete();
        await this.jsonBaseRepository.setFlagToTrueAndSave(jsonBase, 'isUploadAwsF');
    }
}
