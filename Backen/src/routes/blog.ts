import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { jwt, sign, verify } from "hono/jwt";
import { auth } from "hono/utils/basic-auth";
export const blogrouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  },
  Variables: {
    userId:any;
  }
}>();
blogrouter.use("/*", async (c, next) => {
  const header = c.req.header("authorization") || "";

  const decodedvalue = await verify(header, "secret");
  if (decodedvalue){ 
    c.set("userId",decodedvalue.id);
      await next();
    }else{
  c.status(403);
  return c.json({ error: "please login with authorized email" });}
});

blogrouter.post("/create", async (c) => {
  const body = await c.req.json();
  const authorId= await c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: authorId,
      }
    });
  return c.json({
    authorId:authorId,
    id:blog.id
  });
});

blogrouter.put("/change",async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blog = await prisma.post.update({
    where:{
      id:body.id
    },
      data: {
        title: body.title,
        content: body.content,
      
      }
    });
  return c.json({
    blog
  });
});
blogrouter.get("/single", async(c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try{
  const blog = await prisma.post.findFirst({
      where:{
        id:body.id
      }
    });
  return c.json({
    blog
  });
}catch(e){
  c.status(411);
  return c.json({message:"Error",error:e})
}
});

blogrouter.get("/bulk", async(c) => {
  
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blog = await prisma.post.findMany();
  return c.json({
    blog
  });
});
