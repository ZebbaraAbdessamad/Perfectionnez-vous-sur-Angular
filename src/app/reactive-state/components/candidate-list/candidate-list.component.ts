import { MatTableDataSource } from '@angular/material/table';
import { CandidateSearchType } from './../../enums/candidate-search-type.enum';
import { FormControl, FormBuilder } from '@angular/forms';
import { Candidate } from './../../models/candidate.model';
import { Observable, startWith, map, combineLatest, tap } from 'rxjs';
import { CandidatesService } from './../../services/candidates.service';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateListComponent implements OnInit {

  loading$!: Observable<boolean>;
  candidates$!: Observable<Candidate[]>;

  //declaration pour la recherche
  searchCtrl!: FormControl;
  searchTypeCtrl!: FormControl;

  //declartion paginator
  displayedColumns = ['fullname', 'date', 'category', 'brand', 'model', 'type'];
  @ViewChild(MatPaginator) paginator!:MatPaginator;
  dataSource =new MatTableDataSource();
  totalLength = 0;
  pageIndex!:number;
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  //declaration d'une tableaux des objet ,pour associer chaque type par un lable
  searchTypeOptions!: {
    value: CandidateSearchType,
    label: string
  }[];

  constructor(
    private candidatesService: CandidatesService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.initObservables();
    this.candidatesService.getCandidatesFromServer();
  }


  //pagination
  ngAfterContentInit(): void {
    this.dataSource.paginator=this.paginator;
  }
  getData(event:PageEvent){
    this.candidates$.subscribe(candidats=>{
        this.dataSource.data=candidats;
        this.totalLength=candidats.length ;
     } );
  }


  private initForm() {
    this.searchCtrl = this.formBuilder.control('');
    this.searchTypeCtrl=this.formBuilder.control(CandidateSearchType.LASTNAME);
    this.searchTypeOptions = [
      { value: CandidateSearchType.LASTNAME, label: 'Nom' },
      { value: CandidateSearchType.FIRSTNAME, label: 'Prénom' },
      { value: CandidateSearchType.COMPANY, label: 'Entreprise' }
    ];
  }

  private initObservables() {
    this.loading$ = this.candidatesService.loading$;
    //this.candidates$ = this.candidatesService.candidates$;

      //obesrvable de la recherche
      const search$ = this.searchCtrl.valueChanges.pipe(
          startWith(this.searchCtrl.value),
          map(value => value.toLowerCase())
      );
      const searchType$: Observable<CandidateSearchType> = this.searchTypeCtrl.valueChanges.pipe(
          startWith(this.searchTypeCtrl.value)
      );
      //L'opérateur combineLatest prend un tableau d'Observables en argument.
      this.candidates$ = combineLatest([
        search$,
        searchType$,
        this.candidatesService.candidates$
      ]).pipe(
          // filter candidates here
          map(([search, searchType, candidates]) => candidates.filter(candidate => candidate[searchType].toLowerCase().includes(search as string)))
      );
  }



}
