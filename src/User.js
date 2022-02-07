export const UserLocation = {
    WMS: {
        displayName: "Williamstown Middle School",
        lavLocations: [
            "F"
        ]
    },
    WHS: {
        displayName: "Williamstown High School",
        lavLocations: [
            "A100 Lav",
            "A200 Lav",
            "C100 Lav",
            "C200 Lav",
            "Cafe A Lav",
            "Cafe B Lav"
        ]
    }
}

export class User {

    constructor(email, name, userLocation) {
        this.email = email;
        this.name = name;
        this.userLocation = userLocation;
    }

}