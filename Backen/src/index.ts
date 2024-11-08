import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { jwt, sign,verify } from 'hono/jwt';
import { userRouter } from './routes/user';
import { blogrouter } from './routes/blog';
const app = new Hono<{
	Bindings: {
		DATABASE_URL: string
	}
}>();
app.route("/api/v1/user",userRouter);
app.route("/api/v1/blog",blogrouter);

// app.use("/api/v1/blog/*",async (c,next)=>{
//   const header = c.req.header("authorization")||"";

//   const decodedvalue= await verify(header,"secret");
//   if(decodedvalue.id)
//    await next()
//   c.status(403);
//   return c.json({error:"please login with authorized email"});
// })
app.get('/', (c) => {
  return c.text('Hello Hono!')
})



export default app
