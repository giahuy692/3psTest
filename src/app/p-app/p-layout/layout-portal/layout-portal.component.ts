import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PS_HelperMenuService } from '../services/p-menu.helper.service';

@Component({
  selector: 'app-layout-portal',
  templateUrl: './layout-portal.component.html',
  styleUrls: ['./layout-portal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutPortalComponent implements OnInit {

  constructor(public menuService: PS_HelperMenuService,
    public router: Router,
    public activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
  }

}