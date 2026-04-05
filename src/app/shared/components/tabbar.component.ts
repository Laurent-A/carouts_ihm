import { Component } from '@angular/core';
import { RouterModule, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-tabbar',
  standalone: true,
  imports: [RouterModule, RouterLinkActive],
  templateUrl: './tabbar.component.html',
  styleUrls: ['./tabbar.component.scss']
})
export class TabbarComponent {}
