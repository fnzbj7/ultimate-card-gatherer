import { HttpClient } from '@angular/common/http';
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

    this.http.get<MigrationDto>(`/api/${this.id}/generate-migration`).subscribe((x) => {
      // TODO ez is benne van a store-ba
      if (x) {
        this.code = x.cardService;
        this.text = x.text;
        this.fileName = x.fileName;
        this.className = x.className;

        this.importCode = this.createImportCode(this.fileName, this.className);
      }
    });
  }

  downloadMigrationFile() {
    this.http.get<MigrationDto>(`/api/${this.id}/generate-migration?create=yes`).subscribe((x) => {
      this.store.dispatch(finishTask({ taskId: 'isMigrationGeneratedF' }));
      this.code = x.cardService;

      this.text = x.text;
      this.fileName = x.fileName;
      this.className = x.className;

      this.importCode = this.createImportCode(this.fileName, this.className);

      if (this.text && this.fileName) {
        this.generateDownload(this.text, this.fileName);
      }
    });
  }
  private createImportCode(fileName: string, className: string) {
    return `import { ${className} } from '../app/migration/${fileName.split('.ts')[0]}'`
  }

  downloadCurrent() {
    if (this.text && this.fileName) {
      this.generateDownload(this.text, this.fileName);
    }
  }

  private generateDownload(text: string, fileName: string) {
    let fileContent = format(text, {
      parser: 'typescript',
      plugins: [parserTypeScript],
    });
    const file = new Blob([fileContent], { type: 'text/plain' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = fileName;
    link.click();
    link.remove();
  }
}
