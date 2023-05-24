import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingScreenComponent } from './landing-screen/landing-screen.component';
import { UrlUploadComponent } from './url-upload/url-upload.component';
import { HubComponent } from './hub/hub.component';
import { ImageDownloadComponent } from './image-download/image-download.component';
import { IconUploadComponent } from './icon-upload/icon-upload.component';
import { CompareScreenComponent } from './compare-screen/compare-screen.component';
import { ConvertImgComponent } from './convert-img/convert-img.component';
import { GenerateMigrationComponent } from './generate-migration/generate-migration.component';
import { UploadJsonComponent } from './upload-json/upload-json.component';
import { AwsUploadComponent } from './aws-upload/aws-upload.component';

const routes: Routes = [
  { path: '', component: LandingScreenComponent },
  { path: 'hub/:id', component: HubComponent },
  { path: 'url-upload/:id', component: UrlUploadComponent },
  { path: 'image-download/:id', component: ImageDownloadComponent },
  { path: 'icon-upload/:id', component: IconUploadComponent },
  { path: 'compare/:id', component: CompareScreenComponent },
  { path: 'convert/:id', component: ConvertImgComponent },
  { path: 'generate-migration/:id', component: GenerateMigrationComponent },
  { path: 'upload-json/:id', component: UploadJsonComponent },
  { path: 'aws-upload/:id', component: AwsUploadComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
