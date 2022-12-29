import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanRequestModel } from 'src/app/Model/loan';
import { AccountService } from 'src/app/Services/account.service';
import { LoanRequestService } from 'src/app/Services/loan-request.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-loan-request',
  templateUrl: './loan-request.component.html',
  styleUrls: ['./loan-request.component.css'],
})
export class LoanRequestComponent implements OnInit {
  loanRequestForm!: FormGroup;
  acct: any;
  userAcct: any;
  loanInfo: any;
  timerInterval: any;
  result: any;
  loanAmount!: number;
  repaymentPeriod!: number;
  interestRate!: number;
  principal!: number;
  interest!: number;
  incorrectPin = false;
  pinForm! : FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private loanRequestService: LoanRequestService,
    private route: Router,
    private accountService: AccountService,
    public activatedRoute: ActivatedRoute
  ) {
    this.pinForm = new FormGroup({
      pin: new FormControl('', [Validators.required, Validators.maxLength(4)]),
    });

    this.loanRequestForm = new FormGroup({
      amount: new FormControl('', [Validators.required]),
      purpose: new FormControl('', [Validators.required]),
      repaymentPeriod: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id: any = params.get('id');
      //  alert(id);
      if (id) {
        this.accountService.GetAccountById(id).subscribe({
          next: (res) => {
            this.userAcct = res;
            console.log(this.userAcct, 'ACTIVATED ROUTE');
          },
        });
      }
    });
    this.loanRequestForm = this.formBuilder.group({
      clientId: ['', Validators.required],
      amount: ['', Validators.required],
      purpose: ['', Validators.required],
      repaymentPeriod: ['', Validators.required],
    });
  }

  onSubmit() {
    const loanRequest = this.loanRequestForm.value as LoanRequestModel;
    loanRequest.clientId = this.userAcct.id;
    this.loanRequestService.sendLoanRequest(loanRequest).subscribe(
      (response) => {
        this.loanInfo = response;

        Swal.fire({
          title: 'Processing...',
          // html: 'Processing...',
          timer: 4000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
          padding: '5em',
          willClose: () => {
            clearInterval(this.timerInterval);
          },
        }).then((result) => {
          /* Read more about handling dismissals below */
          if (result.dismiss === Swal.DismissReason.timer) {
            Swal.fire({
              title: 'Loan Approved',
              text: `Your account has been Credited with ₦${this.loanRequestForm.value.amount}`,
              icon: 'success',
              iconColor: '#008000',
              // color: '#C31E39',
              backdrop: `
    #c31e3a3d
    left top
    no-repeat
  `,
              confirmButtonText: 'OK',
              confirmButtonColor: '#C31E39',
            }).then((result) => {
              if (result.isConfirmed) {
                this.route.navigate([`user/${this.userAcct.id}`]);
              }
            });
          }
        });

        console.log(response, 'CHECKING RES');

        console.log('CHECKING LOAN INFORMATION', this.loanInfo);
        // Handle the response from the server
      },

      (error) => {
        Swal.fire({
          title: 'Processing...',
          // html: 'Processing...',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
          padding: '5em',
          willClose: () => {
            clearInterval(this.timerInterval);
          },
        }).then((result) => {
          /* Read more about handling dismissals below */
          if (result.dismiss === Swal.DismissReason.timer) {
            Swal.fire({
              title: 'Loan Disapproved',
              text: error.error,
              icon: 'error',
              iconColor: '#C31E39',
              // color: '#C31E39',
              backdrop: `
    #c31e3a3d
    left top
    no-repeat
  `,
              confirmButtonText: 'OK',
              confirmButtonColor: '#C31E39',
            });
          }
        });

        // this.toast.error({
        //   detail: error,
        //   summary: 'Please try again...',
        //   duration: 4000,
        // });
        console.error(error);
      }
    );
  }

  calculate() {
    // Calculate the principal and interest
    this.principal = this.loanAmount * (1 + (5 * this.repaymentPeriod) / 12);
    this.interest = this.principal - this.loanAmount;
  }
  resetIncorrectPin() {
    this.incorrectPin = false;
  }
  post() {
    if (this.pinForm.value.pin !== this.userAcct.transactionPin) {
      this.incorrectPin = true;
      return false;
    } else {
      this.incorrectPin = false;
      this.onSubmit();
      return true;
    }
  }

  GetAcctById(id: any) {
    this.accountService.GetAccountById(id).subscribe({
      next: (data) => {
        this.acct = data;

        console.log(this.acct.fullName, 'TESTING USER INFO ---');
        return data;
      },
    });
  }

  logout() {}
}