export default {
    getCustomMessage(err, $t) {
        console.log(err);

        let errMessage = "";
        switch (err.code) {
            case 10:
                if (err.data &&
                    err.data.stack &&
                    err.data.stack.length) {
                    let first = err.data.stack[0];
                    if (first.context.file == "db_balance.cpp" && first.context.method == "adjust_balance") {
                        //余额不足
                        errMessage = $t("asset.assetException");
                        errMessage = errMessage.replace("{a}", first.data.a);
                        errMessage = errMessage.replace("{b}", first.data.b);
                        errMessage = errMessage.replace("{r}", first.data.r);
                    } else if (first.context.file == "account_evaluator.cpp"
                        && first.context.method == "verify_account_votes"
                        && first.format.indexOf("Can't change witness votes today") >= 0) {
                        //old_votes == new_votes: Can't change witness votes today, please wait until tomorrow!
                        errMessage = $t("errors.canNotVoteToday");
                    } else if (first.context.file == "vesting_balance_evaluator.cpp"
                        && first.context.method == "do_evaluate"
                        && first.format.indexOf("Unvesting only allowed in round A") >= 0) {
                        //old_votes == new_votes: Can't change witness votes today, please wait until tomorrow!
                        errMessage = $t("errors.withdrawOnlyAllowA");
                    }
                }
                break;
            case "inner":
                errMessage = $t("error.inner." + err.message);
                break;
        }
        if (!errMessage && err.message) {
            if (err.message.indexOf("Missing required active authority.") >= 0) {

            }
        }
        if (!errMessage) {
            errMessage = err.message;
        }

        console.log("custom message:" + errMessage);
        return errMessage;
    }
}