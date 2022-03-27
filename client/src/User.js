export const UserType = {
    DistrictAdmin: "DistrictAdmin",
    Admin: "Admin",
    Teacher: "Teacher",
    Student: "Student",
}

export class User {

    constructor(accessToken, userType, name, schoolLocation) {
        this.accessToken = accessToken;
        this.userType = userType;
        this.name = name;
        this.schoolLocation = schoolLocation;
    }

}