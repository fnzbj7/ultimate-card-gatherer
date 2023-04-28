import { Injectable, NgZone } from '@angular/core';

@Injectable({providedIn: 'root'})
export class SseService {

    constructor(private _zone: NgZone) {}

    createEventSource<T>(url: string, cb: (resp: T) => void) {
        const eventSource = new EventSource(url);
        eventSource.onmessage = event => {
            const messageData: T = JSON.parse(event.data);
            this._zone.run(cb.bind(null,messageData))
            
        };
        eventSource.onerror = (c) => {
            eventSource.close();
        }
    }
}
