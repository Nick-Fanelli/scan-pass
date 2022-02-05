const UserName = document.getElementById("user-name");
const StateContainer = document.getElementById("state-container");
const ActiveStudentTableTBODY = document.querySelector("#active-student-table tbody");
const CurrentStudentCount = document.getElementById("current-student-count");

class UserData {

    constructor(id, loginTimestamp) {
        this.id = id;
        this.loginTimestamp = loginTimestamp;
    }

}

class Application {

    static ActiveUserRegistry = [];
    static KeyLog = "";

    static UpdateTableView() {

        let newTableHTML = "";

        for(let i in this.ActiveUserRegistry) {

            let user = this.ActiveUserRegistry[i];

            let timestamp = new Date(user.loginTimestamp);

            let hours = timestamp.getHours();
            let minutes = timestamp.getMinutes();

            let ampm = hours >= 12 ? "pm" : "am";

            hours = hours % 12;
            hours = hours ? hours : 12;

            minutes = minutes < 10 ? ("0" + minutes) : minutes;

            let viewableTimestamp = hours + ":" + minutes + ampm;

            newTableHTML += 
            `
            <tr userID="${user.id}">
                <td>First Last</td>
                <td class="id">${user.id}</td>
                <td>${viewableTimestamp}</td>
                <td class="remove-user-btn"><i class="fa fa-times-circle" onclick="Application.HandleManualRemove(this);"></i></td>
            </tr>
            `;

        }

        ActiveStudentTableTBODY.innerHTML = newTableHTML;
        CurrentStudentCount.innerHTML = this.ActiveUserRegistry.length;

    }

    static HandleManualRemove(element) {
        let timestamp = Date.now();
        let parentElement = element.parentElement.parentElement;
        let userID = parentElement.getAttribute("userID");

        if(userID == undefined || userID == null) {
            console.log("ERROR: User ID was identified as: " + userID);
            return;
        }

        this.ProcessData(timestamp, userID);
    }

    static ProcessData(timestamp, data) {

        // Check for already active user
        let registryLocation = null;

        for(let i in this.ActiveUserRegistry) {
            if(this.ActiveUserRegistry[i].id === data) {
                // Save registry location
                registryLocation = i;
                break;
            }
        }

        if(registryLocation == null) {
            // Add user and save timestamp
            this.ActiveUserRegistry.push(new UserData(data, timestamp));
        } else {
            // Remove user and save timestamp
            this.ActiveUserRegistry.splice(registryLocation, 1);
        }

        this.UpdateTableView();
    }

}

// Keyboard Input Handler
document.addEventListener("keydown", (event) => {

    const idRegex = /[0-9]|Enter/gi;

    if(event.key.match(idRegex)) {
        if(event.key === "Enter") {
            let timestamp = Date.now();

            console.log("Receive Data: " + Application.KeyLog);
            Application.ProcessData(timestamp, Application.KeyLog);
            Application.KeyLog = "";
        } else {
            Application.KeyLog += event.key;
        }

    } else {
        Application.KeyLog = "";
    }

});

Application.ProcessData(Date.now(), "45563");   