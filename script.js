console.log("Kent Pizza is ready");

const accountForm = document.querySelector("#account-form");

if(accountForm){
    accountForm.addEventListener("submit", function (event){
        event.preventDefault();

        const message = document.querySelector("#account-message");
        message.textContent = "Demo sign-in complete. Account features coming soon";
        accountForm.reset();
    });
}

