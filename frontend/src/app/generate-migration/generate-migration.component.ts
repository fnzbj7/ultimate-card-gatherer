import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as parserTypeScript from 'prettier/parser-typescript';
import { format } from 'prettier/standalone';
import { finishTask } from '../store/task.actions';
import { Store, select } from '@ngrx/store';
import { TaskService } from '../store/task.service';
import { AppState } from '../store/task.reducer';

interface MigrationDto {
  text: string;
  fileName: string;
  className: string;
  cardService: string;
}
@Component({
  selector: 'app-generate-migration',
  templateUrl: 'generate-migration.component.html',
})
export class GenerateMigrationComponent implements OnInit {
  id = '';
  setCode = '';

  code?: string;

  // importCode
  importCode?: string

  text?: string;
  fileName?: string;
  className?: string;

  copy = true;
  errorMessage = '';
  isLoading = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private taskService: TaskService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.store.pipe(select((state) => state.tasks)).subscribe((tasks) => {
      if (tasks.jsonBase) {
        const { jsonBase } = tasks;
        this.setCode = jsonBase.setCode;
      }
    });
    if (!this.taskService.id && this.id) {
      this.taskService.setId(+this.id);
    }

    this.loadMigration(false);
  }

  downloadMigrationFile() {
    this.loadMigration(true);
  }

  private loadMigration(create: boolean) {
    this.errorMessage = '';
    this.isLoading = true;
    this.http.get<MigrationDto>(`/api/${this.id}/generate-migration${create ? '?create=yes' : ''}`).subscribe({
      next: (migration) => {
        this.isLoading = false;
        if (!migration) {
          if (create) this.errorMessage = 'The server returned no migration. Try generating it again.';
          return;
        }
        this.code = migration.cardService;
        this.text = migration.text;
        this.fileName = migration.fileName;
        this.className = migration.className;
        this.importCode = this.createImportCode(migration.fileName, migration.className);
        if (create && this.text && this.fileName && this.generateDownload(this.text, this.fileName)) {
          this.store.dispatch(finishTask({ taskId: 'isMigrationGeneratedF' }));
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        const detail = error.error?.message || error.error || error.message;
        this.errorMessage = `Could not ${create ? 'generate' : 'load'} migration (HTTP ${error.status}): ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
      },
    });
  }
  private createImportCode(fileName: string, className: string) {
    return `import { ${className} } from '../app/migration/${fileName.split('.ts')[0]}';`
  }

  downloadCurrent() {
    if (this.text && this.fileName) {
      this.generateDownload(this.text, this.fileName);
    }
  }

  private generateDownload(text: string, fileName: string) {
    this.errorMessage = '';
    try {
      const fileContent = format(text, {
        parser: 'typescript',
        plugins: [parserTypeScript],
        // Match the destination pointless workspace's root .prettierrc.
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 4,
        printWidth: 100,
        arrowParens: 'avoid',
      });
      const file = new Blob([fileContent], { type: 'text/plain' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(file);
      link.href = url;
      link.download = fileName;
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      this.errorMessage = `Could not format/download ${fileName}: ${detail}\nTry Start migration to regenerate a previously saved migration.`;
      return false;
    }
  }
}
