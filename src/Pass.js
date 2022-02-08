export class Pass {
    constructor(issuer, targetStudentID, departureLocation, departureTimestamp, arrivalLocation, arrivalTimestamp) {
        this.issuer = issuer;
        this.targetStudentID = targetStudentID;
        this.departureLocation = departureLocation;
        this.departureTimestamp = departureTimestamp;
        this.arrivalLocation = arrivalLocation;
        this.arrivalTimestamp = arrivalTimestamp;
    }
}