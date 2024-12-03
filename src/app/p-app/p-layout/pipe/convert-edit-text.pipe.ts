import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'convertStringEditor' })

export class ConvertStringEditorPipe implements PipeTransform {
    transform(editorString: string) {
        const div = document.createElement('div');
        div.innerHTML = editorString;
        return div.textContent || div.innerText || '';        
    }   
}