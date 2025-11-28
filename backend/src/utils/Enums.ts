enum UserRole{
    ADMIN = "admin",
    ORGANIZER = "organizer", //Manage their own eventt
    ATTENDEE = "attendee", //register for events, buy tickets
    VIEWER = "viewer" //read only
}

enum TicketTypeEnum{
    VIP = "vip",
    REGULAR  = "regular",

}

enum BookingStatusEnum {
    CONFIRMED="confirmed",
    CANCELLED="cancelled"
}

enum ReportedEventEnum{
    PENDING="pending",
    REVIEWD="reviewed",
    RESOLVED="resolved"
}

export {
    UserRole,
    TicketTypeEnum,
    BookingStatusEnum,
    ReportedEventEnum
}