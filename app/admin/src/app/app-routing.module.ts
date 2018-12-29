import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ChartComponent } from "./chart/chart.component";
import { DataComponent } from "./data/data.component";
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
  { path: "chart", component: ChartComponent },
  { path: "login", component: LoginComponent },
  { path: "data", component: DataComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
export const routingComponenents = [
  ChartComponent,
  DataComponent,
  LoginComponent
];
