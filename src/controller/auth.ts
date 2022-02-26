import { Context } from "koa";
import { getManager, Repository } from "typeorm";
import { request, summary, body, tagsAll } from "koa-swagger-decorator";
import { User } from "../entity/user";
import { validate, ValidationError } from "class-validator";

@tagsAll(["Authentication"])
export default class AuthController {

    @request("post", "/auth/login")
    @summary("Authenticate user")
    @body({ userName: "", password: "" })
    public static async loginUser(ctx: Context): Promise<void> {
        if (!ctx.request.body.userName || !ctx.request.body.password) {
            ctx.status = 400;
            ctx.body = "Credentials required";
        } else {

            // get a user repository to perform operations with user
            const userRepository: Repository<User> = getManager().getRepository(User);

            // build up entity user to auth
            let userToLogin: User = new User();

            try {
                userToLogin = await userRepository.findOne({ userName: ctx.request.body.userName });
                if (userToLogin && !userToLogin.isValidPassword(ctx.request.body.password)) {
                    ctx.status = 400;
                    ctx.body = "Credentials required";
                } else {
                    ctx.status = 200;
                    ctx.body = { access_token: userToLogin.generateJWT(), user: { ...userToLogin, password: undefined } };
                }
            } catch (e) {
                ctx.status = 400;
                ctx.body = "Something went wrong validating your credentials";
            }
        }
    }

    @request("post", "/auth/register")
    @summary("Authenticate user")
    @body({ userName: "", password: "" })
    public static async registerUser(ctx: Context): Promise<void> {

        // get a user repository to perform operations with user
        const userRepository: Repository<User> = getManager().getRepository(User);

        // build up entity user to be saved
        const userToBeSaved: User = new User();
        userToBeSaved.userName = ctx.request.body.userName;
        userToBeSaved.firstName = ctx.request.body.firstName;
        userToBeSaved.lastName = ctx.request.body.lastName;
        userToBeSaved.password = ctx.request.body.password;
        userToBeSaved.email = ctx.request.body.email;

        // validate user entity
        const errors: ValidationError[] = await validate(userToBeSaved); // errors is an array of validation errors

        userToBeSaved.password = userToBeSaved.setPassword(ctx.request.body.password);

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = 400;
            ctx.body = errors;
        } else if (await userRepository.findOne({ email: userToBeSaved.email })) {
            // return BAD REQUEST status code and email already exists error
            ctx.status = 409;
            ctx.body = "The specified e-mail address already exists";
        } else {
            try {
                // save the user contained in the POST body
                const user = await userRepository.save(userToBeSaved);
                // return CREATED status code and updated user
                ctx.status = 201;
                ctx.body = user;
            } catch (_e) {
                ctx.status = 400;
                ctx.body = "Something went wrong saving data";
                return;
            }
        }
    }

}