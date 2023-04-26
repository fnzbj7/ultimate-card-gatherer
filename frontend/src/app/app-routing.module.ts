import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingScreenComponent } from './landing-screen/landing-screen.component';
import { UrlUploadComponent } from './url-upload/url-upload.component';
import { HubComponent } from './hub/hub.component';

const routes: Routes = [
  {path: '', component: LandingScreenComponent },
  {path: 'url-upload', component: UrlUploadComponent },
  {path: 'hub', component: HubComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
