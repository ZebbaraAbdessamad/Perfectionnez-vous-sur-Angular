import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Candidate } from './../models/candidate.model';
import { BehaviorSubject, Observable, delay, tap, map, switchMap, take } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class CandidatesService {
  constructor(private http: HttpClient) {}
  /*loading$  – qui émettra  true  ou  false  selon qu'un chargement est en cours ou non ; */
  private _loading$ = new BehaviorSubject<boolean>(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

   /* candidates$  – qui émettra des tableaux de  Candidate */
  private _candidates$ = new BehaviorSubject<Candidate[]>([]);
  get candidates$(): Observable<Candidate[]> {
    return this._candidates$.asObservable();
  }

  //change loading status
  private setLoadingStatus(loading: boolean) {
    this._loading$.next(loading);
  }

  //declaration pour le test de chargement de candidat
  private lastCandidatesLoad = 0;

  //la récupération des candidats et la émission de l'évenment
  getCandidatesFromServer() {
    //300.000 (5 minutes en millisecondes)
    if (Date.now() - this.lastCandidatesLoad <= 300000) {
      return;
    }
    this.setLoadingStatus(true);
    this.http.get<Candidate[]>(`${environment.apiUrl}/candidates`).pipe(
      delay(1000),
      tap(candidates => {
        this.lastCandidatesLoad=Date.now();
        this._candidates$.next(candidates);
        this.setLoadingStatus(false);
      })
    ).subscribe();
  }

  // la méthod qui de filtré la liste des candidats par le id demandé.
  getCandidateById(id: number): Observable<Candidate> {
    // ce test pour montrer recharger la lists si n'est pas charger
    if (!this.lastCandidatesLoad) {
      this.getCandidatesFromServer();
    }
    return this.candidates$.pipe(
        map(candidates => candidates.filter(candidate => candidate.id === id)[0])
    );
  }


  //la supperesion des candidats
  refuseCandidate(id: number): void {
    this.setLoadingStatus(true);
    this.http.delete(`${environment.apiUrl}/candidates/${id}`).pipe(
        //délai d'un second
        delay(1000),
        switchMap(() => this.candidates$),
        //si vous ne mettez pas le take(1) , vous finirez dans un infinite loop
        take(1),
        map(candidates => candidates.filter(candidate => candidate.id !== id)),
        tap(candidates => {
            this._candidates$.next(candidates);
            this.setLoadingStatus(false);
        })
    ).subscribe();
  }


  //la modéfication des des candidats:
  hireCandidate(id: number): void {
    this.setLoadingStatus(true);
    this.candidates$.pipe(
        take(1),
        map(candidates =>
          // remarque le symbole => représente un affectation au bien un équivalance
            candidates.map(candidate =>
               candidate.id === id ? { ...candidate, company: 'Snapface Ltd' } : candidate
            )
        ),
        delay(1000),
        tap(updatedCandidates => {
          this._candidates$.next(updatedCandidates);
          this.setLoadingStatus(false);
        }),
        switchMap(updatedCandidates =>
            this.http.patch(`${environment.apiUrl}/candidates/${id}`, updatedCandidates.find(candidate => candidate.id === id))
        )
    ).subscribe();
  }
}
