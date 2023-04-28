import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingScreenComponent } from './landing-screen/landing-screen.component';
import { UrlUploadComponent } from './url-upload/url-upload.component';
import { HubComponent } from './hub/hub.component';
import { ImageDownloadComponent } from './image-download/image-download.component';

const routes: Routes = [
  {path: '', component: LandingScreenComponent },
  {path: 'url-upload/:id', component: UrlUploadComponent },
  {path: 'image-download/:id', component: ImageDownloadComponent },
  {path: 'hub/:id', component: HubComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
