import {Link, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import RegisterAttendeePage from "./pages/RegisterAttendeePage";
import RegisterOrganizerPage from "./pages/RegisterOrganizerPage";
import LoginPage from "./pages/LoginPage";
// import EventDetailsPage from "./pages/EventDetailsPage";
import Logout from "./pages/Logout";
import AllEventsPage from "./pages/AllEventsPage";
import NotFoundPage from "./pages/NotFoundPage";
import SearchEventsPage from "./pages/SearchEventsPage";
import CreateEventPage from "./pages/CreateEventPage";
import OrganizerEventsPage from "./pages/OrganizerEvents";
import UpdateEventPage from "./pages/UpdateEventPage";
import AdminOrganizersPage from "./pages/AdminOrganizersPage";
import EventDetailPage from "./pages/EventDetailPage";
import UpcomingEventsPage from "./pages/UpcomingEvents";
import AttendeeProfilePage from "./pages/AttendeeProfilePage";
import OrganizerDashboardPage from "./pages/OrganizerDashboard";
import OrganizerProfilePage from "./pages/OrganizerProfilePage";
import AdminDashboardPage from "./pages/AdminDashboard";
import AdminReportedEventsPage from "./pages/AdminReportedEventsPage";
import AdminAllOrganizersPage from "./pages/AdminAllOrganizersPage";
function AppRouter(){
    return (
        <>
        <Routes>
                <Route index element={<Home/>} />
                {/* <Route path="events" element={<AllEventsPage/>}></Route> */}
                {/* <Route path="events/:eventId" element={<EventDetails />}></Route> */}
                <Route path="login" element={<LoginPage/>}></Route>
                <Route path="/register/attendee" element={<RegisterAttendeePage />} />
                <Route path="/register/organizer" element = {<RegisterOrganizerPage/>} />  
                <Route path="/logout" element={<Logout />} />
                <Route path="/events/all-events" element={<AllEventsPage />}/>
                <Route path="/events/upcoming" element={<UpcomingEventsPage />} />
                <Route path="/search-events" element={<SearchEventsPage />} />
                <Route path="/search-events/:filter" element={<SearchEventsPage />} />
                <Route path="/organizer/create-event" element={<CreateEventPage />} />
                <Route path="/organizer/events" element={<OrganizerEventsPage/>} />
                <Route path="/organizer/events/:eventId/edit" element={<UpdateEventPage/>} />
                <Route path="/admin/pending-organizers" element={<AdminOrganizersPage/>} /> 
                <Route path="/events/:eventId" element={<EventDetailPage />} />
                <Route path="/profile" element={<AttendeeProfilePage />} />
                <Route path="/organizer/"  element={<OrganizerDashboardPage/>} /> 
                <Route path="/organizer/profile" element={<OrganizerProfilePage/>} />
                <Route path="/admin" element={<AdminDashboardPage/>} />
                <Route path="/admin/reported-events" element={<AdminReportedEventsPage />} />
                <Route path="/admin/all-organizers" element={<AdminAllOrganizersPage />} />
                <Route path="*" element={<NotFoundPage />} />      

                
        </Routes>
        </>
    )
}

export default AppRouter;


//Routers- container for route definitions
//Route - mappping between url path and a component

//Link changes the url without reloading the page
//useNavigate -> go to X after doing Y
    //navigate(-1) go back


//Nesting:
    //Outlet : where to render the child route's content
    