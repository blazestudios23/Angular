import { Component, OnInit, Inject } from '@angular/core';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import 'rxjs/add/operator/switchMap';

import { Comment } from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  errMess: string;
  dish: Dish;
  dishIds: number[];
  prev: number;
  next: number;
  dishcopy = null;
  visibility = 'shown';

  commentForm: FormGroup;
  comment: Comment;

  formErrors = {
    'author': '',
    'comment': ''
  };


  validationMessages = {
    'author': {
      'required': 'Author is required.',
      'minlength': 'Author must be at least 2 characters long.',
    },
    'comment': {
      'required': 'Comment is required.',
      'minlength': 'Comment must be at least 2 characters long.',
    },
  }


  constructor(private dishservice: DishService,
  private fb: FormBuilder,
  private route: ActivatedRoute,
  private location: Location,
  @Inject('BaseURL') private BaseURL) {
  this.createForm();
}

createForm(): void {
   this.commentForm = this.fb.group({
     rating: '5',
     author: ['', [Validators.required, Validators.minLength(2)]],
     comment: ['', [Validators.required, Validators.minLength(2)]],
     date: [''],
   });

   this.commentForm.valueChanges
     .subscribe(data => this.onValueChanged(data),
     errmess => this.errMess = <any>errmess);

   this.onValueChanged(); // (re)set validation messages now
 }

 ngOnInit() {
   this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
   this.route.params.switchMap((params: Params) => this.dishservice.getDish(+params['id']))
  .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); },
      errmess => this.errMess = <any>errmess);
 }

 setPrevNext(dishId: number) {
  let index = this.dishIds.indexOf(dishId);
  this.prev = this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
  this.next = this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
}

 goBack(): void {
   this.location.back();
 }

 onSubmit() {
     this.comment = this.commentForm.value;
     this.comment.date = new Date().toISOString();
     console.log(this.comment);
     this.dishcopy.comments.push(this.comment);
     this.dishcopy.save()
       .subscribe(dish => { this.dish = dish; console.log(this.dish); });
     this.commentForm.reset({
       rating: '5',
       author: '',
       comment: ''
     });
   }

   onValueChanged(data?: any) {
     if (!this.commentForm) { return; }
     const form = this.commentForm;
     for (const field in this.formErrors) {
       // clear previous error message (if any)
       this.formErrors[field] = '';
       const control = form.get(field);
       if (control && control.dirty && !control.valid) {
         const messages = this.validationMessages[field];
         for (const key in control.errors) {
           this.formErrors[field] += messages[key] + ' ';
         }
       }
     }
   }

}
