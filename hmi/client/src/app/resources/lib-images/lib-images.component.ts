import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { ResourceGroup, Resources, ResourceType } from '../../_models/resources';
import { ResourcesService } from '../../_services/resources.service';

@Component({
    selector: 'app-lib-images',
    templateUrl: './lib-images.component.html',
    styleUrls: ['./lib-images.component.css']
})
export class LibImagesComponent implements AfterViewInit, OnDestroy {

    resImages?: ResourceGroup[];
    subscription: Subscription;

    constructor(
        private dialogRef: MatDialogRef<LibImagesComponent>,
        private resourcesService: ResourcesService) { }

    ngAfterViewInit() {
        this.loadResources();
    }

    ngOnDestroy() {
        try {
            this.subscription.unsubscribe();
        } catch (err) {
            console.error(err);
        }
    }

    loadResources() {
        this.subscription = this.resourcesService.getResources(ResourceType.images).subscribe((result: Resources) => {
            if (result) {
                this.resImages = result.groups || [];
            }
        }, err => {
            console.error('get Resources images error: ' + err);
        });
    }

    onSelect(imgPath: string) {
        this.dialogRef.close(imgPath);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
