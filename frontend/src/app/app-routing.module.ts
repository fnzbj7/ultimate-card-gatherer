import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DownloadScreenComponent} from "./download-screen/download-screen.component";
import {CompareScreenComponent} from "./compare-screen/compare-screen.component";
import { NewUploadComponent } from './new-upload/new-upload.component';

const routes: Routes = [
  {path: '', component: DownloadScreenComponent },
  {path: 'compare/:jsonName', component: CompareScreenComponent},
  {path: 'new-upload', component: NewUploadComponent}
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
