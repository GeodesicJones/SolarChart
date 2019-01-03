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
  code14: Number;
  code24: Number;

  @Input() row: any;
  @Output() rowChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeRow: EventEmitter<any> = new EventEmitter<any>();

  @Input() editing: boolean = false;

  edit() {
    this.editing = true;
  }

  setDataFromRow() {
    this.date = this.row.date;
    this.dial = this.row.dial;
    this.code14 = this.row.code14;
    this.code24 = this.row.code24;
  }

  save() {
    this.row.date = this.date;
    this.row.dial = this.dial;
    this.row.code14 = this.code14;
    this.row.code24 = this.code24;
    this.editing = false;
    this.rowChange.emit();
  }

  cancel() {
    this.editing = false;
    this.setDataFromRow();
    if (!this.dial) {
      this.remove();
    }
  }

  remove() {
    this.removeRow.emit();
  }

  ngOnInit() {
    this.setDataFromRow();
    this.editing = !this.row.dial;
  }
}
