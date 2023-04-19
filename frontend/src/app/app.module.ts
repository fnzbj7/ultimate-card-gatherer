import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DownloadScreenComponent} from "./download-screen/download-screen.component";
import {CompareScreenComponent} from "./compare-screen/compare-screen.component";
import { NewUploadComponent } from './new-upload/new-upload.component';

@NgModule({
  declarations: [
    AppComponent,
    DownloadScreenComponent,
    CompareScreenComponent,
    NewUploadComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
