import {Injectable, Logger} from "@nestjs/common";
import fs = require("fs");

@Injectable()
export class AwsCardUploadService {
    private log = new Logger(AwsCardUploadService.name);

    awsCli;

    constructor() {
        const Aws = require('aws-cli-js').Aws;
        this.awsCli = new Aws()
    }

    async startAwsUpload(setName: string) {

        await this.uploadImages(setName, 'png');
        await this.uploadImages(setName, 'webp');

    }

    private async uploadImages(setName: string, imgType: string) {
        this.log.log(`Amazon upload start with ${setName} and ${imgType}`);
        let imgFolder = `../img/${setName}/${imgType}`;
        let imgArr: string[] = fs.readdirSync(imgFolder);
        for(let imgFile of imgArr) {
            let destPath = `${setName}/${imgType}/${imgFile}`;
            this.log.log(`upload start for ${destPath}`);
            let imgPath = `f:\\Express\\usefull_apps\\ultimate_card_gatherer\\img\\${setName}\\${imgType}\\${imgFile}`;
            await this.awsCli.command(`s3api put-object --bucket magiccollection --key ${destPath} ` +
                `--body ${imgPath} ` +
                `--acl public-read --content-type image/png --cache-control "public, max-age=31536000"`);
        }
    }
}
