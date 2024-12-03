import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, forwardRef, AfterViewInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';

@Component({
    selector: 'app-p-masked-textbox',
    templateUrl: './p-masked-textbox.component.html',
    styleUrls: ['./p-masked-textbox.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PKendoMaskedTextboxComponent),
            multi: true
        }
    ]
})
export class PKendoMaskedTextboxComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnChanges {
    @ViewChild('maskedTextbox', { static: true }) maskedTextboxRef!: any;
    
    //Required input
    @Input({ required: true }) propName: string = ''; // Required prop name to update

    //Variable to store value from parent
    input: string = ''; // Default input value
    
    @Input() disabled: boolean = false; // Whether the textbox is disabled
    @Input() readonly: boolean = false; // Whether the textbox is readonly
    @Input() includeLiterals: boolean = false; // Whether to include literals in the value, sign: '-'
    @Input() isMaskValidation: boolean = true; // Whether to perform mask validation
    @Input() spanPrefixIcon: string = ''; // Span icon as a prefix
    @Input() spanSuffixIcon: string = ''; // Span icon as a suffix
    @Input() mask = "0000000000"; // Mask pattern for the textbox
    @Input() prompt = null
    // Boolean
    isValueChanged: boolean = false; // Tracks whether the value has changed


    // Outer events
    @Output() valueChangeCallback: EventEmitter<string> = new EventEmitter<string>(); // Event emitted when the value changes
    @Output() onBlurCallback: EventEmitter<string[]> = new EventEmitter<string[]>(); // Event emitted when the textbox loses focus after the value changes
    @Output() keydownEnterCallback: EventEmitter<string> = new EventEmitter<string>(); // Event emitted when the Enter key is pressed

    constructor() { }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.disabled && changes.disabled.previousValue !== changes.disabled.currentValue) {
            this.disabled = changes.disabled.currentValue;
        }
    }


    ngAfterViewInit(): void {
        const kendoMaskedRef = this.maskedTextboxRef.hostElement.nativeElement;
        if (this.spanPrefixIcon) {
            const prefixIcon = document.createElement('span');
            prefixIcon.classList.add('k-icon', this.spanPrefixIcon, 'prefix-icon');
            kendoMaskedRef.prepend(prefixIcon); // Add the prefix icon element to the maskedTextboxRef element
        }
        if (this.spanSuffixIcon) {
            const suffixIcon = document.createElement('span');
            suffixIcon.classList.add('k-icon', this.spanSuffixIcon, 'suffix-icon');
            kendoMaskedRef.append(suffixIcon); // Add the suffix icon element to the maskedTextboxRef element
        }
    }

    onChange = (_: any) => { } // Placeholder function for value change event
    onTouched = (_: any) => { } // Placeholder function for touch event

    writeValue(value: string): void {
        // Assign new value which passed from parent
        this.input = value;
    }

    registerOnChange(onChangeFn: any) {
        this.onChange = onChangeFn; // Register the value change callback
    }

    registerOnTouched(onTouchFn: any) {
        this.onTouched = onTouchFn; // Register the touch event callback
    }

    onInputValueChange(e: any) {
        if (this.disabled == true) {
            return; // If the textbox is disabled, do nothing
        } else {
            this.input = e; // Update the input value
            this.valueChangeCallback.emit(this.input); // Emit the value change event
            this.onChange(this.input); // Call the registered value change callback
            this.isValueChanged = true; // Set the value changed flag
        }
    }

    onBlur(e: any) {
        if (this.isValueChanged) {
            this.onBlurCallback.emit([this.propName]); // Emit the onBlur event with the propName array
            this.isValueChanged = false; // Reset the value changed flag
        }
    }

    onKeyDownEnter(e: any) {
        this.keydownEnterCallback.emit(this.input); // Emit the onKeyDownEnter event with the input value
    }
}
