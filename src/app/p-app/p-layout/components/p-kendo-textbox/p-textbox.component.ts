import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { SVGIcon } from '@progress/kendo-svg-icons';
import { Ps_UtilObjectService } from 'src/app/p-lib';
@Component({
    selector: 'app-p-textbox',
    templateUrl: './p-textbox.component.html',
    styleUrls: ['./p-textbox.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PKendoTextboxComponent),
            multi: true
        }
    ]
})
export class PKendoTextboxComponent implements OnInit, ControlValueAccessor, OnChanges {
    //required input
    @Input({ required: true }) propName: string = '';

    //Variable to store value from parent
    input: string = '';

    @Input() disabled: boolean = false;
    @Input() readonly: boolean = false;
    @Input() placeHolder: string;
    @Input() clearButton: boolean = false;
    @Input() required: boolean = false;
    @Input() maxlength: number;
    //validation icon with boolean condition from parent
    @Input() successValidation: boolean = false;
    @Input() errorValidation: boolean = false;
    //Kendo svg icon as a prefix or suffix
    @Input() svgPrefixIcon: SVGIcon;
    @Input() svgSuffixIcon: SVGIcon;
    //Kendo span icon as a prefix or suffix
    @Input() spanPrefixIcon: string = '';
    @Input() spanSuffixIcon: string = '';

    @Input() width: string = '';
    // Boolean
    isValueChanged: boolean = false; // Tracks whether the value has changed

    // Character count
    counterString: string = ''; // String representation of the character count
    charactersCount: number = 0; // Actual character count

    // Outer events
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>(); // Event emitted when the value changes
    @Output() blur: EventEmitter<string[]> = new EventEmitter<string[]>(); // Event emitted when the textbox loses focus after the value changes
    @Output() keydownEnter: EventEmitter<string> = new EventEmitter<string>(); // Event emitted when the Enter key is pressed
    @Output() focus: EventEmitter<void> = new EventEmitter<void>();



    onChange = (_: any) => { } // Placeholder function for value change event
    onTouched = (_: any) => { } // Placeholder function for touch event

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Tracking change of disabled prop
        if (changes.disabled && changes.disabled.previousValue !== changes.disabled.currentValue) {
            this.disabled = changes.disabled.currentValue;
        }
    }

    writeValue(value: string) {
        this.input = value; // Update the input value
        this.charactersCount = Ps_UtilObjectService.hasValueString(this.input) ? this.input.length : 0;
        this.counterString = `${this.charactersCount}/${this.maxlength}`; // Update the counter string
    }

    registerOnChange(onChangeFn: any) {
        this.onChange = onChangeFn; // Register the value change callback
    }

    registerOnTouched(onTouchFn: any) {
        this.onTouched = onTouchFn; // Register the touch event callback
    }

    onInputValueChange(e: any): void {
        if (this.disabled == true) {
            return; // If the textbox is disabled, do nothing
        } else {
            this.input = e;
            this.charactersCount = e.length;
            this.counterString = `${e.length}/${this.maxlength}`;
            this.valueChange.emit(this.input); // Emit the value change event
            this.onChange(this.input); // Call the registered value change callback
            this.isValueChanged = true; // Set the value changed flag
        }
    }

    onBlur(e: any): void {
        if (this.isValueChanged) {
            this.blur.emit([this.propName]);
            this.isValueChanged = false; // Reset the value changed flag
        }
    }

    onKeyDownEnter(e: any): void {
        // Emit the onKeyDownEnter event with the input value
        this.keydownEnter.emit(this.input);
    }

    onFocus(): void {
        this.focus.emit();
    }
}
