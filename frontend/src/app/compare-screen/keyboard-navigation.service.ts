import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface KeyboardCommand {
  action:
    | 'next'
    | 'previous'
    | 'nextIssue'
    | 'prevIssue'
    | 'selectNumber'
    | 'selectSuggested'
    | 'selectNope'
    | 'skip'
    | 'submit'
    | 'first'
    | 'last'
    | 'toggleHelp';
  value?: number;
}

@Injectable({
  providedIn: 'root',
})
export class KeyboardNavigationService {
  private commandSubject = new Subject<KeyboardCommand>();
  public commands$ = this.commandSubject.asObservable();

  private isEnabled = true;

  constructor() {
    this.setupKeyboardListeners();
  }

  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!this.isEnabled) {
        return;
      }

      // Ignore if user is typing in an input/textarea (but allow radio buttons)
      const target = event.target as HTMLElement;
      if (target.tagName === 'TEXTAREA') {
        return;
      }
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'radio') {
        return;
      }

      const key = event.key.toLowerCase();
      const shift = event.shiftKey;

      // Navigation
      if (key === 'arrowdown' || key === 'j') {
        event.preventDefault();
        if (shift) {
          this.commandSubject.next({ action: 'nextIssue' });
        } else {
          this.commandSubject.next({ action: 'next' });
        }
      } else if (key === 'arrowup' || key === 'k') {
        event.preventDefault();
        if (shift) {
          this.commandSubject.next({ action: 'prevIssue' });
        } else {
          this.commandSubject.next({ action: 'previous' });
        }
      } else if (key === 'home') {
        event.preventDefault();
        this.commandSubject.next({ action: 'first' });
      } else if (key === 'end') {
        event.preventDefault();
        this.commandSubject.next({ action: 'last' });
      }

      // Selection
      else if (key === ' ' || key === '0') {
        event.preventDefault();
        this.commandSubject.next({ action: 'selectSuggested' });
      } else if (key >= '1' && key <= '9') {
        event.preventDefault();
        this.commandSubject.next({ action: 'selectNumber', value: parseInt(key, 10) });
      } else if (key === 'x') {
        event.preventDefault();
        this.commandSubject.next({ action: 'selectNope' });
      } else if (key === 's') {
        event.preventDefault();
        this.commandSubject.next({ action: 'skip' });
      }

      // Actions
      else if (key === 'enter' && !shift) {
        event.preventDefault();
        this.commandSubject.next({ action: 'submit' });
      }

      // Help
      else if (key === '?') {
        event.preventDefault();
        this.commandSubject.next({ action: 'toggleHelp' });
      }
    });
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }
}
