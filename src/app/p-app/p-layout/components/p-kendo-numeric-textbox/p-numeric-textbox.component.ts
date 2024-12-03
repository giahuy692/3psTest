import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, forwardRef, ViewChild, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SVGIcon } from '@progress/kendo-svg-icons';

@Component({
    selector: 'app-p-numeric-textbox',
    templateUrl: './p-numeric-textbox.component.html',
    styleUrls: ['./p-numeric-textbox.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PKendoNumericTextboxComponent),
            multi: true
        }
    ]
})
export class PKendoNumericTextboxComponent implements ControlValueAccessor, AfterViewInit {
    @ViewChild('numericTextbox', { static: true }) numericTextboxRef!: any;
    //required input
    @Input({ required: true }) propName: string = '';

    //Variable to store value from parent
    input: string;


    @Input() disabled: boolean = false; 
    @Input() readonly: boolean = false;
    @Input() placeHolder: string = ''; 
    @Input() clearButton: boolean = false;
    @Input() spinners: boolean = true; //allow display spinner to decrease or increase value
    @Input() decimals = 0; //digits limitation, decimals = 2 => x.00
    //Kendo span icon as a prefix or suffix
    @Input() spanPrefixIcon: string = '';
    @Input() spanSuffixIcon: string = ''; 
    @Input() format: string = ''; // Format for numeric value
    @Input() min: number = 0; 
    @Input() max: number; 
    @Input() autoCorrect: boolean = true; // Whether to auto-correct the value
    @Input() step: number = 1; // Step value for increment/decrement
    @Input() width: number

    // Boolean
    isValueChanged: boolean = false; // Tracks whether the value has changed

    // Outer events
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>(); // Event emitted when the value changes
    @Output() blur: EventEmitter<string[]> = new EventEmitter<string[]>(); // Event emitted when the textbox loses focus after the value changes
    @Output() keydownEnter: EventEmitter<string> = new EventEmitter<string>(); // Event emitted when the Enter key is pressed
    @Output() focus: EventEmitter<string> = new EventEmitter<string>(); // Event emitted when the Enter key is pressed
    @Output() dblClick: EventEmitter<string> = new EventEmitter<string>(); // Event emitted when the Enter key is pressed

    constructor(private render: Renderer2) {}

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        const kendoNumeric = this.numericTextboxRef.hostElement.nativeElement;
        if (this.spanPrefixIcon) {
            const prefixIcon = document.createElement('span');
            prefixIcon.classList.add('k-icon', this.spanPrefixIcon, 'prefix-icon');
            kendoNumeric.prepend(prefixIcon); // Add the prefix icon element to the numericTextboxRef element
        }
        if (this.spanSuffixIcon) {
            const suffixIcon = document.createElement('span');
            suffixIcon.classList.add('k-icon', this.spanSuffixIcon, 'suffix-icon');
            this.render.insertBefore(kendoNumeric, suffixIcon, kendoNumeric.lastElementChild); // Add the suffix icon element to the numericTextboxRef element
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.disabled && changes.disabled.previousValue !== changes.disabled.currentValue) {
            this.disabled = changes.disabled.currentValue;
        }
    }

    onChange = (_: any) => {} // Placeholder function for value change event
    onTouched = (_: any) => {} // Placeholder function for touch event

    writeValue(value: string) {
        this.input = value; // Update the input value
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
            this.valueChange.emit(this.input); // Emit the value change event
            this.onChange(this.input); // Call the registered value change callback
            this.isValueChanged = true; // Set the value changed flag
        }
    }

    onBlur(e: any) {
        if (this.isValueChanged) {
            this.blur.emit([this.propName]); // Emit the onBlur event with the propName array
            this.isValueChanged = false; // Reset the value changed flag
        }
    }

    onKeyDownEnter(e: any) {
        this.keydownEnter.emit(this.input); // Emit the onKeyDownEnter event with the input value
    }

    onFocus(): void {
        this.focus.emit();
    }
    onDblClick(): void {
        this.dblClick.emit();
    }

}
