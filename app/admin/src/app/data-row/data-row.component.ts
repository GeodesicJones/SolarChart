import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "[app-data-row]",
  templateUrl: "./data-row.component.html",
  styleUrls: ["./data-row.component.css", "../../assets/typicons.min.css"]
})
export class DataRowComponent implements OnInit {
  constructor() {}

  date: Date;
  dial: Number;

  @Input() row: any;
  @Output() rowChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeRow: EventEmitter<any> = new EventEmitter<any>();

  @Input() editing: boolean = false;

  edit() {
    this.editing = true;
  }

  save() {
    this.row.date = this.date;
    this.row.dial = this.dial;
    this.editing = false;
    this.rowChange.emit();
  }

  cancel() {
    this.editing = false;
    this.date = this.row.date;
    this.dial = this.row.dial;
    if (!this.dial) {
      this.remove();
    }
  }

  remove() {
    this.removeRow.emit();
  }

  ngOnInit() {
    this.date = this.row.date;
    this.dial = this.row.dial;
    this.editing = !this.row.dial;
  }
}
