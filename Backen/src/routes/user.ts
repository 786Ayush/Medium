import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { jwt, sign,verify } from 'hono/jwt'
import { signupInput,signinInput } from '@ayush_786/medium-common'
export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string
	}
}>();

userRouter.post("/signup", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const {success,error} = signupInput.safeParse(body);
    if(!success)
    {
      c.status(411);
      return c.json({
        message: "Inputs not correct",
        error:error
      })
    }
    // console.log(email,password);
  
    try {
      const user = await prisma.user.create({
        data: {
          email:body.username,
          password:body.password,
          name:body.name
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
    const {success} = signinInput.safeParse({ email, password });
    if(!success)
    {
      c.status(411);
      return c.json({
        message: "Inputs not correct"
      })
    }
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
  