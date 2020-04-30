import { Component, OnInit } from "@angular/core";
import { CoreService } from "../services/core.service";

@Component({
  selector: "app-developer",
  templateUrl: "./developer.page.html",
  styleUrls: ["./developer.page.scss"],
})
export class DeveloperPage implements OnInit {
  constructor(private coreService: CoreService) {}

  ngOnInit() {}

  async clearAccounts() {
    // const
    // await this.coreService.core.db.accounts.find().purge().then(console.log);
    // if (this.coreService.core.db.accounts.pouch) {
      const pouch: any = this.coreService.core.db.accounts.pouch;
    //   const purge = await pouch.purge();
      console.log({pouch})
    // }

    

    return await this.coreService.core.db.accounts.find().remove()
    // return this.coreService.core.db.accounts.pouch.remove({}, {}).().then(console.log)
    // return this.coreService.core.db.accounts.pouch.allDocs().then(console.log);
    
  }

  clearTransactions() {
    return this.coreService.core.db.transactions
      .find()
      .remove()
      .then(console.log);
  }
}
