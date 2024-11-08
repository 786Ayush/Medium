import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { jwt, sign,verify } from 'hono/jwt'
export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string
	}
}>();;

userRouter.post("/signup", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const { email, password } = await c.req.json();
    console.log(email,password);
  
    try {
      const user = await prisma.user.create({
        data: {
          email,
          password,
        },
      });
  
      const token= await sign({id: user.id},"secret")
  
      return c.json({ message: 'User created successfully', jwt: token });
    } catch (e) {
      return c.json({ error: 'User creation failed', details: e }, 500);
    } finally {
      await prisma.$disconnect();
    }
  });
  
  userRouter.post("/signin",async(c)=>{
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const { email, password } = await c.req.json();
    const user= await prisma.user.findUnique({
      where:{
        email:email,
        password:password
      }
    });
    if(!user)
    {
      c.status(403);
      return c.json({error:"User not found"});
    }
    const jwt= await sign({id:user.id},"secret");
    return c.json({jwt:jwt})
  })
  