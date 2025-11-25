import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import * as fs from "fs/promises";
import path from "path";

//ENUMS
import {UserRole} from "../../utils/Enums";

//MAILER
import {MailTransporter} from "../../config/MailTransporter";

//REST ERRORS & RESPONSE
import ErrorHandler from "../../errors/ErrorHandler";
import httpStatusCodes from "../../errors/HttpCodes";
import ResponseGenerator from "../../utils/ResponseGenerator";

//ENTITIES
import { User } from "../../entity/User.entity";

//REPOSITORIES
import { userRepository } from "../../utils/Repositories";
import { AuthHelper } from "../../utils/AuthHelper";

