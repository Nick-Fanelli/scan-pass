export const UserLocation = {
    WMS: "Williamstown Middle School",
    WHS: "Williamstown High School"
}

export class User {

    constructor(email, name, userLocation) {
        this.email = email;
        this.name = name;
        this.userLocation = userLocation;
    }

}