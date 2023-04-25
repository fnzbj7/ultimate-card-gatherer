import { Injectable, Logger } from '@nestjs/common';
import fs = require('fs');
import aw = require('aws-cli-js');

@Injectable()
export class AwsCardUploadService {
    private log = new Logger(AwsCardUploadService.name);

    awsCli;

    constructor() {
        const Aws = aw.Aws;
        this.awsCli = new Aws();
    }

    async startAwsUpload(setName: string) {
        // await this.uploadImages(setName, 'png');
        await this.uploadImages(setName, 'webp');
    }

    private async uploadImages(setName: string, imgType: string) {
        this.log.log(`Amazon upload start with ${setName} and ${imgType}`);
        const imgFolder = `../img/${setName}/${imgType}`;
        const imgArr: string[] = fs.readdirSync(imgFolder);
        for (const imgFile of imgArr) {
            const destPath = `${setName}/${imgType}/${imgFile}`;
            this.log.log(`upload start for ${destPath}`);
            const imgPath = `d:\\Projects\\magic\\ultimate-card-gatherer\\img\\${setName}\\${imgType}\\${imgFile}`;
            await this.awsCli.command(
                `s3api put-object --bucket magiccollection --key ${destPath} ` +
                    `--body ${imgPath} ` +
                    `--acl public-read --content-type image/png --cache-control "public, max-age=31536000"`,
            );
        }
    }
}
