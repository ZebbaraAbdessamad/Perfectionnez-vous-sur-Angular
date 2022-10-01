import { ActivatedRoute, Router } from '@angular/router';
import { Candidate } from './../../models/candidate.model';
import { CandidatesService } from './../../services/candidates.service';
import { Observable, switchMap, take, tap } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-single-candidate',
  templateUrl: './single-candidate.component.html',
  styleUrls: ['./single-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleCandidateComponent implements OnInit {
  loading$!: Observable<boolean>;
  candidate$!: Observable<Candidate>;

  constructor(
    private candidatesService: CandidatesService,
    private route:ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
   this.initObservables();
  }

  private initObservables() {
    this.loading$ = this.candidatesService.loading$;
    //params est un observable
    this.candidate$ = this.route.params.pipe(
      //Il faut cast le paramètre en  number  (avec  +  )
      switchMap(params => this.candidatesService.getCandidateById(+params['id']))
    );
  }

  onGoBack() {
  this.router.navigateByUrl('/reactive-state/candidates')
  }

  onRefuse() {
    //Vous utilisez take(1) car la logique ici ne doit être exécutée qu'une seule fois par appel.
    this.candidate$.pipe(
        take(1),
        tap(candidate => {
            this.candidatesService.refuseCandidate(candidate.id);
            this.onGoBack();
        })
    ).subscribe();
  }

  onHire() {
    this.candidate$.pipe(
        take(1),
        tap(candidate => {
            this.candidatesService.hireCandidate(candidate.id);
            this.onGoBack();
        })
    ).subscribe();
  }
}
