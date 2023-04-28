import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingScreenComponent } from './landing-screen/landing-screen.component';
import { HttpClientModule } from '@angular/common/http';
import { UrlUploadComponent } from './url-upload/url-upload.component';
import { FormsModule } from '@angular/forms';
import { HubComponent } from './hub/hub.component';
import { ImageDownloadComponent } from './image-download/image-download.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingScreenComponent,
    UrlUploadComponent,
    ImageDownloadComponent,
    HubComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
