import { EventManagerDataSource } from "../config/DataSource";

import {User} from "../entities/User.entity"

const userRepository = EventManagerDataSource.getRepository(User);

export { userRepository };
