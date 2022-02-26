import Router from "@koa/router";
import { general, auth } from "./controller";

const unprotectedRouter = new Router();

unprotectedRouter.get("/", general.helloWorld);
unprotectedRouter.post("/auth/login", auth.loginUser);
unprotectedRouter.post("/auth/register", auth.registerUser);

export { unprotectedRouter };