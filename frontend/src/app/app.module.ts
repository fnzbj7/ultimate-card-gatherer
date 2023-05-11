import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingScreenComponent } from './landing-screen/landing-screen.component';
import { HttpClientModule } from '@angular/common/http';
import { UrlUploadComponent } from './url-upload/url-upload.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HubComponent } from './hub/hub.component';
import { ImageDownloadComponent } from './image-download/image-download.component';
import { LoadingBarComponent } from './ui/loading-bar/loading-bar.conponent';
import { IconUploadComponent } from './icon-upload/icon-upload.component';
import { BreadcrumbComponent } from './ui/breadcrumb/breadcrumb.component';
import { CompareScreenComponent } from './compare-screen/compare-screen.component';
import { ConvertImgComponent } from './convert-img/convert-img.component';
import { GenerateMigrationComponent } from './generate-migration/generate-migration.component';
import { MenuBtnComponent } from './ui/menu-btn/menu-btn.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingScreenComponent,
    UrlUploadComponent,
    ImageDownloadComponent,
    HubComponent,
    LoadingBarComponent,
    IconUploadComponent,
    BreadcrumbComponent,
    CompareScreenComponent,
    ConvertImgComponent,
    GenerateMigrationComponent,
    MenuBtnComponent,
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
