import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabbarComponent } from './shared/components/tabbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TabbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}