import { slideAndFadeAnimation } from './../../animations/slide-and-fade.animation';
import { flashAnimation } from './../../animations/flash.animation';
import { animate, animateChild, group, query, sequence, stagger, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { Input,Output ,Component, OnInit, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Comment } from 'src/app/core/models/comment.model';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  animations: [
    trigger('list', [
        transition(':enter', [
            query('@listItem', [
              //on utilise stagger pour decalé les animation de '@listItem' par 50ms pour chaque animateChild
                stagger(50, [
                    animateChild()
                ])
            ])
        ])
    ]),
    trigger('listItem', [
      state('default', style({
        transform: 'scale(1)',
        'background-color': 'white',
        'z-index': 1
      })),
      state('active', style({
        transform: 'scale(1.05)',
        'background-color':  'rgb(201, 157, 242)',
        'z-index': 2
      })),
      transition('default => active', [
        animate('100ms ease-in-out')
      ]),
      transition('active => default', [
        animate('500ms ease-in-out')
      ]),
      //void => * : ciblez les animations depuis "le vide" vers n'importe quel autre état.
      //'void => *' equivalent par son raccourci  ':enter'
      //on utilise 'opacity:0' pour mettre le element html invisible
      transition('void => *', [
        //query  peut cibler plusieurs éléments à la fois !
        query('.comment-text, .comment-date', [
          style({
              opacity: 0
          })
        ]),
        useAnimation(slideAndFadeAnimation, {
          params: {
              time: '500ms',
              startColor: 'rgb(201, 157, 242)'
          }
        }),
        group([
          useAnimation(flashAnimation, {
            params: {
                time: '250ms',
                flashColor: 'rgb(249,179,111)'
            }
          }),
          query('.comment-text', [
              animate('250ms', style({
                  opacity: 1
              }))
          ]),
          query('.comment-date', [
              animate('500ms', style({
                  opacity: 1
              }))
          ]),
        ])
    ])
    ])
  ]

})
export class CommentsComponent implements OnInit {

  @Input() comments!: Comment[];
  commentCtrl!: FormControl;
  @Output() newComment = new EventEmitter<string>();

  animationStates: { [key: number]: 'default' | 'active' } = {};

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.commentCtrl=this.formBuilder.control('',[Validators.required ,Validators.minLength(5)]);

    //animation
    for(let index in this.comments){
      this.animationStates[index];
    }
    //explication
    /*
      animationStates = {
      0: 'default',
      1: 'default',
      2: 'default'
      };

    */
  }

  onLeaveComment() {
    if (this.commentCtrl.invalid) {
        return;
    }
    const maxId = Math.max(
      /*  transformez le tableau de  Comment  en tableau de  number  avec la fonction  map  . */
      ...this.comments.map(comment => comment.id)
    );
    /*
      unshift est comme push la différence est que push ajouter des éléments à la fin de tableau
      mais  unshift ajouter des éléments au début de tableau
    */
    this.comments.unshift({
        id: maxId + 1,
        comment: this.commentCtrl.value,
        createdDate: new Date().toISOString(),
        userId: 1
    });
    this.newComment.emit(this.commentCtrl.value);
    this.commentCtrl.reset();

  }

  onListItemMouseEnter(index:number) {
    this.animationStates[index] = 'active';
  }

  onListItemMouseLeave(index:number) {
    this.animationStates[index] = 'default';
  }
}
