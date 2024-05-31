import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BootstrapIconsModule } from "ng-bootstrap-icons";
import { Speedometer2, Newspaper, JournalAlbum, FileImage } from "ng-bootstrap-icons/icons";

const icons = {
  Speedometer2,
  Newspaper,
  JournalAlbum,
  FileImage
};

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BootstrapIconsModule.pick(icons)
  ],
  exports: [
    BootstrapIconsModule
  ]
})
export class IconsModule { }
