export const SchoolLocations = {
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

export const UserType = {
    Admin: "Admin",
    Teacher: "Teacher",
    Student: "Student"
}

export class User {

    constructor(userType, userID, email, name, userLocation) {
        this.userType = userType;
        this.userID = userID;
        this.email = email;
        this.name = name;
        this.userLocation = userLocation;
    }

}