import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { ChartComponent } from "./chart/chart.component";
import { AppRoutingModule, routingComponenents } from "./app-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { LoginComponent } from "./login/login.component";
import { DataComponent } from "./data/data.component";
import { DataRowComponent } from "./data-row/data-row.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    routingComponenents,
    LoginComponent,
    DataComponent,
    DataRowComponent
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
