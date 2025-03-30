import { Injectable, Logger } from '@nestjs/common';
import fs = require('fs');
import aw = require('aws-cli-js');
import { JsonBaseRepository } from '../repository/json-base.repository'
import { Subscriber } from 'rxjs';
import { JsonBase } from 'src/entities/entities/json-base.entity';


export const staticImgPath = process.env.DIR_PATH || 'img-new'; // Change it in the 

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

    private getImageFiles(setCode: string, imgType: string): string[] {
        const primaryFolder = `${staticImgPath}/${setCode}/finished/${setCode}/${imgType}`;
        const fallbackFolder = `${staticImgPath}/${setCode}/rename`;
    
        try {
            // Try to read files from the primary folder
            const files = fs.readdirSync(primaryFolder);
            if (files.length > 0) {
                return files;
            }
        } catch (error) {
            this.log.warn(`Primary folder not found or empty: ${primaryFolder}`);
        }
    
        try {
            // Fallback to the renamed folder and filter for .webp files
            const fallbackFiles = fs.readdirSync(fallbackFolder);
            return fallbackFiles.filter(file => file.endsWith('.webp'));
        } catch (error) {
            this.log.error(`Fallback folder not found or empty: ${fallbackFolder}`);
            return [];
        }
    }

    private async uploadImages(jsonBase: JsonBase, imgType: string, subscriber: Subscriber<{ data: string }>) {
        const {setCode} = jsonBase
        this.log.log(`Amazon upload start with ${setCode} and ${imgType}`);
        const imgArr: string[] = this.getImageFiles(setCode, imgType);

        let count = 0;
        subscriber.next({
            data: JSON.stringify({
                finishedProcess: count,
                maxProcess: imgArr.length,
            }),
        });

        const currentDirectory = process.cwd().split('\\').join('\\\\');
        const primaryFolder = `${currentDirectory}\\${staticImgPath}\\${setCode}\\finished\\${setCode}\\${imgType}`;
        const fallbackFolder = `${currentDirectory}\\${staticImgPath}\\${setCode}\\rename`;

        // Check if the primary folder exists
        const isPrimaryFolderAvailable = fs.existsSync(primaryFolder);

        for (const imgFile of imgArr) {
            const destPath = `${setCode}/${imgType}/${imgFile}`;
            this.log.log(`upload start for ${destPath}`);
            const imgPath = isPrimaryFolderAvailable
            ? `${primaryFolder}\\${imgFile}`
            : `${fallbackFolder}\\${imgFile}`;
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
