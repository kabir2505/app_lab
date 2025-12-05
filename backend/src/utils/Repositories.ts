import { EventManagerDataSource } from "../config/DataSource";

import {User} from "../entities/User.entity"
import { Booking } from "../entities/Booking.Entity";
import { OrganizerProfile } from "../entities/Organizer.entity";
import { Admin, DataSource } from "typeorm";
import { Event } from "../entities/Event.entity";
import { TicketType } from "../entities/TicketType.entity";
import { AttendeeProfile } from "../entities/Attendee.entity";
import { Review } from "../entities/Review.Entity";
import { ReportedEvent } from "../entities/ReportedEvent.entity";
const userRepository = EventManagerDataSource.getRepository(User);
const organizerRepository = EventManagerDataSource.getRepository(OrganizerProfile);
const eventRepository = EventManagerDataSource.getRepository(Event);
const ticketRepository = EventManagerDataSource.getRepository(TicketType);
const bookingRepository = EventManagerDataSource.getRepository(Booking)
const attendeeProfileRepository = EventManagerDataSource.getRepository(AttendeeProfile);
const reviewRepository= EventManagerDataSource.getRepository(Review);
const reportedEventRepository = EventManagerDataSource.getRepository(ReportedEvent);
export { userRepository, organizerRepository, eventRepository, ticketRepository, bookingRepository, attendeeProfileRepository, reviewRepository, reportedEventRepository };
