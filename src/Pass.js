export const PassType = {
    BathroomPass: "Bathroom Pass",
    RoomPass: "Room Pass"
}

export class Pass {
    constructor(passType, issuerID, targetStudentID, departureLocation, departureTimestamp, arrivalLocation, arrivalTimestamp) {
        this.passType = passType;
        this.issuerID = issuerID;
        this.targetStudentID = targetStudentID;
        this.departureLocation = departureLocation;
        this.departureTimestamp = departureTimestamp;
        this.arrivalLocation = arrivalLocation;
        this.arrivalTimestamp = arrivalTimestamp;
    }
}

export class PassFactory {
    static CreatBathroomPass(issuerID, targetStudentID, departureLocation, departureTimestamp, bathroomLocation) {
        return new Pass(PassType.BathroomPass, issuerID, targetStudentID, departureLocation, departureTimestamp, bathroomLocation, null);
    }

    static CreateRoomPass(issuerID, targetStudentID, departureLocation, departureTimestamp, arrivalLocation) {
        return new Pass(PassType.RoomPass, issuerID, targetStudentID, departureLocation, departureTimestamp, arrivalLocation, null);
    }
}